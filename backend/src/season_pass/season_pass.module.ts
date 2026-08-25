import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeasonPassService } from './season_pass.service';
import { SeasonPassController } from './season_pass.controller';
import { SeasonDefinitionEntity, SeasonTierEntity, UserSeasonProgressEntity } from './season_pass.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeasonDefinitionEntity, SeasonTierEntity, UserSeasonProgressEntity]),
  ],
  providers: [SeasonPassService],
  controllers: [SeasonPassController],
  exports: [SeasonPassService],
})
export class SeasonPassModule {}
