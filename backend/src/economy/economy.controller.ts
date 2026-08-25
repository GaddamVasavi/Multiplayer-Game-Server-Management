import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EconomyService } from './economy.service';
import { TransactionType } from './economy.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Virtual Economy & Wallet')
@Controller('api/economy')
export class EconomyController {
  constructor(private readonly economyService: EconomyService) {}

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user virtual wallet balances' })
  async getMyWallet(@Request() req: any) {
    return this.economyService.getOrCreateWallet(req.user.userId);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wallet transaction history audit log' })
  async getTransactions(@Request() req: any) {
    return this.economyService.getTransactionHistory(req.user.userId);
  }

  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deposit virtual currency into player wallet' })
  async deposit(
    @Request() req: any,
    @Body('amount') amount: number,
    @Body('description') description: string,
  ) {
    return this.economyService.depositCoins(
      req.user.userId,
      amount || 100,
      TransactionType.MATCH_REWARD,
      undefined,
      description || 'Match reward payout',
    );
  }
}
