import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  MATCH_REWARD = 'MATCH_REWARD',
  SHOP_PURCHASE = 'SHOP_PURCHASE',
  REFUND = 'REFUND',
}

@Entity('player_wallets')
export class PlayerWalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'balance_coins', type: 'bigint', default: 1000 })
  balanceCoins: number;

  @Column({ name: 'balance_gems', type: 'integer', default: 50 })
  balanceGems: number;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('wallet_transactions')
export class WalletTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => PlayerWalletEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: PlayerWalletEntity;

  @Column({ name: 'amount', type: 'integer' })
  amount: number;

  @Column({
    type: 'varchar',
    length: 30,
    default: TransactionType.MATCH_REWARD,
  })
  transactionType: TransactionType;

  @Column({ name: 'reference_id', length: 100, nullable: true })
  referenceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
