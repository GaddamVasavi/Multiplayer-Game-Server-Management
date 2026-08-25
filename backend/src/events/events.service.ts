import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEventMasterEntity, EventParticipantEntity } from './event.entity';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(GameEventMasterEntity)
    private readonly eventRepository: Repository<GameEventMasterEntity>,
    @InjectRepository(EventParticipantEntity)
    private readonly participantRepository: Repository<EventParticipantEntity>,
  ) {}

  async getActiveEvents(): Promise<GameEventMasterEntity[]> {
    const now = new Date();
    const events = await this.eventRepository.find({
      where: { isActive: true },
      order: { startTime: 'ASC' },
    });

    if (events.length === 0) {
      // Seed weekend 2x XP default event
      const defaultEvent = this.eventRepository.create({
        title: 'Weekend Double XP Madness',
        description: 'Earn 2x XP rewards on all competitive arena match victories',
        multiplierXp: 2.0,
        isActive: true,
        startTime: now,
        endTime: new Date(now.getTime() + 7 * 86400000),
      });
      await this.eventRepository.save(defaultEvent);
      return [defaultEvent];
    }

    return events;
  }

  async createEvent(title: string, description: string, multiplierXp: number = 2.0, durationDays: number = 7): Promise<GameEventMasterEntity> {
    const now = new Date();
    const event = this.eventRepository.create({
      title,
      description,
      multiplierXp,
      isActive: true,
      startTime: now,
      endTime: new Date(now.getTime() + durationDays * 86400000),
    });

    const saved = await this.eventRepository.save(event);
    this.logger.log(`Created new live event '${saved.title}' (${saved.multiplierXp}x XP Multiplier)`);
    return saved;
  }
}
