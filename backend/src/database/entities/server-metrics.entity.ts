import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('server_metrics_history')
export class ServerMetricsEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;

  @Index()
  @Column({ name: 'server_pod_id', length: 100 })
  serverPodId: string;

  @Column({ name: 'active_players', type: 'int' })
  activePlayers: number;

  @Column({ name: 'active_rooms', type: 'int' })
  activeRooms: number;

  @Column({ name: 'cpu_usage_pct', type: 'numeric', precision: 5, scale: 2 })
  cpuUsagePct: number;

  @Column({ name: 'memory_usage_mb', type: 'numeric', precision: 10, scale: 2 })
  memoryUsageMb: number;

  @Column({ name: 'network_rx_kbps', type: 'numeric', precision: 10, scale: 2 })
  networkRxKbps: number;

  @Column({ name: 'network_tx_kbps', type: 'numeric', precision: 10, scale: 2 })
  networkTxKbps: number;

  @Column({ name: 'average_latency_ms', type: 'numeric', precision: 6, scale: 2 })
  averageLatencyMs: number;

  @Column({ name: 'dropped_packets', type: 'int', default: 0 })
  droppedPackets: number;
}
