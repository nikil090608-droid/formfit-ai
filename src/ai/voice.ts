/**
 * Voice Coach & Audio Feedback Engine
 * FormFit AI — Health Tech Track
 */

class VoiceCoach {
  private synth: SpeechSynthesis | null = null;
  private isMuted: boolean = false;
  private lastSpokenTime: number = 0;
  private lastSpokenText: string = '';
  private minCooldownMs: number = 2800; // Do not spam speech continuously
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Speak a coaching cue with intelligent cooldown and deduplication.
   */
  public speak(text: string, force = false): void {
    if (this.isMuted || !this.synth || !text) return;

    const now = Date.now();
    // Prevent repeating identical cue within 4.5 seconds
    if (!force && text === this.lastSpokenText && now - this.lastSpokenTime < 4500) {
      return;
    }

    // Enforce overall minimum cooldown between speech
    if (!force && now - this.lastSpokenTime < this.minCooldownMs) {
      return;
    }

    // Cancel currently running utterance if forced or stale
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05; // Slightly brisk, athletic coach cadence
    utterance.pitch = 1.0;
    utterance.volume = 0.95;

    // Try to pick an English voice
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.lastSpokenTime = Date.now();
      this.lastSpokenText = text;
    };

    utterance.onerror = () => {
      // Graceful fallback
    };

    this.synth.speak(utterance);
  }

  /**
   * Generates a clean procedural audio chime for rep completion
   */
  public playRepChime(): void {
    if (this.isMuted) return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  /**
   * Generates a gentle procedural warning ping for posture error
   */
  public playWarningTone(): void {
    if (this.isMuted) return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(260, this.audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.26);
    } catch {
      // Audio context error guard
    }
  }
}

export const voiceCoach = new VoiceCoach();
