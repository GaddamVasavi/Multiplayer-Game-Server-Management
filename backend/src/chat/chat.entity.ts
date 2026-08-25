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

export enum ChatChannel {
  GLOBAL = 'GLOBAL',
  LOBBY = 'LOBBY',
  ROOM = 'ROOM',
  PARTY = 'PARTY',
  DIRECT = 'DIRECT',
}

@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;

  @Column({ name: 'recipient_id', nullable: true })
  recipientId: string;

  @Column({ name: 'room_id', nullable: true, length: 64 })
  roomId: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: ChatChannel.GLOBAL,
  })
  channel: ChatChannel;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_flagged', default: false })
  isFlagged: boolean;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
