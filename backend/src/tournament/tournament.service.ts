import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentEntity, TournamentMatchEntity, TournamentStatus } from './tournament.entity';

@Injectable()
export class TournamentService {
  private readonly logger = new Logger(TournamentService.name);

  constructor(
    @InjectRepository(TournamentEntity)
    private readonly tournamentRepository: Repository<TournamentEntity>,
    @InjectRepository(TournamentMatchEntity)
    private readonly matchRepository: Repository<TournamentMatchEntity>,
  ) {}

  async getAllTournaments(): Promise<TournamentEntity[]> {
    return this.tournamentRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getTournamentBracket(tournamentId: string): Promise<TournamentMatchEntity[]> {
    return this.matchRepository.find({
      where: { tournamentId },
      relations: ['player1', 'player2', 'winner'],
      order: { roundNumber: 'ASC', matchNumber: 'ASC' },
    });
  }

  async createTournament(name: string, description: string, maxParticipants: number = 8): Promise<TournamentEntity> {
    const tournament = this.tournamentRepository.create({
      name,
      description,
      maxParticipants,
      status: TournamentStatus.REGISTRATION,
    });

    const saved = await this.tournamentRepository.save(tournament);
    this.logger.log(`Created Tournament ${saved.name} (${saved.id})`);
    return saved;
  }

  async reportMatchWinner(matchId: string, winnerId: string): Promise<TournamentMatchEntity> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['tournament'],
    });

    if (!match) {
      throw new NotFoundException('Tournament match not found');
    }

    if (match.player1Id !== winnerId && match.player2Id !== winnerId) {
      throw new BadRequestException('Winner must be a participant in this match');
    }

    match.winnerId = winnerId;
    await this.matchRepository.save(match);

    // Check if next round match exists and update next match participant
    const nextRound = match.roundNumber + 1;
    const nextMatchNumber = Math.ceil(match.matchNumber / 2);

    const nextMatch = await this.matchRepository.findOne({
      where: { tournamentId: match.tournamentId, roundNumber: nextRound, matchNumber: nextMatchNumber },
    });

    if (nextMatch) {
      if (match.matchNumber % 2 !== 0) {
        nextMatch.player1Id = winnerId;
      } else {
        nextMatch.player2Id = winnerId;
      }
      await this.matchRepository.save(nextMatch);
    }

    return match;
  }
}
