/**
 * Exercise Library & Movement Catalog
 * FormFit AI — Health Tech Track
 */

import React from 'react';
import { Play, Dumbbell, Shield, Info, ArrowRight, Zap, Target } from 'lucide-react';
import { ExerciseType } from '../types';
import { EXERCISE_DEFINITIONS } from '../ai/rules';

interface Props {
  onSelectExercise: (id: ExerciseType) => void;
}

export const ExerciseLibrary: React.FC<Props> = ({ onSelectExercise }) => {
  const exercises = Object.values(EXERCISE_DEFINITIONS);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 pb-24 max-w-2xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Dumbbell className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Biomechanical Engine
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
          Exercise Library
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Select an exercise calibrated with real-time joint kinematic rules.
        </p>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-4">
        {exercises.map((ex) => {
          return (
            <div
              key={ex.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200 shadow-lg relative overflow-hidden group"
            >
              {/* Top Accent Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-80"
                style={{ backgroundColor: ex.colorAccent }}
              />

              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {ex.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {ex.equipment}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {ex.name}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {ex.tagline}
                  </p>
                </div>

                <button
                  id={`start-ex-${ex.id}`}
                  onClick={() => onSelectExercise(ex.id)}
                  className="py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start</span>
                </button>
              </div>

              {/* Target Muscles */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1 flex items-center gap-1">
                  <Target className="w-3 h-3 text-slate-400" />
                  Target:
                </span>
                {ex.targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-medium"
                  >
                    {muscle}
                  </span>
                ))}
              </div>

              {/* Instructions Summary */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  AI Form Guard Rules:
                </h3>
                <ul className="text-xs text-slate-400 space-y-1">
                  {ex.instructions.slice(0, 2).map((ins, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">&bull;</span>
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-300/80 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Watch out: {ex.commonMistakes[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
