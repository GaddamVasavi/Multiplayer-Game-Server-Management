import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { VoiceService } from './voice.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/voice',
})
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VoiceGateway.name);

  constructor(private readonly voiceService: VoiceService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Voice RTC socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Voice RTC socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('JOIN_VOICE_CHANNEL')
  async handleJoinVoice(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    client.join(`voice:${data.roomId}`);
    await this.voiceService.joinVoiceRoom(data.roomId, data.userId);
    client.to(`voice:${data.roomId}`).emit('VOICE_USER_JOINED', { userId: data.userId, socketId: client.id });
    return { status: 'JOINED_VOICE', roomId: data.roomId };
  }

  @SubscribeMessage('WEBRTC_SIGNAL')
  handleWebRtcSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetSocketId: string; signal: any; senderUserId: string },
  ) {
    this.server.to(data.targetSocketId).emit('WEBRTC_SIGNAL', {
      senderSocketId: client.id,
      senderUserId: data.senderUserId,
      signal: data.signal,
    });
  }
}
