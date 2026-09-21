/**
 * Hackathon Judge & Presenter Demo Control Bar
 * FormFit AI — iQOO Hackathon 2026 Hyderabad
 */

import React from 'react';
import { Sparkles, Play, ShieldAlert, CheckCircle, ChevronRight, Zap } from 'lucide-react';
import { DemoScenario } from '../ai/demoData';

interface Props {
  isDemoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
  activeScenario: DemoScenario;
  onSelectScenario: (scenario: DemoScenario) => void;
  onTriggerScene: (sceneNum: number) => void;
  currentScene: number;
}

export const HackathonDemoBar: React.FC<Props> = ({
  isDemoMode,
  onToggleDemoMode,
  activeScenario,
  onSelectScenario,
  onTriggerScene,
  currentScene,
}) => {
  return (
    <div className="w-full bg-slate-900/95 border-b border-slate-800 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg backdrop-blur-md z-40">
      
      {/* Brand & Mode Switch */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 font-bold">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>iQOO 2026 Pitch Suite</span>
        </div>

        <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
          <button
            id="mode-real-ai-btn"
            onClick={() => onToggleDemoMode(false)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
              !isDemoMode ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Real Camera AI
          </button>
          <button
            id="mode-demo-btn"
            onClick={() => onToggleDemoMode(true)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
              isDemoMode ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Demo Presets
          </button>
        </div>
      </div>

      {/* Scenario shortcuts when in Demo Mode */}
      {isDemoMode && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
          <span className="text-[10px] text-slate-400 font-semibold uppercase shrink-0">Simulate:</span>
          
          <button
            onClick={() => onSelectScenario('perfect_squat')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 flex items-center gap-1 transition cursor-pointer ${
              activeScenario === 'perfect_squat'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Clean Squat</span>
          </button>

          <button
            onClick={() => onSelectScenario('knee_valgus_squat')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 flex items-center gap-1 transition cursor-pointer ${
              activeScenario === 'knee_valgus_squat'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Knee Valgus Error</span>
          </button>

          <button
            onClick={() => onSelectScenario('excessive_torso_lean_squat')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 flex items-center gap-1 transition cursor-pointer ${
              activeScenario === 'excessive_torso_lean_squat'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Torso Lean Error</span>
          </button>

          <button
            onClick={() => onSelectScenario('shallow_squat')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 transition cursor-pointer ${
              activeScenario === 'shallow_squat'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Shallow Depth</span>
          </button>

          <button
            onClick={() => onSelectScenario('low_confidence_squat')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 transition cursor-pointer ${
              activeScenario === 'low_confidence_squat'
                ? 'bg-slate-600/40 text-slate-200 border border-slate-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Low Visibility</span>
          </button>

          <button
            onClick={() => onSelectScenario('pushup_normal')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 transition cursor-pointer ${
              activeScenario === 'pushup_normal'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Push-Up</span>
          </button>
        </div>
      )}

      {/* 3-Minute Hackathon Demo Script Quick Guide */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="text-slate-400 hidden sm:inline">Pitch Stage:</span>
        <button
          onClick={() => onTriggerScene((currentScene % 5) + 1)}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md flex items-center gap-1 transition cursor-pointer font-semibold"
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Scene {currentScene}: {
            currentScene === 1 ? 'Select Exercise' :
            currentScene === 2 ? 'Place Phone' :
            currentScene === 3 ? 'Good Reps' :
            currentScene === 4 ? 'Form Fault Voice Alert' : 'Fingerprint Score'
          }</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>

    </div>
  );
};
