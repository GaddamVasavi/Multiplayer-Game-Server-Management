import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '../src/game/game.service';
import { MatchmakingService } from '../src/matchmaking/matchmaking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MatchEntity } from '../src/database/entities/match.entity';
import { MatchParticipantEntity } from '../src/database/entities/match-participant.entity';
import { PlayersService } from '../src/players/players.service';

describe('Game Engine & Matchmaking Integration Tests (Mandatory Tests 2, 3, 4)', () => {
  let gameService: GameService;
  let matchmakingService: MatchmakingService;

  beforeEach(async () => {
    const mockMatchRepository = {
      create: jest.fn().mockImplementation((dto) => ({ id: 'match-123', ...dto })),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'match-123', ...entity })),
    };

    const mockParticipantRepository = {
      create: jest.fn().mockImplementation((dto) => ({ id: 'part-123', ...dto })),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'part-123', ...entity })),
    };

    const mockPlayersService = {
      updateEloRating: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        MatchmakingService,
        { provide: getRepositoryToken(MatchEntity), useValue: mockMatchRepository },
        { provide: getRepositoryToken(MatchParticipantEntity), useValue: mockParticipantRepository },
        { provide: PlayersService, useValue: mockPlayersService },
      ],
    }).compile();

    gameService = module.get<GameService>(GameService);
    matchmakingService = module.get<MatchmakingService>(MatchmakingService);
  });

  describe('Matchmaking Queue & Room Creation (Mandatory Test 2 & 3)', () => {
    it('should create an authoritative game room for 2-10 players with collectibles', () => {
      const playerList = [
        { userId: 'user-1', username: 'Alpha', socketId: 'sock-1' },
        { userId: 'user-2', username: 'Beta', socketId: 'sock-2' },
        { userId: 'user-3', username: 'Gamma', socketId: 'sock-3' },
      ];

      const room = gameService.createRoom('room-test-101', playerList);

      expect(room.roomId).toBe('room-test-101');
      expect(room.players.size).toBe(3);
      expect(room.collectibles.length).toBeGreaterThanOrEqual(5);
      expect(room.status).toBe('PLAYING');
    });

    it('should update player position and score when collecting orb', () => {
      const room = gameService.createRoom('room-test-102', [
        { userId: 'user-1', username: 'Alpha', socketId: 'sock-1' },
      ]);

      const initialPlayer = room.players.get('user-1')!;
      const initialCollectible = room.collectibles[0];

      // Move player exactly onto collectible position
      initialPlayer.x = initialCollectible.x;
      initialPlayer.y = initialCollectible.y;

      gameService.processPlayerInput('room-test-102', 'user-1', 0, 0, 0.05);

      expect(initialPlayer.score).toBeGreaterThan(0);
    });
  });

  describe('Player Disconnect & Reconnect (Mandatory Test 4)', () => {
    it('should handle player disconnect and start 15s grace window', () => {
      gameService.createRoom('room-test-103', [
        { userId: 'user-1', username: 'Alpha', socketId: 'sock-1' },
      ]);

      const disconnectResult = gameService.handleDisconnect('sock-1');
      expect(disconnectResult).not.isNull();
      expect(disconnectResult?.userId).toBe('user-1');

      const room = gameService.getRoom('room-test-103');
      expect(room?.players.get('user-1')?.isDisconnected).toBe(true);
    });

    it('should allow player to reconnect within grace period and update socketId', () => {
      gameService.createRoom('room-test-104', [
        { userId: 'user-1', username: 'Alpha', socketId: 'sock-old' },
      ]);

      gameService.handleDisconnect('sock-old');

      const reconnected = gameService.handleReconnect('room-test-104', 'user-1', 'sock-new');
      expect(reconnected).toBe(true);

      const room = gameService.getRoom('room-test-104');
      const player = room?.players.get('user-1');

      expect(player?.isDisconnected).toBe(false);
      expect(player?.socketId).toBe('sock-new');
    });
  });
});
