export interface GameMetricSnapshot {
  activeMatches: number;
  totalConnectedClients: number;
  averageTickDurationMs: number;
  tickRateHz: number;
  packetJitterMs: number;
  frameDropRatePercent: number;
  memoryUsageMb: number;
  timestamp: string;
}

export class GameTelemetryExporter {
  private static metrics: GameMetricSnapshot = {
    activeMatches: 0,
    totalConnectedClients: 0,
    averageTickDurationMs: 16.6,
    tickRateHz: 60.0,
    packetJitterMs: 2.1,
    frameDropRatePercent: 0.04,
    memoryUsageMb: 128.5,
    timestamp: new Date().toISOString(),
  };

  public static updateMetrics(partial: Partial<GameMetricSnapshot>): void {
    this.metrics = {
      ...this.metrics,
      ...partial,
      timestamp: new Date().toISOString(),
    };
  }

  public static getSnapshot(): GameMetricSnapshot {
    return { ...this.metrics };
  }

  /**
   * Generates Prometheus exposition format text
   */
  public static toPrometheusMetrics(): string {
    const lines = [
      '# HELP game_server_active_matches Number of active running match instances',
      '# TYPE game_server_active_matches gauge',
      `game_server_active_matches ${this.metrics.activeMatches}`,
      '',
      '# HELP game_server_connected_clients Total connected WebSocket player sessions',
      '# TYPE game_server_connected_clients gauge',
      `game_server_connected_clients ${this.metrics.totalConnectedClients}`,
      '',
      '# HELP game_server_tick_rate_hz Actual tick execution rate in Hertz',
      '# TYPE game_server_tick_rate_hz gauge',
      `game_server_tick_rate_hz ${this.metrics.tickRateHz.toFixed(2)}`,
      '',
      '# HELP game_server_packet_jitter_ms Network packet jitter in milliseconds',
      '# TYPE game_server_packet_jitter_ms gauge',
      `game_server_packet_jitter_ms ${this.metrics.packetJitterMs.toFixed(2)}`,
      '',
      '# HELP game_server_frame_drop_percent Percentage of dropped physics/simulation frames',
      '# TYPE game_server_frame_drop_percent gauge',
      `game_server_frame_drop_percent ${this.metrics.frameDropRatePercent.toFixed(4)}`,
    ];
    return lines.join('\n') + '\n';
  }
}
