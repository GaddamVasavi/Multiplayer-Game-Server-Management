import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AntiCheatViolationEntity, ViolationType } from './anti_cheat.entity';

@Injectable()
export class AntiCheatService {
  private readonly logger = new Logger(AntiCheatService.name);

  constructor(
    @InjectRepository(AntiCheatViolationEntity)
    private readonly violationRepository: Repository<AntiCheatViolationEntity>,
  ) {}

  async validatePlayerMovement(userId: string, dx: number, dy: number, dt: number): Promise<boolean> {
    const maxSpeed = 300; // max allowed velocity pixels/sec
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = distance / Math.max(0.001, dt);

    if (speed > maxSpeed * 2.0) {
      await this.recordViolation(
        userId,
        ViolationType.SPEED_HACK,
        `Speed violation detected: ${speed.toFixed(1)} px/s exceeds limit of ${maxSpeed} px/s`,
        85,
        'FLAGGED_FOR_REVIEW',
      );
      return false; // Movement rejected
    }

    return true; // Valid movement vector
  }

  async recordViolation(
    userId: string,
    violationType: ViolationType,
    details: string,
    severityScore: number = 50,
    actionTaken: string = 'FLAGGED',
  ): Promise<AntiCheatViolationEntity> {
    const violation = this.violationRepository.create({
      userId,
      violationType,
      details,
      severityScore,
      actionTaken,
    });

    const saved = await this.violationRepository.save(violation);
    this.logger.warn(`ANTI-CHEAT WARNING: User ${userId} committed ${violationType} [Severity: ${severityScore}]`);
    return saved;
  }

  async getRecentViolations(): Promise<AntiCheatViolationEntity[]> {
    return this.violationRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
      relations: ['user'],
    });
  }
}
