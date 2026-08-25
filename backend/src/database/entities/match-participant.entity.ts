import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MatchEntity } from './match.entity';
import { UserEntity } from './user.entity';

@Entity('match_participants')
export class MatchParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'match_id' })
  matchId: string;

  @ManyToOne(() => MatchEntity, (match) => match.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: MatchEntity;

  @Column({ name: 'player_id' })
  playerId: string;

  @ManyToOne(() => UserEntity, (user) => user.matchParticipations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  user: UserEntity;

  @Column({ default: 0 })
  kills: number;

  @Column({ default: 0 })
  deaths: number;

  @Column({ default: 0 })
  score: number;

  @Column({ name: 'rank_position', nullable: true })
  rankPosition: number;

  @Column({ name: 'disconnected_at', type: 'timestamp with time zone', nullable: true })
  disconnectedAt: Date;
}
