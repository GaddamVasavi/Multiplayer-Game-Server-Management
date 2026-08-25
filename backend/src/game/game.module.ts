import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { MatchEntity } from '../database/entities/match.entity';
import { MatchParticipantEntity } from '../database/entities/match-participant.entity';
import { PlayersModule } from '../players/players.module';
import { MatchmakingModule } from '../matchmaking/matchmaking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchEntity, MatchParticipantEntity]),
    PlayersModule,
    MatchmakingModule,
  ],
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule {}
