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

export enum NotificationType {
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  PARTY_INVITE = 'PARTY_INVITE',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  TOURNAMENT_ALERT = 'TOURNAMENT_ALERT',
}

@Entity('system_notifications')
export class SystemNotificationEntity {
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
    default: NotificationType.SYSTEM_ANNOUNCEMENT,
  })
  type: NotificationType;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
