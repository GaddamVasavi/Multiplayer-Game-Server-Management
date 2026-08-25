import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { PlayerProfileEntity } from './player-profile.entity';
import { MatchParticipantEntity } from './match-participant.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => PlayerProfileEntity, (profile) => profile.user, { cascade: true })
  profile: PlayerProfileEntity;

  @OneToMany(() => MatchParticipantEntity, (participant) => participant.user)
  matchParticipations: MatchParticipantEntity[];
}
