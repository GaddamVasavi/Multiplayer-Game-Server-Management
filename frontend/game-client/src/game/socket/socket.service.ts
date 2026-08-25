import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token?: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:4000/game';
    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to Game Server Socket:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[SocketService] Disconnected from Game Server:', reason);
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
