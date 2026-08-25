import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatChannel } from './chat.entity';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('JOIN_CHANNEL')
  handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { channel: ChatChannel; roomId?: string },
  ) {
    const roomName = payload.roomId ? `chat-${payload.channel}-${payload.roomId}` : `chat-${payload.channel}`;
    client.join(roomName);
    client.emit('JOINED_CHANNEL_SUCCESS', { channel: payload.channel, roomName });
  }

  @SubscribeMessage('SEND_MESSAGE')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { senderId: string; username: string; message: string; channel: ChatChannel; roomId?: string },
  ) {
    const savedMsg = await this.chatService.saveMessage(
      payload.senderId,
      payload.message,
      payload.channel,
      payload.roomId,
    );

    const roomName = payload.roomId ? `chat-${payload.channel}-${payload.roomId}` : `chat-${payload.channel}`;

    this.server.to(roomName).emit('NEW_MESSAGE', {
      id: savedMsg.id,
      senderId: payload.senderId,
      username: payload.username,
      message: savedMsg.message,
      channel: payload.channel,
      createdAt: savedMsg.createdAt,
    });
  }
}
