/**
 * Web Audio API procedural sound synthesizer.
 * Provides accessible audio cues without external mp3/wav asset dependencies.
 * Includes visual captions dispatcher for deaf/hard-of-hearing players.
 */

type SoundType =
  | 'click'
  | 'place'
  | 'remove'
  | 'step'
  | 'barrier_hit'
  | 'reveal_chime'
  | 'victory_fanfare'
  | 'crosswalk_chirp';

interface SoundCaption {
  text: string;
  type: 'info' | 'warning' | 'success';
}

type CaptionListener = (caption: SoundCaption) => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private captionListeners: Set<CaptionListener> = new Set();

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public subscribeCaptions(listener: CaptionListener) {
    this.captionListeners.add(listener);
    return () => {
      this.captionListeners.delete(listener);
    };
  }

  private emitCaption(text: string, type: 'info' | 'warning' | 'success' = 'info') {
    for (const listener of this.captionListeners) {
      listener({ text, type });
    }
  }

  public play(type: SoundType) {
    this.initContext();

    switch (type) {
      case 'click':
        this.emitCaption('Soft tap', 'info');
        this.playTone(800, 0.04, 'sine', 0.05);
        break;

      case 'place':
        this.emitCaption('Infrastructure placed', 'info');
        this.playChord([523.25, 659.25], 0.12, 'triangle', 0.1); // C5 - E5
        break;

      case 'remove':
        this.emitCaption('Demolished item', 'info');
        this.playTone(330, 0.08, 'sawtooth', 0.04);
        break;

      case 'step':
        this.playTone(440, 0.03, 'sine', 0.02);
        break;

      case 'barrier_hit':
        this.emitCaption('Accessibility barrier reached!', 'warning');
        this.playTone(180, 0.25, 'sawtooth', 0.12);
        break;

      case 'crosswalk_chirp':
        this.emitCaption('Accessible Pedestrian Signal: [Chirp-Chirp]', 'info');
        this.playChirp();
        break;

      case 'reveal_chime':
        this.emitCaption('Atmospheric chime: The Invisible Resident emerges', 'warning');
        this.playChord([440, 554.37, 659.25, 880], 0.6, 'sine', 0.15); // A major harmonic
        break;

      case 'victory_fanfare':
        this.emitCaption('Harmonic fanfare: Everyone arrived safely!', 'success');
        this.playFanfare();
        break;
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  private playChord(freqs: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (this.isMuted || !this.ctx) return;
    for (const f of freqs) {
      this.playTone(f, duration, type, volume / freqs.length);
    }
  }

  private playChirp() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  private playFanfare() {
    if (this.isMuted || !this.ctx) return;
    const notes = [
      { f: 523.25, time: 0, dur: 0.15 },    // C5
      { f: 659.25, time: 0.15, dur: 0.15 }, // E5
      { f: 783.99, time: 0.3, dur: 0.18 },  // G5
      { f: 1046.5, time: 0.48, dur: 0.5 },  // C6
    ];

    for (const note of notes) {
      setTimeout(() => {
        this.playTone(note.f, note.dur, 'triangle', 0.12);
      }, note.time * 1000);
    }
  }
}

export const soundEngine = new SoundManager();
