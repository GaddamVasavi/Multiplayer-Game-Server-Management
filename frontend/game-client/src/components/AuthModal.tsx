import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  onSuccess: (userData: any, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { usernameOrEmail: username, password }
        : { username, email, password };

      const res = await axios.post(endpoint, payload);
      const { accessToken, user } = res.data;

      localStorage.setItem('nexus_jwt_token', accessToken);
      onSuccess(user, accessToken);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            {isLogin ? 'Player Authentication' : 'Create Player Profile'}
          </h2>
          <p className="text-sm text-slate-400">Enter Nexus Arena to compete in AI-managed matches</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Username {isLogin && 'or Email'}</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? 'Enter username or email' : 'Choose username'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-slate-200 outline-none transition"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nexus.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-slate-200 outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-slate-200 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg glow-cyan transition transform active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In & Play' : 'Register Account'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-slate-400 hover:text-cyan-400 transition underline"
          >
            {isLogin ? "Don't have an account? Register" : 'Already registered? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
