import { Test, TestingModule } from '@nestjs/testing';
import { GuildsService } from '../src/guilds/guilds.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GuildEntity, GuildMemberEntity } from '../src/guilds/guild.entity';

describe('GuildsService', () => {
  let service: GuildsService;

  const mockGuildRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'guild-1', ...e })),
  };

  const mockMemberRepo = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildsService,
        { provide: getRepositoryToken(GuildEntity), useValue: mockGuildRepo },
        { provide: getRepositoryToken(GuildMemberEntity), useValue: mockMemberRepo },
      ],
    }).compile();

    service = module.get<GuildsService>(GuildsService);
  });

  it('should create new guild successfully', async () => {
    const guild = await service.createGuild('user-1', 'Cyber Knights', 'CYBER', 'Top competitive guild');
    expect(guild.name).toBe('Cyber Knights');
    expect(guild.tag).toBe('CYBER');
  });
});
