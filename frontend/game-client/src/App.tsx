import React from 'react';
import { Shield, Server, Activity, Cpu } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6">
      <header className="glass-panel rounded-2xl p-4 px-6 flex items-center justify-between border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl glow-cyan">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Nexus Arena OS
            </h1>
            <p className="text-xs text-slate-400">Intelligent Game Server & Predictive Auto-Scaler</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM ONLINE</span>
          </span>
        </div>
      </header>

      <main className="my-auto max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
          <Cpu className="w-4 h-4" />
          <span>PHASE 1: ARCHITECTURE & BASE PLATFORM READY</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Next-Gen AI Game Server Management
        </h2>

        <p className="text-slate-400 max-w-2xl mx-auto text-base">
          Real-time 2-10 player arena gameplay powered by NestJS microservices, Phaser 3 physics, FastAPI predictive AI player forecasting, and autonomous Kubernetes auto-scaling.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="glass-card p-6 rounded-2xl text-left border border-slate-800 hover:border-cyan-500/50 transition-all">
            <Server className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-200">Stateful Game Servers</h3>
            <p className="text-sm text-slate-400 mt-1">Authoritative Socket.IO tick loop with 20 Ticks/sec physics synchronization.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl text-left border border-slate-800 hover:border-purple-500/50 transition-all">
            <Activity className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-200">AI Traffic Prediction</h3>
            <p className="text-sm text-slate-400 mt-1">Prophet & LSTM models forecasting player spikes before server overload occurs.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl text-left border border-slate-800 hover:border-emerald-500/50 transition-all">
            <Shield className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-200">Kubernetes Auto-Scaler</h3>
            <p className="text-sm text-slate-400 mt-1">Self-healing microservice clusters scaling pod counts based on AI recommendations.</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500">
        &copy; 2026 Nexus Arena AI Game DevOps Platform. Built with React, NestJS, FastAPI & Kubernetes.
      </footer>
    </div>
  );
}
