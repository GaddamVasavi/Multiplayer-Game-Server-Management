import { Test, TestingModule } from '@nestjs/testing';
import { EconomyService } from '../src/economy/economy.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerWalletEntity, WalletTransactionEntity, TransactionType } from '../src/economy/economy.entity';

describe('EconomyService', () => {
  let service: EconomyService;

  const mockWalletRepo = {
    findOne: jest.fn().mockResolvedValue({ id: 'wallet-1', userId: 'user-1', balanceCoins: 1000, balanceGems: 50 }),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'wallet-1', ...e })),
  };

  const mockTxRepo = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'tx-1', ...e })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EconomyService,
        { provide: getRepositoryToken(PlayerWalletEntity), useValue: mockWalletRepo },
        { provide: getRepositoryToken(WalletTransactionEntity), useValue: mockTxRepo },
      ],
    }).compile();

    service = module.get<EconomyService>(EconomyService);
  });

  it('should deposit coins and update wallet balance', async () => {
    const wallet = await service.depositCoins('user-1', 500, TransactionType.MATCH_REWARD);
    expect(wallet.balanceCoins).toBe(1500);
  });

  it('should deduct coins when balance sufficient', async () => {
    const wallet = await service.deductCoins('user-1', 200, TransactionType.SHOP_PURCHASE);
    expect(wallet.balanceCoins).toBe(800);
  });
});
