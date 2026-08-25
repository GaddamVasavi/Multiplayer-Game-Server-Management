import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Real-Time Scheduled Events')
@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get list of active live game events & XP multipliers' })
  async getActive() {
    return this.eventsService.getActiveEvents();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule new live seasonal event' })
  async createEvent(
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('multiplierXp') multiplierXp?: number,
    @Body('durationDays') durationDays?: number,
  ) {
    return this.eventsService.createEvent(title, description, multiplierXp, durationDays);
  }
}
