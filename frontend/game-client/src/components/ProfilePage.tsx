import React from 'react';
import { User, Trophy, Flame, Shield, ArrowLeft } from 'lucide-react';

interface ProfilePageProps {
  user: any;
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-2 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Lobby</span>
      </button>

      {/* Main Profile Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl glow-cyan">
            {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'PA'}
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-100">{user?.displayName || user?.username}</h2>
            <p className="text-xs text-slate-400 font-mono mt-1">Player ID: {user?.id}</p>
            <div className="flex items-center space-x-3 mt-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center">
                <Trophy className="w-3.5 h-3.5 mr-1.5" /> ELO {user?.eloRating || 1200}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center">
                <Flame className="w-3.5 h-3.5 mr-1.5" /> {user?.wins || 0} Wins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Career Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 uppercase font-mono">Matches Played</p>
          <p className="text-2xl font-extrabold text-slate-100 mt-1">{user?.matchesPlayed || 0}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 uppercase font-mono">Win Rate</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">
            {user?.matchesPlayed > 0 ? ((user.wins / user.matchesPlayed) * 100).toFixed(1) + '%' : '0%'}
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 uppercase font-mono">Total Score</p>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{user?.totalScore || 0}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
          <p className="text-xs text-slate-400 uppercase font-mono">Rank Division</p>
          <p className="text-2xl font-extrabold text-cyan-400 mt-1">
            {user?.eloRating >= 1500 ? 'DIAMOND' : user?.eloRating >= 1350 ? 'GOLD' : 'SILVER'}
          </p>
        </div>
      </div>
    </div>
  );
};
