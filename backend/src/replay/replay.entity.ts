import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('match_replays')
export class MatchReplayEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'match_id' })
  matchId: string;

  @Column({ name: 'room_id', length: 64 })
  roomId: string;

  @Column({ name: 'total_ticks', default: 0 })
  totalTicks: number;

  @Column({ name: 'duration_seconds', default: 0 })
  durationSeconds: number;

  @Column({ name: 'replay_data_json', type: 'text' })
  replayDataJson: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
