// Retro Web Audio API Sound Synthesizer & Synthwave Music Generator

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private quotes = [
    "Success is not guaranteed, but it will probably work.",
    "Prototypes are easy, production is hard.",
    "Physics is the law, everything else is a recommendation.",
    "Hop to 2028.",
    "If something is important enough, you do it even if the odds are not in your favor.",
    "Next year for sure."
  ];

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      if (this.customAudio) {
        this.customAudio.pause();
      }
      this.stopMusic();
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch {}
    } else {
      if (!this.isMusicMuted && this.customAudio) {
        this.customAudio.play().catch(() => {});
      }
    }
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted) {
      this.stopMusic();
    } else if (!this.isMuted) {
      this.startMusic();
    }
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public getIsMusicMuted() {
    return this.isMusicMuted;
  }

  // Countdown tone: 440Hz for 3, 2, 1; 880Hz for LIFTOFF
  public playCountdownBeep(isFinal: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isFinal ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 520, now);
    if (isFinal) {
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15);
    }

    gain.gain.setValueAtTime(isFinal ? 0.35 : 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (isFinal ? 0.35 : 0.18));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + (isFinal ? 0.38 : 0.2));
  }

  // Thruster activation: crisp pneumatic hiss with a short impact pop
  public playThrust() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Pop oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);

    // Pneumatic noise burst (cold gas)
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.22, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.1);
  }

  // Barrel roll: rapid pneumatic sequence with rising electronic sweep
  public playBarrelRoll() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

    // Filter to give a whooshing resonant feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  // Successful obstacle clearance: short electronic confirmation chime
  public playScore() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.06); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Token / Boost Pickup
  public playPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(659.25, now + 0.05);
    osc.frequency.setValueAtTime(880, now + 0.1);
    osc.frequency.setValueAtTime(1174.66, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Collision: metallic impact, electrical distortion, abrupt cutoff
  public playCrash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Metallic crunch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(30, now + 0.4);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);

    // Impact noise
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(nGain);
    nGain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.36);
  }

  // Cryo-vent jet hiss
  public playCryoVent() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.21);
  }

  // Deadpan voice announcement on Game Over
  public speakGameOverQuote(customQuote?: string) {
    if (this.isMuted) return;
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = customQuote || this.quotes[Math.floor(Math.random() * this.quotes.length)];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 0.85; // slightly deeper deadpan tone
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Silently continue if voice blocked by browser policy
      }
    }
  }

  private customAudio: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = `${import.meta.env.BASE_URL}audio/FlippyRoadster1.mp3`;

  // Set or switch background audio track
  public setCustomAudio(url: string) {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    this.customAudioUrl = url;
    this.customAudio = new Audio(url);
    this.customAudio.loop = true;
    this.customAudio.volume = 0.65;
    if (!this.isMusicMuted) {
      this.customAudio.play().catch(() => {});
    }
  }

  public hasCustomAudio() {
    return !!this.customAudioUrl;
  }

  public startMusic() {
    if (this.isMusicMuted || this.isMuted) return;

    if (!this.customAudio && this.customAudioUrl) {
      const audio = new Audio(this.customAudioUrl);
      audio.loop = true;
      audio.volume = 0.65;

      // Fallback to online hosted mp3 if local relative path 404s
      audio.onerror = () => {
        if (this.customAudioUrl !== 'https://tristanvogt.com/flippycar/FlippyRoadster1.mp3') {
          this.setCustomAudio('https://tristanvogt.com/flippycar/FlippyRoadster1.mp3');
        }
      };

      this.customAudio = audio;
    }

    if (this.customAudio) {
      this.customAudio.play().catch(() => {
        // Fallback to procedural synth if media playback is restricted
        this.startProceduralSynth();
      });
      return;
    }

    this.startProceduralSynth();
  }

  private startProceduralSynth() {
    if (this.musicInterval) return;
    this.initCtx();

    // Bass notes in D minor synthwave scale: D2, F2, G2, A2, C3
    const bassNotes = [73.42, 73.42, 87.31, 87.31, 98.00, 98.00, 110.00, 98.00];
    const leadNotes = [293.66, 349.23, 440.00, 523.25, 440.00, 392.00, 349.23, 293.66];

    this.musicStep = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || this.isMusicMuted) return;
      const now = this.ctx.currentTime;
      const step = this.musicStep % 8;

      // Bass synth pulse
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassNotes[step], now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(450, now);

      bassGain.gain.setValueAtTime(0.12, now);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.ctx.destination);

      bassOsc.start(now);
      bassOsc.stop(now + 0.17);

      // Hi-hat / electronic tick on off-beats
      if (step % 2 === 1) {
        const hhOsc = this.ctx.createOscillator();
        const hhGain = this.ctx.createGain();
        hhOsc.type = 'sine';
        hhOsc.frequency.setValueAtTime(5000, now);
        hhGain.gain.setValueAtTime(0.04, now);
        hhGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        hhOsc.connect(hhGain);
        hhGain.connect(this.ctx.destination);
        hhOsc.start(now);
        hhOsc.stop(now + 0.06);
      }

      // Arpeggio synth lead on every 2nd step
      if (step % 2 === 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadNotes[step], now);
        leadGain.gain.setValueAtTime(0.05, now);
        leadGain.gain.exponentialRampToValueAtTime(0.005, now + 0.14);
        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);
        leadOsc.start(now);
        leadOsc.stop(now + 0.15);
      }

      this.musicStep++;
    }, 180); // ~166 BPM arcade tempo
  }

  public stopMusic() {
    if (this.customAudio) {
      this.customAudio.pause();
    }
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
