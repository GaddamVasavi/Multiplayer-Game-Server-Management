import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Achievements')
@Controller('api/achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user achievements progress' })
  async getMyAchievements(@Request() req: any) {
    return this.achievementsService.getUserAchievements(req.user.userId);
  }

  @Post('claim/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim reward for unlocked achievement' })
  async claimReward(@Request() req: any, @Param('id') id: string) {
    return this.achievementsService.claimReward(req.user.userId, id);
  }
}
