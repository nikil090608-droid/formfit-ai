/**
 * Bottom Mobile Navigation Bar
 * FormFit AI — Health Tech Track
 */

import React from 'react';
import { Home, Dumbbell, Fingerprint, BarChart3, Camera } from 'lucide-react';

export type NavigationTab = 'home' | 'library' | 'fingerprint' | 'progress';

interface Props {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onLaunchWorkout: () => void;
}

export const BottomNavigation: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  onLaunchWorkout,
}) => {
  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-4 py-2">
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Home */}
        <button
          id="nav-tab-home"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition cursor-pointer ${
            currentTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Library */}
        <button
          id="nav-tab-library"
          onClick={() => onSelectTab('library')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition cursor-pointer ${
            currentTab === 'library' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Exercises</span>
        </button>

        {/* Floating Center Workout Camera Launch Button */}
        <div className="relative -top-5">
          <button
            id="nav-launch-camera-btn"
            onClick={onLaunchWorkout}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/35 ring-4 ring-slate-950 active:scale-95 transition-transform cursor-pointer"
            title="Start Camera Workout"
          >
            <Camera className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Fingerprint */}
        <button
          id="nav-tab-fingerprint"
          onClick={() => onSelectTab('fingerprint')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition cursor-pointer ${
            currentTab === 'fingerprint' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Fingerprint className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Fingerprint</span>
        </button>

        {/* Progress */}
        <button
          id="nav-tab-progress"
          onClick={() => onSelectTab('progress')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition cursor-pointer ${
            currentTab === 'progress' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Progress</span>
        </button>

      </div>
    </nav>
  );
};
