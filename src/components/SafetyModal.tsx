/**
 * Health & Safety Advisory Modal
 * FormFit AI — Health Tech Track
 */

import React from 'react';
import { AlertCircle, ShieldAlert, HeartPulse, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isPainReport?: boolean;
}

export const SafetyModal: React.FC<Props> = ({ isOpen, onClose, isPainReport = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${isPainReport ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {isPainReport ? <HeartPulse className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isPainReport ? 'Pain Advisory & Safety Protocol' : 'Health & Biomechanical Advisory'}
            </h3>
            <span className="text-xs text-slate-400">iQOO Health Tech Track Notice</span>
          </div>
        </div>

        {isPainReport ? (
          <div className="space-y-3 text-sm text-slate-300">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs font-semibold">
              Stop exercising immediately if you feel sharp pain, dizziness, joint instability, or numbness.
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              FormFit AI is an educational movement-coaching tool and does NOT diagnose musculoskeletal pathology, ligament strains, or medical conditions.
            </p>
            <p className="text-xs leading-relaxed text-slate-400">
              Please rest, hydrate, and consult a certified physical therapist or licensed physician if discomfort persists.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <p>
              <strong className="text-white">Fitness & Education Tool:</strong> FormFit AI provides algorithmic exercise posture guidance and movement angle calculations. It is not medical advice or a substitute for a qualified physical therapist, orthopedic specialist, or doctor.
            </p>
            <p>
              <strong className="text-white">On-Device Processing:</strong> Pose estimation is computed on your smartphone hardware. Video frames are processed in volatile memory and never recorded or transmitted off-device.
            </p>
            <p className="text-slate-400">
              Always ensure an unobstructed 6-foot workout perimeter free of tripping hazards prior to initiating high-mobility exercises.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition cursor-pointer"
        >
          Understood & Acknowledged
        </button>
      </div>
    </div>
  );
};
