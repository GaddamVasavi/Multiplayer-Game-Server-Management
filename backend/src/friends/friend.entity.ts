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

export enum FriendStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  BLOCKED = 'BLOCKED',
}

@Entity('friendships')
@Unique(['requesterId', 'addresseeId'])
export class FriendEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'requester_id' })
  requesterId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: UserEntity;

  @Column({ name: 'addressee_id' })
  addresseeId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'addressee_id' })
  addressee: UserEntity;

  @Column({
    type: 'varchar',
    length: 20,
    default: FriendStatus.PENDING,
  })
  status: FriendStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
