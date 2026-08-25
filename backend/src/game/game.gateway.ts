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
import { GameService } from './game.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);
  private tickInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly gameService: GameService,
    private readonly matchmakingService: MatchmakingService,
  ) {
    this.startAuthoritativeLoop();
  }

  handleConnection(client: Socket) {
    this.logger.log(`Socket Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.warn(`Socket Client disconnected: ${client.id}`);
    const disconnectedInfo = this.gameService.handleDisconnect(client.id);

    if (disconnectedInfo) {
      this.server.to(disconnectedInfo.roomId).emit('PLAYER_DISCONNECTED', {
        userId: disconnectedInfo.userId,
        message: 'Player disconnected. Reconnect grace period active (15s).',
      });
    }
  }

  @SubscribeMessage('JOIN_MATCHMAKING')
  async handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string; username: string; eloRating: number },
  ) {
    await this.matchmakingService.addToQueue({
      userId: payload.userId,
      username: payload.username,
      eloRating: payload.eloRating || 1200,
      socketId: client.id,
    });

    client.emit('MATCHMAKING_QUEUED', { message: 'Waiting for opponents...' });

    // Trigger matchmaking cycle
    const matches = await this.matchmakingService.findMatches(2, 10);
    for (const match of matches) {
      const roomState = this.gameService.createRoom(match.roomId, match.players);

      for (const player of match.players) {
        const targetSocket = this.server.sockets.sockets.get(player.socketId);
        if (targetSocket) {
          targetSocket.join(match.roomId);
        }
      }

      this.server.to(match.roomId).emit('MATCH_FOUND', {
        roomId: match.roomId,
        players: Array.from(roomState.players.values()),
        collectibles: roomState.collectibles,
      });
    }
  }

  @SubscribeMessage('PLAYER_INPUT')
  handlePlayerInput(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string; dx: number; dy: number; dt: number },
  ) {
    this.gameService.processPlayerInput(payload.roomId, payload.userId, payload.dx, payload.dy, payload.dt || 0.05);
  }

  @SubscribeMessage('RECONNECT_MATCH')
  handleReconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string },
  ) {
    const success = this.gameService.handleReconnect(payload.roomId, payload.userId, client.id);
    if (success) {
      client.join(payload.roomId);
      const room = this.gameService.getRoom(payload.roomId);
      client.emit('RECONNECT_SUCCESS', {
        roomId: payload.roomId,
        players: room ? Array.from(room.players.values()) : [],
        collectibles: room ? room.collectibles : [],
      });
      this.server.to(payload.roomId).emit('PLAYER_RECONNECTED', { userId: payload.userId });
    } else {
      client.emit('RECONNECT_FAILED', { message: 'Session expired or match completed' });
    }
  }

  private startAuthoritativeLoop() {
    // 20 Ticks / sec = 50ms interval
    this.tickInterval = setInterval(() => {
      const activeRooms = this.gameService.getAllActiveRooms();

      for (const room of activeRooms) {
        room.tickCount += 1;
        const playersList = Array.from(room.players.values());

        // Emit Tick Update to all sockets in room
        this.server.to(room.roomId).emit('TICK_UPDATE', {
          roomId: room.roomId,
          tick: room.tickCount,
          players: playersList,
          collectibles: room.collectibles,
          timestamp: Date.now(),
        });

        // Match end condition: after 60 seconds (1200 ticks) or 0 collectibles left
        if (room.tickCount >= 1200) {
          this.server.to(room.roomId).emit('MATCH_ENDED', {
            roomId: room.roomId,
            finalScores: playersList.sort((a, b) => b.score - a.score),
          });
          this.gameService.finishMatch(room.roomId);
        }
      }
    }, 50);
  }
}
