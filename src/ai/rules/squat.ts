/**
 * Squat Biomechanical Form Analysis Engine
 * FormFit AI — Health Tech Track
 */

import { Landmark, FormAnalysisResult, FormIssue, MovementPhase, SegmentIssueMap, FormQualityStatus } from '../../types';
import { calculateAngle, calculateVerticalAngle, checkKneeValgus, clamp } from '../math';

export interface ExerciseStateTracker {
  phase: MovementPhase;
  repCount: number;
  lastRepTimestamp: number;
  phaseStartTime: number;
  minKneeAngleInRep: number;
  currentScore: number;
  issuesThisRep: FormIssue[];
  repHistoryScores: number[];
  hadPreviousIssue?: boolean;
  repHasCriticalFault?: boolean;
  // Smoothing history buffer
  historyFrames?: Array<{
    knee: FormQualityStatus;
    torso: FormQualityStatus;
    head: FormQualityStatus;
    depth: FormQualityStatus;
  }>;
}

export function createInitialTracker(): ExerciseStateTracker {
  return {
    phase: 'ready',
    repCount: 0,
    lastRepTimestamp: 0,
    phaseStartTime: Date.now(),
    minKneeAngleInRep: 180,
    currentScore: 0,
    issuesThisRep: [],
    repHistoryScores: [],
    hadPreviousIssue: false,
    repHasCriticalFault: false,
    historyFrames: [],
  };
}

// Temporal smoothing helper to prevent single-frame flickering
function smoothQualityStatus(
  history: FormQualityStatus[],
  current: FormQualityStatus
): FormQualityStatus {
  if (history.length < 3) return current;
  const recent = [...history.slice(-3), current];
  const incorrectCount = recent.filter(s => s === 'incorrect').length;
  const attentionCount = recent.filter(s => s === 'attention').length;
  const goodCount = recent.filter(s => s === 'good').length;

  if (incorrectCount >= 2) return 'incorrect';
  if (goodCount >= 3) return 'good';
  if (attentionCount >= 2) return 'attention';
  return history[history.length - 1] || current;
}

export function analyzeSquat(
  landmarks: Landmark[],
  tracker: ExerciseStateTracker
): FormAnalysisResult {
  const issues: FormIssue[] = [];
  const now = Date.now();

  // MediaPipe landmarks:
  // 11, 12 = shoulders; 23, 24 = hips; 25, 26 = knees; 27, 28 = ankles
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  // Check required landmarks visibility & confidence
  const keyPoints = [leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle];
  const visibleKeyPoints = keyPoints.filter(p => p && (p.visibility === undefined || p.visibility >= 0.4));
  const overallConfidence = keyPoints.reduce((acc, p) => acc + (p?.visibility ?? 0.8), 0) / keyPoints.length;

  if (visibleKeyPoints.length < 6 || overallConfidence < 0.5) {
    return {
      exercise: 'squat',
      phase: 'ready',
      repetitionDetected: false,
      repCount: tracker.repCount,
      notCountingRep: false,
      currentScore: tracker.currentScore,
      liveFormScore: 0,
      confidenceLow: true,
      coachingStatusText: 'MOVE INTO VIEW',
      segmentStates: {
        head: 'good',
        headAlignment: 'good',
        torsoPosture: 'good',
        kneeAlignment: 'good',
        leftKneeAlignment: 'good',
        rightKneeAlignment: 'good',
        leftAnkle: 'good',
        rightAnkle: 'good',
        squatDepth: 'good',
        symmetry: 'good',
      },
      instantMetrics: { primaryAngle: 170 },
      detectedIssues: [{
        id: 'full_body_visible',
        code: 'BODY_NOT_VISIBLE',
        severity: 'info',
        message: 'Move into better camera view.',
        voiceCue: 'Move into better camera view.',
        bodyPart: 'hips',
        timestamp: now,
      }],
      activeCoachingCue: 'Move into better camera view.',
      isGoodForm: true,
      confidence: clamp(overallConfidence, 0.1, 0.45),
      personDetected: visibleKeyPoints.length > 2,
      multiplePeopleDetected: false,
    };
  }

  // MediaPipe Nose & Ears for Head/Neck alignment
  const nose = landmarks[0];

  // 1. Knee angles (left, right, and average)
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const avgKneeAngle = Math.round((leftKneeAngle + rightKneeAngle) / 2);

  // 2. Hip angles (shoulder - hip - knee)
  const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
  const avgHipAngle = Math.round((leftHipAngle + rightHipAngle) / 2);

  // 3. Torso inclination angle using shoulder center and hip center relative to vertical plumb line
  const shoulderCenter = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  const hipCenter = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };
  const dxTorso = Math.abs(shoulderCenter.x - hipCenter.x);
  const dyTorso = Math.abs(shoulderCenter.y - hipCenter.y);
  const avgTorsoLean = Math.round((Math.atan2(dxTorso, Math.max(0.001, dyTorso)) * 180) / Math.PI);

  // 4. Head / Neck / Torso Alignment Guide calculation
  // Vector of spine (hipCenter -> shoulderCenter)
  const spineDx = shoulderCenter.x - hipCenter.x;
  const spineDy = shoulderCenter.y - hipCenter.y;
  const spineLen = Math.hypot(spineDx, spineDy);

  let headDeviationDeg = 0;
  let rawHeadState: FormQualityStatus = 'good';
  if (nose && (nose.visibility === undefined || nose.visibility >= 0.35) && spineLen > 0.02) {
    // Vector of head from shoulderCenter to nose
    const headDx = nose.x - shoulderCenter.x;
    const headDy = nose.y - shoulderCenter.y;
    const headLen = Math.hypot(headDx, headDy);

    if (headLen > 0.01) {
      const angleSpine = Math.atan2(spineDy, spineDx);
      const angleHead = Math.atan2(headDy, headDx);
      let diff = Math.abs((angleHead - angleSpine) * 180 / Math.PI);
      if (diff > 180) diff = 360 - diff;
      headDeviationDeg = Math.round(diff);

      if (headDeviationDeg > 28) {
        rawHeadState = 'incorrect';
        issues.push({
          id: `head_${now}`,
          code: 'HEAD_MISALIGNMENT',
          severity: 'critical',
          message: 'Keep your head aligned',
          voiceCue: 'Keep your head aligned.',
          bodyPart: 'head',
          timestamp: now,
        });
      } else if (headDeviationDeg > 20) {
        rawHeadState = 'attention';
        issues.push({
          id: `head_warn_${now}`,
          code: 'HEAD_POSTURE_BORDERLINE',
          severity: 'warning',
          message: 'Watch head posture',
          voiceCue: 'Keep your head aligned.',
          bodyPart: 'head',
          timestamp: now,
        });
      }
    }
  }

  // 5. Knee valgus and tracking check
  const valgus = checkKneeValgus(leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle);

  // 6. Left/Right symmetry
  const kneeAngleDiff = Math.abs(leftKneeAngle - rightKneeAngle);

  // Update minimum angle encountered during current descent
  if (tracker.phase === 'descending' || tracker.phase === 'inflection_bottom') {
    if (avgKneeAngle < tracker.minKneeAngleInRep) {
      tracker.minKneeAngleInRep = avgKneeAngle;
    }
  }

  let repetitionDetected = false;

  // Raw segment states before smoothing
  let rawKneeState: FormQualityStatus = 'good';
  let rawLeftKnee: FormQualityStatus = 'good';
  let rawRightKnee: FormQualityStatus = 'good';
  let rawTorsoState: FormQualityStatus = 'good';
  let rawSquatDepth: FormQualityStatus = 'good';
  let rawSymmetry: FormQualityStatus = 'good';

  // --- Segment 1: Knee Alignment & Tracking ---
  const isKneeBending = avgKneeAngle < 155;
  if (isKneeBending) {
    if (valgus.hasValgus || valgus.ratio < 0.80) {
      rawKneeState = 'incorrect';
      rawLeftKnee = 'incorrect';
      rawRightKnee = 'incorrect';
      issues.push({
        id: `valgus_${now}`,
        code: 'KNEE_VALGUS',
        severity: 'critical',
        message: 'Knees moving inward',
        voiceCue: 'Keep your knees aligned with your feet.',
        bodyPart: 'knees',
        timestamp: now,
      });
    } else if (valgus.ratio < 0.88) {
      rawKneeState = 'attention';
      rawLeftKnee = 'attention';
      rawRightKnee = 'attention';
      issues.push({
        id: `valgus_warn_${now}`,
        code: 'KNEE_VALGUS_BORDERLINE',
        severity: 'warning',
        message: 'Watch your knee alignment',
        voiceCue: 'Keep your knees aligned with your feet.',
        bodyPart: 'knees',
        timestamp: now,
      });
    }
  }

  // --- Segment 2: Torso / Back Posture ---
  const torsoThreshold = isKneeBending ? 42 : 32;
  const torsoWarnThreshold = isKneeBending ? 35 : 25;
  if (avgTorsoLean > torsoThreshold) {
    rawTorsoState = 'incorrect';
    issues.push({
      id: `torso_${now}`,
      code: 'EXCESSIVE_TORSO_LEAN',
      severity: 'critical',
      message: 'Torso leaning too far forward',
      voiceCue: 'Keep your torso more upright.',
      bodyPart: 'back',
      timestamp: now,
    });
  } else if (avgTorsoLean > torsoWarnThreshold) {
    rawTorsoState = 'attention';
    issues.push({
      id: `torso_warn_${now}`,
      code: 'TORSO_LEAN_BORDERLINE',
      severity: 'warning',
      message: 'Keep your chest lifted',
      voiceCue: 'Keep your torso more upright.',
      bodyPart: 'back',
      timestamp: now,
    });
  }

  // --- Segment 3: Left / Right Symmetry ---
  if (kneeAngleDiff > 22 && isKneeBending) {
    rawSymmetry = 'incorrect';
  } else if (kneeAngleDiff > 14 && isKneeBending) {
    rawSymmetry = 'attention';
  }

  // --- State Machine for Repetition Counting ---
  if (tracker.phase === 'ready' || tracker.phase === 'repetition_complete') {
    if (avgKneeAngle < 145) {
      tracker.phase = 'descending';
      tracker.phaseStartTime = now;
      tracker.minKneeAngleInRep = avgKneeAngle;
      tracker.issuesThisRep = [];
      tracker.repHasCriticalFault = false;
    } else {
      tracker.phase = 'ready';
    }
  } else if (tracker.phase === 'descending') {
    if (avgKneeAngle <= 95) {
      tracker.phase = 'inflection_bottom';
      rawSquatDepth = 'good';
    } else if (avgKneeAngle > 145 && tracker.minKneeAngleInRep > 105) {
      // Reversing too early without hitting depth
      rawSquatDepth = tracker.minKneeAngleInRep > 115 ? 'incorrect' : 'attention';
      issues.push({
        id: `shallow_${now}`,
        code: 'INSUFFICIENT_DEPTH',
        severity: rawSquatDepth === 'incorrect' ? 'critical' : 'warning',
        message: 'Squat depth too shallow',
        voiceCue: 'Go slightly deeper.',
        bodyPart: 'depth',
        timestamp: now,
      });
      tracker.phase = 'ascending';
    } else if (avgKneeAngle > 110 && tracker.minKneeAngleInRep <= 105) {
      tracker.phase = 'ascending';
    }
  } else if (tracker.phase === 'inflection_bottom') {
    if (avgKneeAngle <= 98) {
      rawSquatDepth = 'good';
    }
    if (avgKneeAngle > 105) {
      tracker.phase = 'ascending';
    }
  } else if (tracker.phase === 'ascending') {
    // Check if bottom depth was insufficient during this rep
    if (tracker.minKneeAngleInRep > 105) {
      rawSquatDepth = tracker.minKneeAngleInRep > 115 ? 'incorrect' : 'attention';
      if (!issues.some(i => i.code === 'INSUFFICIENT_DEPTH')) {
        issues.push({
          id: `shallow_${now}`,
          code: 'INSUFFICIENT_DEPTH',
          severity: rawSquatDepth === 'incorrect' ? 'critical' : 'warning',
          message: 'Go slightly deeper',
          voiceCue: 'Go slightly deeper.',
          bodyPart: 'depth',
          timestamp: now,
        });
      }
    }

    if (avgKneeAngle >= 155) {
      // Rep complete check: only valid if depth reached (<105°) and no unresolved critical fault
      const isValidRep = !tracker.repHasCriticalFault && tracker.minKneeAngleInRep < 112 && (now - tracker.lastRepTimestamp > 750);
      if (isValidRep) {
        tracker.repCount += 1;
        tracker.lastRepTimestamp = now;
        tracker.phase = 'repetition_complete';
        repetitionDetected = true;

        // Calculate score for completed rep
        let repScore = 100;
        if (rawKneeState === 'incorrect') repScore -= 26;
        else if (rawKneeState === 'attention') repScore -= 12;

        if (rawTorsoState === 'incorrect') repScore -= 20;
        else if (rawTorsoState === 'attention') repScore -= 10;

        if (rawHeadState === 'incorrect') repScore -= 15;
        else if (rawHeadState === 'attention') repScore -= 8;

        if (tracker.minKneeAngleInRep > 95) repScore -= 14;
        if (rawSymmetry === 'incorrect') repScore -= 10;

        const finalRepScore = clamp(repScore, 50, 100);
        tracker.repHistoryScores.push(finalRepScore);
        tracker.currentScore = Math.round(
          tracker.repHistoryScores.reduce((a, b) => a + b, 0) / tracker.repHistoryScores.length
        );
      } else {
        // Form was incorrect or movement was invalid — do not count as a repetition
        tracker.phase = 'ready';
      }
      tracker.repHasCriticalFault = false;
    }
  }

  // Check if current movement has a critical form issue
  const hasCriticalFaultNow = rawKneeState === 'incorrect' || rawTorsoState === 'incorrect' || rawHeadState === 'incorrect' || rawSquatDepth === 'incorrect';
  if (hasCriticalFaultNow && (tracker.phase === 'descending' || tracker.phase === 'inflection_bottom' || tracker.phase === 'ascending')) {
    tracker.repHasCriticalFault = true;
  }
  const notCountingRep = Boolean(tracker.repHasCriticalFault && (tracker.phase === 'descending' || tracker.phase === 'inflection_bottom' || tracker.phase === 'ascending'));

  // --- Temporal Smoothing Buffer (Section 14) ---
  if (!tracker.historyFrames) tracker.historyFrames = [];
  tracker.historyFrames.push({
    knee: rawKneeState,
    torso: rawTorsoState,
    head: rawHeadState,
    depth: rawSquatDepth,
  });
  if (tracker.historyFrames.length > 8) tracker.historyFrames.shift();

  const kneeHistory = tracker.historyFrames.map(f => f.knee);
  const torsoHistory = tracker.historyFrames.map(f => f.torso);
  const headHistory = tracker.historyFrames.map(f => f.head);
  const depthHistory = tracker.historyFrames.map(f => f.depth);

  const kneeAlignmentState = smoothQualityStatus(kneeHistory, rawKneeState);
  const leftKneeState = smoothQualityStatus(kneeHistory, rawLeftKnee);
  const rightKneeState = smoothQualityStatus(kneeHistory, rawRightKnee);
  const torsoPostureState = smoothQualityStatus(torsoHistory, rawTorsoState);
  const headAlignmentState = smoothQualityStatus(headHistory, rawHeadState);
  const squatDepthState = smoothQualityStatus(depthHistory, rawSquatDepth);
  const symmetryState = rawSymmetry;

  // --- Real-time Instant Form Score Calculation ---
  let instantDeductions = 0;
  if (kneeAlignmentState === 'incorrect') instantDeductions += 26;
  else if (kneeAlignmentState === 'attention') instantDeductions += 12;

  if (torsoPostureState === 'incorrect') instantDeductions += 22;
  else if (torsoPostureState === 'attention') instantDeductions += 10;

  if (headAlignmentState === 'incorrect') instantDeductions += 18;
  else if (headAlignmentState === 'attention') instantDeductions += 8;

  if (squatDepthState === 'incorrect') instantDeductions += 18;
  else if (squatDepthState === 'attention') instantDeductions += 8;

  if (symmetryState === 'incorrect') instantDeductions += 12;
  else if (symmetryState === 'attention') instantDeductions += 6;

  // Instant score for the live HUD: e.g. 92% if good, 35%-68% if issues
  const liveFormScore = clamp(94 - instantDeductions, 35, 98);

  // --- Dynamic Live Voice Coaching Cue Resolution ---
  let activeCoachingCue = 'Good form.';
  const hasKneeIssue = kneeAlignmentState !== 'good';
  const hasTorsoIssue = torsoPostureState !== 'good';
  const hasHeadIssue = headAlignmentState !== 'good';
  const hasDepthIssue = squatDepthState !== 'good';

  if (hasKneeIssue) {
    activeCoachingCue = 'Keep your knees aligned with your feet.';
  } else if (hasTorsoIssue) {
    activeCoachingCue = 'Keep your torso more upright.';
  } else if (hasHeadIssue) {
    activeCoachingCue = 'Keep your head aligned.';
  } else if (hasDepthIssue) {
    activeCoachingCue = 'Go slightly deeper.';
  } else {
    // Correct form!
    if (tracker.hadPreviousIssue) {
      activeCoachingCue = 'Good correction.';
    } else {
      activeCoachingCue = 'Good form.';
    }
  }

  // Update tracking flag for previous issues
  const currentHasIssue = hasKneeIssue || hasTorsoIssue || hasHeadIssue || hasDepthIssue;
  tracker.hadPreviousIssue = currentHasIssue;

  // --- Determine Status Badge Text ---
  let coachingStatusText: 'GOOD FORM' | 'FORM ISSUE' | 'ATTENTION' | 'READY' = 'GOOD FORM';
  if (currentHasIssue) {
    if (kneeAlignmentState === 'incorrect' || torsoPostureState === 'incorrect' || headAlignmentState === 'incorrect' || squatDepthState === 'incorrect') {
      coachingStatusText = 'FORM ISSUE';
    } else {
      coachingStatusText = 'ATTENTION';
    }
  } else if (tracker.phase === 'ready' && tracker.repCount === 0 && avgKneeAngle >= 160) {
    coachingStatusText = 'READY';
  }

  // Depth percentage (100% = 90° knee angle)
  const depthPercent = clamp(Math.round(((165 - avgKneeAngle) / (165 - 85)) * 100), 0, 100);

  const segmentStates: SegmentIssueMap = {
    head: headAlignmentState,
    headAlignment: headAlignmentState,
    torsoPosture: torsoPostureState,
    kneeAlignment: kneeAlignmentState,
    leftKneeAlignment: leftKneeState,
    rightKneeAlignment: rightKneeState,
    leftAnkle: leftKneeState,
    rightAnkle: rightKneeState,
    squatDepth: squatDepthState,
    symmetry: symmetryState,
  };

  return {
    exercise: 'squat',
    phase: tracker.phase,
    repetitionDetected,
    repCount: tracker.repCount,
    notCountingRep,
    currentScore: tracker.currentScore,
    liveFormScore,
    coachingStatusText,
    confidenceLow: false,
    segmentStates,
    instantMetrics: {
      primaryAngle: avgKneeAngle,
      secondaryAngle: avgHipAngle,
      torsoAngle: avgTorsoLean,
      depthPercent,
      alignmentMetric: Math.round(valgus.ratio * 100),
    },
    detectedIssues: issues,
    activeCoachingCue,
    isGoodForm: !currentHasIssue,
    confidence: 0.94,
    personDetected: true,
    multiplePeopleDetected: false,
  };
}

