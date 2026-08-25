import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerProfileEntity } from '../database/entities/player-profile.entity';
import { createRedisClient } from '../database/database.config';
import Redis from 'ioredis';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  eloRating: number;
  totalScore: number;
  wins: number;
  matchesPlayed: number;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);
  private redis: Redis;
  private readonly LEADERBOARD_KEY = 'leaderboard:global';

  constructor(
    @InjectRepository(PlayerProfileEntity)
    private readonly profileRepository: Repository<PlayerProfileEntity>,
  ) {
    this.redis = createRedisClient();
  }

  async updatePlayerScore(userId: string, eloRating: number): Promise<void> {
    await this.redis.zadd(this.LEADERBOARD_KEY, eloRating, userId);
  }

  async getTopPlayers(limit: number = 50): Promise<LeaderboardEntry[]> {
    // Try Redis cache first
    const cachedUserIds = await this.redis.zrevrange(this.LEADERBOARD_KEY, 0, limit - 1);

    if (cachedUserIds.length > 0) {
      const profiles = await this.profileRepository.createQueryBuilder('p')
        .where('p.userId IN (:...userIds)', { userIds: cachedUserIds })
        .getMany();

      const profileMap = new Map(profiles.map((p) => [p.userId, p]));

      return cachedUserIds.map((userId, idx) => {
        const p = profileMap.get(userId);
        return {
          rank: idx + 1,
          userId,
          displayName: p ? p.displayName : 'Unknown Player',
          eloRating: p ? p.eloRating : 1200,
          totalScore: p ? Number(p.totalScore) : 0,
          wins: p ? p.wins : 0,
          matchesPlayed: p ? p.matchesPlayed : 0,
        };
      });
    }

    // Database fallback
    const topProfiles = await this.profileRepository.find({
      order: { eloRating: 'DESC' },
      take: limit,
    });

    // Populate Redis cache
    for (const p of topProfiles) {
      await this.redis.zadd(this.LEADERBOARD_KEY, p.eloRating, p.userId);
    }

    return topProfiles.map((p, idx) => ({
      rank: idx + 1,
      userId: p.userId,
      displayName: p.displayName,
      eloRating: p.eloRating,
      totalScore: Number(p.totalScore),
      wins: p.wins,
      matchesPlayed: p.matchesPlayed,
    }));
  }
}
