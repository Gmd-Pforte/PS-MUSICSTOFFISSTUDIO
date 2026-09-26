export class AudioLipSync {
  constructor(audioElement, onLevel) {
    this.audio = audioElement;
    this.onLevel = onLevel;
    this.context = null;
    this.source = null;
    this.analyser = null;
    this.data = null;
    this.raf = null;
  }

  async ensureContext() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
      this.source = this.context.createMediaElementSource(this.audio);
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.68;
      this.data = new Uint8Array(this.analyser.fftSize);
      this.source.connect(this.analyser);
      this.analyser.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') await this.context.resume();
  }

  async play() {
    await this.ensureContext();
    await this.audio.play();
    this.startMeter();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.stopMeter();
    this.onLevel?.(0);
  }

  startMeter() {
    cancelAnimationFrame(this.raf);
    const tick = () => {
      if (!this.analyser || this.audio.paused || this.audio.ended) {
        this.onLevel?.(0);
        return;
      }
      this.analyser.getByteTimeDomainData(this.data);
      let sum = 0;
      for (let i = 0; i < this.data.length; i++) {
        const v = (this.data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / this.data.length);
      const level = Math.min(1, Math.max(0, (rms - 0.015) * 7.2));
      this.onLevel?.(level);
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  stopMeter() {
    cancelAnimationFrame(this.raf);
    this.raf = null;
  }
}
