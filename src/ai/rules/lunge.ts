/**
 * Lunge Biomechanical Form Analysis Engine
 * FormFit AI — Health Tech Track
 */

import { Landmark, FormAnalysisResult, FormIssue } from '../../types';
import { calculateAngle, calculateVerticalAngle, clamp } from '../math';
import { ExerciseStateTracker } from './squat';

export function analyzeLunge(
  landmarks: Landmark[],
  tracker: ExerciseStateTracker
): FormAnalysisResult {
  const issues: FormIssue[] = [];
  const now = Date.now();

  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftShoulder = landmarks[11];

  if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
    return {
      exercise: 'lunge',
      phase: tracker.phase,
      repetitionDetected: false,
      repCount: tracker.repCount,
      currentScore: tracker.currentScore,
      instantMetrics: { primaryAngle: 165 },
      detectedIssues: [],
      activeCoachingCue: 'Step back to show side view for lunge',
      isGoodForm: true,
      confidence: 0.5,
      personDetected: true,
      multiplePeopleDetected: false,
    };
  }

  // Determine front leg vs back leg based on knee flexion
  const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  
  // The leg bending lower is the primary active knee
  const primaryKneeAngle = Math.round(Math.min(leftAngle, rightAngle));
  const leadKnee = leftAngle < rightAngle ? leftKnee : rightKnee;
  const leadAnkle = leftAngle < rightAngle ? leftAnkle : rightAnkle;

  // Torso vertical alignment
  const torsoAngle = leftShoulder && leftHip ? calculateVerticalAngle(leftShoulder, leftHip) : 10;

  let repScore = 100;
  let coachingMessage = 'Step into lunge stance.';

  // Knee passing way past toes (knee X vs ankle X)
  const kneeOverToesExcessive = Math.abs(leadKnee.x - leadAnkle.x) > 0.16;
  if (primaryKneeAngle < 110 && kneeOverToesExcessive) {
    repScore -= 18;
    issues.push({
      id: `knee_toes_${now}`,
      code: 'KNEE_PAST_TOES',
      severity: 'warning',
      message: 'Keep front knee stacked over your heel',
      voiceCue: 'Keep your front shin vertical',
      bodyPart: 'knees',
      timestamp: now,
    });
    coachingMessage = 'Stack front knee above ankle';
  }

  // Excessive torso forward pitch
  if (torsoAngle > 30) {
    repScore -= 15;
    issues.push({
      id: `torso_${now}`,
      code: 'LEANING_FORWARD',
      severity: 'warning',
      message: 'Keep your torso tall and core tight',
      voiceCue: 'Keep your upper body upright',
      bodyPart: 'back',
      timestamp: now,
    });
  }

  let repetitionDetected = false;

  if (tracker.phase === 'ready' || tracker.phase === 'repetition_complete') {
    if (primaryKneeAngle < 140) {
      tracker.phase = 'descending';
      tracker.minKneeAngleInRep = primaryKneeAngle;
      coachingMessage = 'Lowering into lunge...';
    } else {
      tracker.phase = 'ready';
    }
  } else if (tracker.phase === 'descending') {
    if (primaryKneeAngle <= 95) {
      tracker.phase = 'inflection_bottom';
      coachingMessage = 'Great 90-degree depth! Step up.';
    } else if (primaryKneeAngle < tracker.minKneeAngleInRep) {
      tracker.minKneeAngleInRep = primaryKneeAngle;
    } else if (primaryKneeAngle > 115) {
      tracker.phase = 'ascending';
    }
  } else if (tracker.phase === 'inflection_bottom') {
    if (primaryKneeAngle > 105) {
      tracker.phase = 'ascending';
      coachingMessage = 'Pushing through front heel...';
    }
  } else if (tracker.phase === 'ascending') {
    if (primaryKneeAngle >= 150) {
      if (now - tracker.lastRepTimestamp > 800 && tracker.minKneeAngleInRep < 115) {
        tracker.repCount += 1;
        tracker.lastRepTimestamp = now;
        tracker.phase = 'repetition_complete';
        repetitionDetected = true;

        const finalRepScore = clamp(repScore, 50, 100);
        tracker.repHistoryScores.push(finalRepScore);
        tracker.currentScore = Math.round(
          tracker.repHistoryScores.reduce((a, b) => a + b, 0) / tracker.repHistoryScores.length
        );
        coachingMessage = 'Clean lunge repetition!';
      } else {
        tracker.phase = 'ready';
      }
    }
  }

  const depthPercent = clamp(Math.round(((160 - primaryKneeAngle) / (160 - 90)) * 100), 0, 100);

  return {
    exercise: 'lunge',
    phase: tracker.phase,
    repetitionDetected,
    repCount: tracker.repCount,
    currentScore: tracker.currentScore,
    instantMetrics: {
      primaryAngle: primaryKneeAngle,
      torsoAngle: Math.round(torsoAngle),
      depthPercent,
      alignmentMetric: 90,
    },
    detectedIssues: issues,
    activeCoachingCue: issues.length > 0 ? issues[0].voiceCue : (repetitionDetected ? 'Good repetition.' : coachingMessage),
    isGoodForm: issues.length === 0,
    confidence: 0.9,
    personDetected: true,
    multiplePeopleDetected: false,
  };
}
