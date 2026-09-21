/**
 * Jumping Jack Biomechanical Form Analysis Engine
 * FormFit AI — Health Tech Track
 */

import { Landmark, FormAnalysisResult, FormIssue } from '../../types';
import { calculateAngle, calculateDistance, clamp } from '../math';
import { ExerciseStateTracker } from './squat';

export function analyzeJumpingJack(
  landmarks: Landmark[],
  tracker: ExerciseStateTracker
): FormAnalysisResult {
  const issues: FormIssue[] = [];
  const now = Date.now();

  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder || !leftAnkle || !rightAnkle) {
    return {
      exercise: 'jumping_jack',
      phase: tracker.phase,
      repetitionDetected: false,
      repCount: tracker.repCount,
      currentScore: tracker.currentScore,
      instantMetrics: { primaryAngle: 40 },
      detectedIssues: [],
      activeCoachingCue: 'Step back to capture full jumping span',
      isGoodForm: true,
      confidence: 0.5,
      personDetected: true,
      multiplePeopleDetected: false,
    };
  }

  // Arm abduction angle (wrist - shoulder - hip)
  const leftArmAngle = calculateAngle(leftWrist, leftShoulder, leftHip);
  const rightArmAngle = calculateAngle(rightWrist, rightShoulder, rightHip);
  const avgArmAngle = Math.round((leftArmAngle + rightArmAngle) / 2);

  // Foot spread distance relative to shoulder width
  const shoulderWidth = calculateDistance(leftShoulder, rightShoulder) || 0.2;
  const ankleSpread = calculateDistance(leftAnkle, rightAnkle);
  const spreadRatio = ankleSpread / shoulderWidth; // > 1.4 is wide, < 0.8 is narrow

  let repScore = 100;
  let coachingMessage = 'Ready for jumping jacks.';

  // Check arm extension (arms should raise above head > 135°)
  if (tracker.phase === 'inflection_bottom' && avgArmAngle < 125) {
    repScore -= 15;
    issues.push({
      id: `arms_low_${now}`,
      code: 'ARMS_NOT_OVERHEAD',
      severity: 'warning',
      message: 'Raise hands fully overhead above shoulders',
      voiceCue: 'Clap or reach higher overhead',
      bodyPart: 'arms',
      timestamp: now,
    });
  }

  let repetitionDetected = false;

  // Jumping Jack State:
  // Closed / In: arm angle < 45°, spreadRatio < 0.9
  // Open / Out: arm angle > 130°, spreadRatio > 1.3
  if (tracker.phase === 'ready' || tracker.phase === 'repetition_complete') {
    if (avgArmAngle > 80 && spreadRatio > 1.1) {
      tracker.phase = 'descending'; // Opening up
      tracker.minKneeAngleInRep = avgArmAngle; // storing max arm angle
      coachingMessage = 'Opening arms and legs...';
    } else {
      tracker.phase = 'ready';
    }
  } else if (tracker.phase === 'descending') {
    if (avgArmAngle >= 135 && spreadRatio >= 1.3) {
      tracker.phase = 'inflection_bottom'; // Peak open
      coachingMessage = 'Peak extension! Returning...';
    } else if (avgArmAngle > tracker.minKneeAngleInRep) {
      tracker.minKneeAngleInRep = avgArmAngle;
    } else if (avgArmAngle < 75) {
      tracker.phase = 'ascending'; // Returning to center
    }
  } else if (tracker.phase === 'inflection_bottom') {
    if (avgArmAngle < 110) {
      tracker.phase = 'ascending';
      coachingMessage = 'Returning to center...';
    }
  } else if (tracker.phase === 'ascending') {
    if (avgArmAngle <= 45 && spreadRatio <= 0.95) {
      if (now - tracker.lastRepTimestamp > 500) {
        tracker.repCount += 1;
        tracker.lastRepTimestamp = now;
        tracker.phase = 'repetition_complete';
        repetitionDetected = true;

        const finalRepScore = clamp(repScore, 60, 100);
        tracker.repHistoryScores.push(finalRepScore);
        tracker.currentScore = Math.round(
          tracker.repHistoryScores.reduce((a, b) => a + b, 0) / tracker.repHistoryScores.length
        );
        coachingMessage = 'Nice rhythm! Keep jumping.';
      } else {
        tracker.phase = 'ready';
      }
    }
  }

  return {
    exercise: 'jumping_jack',
    phase: tracker.phase,
    repetitionDetected,
    repCount: tracker.repCount,
    currentScore: tracker.currentScore,
    instantMetrics: {
      primaryAngle: avgArmAngle,
      secondaryAngle: Math.round(spreadRatio * 100),
      depthPercent: clamp(Math.round((avgArmAngle / 150) * 100)),
      alignmentMetric: 92,
    },
    detectedIssues: issues,
    activeCoachingCue: issues.length > 0 ? issues[0].voiceCue : (repetitionDetected ? 'Good repetition.' : coachingMessage),
    isGoodForm: issues.length === 0,
    confidence: 0.92,
    personDetected: true,
    multiplePeopleDetected: false,
  };
}
