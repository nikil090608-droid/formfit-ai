/**
 * Biomechanical Math & Kinematics Calculations
 * FormFit AI — Health Tech Track
 */

import { Landmark } from '../types';

/**
 * Calculates the angle (in degrees) at vertex point B formed by points A, B, and C.
 * Angle range: [0, 180] degrees.
 */
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  if (!a || !b || !c) return 180;

  // Vector BA: (A.x - B.x, A.y - B.y)
  const vBA = { x: a.x - b.x, y: a.y - b.y };
  // Vector BC: (C.x - B.x, C.y - B.y)
  const vBC = { x: c.x - b.x, y: c.y - b.y };

  const dot = vBA.x * vBC.x + vBA.y * vBC.y;
  const magBA = Math.sqrt(vBA.x * vBA.x + vBA.y * vBA.y);
  const magBC = Math.sqrt(vBC.x * vBC.x + vBC.y * vBC.y);

  if (magBA === 0 || magBC === 0) return 180;

  let cosTheta = dot / (magBA * magBC);
  // Guard against precision drift beyond [-1, 1]
  cosTheta = Math.max(-1, Math.min(1, cosTheta));

  const rad = Math.acos(cosTheta);
  return (rad * 180) / Math.PI;
}

/**
 * Calculates the inclination angle (in degrees) of a segment (e.g., shoulder to hip)
 * relative to the vertical plumb line (0° = perfectly upright vertical, 90° = horizontal).
 */
export function calculateVerticalAngle(top: Landmark, bottom: Landmark): number {
  if (!top || !bottom) return 0;
  const dx = Math.abs(top.x - bottom.x);
  const dy = Math.abs(top.y - bottom.y);
  if (dy === 0) return 90;
  const rad = Math.atan2(dx, dy);
  return (rad * 180) / Math.PI;
}

/**
 * Computes Euclidean distance between two landmarks in normalized space.
 */
export function calculateDistance(a: Landmark, b: Landmark): number {
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes midpoint between two landmarks.
 */
export function calculateMidpoint(a: Landmark, b: Landmark): Landmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: a.z && b.z ? (a.z + b.z) / 2 : undefined,
    visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
  };
}

/**
 * Exponential Moving Average filter for landmark coordinates to eliminate camera jitter.
 * Alpha closer to 1 responds faster; closer to 0 is smoother. 0.45 is ideal for human exercise.
 */
export function smoothLandmarks(
  current: Landmark[],
  previous: Landmark[] | null,
  alpha = 0.45
): Landmark[] {
  if (!previous || previous.length !== current.length) {
    return current;
  }

  return current.map((curr, i) => {
    const prev = previous[i];
    if (!prev) return curr;
    return {
      x: alpha * curr.x + (1 - alpha) * prev.x,
      y: alpha * curr.y + (1 - alpha) * prev.y,
      z: curr.z !== undefined && prev.z !== undefined ? alpha * curr.z + (1 - alpha) * prev.z : curr.z,
      visibility: curr.visibility,
    };
  });
}

/**
 * Determines knee valgus (knees caving inward)
 * In a front-facing squat, knee horizontal distance should track ankle and hip width.
 * Ratio < 0.85 usually implies significant knee valgus collapse.
 */
export function checkKneeValgus(
  leftHip: Landmark,
  rightHip: Landmark,
  leftKnee: Landmark,
  rightKnee: Landmark,
  leftAnkle: Landmark,
  rightAnkle: Landmark
): { hasValgus: boolean; ratio: number } {
  const hipWidth = Math.abs(leftHip.x - rightHip.x);
  const kneeWidth = Math.abs(leftKnee.x - rightKnee.x);
  const ankleWidth = Math.abs(leftAnkle.x - rightAnkle.x);

  if (hipWidth === 0 || ankleWidth === 0) {
    return { hasValgus: false, ratio: 1 };
  }

  // Ratio of knee separation to ankle separation
  const ratio = kneeWidth / Math.max(ankleWidth, hipWidth * 0.9);
  // Valgus collapse occurs if knees cave inward compared to feet/hips
  const hasValgus = ratio < 0.82;
  return { hasValgus, ratio };
}

/**
 * Clamps a score between min and max.
 */
export function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}
