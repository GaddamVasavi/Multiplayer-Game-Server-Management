import { io, Socket } from 'socket.io-client';

describe('GameGateway WebSocket Integration', () => {
  let socket: Socket;

  beforeAll((done) => {
    socket = io('http://localhost:4000/game', {
      transports: ['websocket'],
      autoConnect: false,
    });
    done();
  });

  afterAll(() => {
    if (socket.connected) {
      socket.disconnect();
    }
  });

  it('should construct WebSocket client connection', () => {
    expect(socket).toBeDefined();
  });
});
