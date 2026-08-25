import { Injectable, Logger } from '@nestjs/common';
import { createRedisClient } from '../database/database.config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export interface QueuePlayer {
  userId: string;
  username: string;
  eloRating: number;
  socketId: string;
  enqueuedAt: number;
}

export interface MatchedRoom {
  roomId: string;
  players: QueuePlayer[];
  createdAt: number;
}

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);
  private redis: Redis;
  private readonly QUEUE_KEY = 'matchmaking:queue:default';

  constructor() {
    this.redis = createRedisClient();
  }

  async addToQueue(player: Omit<QueuePlayer, 'enqueuedAt'>): Promise<void> {
    const queueItem: QueuePlayer = {
      ...player,
      enqueuedAt: Date.now(),
    };

    // Store player in Redis Hash and Sorted Set
    await this.redis.hset('matchmaking:players', player.userId, JSON.stringify(queueItem));
    await this.redis.zadd(this.QUEUE_KEY, player.eloRating, player.userId);

    this.logger.log(`Player ${player.username} (${player.userId}) joined matchmaking queue [ELO: ${player.eloRating}]`);
  }

  async removeFromQueue(userId: string): Promise<void> {
    await this.redis.hdel('matchmaking:players', userId);
    await this.redis.zrem(this.QUEUE_KEY, userId);
    this.logger.log(`Player ${userId} removed from matchmaking queue`);
  }

  async findMatches(minPlayers: number = 2, maxPlayers: number = 10): Promise<MatchedRoom[]> {
    const userIds = await this.redis.zrange(this.QUEUE_KEY, 0, -1);
    if (userIds.length < minPlayers) {
      return [];
    }

    const matchedRooms: MatchedRoom[] = [];
    const processedUserIds = new Set<string>();

    const rawPlayers = await this.redis.hmget('matchmaking:players', ...userIds);
    const players: QueuePlayer[] = rawPlayers
      .filter((p): p is string => p !== null)
      .map((p) => JSON.parse(p));

    // Sort players by ELO for efficient clustering
    players.sort((a, b) => a.eloRating - b.eloRating);

    let currentGroup: QueuePlayer[] = [];

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (processedUserIds.has(p.userId)) continue;

      if (currentGroup.length === 0) {
        currentGroup.push(p);
        processedUserIds.add(p.userId);
      } else {
        const lastPlayer = currentGroup[currentGroup.length - 1];
        // Match condition: ELO diff <= 150 or waiting > 10 seconds
        const eloDiff = Math.abs(p.eloRating - lastPlayer.eloRating);
        const waitingTimeSec = (Date.now() - p.enqueuedAt) / 1000;

        if (eloDiff <= 150 || waitingTimeSec > 10) {
          currentGroup.push(p);
          processedUserIds.add(p.userId);

          if (currentGroup.length >= maxPlayers) {
            const roomId = `room-${uuidv4().substring(0, 8)}`;
            matchedRooms.push({ roomId, players: [...currentGroup], createdAt: Date.now() });
            currentGroup = [];
          }
        } else {
          // If group size >= minPlayers, finalize room
          if (currentGroup.length >= minPlayers) {
            const roomId = `room-${uuidv4().substring(0, 8)}`;
            matchedRooms.push({ roomId, players: [...currentGroup], createdAt: Date.now() });
          }
          currentGroup = [p];
          processedUserIds.add(p.userId);
        }
      }
    }

    if (currentGroup.length >= minPlayers) {
      const roomId = `room-${uuidv4().substring(0, 8)}`;
      matchedRooms.push({ roomId, players: [...currentGroup], createdAt: Date.now() });
    }

    // Clean matched players from queue
    for (const room of matchedRooms) {
      for (const p of room.players) {
        await this.removeFromQueue(p.userId);
      }
    }

    return matchedRooms;
  }
}
