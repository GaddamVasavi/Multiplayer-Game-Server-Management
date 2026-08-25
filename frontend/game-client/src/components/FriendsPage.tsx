import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, ArrowLeft, Shield } from 'lucide-react';

interface FriendsPageProps {
  onBack: () => void;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({ onBack }) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('nexus_jwt_token');

  const fetchFriends = async () => {
    try {
      if (token) {
        const res = await axios.get('/api/friends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch friends list', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameToAdd) return;
    try {
      await axios.post(
        '/api/friends/request',
        { username: usernameToAdd },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert('Friend request sent!');
      setUsernameToAdd('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send request.');
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

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Friends & Network</h2>
            <p className="text-xs text-slate-400">Manage your player friends list and send arena party invites</p>
          </div>
        </div>

        <form onSubmit={handleSendRequest} className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Add player username..."
            value={usernameToAdd}
            onChange={(e) => setUsernameToAdd(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none w-full md:w-56"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shrink-0 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading Friends List...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((f) => (
            <div key={f.userId} className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  {f.displayName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs flex items-center">
                    <Shield className="w-3.5 h-3.5 text-cyan-400 mr-1" /> {f.displayName}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">ELO: {f.eloRating}</p>
                </div>
              </div>

              <span className={`text-xs font-mono font-bold ${f.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                {f.isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
