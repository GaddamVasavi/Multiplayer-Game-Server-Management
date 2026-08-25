import { Test, TestingModule } from '@nestjs/testing';
import { FailoverService } from '../src/failover/failover.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FailoverEventEntity } from '../src/failover/failover.entity';

describe('FailoverService', () => {
  let service: FailoverService;

  const mockFailoverRepo = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'failover-1', ...e })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FailoverService,
        { provide: getRepositoryToken(FailoverEventEntity), useValue: mockFailoverRepo },
      ],
    }).compile();

    service = module.get<FailoverService>(FailoverService);
  });

  it('should record server failover event successfully', async () => {
    const event = await service.triggerFailover('pod-101', 'pod-102', ['user-1', 'user-2'], 'Heartbeat timeout');
    expect(event.failedPodId).toBe('pod-101');
    expect(event.targetPodId).toBe('pod-102');
    expect(event.reassignedPlayersCount).toBe(2);
  });
});
