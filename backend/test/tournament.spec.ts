import { Test, TestingModule } from '@nestjs/testing';
import { TournamentService } from '../src/tournament/tournament.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TournamentEntity, TournamentMatchEntity } from '../src/tournament/tournament.entity';

describe('TournamentService', () => {
  let service: TournamentService;

  const mockTournRepo = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'tourn-1', ...e })),
  };

  const mockMatchRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentService,
        { provide: getRepositoryToken(TournamentEntity), useValue: mockTournRepo },
        { provide: getRepositoryToken(TournamentMatchEntity), useValue: mockMatchRepo },
      ],
    }).compile();

    service = module.get<TournamentService>(TournamentService);
  });

  it('should create new tournament successfully', async () => {
    const tourn = await service.createTournament('Championship Alpha', 'Global Cup', 16);
    expect(tourn.name).toBe('Championship Alpha');
    expect(tourn.maxParticipants).toBe(16);
  });
});
