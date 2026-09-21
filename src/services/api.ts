/**
 * API Service Client
 * FormFit AI — Health Tech Track
 */

import { WorkoutSession, FormFingerprint, UserProfile } from '../types';
import { StorageService } from './storage';
import { EXERCISE_DEFINITIONS } from '../ai/rules';

export class ApiClient {
  public static async getExercises() {
    return Object.values(EXERCISE_DEFINITIONS);
  }

  public static async getWorkoutSessions(): Promise<WorkoutSession[]> {
    return StorageService.getSessions();
  }

  public static async submitWorkoutSession(session: WorkoutSession): Promise<{ success: boolean; session: WorkoutSession }> {
    // Persist locally and update Form Fingerprint
    StorageService.saveSession(session);
    return { success: true, session };
  }

  public static async getFormFingerprint(): Promise<FormFingerprint> {
    return StorageService.getFingerprint();
  }

  public static async getUserProfile(): Promise<UserProfile> {
    return StorageService.getProfile();
  }

  public static async saveUserProfile(profile: UserProfile): Promise<void> {
    StorageService.saveProfile(profile);
  }
}
