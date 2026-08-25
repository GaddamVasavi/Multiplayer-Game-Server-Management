import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Daily & Weekly Quests')
@Controller('api/quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user active quests' })
  async getMyQuests(@Request() req: any) {
    return this.questsService.getUserQuests(req.user.userId);
  }

  @Post('claim/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim quest completion reward' })
  async claimReward(@Request() req: any, @Param('id') id: string) {
    return this.questsService.claimQuestReward(req.user.userId, id);
  }
}
