import { Controller, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Matchmaking')
@Controller('api/matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @Post('queue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enqueue current player into matchmaking queue' })
  @ApiResponse({ status: 200, description: 'Player added to queue' })
  async joinQueue(@Request() req: any, @Body('eloRating') eloRating: number, @Body('socketId') socketId: string) {
    await this.matchmakingService.addToQueue({
      userId: req.user.userId,
      username: req.user.username,
      eloRating: eloRating || 1200,
      socketId: socketId || '',
    });
    return { status: 'QUEUED', message: 'Successfully joined matchmaking queue' };
  }

  @Delete('queue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave matchmaking queue' })
  @ApiResponse({ status: 200, description: 'Player removed from queue' })
  async leaveQueue(@Request() req: any) {
    await this.matchmakingService.removeFromQueue(req.user.userId);
    return { status: 'DEQUEUED', message: 'Successfully left matchmaking queue' };
  }
}
