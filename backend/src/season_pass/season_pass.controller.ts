import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SeasonPassService } from './season_pass.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Season Pass')
@Controller('api/season-pass')
export class SeasonPassController {
  constructor(private readonly seasonPassService: SeasonPassService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user season pass progress' })
  async getMyProgress(@Request() req: any) {
    return this.seasonPassService.getUserProgress(req.user.userId);
  }

  @Post('add-xp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add season pass XP (Game rewards)' })
  async addXp(@Request() req: any, @Body('xp') xp: number) {
    return this.seasonPassService.addSeasonXp(req.user.userId, xp || 100);
  }
}
