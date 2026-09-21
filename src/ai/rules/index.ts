/**
 * Exercise Analysis Engine Dispatcher & Exercise Catalog
 * FormFit AI — Health Tech Track
 */

import { ExerciseType, ExerciseDefinition, Landmark, FormAnalysisResult } from '../../types';
import { analyzeSquat, createInitialTracker, ExerciseStateTracker } from './squat';
import { analyzePushup } from './pushup';
import { analyzeLunge } from './lunge';
import { analyzePlank } from './plank';
import { analyzeJumpingJack } from './jumpingJack';

export { createInitialTracker, type ExerciseStateTracker };

export const EXERCISE_DEFINITIONS: Record<ExerciseType, ExerciseDefinition> = {
  squat: {
    id: 'squat',
    name: 'Bodyweight Squat',
    tagline: 'Foundational lower body strength & knee alignment',
    difficulty: 'Beginner',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    equipment: 'Bodyweight (Camera floor/table mount)',
    instructions: [
      'Stand with feet shoulder-width apart, toes turned slightly out.',
      'Descend by pushing hips back and bending knees until thighs are parallel to ground (knee angle ≤ 90°).',
      'Keep knees tracking inline with your toes — do NOT let knees cave inward.',
      'Drive through your heels to return to a full standing lock.',
    ],
    keyLandmarks: ['Hips', 'Knees', 'Ankles', 'Shoulders'],
    commonMistakes: [
      'Knees caving inward (Valgus collapse)',
      'Excessive forward chest lean',
      'Shallow depth before reaching parallel',
      'Rushing descent without control',
    ],
    idealAngles: {
      inflectionMin: 70,
      inflectionMax: 95,
      extensionMin: 160,
    },
    colorAccent: '#10B981', // Emerald
  },
  pushup: {
    id: 'pushup',
    name: 'Standard Push-Up',
    tagline: 'Upper body chest, shoulder & core stability',
    difficulty: 'Intermediate',
    targetMuscles: ['Chest (Pectorals)', 'Triceps', 'Anterior Deltoids', 'Core'],
    equipment: 'Floor space / Yoga mat',
    instructions: [
      'Start in a high plank position with hands directly beneath shoulders.',
      'Maintain a rigid straight line from your ears through hips to heels.',
      'Lower chest towards floor until elbows bend to at least 90° flexion.',
      'Press firmly through palms to full elbow extension.',
    ],
    keyLandmarks: ['Shoulders', 'Elbows', 'Wrists', 'Hips', 'Ankles'],
    commonMistakes: [
      'Sagging lower back (lumbar hyperextension)',
      'Piking hips upwards',
      'Flaring elbows out to 90 degrees',
      'Incomplete depth',
    ],
    idealAngles: {
      inflectionMin: 75,
      inflectionMax: 90,
      extensionMin: 155,
    },
    colorAccent: '#3B82F6', // Blue
  },
  lunge: {
    id: 'lunge',
    name: 'Walking / Static Lunge',
    tagline: 'Unilateral leg balance, hip mobility & quadriceps',
    difficulty: 'Beginner',
    targetMuscles: ['Quadriceps', 'Glutes', 'Calves', 'Core stabilizers'],
    equipment: 'Floor space',
    instructions: [
      'Step forward with one leg, keeping your torso upright and tall.',
      'Lower hips until both front and back knees reach approximately 90° angles.',
      'Ensure the front knee stays stacked directly over the heel, not shooting excessively forward.',
      'Push forcefully off the front heel to return to standing.',
    ],
    keyLandmarks: ['Hips', 'Lead Knee', 'Lead Ankle', 'Torso'],
    commonMistakes: [
      'Front knee drifting far past toes',
      'Torso leaning forward excessively',
      'Wobbling ankles or knees collapsing inward',
    ],
    idealAngles: {
      inflectionMin: 80,
      inflectionMax: 95,
      extensionMin: 155,
    },
    colorAccent: '#F59E0B', // Amber
  },
  plank: {
    id: 'plank',
    name: 'Isometric Core Plank',
    tagline: 'Isometric abdominal & transverse spine endurance',
    difficulty: 'Beginner',
    targetMuscles: ['Transverse Abdominis', 'Rectus Abdominis', 'Glutes', 'Shoulders'],
    equipment: 'Floor space / Mat',
    instructions: [
      'Rest on forearms or palms with elbows aligned directly under shoulders.',
      'Extend legs straight back, balancing on balls of feet.',
      'Lock hips in a neutral horizontal plane — no sagging and no mountain pikes.',
      'Breathe steadily while maintaining abdominal tension.',
    ],
    keyLandmarks: ['Shoulders', 'Hips', 'Ankles'],
    commonMistakes: [
      'Hips sagging down toward floor',
      'Piking buttocks upward into a tent',
      'Holding breath instead of diaphragmatic breathing',
    ],
    idealAngles: {
      inflectionMin: 165,
      inflectionMax: 180,
      extensionMin: 165,
    },
    colorAccent: '#8B5CF6', // Purple
  },
  jumping_jack: {
    id: 'jumping_jack',
    name: 'Jumping Jacks',
    tagline: 'Cardiovascular conditioning & full-body coordination',
    difficulty: 'Beginner',
    targetMuscles: ['Calves', 'Deltoids', 'Core', 'Cardiovascular System'],
    equipment: 'Open floor space',
    instructions: [
      'Start standing upright with arms at your sides and feet together.',
      'Jump feet out to shoulder-width or wider while raising arms overhead.',
      'Clap or bring arms within shoulder width at apex.',
      'Jump back to starting position with soft knees upon landing.',
    ],
    keyLandmarks: ['Wrists', 'Shoulders', 'Hips', 'Ankles'],
    commonMistakes: [
      'Incomplete arm sweep (arms not reaching overhead)',
      'Landing stiff-legged instead of absorbing shock',
      'Asymmetrical arm or leg timing',
    ],
    idealAngles: {
      inflectionMin: 135,
      inflectionMax: 180,
      extensionMin: 30,
    },
    colorAccent: '#EC4899', // Pink
  },
};

/**
 * Dispatches analysis to the appropriate exercise-specific rule engine.
 */
export function analyzeExercise(
  exercise: ExerciseType,
  landmarks: Landmark[],
  tracker: ExerciseStateTracker
): FormAnalysisResult {
  let result: FormAnalysisResult;
  switch (exercise) {
    case 'squat':
      result = analyzeSquat(landmarks, tracker);
      break;
    case 'pushup':
      result = analyzePushup(landmarks, tracker);
      break;
    case 'lunge':
      result = analyzeLunge(landmarks, tracker);
      break;
    case 'plank':
      result = analyzePlank(landmarks, tracker);
      break;
    case 'jumping_jack':
      result = analyzeJumpingJack(landmarks, tracker);
      break;
    default:
      result = analyzeSquat(landmarks, tracker);
      break;
  }

  // CRITICAL RULE: When completed repetitions = 0, form score must be strictly 0%
  if (tracker.repCount === 0) {
    result.currentScore = 0;
  }

  return result;
}
