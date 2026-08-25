import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { PartyService } from './party.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Party / Lobby Groups')
@Controller('api/party')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Get('my-party')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user party details' })
  async getMyParty(@Request() req: any) {
    return this.partyService.getPartyByUserId(req.user.userId);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new party group' })
  async createParty(@Request() req: any) {
    return this.partyService.createParty(req.user.userId);
  }

  @Post('join/:partyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join party group by ID' })
  async joinParty(@Request() req: any, @Param('partyId') partyId: string) {
    return this.partyService.joinParty(partyId, req.user.userId);
  }

  @Post('leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave current party group' })
  async leaveParty(@Request() req: any) {
    await this.partyService.leaveParty(req.user.userId);
    return { status: 'SUCCESS', message: 'Left party' };
  }
}
