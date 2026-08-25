import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from '../src/inventory/inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShopItemEntity, UserInventoryEntity } from '../src/inventory/inventory.entity';
import { PlayerProfileEntity } from '../src/database/entities/player-profile.entity';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockShopRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'item-1', name: 'Cyber Neon Skin', priceCoins: 500 }),
  };

  const mockInvRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'inv-1', ...e })),
  };

  const mockProfileRepo = {
    findOne: jest.fn().mockResolvedValue({ userId: 'user-1', totalScore: 1000 }),
    save: jest.fn().mockImplementation((p) => Promise.resolve(p)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(ShopItemEntity), useValue: mockShopRepo },
        { provide: getRepositoryToken(UserInventoryEntity), useValue: mockInvRepo },
        { provide: getRepositoryToken(PlayerProfileEntity), useValue: mockProfileRepo },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should purchase shop item successfully when balance sufficient', async () => {
    const item = await service.purchaseItem('user-1', 'item-1');
    expect(item.userId).toBe('user-1');
    expect(item.itemId).toBe('item-1');
  });
});
