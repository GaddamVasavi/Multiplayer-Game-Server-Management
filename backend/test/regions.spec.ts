import { Test, TestingModule } from '@nestjs/testing';
import { RegionsService } from '../src/regions/regions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegionEntity, GameServerInventoryEntity } from '../src/regions/region.entity';

describe('RegionsService', () => {
  let service: RegionsService;

  const mockRegionRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'reg-1', ...e })),
  };

  const mockServerRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionsService,
        { provide: getRepositoryToken(RegionEntity), useValue: mockRegionRepo },
        { provide: getRepositoryToken(GameServerInventoryEntity), useValue: mockServerRepo },
      ],
    }).compile();

    service = module.get<RegionsService>(RegionsService);
  });

  it('should register a new global region', async () => {
    const region = await service.registerRegion('SA-EAST', 'Sao Paulo (South America)', 'sa-east-1', 2000);
    expect(region.code).toBe('SA-EAST');
    expect(region.name).toBe('Sao Paulo (South America)');
  });
});
