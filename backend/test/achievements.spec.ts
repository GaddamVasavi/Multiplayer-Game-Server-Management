import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsService } from '../src/achievements/achievements.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AchievementDefinitionEntity, UserAchievementEntity } from '../src/achievements/achievement.entity';

describe('AchievementsService', () => {
  let service: AchievementsService;

  const mockDefRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'ach-1', code: 'WIN_10', targetValue: 10, rewardXp: 500 }),
  };

  const mockUserAchRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        { provide: getRepositoryToken(AchievementDefinitionEntity), useValue: mockDefRepo },
        { provide: getRepositoryToken(UserAchievementEntity), useValue: mockUserAchRepo },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
  });

  it('should initialize empty achievements for new user', async () => {
    const res = await service.getUserAchievements('user-1');
    expect(res).toBeDefined();
  });
});
