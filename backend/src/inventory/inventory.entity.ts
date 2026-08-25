import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';

export enum ItemCategory {
  SKIN = 'SKIN',
  TRAIL = 'TRAIL',
  AVATAR = 'AVATAR',
  EMOTE = 'EMOTE',
}

@Entity('shop_items')
export class ShopItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 64 })
  sku: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ItemCategory.SKIN,
  })
  category: ItemCategory;

  @Column({ name: 'price_coins', default: 500 })
  priceCoins: number;

  @Column({ name: 'rarity', length: 20, default: 'RARE' })
  rarity: string;

  @Column({ name: 'hex_color', length: 10, default: '#06b6d4' })
  hexColor: string;
}

@Entity('user_inventory')
@Unique(['userId', 'itemId'])
export class UserInventoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'item_id' })
  itemId: string;

  @ManyToOne(() => ShopItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: ShopItemEntity;

  @Column({ name: 'is_equipped', default: false })
  isEquipped: boolean;

  @CreateDateColumn({ name: 'purchased_at' })
  purchasedAt: Date;
}
