/**
 * Synthetic Motion Cycles & Hackathon Demo Presets
 * FormFit AI — Health Tech Track
 * 
 * Provides biomechanically accurate 33-landmark sequences for presentation mode
 * and graceful fallback when offline/no camera is available.
 */

import { ExerciseType, Landmark } from '../types';

export type DemoScenario = 
  | 'perfect_squat' 
  | 'knee_valgus_squat' 
  | 'excessive_torso_lean_squat'
  | 'head_misalignment_squat'
  | 'shallow_squat'
  | 'low_confidence_squat'
  | 'fast_squat'
  | 'pushup_normal'
  | 'lunge_normal'
  | 'plank_sag'
  | 'jumping_jack_normal';

/**
 * Creates a base standing human skeleton template in normalized 0..1 space.
 */
function createBaseStandingSkeleton(): Landmark[] {
  const landmarks: Landmark[] = [];
  for (let i = 0; i < 33; i++) {
    landmarks.push({ x: 0.5, y: 0.5, z: 0, visibility: 0.95 });
  }

  // Head
  landmarks[0] = { x: 0.50, y: 0.16, z: 0, visibility: 0.98 }; // nose
  landmarks[11] = { x: 0.42, y: 0.28, z: 0, visibility: 0.96 }; // left shoulder
  landmarks[12] = { x: 0.58, y: 0.28, z: 0, visibility: 0.96 }; // right shoulder
  landmarks[13] = { x: 0.38, y: 0.42, z: 0, visibility: 0.94 }; // left elbow
  landmarks[14] = { x: 0.62, y: 0.42, z: 0, visibility: 0.94 }; // right elbow
  landmarks[15] = { x: 0.36, y: 0.54, z: 0, visibility: 0.92 }; // left wrist
  landmarks[16] = { x: 0.64, y: 0.54, z: 0, visibility: 0.92 }; // right wrist

  // Pelvis & Legs
  landmarks[23] = { x: 0.45, y: 0.52, z: 0, visibility: 0.95 }; // left hip
  landmarks[24] = { x: 0.55, y: 0.52, z: 0, visibility: 0.95 }; // right hip
  landmarks[25] = { x: 0.44, y: 0.70, z: 0, visibility: 0.96 }; // left knee
  landmarks[26] = { x: 0.56, y: 0.70, z: 0, visibility: 0.96 }; // right knee
  landmarks[27] = { x: 0.43, y: 0.88, z: 0, visibility: 0.95 }; // left ankle
  landmarks[28] = { x: 0.57, y: 0.88, z: 0, visibility: 0.95 }; // right ankle

  return landmarks;
}

/**
 * Generates dynamic 33-landmark coordinates according to exercise and demo scenario.
 * @param progress 0.0 to 1.0 (smooth sine rep cycle)
 * @param scenario chosen demonstration scenario
 */
export function generateDemoLandmarks(
  exercise: ExerciseType,
  progress: number, // 0 -> 1 -> 0 cyclic
  scenario: DemoScenario
): Landmark[] {
  const skel = createBaseStandingSkeleton();
  // Sine curve: 0 at start, 1 at bottom inflection, 0 at return
  const depth = Math.sin(progress * Math.PI);

  if (exercise === 'squat') {
    const isValgus = scenario === 'knee_valgus_squat';
    const isTorsoLean = scenario === 'excessive_torso_lean_squat';
    const isHeadIssue = scenario === 'head_misalignment_squat';
    const isShallow = scenario === 'shallow_squat';
    const isLowConfidence = scenario === 'low_confidence_squat';
    const maxDepthMultiplier = isShallow ? 0.45 : 1.0;
    const effectiveDepth = depth * maxDepthMultiplier;

    // Hips drop from y=0.52 down to ~0.70
    skel[23].y = 0.52 + effectiveDepth * 0.18;
    skel[24].y = 0.52 + effectiveDepth * 0.18;

    // Torso lean
    if (isTorsoLean && effectiveDepth > 0.25) {
      // Upper body leans forward excessively (> 45 degrees lean)
      const forwardShift = effectiveDepth * 0.16;
      skel[11].x = 0.42 + forwardShift;
      skel[12].x = 0.58 + forwardShift;
      skel[11].y = 0.28 + effectiveDepth * 0.24;
      skel[12].y = 0.28 + effectiveDepth * 0.24;
      skel[0].x = 0.50 + forwardShift * 1.2;
      skel[0].y = 0.16 + effectiveDepth * 0.26;
    } else if (isHeadIssue && effectiveDepth > 0.2) {
      skel[11].y = 0.28 + effectiveDepth * 0.10;
      skel[12].y = 0.28 + effectiveDepth * 0.10;
      // Head deviates sharply from spinal alignment axis
      skel[0].x = 0.50 + 0.12 * effectiveDepth;
      skel[0].y = 0.16 + effectiveDepth * 0.20;
    } else {
      skel[11].y = 0.28 + effectiveDepth * 0.10;
      skel[12].y = 0.28 + effectiveDepth * 0.10;
      skel[0].y = 0.16 + effectiveDepth * 0.10;
    }

    // Knees bend outwards slightly in good form, but CAVE INWARD in valgus!
    if (isValgus && effectiveDepth > 0.35) {
      // Knees pinch together (Valgus collapse)
      const pinch = effectiveDepth * 0.085;
      skel[25].x = 0.44 + pinch; // moves right towards center
      skel[26].x = 0.56 - pinch; // moves left towards center
      skel[25].y = 0.70 + effectiveDepth * 0.04;
      skel[26].y = 0.70 + effectiveDepth * 0.04;
    } else {
      // Good squat knee tracking
      skel[25].x = 0.43 - effectiveDepth * 0.015;
      skel[26].x = 0.57 + effectiveDepth * 0.015;
      skel[25].y = 0.70 + effectiveDepth * 0.03;
      skel[26].y = 0.70 + effectiveDepth * 0.03;
    }

    // Ankles stay grounded
    skel[27].y = 0.88;
    skel[28].y = 0.88;

    // Arms reach forward for balance
    skel[15].x = 0.44;
    skel[15].y = 0.38 + effectiveDepth * 0.05;
    skel[16].x = 0.56;
    skel[16].y = 0.38 + effectiveDepth * 0.05;

    // If low confidence scenario, reduce visibility of landmarks below threshold
    if (isLowConfidence) {
      for (let i = 0; i < skel.length; i++) {
        skel[i].visibility = 0.3;
      }
    }
  } else if (exercise === 'pushup') {
    // Horizontal prone orientation
    skel[11] = { x: 0.32, y: 0.50 + depth * 0.18, z: 0, visibility: 0.95 };
    skel[12] = { x: 0.36, y: 0.48 + depth * 0.18, z: 0, visibility: 0.95 };
    skel[13] = { x: 0.28, y: 0.56 + depth * 0.10, z: 0, visibility: 0.95 };
    skel[14] = { x: 0.32, y: 0.54 + depth * 0.10, z: 0, visibility: 0.95 };
    skel[15] = { x: 0.30, y: 0.68, z: 0, visibility: 0.95 }; // wrists on ground
    skel[16] = { x: 0.34, y: 0.68, z: 0, visibility: 0.95 };

    // Body line
    const sag = scenario === 'plank_sag' ? depth * 0.10 : 0;
    skel[23] = { x: 0.55, y: 0.54 + depth * 0.14 + sag, z: 0, visibility: 0.95 };
    skel[24] = { x: 0.57, y: 0.52 + depth * 0.14 + sag, z: 0, visibility: 0.95 };
    skel[27] = { x: 0.80, y: 0.68, z: 0, visibility: 0.95 }; // feet on ground
    skel[28] = { x: 0.82, y: 0.68, z: 0, visibility: 0.95 };
  } else if (exercise === 'lunge') {
    // Lead leg (left) steps forward, back leg (right) drops down
    skel[23].y = 0.52 + depth * 0.16;
    skel[24].y = 0.52 + depth * 0.16;
    skel[25] = { x: 0.40, y: 0.68 + depth * 0.05, z: 0, visibility: 0.95 }; // lead knee
    skel[27] = { x: 0.40, y: 0.88, z: 0, visibility: 0.95 }; // lead ankle
    skel[26] = { x: 0.62, y: 0.68 + depth * 0.14, z: 0, visibility: 0.95 }; // back knee drops
    skel[28] = { x: 0.68, y: 0.88, z: 0, visibility: 0.95 }; // back ball of foot
  } else if (exercise === 'plank') {
    // Static hold with optional subtle breathing
    const sag = scenario === 'plank_sag' ? 0.06 : 0;
    skel[11] = { x: 0.30, y: 0.58, z: 0, visibility: 0.95 };
    skel[13] = { x: 0.30, y: 0.68, z: 0, visibility: 0.95 };
    skel[15] = { x: 0.38, y: 0.68, z: 0, visibility: 0.95 };
    skel[23] = { x: 0.54, y: 0.58 + sag, z: 0, visibility: 0.95 };
    skel[27] = { x: 0.80, y: 0.68, z: 0, visibility: 0.95 };
  } else if (exercise === 'jumping_jack') {
    // Arms raise overhead and feet spread
    const armAngle = depth * 1.6; // radians
    skel[15] = { x: 0.36 - Math.sin(armAngle) * 0.18, y: 0.54 - Math.sin(armAngle) * 0.38, z: 0, visibility: 0.95 };
    skel[16] = { x: 0.64 + Math.sin(armAngle) * 0.18, y: 0.54 - Math.sin(armAngle) * 0.38, z: 0, visibility: 0.95 };
    skel[27].x = 0.43 - depth * 0.12;
    skel[28].x = 0.57 + depth * 0.12;
  }

  return skel;
}
