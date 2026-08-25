import { Injectable, Logger } from '@nestjs/common';
import { Registry, Gauge, Counter, Histogram } from 'prom-client';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerMetricsEntity } from '../database/entities/server-metrics.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly register: Registry;

  public activePlayersGauge: Gauge<string>;
  public activeRoomsGauge: Gauge<string>;
  public cpuUsageGauge: Gauge<string>;
  public memoryUsageGauge: Gauge<string>;
  public requestLatencyHistogram: Histogram<string>;
  public totalMatchCounter: Counter<string>;

  constructor(
    @InjectRepository(ServerMetricsEntity)
    private readonly metricsRepository: Repository<ServerMetricsEntity>,
  ) {
    this.register = new Registry();

    this.activePlayersGauge = new Gauge({
      name: 'game_active_players',
      help: 'Current active connected players in game rooms',
      registers: [this.register],
    });

    this.activeRoomsGauge = new Gauge({
      name: 'game_active_rooms',
      help: 'Current active game rooms on this server pod',
      registers: [this.register],
    });

    this.cpuUsageGauge = new Gauge({
      name: 'game_cpu_usage_percent',
      help: 'Game server pod CPU usage percentage',
      registers: [this.register],
    });

    this.memoryUsageGauge = new Gauge({
      name: 'game_memory_usage_bytes',
      help: 'Game server pod RAM memory consumption in bytes',
      registers: [this.register],
    });

    this.requestLatencyHistogram = new Histogram({
      name: 'game_request_latency_seconds',
      help: 'WebSocket tick and REST API response latency distribution in seconds',
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2],
      registers: [this.register],
    });

    this.totalMatchCounter = new Counter({
      name: 'game_matches_total',
      help: 'Total completed game matches',
      registers: [this.register],
    });
  }

  async getMetricsText(): Promise<string> {
    return this.register.metrics();
  }

  async recordTelemetry(podId: string, activePlayers: number, activeRooms: number, cpuPct: number, memMb: number, latencyMs: number) {
    this.activePlayersGauge.set(activePlayers);
    this.activeRoomsGauge.set(activeRooms);
    this.cpuUsageGauge.set(cpuPct);
    this.memoryUsageGauge.set(memMb * 1024 * 1024);
    this.requestLatencyHistogram.observe(latencyMs / 1000);

    const telemetry = this.metricsRepository.create({
      serverPodId: podId,
      activePlayers,
      activeRooms,
      cpuUsagePct: cpuPct,
      memoryUsageMb: memMb,
      networkRxKbps: Math.random() * 500 + 100,
      networkTxKbps: Math.random() * 1200 + 300,
      averageLatencyMs: latencyMs,
      droppedPackets: Math.floor(Math.random() * 3),
    });

    await this.metricsRepository.save(telemetry);
  }
}
