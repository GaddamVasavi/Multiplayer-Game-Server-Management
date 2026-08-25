import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Guilds & Clans')
@Controller('api/guilds')
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get global top guilds leaderboard' })
  async getLeaderboard() {
    return this.guildsService.getGuildLeaderboard();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new player guild' })
  async createGuild(
    @Request() req: any,
    @Body('name') name: string,
    @Body('tag') tag: string,
    @Body('description') description: string,
  ) {
    return this.guildsService.createGuild(req.user.userId, name, tag, description);
  }

  @Post('join/:guildId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join guild by ID' })
  async joinGuild(@Request() req: any, @Param('guildId') guildId: string) {
    return this.guildsService.joinGuild(guildId, req.user.userId);
  }
}
