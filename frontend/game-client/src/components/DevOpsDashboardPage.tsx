import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Server, Cpu, AlertTriangle, ArrowLeft, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';

interface DevOpsDashboardPageProps {
  onBack: () => void;
}

export const DevOpsDashboardPage: React.FC<DevOpsDashboardPageProps> = ({ onBack }) => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [mode, setMode] = useState<string>('RECOMMENDATION');
  const [loading, setLoading] = useState(false);

  const fetchAIDecisions = async () => {
    setLoading(true);
    try {
      const modeRes = await axios.get('/api/v1/mode');
      setMode(modeRes.data.active_mode);

      const decisionRes = await axios.post('/api/v1/scale-decision', {
        current_pods: 3,
        telemetry_history: [
          { active_players: 40, active_rooms: 4, cpu_usage_pct: 45.0, memory_usage_mb: 280, average_latency_ms: 25 },
          { active_players: 85, active_rooms: 9, cpu_usage_pct: 68.0, memory_usage_mb: 380, average_latency_ms: 38 },
          { active_players: 140, active_rooms: 14, cpu_usage_pct: 88.5, memory_usage_mb: 490, average_latency_ms: 65 },
        ],
      });
      setTelemetry(decisionRes.data);
    } catch (e) {
      console.error('Failed to fetch AI telemetry', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIDecisions();
  }, []);

  const toggleMode = async () => {
    const newMode = mode === 'RECOMMENDATION' ? 'AUTOMATIC' : 'RECOMMENDATION';
    try {
      await axios.post('/api/v1/mode', { mode: newMode });
      setMode(newMode);
    } catch (e) {
      console.error('Failed to toggle scaling mode', e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <button
          onClick={fetchAIDecisions}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/30 text-purple-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">AI Intelligent Auto-Scaling Control Center</h2>
            <p className="text-xs text-slate-400">Real-time metrics, Prophet/LSTM traffic forecasting & Isolation Forest anomaly detection</p>
          </div>
        </div>

        {/* Mode Toggle Button */}
        <button
          onClick={toggleMode}
          className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 flex items-center space-x-3 transition"
        >
          <span className="text-xs font-bold text-slate-300">SCALING MODE:</span>
          <span className={`text-xs font-black font-mono ${mode === 'AUTOMATIC' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {mode}
          </span>
          {mode === 'AUTOMATIC' ? (
            <ToggleRight className="w-6 h-6 text-emerald-400" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-amber-400" />
          )}
        </button>
      </div>

      {/* Metrics & Decision Cards */}
      {telemetry && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Traffic Forecast Card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-cyan-400">
              <Server className="w-6 h-6" />
              <span className="text-xs font-mono font-bold">PROPHET / LSTM</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200">Traffic Forecast</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Current Load:</span>
                <span className="font-bold text-slate-200">{telemetry.forecast?.current_players} players</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">5-Min Forecast:</span>
                <span className="font-bold text-cyan-400">{telemetry.forecast?.predicted_players_5m} players</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">15-Min Forecast:</span>
                <span className="font-bold text-cyan-300">{telemetry.forecast?.predicted_players_15m} players</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Trend:</span>
                <span className="font-bold text-emerald-400">{telemetry.forecast?.trend}</span>
              </div>
            </div>
          </div>

          {/* Anomaly Detection Card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-purple-400">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-xs font-mono font-bold">ISOLATION FOREST</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200">Anomaly Analysis</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Anomaly Status:</span>
                <span className={`font-bold ${telemetry.anomaly_analysis?.is_anomalous ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {telemetry.anomaly_analysis?.is_anomalous ? 'ANOMALY DETECTED' : 'NORMAL'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Anomaly Score:</span>
                <span className="font-mono text-slate-200">{telemetry.anomaly_analysis?.anomaly_score}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Severity:</span>
                <span className="font-bold text-emerald-400">{telemetry.anomaly_analysis?.severity}</span>
              </div>
            </div>
          </div>

          {/* Kubernetes Scaling Target Card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-emerald-400">
              <Cpu className="w-6 h-6" />
              <span className="text-xs font-mono font-bold">K8S CONTROLLER</span>
            </div>
            <h3 className="text-lg font-bold text-slate-200">Scaling Decision</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Action:</span>
                <span className="font-bold text-cyan-400">{telemetry.scaling_decision?.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Current Pods:</span>
                <span className="font-bold text-slate-200">{telemetry.scaling_decision?.current_pods}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Pods:</span>
                <span className="font-bold text-emerald-400">{telemetry.scaling_decision?.target_pods}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Delta Replicas:</span>
                <span className="font-bold text-purple-400">+{telemetry.scaling_decision?.delta_pods}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
