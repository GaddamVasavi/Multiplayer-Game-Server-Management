import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Film, ArrowLeft, Play, Pause, FastForward, RotateCcw } from 'lucide-react';

interface ReplayViewerPageProps {
  onBack: () => void;
}

export const ReplayViewerPage: React.FC<ReplayViewerPageProps> = ({ onBack }) => {
  const [replays, setReplays] = useState<any[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<any>(null);
  const [currentTick, setCurrentTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('nexus_jwt_token');

  useEffect(() => {
    axios
      .get('/api/replays')
      .then((res) => {
        setReplays(res.data);
        if (res.data.length > 0) {
          fetchReplayDetails(res.data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchReplayDetails = async (id: string) => {
    try {
      if (token) {
        const res = await axios.get(`/api/replays/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedReplay(res.data);
        setCurrentTick(0);
      }
    } catch (e) {
      console.error('Failed to load replay details', e);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying && selectedReplay && selectedReplay.ticks) {
      timer = setInterval(() => {
        setCurrentTick((prev) => {
          if (prev >= selectedReplay.ticks.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedReplay]);

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
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Match Replay Studio</h2>
            <p className="text-xs text-slate-400">Review 20 Ticks/sec match history recordings with playback scrubber</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading Match Replays...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm">Recent Match Replays</h3>
            {replays.map((r) => (
              <div
                key={r.id}
                onClick={() => fetchReplayDetails(r.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                  selectedReplay?.id === r.id ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <h4 className="font-bold text-slate-100">Room: {r.roomId}</h4>
                <p className="text-xs text-slate-400 mt-1">Duration: {r.durationSeconds}s ({r.totalTicks} Ticks)</p>
              </div>
            ))}
          </div>

          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 text-center">
            <div className="aspect-video bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
              <div className="text-center font-mono space-y-2">
                <span className="text-cyan-400 font-bold text-lg">REPLAY TICK PLAYBACK</span>
                <p className="text-xs text-slate-500">Tick: {currentTick} / {selectedReplay?.ticks?.length || 0}</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setCurrentTick(0)}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center space-x-2 shadow-lg"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
              <button
                onClick={() => setCurrentTick((prev) => Math.min((selectedReplay?.ticks?.length || 1) - 1, prev + 10))}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400"
              >
                <FastForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
