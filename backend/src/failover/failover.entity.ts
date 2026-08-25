import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('failover_events')
export class FailoverEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'failed_pod_id', length: 100 })
  failedPodId: string;

  @Column({ name: 'target_pod_id', length: 100 })
  targetPodId: string;

  @Column({ name: 'reassigned_players_count', default: 0 })
  reassignedPlayersCount: number;

  @Column({ name: 'recovery_duration_ms', default: 0 })
  recoveryDurationMs: number;

  @Column({ name: 'trigger_reason', length: 150 })
  triggerReason: string;

  @Column({ name: 'status', length: 20, default: 'COMPLETED' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
