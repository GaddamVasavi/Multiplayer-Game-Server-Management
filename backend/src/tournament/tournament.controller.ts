import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tournaments')
@Controller('api/tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all tournaments' })
  async getTournaments() {
    return this.tournamentService.getAllTournaments();
  }

  @Get(':id/bracket')
  @ApiOperation({ summary: 'Get bracket matches for tournament' })
  async getBracket(@Param('id') id: string) {
    return this.tournamentService.getTournamentBracket(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new tournament bracket' })
  async createTournament(
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('maxParticipants') maxParticipants?: number,
  ) {
    return this.tournamentService.createTournament(name, description, maxParticipants);
  }

  @Post('matches/:matchId/winner')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report match winner & advance bracket' })
  async reportWinner(@Param('matchId') matchId: string, @Body('winnerId') winnerId: string) {
    return this.tournamentService.reportMatchWinner(matchId, winnerId);
  }
}
