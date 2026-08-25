import { useState, useEffect, useRef } from 'react';
import { Shield, Trophy, RefreshCw } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { Lobby } from './components/Lobby';
import { GameCanvas } from './components/GameCanvas';
import { ProfilePage } from './components/ProfilePage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { DevOpsDashboardPage } from './components/DevOpsDashboardPage';
import { ShopPage } from './components/ShopPage';
import { AchievementsPage } from './components/AchievementsPage';
import { TournamentPage } from './components/TournamentPage';
import { FriendsPage } from './components/FriendsPage';
import { PartyPage } from './components/PartyPage';
import { socketService } from './game/socket/socket.service';
import { ArenaScene } from './game/scenes/ArenaScene';
import axios from 'axios';

type ViewMode = 'LOBBY' | 'PROFILE' | 'LEADERBOARD' | 'DEVOPS' | 'SHOP' | 'ACHIEVEMENTS' | 'TOURNAMENT' | 'FRIENDS' | 'PARTY';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_jwt_token'));
  const [view, setView] = useState<ViewMode>('LOBBY');
  const [inQueue, setInQueue] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const sceneRef = useRef<ArenaScene | null>(null);

  // Validate existing stored token
  useEffect(() => {
    if (token) {
      axios
        .get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('nexus_jwt_token');
          setToken(null);
        });
    }
  }, [token]);

  // Connect socket upon login
  useEffect(() => {
    if (user && token) {
      const socket = socketService.connect(token);

      socket.on('MATCHMAKING_QUEUED', () => setInQueue(true));

      socket.on('MATCH_FOUND', (data: { roomId: string; players: any[]; collectibles: any[] }) => {
        setInQueue(false);
        setCurrentRoom(data.roomId);
        setScores(data.players);
      });

      socket.on('TICK_UPDATE', (data: { roomId: string; players: any[]; collectibles: any[] }) => {
        setScores(data.players);
        if (sceneRef.current) {
          sceneRef.current.updatePlayersState(data.players);
          sceneRef.current.updateCollectiblesState(data.collectibles);
        }
      });

      socket.on('MATCH_ENDED', (data: { roomId: string; finalScores: any[] }) => {
        alert(`MATCH COMPLETED!\nWinner: ${data.finalScores[0]?.username} with ${data.finalScores[0]?.score} points!`);
        setCurrentRoom(null);
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [user, token]);

  const handleJoinQueue = () => {
    const socket = socketService.getSocket();
    if (socket && user) {
      socket.emit('JOIN_MATCHMAKING', {
        userId: user.id,
        username: user.username,
        eloRating: user.eloRating,
      });
      setInQueue(true);
    }
  };

  const handleLeaveQueue = () => {
    setInQueue(false);
  };

  const handleMoveInput = (dx: number, dy: number) => {
    const socket = socketService.getSocket();
    if (socket && currentRoom && user) {
      socket.emit('PLAYER_INPUT', {
        roomId: currentRoom,
        userId: user.id,
        dx,
        dy,
        dt: 0.05,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_jwt_token');
    setToken(null);
    setUser(null);
    setCurrentRoom(null);
    socketService.disconnect();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 md:p-6">
      {/* Header */}
      <header className="glass-panel rounded-2xl p-4 px-6 flex items-center justify-between border border-slate-800">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('LOBBY')}>
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl glow-cyan">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Nexus Arena OS
            </h1>
            <p className="text-xs text-slate-400">Intelligent Game Server & Predictive Auto-Scaler</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{currentRoom ? `IN MATCH: ${currentRoom}` : 'ONLINE'}</span>
            </span>
          </div>
        )}
      </header>

      {/* Main View Switcher */}
      <main className="my-auto py-6">
        {!user || !token ? (
          <AuthModal onSuccess={(u, t) => { setUser(u); setToken(t); }} />
        ) : currentRoom ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="lg:col-span-3">
              <GameCanvas onMove={handleMoveInput} sceneRef={sceneRef} />
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-200 text-sm flex items-center mb-3">
                  <Trophy className="w-4 h-4 text-amber-400 mr-2" /> Live Match Leaderboard
                </h3>
                <div className="space-y-2">
                  {scores.map((p, idx) => (
                    <div
                      key={p.userId}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                        p.userId === user.id ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-400">#{idx + 1}</span>
                        <span className="font-semibold">{p.username}</span>
                      </div>
                      <span className="font-bold text-amber-400">{p.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentRoom(null)}
                className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Leave Arena Room</span>
              </button>
            </div>
          </div>
        ) : view === 'PROFILE' ? (
          <ProfilePage user={user} onBack={() => setView('LOBBY')} />
        ) : view === 'LEADERBOARD' ? (
          <LeaderboardPage onBack={() => setView('LOBBY')} />
        ) : view === 'DEVOPS' ? (
          <DevOpsDashboardPage onBack={() => setView('LOBBY')} />
        ) : view === 'SHOP' ? (
          <ShopPage user={user} onBack={() => setView('LOBBY')} />
        ) : view === 'ACHIEVEMENTS' ? (
          <AchievementsPage onBack={() => setView('LOBBY')} />
        ) : view === 'TOURNAMENT' ? (
          <TournamentPage onBack={() => setView('LOBBY')} />
        ) : view === 'FRIENDS' ? (
          <FriendsPage onBack={() => setView('LOBBY')} />
        ) : view === 'PARTY' ? (
          <PartyPage onBack={() => setView('LOBBY')} />
        ) : (
          <Lobby
            user={user}
            inQueue={inQueue}
            onJoinQueue={handleJoinQueue}
            onLeaveQueue={handleLeaveQueue}
            onLogout={handleLogout}
            onNavigateProfile={() => setView('PROFILE')}
            onNavigateLeaderboard={() => setView('LEADERBOARD')}
            onNavigateDevOps={() => setView('DEVOPS')}
            onNavigateShop={() => setView('SHOP')}
            onNavigateAchievements={() => setView('ACHIEVEMENTS')}
            onNavigateTournament={() => setView('TOURNAMENT')}
            onNavigateFriends={() => setView('FRIENDS')}
            onNavigateParty={() => setView('PARTY')}
          />
        )}
      </main>

      <footer className="text-center text-xs text-slate-500">
        &copy; 2026 Nexus Arena AI Game DevOps Platform. Built with React, NestJS, Phaser 3 & Socket.IO.
      </footer>
    </div>
  );
}
