/**
 * FormFit AI — Database Schema Models (Mongoose & TypeScript)
 * iQOO Hackathon 2026 Hyderabad — Health Tech Track
 */

/**
 * Mongoose Schema Definitions (Document Oriented / MongoDB)
 */

export const MongoDBSchemaDefinitions = `
// ==========================================
// 1. USER SCHEMA
// ==========================================
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, sparse: true },
  name: { type: String, required: true },
  fitnessLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Athlete'], default: 'Beginner' },
  avatarUrl: { type: String },
  dailyGoalReps: { type: Number, default: 50 },
  preferredVoiceCoach: { type: Boolean, default: true },
  hapticFeedbackEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==========================================
// 2. EXERCISE DEFINITION SCHEMA
// ==========================================
const ExerciseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true }, // 'squat', 'pushup', etc.
  name: { type: String, required: true },
  tagline: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  targetMuscles: [{ type: String }],
  equipment: { type: String, default: 'Bodyweight' },
  instructions: [{ type: String }],
  keyLandmarks: [{ type: String }],
  idealAngles: {
    inflectionMin: Number,
    inflectionMax: Number,
    extensionMin: Number
  },
  active: { type: Boolean, default: true }
});

// ==========================================
// 3. WORKOUT SESSION SCHEMA
// ==========================================
const WorkoutSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exercise: { type: String, required: true, index: true },
  exerciseName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  durationSeconds: { type: Number, required: true },
  repetitions: { type: Number, required: true, default: 0 },
  formScore: { type: Number, required: true, min: 0, max: 100 },
  scoreBreakdown: {
    kneeAlignment: { type: Number, min: 0, max: 100 },
    backAlignment: { type: Number, min: 0, max: 100 },
    depthOrExtension: { type: Number, min: 0, max: 100 },
    movementConsistency: { type: Number, min: 0, max: 100 }
  },
  detectedIssues: [{
    code: { type: String, required: true },
    message: { type: String, required: true },
    count: { type: Number, default: 1 },
    bodyPart: { type: String, enum: ['knees', 'back', 'hips', 'arms', 'depth', 'tempo'] }
  }],
  notes: { type: String },
  deviceInfo: { type: String, default: 'iQOO Smartphone Camera' },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 4. FORM FINGERPRINT SCHEMA (Personal Biomechanical Profile)
// ==========================================
const FormFingerprintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  overallFormScore: { type: Number, default: 80 },
  movementConsistency: { type: Number, default: 85 },
  strengthOfTechnique: { type: Number, default: 80 },
  mostCommonIssue: { type: String, default: 'Knee alignment' },
  historicalTrend: [{
    day: String,
    date: String,
    overallForm: Number,
    kneeAlignment: Number,
    backAlignment: Number,
    depth: Number,
    reps: Number
  }],
  jointStabilityScores: {
    cervical_spine: Number,
    lumbar_spine: Number,
    left_knee: Number,
    right_knee: Number,
    hips: Number,
    shoulders: Number,
    ankles: Number
  },
  lastUpdated: { type: Date, default: Date.now }
});

// ==========================================
// 5. PROGRESS AGGREGATION SCHEMA
// ==========================================
const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  totalReps: { type: Number, default: 0 },
  totalWorkouts: { type: Number, default: 0 },
  avgFormScore: { type: Number, default: 0 },
  bestFormScore: { type: Number, default: 0 },
  streakDays: { type: Number, default: 1 }
});
`;

export interface IApiEndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requestBody?: string;
  responseExample: string;
}

export const API_ENDPOINTS: IApiEndpointDoc[] = [
  {
    method: 'GET',
    path: '/api/v1/exercises',
    description: 'Retrieve catalog of supported exercises and biomechanical rules.',
    responseExample: '{"exercises": [{"id": "squat", "name": "Bodyweight Squat", ...}]}'
  },
  {
    method: 'POST',
    path: '/api/v1/sessions',
    description: 'Save a completed workout session with rep counts, score breakdown, and detected form issues.',
    requestBody: '{"userId": "usr_1", "exercise": "squat", "durationSeconds": 180, "repetitions": 12, "formScore": 87, ...}',
    responseExample: '{"status": "success", "sessionId": "sess_101", "newFingerprintScore": 86}'
  },
  {
    method: 'GET',
    path: '/api/v1/fingerprint/:userId',
    description: 'Fetch the 7-day biomechanical Form Fingerprint and stability scores.',
    responseExample: '{"overallFormScore": 86, "movementConsistency": 89, "mostCommonIssue": "Knee alignment", ...}'
  },
  {
    method: 'GET',
    path: '/api/v1/progress/:userId',
    description: 'Get total reps, daily streaks, historical workouts, and AI trend insights.',
    responseExample: '{"todayReps": 45, "averageForm": 86, "bestScore": 94, "improvementPct": 14}'
  },
  {
    method: 'POST',
    path: '/api/v1/analyze/frame',
    description: 'Optional server-side frame inference endpoint for devices with ultra-low hardware acceleration.',
    requestBody: '{"landmarks": [...], "exercise": "squat"}',
    responseExample: '{"phase": "descending", "kneeAngle": 102, "isGoodForm": true}'
  }
];
