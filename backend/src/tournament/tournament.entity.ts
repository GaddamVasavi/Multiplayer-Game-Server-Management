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

export enum TournamentStatus {
  REGISTRATION = 'REGISTRATION',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('tournaments')
export class TournamentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: TournamentStatus.REGISTRATION,
  })
  status: TournamentStatus;

  @Column({ name: 'max_participants', default: 16 })
  maxParticipants: number;

  @Column({ name: 'prize_pool_coins', default: 10000 })
  prizePoolCoins: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => TournamentMatchEntity, (match) => match.tournament, { cascade: true })
  matches: TournamentMatchEntity[];
}

@Entity('tournament_matches')
export class TournamentMatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tournament_id' })
  tournamentId: string;

  @ManyToOne(() => TournamentEntity, (t) => t.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournament_id' })
  tournament: TournamentEntity;

  @Column({ name: 'round_number', default: 1 })
  roundNumber: number;

  @Column({ name: 'match_number', default: 1 })
  matchNumber: number;

  @Column({ name: 'player1_id', nullable: true })
  player1Id: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'player1_id' })
  player1: UserEntity;

  @Column({ name: 'player2_id', nullable: true })
  player2Id: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'player2_id' })
  player2: UserEntity;

  @Column({ name: 'winner_id', nullable: true })
  winnerId: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'winner_id' })
  winner: UserEntity;
}
