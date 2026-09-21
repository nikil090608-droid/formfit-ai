/**
 * Plank Biomechanical Form Analysis Engine
 * FormFit AI — Health Tech Track
 */

import { Landmark, FormAnalysisResult, FormIssue } from '../../types';
import { calculateAngle, clamp } from '../math';
import { ExerciseStateTracker } from './squat';

export function analyzePlank(
  landmarks: Landmark[],
  tracker: ExerciseStateTracker
): FormAnalysisResult {
  const issues: FormIssue[] = [];
  const now = Date.now();

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  if (!leftShoulder || !leftHip || !leftAnkle) {
    return {
      exercise: 'plank',
      phase: tracker.phase,
      repetitionDetected: false,
      repCount: tracker.repCount,
      currentScore: tracker.currentScore,
      instantMetrics: { primaryAngle: 175 },
      detectedIssues: [],
      activeCoachingCue: 'Hold full body in camera frame',
      isGoodForm: true,
      confidence: 0.5,
      personDetected: true,
      multiplePeopleDetected: false,
    };
  }

  // Measure body alignment: shoulder - hip - ankle (ideal is 165° - 180°)
  const leftAlignment = calculateAngle(leftShoulder, leftHip, leftAnkle);
  const rightAlignment = rightShoulder && rightHip && rightAnkle
    ? calculateAngle(rightShoulder, rightHip, rightAnkle)
    : leftAlignment;
  const avgAlignment = Math.round((leftAlignment + rightAlignment) / 2);

  let formScore = 100;
  let coachingMessage = 'Solid plank hold. Maintain tension.';

  // Check hip sag (angle drops below 150°)
  if (avgAlignment < 155) {
    formScore -= 30;
    issues.push({
      id: `sag_${now}`,
      code: 'HIP_SAG',
      severity: 'critical',
      message: 'Hips are sagging. Tighten your core and glutes.',
      voiceCue: 'Engage your core and lift hips slightly',
      bodyPart: 'hips',
      timestamp: now,
    });
    coachingMessage = 'Lift hips slightly, engage core';
  } else if (avgAlignment > 185) {
    formScore -= 20;
    issues.push({
      id: `pike_${now}`,
      code: 'HIP_PIKE',
      severity: 'warning',
      message: 'Hips are piked too high. Flatten your back.',
      voiceCue: 'Lower your hips to a straight line',
      bodyPart: 'back',
      timestamp: now,
    });
    coachingMessage = 'Lower hips into a flat line';
  }

  // Count 5-second sustained hold blocks as repetitions
  let repetitionDetected = false;
  tracker.phase = 'holding';

  if (!tracker.phaseStartTime) {
    tracker.phaseStartTime = now;
  }

  const holdDurationSeconds = Math.floor((now - tracker.phaseStartTime) / 1000);
  const targetBlocks = Math.floor(holdDurationSeconds / 5); // 1 rep every 5 seconds of clean hold
  
  if (targetBlocks > tracker.repCount && issues.length === 0) {
    tracker.repCount = targetBlocks;
    repetitionDetected = true;
    tracker.repHistoryScores.push(clamp(formScore, 60, 100));
    tracker.currentScore = Math.round(
      tracker.repHistoryScores.reduce((a, b) => a + b, 0) / tracker.repHistoryScores.length
    );
  }

  return {
    exercise: 'plank',
    phase: 'holding',
    repetitionDetected,
    repCount: tracker.repCount,
    currentScore: tracker.repCount === 0 ? 0 : clamp(formScore, 50, 100),
    instantMetrics: {
      primaryAngle: avgAlignment,
      torsoAngle: 0,
      depthPercent: clamp(Math.round((avgAlignment / 180) * 100)),
      alignmentMetric: avgAlignment > 155 && avgAlignment < 185 ? 96 : 65,
    },
    detectedIssues: issues,
    activeCoachingCue: issues.length > 0 ? issues[0].voiceCue : coachingMessage,
    isGoodForm: issues.length === 0,
    confidence: 0.93,
    personDetected: true,
    multiplePeopleDetected: false,
  };
}
