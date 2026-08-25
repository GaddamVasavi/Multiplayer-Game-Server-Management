import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReplayService } from './replay.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Match Replay & Recording')
@Controller('api/replays')
export class ReplayController {
  constructor(private readonly replayService: ReplayService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent match replays catalog' })
  async getReplays() {
    return this.replayService.getRecentReplays();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full tick-by-tick replay data payload' })
  async getReplayDetails(@Param('id') id: string) {
    const replay = await this.replayService.getReplayById(id);
    return {
      id: replay.id,
      matchId: replay.matchId,
      roomId: replay.roomId,
      totalTicks: replay.totalTicks,
      durationSeconds: replay.durationSeconds,
      ticks: JSON.parse(replay.replayDataJson),
    };
  }
}
