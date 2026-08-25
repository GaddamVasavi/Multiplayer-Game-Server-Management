import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('player_profiles')
export class PlayerProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'display_name', length: 50 })
  displayName: string;

  @Index()
  @Column({ name: 'elo_rating', default: 1200 })
  eloRating: number;

  @Column({ name: 'matches_played', default: 0 })
  matchesPlayed: number;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @Index()
  @Column({ name: 'total_score', type: 'bigint', default: 0 })
  totalScore: number;

  @Column({ name: 'avatar_url', nullable: true, length: 255 })
  avatarUrl: string;

  @Column({ name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ name: 'last_seen', type: 'timestamp with time zone', nullable: true })
  lastSeen: Date;
}
