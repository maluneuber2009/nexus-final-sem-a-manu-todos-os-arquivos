// ================================================================
//  Sons gerados com Web Audio (não precisa de arquivos .mp3)
// ================================================================
const Som = {
  ctx: null,
  mestre: null,
  hum: [],
  humGanho: null,
  mudo: false,

  iniciar() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.mestre = this.ctx.createGain();
      this.mestre.gain.value = 0.8;
      this.mestre.connect(this.ctx.destination);
      this.ligarHum();
    } catch (e) {
      this.ctx = null; // sem som, o jogo continua
    }
  },

  // zumbido grave do computador ligado
  ligarHum() {
    if (!this.ctx) return;
    this.pararHum();
    this.humGanho = this.ctx.createGain();
    this.humGanho.gain.value = 0.035;
    this.humGanho.connect(this.mestre);
    [55, 55.6].forEach(f => {
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      o.connect(this.humGanho);
      o.start();
      this.hum.push(o);
    });
  },

  pararHum() {
    this.hum.forEach(o => { try { o.stop(); } catch (e) { /* já parado */ } });
    this.hum = [];
  },

  virada() {
    if (!this.ctx || !this.humGanho) return;
    const t = this.ctx.currentTime;
    this.hum.forEach((o, i) => o.frequency.linearRampToValueAtTime(41 + i * 1.3, t + 3));
    this.humGanho.gain.linearRampToValueAtTime(0.075, t + 3);
  },

  bip(freq, dur = 0.05, vol = 0.04, tipo = 'square', atraso = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + atraso;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.mestre);
    o.start(t);
    o.stop(t + dur + 0.02);
  },

  digitar() { this.bip(1400 + Math.random() * 400, 0.012, 0.012); },
  abrir() { this.bip(220, 0.08, 0.04); this.bip(440, 0.08, 0.03, 'square', 0.06); },
  papel() { this.bip(520, 0.05, 0.03, 'triangle'); },
  acerto() { this.bip(660, 0.12, 0.05, 'triangle'); this.bip(990, 0.2, 0.05, 'triangle', 0.1); },
  erro() { this.bip(130, 0.3, 0.06, 'sawtooth'); },

  glitch() {
    if (!this.ctx) return;
    const n = Math.floor(this.ctx.sampleRate * 0.35);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) * (Math.random() < 0.3 ? 1 : 0.2);
    const s = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    g.gain.value = 0.14;
    s.buffer = buf;
    s.connect(g);
    g.connect(this.mestre);
    s.start();
  },

  desligar() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(400, t);
    o.frequency.exponentialRampToValueAtTime(30, t + 1.2);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    o.connect(g);
    g.connect(this.mestre);
    o.start(t);
    o.stop(t + 1.4);
  },

  alternarMudo() {
    this.mudo = !this.mudo;
    if (this.mestre) this.mestre.gain.value = this.mudo ? 0 : 0.8;
    return this.mudo;
  }
};
