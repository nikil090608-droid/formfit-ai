/**
 * Home Screen — Flagship Consumer Health-Tech Experience
 * FormFit AI — Health Tech Track
 */

import React from 'react';
import { 
  Play, 
  Fingerprint, 
  BarChart3, 
  Dumbbell, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Award, 
  Zap, 
  Camera, 
  Activity,
  HeartPulse,
  Info
} from 'lucide-react';
import { ExerciseType, FormFingerprint, WorkoutSession } from '../types';

interface Props {
  onStartWorkout: (exerciseId?: ExerciseType) => void;
  onNavigateTab: (tab: 'home' | 'library' | 'fingerprint' | 'progress') => void;
  fingerprint: FormFingerprint;
  recentSession: WorkoutSession | null;
  onOpenSafetyModal: () => void;
  onOpenPainModal: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onStartWorkout,
  onNavigateTab,
  fingerprint,
  recentSession,
  onOpenSafetyModal,
  onOpenPainModal,
}) => {
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 pb-24 max-w-2xl mx-auto animate-fade-in">
      
      {/* 1. Brand Hero Header */}
      <div className="mb-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-none">
                FORMFIT AI
              </span>
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                iQOO Health Tech 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPainModal}
              className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
              title="Report Discomfort or Pain"
            >
              <HeartPulse className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Safety</span>
            </button>
            <button
              onClick={onOpenSafetyModal}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition"
              title="Disclaimer & Medical Advisory"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            &ldquo;Your Camera. Your Coach. Your Form.&rdquo;
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time on-device computer vision posture coach. Eliminates form mistakes before they cause injury.
          </p>
        </div>
      </div>

      {/* 2. Primary Card: START WORKOUT (Hero CTA) */}
      <div 
        id="card-start-workout"
        onClick={() => onStartWorkout('squat')}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl p-6 mb-5 shadow-2xl shadow-emerald-500/20 text-slate-950 cursor-pointer group transform active:scale-[0.99] transition-all"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-[70%]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-white mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>Smart Vision Coach</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
              START WORKOUT
            </h2>
            <p className="text-xs font-semibold text-slate-900/80 mt-1">
              Position your camera 6–8ft away. AI tracks 33 anatomical landmarks in real time.
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-slate-950 text-emerald-400 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 fill-current ml-1" />
          </div>
        </div>

        {/* Ambient background geometry */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* 3. Core Feature Cards: FORM FINGERPRINT & PROGRESS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
        
        {/* Card: FORM FINGERPRINT */}
        <div
          id="card-form-fingerprint"
          onClick={() => onNavigateTab('fingerprint')}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition shadow-lg group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25">
                <Fingerprint className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {fingerprint.overallFormScore}% Overall
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              FORM FINGERPRINT
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Your biometric movement profile, joint stability scores &amp; 7-day progress.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
            <span>Inspect Fingerprint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card: PROGRESS DASHBOARD */}
        <div
          id="card-progress"
          onClick={() => onNavigateTab('progress')}
          className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 cursor-pointer transition shadow-lg group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Weekly Insights
              </span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
              PROGRESS
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Rep volume counters, historical workout breakdowns &amp; AI form metrics.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
            <span>View Full Stats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 4. Card: EXERCISE LIBRARY */}
      <div
        id="card-exercise-library"
        onClick={() => onNavigateTab('library')}
        className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4.5 mb-5 cursor-pointer transition shadow-lg flex items-center justify-between group"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                EXERCISE LIBRARY
              </h3>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                5 Exercises
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Squat, Push-up, Lunge, Plank, and Jumping Jacks with kinematic rules.
            </p>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
      </div>

      {/* 5. Card: RECENT WORKOUT */}
      {recentSession && (
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              RECENT WORKOUT
            </span>
            <span className="text-[11px] text-slate-400">
              {new Date(recentSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">{recentSession.exerciseName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {recentSession.repetitions} Reps &bull; {Math.round(recentSession.durationSeconds)}s duration
              </p>
            </div>

            <div className="text-right">
              <span className={`text-xl font-black ${recentSession.repetitions === 0 ? 'text-slate-400' : 'text-emerald-400'}`}>
                {recentSession.formScore}%
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">
                {recentSession.repetitions === 0 ? 'Incomplete Set' : 'Form Rating'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Safe Health Tech Disclaimer Footer */}
      <div className="text-center text-[11px] text-slate-500 pt-2 px-4 leading-relaxed">
        FormFit AI provides general fitness feedback and is not medical advice or a substitute for a qualified professional. Stop immediately if experiencing pain.
      </div>

    </div>
  );
};
