import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { MatchParticipantEntity } from './match-participant.entity';

export enum MatchStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABORTED = 'ABORTED',
}

@Entity('matches')
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_id', length: 64 })
  roomId: string;

  @Column({ name: 'server_node_id', length: 64 })
  serverNodeId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: MatchStatus.IN_PROGRESS,
  })
  status: MatchStatus;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamp with time zone', nullable: true })
  endedAt: Date;

  @Column({ name: 'winner_team_id', nullable: true })
  winnerTeamId: number;

  @Column({ name: 'total_players' })
  totalPlayers: number;

  @OneToMany(() => MatchParticipantEntity, (participant) => participant.match, { cascade: true })
  participants: MatchParticipantEntity[];
}
