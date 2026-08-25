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

@Entity('in_game_mail')
export class InGameMailEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'recipient_id' })
  recipientId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: UserEntity;

  @Column({ length: 150 })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'attachment_coins', default: 0 })
  attachmentCoins: number;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'is_claimed', default: false })
  isClaimed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
