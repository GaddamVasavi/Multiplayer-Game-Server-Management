import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';

export enum ViolationType {
  SPEED_HACK = 'SPEED_HACK',
  TELEPORTATION = 'TELEPORTATION',
  PACKET_FLOOD = 'PACKET_FLOOD',
  IMPOSSIBLE_SCORE = 'IMPOSSIBLE_SCORE',
}

@Entity('anti_cheat_violations')
export class AntiCheatViolationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'varchar',
    length: 30,
    default: ViolationType.SPEED_HACK,
  })
  violationType: ViolationType;

  @Column({ type: 'text' })
  details: string;

  @Column({ name: 'severity_score', default: 50 })
  severityScore: number;

  @Column({ name: 'action_taken', length: 50, default: 'FLAGGED' })
  actionTaken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
