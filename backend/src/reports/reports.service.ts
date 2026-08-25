import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerReportEntity, ReportReason } from './report.entity';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(PlayerReportEntity)
    private readonly reportRepository: Repository<PlayerReportEntity>,
  ) {}

  async submitReport(
    reporterId: string,
    reportedUserId: string,
    reason: ReportReason,
    description: string,
  ): Promise<PlayerReportEntity> {
    const report = this.reportRepository.create({
      reporterId,
      reportedUserId,
      reason,
      description,
    });

    const saved = await this.reportRepository.save(report);
    this.logger.warn(`Player ${reporterId} submitted report against ${reportedUserId} [Reason: ${reason}]`);
    return saved;
  }

  async getModerationQueue(): Promise<PlayerReportEntity[]> {
    return this.reportRepository.find({
      where: { isResolved: false },
      relations: ['reporter', 'reportedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async resolveReport(reportId: string): Promise<void> {
    const report = await this.reportRepository.findOne({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    report.isResolved = true;
    await this.reportRepository.save(report);
  }
}
