import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailoverEventEntity } from './failover.entity';

@Injectable()
export class FailoverService {
  private readonly logger = new Logger(FailoverService.name);

  constructor(
    @InjectRepository(FailoverEventEntity)
    private readonly failoverRepository: Repository<FailoverEventEntity>,
  ) {}

  async triggerFailover(failedPodId: string, targetPodId: string, playerIds: string[], reason: string): Promise<FailoverEventEntity> {
    const startTime = Date.now();
    this.logger.warn(`FAILOVER TRIGGERED: Pod ${failedPodId} failed. Reassigning ${playerIds.length} players to ${targetPodId}`);

    const duration = Date.now() - startTime + 120; // simulated recovery ms

    const event = this.failoverRepository.create({
      failedPodId,
      targetPodId,
      reassignedPlayersCount: playerIds.length,
      recoveryDurationMs: duration,
      triggerReason: reason,
      status: 'COMPLETED',
    });

    return this.failoverRepository.save(event);
  }

  async getRecentFailovers(): Promise<FailoverEventEntity[]> {
    return this.failoverRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
