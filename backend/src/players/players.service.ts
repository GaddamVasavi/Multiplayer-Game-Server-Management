import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerProfileEntity } from '../database/entities/player-profile.entity';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);

  constructor(
    @InjectRepository(PlayerProfileEntity)
    private readonly profileRepository: Repository<PlayerProfileEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getProfileByUserId(userId: string): Promise<PlayerProfileEntity> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Player profile for user ID ${userId} not found`);
    }

    return profile;
  }

  async updateEloRating(userId: string, deltaElo: number, isWin: boolean, scoreGained: number): Promise<PlayerProfileEntity> {
    const profile = await this.getProfileByUserId(userId);

    profile.eloRating = Math.max(100, profile.eloRating + deltaElo);
    profile.matchesPlayed += 1;
    profile.totalScore = Number(profile.totalScore) + scoreGained;

    if (isWin) {
      profile.wins += 1;
    } else {
      profile.losses += 1;
    }

    this.logger.log(`Updated ELO for player ${userId}: new ELO ${profile.eloRating} (${deltaElo > 0 ? '+' : ''}${deltaElo})`);

    return this.profileRepository.save(profile);
  }

  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await this.profileRepository.update(
      { userId },
      { isOnline, lastSeen: new Date() },
    );
  }
}
