import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DisasterRecoveryService } from './disaster_recovery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Disaster Recovery & Backups')
@Controller('api/disaster-recovery')
export class DisasterRecoveryController {
  constructor(private readonly drService: DisasterRecoveryService) {}

  @Get('backups')
  @ApiOperation({ summary: 'Get database backup snapshot history' })
  async getBackups() {
    return this.drService.getBackupHistory();
  }

  @Get('recoveries')
  @ApiOperation({ summary: 'Get disaster recovery audit history' })
  async getRecoveries() {
    return this.drService.getRecoveryHistory();
  }

  @Post('backup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger manual database snapshot backup' })
  async triggerBackup(@Body('type') type?: string) {
    return this.drService.createBackup(type);
  }

  @Post('restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute state restoration from backup snapshot' })
  async restore(@Body('backupId') backupId: string) {
    return this.drService.executeRecovery(backupId);
  }
}
