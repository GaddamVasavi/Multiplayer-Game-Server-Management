import React, { useState } from 'react';
import { Cpu, Calculator, Layers, Zap } from 'lucide-react';

export const ScalingSimulator: React.FC = () => {
  const [expectedPlayers, setExpectedPlayers] = useState(10000);
  const [region, setRegion] = useState('US-EAST');
  const [desiredCpuThreshold, setDesiredCpuThreshold] = useState(70);

  const capacityPerPod = 100;
  const estimatedPods = Math.ceil(expectedPlayers / capacityPerPod);
  const prewarmPods = Math.ceil(estimatedPods * 0.25);
  const estimatedCpu = Math.min(95, Math.round(desiredCpuThreshold * 0.9));
  const estimatedMemory = Math.min(90, Math.round(desiredCpuThreshold * 0.85));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/30 text-purple-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">What-If Capacity Scaling Simulator</h2>
            <p className="text-xs text-slate-400">Simulate expected player load scenarios to calculate pre-warming pod requirements</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-100 text-sm">Simulation Inputs</h3>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Expected Simultaneous Players</label>
            <input
              type="number"
              value={expectedPlayers}
              onChange={(e) => setExpectedPlayers(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:border-cyan-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Datacenter Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:border-cyan-500 outline-none font-mono"
            >
              <option value="US-EAST">US-EAST (N. Virginia)</option>
              <option value="US-WEST">US-WEST (Oregon)</option>
              <option value="EU-CENTRAL">EU-CENTRAL (Frankfurt)</option>
              <option value="AP-SOUTH">AP-SOUTH (Mumbai)</option>
            </select>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center">
            <Zap className="w-4 h-4 text-amber-400 mr-1.5" /> Calculated Scaling Output
          </h3>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Required Server Pods</span>
              <span className="text-cyan-400 font-bold text-sm">{estimatedPods} Pods</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Pre-Warm Buffer</span>
              <span className="text-purple-400 font-bold text-sm">{prewarmPods} Pods</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Estimated CPU Load</span>
              <span className="text-amber-400 font-bold text-sm">{estimatedCpu}%</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Estimated RAM Load</span>
              <span className="text-emerald-400 font-bold text-sm">{estimatedMemory}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
