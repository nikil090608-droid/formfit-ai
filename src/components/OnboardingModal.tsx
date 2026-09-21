/**
 * 4-Step Interactive Onboarding & Permission Flow
 * FormFit AI — Health Tech Track
 */

import React, { useState } from 'react';
import { Camera, Sparkles, Smartphone, Activity, TrendingUp, Check, ShieldCheck } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const screens = [
    {
      title: 'Meet your AI form coach.',
      subtitle: 'Real-time biomechanical analysis directly through your smartphone camera.',
      icon: <Sparkles className="w-12 h-12 text-emerald-400" />,
      tag: 'Zero Wearables Needed',
      desc: 'FormFit AI tracks 33 anatomical landmarks at 30+ frames per second to evaluate joint angles, spine posture, and rep depth instantly on-device.',
    },
    {
      title: 'Place phone with full body visible.',
      subtitle: 'Lean your phone against a wall or water bottle 6–8 feet away.',
      icon: <Smartphone className="w-12 h-12 text-blue-400" />,
      tag: 'Optimal Camera Framing',
      desc: 'Keep your entire body from head to ankles inside the frame so the computer vision model can accurately calculate joint kinematics.',
    },
    {
      title: 'Move naturally. We analyze form.',
      subtitle: 'Hear instant voice coaching while exercising.',
      icon: <Activity className="w-12 h-12 text-amber-400" />,
      tag: 'Real-Time Voice & Audio HUD',
      desc: 'FormFit alerts you the millisecond knees cave inward, lower backs sag, or squats cut short — helping you exercise safely before bad habits solidify.',
    },
    {
      title: 'Improve your technique over time.',
      subtitle: 'Track your personal Form Fingerprint.',
      icon: <TrendingUp className="w-12 h-12 text-purple-400" />,
      tag: 'Personalized Health Tech',
      desc: 'Watch your joint stability and form scores rise across sessions. We build your personalized movement fingerprint to highlight progress.',
    },
  ];

  const current = screens[step];

  const handleNext = async () => {
    if (step < screens.length - 1) {
      setStep(step + 1);
    } else {
      // Request camera permission proactively if supported
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      } catch {
        // user may grant later
      }
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col min-h-[520px]">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-1.5">
            {screens.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-emerald-500' : i < step ? 'w-3 bg-emerald-700' : 'w-3 bg-slate-800'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onComplete}
            className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-2 py-1 cursor-pointer"
          >
            Skip
          </button>
        </div>

        {/* Central Graphic */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          <div className="w-24 h-24 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-6 shadow-xl relative">
            {current.icon}
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 p-1 rounded-full text-[10px] font-bold">
              <Check className="w-3 h-3" />
            </div>
          </div>

          <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full mb-3 border border-emerald-500/20">
            {current.tag}
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            {current.title}
          </h2>

          <p className="text-sm font-medium text-slate-300 mb-3">
            {current.subtitle}
          </p>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            {current.desc}
          </p>
        </div>

        {/* Permissions Explainer on final step */}
        {step === screens.length - 1 && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 mb-4 text-left flex items-start gap-2.5">
            <Camera className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300 leading-snug">
              <span className="font-semibold text-white block">Camera Access Required</span>
              Camera video is processed entirely on-device and is never recorded, saved, or uploaded to any server.
            </div>
          </div>
        )}

        {/* Bottom Next Button */}
        <div className="mt-4 pt-2">
          <button
            id="onboarding-next-btn"
            onClick={handleNext}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <span>{step === screens.length - 1 ? 'Grant Camera & Start' : 'Continue'}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>On-Device Edge AI &bull; No video leaves your smartphone</span>
          </div>
        </div>

      </div>
    </div>
  );
};
