import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReplayService } from './replay.service';
import { ReplayController } from './replay.controller';
import { MatchReplayEntity } from './replay.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatchReplayEntity])],
  providers: [ReplayService],
  controllers: [ReplayController],
  exports: [ReplayService],
})
export class ReplayModule {}
