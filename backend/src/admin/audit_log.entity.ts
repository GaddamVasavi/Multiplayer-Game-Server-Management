import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'admin_id' })
  adminId: string;

  @Column({ length: 100 })
  action: string;

  @Column({ name: 'target_resource', length: 100 })
  targetResource: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('scaling_decision_history')
export class ScalingDecisionHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'timestamp', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ name: 'current_pods', default: 2 })
  currentPods: number;

  @Column({ name: 'recommended_pods', default: 2 })
  recommendedPods: number;

  @Column({ name: 'target_pods', default: 2 })
  targetPods: number;

  @Column({ name: 'trigger_reason', length: 150 })
  triggerReason: string;

  @Column({ name: 'scaling_mode', length: 20, default: 'AUTOMATIC' })
  scalingMode: string;

  @Column({ name: 'ai_confidence_score', type: 'float', default: 0.95 })
  aiConfidenceScore: number;
}
