import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity, ScalingDecisionHistoryEntity } from './audit_log.entity';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepository: Repository<AuditLogEntity>,
    @InjectRepository(ScalingDecisionHistoryEntity)
    private readonly scalingHistoryRepository: Repository<ScalingDecisionHistoryEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async logAdminAction(adminId: string, action: string, targetResource: string, details?: string, ipAddress?: string): Promise<AuditLogEntity> {
    const log = this.auditRepository.create({
      adminId,
      action,
      targetResource,
      details,
      ipAddress,
    });
    return this.auditRepository.save(log);
  }

  async getAuditLogs(): Promise<AuditLogEntity[]> {
    return this.auditRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async recordScalingDecision(
    currentPods: number,
    recommendedPods: number,
    targetPods: number,
    triggerReason: string,
    scalingMode: string = 'AUTOMATIC',
    aiConfidenceScore: number = 0.95,
  ): Promise<ScalingDecisionHistoryEntity> {
    const decision = this.scalingHistoryRepository.create({
      currentPods,
      recommendedPods,
      targetPods,
      triggerReason,
      scalingMode,
      aiConfidenceScore,
    });
    return this.scalingHistoryRepository.save(decision);
  }

  async getScalingHistory(): Promise<ScalingDecisionHistoryEntity[]> {
    return this.scalingHistoryRepository.find({
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return this.userRepository.find({
      relations: ['profile'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
