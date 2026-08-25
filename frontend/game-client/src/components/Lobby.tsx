import React from 'react';
import { Play, Users, Trophy, Zap, LogOut, Activity, User, ShoppingBag, Award, Shield, UserPlus } from 'lucide-react';

interface LobbyProps {
  user: any;
  inQueue: boolean;
  onJoinQueue: () => void;
  onLeaveQueue: () => void;
  onLogout: () => void;
  onNavigateProfile: () => void;
  onNavigateLeaderboard: () => void;
  onNavigateDevOps: () => void;
  onNavigateShop: () => void;
  onNavigateAchievements: () => void;
  onNavigateTournament: () => void;
  onNavigateFriends: () => void;
  onNavigateParty: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  user,
  inQueue,
  onJoinQueue,
  onLeaveQueue,
  onLogout,
  onNavigateProfile,
  onNavigateLeaderboard,
  onNavigateDevOps,
  onNavigateShop,
  onNavigateAchievements,
  onNavigateTournament,
  onNavigateFriends,
  onNavigateParty,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Player Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-lg">
            {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'PA'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{user?.displayName || user?.username}</h2>
            <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
              <span className="flex items-center text-amber-400 font-semibold">
                <Trophy className="w-3.5 h-3.5 mr-1" /> ELO: {user?.eloRating || 1200}
              </span>
              <span>•</span>
              <span>Matches: {user?.matchesPlayed || 0}</span>
              <span>•</span>
              <span className="text-emerald-400">Wins: {user?.wins || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNavigateProfile}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-1 transition"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={onNavigateFriends}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-1 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Friends</span>
          </button>
          <button
            onClick={onNavigateParty}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-400 text-xs font-semibold flex items-center space-x-1 transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Party</span>
          </button>
          <button
            onClick={onNavigateShop}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-1 transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop</span>
          </button>
          <button
            onClick={onNavigateAchievements}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center space-x-1 transition"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Badges</span>
          </button>
          <button
            onClick={onNavigateTournament}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-400 text-xs font-semibold flex items-center space-x-1 transition"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Brackets</span>
          </button>
          <button
            onClick={onNavigateLeaderboard}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center space-x-1 transition"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={onNavigateDevOps}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-400 text-xs font-semibold flex items-center space-x-1 transition"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>AI DevOps</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center space-x-1 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Matchmaking Action Section */}
      <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-6">
        <div className="inline-flex p-4 bg-cyan-500/10 rounded-3xl border border-cyan-500/30 text-cyan-400 mb-2">
          <Zap className="w-10 h-10 animate-pulse" />
        </div>

        <h3 className="text-3xl font-extrabold tracking-tight">Arena Matchmaking Queue</h3>
        <p className="text-slate-400 max-w-md mx-auto text-sm">
          Matches 2 to 10 players based on ELO skill rating. Intelligent Kubernetes servers auto-scale dynamically to handle traffic bursts.
        </p>

        {inQueue ? (
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-sm">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
              <span>SEARCHING FOR OPPONENTS...</span>
            </div>
            <div>
              <button
                onClick={onLeaveQueue}
                className="px-6 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 font-semibold text-sm transition"
              >
                Cancel Queue
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onJoinQueue}
            className="px-10 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 shadow-2xl glow-cyan transition transform active:scale-95 inline-flex items-center space-x-3"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>FIND MATCH</span>
          </button>
        )}
      </div>

      {/* Game Rules Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-left">
          <Users className="w-6 h-6 text-purple-400 mb-2" />
          <h4 className="font-bold text-slate-200 text-sm">Room Capacity & Physics</h4>
          <p className="text-xs text-slate-400 mt-1">20 Ticks/sec server authoritative loop with speed-capped movement vector validation.</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-left">
          <Trophy className="w-6 h-6 text-amber-400 mb-2" />
          <h4 className="font-bold text-slate-200 text-sm">Competitive ELO System</h4>
          <p className="text-xs text-slate-400 mt-1">Winner gains +25 ELO points; losses deduct 15 points. All statistics persist to PostgreSQL.</p>
        </div>
      </div>
    </div>
  );
};
