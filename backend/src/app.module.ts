import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { GameModule } from './game/game.module';
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
  ],
})
export class AppModule {}
