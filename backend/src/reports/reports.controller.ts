import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportReason } from './report.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Player Moderation & Reports')
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit player report' })
  async fileReport(
    @Request() req: any,
    @Body('reportedUserId') reportedUserId: string,
    @Body('reason') reason: ReportReason,
    @Body('description') description: string,
  ) {
    return this.reportsService.submitReport(req.user.userId, reportedUserId, reason, description);
  }

  @Get('queue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unresolved moderation queue' })
  async getQueue() {
    return this.reportsService.getModerationQueue();
  }

  @Post(':id/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve player report' })
  async resolve(@Param('id') id: string) {
    await this.reportsService.resolveReport(id);
    return { status: 'RESOLVED', message: 'Report resolved' };
  }
}
