import { Controller, Get, UseGuards } from '@nestjs/common';
import { AntiCheatService } from './anti_cheat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Anti-Cheat & Security')
@Controller('api/anti-cheat')
export class AntiCheatController {
  constructor(private readonly antiCheatService: AntiCheatService) {}

  @Get('violations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent security & anti-cheat telemetry violations' })
  async getViolations() {
    return this.antiCheatService.getRecentViolations();
  }
}
