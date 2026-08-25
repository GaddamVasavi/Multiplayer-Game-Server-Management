import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { ShopItemEntity, UserInventoryEntity } from './inventory.entity';
import { PlayerProfileEntity } from '../database/entities/player-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopItemEntity, UserInventoryEntity, PlayerProfileEntity]),
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
