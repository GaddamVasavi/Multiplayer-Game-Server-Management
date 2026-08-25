import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatChannel } from './chat.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get chat history by channel' })
  async getChatHistory(
    @Query('channel') channel: ChatChannel = ChatChannel.GLOBAL,
    @Query('roomId') roomId?: string,
    @Query('limit') limit?: number,
  ) {
    const messages = await this.chatService.getRecentMessages(
      channel,
      roomId,
      limit ? Number(limit) : 50,
    );
    return messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      username: m.sender ? m.sender.username : 'Unknown',
      message: m.message,
      channel: m.channel,
      createdAt: m.createdAt,
    }));
  }
}
