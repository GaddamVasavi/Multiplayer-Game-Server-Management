import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopItemEntity, UserInventoryEntity, ItemCategory } from './inventory.entity';
import { PlayerProfileEntity } from '../database/entities/player-profile.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(ShopItemEntity)
    private readonly shopRepository: Repository<ShopItemEntity>,
    @InjectRepository(UserInventoryEntity)
    private readonly inventoryRepository: Repository<UserInventoryEntity>,
    @InjectRepository(PlayerProfileEntity)
    private readonly profileRepository: Repository<PlayerProfileEntity>,
  ) {}

  async getShopCatalog(): Promise<ShopItemEntity[]> {
    return this.shopRepository.find();
  }

  async getUserInventory(userId: string): Promise<UserInventoryEntity[]> {
    return this.inventoryRepository.find({
      where: { userId },
      relations: ['item'],
    });
  }

  async purchaseItem(userId: string, itemId: string): Promise<UserInventoryEntity> {
    const item = await this.shopRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('Shop item not found');
    }

    const existing = await this.inventoryRepository.findOne({
      where: { userId, itemId },
    });

    if (existing) {
      throw new ConflictException('Item is already owned in inventory');
    }

    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Player profile not found');
    }

    if (Number(profile.totalScore) < item.priceCoins) {
      throw new BadRequestException(`Insufficient coins. Item costs ${item.priceCoins} pts.`);
    }

    profile.totalScore = Number(profile.totalScore) - item.priceCoins;
    await this.profileRepository.save(profile);

    const inventoryItem = this.inventoryRepository.create({
      userId,
      itemId,
      isEquipped: false,
    });

    const saved = await this.inventoryRepository.save(inventoryItem);
    this.logger.log(`Player ${userId} purchased item: ${item.name}`);
    return saved;
  }

  async equipItem(userId: string, itemId: string): Promise<void> {
    const target = await this.inventoryRepository.findOne({
      where: { userId, itemId },
      relations: ['item'],
    });

    if (!target) {
      throw new NotFoundException('Item not owned in inventory');
    }

    // Unequip all items of same category
    const userInventory = await this.getUserInventory(userId);
    for (const inv of userInventory) {
      if (inv.item.category === target.item.category) {
        inv.isEquipped = inv.itemId === itemId;
        await this.inventoryRepository.save(inv);
      }
    }
  }
}
