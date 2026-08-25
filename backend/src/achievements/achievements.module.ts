import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { AchievementDefinitionEntity, UserAchievementEntity } from './achievement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AchievementDefinitionEntity, UserAchievementEntity]),
  ],
  providers: [AchievementsService],
  controllers: [AchievementsController],
  exports: [AchievementsService],
})
export class AchievementsModule {}
