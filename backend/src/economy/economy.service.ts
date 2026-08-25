import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerWalletEntity, WalletTransactionEntity, TransactionType } from './economy.entity';

@Injectable()
export class EconomyService {
  private readonly logger = new Logger(EconomyService.name);

  constructor(
    @InjectRepository(PlayerWalletEntity)
    private readonly walletRepository: Repository<PlayerWalletEntity>,
    @InjectRepository(WalletTransactionEntity)
    private readonly transactionRepository: Repository<WalletTransactionEntity>,
  ) {}

  async getOrCreateWallet(userId: string): Promise<PlayerWalletEntity> {
    let wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        balanceCoins: 1000,
        balanceGems: 50,
      });
      wallet = await this.walletRepository.save(wallet);
      this.logger.log(`Initialized virtual wallet for player ${userId}`);
    }
    return wallet;
  }

  async depositCoins(userId: string, amount: number, type: TransactionType, referenceId?: string, description?: string): Promise<PlayerWalletEntity> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.balanceCoins = Number(wallet.balanceCoins) + amount;
    const updated = await this.walletRepository.save(wallet);

    const tx = this.transactionRepository.create({
      walletId: wallet.id,
      amount,
      transactionType: type,
      referenceId,
      description,
    });
    await this.transactionRepository.save(tx);

    this.logger.log(`Wallet ${wallet.id} deposited +${amount} coins [Type: ${type}]`);
    return updated;
  }

  async deductCoins(userId: string, amount: number, type: TransactionType, referenceId?: string, description?: string): Promise<PlayerWalletEntity> {
    const wallet = await this.getOrCreateWallet(userId);
    if (Number(wallet.balanceCoins) < amount) {
      throw new BadRequestException(`Insufficient wallet balance. Available: ${wallet.balanceCoins}, Required: ${amount}`);
    }

    wallet.balanceCoins = Number(wallet.balanceCoins) - amount;
    const updated = await this.walletRepository.save(wallet);

    const tx = this.transactionRepository.create({
      walletId: wallet.id,
      amount: -amount,
      transactionType: type,
      referenceId,
      description,
    });
    await this.transactionRepository.save(tx);

    this.logger.log(`Wallet ${wallet.id} deducted -${amount} coins [Type: ${type}]`);
    return updated;
  }

  async getTransactionHistory(userId: string): Promise<WalletTransactionEntity[]> {
    const wallet = await this.getOrCreateWallet(userId);
    return this.transactionRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
