import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../src/events/events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GameEventMasterEntity, EventParticipantEntity } from '../src/events/event.entity';

describe('EventsService', () => {
  let service: EventsService;

  const mockEventRepo = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'event-1', ...e })),
  };

  const mockParticipantRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(GameEventMasterEntity), useValue: mockEventRepo },
        { provide: getRepositoryToken(EventParticipantEntity), useValue: mockParticipantRepo },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should create new seasonal event with 2x XP multiplier', async () => {
    const event = await service.createEvent('Summer Blitz', 'Special arena tournament', 2.5);
    expect(event.title).toBe('Summer Blitz');
    expect(event.multiplierXp).toBe(2.5);
  });
});
