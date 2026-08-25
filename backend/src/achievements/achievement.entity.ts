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

@Entity('achievement_definitions')
export class AchievementDefinitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 64 })
  code: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'category', length: 50, default: 'GAMEPLAY' })
  category: string;

  @Column({ name: 'target_value', default: 1 })
  targetValue: number;

  @Column({ name: 'reward_xp', default: 100 })
  rewardXp: number;

  @Column({ name: 'icon_name', length: 50, default: 'trophy' })
  iconName: string;
}

@Entity('user_achievements')
@Unique(['userId', 'achievementId'])
export class UserAchievementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'achievement_id' })
  achievementId: string;

  @ManyToOne(() => AchievementDefinitionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'achievement_id' })
  achievement: AchievementDefinitionEntity;

  @Column({ name: 'current_progress', default: 0 })
  currentProgress: number;

  @Column({ name: 'is_unlocked', default: false })
  isUnlocked: boolean;

  @Column({ name: 'is_claimed', default: false })
  isClaimed: boolean;

  @Column({ name: 'unlocked_at', type: 'timestamp with time zone', nullable: true })
  unlockedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
