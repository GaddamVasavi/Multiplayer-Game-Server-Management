import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';

export enum ReportReason {
  CHEATING = 'CHEATING',
  TOXIC_CHAT = 'TOXIC_CHAT',
  AFK = 'AFK',
  EXPLOITING = 'EXPLOITING',
}

@Entity('player_reports')
export class PlayerReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporter_id' })
  reporterId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: UserEntity;

  @Column({ name: 'reported_user_id' })
  reportedUserId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reported_user_id' })
  reportedUser: UserEntity;

  @Column({
    type: 'varchar',
    length: 20,
    default: ReportReason.CHEATING,
  })
  reason: ReportReason;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'is_resolved', default: false })
  isResolved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
