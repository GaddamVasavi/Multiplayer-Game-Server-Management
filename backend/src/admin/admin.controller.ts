import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin Console & Auditing')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get administrative audit trail logs' })
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('scaling-history')
  @ApiOperation({ summary: 'Get AI auto-scaling decision history log' })
  async getScalingHistory() {
    return this.adminService.getScalingHistory();
  }

  @Post('scaling-history')
  @ApiOperation({ summary: 'Record new AI auto-scaling decision event' })
  async recordDecision(@Body() body: any) {
    return this.adminService.recordScalingDecision(
      body.currentPods,
      body.recommendedPods,
      body.targetPods,
      body.triggerReason,
      body.scalingMode,
      body.aiConfidenceScore,
    );
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of registered platform players' })
  async getUsers() {
    return this.adminService.getAllUsers();
  }
}
