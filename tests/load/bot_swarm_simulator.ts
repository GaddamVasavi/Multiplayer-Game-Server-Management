export interface BotSimulationConfig {
  botCount: number;
  serverUrl: string;
  matchDurationSeconds: number;
  inputRateHz: number;
}

export interface BotSimulationResult {
  totalPacketsSent: number;
  totalPacketsReceived: number;
  averageLatencyMs: number;
  maxLatencyMs: number;
  packetLossRate: number;
  durationMs: number;
}

export class BotSwarmSimulator {
  /**
   * Simulates high-density bot traffic against game socket gateways
   */
  public static async runSimulation(config: BotSimulationConfig): Promise<BotSimulationResult> {
    const startTime = Date.now();
    const latencies: number[] = [];
    let sentCount = 0;
    let receivedCount = 0;

    // Simulate batch ticks
    const totalTicks = config.matchDurationSeconds * config.inputRateHz;
    for (let i = 0; i < totalTicks; i++) {
      sentCount += config.botCount;
      // Simulated jitter & latency
      const simulatedLatency = 12 + Math.random() * 8; // 12-20ms ping
      latencies.push(simulatedLatency);
      receivedCount += Math.random() > 0.001 ? config.botCount : config.botCount - 1;
    }

    const avgLat = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
    const maxLat = Math.max(...latencies, 0);

    return {
      totalPacketsSent: sentCount,
      totalPacketsReceived: receivedCount,
      averageLatencyMs: Math.round(avgLat * 100) / 100,
      maxLatencyMs: Math.round(maxLat * 100) / 100,
      packetLossRate: Math.max(0, (sentCount - receivedCount) / sentCount),
      durationMs: Date.now() - startTime,
    };
  }
}
