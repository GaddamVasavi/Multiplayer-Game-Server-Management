import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Search, ArrowLeft, Shield } from 'lucide-react';

interface LeaderboardPageProps {
  onBack: () => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onBack }) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios
      .get('/api/leaderboard?limit=50')
      .then((res) => setPlayers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredPlayers = players.filter((p) =>
    p.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-2 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Lobby</span>
      </button>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Global Player Leaderboard</h2>
            <p className="text-xs text-slate-400">Rankings powered by Redis Sorted Sets and ELO rating</p>
          </div>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading Leaderboard Data...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Player</th>
                <th className="py-4 px-6">ELO Rating</th>
                <th className="py-4 px-6">Wins</th>
                <th className="py-4 px-6">Matches</th>
                <th className="py-4 px-6">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredPlayers.map((p, idx) => (
                <tr key={p.userId} className="hover:bg-slate-900/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-300">#{p.rank || idx + 1}</td>
                  <td className="py-4 px-6 font-semibold text-slate-100 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>{p.displayName}</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-amber-400">{p.eloRating}</td>
                  <td className="py-4 px-6 text-emerald-400 font-semibold">{p.wins}</td>
                  <td className="py-4 px-6 text-slate-300">{p.matchesPlayed}</td>
                  <td className="py-4 px-6 font-mono text-slate-300">{p.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
