import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ArrowLeft, Plus, CheckCircle, Shield } from 'lucide-react';

interface PartyPageProps {
  onBack: () => void;
}

export const PartyPage: React.FC<PartyPageProps> = ({ onBack }) => {
  const [party, setParty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('nexus_jwt_token');

  const fetchParty = async () => {
    try {
      if (token) {
        const res = await axios.get('/api/party/my-party', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setParty(res.data);
      }
    } catch (e) {
      console.error('Failed to load party', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParty();
  }, []);

  const handleCreateParty = async () => {
    try {
      await axios.post(
        '/api/party/create',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchParty();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create party.');
    }
  };

  const handleLeaveParty = async () => {
    try {
      await axios.post(
        '/api/party/leave',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setParty(null);
    } catch (e) {
      console.error('Failed to leave party', e);
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
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/30 text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Party Lobby Group</h2>
            <p className="text-xs text-slate-400">Form a team of up to 4 players to queue together into arena matches</p>
          </div>
        </div>

        {!party && (
          <button
            onClick={handleCreateParty}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Party</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading Party Status...</div>
      ) : party ? (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Active Party Group</h3>
              <p className="text-xs text-slate-400">Party ID: {party.id}</p>
            </div>
            <button
              onClick={handleLeaveParty}
              className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold text-xs hover:bg-rose-500/30 transition"
            >
              Leave Party
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {party.members?.map((m: any) => (
              <div key={m.id} className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                    {m.user?.username ? m.user.username.substring(0, 2).toUpperCase() : 'PA'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs flex items-center">
                      <Shield className="w-3.5 h-3.5 text-purple-400 mr-1" /> {m.user?.username}
                      {m.userId === party.leaderId && <span className="ml-2 text-amber-400 text-[10px] font-mono">[LEADER]</span>}
                    </h4>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> READY
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-400 font-mono text-sm">
          You are not currently in a party group. Click "Create Party" to host a new team.
        </div>
      )}
    </div>
  );
};
