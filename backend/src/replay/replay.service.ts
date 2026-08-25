import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchReplayEntity } from './replay.entity';

@Injectable()
export class ReplayService {
  private readonly logger = new Logger(ReplayService.name);

  constructor(
    @InjectRepository(MatchReplayEntity)
    private readonly replayRepository: Repository<MatchReplayEntity>,
  ) {}

  async saveReplay(matchId: string, roomId: string, totalTicks: number, durationSeconds: number, tickFrames: any[]): Promise<MatchReplayEntity> {
    const replay = this.replayRepository.create({
      matchId,
      roomId,
      totalTicks,
      durationSeconds,
      replayDataJson: JSON.stringify(tickFrames),
    });

    const saved = await this.replayRepository.save(replay);
    this.logger.log(`Saved match replay ${saved.id} for match ${matchId} (${totalTicks} ticks)`);
    return saved;
  }

  async getReplayById(replayId: string): Promise<MatchReplayEntity> {
    const replay = await this.replayRepository.findOne({ where: { id: replayId } });
    if (!replay) {
      throw new NotFoundException('Replay not found');
    }
    return replay;
  }

  async getRecentReplays(): Promise<MatchReplayEntity[]> {
    return this.replayRepository.find({
      order: { createdAt: 'DESC' },
      take: 20,
      select: ['id', 'matchId', 'roomId', 'totalTicks', 'durationSeconds', 'createdAt'],
    });
  }
}
