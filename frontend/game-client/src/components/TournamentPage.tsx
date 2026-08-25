import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, ArrowLeft, Trophy, Users, Play } from 'lucide-react';

interface TournamentPageProps {
  onBack: () => void;
}

export const TournamentPage: React.FC<TournamentPageProps> = ({ onBack }) => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [bracket, setBracket] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/tournaments')
      .then((res) => {
        setTournaments(res.data);
        if (res.data.length > 0) {
          setSelectedTournament(res.data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      axios
        .get(`/api/tournaments/${selectedTournament.id}/bracket`)
        .then((res) => setBracket(res.data))
        .catch(() => {});
    }
  }, [selectedTournament]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-2 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Lobby</span>
      </button>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/30 text-purple-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Tournament Brackets Engine</h2>
            <p className="text-xs text-slate-400">Single elimination tournaments with real-time bracket round advancement</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading Tournament Brackets...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm">Active Tournaments</h3>
            {tournaments.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTournament(t)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                  selectedTournament?.id === t.id ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <h4 className="font-bold text-slate-100">{t.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                <div className="flex items-center justify-between mt-2 font-mono">
                  <span className="text-amber-400">{t.prizePoolCoins} Coins</span>
                  <span className="text-emerald-400">{t.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">{selectedTournament?.name} — Bracket Tree</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {bracket.length > 0 ? (
                bracket.map((match) => (
                  <div key={match.id} className="glass-card p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between font-mono text-slate-400 border-b border-slate-800 pb-1">
                      <span>Round {match.roundNumber}</span>
                      <span>Match #{match.matchNumber}</span>
                    </div>
                    <div className={`p-2 rounded-lg flex justify-between ${match.winnerId === match.player1Id ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-900 text-slate-300'}`}>
                      <span>{match.player1?.username || 'TBD'}</span>
                    </div>
                    <div className={`p-2 rounded-lg flex justify-between ${match.winnerId === match.player2Id ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-900 text-slate-300'}`}>
                      <span>{match.player2?.username || 'TBD'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center text-slate-400 font-mono text-xs">
                  No active matches in bracket yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
