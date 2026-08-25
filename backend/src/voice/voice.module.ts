import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoiceService } from './voice.service';
import { VoiceGateway } from './voice.gateway';
import { VoiceController } from './voice.controller';
import { VoiceRoomEntity, VoiceParticipantEntity } from './voice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VoiceRoomEntity, VoiceParticipantEntity])],
  providers: [VoiceService, VoiceGateway],
  controllers: [VoiceController],
  exports: [VoiceService],
})
export class VoiceModule {}
