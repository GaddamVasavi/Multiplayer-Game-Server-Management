import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('database_backups')
export class DatabaseBackupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'backup_type', length: 50, default: 'POSTGRESQL_FULL' })
  backupType: string;

  @Column({ name: 'file_path', length: 255 })
  filePath: string;

  @Column({ name: 'file_size_bytes', default: 0 })
  fileSizeBytes: number;

  @Column({ name: 'status', length: 20, default: 'COMPLETED' })
  status: string;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt: Date;
}

@Entity('recovery_events')
export class RecoveryEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'backup_id' })
  backupId: string;

  @Column({ name: 'rto_seconds', default: 120 })
  rtoSeconds: number;

  @Column({ name: 'rpo_seconds', default: 30 })
  rpoSeconds: number;

  @Column({ name: 'status', length: 20, default: 'SUCCESS' })
  status: string;

  @Column({ type: 'text', nullable: true })
  logs: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
