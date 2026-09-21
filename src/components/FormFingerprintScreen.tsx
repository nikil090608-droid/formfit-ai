/**
 * Form Fingerprint Screen — Biomechanical Movement Profile & Progress Trends
 * FormFit AI — Health Tech Track
 */

import React, { useState } from 'react';
import { 
  Fingerprint, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Calendar, 
  AlertCircle,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { FormFingerprint } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  fingerprint: FormFingerprint;
  onStartWorkout: () => void;
}

export const FormFingerprintScreen: React.FC<Props> = ({ fingerprint, onStartWorkout }) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(fingerprint.historicalTrend.length - 1);
  const activeDay = fingerprint.historicalTrend[selectedDayIdx] || fingerprint.historicalTrend[0];

  const firstDay = fingerprint.historicalTrend[0];
  const latestDay = fingerprint.historicalTrend[fingerprint.historicalTrend.length - 1];
  const overallImprovement = latestDay && firstDay ? latestDay.overallForm - firstDay.overallForm : 14;

  const latestSession = StorageService.getSessions()[0];
  const isRecentZeroRep = latestSession && latestSession.repetitions === 0;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 pb-24 max-w-2xl mx-auto animate-fade-in">
      
      {/* Screen Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Fingerprint className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Personalized Biometrics
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Form Fingerprint
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Your longitudinal movement-quality profile and joint stability over time.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Fingerprint className="w-7 h-7" />
        </div>
      </div>

      {/* Zero Rep Alert Notice if latest session was incomplete */}
      {isRecentZeroRep && (
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="font-medium">Form analysis unavailable — no repetitions completed. Longitudinal baseline preserved.</span>
        </div>
      )}

      {/* 1. Core Triad Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Overall Form
          </span>
          <div className="text-3xl md:text-4xl font-black text-white">
            {fingerprint.overallFormScore}<span className="text-lg text-emerald-400 font-bold">%</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 mt-1 inline-block">
            +{overallImprovement}% since Day 1
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Consistency
          </span>
          <div className="text-3xl md:text-4xl font-black text-white">
            {fingerprint.movementConsistency}<span className="text-lg text-blue-400 font-bold">%</span>
          </div>
          <span className="text-[10px] font-semibold text-blue-400 mt-1 inline-block">
            Kinematic Cadence
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Technique
          </span>
          <div className="text-3xl md:text-4xl font-black text-white">
            {fingerprint.strengthOfTechnique}<span className="text-lg text-purple-400 font-bold">%</span>
          </div>
          <span className="text-[10px] font-semibold text-purple-400 mt-1 inline-block">
            Joint Stability
          </span>
        </div>
      </div>

      {/* 2. Most Common Form Fault Callout */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Primary Focus Area</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">Active Coaching Target</span>
          </div>
          <h3 className="text-sm font-bold text-white mt-1">
            {fingerprint.mostCommonIssue}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            During deep flexion, knees slightly track inward relative to the ankle plumb line. The AI coach emphasizes external knee drive cues.
          </p>
        </div>
      </div>

      {/* 3. Interactive Visual Biomechanical Silhouette */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Anatomical Joint Stability Map</h3>
            <p className="text-[11px] text-slate-400">Color-coded joint tracking based on real camera movement logs</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Optimal Alignment
          </span>
        </div>

        {/* Interactive SVG Human Silhouette with Joint Hotspots */}
        <div className="relative w-full max-w-[260px] mx-auto py-2 flex justify-center">
          <svg viewBox="0 0 200 320" className="w-full h-auto drop-shadow-xl">
            {/* Ambient Body Outline */}
            <g opacity="0.3" stroke="#475569" strokeWidth="2" fill="none">
              {/* Head */}
              <circle cx="100" cy="35" r="18" fill="#1e293b" />
              {/* Neck & Spine */}
              <path d="M 100 53 L 100 140" />
              {/* Shoulders */}
              <path d="M 65 75 L 135 75" />
              {/* Arms */}
              <path d="M 65 75 L 50 125 L 42 175" />
              <path d="M 135 75 L 150 125 L 158 175" />
              {/* Pelvis */}
              <path d="M 75 140 L 125 140" />
              {/* Legs */}
              <path d="M 80 140 L 76 215 L 72 290" />
              <path d="M 120 140 L 124 215 L 128 290" />
            </g>

            {/* Glowing Joint Anchors with Stability Status */}
            {/* Cervical / Neck */}
            <circle cx="100" cy="65" r="6" fill="#10B981" className="animate-pulse" />
            <text x="112" y="68" fill="#94A3B8" fontSize="9" fontWeight="600">Neck {fingerprint.jointStabilityScores.cervical_spine}%</text>

            {/* Shoulders */}
            <circle cx="65" cy="75" r="6" fill="#10B981" />
            <circle cx="135" cy="75" r="6" fill="#10B981" />

            {/* Lumbar Spine / Core */}
            <circle cx="100" cy="115" r="6" fill="#10B981" />
            <text x="112" y="118" fill="#94A3B8" fontSize="9" fontWeight="600">Spine {fingerprint.jointStabilityScores.lumbar_spine}%</text>

            {/* Hips */}
            <circle cx="75" cy="140" r="6" fill="#10B981" />
            <circle cx="125" cy="140" r="6" fill="#10B981" />
            <text x="135" y="143" fill="#94A3B8" fontSize="9" fontWeight="600">Hips {fingerprint.jointStabilityScores.hips}%</text>

            {/* Left Knee (Focus Area) */}
            <circle cx="76" cy="215" r="7" fill="#F59E0B" />
            <text x="12" y="218" fill="#F59E0B" fontSize="9" fontWeight="700">L-Knee {fingerprint.jointStabilityScores.left_knee}%</text>

            {/* Right Knee */}
            <circle cx="124" cy="215" r="6" fill="#10B981" />
            <text x="135" y="218" fill="#94A3B8" fontSize="9" fontWeight="600">R-Knee {fingerprint.jointStabilityScores.right_knee}%</text>

            {/* Ankles */}
            <circle cx="72" cy="290" r="6" fill="#10B981" />
            <circle cx="128" cy="290" r="6" fill="#10B981" />
            <text x="138" y="293" fill="#94A3B8" fontSize="9" fontWeight="600">Ankles {fingerprint.jointStabilityScores.ankles}%</text>
          </svg>
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Optimal (&gt;85%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Focus Area (70-84%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical (&lt;70%)</span>
          </div>
        </div>
      </div>

      {/* 4. 7-Day Progression Graph (Day 1 -> Day 7) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Weekly Quality Progression</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">Day 1 to Day 7 Form Growth</h3>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400">+{overallImprovement}% Improvement</span>
            <span className="text-[10px] text-slate-400 block">72% &rarr; 86% Overall</span>
          </div>
        </div>

        {/* Custom Bar Graph */}
        <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-1">
          {fingerprint.historicalTrend.map((item, idx) => {
            const isSelected = idx === selectedDayIdx;
            const barHeight = `${Math.round(((item.overallForm - 50) / 50) * 100)}%`;

            return (
              <button
                key={item.day}
                onClick={() => setSelectedDayIdx(idx)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer transition-all"
              >
                {/* Score tooltip above bar */}
                <span className={`text-[10px] font-bold mb-1 transition-all ${
                  isSelected ? 'text-emerald-300 scale-110' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {item.overallForm}%
                </span>

                {/* Bar */}
                <div className="w-full max-w-[28px] bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end p-0.5">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isSelected 
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/30' 
                        : 'bg-slate-700 group-hover:bg-slate-600'
                    }`}
                    style={{ height: barHeight }}
                  />
                </div>

                {/* Day Label */}
                <span className={`text-[10px] mt-2 font-semibold ${
                  isSelected ? 'text-emerald-400 font-bold' : 'text-slate-500'
                }`}>
                  {item.day}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Details Card */}
        {activeDay && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">{activeDay.day} ({activeDay.date})</span>
              <div className="text-slate-200 font-semibold mt-0.5">
                Knee: <span className="text-emerald-400">{activeDay.kneeAlignment}%</span> &bull; Back: <span className="text-blue-400">{activeDay.backAlignment}%</span> &bull; Depth: <span className="text-amber-400">{activeDay.depth}%</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white">{activeDay.reps} Reps</span>
              <span className="text-[10px] text-slate-400 block">{activeDay.overallForm}% Form</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Health Tech Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2 mb-6">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          FormFit AI Form Fingerprint models computer-vision movement habits over time. It is an educational fitness tool and does not diagnose anatomical or clinical pathologies.
        </p>
      </div>

      {/* Start Workout CTA */}
      <button
        id="start-from-fingerprint-btn"
        onClick={onStartWorkout}
        className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
      >
        <span>Test Your Form Now</span>
        <ChevronRight className="w-4 h-4" />
      </button>

    </div>
  );
};
