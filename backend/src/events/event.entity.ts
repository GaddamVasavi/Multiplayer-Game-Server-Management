import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { ManyToOne, JoinColumn } from 'typeorm';

@Entity('game_events_master')
export class GameEventMasterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'multiplier_xp', type: 'float', default: 2.0 })
  multiplierXp: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'start_time', type: 'timestamp with time zone' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp with time zone' })
  endTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('event_participants')
export class EventParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => GameEventMasterEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: GameEventMasterEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'event_score', default: 0 })
  eventScore: number;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
