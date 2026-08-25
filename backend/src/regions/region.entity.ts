import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

export enum RegionStatus {
  ONLINE = 'ONLINE',
  MAINTENANCE = 'MAINTENANCE',
  DEGRADED = 'DEGRADED',
  OFFLINE = 'OFFLINE',
}

@Entity('regions')
export class RegionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true, length: 20 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'datacenter_location', length: 100 })
  datacenterLocation: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_maintenance_mode', default: false })
  isMaintenanceMode: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    default: RegionStatus.ONLINE,
  })
  status: RegionStatus;

  @Column({ name: 'max_capacity_players', default: 5000 })
  maxCapacityPlayers: number;

  @Column({ name: 'current_active_players', default: 0 })
  currentActivePlayers: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => GameServerInventoryEntity, (s) => s.region, { cascade: true })
  servers: GameServerInventoryEntity[];
}

@Entity('game_server_inventory')
export class GameServerInventoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'region_id' })
  regionId: string;

  @ManyToOne(() => RegionEntity, (r) => r.servers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: RegionEntity;

  @Column({ name: 'pod_name', unique: true, length: 100 })
  podName: string;

  @Column({ name: 'internal_ip', length: 45 })
  internalIp: string;

  @Column({ name: 'port', default: 4000 })
  port: number;

  @Column({ name: 'status', length: 20, default: 'HEALTHY' })
  status: string;

  @Column({ name: 'active_players', default: 0 })
  activePlayers: number;

  @Column({ name: 'cpu_usage_pct', type: 'float', default: 0.0 })
  cpuUsagePct: number;

  @Column({ name: 'memory_usage_mb', type: 'float', default: 0.0 })
  memoryUsageMb: number;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt: Date;
}
