import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../src/chat/chat.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatMessageEntity } from '../src/chat/chat.entity';

describe('ChatService', () => {
  let service: ChatService;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'msg-123', ...entity })),
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(ChatMessageEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should filter profanity from message content', async () => {
    const msg = await service.saveMessage('user-1', 'GLOBAL', null, 'This game is damn awesome');
    expect(msg.content).toContain('****');
    expect(msg.isFlagged).toBe(true);
  });

  it('should save clean message cleanly', async () => {
    const msg = await service.saveMessage('user-1', 'GLOBAL', null, 'Good game everyone!');
    expect(msg.content).toBe('Good game everyone!');
    expect(msg.isFlagged).toBe(false);
  });
});
