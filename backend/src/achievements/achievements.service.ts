import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AchievementDefinitionEntity, UserAchievementEntity } from './achievement.entity';

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    @InjectRepository(AchievementDefinitionEntity)
    private readonly definitionRepository: Repository<AchievementDefinitionEntity>,
    @InjectRepository(UserAchievementEntity)
    private readonly userAchievementRepository: Repository<UserAchievementEntity>,
  ) {}

  async getUserAchievements(userId: string): Promise<UserAchievementEntity[]> {
    const definitions = await this.definitionRepository.find();
    const existing = await this.userAchievementRepository.find({
      where: { userId },
      relations: ['achievement'],
    });

    const existingMap = new Map(existing.map((e) => [e.achievementId, e]));
    const result: UserAchievementEntity[] = [];

    for (const def of definitions) {
      if (existingMap.has(def.id)) {
        result.push(existingMap.get(def.id)!);
      } else {
        const created = this.userAchievementRepository.create({
          userId,
          achievementId: def.id,
          achievement: def,
          currentProgress: 0,
          isUnlocked: false,
          isClaimed: false,
        });
        await this.userAchievementRepository.save(created);
        result.push(created);
      }
    }

    return result;
  }

  async incrementProgress(userId: string, achievementCode: string, delta: number = 1): Promise<void> {
    const def = await this.definitionRepository.findOne({ where: { code: achievementCode } });
    if (!def) return;

    let userAch = await this.userAchievementRepository.findOne({
      where: { userId, achievementId: def.id },
    });

    if (!userAch) {
      userAch = this.userAchievementRepository.create({
        userId,
        achievementId: def.id,
        currentProgress: 0,
        isUnlocked: false,
        isClaimed: false,
      });
    }

    if (userAch.isUnlocked) return;

    userAch.currentProgress += delta;
    if (userAch.currentProgress >= def.targetValue) {
      userAch.isUnlocked = true;
      userAch.unlockedAt = new Date();
      this.logger.log(`Player ${userId} unlocked achievement: ${def.title}`);
    }

    await this.userAchievementRepository.save(userAch);
  }

  async claimReward(userId: string, userAchievementId: string): Promise<{ claimed: boolean; rewardXp: number }> {
    const userAch = await this.userAchievementRepository.findOne({
      where: { id: userAchievementId, userId },
      relations: ['achievement'],
    });

    if (!userAch) {
      throw new NotFoundException('Achievement not found');
    }

    if (!userAch.isUnlocked) {
      throw new BadRequestException('Achievement is not unlocked yet');
    }

    if (userAch.isClaimed) {
      throw new BadRequestException('Reward already claimed');
    }

    userAch.isClaimed = true;
    await this.userAchievementRepository.save(userAch);

    return { claimed: true, rewardXp: userAch.achievement.rewardXp };
  }
}
