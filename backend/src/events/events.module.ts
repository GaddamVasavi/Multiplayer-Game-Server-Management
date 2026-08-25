import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { GameEventMasterEntity, EventParticipantEntity } from './event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameEventMasterEntity, EventParticipantEntity])],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
