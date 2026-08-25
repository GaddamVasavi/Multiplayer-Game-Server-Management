import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { GameModule } from './game/game.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ChatModule } from './chat/chat.module';
import { AchievementsModule } from './achievements/achievements.module';
import { InventoryModule } from './inventory/inventory.module';
import { TournamentModule } from './tournament/tournament.module';
import { SeasonPassModule } from './season_pass/season_pass.module';
import { ReportsModule } from './reports/reports.module';
import { getPostgresConfig } from './database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => getPostgresConfig(),
    }),
    AuthModule,
    PlayersModule,
    MatchmakingModule,
    GameModule,
    LeaderboardModule,
    AnalyticsModule,
    ChatModule,
    AchievementsModule,
    InventoryModule,
    TournamentModule,
    SeasonPassModule,
    ReportsModule,
  ],
})
export class AppModule {}
