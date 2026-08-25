import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory & Shop')
@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('shop')
  @ApiOperation({ summary: 'Get in-game shop items catalog' })
  async getCatalog() {
    return this.inventoryService.getShopCatalog();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user inventory items' })
  async getMyInventory(@Request() req: any) {
    return this.inventoryService.getUserInventory(req.user.userId);
  }

  @Post('buy/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase shop item using player score coins' })
  async buyItem(@Request() req: any, @Param('itemId') itemId: string) {
    return this.inventoryService.purchaseItem(req.user.userId, itemId);
  }

  @Post('equip/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Equip skin item' })
  async equipItem(@Request() req: any, @Param('itemId') itemId: string) {
    await this.inventoryService.equipItem(req.user.userId, itemId);
    return { status: 'SUCCESS', message: 'Item equipped successfully' };
  }
}
