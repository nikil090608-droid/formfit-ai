/**
 * Persistence & Historical Analytics Store
 * FormFit AI — Health Tech Track
 */

import { WorkoutSession, FormFingerprint, UserProfile, ExerciseType } from '../types';
import { sanitizeSessionMetrics } from '../ai/workoutMetrics';

const SESSIONS_KEY = 'formfit_workout_sessions_v1';
const FINGERPRINT_KEY = 'formfit_form_fingerprint_v1';
const PROFILE_KEY = 'formfit_user_profile_v1';
const ONBOARDED_KEY = 'formfit_onboarded_v1';

// Seed 7-day progression data as requested in prompt (Day 1: 72% -> Day 7: 86%)
const INITIAL_FINGERPRINT: FormFingerprint = {
  userId: 'usr_iqoo_2026',
  overallFormScore: 86,
  movementConsistency: 89,
  strengthOfTechnique: 83,
  mostCommonIssue: 'Knee alignment (valgus collapse)',
  historicalTrend: [
    { day: 'Day 1', date: 'Mon, 12 Sep', overallForm: 72, kneeAlignment: 68, backAlignment: 81, depth: 74, reps: 24 },
    { day: 'Day 2', date: 'Tue, 13 Sep', overallForm: 75, kneeAlignment: 71, backAlignment: 82, depth: 78, reps: 30 },
    { day: 'Day 3', date: 'Wed, 14 Sep', overallForm: 78, kneeAlignment: 74, backAlignment: 85, depth: 80, reps: 35 },
    { day: 'Day 4', date: 'Thu, 15 Sep', overallForm: 81, kneeAlignment: 77, backAlignment: 88, depth: 83, reps: 42 },
    { day: 'Day 5', date: 'Fri, 16 Sep', overallForm: 83, kneeAlignment: 79, backAlignment: 89, depth: 84, reps: 40 },
    { day: 'Day 6', date: 'Sat, 17 Sep', overallForm: 84, kneeAlignment: 80, backAlignment: 90, depth: 85, reps: 45 },
    { day: 'Day 7', date: 'Today',       overallForm: 86, kneeAlignment: 82, backAlignment: 91, depth: 88, reps: 50 },
  ],
  jointStabilityScores: {
    cervical_spine: 92,
    lumbar_spine: 88,
    left_knee: 81,
    right_knee: 83,
    hips: 87,
    shoulders: 90,
    ankles: 85,
  },
  lastUpdated: Date.now(),
};

const INITIAL_SESSIONS: WorkoutSession[] = [
  {
    id: 'sess_101',
    userId: 'usr_iqoo_2026',
    exercise: 'squat',
    exerciseName: 'Bodyweight Squat',
    startTime: Date.now() - 3600 * 1000 * 4,
    endTime: Date.now() - 3600 * 1000 * 4 + 180 * 1000,
    durationSeconds: 180,
    repetitions: 15,
    formScore: 88,
    scoreBreakdown: {
      kneeAlignment: 84,
      backAlignment: 93,
      depthOrExtension: 89,
      movementConsistency: 86,
    },
    detectedIssues: [
      { code: 'KNEE_VALGUS', message: 'Knees are moving inward', count: 2, bodyPart: 'knees' },
      { code: 'INSUFFICIENT_DEPTH', message: 'Go slightly deeper to parallel', count: 1, bodyPart: 'depth' },
    ],
    notes: 'Strong pace, improved chest uprightness on reps 8-15.',
    deviceInfo: 'iQOO 12 Pro (Mobile Neural Engine)',
  },
  {
    id: 'sess_102',
    userId: 'usr_iqoo_2026',
    exercise: 'pushup',
    exerciseName: 'Standard Push-Up',
    startTime: Date.now() - 3600 * 1000 * 24,
    endTime: Date.now() - 3600 * 1000 * 24 + 150 * 1000,
    durationSeconds: 150,
    repetitions: 18,
    formScore: 84,
    scoreBreakdown: {
      kneeAlignment: 95,
      backAlignment: 82,
      depthOrExtension: 80,
      movementConsistency: 81,
    },
    detectedIssues: [
      { code: 'CORE_SAG_OR_PIKE', message: 'Keep hips level with shoulders', count: 3, bodyPart: 'back' },
    ],
    notes: 'Minor hip sag on final 3 reps under fatigue.',
    deviceInfo: 'iQOO Neo 9 (Smart Vision Camera)',
  },
  {
    id: 'sess_103',
    userId: 'usr_iqoo_2026',
    exercise: 'lunge',
    exerciseName: 'Walking / Static Lunge',
    startTime: Date.now() - 3600 * 1000 * 48,
    endTime: Date.now() - 3600 * 1000 * 48 + 210 * 1000,
    durationSeconds: 210,
    repetitions: 20,
    formScore: 85,
    scoreBreakdown: {
      kneeAlignment: 82,
      backAlignment: 89,
      depthOrExtension: 87,
      movementConsistency: 83,
    },
    detectedIssues: [
      { code: 'KNEE_PAST_TOES', message: 'Keep front knee stacked over heel', count: 2, bodyPart: 'knees' },
    ],
    notes: 'Good unilateral balance.',
    deviceInfo: 'iQOO 12',
  },
];

const INITIAL_PROFILE: UserProfile = {
  id: 'usr_iqoo_2026',
  name: 'Alex Sharma',
  email: 'alex.sharma@iqoohealth.ai',
  level: 'Intermediate',
  preferredVoice: true,
  hapticFeedback: true,
  dailyGoalReps: 50,
};

export class StorageService {
  public static getSessions(): WorkoutSession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (!data) {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
        return INITIAL_SESSIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SESSIONS;
    }
  }

  public static saveSession(session: WorkoutSession): void {
    try {
      // Ensure zero-repetition rule is strictly respected
      const sanitized = sanitizeSessionMetrics(session);
      const sessions = this.getSessions();
      const updated = [sanitized, ...sessions];
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));

      // Dynamically update Form Fingerprint with the new session (if reps > 0)
      this.updateFingerprintWithSession(sanitized);
    } catch (e) {
      console.error('Failed to persist workout session:', e);
    }
  }

  public static getFingerprint(): FormFingerprint {
    try {
      const data = localStorage.getItem(FINGERPRINT_KEY);
      if (!data) {
        localStorage.setItem(FINGERPRINT_KEY, JSON.stringify(INITIAL_FINGERPRINT));
        return INITIAL_FINGERPRINT;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_FINGERPRINT;
    }
  }

  public static updateFingerprintWithSession(session: WorkoutSession): void {
    // CRITICAL RULE: When completed repetitions = 0, do not calculate, average, or interpolate
    if (session.repetitions <= 0) {
      return;
    }

    const fp = this.getFingerprint();
    // Rolling update
    const newOverall = Math.round((fp.overallFormScore * 0.7) + (session.formScore * 0.3));
    const newConsistency = Math.round((fp.movementConsistency * 0.7) + (session.scoreBreakdown.movementConsistency * 0.3));

    // Update today's entry in trend
    const todayEntry = fp.historicalTrend[fp.historicalTrend.length - 1];
    if (todayEntry) {
      todayEntry.reps += session.repetitions;
      todayEntry.overallForm = Math.round((todayEntry.overallForm + session.formScore) / 2);
      todayEntry.kneeAlignment = Math.round((todayEntry.kneeAlignment + session.scoreBreakdown.kneeAlignment) / 2);
      todayEntry.backAlignment = Math.round((todayEntry.backAlignment + session.scoreBreakdown.backAlignment) / 2);
      todayEntry.depth = Math.round((todayEntry.depth + session.scoreBreakdown.depthOrExtension) / 2);
    }

    fp.overallFormScore = newOverall;
    fp.movementConsistency = newConsistency;
    fp.lastUpdated = Date.now();

    try {
      localStorage.setItem(FINGERPRINT_KEY, JSON.stringify(fp));
    } catch {
      // ignore
    }
  }

  public static getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (!data) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_PROFILE));
        return INITIAL_PROFILE;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PROFILE;
    }
  }

  public static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  public static isOnboarded(): boolean {
    return localStorage.getItem(ONBOARDED_KEY) === 'true';
  }

  public static setOnboarded(val: boolean): void {
    localStorage.setItem(ONBOARDED_KEY, val ? 'true' : 'false');
  }

  public static getStatsSummary() {
    const sessions = this.getSessions();
    const todayMidnight = new Date().setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(s => s.startTime >= todayMidnight);

    const totalRepsToday = todaySessions.reduce((acc, s) => acc + s.repetitions, 0);
    const allReps = sessions.reduce((acc, s) => acc + s.repetitions, 0);
    const sessionsWithReps = sessions.filter(s => s.repetitions > 0);
    const avgScore = sessionsWithReps.length > 0 
      ? Math.round(sessionsWithReps.reduce((acc, s) => acc + s.formScore, 0) / sessionsWithReps.length)
      : 0;
    const bestScore = sessionsWithReps.length > 0 
      ? Math.max(...sessionsWithReps.map(s => s.formScore))
      : 0;

    return {
      totalRepsToday,
      allReps,
      avgScore,
      bestScore,
      totalSessionsCount: sessions.length,
      todaySessionsCount: todaySessions.length,
    };
  }
}
