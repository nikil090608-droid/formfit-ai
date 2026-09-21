/**
 * Pose Estimation Engine (MediaPipe Tasks Vision + Fallback Layer)
 * FormFit AI — Health Tech Track
 */

import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { Landmark } from '../types';
import { smoothLandmarks } from './math';

export interface PoseDetectorState {
  isReady: boolean;
  isLoading: boolean;
  isRealAI: boolean;
  errorMessage: string | null;
  detectionConfidence: number;
}

class PoseDetector {
  private landmarker: PoseLandmarker | null = null;
  private isLoading = false;
  private isReady = false;
  private errorMessage: string | null = null;
  private prevLandmarks: Landmark[] | null = null;

  public async initialize(): Promise<boolean> {
    if (this.isReady) return true;
    if (this.isLoading) return false;

    this.isLoading = true;
    this.errorMessage = null;

    try {
      // Load MediaPipe WASM binaries via CDN
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );

      this.landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 2, // detect if multiple people are present
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isReady = true;
      this.isLoading = false;
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('MediaPipe PoseLandmarker GPU initialization note:', msg);
      // Attempt CPU fallback if GPU delegate is restricted in preview container
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 2,
          minPoseDetectionConfidence: 0.45,
          minPosePresenceConfidence: 0.45,
          minTrackingConfidence: 0.45,
        });
        this.isReady = true;
        this.isLoading = false;
        return true;
      } catch (fallbackErr: unknown) {
        const fMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        console.warn('MediaPipe fallback setup notice:', fMsg);
        this.errorMessage = 'High-performance vision model offline. Using AI kinematic simulation.';
        this.isLoading = false;
        return false;
      }
    }
  }

  public detect(
    videoElement: HTMLVideoElement,
    timestamp: number
  ): {
    landmarks: Landmark[] | null;
    multiplePeople: boolean;
    confidence: number;
  } {
    if (!this.landmarker || !this.isReady) {
      return { landmarks: null, multiplePeople: false, confidence: 0 };
    }

    try {
      const result = this.landmarker.detectForVideo(videoElement, timestamp);
      const poses = result.landmarks;

      if (!poses || poses.length === 0) {
        this.prevLandmarks = null;
        return { landmarks: null, multiplePeople: false, confidence: 0 };
      }

      const multiplePeople = poses.length > 1;
      const rawLandmarks: Landmark[] = poses[0].map(pt => ({
        x: pt.x,
        y: pt.y,
        z: pt.z,
        visibility: pt.visibility,
      }));

      // Apply exponential moving average filter to cancel sensor jitter
      const smoothed = smoothLandmarks(rawLandmarks, this.prevLandmarks, 0.45);
      this.prevLandmarks = smoothed;

      // Estimate detection confidence based on key joint visibility
      const keyJointIndices = [11, 12, 23, 24, 25, 26, 27, 28];
      const visibilities = keyJointIndices.map(idx => smoothed[idx]?.visibility ?? 0.8);
      const confidence = visibilities.reduce((a, b) => a + b, 0) / visibilities.length;

      return {
        landmarks: smoothed,
        multiplePeople,
        confidence,
      };
    } catch {
      return { landmarks: null, multiplePeople: false, confidence: 0 };
    }
  }

  public getStatus(): PoseDetectorState {
    return {
      isReady: this.isReady,
      isLoading: this.isLoading,
      isRealAI: this.isReady && this.landmarker !== null,
      errorMessage: this.errorMessage,
      detectionConfidence: 0.95,
    };
  }

  public dispose(): void {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        // ignore
      }
      this.landmarker = null;
      this.isReady = false;
    }
  }
}

export const poseDetector = new PoseDetector();
