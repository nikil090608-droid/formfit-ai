/**
 * Push-up Biomechanical Form Analysis Engine
 * FormFit AI — Health Tech Track
 */

import { Landmark, FormAnalysisResult, FormIssue } from '../../types';
import { calculateAngle, clamp } from '../math';
import { ExerciseStateTracker } from './squat';

export function analyzePushup(
  landmarks: Landmark[],
  tracker: ExerciseStateTracker
): FormAnalysisResult {
  const issues: FormIssue[] = [];
  const now = Date.now();

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  if (!leftShoulder || !leftElbow || !leftWrist || !leftHip || !leftAnkle) {
    return {
      exercise: 'pushup',
      phase: tracker.phase,
      repetitionDetected: false,
      repCount: tracker.repCount,
      currentScore: tracker.currentScore,
      instantMetrics: { primaryAngle: 160 },
      detectedIssues: [],
      activeCoachingCue: 'Ensure upper body and arms are visible',
      isGoodForm: true,
      confidence: 0.5,
      personDetected: true,
      multiplePeopleDetected: false,
    };
  }

  // Elbow angles (shoulder - elbow - wrist)
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = rightShoulder && rightElbow && rightWrist 
    ? calculateAngle(rightShoulder, rightElbow, rightWrist) 
    : leftElbowAngle;
  const avgElbowAngle = Math.round((leftElbowAngle + rightElbowAngle) / 2);

  // Core alignment (shoulder - hip - ankle). Should be straight line (160° - 180°)
  const leftBodyLine = calculateAngle(leftShoulder, leftHip, leftAnkle);
  const rightBodyLine = rightShoulder && rightHip && rightAnkle
    ? calculateAngle(rightShoulder, rightHip, rightAnkle)
    : leftBodyLine;
  const avgBodyLine = Math.round((leftBodyLine + rightBodyLine) / 2);

  let repScore = 100;
  let coachingMessage = 'High plank starting position.';

  // Check core sag or hip pike
  if (avgBodyLine < 155) {
    repScore -= 25;
    issues.push({
      id: `sag_${now}`,
      code: 'CORE_SAG_OR_PIKE',
      severity: 'critical',
      message: 'Keep your hips level with shoulders',
      voiceCue: 'Engage your core and keep your back straight',
      bodyPart: 'back',
      timestamp: now,
    });
    coachingMessage = 'Engage core, keep hips level';
  }

  let repetitionDetected = false;

  // Track min elbow angle in rep
  if (tracker.phase === 'descending' || tracker.phase === 'inflection_bottom') {
    if (avgElbowAngle < tracker.minKneeAngleInRep) {
      tracker.minKneeAngleInRep = avgElbowAngle;
    }
  }

  // Pushup State Machine
  // High plank: elbow > 150°
  // Descending: elbow < 140°
  // Bottom: elbow <= 90°
  // Ascending: elbow > 110°
  // Complete: elbow >= 150°
  if (tracker.phase === 'ready' || tracker.phase === 'repetition_complete') {
    if (avgElbowAngle < 140) {
      tracker.phase = 'descending';
      tracker.phaseStartTime = now;
      tracker.minKneeAngleInRep = avgElbowAngle;
      tracker.issuesThisRep = [];
      coachingMessage = 'Lowering chest towards floor...';
    } else {
      tracker.phase = 'ready';
      coachingMessage = 'Ready for pushup';
    }
  } else if (tracker.phase === 'descending') {
    if (avgElbowAngle <= 90) {
      tracker.phase = 'inflection_bottom';
      coachingMessage = 'Full depth reached. Press up!';
    } else if (avgElbowAngle > 120 && tracker.minKneeAngleInRep <= 95) {
      tracker.phase = 'ascending';
      coachingMessage = 'Pushing up...';
    }
  } else if (tracker.phase === 'inflection_bottom') {
    if (avgElbowAngle > 105) {
      tracker.phase = 'ascending';
      coachingMessage = 'Pushing up...';
    }
  } else if (tracker.phase === 'ascending') {
    if (avgElbowAngle >= 150) {
      if (now - tracker.lastRepTimestamp > 800 && tracker.minKneeAngleInRep <= 105) {
        tracker.repCount += 1;
        tracker.lastRepTimestamp = now;
        tracker.phase = 'repetition_complete';
        repetitionDetected = true;

        if (tracker.minKneeAngleInRep > 90) {
          repScore -= 12; // partial depth
        }
        const finalRepScore = clamp(repScore, 50, 100);
        tracker.repHistoryScores.push(finalRepScore);
        tracker.currentScore = Math.round(
          tracker.repHistoryScores.reduce((a, b) => a + b, 0) / tracker.repHistoryScores.length
        );
        coachingMessage = issues.length > 0 ? issues[0].message : 'Good push-up rep!';
      } else {
        tracker.phase = 'ready';
      }
    }
  }

  const depthPercent = clamp(Math.round(((160 - avgElbowAngle) / (160 - 80)) * 100), 0, 100);

  return {
    exercise: 'pushup',
    phase: tracker.phase,
    repetitionDetected,
    repCount: tracker.repCount,
    currentScore: tracker.currentScore,
    instantMetrics: {
      primaryAngle: avgElbowAngle,
      secondaryAngle: avgBodyLine,
      depthPercent,
      alignmentMetric: Math.round(clamp((avgBodyLine / 180) * 100)),
    },
    detectedIssues: issues,
    activeCoachingCue: issues.length > 0 ? issues[0].voiceCue : (repetitionDetected ? 'Good repetition.' : coachingMessage),
    isGoodForm: issues.length === 0,
    confidence: 0.92,
    personDetected: true,
    multiplePeopleDetected: false,
  };
}
