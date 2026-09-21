/**
 * Biomechanical Canvas Skeleton & Angle Arc Renderer
 * FormFit AI — Health Tech Track
 */

import { Landmark, FormAnalysisResult, FormQualityStatus, SegmentStyle } from '../types';

export interface SkeletonSegment {
  fromIdx: number;
  toIdx: number;
  fromName: string;
  toName: string;
  issue: 'kneeAlignment' | 'torsoPosture' | 'headAlignment' | 'squatDepth' | 'symmetry' | 'general';
  side: 'left' | 'right' | 'center';
}

// Skeletal bone connections mapped to biomechanical issues
export const SKELETON_SEGMENTS: SkeletonSegment[] = [
  // Head & Neck connections (Dynamic Head Alignment)
  { fromIdx: 11, toIdx: 0, fromName: 'leftShoulder', toName: 'nose', issue: 'headAlignment', side: 'left' },
  { fromIdx: 12, toIdx: 0, fromName: 'rightShoulder', toName: 'nose', issue: 'headAlignment', side: 'right' },
  { fromIdx: 0, toIdx: 7, fromName: 'nose', toName: 'leftEar', issue: 'headAlignment', side: 'left' },
  { fromIdx: 0, toIdx: 8, fromName: 'nose', toName: 'rightEar', issue: 'headAlignment', side: 'right' },

  // Upper body & Torso (Shoulder line, Shoulders to Hips, Pelvic line)
  { fromIdx: 11, toIdx: 12, fromName: 'leftShoulder', toName: 'rightShoulder', issue: 'torsoPosture', side: 'center' },
  { fromIdx: 11, toIdx: 23, fromName: 'leftShoulder', toName: 'leftHip', issue: 'torsoPosture', side: 'left' },
  { fromIdx: 12, toIdx: 24, fromName: 'rightShoulder', toName: 'rightHip', issue: 'torsoPosture', side: 'right' },
  { fromIdx: 23, toIdx: 24, fromName: 'leftHip', toName: 'rightHip', issue: 'torsoPosture', side: 'center' },

  // Left leg (Hip -> Knee, Knee -> Ankle, Foot)
  { fromIdx: 23, toIdx: 25, fromName: 'leftHip', toName: 'leftKnee', issue: 'kneeAlignment', side: 'left' },
  { fromIdx: 25, toIdx: 27, fromName: 'leftKnee', toName: 'leftAnkle', issue: 'kneeAlignment', side: 'left' },
  { fromIdx: 27, toIdx: 29, fromName: 'leftAnkle', toName: 'leftHeel', issue: 'kneeAlignment', side: 'left' },
  { fromIdx: 29, toIdx: 31, fromName: 'leftHeel', toName: 'leftToe', issue: 'kneeAlignment', side: 'left' },

  // Right leg (Hip -> Knee, Knee -> Ankle, Foot)
  { fromIdx: 24, toIdx: 26, fromName: 'rightHip', toName: 'rightKnee', issue: 'kneeAlignment', side: 'right' },
  { fromIdx: 26, toIdx: 28, fromName: 'rightKnee', toName: 'rightAnkle', issue: 'kneeAlignment', side: 'right' },
  { fromIdx: 28, toIdx: 30, fromName: 'rightAnkle', toName: 'rightHeel', issue: 'kneeAlignment', side: 'right' },
  { fromIdx: 30, toIdx: 32, fromName: 'rightHeel', toName: 'rightToe', issue: 'kneeAlignment', side: 'right' },

  // Left arm (Upper and Forearm)
  { fromIdx: 11, toIdx: 13, fromName: 'leftShoulder', toName: 'leftElbow', issue: 'general', side: 'left' },
  { fromIdx: 13, toIdx: 15, fromName: 'leftElbow', toName: 'leftWrist', issue: 'general', side: 'left' },

  // Right arm (Upper and Forearm)
  { fromIdx: 12, toIdx: 14, fromName: 'rightShoulder', toName: 'rightElbow', issue: 'general', side: 'right' },
  { fromIdx: 14, toIdx: 16, fromName: 'rightElbow', toName: 'rightWrist', issue: 'general', side: 'right' },
];

/**
 * Reusable helper to resolve the dynamic visual style for a specific body segment or landmark.
 * Translates biomechanical analysis into GREEN, YELLOW, or RED styling.
 */
export function getLandmarkStyle(
  analysis: FormAnalysisResult | null,
  segmentIssueType: 'kneeAlignment' | 'torsoPosture' | 'headAlignment' | 'squatDepth' | 'symmetry' | 'general',
  side: 'left' | 'right' | 'center' = 'center'
): SegmentStyle {
  // 1. If analysis is missing or camera confidence is poor: render neutral gray skeleton
  if (!analysis || analysis.confidenceLow || analysis.confidence < 0.5) {
    return {
      color: 'rgba(148, 163, 184, 0.45)', // Slate 400 neutral
      width: 3.5,
      glow: 'transparent',
      status: 'neutral',
    };
  }

  let status: FormQualityStatus = 'good';

  if (analysis.segmentStates) {
    const states = analysis.segmentStates;
    if (segmentIssueType === 'kneeAlignment') {
      if (side === 'left' && states.leftKneeAlignment) {
        status = states.leftKneeAlignment;
      } else if (side === 'right' && states.rightKneeAlignment) {
        status = states.rightKneeAlignment;
      } else {
        status = states.kneeAlignment;
      }
    } else if (segmentIssueType === 'torsoPosture') {
      status = states.torsoPosture;
    } else if (segmentIssueType === 'headAlignment') {
      status = states.headAlignment || states.head || 'good';
    } else if (segmentIssueType === 'squatDepth') {
      status = states.squatDepth;
    } else if (segmentIssueType === 'symmetry') {
      status = states.symmetry;
    }
  } else {
    // Fallback: examine detectedIssues list
    const hasCrit = analysis.detectedIssues?.some(i => {
      if (segmentIssueType === 'kneeAlignment') return i.bodyPart === 'knees' && i.severity === 'critical';
      if (segmentIssueType === 'torsoPosture') return i.bodyPart === 'back' && i.severity === 'critical';
      if (segmentIssueType === 'headAlignment') return i.bodyPart === 'head' && i.severity === 'critical';
      if (segmentIssueType === 'squatDepth') return i.bodyPart === 'depth' && i.severity === 'critical';
      return false;
    });
    const hasWarn = analysis.detectedIssues?.some(i => {
      if (segmentIssueType === 'kneeAlignment') return i.bodyPart === 'knees';
      if (segmentIssueType === 'torsoPosture') return i.bodyPart === 'back';
      if (segmentIssueType === 'headAlignment') return i.bodyPart === 'head';
      if (segmentIssueType === 'squatDepth') return i.bodyPart === 'depth';
      return false;
    });

    if (hasCrit) status = 'incorrect';
    else if (hasWarn) status = 'attention';
  }

  // Map to theme colors, line width (4–6px), and subtle glow
  if (status === 'incorrect') {
    return {
      color: '#EF4444', // RED (Incorrect form)
      width: 5.5,       // 4–6px wide
      glow: 'rgba(239, 68, 68, 0.65)',
      status: 'incorrect',
    };
  } else if (status === 'attention') {
    return {
      color: '#F59E0B', // YELLOW (Attention / Borderline)
      width: 4.5,
      glow: 'rgba(245, 158, 11, 0.45)',
      status: 'attention',
    };
  } else {
    return {
      color: '#10B981', // GREEN (Correct form)
      width: 4.0,
      glow: 'rgba(16, 185, 129, 0.4)',
      status: 'good',
    };
  }
}

export function renderSkeletonOnCanvas(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[] | null,
  analysis: FormAnalysisResult | null,
  width: number,
  height: number,
  isMirrored = true
): void {
  ctx.clearRect(0, 0, width, height);
  if (!landmarks || landmarks.length < 29) return;

  ctx.save();

  // Helper to map normalized [0, 1] coordinates to canvas pixels
  const getCoords = (lm: Landmark) => {
    const x = isMirrored ? (1 - lm.x) * width : lm.x * width;
    const y = lm.y * height;
    return { x, y };
  };

  const isLowConfidence = !analysis || analysis.confidenceLow || analysis.confidence < 0.5;

  // 1. Draw Connecting Bones with Dynamic Segment-Specific Styling
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const segment of SKELETON_SEGMENTS) {
    const ptA = landmarks[segment.fromIdx];
    const ptB = landmarks[segment.toIdx];

    if (!ptA || !ptB) continue;
    if (ptA.visibility !== undefined && ptA.visibility < 0.35) continue;
    if (ptB.visibility !== undefined && ptB.visibility < 0.35) continue;

    const a = getCoords(ptA);
    const b = getCoords(ptB);

    // Get style dynamically for this specific segment
    let style = getLandmarkStyle(analysis, segment.issue, segment.side);

    // Special case for Squat Depth: If knee tracking is good, but depth is insufficient,
    // highlight the thigh (hip -> knee) segments with the depth state (YELLOW or RED)
    if (analysis?.exercise === 'squat' && (segment.fromIdx === 23 && segment.toIdx === 25 || segment.fromIdx === 24 && segment.toIdx === 26)) {
      if (style.status === 'good' && analysis.segmentStates?.squatDepth && analysis.segmentStates.squatDepth !== 'good') {
        style = getLandmarkStyle(analysis, 'squatDepth', segment.side);
      }
    }

    ctx.save();
    ctx.lineWidth = style.width;
    ctx.strokeStyle = style.color;
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = style.status === 'incorrect' ? 14 : (style.status === 'attention' ? 9 : 8);

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Draw Landmark Joint Nodes with Segment-Aware Colors
  const keyNodes = [0, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  
  // Track joint error states for node colors
  const leftKneeIssue = analysis?.segmentStates?.leftKneeAlignment === 'incorrect' || analysis?.segmentStates?.kneeAlignment === 'incorrect';
  const rightKneeIssue = analysis?.segmentStates?.rightKneeAlignment === 'incorrect' || analysis?.segmentStates?.kneeAlignment === 'incorrect';
  const torsoIssue = analysis?.segmentStates?.torsoPosture === 'incorrect';
  const headIssue = analysis?.segmentStates?.headAlignment === 'incorrect' || analysis?.segmentStates?.head === 'incorrect';
  const headAttention = analysis?.segmentStates?.headAlignment === 'attention' || analysis?.segmentStates?.head === 'attention';
  const depthIssue = analysis?.segmentStates?.squatDepth === 'incorrect';

  for (const idx of keyNodes) {
    const pt = landmarks[idx];
    if (!pt || (pt.visibility !== undefined && pt.visibility < 0.35)) continue;

    const { x, y } = getCoords(pt);

    let nodeColor = '#10B981'; // Green default
    let isProblemJoint = false;

    if (isLowConfidence) {
      nodeColor = '#64748b'; // Slate 500
    } else if (idx === 25 && leftKneeIssue) {
      nodeColor = '#EF4444';
      isProblemJoint = true;
    } else if (idx === 26 && rightKneeIssue) {
      nodeColor = '#EF4444';
      isProblemJoint = true;
    } else if ((idx === 0 || idx === 7 || idx === 8) && (headIssue || headAttention)) {
      nodeColor = headIssue ? '#EF4444' : '#F59E0B';
      isProblemJoint = headIssue;
    } else if ((idx === 11 || idx === 12) && torsoIssue) {
      nodeColor = '#EF4444';
      isProblemJoint = true;
    } else if ((idx === 23 || idx === 24) && (torsoIssue || depthIssue)) {
      nodeColor = depthIssue && !torsoIssue ? '#F59E0B' : '#EF4444';
      isProblemJoint = true;
    }

    ctx.save();

    // Red warning circular highlight around problematic knee landmark
    if (isProblemJoint && (idx === 25 || idx === 26)) {
      // Outer pulsating warning ring
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Warning pill indicator near the knee
      const badgeX = isMirrored ? (idx === 25 ? x + 16 : x - 80) : (idx === 25 ? x - 80 : x + 16);
      const badgeY = y - 10;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.92)';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, 74, 19, 5);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠ KNEE INWARD', badgeX + 37, badgeY + 9.5);
    }

    // Outer Aura Node
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, 2 * Math.PI);
    ctx.fillStyle = isProblemJoint ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.85)';
    ctx.fill();

    // Inner Core Node
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = nodeColor;
    ctx.fill();

    ctx.restore();
  }

  // 3. Draw Angle Badge & Indicator at Primary Joint
  if (analysis?.instantMetrics?.primaryAngle && !isLowConfidence) {
    const targetIdx = analysis.exercise === 'pushup' ? 13 : (analysis.exercise === 'jumping_jack' ? 11 : 25);
    const anchorPt = landmarks[targetIdx];

    if (anchorPt && (anchorPt.visibility === undefined || anchorPt.visibility > 0.4)) {
      const { x, y } = getCoords(anchorPt);
      const angleVal = `${Math.round(analysis.instantMetrics.primaryAngle)}°`;

      const badgeW = 48;
      const badgeH = 22;
      const badgeX = x + 14;
      const badgeY = y - 11;

      const badgeBorderColor = leftKneeIssue ? '#EF4444' : (analysis.segmentStates?.squatDepth === 'attention' ? '#F59E0B' : '#10B981');

      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = badgeBorderColor;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(angleVal, badgeX + badgeW / 2, badgeY + badgeH / 2);
      ctx.restore();
    }
  }

  // 4. Draw HEAD / NECK / TORSO ALIGNMENT GUIDE (Section 3)
  if (landmarks[0] && landmarks[11] && landmarks[12] && landmarks[23] && landmarks[24] && !isLowConfidence) {
    const leftS = getCoords(landmarks[11]);
    const rightS = getCoords(landmarks[12]);
    const leftH = getCoords(landmarks[23]);
    const rightH = getCoords(landmarks[24]);
    const noseCoord = getCoords(landmarks[0]);

    const neckCoord = {
      x: (leftS.x + rightS.x) / 2,
      y: (leftS.y + rightS.y) / 2,
    };
    const hipCoord = {
      x: (leftH.x + rightH.x) / 2,
      y: (leftH.y + rightH.y) / 2,
    };

    const spineDx = neckCoord.x - hipCoord.x;
    const spineDy = neckCoord.y - hipCoord.y;
    const spineLen = Math.hypot(spineDx, spineDy);

    if (spineLen > 10) {
      const uSpineX = spineDx / spineLen;
      const uSpineY = spineDy / spineLen;
      const guideEnd = {
        x: neckCoord.x + uSpineX * 45,
        y: neckCoord.y + uSpineY * 45,
      };

      ctx.save();
      const headStyle = getLandmarkStyle(analysis, 'headAlignment', 'center');

      // Alignment line from neck midpoint to head/nose
      ctx.beginPath();
      ctx.moveTo(neckCoord.x, neckCoord.y);
      ctx.lineTo(noseCoord.x, noseCoord.y);
      ctx.lineWidth = headStyle.status === 'incorrect' ? 4.5 : (headStyle.status === 'attention' ? 3.5 : 2.5);
      ctx.strokeStyle = headStyle.color;
      ctx.shadowColor = headStyle.glow;
      ctx.shadowBlur = headStyle.status === 'incorrect' ? 14 : 6;
      ctx.stroke();

      // Subtle extended dashed guide along neutral spine axis
      ctx.beginPath();
      ctx.setLineDash([3, 4]);
      ctx.moveTo(neckCoord.x, neckCoord.y);
      ctx.lineTo(guideEnd.x, guideEnd.y);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = headStyle.status === 'incorrect' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(16, 185, 129, 0.35)';
      ctx.shadowBlur = 0;
      ctx.stroke();

      // If head is misaligned, render floating warning badge
      if (headStyle.status === 'incorrect' || headStyle.status === 'attention') {
        const badgeW = 86;
        const badgeH = 20;
        const badgeX = isMirrored ? noseCoord.x - badgeW - 14 : noseCoord.x + 14;
        const badgeY = noseCoord.y - 10;

        ctx.fillStyle = headStyle.status === 'incorrect' ? 'rgba(239, 68, 68, 0.92)' : 'rgba(245, 158, 11, 0.92)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 5);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠ Head posture', badgeX + badgeW / 2, badgeY + badgeH / 2);
      }

      ctx.restore();
    }
  }

  // 5. Draw Knee Tracking Guideline during Squat
  if (analysis?.exercise === 'squat' && landmarks[25] && landmarks[27] && landmarks[26] && landmarks[28] && !isLowConfidence) {
    const leftK = getCoords(landmarks[25]);
    const leftA = getCoords(landmarks[27]);
    const rightK = getCoords(landmarks[26]);
    const rightA = getCoords(landmarks[28]);

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = leftKneeIssue || rightKneeIssue ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.35)';

    ctx.beginPath();
    ctx.moveTo(leftK.x, leftK.y);
    ctx.lineTo(leftA.x, leftA.y);
    ctx.moveTo(rightK.x, rightK.y);
    ctx.lineTo(rightA.x, rightA.y);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

