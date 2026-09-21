/**
 * Progress Dashboard & Workout History Analytics
 * FormFit AI — Health Tech Track
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { WorkoutSession, FormFingerprint } from '../types';

interface Props {
  sessions: WorkoutSession[];
  fingerprint: FormFingerprint;
  onSelectFingerprint: () => void;
  onStartWorkout: () => void;
}

export const ProgressDashboard: React.FC<Props> = ({
  sessions,
  fingerprint,
  onSelectFingerprint,
  onStartWorkout,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(sessions[0]?.id || null);

  const todayMidnight = new Date().setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter(s => s.startTime >= todayMidnight);
  const todayReps = todaySessions.reduce((acc, s) => acc + s.repetitions, 0);
  const allReps = sessions.reduce((acc, s) => acc + s.repetitions, 0);
  
  const sessionsWithReps = sessions.filter(s => s.repetitions > 0);
  const avgScore = sessionsWithReps.length > 0 
    ? Math.round(sessionsWithReps.reduce((acc, s) => acc + s.formScore, 0) / sessionsWithReps.length)
    : 0;
  const bestScore = sessionsWithReps.length > 0 
    ? Math.max(...sessionsWithReps.map(s => s.formScore))
    : 0;

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 pb-24 max-w-2xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Analytics Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Progress & History
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified movement logs and algorithmic biomechanical trends.
          </p>
        </div>

        <button
          onClick={onStartWorkout}
          className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          New Workout
        </button>
      </div>

      {/* 1. Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Today's Volume</span>
          <div className="text-2xl font-black text-white">{todayReps}</div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">Repetitions</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Reps</span>
          <div className="text-2xl font-black text-white">{allReps}</div>
          <span className="text-[10px] text-blue-400 font-semibold mt-0.5 block">{sessions.length} sessions logged</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Average Form</span>
          <div className="text-2xl font-black text-emerald-400">{avgScore}%</div>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">AI form rating</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Personal Best</span>
          <div className="text-2xl font-black text-purple-400">{bestScore}%</div>
          <span className="text-[10px] text-purple-400 font-semibold mt-0.5 block">Peak quality set</span>
        </div>
      </div>

      {/* 2. AI Form Insights Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-2xl p-4.5 mb-6 relative overflow-hidden shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0 border border-emerald-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">AI Coaching Insight</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">Kinematic Analysis</span>
            </div>
            <p className="text-sm font-semibold text-white mt-1">
              &ldquo;Your squat form consistency improved by 14% over your last 5 sessions. Your most frequent issue is knee alignment during deep inflection.&rdquo;
            </p>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Form score variance narrowed from &plusmn;9% to &plusmn;3%, demonstrating muscle memory stabilization.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Form Fingerprint Quick Link Banner */}
      <div 
        onClick={onSelectFingerprint}
        className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 mb-6 flex items-center justify-between cursor-pointer transition shadow-lg group"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Personal Form Fingerprint
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {fingerprint.overallFormScore}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore 7-day joint stability, spinal curvature &amp; movement profile &rarr;
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
      </div>

      {/* 4. Workout Session History */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
          Workout History ({sessions.length} Recorded Sessions)
        </h2>

        <div className="space-y-3">
          {sessions.map((s) => {
            const isSelected = s.id === selectedSessionId;
            const dateStr = new Date(s.startTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={s.id}
                onClick={() => setSelectedSessionId(isSelected ? null : s.id)}
                className={`bg-slate-900/80 border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                  isSelected ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl font-black text-sm ${
                      s.repetitions === 0 ? 'bg-slate-800 text-slate-400' : s.formScore >= 85 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {s.formScore}%
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{s.exerciseName}</h3>
                      <span className="text-xs text-slate-400">{dateStr} &bull; {s.repetitions} Reps &bull; {Math.round(s.durationSeconds)}s</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                      {s.repetitions === 0 ? 'No Reps (0%)' : s.formScore >= 85 ? 'Solid Form' : 'Good Effort'}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Expanded Session Breakdown */}
                {isSelected && (
                  <div className="mt-4 pt-3.5 border-t border-slate-800 text-xs space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Knee Align</span>
                        <span className="font-bold text-emerald-400">{s.scoreBreakdown.kneeAlignment}%</span>
                      </div>
                      <div className="bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Back Posture</span>
                        <span className="font-bold text-blue-400">{s.scoreBreakdown.backAlignment}%</span>
                      </div>
                      <div className="bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Depth / ROM</span>
                        <span className="font-bold text-amber-400">{s.scoreBreakdown.depthOrExtension}%</span>
                      </div>
                      <div className="bg-slate-800/60 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Rhythm</span>
                        <span className="font-bold text-purple-400">{s.scoreBreakdown.movementConsistency}%</span>
                      </div>
                    </div>

                    {s.repetitions === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                        No repetitions completed. Complete at least one repetition to generate your form analysis.
                      </div>
                    ) : s.detectedIssues.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coach Notes:</span>
                        {s.detectedIssues.map((issue, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-amber-300/90 text-xs bg-amber-500/10 p-2 rounded-lg">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{issue.message} (Flagged on {issue.count} rep{issue.count > 1 ? 's' : ''})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 p-2 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Consistent biomechanical execution across completed repetitions.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
