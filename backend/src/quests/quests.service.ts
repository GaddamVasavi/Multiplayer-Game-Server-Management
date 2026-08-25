import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestDefinitionEntity, UserQuestEntity } from './quest.entity';

@Injectable()
export class QuestsService {
  private readonly logger = new Logger(QuestsService.name);

  constructor(
    @InjectRepository(QuestDefinitionEntity)
    private readonly questDefRepository: Repository<QuestDefinitionEntity>,
    @InjectRepository(UserQuestEntity)
    private readonly userQuestRepository: Repository<UserQuestEntity>,
  ) {}

  async getUserQuests(userId: string): Promise<UserQuestEntity[]> {
    const defs = await this.questDefRepository.find();
    const existing = await this.userQuestRepository.find({
      where: { userId },
      relations: ['quest'],
    });

    const existingMap = new Map(existing.map((e) => [e.questId, e]));
    const result: UserQuestEntity[] = [];

    for (const def of defs) {
      if (existingMap.has(def.id)) {
        result.push(existingMap.get(def.id)!);
      } else {
        const created = this.userQuestRepository.create({
          userId,
          questId: def.id,
          quest: def,
          currentProgress: 0,
          isCompleted: false,
          isClaimed: false,
        });
        await this.userQuestRepository.save(created);
        result.push(created);
      }
    }

    return result;
  }

  async claimQuestReward(userId: string, userQuestId: string): Promise<{ claimed: boolean; rewardCoins: number; rewardXp: number }> {
    const uq = await this.userQuestRepository.findOne({
      where: { id: userQuestId, userId },
      relations: ['quest'],
    });

    if (!uq) {
      throw new NotFoundException('Quest not found');
    }

    if (!uq.isCompleted) {
      throw new BadRequestException('Quest is not completed yet');
    }

    if (uq.isClaimed) {
      throw new BadRequestException('Reward already claimed');
    }

    uq.isClaimed = true;
    await this.userQuestRepository.save(uq);

    return {
      claimed: true,
      rewardCoins: uq.quest.rewardCoins,
      rewardXp: uq.quest.rewardXp,
    };
  }
}
