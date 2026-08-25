import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Leaderboard')
@Controller('api/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get global top players leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard list returned' })
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.leaderboardService.getTopPlayers(limit ? Number(limit) : 50);
  }
}
