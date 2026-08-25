import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FailoverService } from './failover.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Automatic Failover Management')
@Controller('api/failover')
export class FailoverController {
  constructor(private readonly failoverService: FailoverService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Get failover event history logs' })
  async getLogs() {
    return this.failoverService.getRecentFailovers();
  }

  @Post('trigger-test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simulate server failure and trigger automatic failover' })
  async triggerTest(
    @Body('failedPodId') failedPodId: string,
    @Body('targetPodId') targetPodId: string,
    @Body('playerIds') playerIds: string[],
    @Body('reason') reason: string,
  ) {
    return this.failoverService.triggerFailover(failedPodId, targetPodId, playerIds || [], reason || 'Simulated pod crash');
  }
}
