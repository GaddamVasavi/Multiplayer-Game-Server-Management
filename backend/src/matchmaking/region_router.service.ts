import { Injectable, Logger } from '@nestjs/common';

export interface RegionPingMap {
  region: string;
  pingMs: number;
}

@Injectable()
export class RegionRouterService {
  private readonly logger = new Logger(RegionRouterService.name);

  private readonly supportedRegions = ['US-EAST', 'US-WEST', 'EU-CENTRAL', 'AP-SOUTH'];

  selectOptimalRegion(pings: RegionPingMap[]): string {
    if (!pings || pings.length === 0) {
      return 'US-EAST'; // default fallback
    }

    const sorted = [...pings].sort((a, b) => a.pingMs - b.pingMs);
    const best = sorted[0];

    if (this.supportedRegions.includes(best.region)) {
      this.logger.log(`Selected optimal region ${best.region} with ${best.pingMs}ms latency`);
      return best.region;
    }

    return 'US-EAST';
  }
}
