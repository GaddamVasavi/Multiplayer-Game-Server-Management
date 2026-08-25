import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoiceRoomEntity, VoiceParticipantEntity } from './voice.entity';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);

  constructor(
    @InjectRepository(VoiceRoomEntity)
    private readonly voiceRoomRepository: Repository<VoiceRoomEntity>,
    @InjectRepository(VoiceParticipantEntity)
    private readonly participantRepository: Repository<VoiceParticipantEntity>,
  ) {}

  async getOrCreateVoiceRoom(roomId: string): Promise<VoiceRoomEntity> {
    let room = await this.voiceRoomRepository.findOne({ where: { roomId, isActive: true } });
    if (!room) {
      room = this.voiceRoomRepository.create({
        roomId,
        maxAudioSlots: 10,
        isActive: true,
      });
      room = await this.voiceRoomRepository.save(room);
      this.logger.log(`Created WebRTC Voice Room for match room ${roomId}`);
    }
    return room;
  }

  async joinVoiceRoom(roomId: string, userId: string): Promise<VoiceParticipantEntity> {
    const room = await this.getOrCreateVoiceRoom(roomId);
    let participant = await this.participantRepository.findOne({
      where: { voiceRoomId: room.id, userId },
    });

    if (!participant) {
      participant = this.participantRepository.create({
        voiceRoomId: room.id,
        userId,
        isMuted: false,
        isDeafened: false,
      });
      participant = await this.participantRepository.save(participant);
      this.logger.log(`User ${userId} joined Voice Room ${room.id}`);
    }

    return participant;
  }

  async setMuteStatus(roomId: string, userId: string, isMuted: boolean): Promise<void> {
    const room = await this.getOrCreateVoiceRoom(roomId);
    const participant = await this.participantRepository.findOne({
      where: { voiceRoomId: room.id, userId },
    });
    if (participant) {
      participant.isMuted = isMuted;
      await this.participantRepository.save(participant);
    }
  }
}
