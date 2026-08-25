import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestsService } from './quests.service';
import { QuestsController } from './quests.controller';
import { QuestDefinitionEntity, UserQuestEntity } from './quest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestDefinitionEntity, UserQuestEntity])],
  providers: [QuestsService],
  controllers: [QuestsController],
  exports: [QuestsService],
})
export class QuestsModule {}
