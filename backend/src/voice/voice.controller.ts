import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('WebRTC Voice Chat')
@Controller('api/voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get('room/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get or initialize active WebRTC voice room' })
  async getRoom(@Param('roomId') roomId: string) {
    return this.voiceService.getOrCreateVoiceRoom(roomId);
  }
}
