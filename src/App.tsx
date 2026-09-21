/**
 * FormFit AI — Flagship Health-Tech Application Entry
 * iQOO Hackathon 2026 Hyderabad
 */

import React, { useState, useEffect } from 'react';
import { ExerciseType, FormFingerprint, WorkoutSession } from './types';
import { StorageService } from './services/storage';
import { DemoScenario } from './ai/demoData';
import { HomeScreen } from './components/HomeScreen';
import { ExerciseScreen } from './components/ExerciseScreen';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { FormFingerprintScreen } from './components/FormFingerprintScreen';
import { ProgressDashboard } from './components/ProgressDashboard';
import { BottomNavigation, NavigationTab } from './components/Navigation';
import { OnboardingModal } from './components/OnboardingModal';
import { SafetyModal } from './components/SafetyModal';
import { HackathonDemoBar } from './components/HackathonDemoBar';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [activeExercise, setActiveExercise] = useState<ExerciseType | null>(null);

  // Storage data
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [fingerprint, setFingerprint] = useState<FormFingerprint>(StorageService.getFingerprint());
  
  // Onboarding & Safety Modals
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showPainModal, setShowPainModal] = useState(false);

  // Hackathon Demo Mode Controls
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('perfect_squat');
  const [demoScene, setDemoScene] = useState<number>(1);

  // Presentation Phone Bezel mode (toggleable for desktop demo)
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);

  useEffect(() => {
    // Load initial sessions & fingerprint
    setSessions(StorageService.getSessions());
    setFingerprint(StorageService.getFingerprint());

    // Show onboarding if first visit
    if (!StorageService.isOnboarded()) {
      setShowOnboarding(true);
    }
  }, []);

  const handleFinishWorkout = (session: WorkoutSession) => {
    StorageService.saveSession(session);
    setSessions(StorageService.getSessions());
    setFingerprint(StorageService.getFingerprint());
    setActiveExercise(null);
    setCurrentTab('fingerprint'); // Directly showcase updated Form Fingerprint!
  };

  const handleStartExercise = (exerciseId: ExerciseType = 'squat') => {
    setActiveExercise(exerciseId);
  };

  const handleTriggerPitchScene = (sceneNum: number) => {
    setDemoScene(sceneNum);
    switch (sceneNum) {
      case 1:
        // Scene 1: Problem / Home screen
        setActiveExercise(null);
        setCurrentTab('home');
        break;
      case 2:
        // Scene 2: Select Exercise Library
        setActiveExercise(null);
        setCurrentTab('library');
        break;
      case 3:
        // Scene 3: Start Squat with Good Form
        setIsDemoMode(true);
        setDemoScenario('perfect_squat');
        setActiveExercise('squat');
        break;
      case 4:
        // Scene 4: Detect Form Fault (Knee Valgus Error) & Voice Coach Correction
        setIsDemoMode(true);
        setDemoScenario('knee_valgus_squat');
        setActiveExercise('squat');
        break;
      case 5:
        // Scene 5: Review Form Fingerprint improvement
        setActiveExercise(null);
        setCurrentTab('fingerprint');
        break;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start relative">
      
      {/* 1. Judge & Presenter Demo Control Bar (Always accessible at top) */}
      <HackathonDemoBar
        isDemoMode={isDemoMode}
        onToggleDemoMode={setIsDemoMode}
        activeScenario={demoScenario}
        onSelectScenario={(scen) => {
          setDemoScenario(scen);
          if (scen.includes('squat')) setActiveExercise('squat');
          else if (scen.includes('pushup')) setActiveExercise('pushup');
          else if (scen.includes('lunge')) setActiveExercise('lunge');
          else if (scen.includes('plank')) setActiveExercise('plank');
          else if (scen.includes('jumping_jack')) setActiveExercise('jumping_jack');
        }}
        onTriggerScene={handleTriggerPitchScene}
        currentScene={demoScene}
      />

      {/* Frame Size Selector for Desktop Presenters */}
      <div className="w-full max-w-2xl px-4 py-1.5 flex justify-end gap-2 text-[11px] text-slate-400">
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1 hover:text-slate-200 transition cursor-pointer"
          title="Toggle Smartphone Frame View"
        >
          {isPhoneFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          <span>{isPhoneFrame ? 'Full-Width View' : 'iQOO Device Frame'}</span>
        </button>
      </div>

      {/* 2. Main App Container (Responsive mobile layout or phone frame) */}
      <div className={`w-full transition-all duration-300 ${
        isPhoneFrame 
          ? 'max-w-[420px] my-4 rounded-[42px] border-[8px] border-slate-800 shadow-2xl overflow-hidden min-h-[840px] bg-black ring-1 ring-slate-700' 
          : 'max-w-2xl'
      }`}>
        
        {/* ACTIVE WORKOUT CAMERA SCREEN */}
        {activeExercise ? (
          <ExerciseScreen
            exerciseId={activeExercise}
            onBack={() => setActiveExercise(null)}
            onFinishWorkout={handleFinishWorkout}
            isDemoMode={isDemoMode}
            demoScenario={demoScenario}
          />
        ) : (
          /* TAB SCREENS */
          <>
            {currentTab === 'home' && (
              <HomeScreen
                onStartWorkout={(exId) => handleStartExercise(exId || 'squat')}
                onNavigateTab={setCurrentTab}
                fingerprint={fingerprint}
                recentSession={sessions[0] || null}
                onOpenSafetyModal={() => setShowSafetyModal(true)}
                onOpenPainModal={() => setShowPainModal(true)}
              />
            )}

            {currentTab === 'library' && (
              <ExerciseLibrary
                onSelectExercise={handleStartExercise}
              />
            )}

            {currentTab === 'fingerprint' && (
              <FormFingerprintScreen
                fingerprint={fingerprint}
                onStartWorkout={() => handleStartExercise('squat')}
              />
            )}

            {currentTab === 'progress' && (
              <ProgressDashboard
                sessions={sessions}
                fingerprint={fingerprint}
                onSelectFingerprint={() => setCurrentTab('fingerprint')}
                onStartWorkout={() => handleStartExercise('squat')}
              />
            )}

            {/* Bottom App Navigation */}
            <BottomNavigation
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              onLaunchWorkout={() => handleStartExercise('squat')}
            />
          </>
        )}

      </div>

      {/* 3. Global Modals */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            StorageService.setOnboarded(true);
            setShowOnboarding(false);
          }}
        />
      )}

      <SafetyModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        isPainReport={false}
      />

      <SafetyModal
        isOpen={showPainModal}
        onClose={() => setShowPainModal(false)}
        isPainReport={true}
      />

    </div>
  );
}
