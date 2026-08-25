import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { TournamentEntity, TournamentMatchEntity } from './tournament.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TournamentEntity, TournamentMatchEntity]),
  ],
  providers: [TournamentService],
  controllers: [TournamentController],
  exports: [TournamentService],
})
export class TournamentModule {}
