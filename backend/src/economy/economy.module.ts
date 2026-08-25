import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EconomyService } from './economy.service';
import { EconomyController } from './economy.controller';
import { PlayerWalletEntity, WalletTransactionEntity } from './economy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerWalletEntity, WalletTransactionEntity])],
  providers: [EconomyService],
  controllers: [EconomyController],
  exports: [EconomyService],
})
export class EconomyModule {}
