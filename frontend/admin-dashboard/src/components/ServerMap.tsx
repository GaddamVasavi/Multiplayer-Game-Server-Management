import React from 'react';
import { Globe, Server, Activity, AlertTriangle } from 'lucide-react';

export interface RegionServerStatus {
  code: string;
  name: string;
  activePlayers: number;
  healthyPods: number;
  totalCapacity: number;
  cpuPct: number;
  memoryPct: number;
  latencyMs: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
}

const mockRegions: RegionServerStatus[] = [
  { code: 'US-EAST', name: 'N. Virginia (US East)', activePlayers: 1450, healthyPods: 8, totalCapacity: 2000, cpuPct: 45, memoryPct: 52, latencyMs: 24, status: 'HEALTHY' },
  { code: 'US-WEST', name: 'Oregon (US West)', activePlayers: 980, healthyPods: 5, totalCapacity: 1500, cpuPct: 62, memoryPct: 58, latencyMs: 42, status: 'HEALTHY' },
  { code: 'EU-CENTRAL', name: 'Frankfurt (Europe)', activePlayers: 2100, healthyPods: 12, totalCapacity: 2500, cpuPct: 88, memoryPct: 81, latencyMs: 38, status: 'WARNING' },
  { code: 'AP-SOUTH', name: 'Mumbai (Asia Pacific)', activePlayers: 620, healthyPods: 3, totalCapacity: 1000, cpuPct: 34, memoryPct: 40, latencyMs: 65, status: 'HEALTHY' },
];

export const ServerMap: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Global Game Server Map</h2>
            <p className="text-xs text-slate-400">Live multi-datacenter health, player load, and capacity telemetry monitor</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockRegions.map((region) => (
          <div key={region.code} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Server className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{region.name}</h3>
                  <span className="text-xs font-mono text-slate-400">{region.code}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                region.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {region.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-2">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Active Players</span>
                <span className="text-cyan-400 font-bold text-sm">{region.activePlayers} / {region.totalCapacity}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">K8s Server Pods</span>
                <span className="text-purple-400 font-bold text-sm">{region.healthyPods} Pods</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">CPU Utilization</span>
                <span className="text-amber-400 font-bold text-sm">{region.cpuPct}%</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Average Latency</span>
                <span className="text-emerald-400 font-bold text-sm">{region.latencyMs} ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
