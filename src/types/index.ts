/**
 * FormFit AI — Type Definitions
 * iQOO Hackathon 2026 Hyderabad (Health Tech Track)
 */

export type ExerciseType = 'squat' | 'pushup' | 'lunge' | 'plank' | 'jumping_jack';

export type MovementPhase = 
  | 'idle'
  | 'ready'
  | 'descending'
  | 'inflection_bottom'
  | 'ascending'
  | 'holding'
  | 'repetition_complete';

export interface Landmark {
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  z?: number;
  visibility?: number;
}

export type LandmarkName = 
  | 'nose'
  | 'left_eye' | 'right_eye'
  | 'left_ear' | 'right_ear'
  | 'left_shoulder' | 'right_shoulder'
  | 'left_elbow' | 'right_elbow'
  | 'left_wrist' | 'right_wrist'
  | 'left_hip' | 'right_hip'
  | 'left_knee' | 'right_knee'
  | 'left_ankle' | 'right_ankle'
  | 'left_heel' | 'right_heel'
  | 'left_foot_index' | 'right_foot_index';

// MediaPipe 33 Landmark indices standard
export const LANDMARK_INDICES: Record<string, number> = {
  nose: 0,
  left_eye_inner: 1, left_eye: 2, left_eye_outer: 3,
  right_eye_inner: 4, right_eye: 5, right_eye_outer: 6,
  left_ear: 7, right_ear: 8,
  mouth_left: 9, mouth_right: 10,
  left_shoulder: 11, right_shoulder: 12,
  left_elbow: 13, right_elbow: 14,
  left_wrist: 15, right_wrist: 16,
  left_pinky: 17, right_pinky: 18,
  left_index: 19, right_index: 20,
  left_thumb: 21, right_thumb: 22,
  left_hip: 23, right_hip: 24,
  left_knee: 25, right_knee: 26,
  left_ankle: 27, right_ankle: 28,
  left_heel: 29, right_heel: 30,
  left_foot_index: 31, right_foot_index: 32,
};

export type FormQualityStatus = 'good' | 'attention' | 'incorrect';

export interface SegmentIssueMap {
  head: FormQualityStatus;
  headAlignment?: FormQualityStatus;
  torsoPosture: FormQualityStatus;
  kneeAlignment: FormQualityStatus;
  leftKneeAlignment?: FormQualityStatus;
  rightKneeAlignment?: FormQualityStatus;
  leftAnkle?: FormQualityStatus;
  rightAnkle?: FormQualityStatus;
  squatDepth: FormQualityStatus;
  symmetry: FormQualityStatus;
}

export interface SegmentStyle {
  color: string;
  width: number;
  glow: string;
  status: FormQualityStatus | 'neutral';
}

export interface FormIssue {
  id: string;
  code: string;
  severity: 'warning' | 'critical' | 'info';
  message: string;
  voiceCue: string;
  bodyPart: 'knees' | 'back' | 'hips' | 'arms' | 'depth' | 'tempo' | 'head';
  timestamp: number;
}

export interface FormAnalysisResult {
  exercise: ExerciseType;
  phase: MovementPhase;
  repetitionDetected: boolean;
  repCount: number;
  notCountingRep?: boolean;
  currentScore: number; // 0 - 100
  liveFormScore?: number; // Real-time frame form score (e.g. 92%, 68%)
  coachingStatusText?: 'GOOD FORM' | 'FORM ISSUE' | 'ATTENTION' | 'MOVE INTO VIEW' | 'READY';
  confidenceLow?: boolean;
  segmentStates?: SegmentIssueMap;
  instantMetrics: {
    primaryAngle: number; // e.g. knee angle in squat
    secondaryAngle?: number; // e.g. hip angle
    torsoAngle?: number;
    depthPercent?: number; // 0 - 100%
    alignmentMetric?: number; // 0 - 100%
  };
  detectedIssues: FormIssue[];
  activeCoachingCue: string;
  isGoodForm: boolean;
  confidence: number;
  personDetected: boolean;
  multiplePeopleDetected: boolean;
}

export interface ExerciseDefinition {
  id: ExerciseType;
  name: string;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetMuscles: string[];
  equipment: string;
  instructions: string[];
  keyLandmarks: string[];
  commonMistakes: string[];
  idealAngles: {
    inflectionMin: number;
    inflectionMax: number;
    extensionMin: number;
  };
  colorAccent: string;
}

export interface ScoreBreakdown {
  kneeAlignment: number;
  backAlignment: number;
  depthOrExtension: number;
  movementConsistency: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  exercise: ExerciseType;
  exerciseName: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  repetitions: number;
  formScore: number;
  scoreBreakdown: ScoreBreakdown;
  detectedIssues: {
    code: string;
    message: string;
    count: number;
    bodyPart: string;
  }[];
  notes?: string;
  deviceInfo: string;
}

export interface FormFingerprint {
  userId: string;
  overallFormScore: number;
  movementConsistency: number;
  strengthOfTechnique: number;
  mostCommonIssue: string;
  historicalTrend: {
    day: string;
    date: string;
    overallForm: number;
    kneeAlignment: number;
    backAlignment: number;
    depth: number;
    reps: number;
  }[];
  jointStabilityScores: {
    cervical_spine: number; // neck / upper back
    lumbar_spine: number;   // lower back
    left_knee: number;
    right_knee: number;
    hips: number;
    shoulders: number;
    ankles: number;
  };
  lastUpdated: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: 'Beginner' | 'Intermediate' | 'Athlete';
  preferredVoice: boolean;
  hapticFeedback: boolean;
  dailyGoalReps: number;
}
