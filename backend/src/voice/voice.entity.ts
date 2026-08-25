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

@Entity('voice_rooms')
export class VoiceRoomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'room_id', length: 64 })
  roomId: string;

  @Column({ name: 'max_audio_slots', default: 10 })
  maxAudioSlots: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('voice_participants')
export class VoiceParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voice_room_id' })
  voiceRoomId: string;

  @ManyToOne(() => VoiceRoomEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voice_room_id' })
  voiceRoom: VoiceRoomEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'is_muted', default: false })
  isMuted: boolean;

  @Column({ name: 'is_deafened', default: false })
  isDeafened: boolean;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
