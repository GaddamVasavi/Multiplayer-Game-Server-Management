import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Players')
@Controller('api/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get player profile by user ID' })
  @ApiResponse({ status: 200, description: 'Profile found' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Param('id') userId: string) {
    const profile = await this.playersService.getProfileByUserId(userId);
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      eloRating: profile.eloRating,
      matchesPlayed: profile.matchesPlayed,
      wins: profile.wins,
      losses: profile.losses,
      winRate: profile.matchesPlayed > 0 ? (profile.wins / profile.matchesPlayed * 100).toFixed(1) + '%' : '0%',
      totalScore: profile.totalScore,
      isOnline: profile.isOnline,
      lastSeen: profile.lastSeen,
    };
  }
}
