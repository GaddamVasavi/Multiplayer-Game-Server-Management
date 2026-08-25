import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Global Regions Management')
@Controller('api/regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of active global server regions' })
  async getRegions() {
    return this.regionsService.getAllRegions();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register new global server region' })
  async createRegion(
    @Body('code') code: string,
    @Body('name') name: string,
    @Body('datacenterLocation') datacenterLocation: string,
    @Body('maxCapacityPlayers') maxCapacityPlayers?: number,
  ) {
    return this.regionsService.registerRegion(code, name, datacenterLocation, maxCapacityPlayers);
  }

  @Post(':id/maintenance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle region maintenance mode' })
  async toggleMaintenance(
    @Param('id') id: string,
    @Body('isMaintenanceMode') isMaintenanceMode: boolean,
  ) {
    return this.regionsService.setMaintenanceMode(id, isMaintenanceMode);
  }
}
