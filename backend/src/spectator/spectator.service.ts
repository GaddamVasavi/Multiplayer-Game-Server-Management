export interface SpectatorStreamSession {
  matchId: string;
  streamId: string;
  activeSpectatorCount: number;
  broadcastDelayMs: number; // e.g. 3000ms delay to prevent cheating
  bufferQueue: Array<{
    tick: number;
    timestamp: number;
    gameStateDelta: Record<string, any>;
  }>;
  spectators: Map<string, { userId: string; joinedAt: number; latencyMs: number }>;
}

export class SpectatorService {
  private sessions: Map<string, SpectatorStreamSession> = new Map();

  public createStreamSession(matchId: string, broadcastDelayMs: number = 3000): SpectatorStreamSession {
    const session: SpectatorStreamSession = {
      matchId,
      streamId: `stream-${matchId}-${Date.now()}`,
      activeSpectatorCount: 0,
      broadcastDelayMs,
      bufferQueue: [],
      spectators: new Map(),
    };
    this.sessions.set(matchId, session);
    return session;
  }

  public enqueueTickFrame(matchId: string, tick: number, gameStateDelta: Record<string, any>): void {
    const session = this.sessions.get(matchId);
    if (!session) return;

    session.bufferQueue.push({
      tick,
      timestamp: Date.now(),
      gameStateDelta,
    });

    // Keep buffer bounded
    if (session.bufferQueue.length > 500) {
      session.bufferQueue.shift();
    }
  }

  public getDelayedTickFrames(matchId: string): Array<{ tick: number; gameStateDelta: Record<string, any> }> {
    const session = this.sessions.get(matchId);
    if (!session) return [];

    const cutoffTime = Date.now() - session.broadcastDelayMs;
    return session.bufferQueue
      .filter(frame => frame.timestamp <= cutoffTime)
      .map(f => ({ tick: f.tick, gameStateDelta: f.gameStateDelta }));
  }

  public addSpectator(matchId: string, spectatorId: string, userId: string): boolean {
    const session = this.sessions.get(matchId);
    if (!session) return false;

    session.spectators.set(spectatorId, {
      userId,
      joinedAt: Date.now(),
      latencyMs: 0,
    });
    session.activeSpectatorCount = session.spectators.size;
    return true;
  }

  public removeSpectator(matchId: string, spectatorId: string): void {
    const session = this.sessions.get(matchId);
    if (!session) return;

    session.spectators.delete(spectatorId);
    session.activeSpectatorCount = session.spectators.size;
  }

  public getSession(matchId: string): SpectatorStreamSession | undefined {
    return this.sessions.get(matchId);
  }
}
