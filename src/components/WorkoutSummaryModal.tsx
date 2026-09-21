/**
 * Post-Workout Form Score & Performance Summary Modal
 * FormFit AI — Health Tech Track
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WorkoutSession } from '../types';
import { Award, CheckCircle2, AlertTriangle, ArrowRight, Share2, Sparkles } from 'lucide-react';

interface Props {
  session: WorkoutSession;
  onClose: () => void;
  onViewFingerprint: () => void;
}

export const WorkoutSummaryModal: React.FC<Props> = ({
  session,
  onClose,
  onViewFingerprint,
}) => {
  useEffect(() => {
    // Fire celebratory confetti only if repetitions were completed and form score is good
    if (session.repetitions > 0 && session.formScore >= 75) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#3B82F6', '#F59E0B'],
        });
      } catch {
        // Confetti guard
      }
    }
  }, [session.formScore, session.repetitions]);

  const getScoreGrade = (score: number, reps: number) => {
    if (reps === 0) return { label: 'Incomplete Set', color: 'text-slate-400', bg: 'bg-slate-800' };
    if (score >= 90) return { label: 'Elite Technique', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (score >= 80) return { label: 'Solid Form', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (score >= 70) return { label: 'Good Effort', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'Needs Refinement', color: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  const grade = getScoreGrade(session.formScore, session.repetitions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/15 text-emerald-400 mb-3 ring-1 ring-emerald-500/30">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Workout Complete!
          </h2>
          {session.repetitions === 0 ? (
            <div className="flex items-center justify-center flex-wrap gap-2 text-sm text-slate-300 mt-2 font-medium">
              <span className="text-slate-200 font-semibold">{session.exerciseName}</span>
              <span className="text-slate-600">&bull;</span>
              <span 
                id="zero-reps-warning-pill"
                className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-rose-500/20 border-2 border-rose-500 text-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.5)] ring-2 ring-rose-500/30 animate-pulse"
              >
                0 Reps
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-400 font-normal">in {Math.round(session.durationSeconds)}s</span>
            </div>
          ) : (
            <p className="text-sm text-slate-400 mt-1">
              {session.exerciseName} &bull; {session.repetitions} Reps in {Math.round(session.durationSeconds)}s
            </p>
          )}
        </div>

        {/* Overall Form Score Card */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 mb-5 text-center relative overflow-hidden">
          <div className="absolute top-2 right-3 flex items-center gap-1 text-[11px] text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            AI Form Metric
          </div>

          <div className="text-5xl font-black tracking-tight text-white mb-1">
            {session.repetitions === 0 ? 0 : session.formScore}
            <span className="text-2xl text-slate-400 font-normal">/100</span>
          </div>

          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${grade.bg} ${grade.color}`}>
            {grade.label}
          </span>

          <p className="text-xs text-slate-400 mt-3 max-w-xs mx-auto">
            AI-generated biomechanical form estimation. Not a medical measurement.
          </p>
        </div>

        {/* Score Category Breakdown */}
        <div className="mb-5 space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Form Category Breakdown</h3>
          
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Knee Alignment & Tracking</span>
                <span className={session.repetitions === 0 ? 'text-slate-500 font-bold' : 'text-emerald-400 font-bold'}>
                  {session.repetitions === 0 ? 0 : session.scoreBreakdown.kneeAlignment}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${session.repetitions === 0 ? 'bg-transparent' : 'bg-emerald-500'} rounded-full transition-all duration-700`} 
                  style={{ width: `${session.repetitions === 0 ? 0 : session.scoreBreakdown.kneeAlignment}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Back & Torso Posture</span>
                <span className={session.repetitions === 0 ? 'text-slate-500 font-bold' : 'text-blue-400 font-bold'}>
                  {session.repetitions === 0 ? 0 : session.scoreBreakdown.backAlignment}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${session.repetitions === 0 ? 'bg-transparent' : 'bg-blue-500'} rounded-full transition-all duration-700`} 
                  style={{ width: `${session.repetitions === 0 ? 0 : session.scoreBreakdown.backAlignment}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Depth & Range of Motion</span>
                <span className={session.repetitions === 0 ? 'text-slate-500 font-bold' : 'text-amber-400 font-bold'}>
                  {session.repetitions === 0 ? 0 : session.scoreBreakdown.depthOrExtension}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${session.repetitions === 0 ? 'bg-transparent' : 'bg-amber-500'} rounded-full transition-all duration-700`} 
                  style={{ width: `${session.repetitions === 0 ? 0 : session.scoreBreakdown.depthOrExtension}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Repetition Rhythm & Tempo</span>
                <span className={session.repetitions === 0 ? 'text-slate-500 font-bold' : 'text-purple-400 font-bold'}>
                  {session.repetitions === 0 ? 0 : session.scoreBreakdown.movementConsistency}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${session.repetitions === 0 ? 'bg-transparent' : 'bg-purple-500'} rounded-full transition-all duration-700`} 
                  style={{ width: `${session.repetitions === 0 ? 0 : session.scoreBreakdown.movementConsistency}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detected Issues Feedback */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Coach Observations</h3>
          {session.repetitions === 0 ? (
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-xs text-slate-300 leading-relaxed">
              No repetitions completed. Complete at least one repetition to generate your form analysis.
            </div>
          ) : session.detectedIssues.length > 0 ? (
            <div className="space-y-2">
              {session.detectedIssues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300">{issue.message}</span>
                    <p className="text-slate-300 mt-0.5">Detected on {issue.count} repetition{issue.count > 1 ? 's' : ''}. Maintain form discipline through late reps.</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Consistent biomechanical execution across completed repetitions.</span>
            </div>
          )}
        </div>

        {/* Form Fingerprint Status Notice if 0 Reps */}
        {session.repetitions === 0 && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 font-medium text-center flex items-center justify-center gap-1.5">
            <span>Form analysis unavailable — no repetitions completed.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 mt-auto pt-2">
          <button
            id="view-fingerprint-btn"
            onClick={onViewFingerprint}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <span>Update & View Form Fingerprint</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="finish-summary-btn"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
