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

@Entity('season_definitions')
export class SeasonDefinitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'season_number', unique: true })
  seasonNumber: number;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate: Date;

  @Column({ name: 'max_tier', default: 50 })
  maxTier: number;
}

@Entity('season_tiers')
export class SeasonTierEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'season_id' })
  seasonId: string;

  @ManyToOne(() => SeasonDefinitionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season: SeasonDefinitionEntity;

  @Column({ name: 'tier_number' })
  tierNumber: number;

  @Column({ name: 'required_xp', default: 1000 })
  requiredXp: number;

  @Column({ name: 'reward_title', length: 100 })
  rewardTitle: string;

  @Column({ name: 'reward_type', length: 50, default: 'COINS' })
  rewardType: string;

  @Column({ name: 'reward_value', default: 500 })
  rewardValue: number;

  @Column({ name: 'is_premium', default: false })
  isPremium: boolean;
}

@Entity('user_season_progress')
@Unique(['userId', 'seasonId'])
export class UserSeasonProgressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'season_id' })
  seasonId: string;

  @ManyToOne(() => SeasonDefinitionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season: SeasonDefinitionEntity;

  @Column({ name: 'current_xp', default: 0 })
  currentXp: number;

  @Column({ name: 'current_tier', default: 1 })
  currentTier: number;

  @Column({ name: 'is_premium_pass', default: false })
  isPremiumPass: boolean;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
