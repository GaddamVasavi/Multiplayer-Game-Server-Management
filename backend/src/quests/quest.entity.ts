import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';

export enum QuestType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  SPECIAL = 'SPECIAL',
}

@Entity('quest_definitions')
export class QuestDefinitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 64 })
  code: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: QuestType.DAILY,
  })
  type: QuestType;

  @Column({ name: 'target_value', default: 5 })
  targetValue: number;

  @Column({ name: 'reward_coins', default: 250 })
  rewardCoins: number;

  @Column({ name: 'reward_xp', default: 500 })
  rewardXp: number;
}

@Entity('user_quests')
@Unique(['userId', 'questId'])
export class UserQuestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'quest_id' })
  questId: string;

  @ManyToOne(() => QuestDefinitionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quest_id' })
  quest: QuestDefinitionEntity;

  @Column({ name: 'current_progress', default: 0 })
  currentProgress: number;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({ name: 'is_claimed', default: false })
  isClaimed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
