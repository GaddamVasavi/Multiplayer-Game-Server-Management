import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, ArrowLeft, CheckCircle, Gift } from 'lucide-react';

interface AchievementsPageProps {
  onBack: () => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onBack }) => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('nexus_jwt_token');

  const fetchAchievements = async () => {
    try {
      if (token) {
        const res = await axios.get('/api/achievements', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAchievements(res.data);
      }
    } catch (e) {
      console.error('Failed to load achievements', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleClaim = async (id: string) => {
    try {
      const res = await axios.post(
        `/api/achievements/claim/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(`Claimed +${res.data.rewardXp} XP reward!`);
      fetchAchievements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Claim failed');
    }
  };

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
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Player Badges & Achievements</h2>
            <p className="text-xs text-slate-400">Complete arena milestones to unlock custom badges and bonus rewards</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading Achievements...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((item) => (
            <div key={item.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${item.isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-600'}`}>
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{item.achievement?.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.achievement?.description}</p>
                  <p className="text-xs font-mono text-cyan-400 mt-1">
                    Progress: {item.currentProgress} / {item.achievement?.targetValue}
                  </p>
                </div>
              </div>

              <div>
                {item.isClaimed ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> CLAIMED
                  </span>
                ) : item.isUnlocked ? (
                  <button
                    onClick={() => handleClaim(item.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-md flex items-center space-x-1"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>CLAIM</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-slate-500">LOCKED</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
