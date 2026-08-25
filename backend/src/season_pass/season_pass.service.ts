import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeasonDefinitionEntity, SeasonTierEntity, UserSeasonProgressEntity } from './season_pass.entity';

@Injectable()
export class SeasonPassService {
  private readonly logger = new Logger(SeasonPassService.name);

  constructor(
    @InjectRepository(SeasonDefinitionEntity)
    private readonly seasonRepository: Repository<SeasonDefinitionEntity>,
    @InjectRepository(SeasonTierEntity)
    private readonly tierRepository: Repository<SeasonTierEntity>,
    @InjectRepository(UserSeasonProgressEntity)
    private readonly progressRepository: Repository<UserSeasonProgressEntity>,
  ) {}

  async getCurrentSeason(): Promise<SeasonDefinitionEntity> {
    const active = await this.seasonRepository.findOne({
      order: { seasonNumber: 'DESC' },
    });

    if (!active) {
      const created = this.seasonRepository.create({
        seasonNumber: 1,
        title: 'Season 1: Nexus Awakening',
        description: 'Initial competitive arena battle season',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 86400000),
        maxTier: 50,
      });
      return this.seasonRepository.save(created);
    }
    return active;
  }

  async getUserProgress(userId: string): Promise<UserSeasonProgressEntity> {
    const season = await this.getCurrentSeason();
    let progress = await this.progressRepository.findOne({
      where: { userId, seasonId: season.id },
      relations: ['season'],
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        seasonId: season.id,
        currentXp: 0,
        currentTier: 1,
        isPremiumPass: false,
      });
      await this.progressRepository.save(progress);
    }

    return progress;
  }

  async addSeasonXp(userId: string, xpGained: number): Promise<UserSeasonProgressEntity> {
    const progress = await this.getUserProgress(userId);
    progress.currentXp += xpGained;

    // Check tier promotion (1000 XP per tier)
    const newTier = Math.min(
      progress.season.maxTier,
      Math.floor(progress.currentXp / 1000) + 1,
    );

    if (newTier > progress.currentTier) {
      this.logger.log(`Player ${userId} promoted to Season Pass Tier ${newTier}!`);
      progress.currentTier = newTier;
    }

    return this.progressRepository.save(progress);
  }
}
