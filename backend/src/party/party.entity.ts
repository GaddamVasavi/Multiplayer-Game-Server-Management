import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';

@Entity('parties')
export class PartyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'leader_id' })
  leaderId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leader_id' })
  leader: UserEntity;

  @Column({ name: 'max_members', default: 4 })
  maxMembers: number;

  @Column({ name: 'is_in_queue', default: false })
  isInQueue: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => PartyMemberEntity, (m) => m.party, { cascade: true })
  members: PartyMemberEntity[];
}

@Entity('party_members')
export class PartyMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'party_id' })
  partyId: string;

  @ManyToOne(() => PartyEntity, (p) => p.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'party_id' })
  party: PartyEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'is_ready', default: false })
  isReady: boolean;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
