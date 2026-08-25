import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchEntity, MatchStatus } from '../database/entities/match.entity';
import { MatchParticipantEntity } from '../database/entities/match-participant.entity';
import { PlayersService } from '../players/players.service';

export interface PlayerState {
  userId: string;
  username: string;
  socketId: string;
  x: number;
  y: number;
  score: number;
  kills: number;
  deaths: number;
  color: string;
  isDisconnected: boolean;
  disconnectedAt?: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  points: number;
}

export interface GameRoomState {
  roomId: string;
  serverNodeId: string;
  status: 'LOBBY' | 'PLAYING' | 'ENDED';
  players: Map<string, PlayerState>;
  collectibles: Collectible[];
  startedAt: number;
  tickCount: number;
}

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  private rooms = new Map<string, GameRoomState>();
  private readonly POD_ID = process.env.POD_NAME || 'game-server-pod-0';

  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
    @InjectRepository(MatchParticipantEntity)
    private readonly participantRepository: Repository<MatchParticipantEntity>,
    private readonly playersService: PlayersService,
  ) {}

  createRoom(roomId: string, playerList: { userId: string; username: string; socketId: string }[]): GameRoomState {
    const colors = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];
    const playersMap = new Map<string, PlayerState>();

    playerList.forEach((p, idx) => {
      playersMap.set(p.userId, {
        userId: p.userId,
        username: p.username,
        socketId: p.socketId,
        x: 100 + (idx % 5) * 140,
        y: 100 + Math.floor(idx / 5) * 150,
        score: 0,
        kills: 0,
        deaths: 0,
        color: colors[idx % colors.length],
        isDisconnected: false,
      });
    });

    const collectibles: Collectible[] = [];
    for (let i = 0; i < 8; i++) {
      collectibles.push({
        id: `col-${i}-${Date.now()}`,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        points: Math.random() > 0.3 ? 10 : 25,
      });
    }

    const room: GameRoomState = {
      roomId,
      serverNodeId: this.POD_ID,
      status: 'PLAYING',
      players: playersMap,
      collectibles,
      startedAt: Date.now(),
      tickCount: 0,
    };

    this.rooms.set(roomId, room);
    this.logger.log(`Created game room ${roomId} with ${playerList.length} players on server ${this.POD_ID}`);
    return room;
  }

  getRoom(roomId: string): GameRoomState | undefined {
    return this.rooms.get(roomId);
  }

  getAllActiveRooms(): GameRoomState[] {
    return Array.from(this.rooms.values()).filter((r) => r.status === 'PLAYING');
  }

  processPlayerInput(roomId: string, userId: string, dx: number, dy: number, dt: number) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'PLAYING') return;

    const player = room.players.get(userId);
    if (!player || player.isDisconnected) return;

    // Validate and speed-cap player movement (max 300 units/sec)
    const maxSpeed = 300;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let moveX = dx;
    let moveY = dy;

    if (distance > 0) {
      const normalizedSpeed = Math.min(distance, maxSpeed * dt);
      moveX = (dx / distance) * normalizedSpeed;
      moveY = (dy / distance) * normalizedSpeed;
    }

    player.x = Math.max(20, Math.min(780, player.x + moveX));
    player.y = Math.max(20, Math.min(580, player.y + moveY));

    // Check collisions with collectibles
    for (let i = room.collectibles.length - 1; i >= 0; i--) {
      const col = room.collectibles[i];
      const distToCol = Math.hypot(player.x - col.x, player.y - col.y);
      if (distToCol < 25) {
        player.score += col.points;
        room.collectibles.splice(i, 1);

        // Respawn collectible
        room.collectibles.push({
          id: `col-${Date.now()}-${Math.random()}`,
          x: Math.floor(Math.random() * 700) + 50,
          y: Math.floor(Math.random() * 500) + 50,
          points: Math.random() > 0.3 ? 10 : 25,
        });
      }
    }
  }

  handleDisconnect(socketId: string): { roomId: string; userId: string } | null {
    for (const [roomId, room] of this.rooms.entries()) {
      for (const [userId, player] of room.players.entries()) {
        if (player.socketId === socketId) {
          player.isDisconnected = true;
          player.disconnectedAt = Date.now();
          this.logger.warn(`Player ${player.username} (${userId}) disconnected from room ${roomId}. Grace period started.`);
          return { roomId, userId };
        }
      }
    }
    return null;
  }

  handleReconnect(roomId: string, userId: string, newSocketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.get(userId);
    if (!player) return false;

    player.socketId = newSocketId;
    player.isDisconnected = false;
    player.disconnectedAt = undefined;
    this.logger.log(`Player ${player.username} (${userId}) reconnected to room ${roomId}`);
    return true;
  }

  async finishMatch(roomId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.status = 'ENDED';

    // Persist Match Entity
    const match = this.matchRepository.create({
      roomId: room.roomId,
      serverNodeId: room.serverNodeId,
      status: MatchStatus.COMPLETED,
      startedAt: new Date(room.startedAt),
      endedAt: new Date(),
      totalPlayers: room.players.size,
    });

    const savedMatch = await this.matchRepository.save(match);

    // Save participants & update ELOs
    const playersList = Array.from(room.players.values());
    playersList.sort((a, b) => b.score - a.score);

    for (let rank = 0; rank < playersList.length; rank++) {
      const p = playersList[rank];
      const isWinner = rank === 0;
      const eloDelta = isWinner ? 25 : -15;

      const participant = this.participantRepository.create({
        matchId: savedMatch.id,
        playerId: p.userId,
        kills: p.kills,
        deaths: p.deaths,
        score: p.score,
        rankPosition: rank + 1,
      });

      await this.participantRepository.save(participant);
      await this.playersService.updateEloRating(p.userId, eloDelta, isWinner, p.score);
    }

    this.rooms.delete(roomId);
    this.logger.log(`Match ${roomId} completed and saved to PostgreSQL database.`);
  }
}
