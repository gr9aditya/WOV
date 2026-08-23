/* ============================================================
   BRUNOS CODE-ABENTEUER — Engine
   ------------------------------------------------------------
   Structure for handoff:
   1. ASSET_MANIFEST  -> declare every sprite sheet here
   2. AssetManager    -> loads them, falls back to placeholders
   3. Anim            -> frame-based animation player
   4. Sprite drawing  -> uses real sheet if loaded, else placeholder
   5. playSequence()  -> one-shot animations that PAUSE the game
                         (attacks, deaths, gate open, star shatter…)
   6. Story scenes    -> the full Bruno flow (unchanged logic)

   To add your 32px art: drop PNG sheets in /assets, fill in the
   matching path + frame count in ASSET_MANIFEST. Nothing else
   needs to change — placeholders auto-disable once a sheet loads.
   ============================================================ */

// ===================== CANVAS =====================
/* Spielkoordinaten bleiben 256x144 (ein Pixelraster fuer alles), das Bild
   wird aber mit RES = 2 in 512x288 gerendert: Sprites liegen weiter auf dem
   256er-Raster (drawSprite rundet), Rotationen, Kreise, Verlaeufe und
   Linien werden feiner. frame() setzt die Transformation jeden Frame neu.
   `ctx` ist `let`, damit staticLayer() voruebergehend in einen Offscreen-
   Canvas umleiten kann.                                                  */
const canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
const RES = 2, W = 256, H = 144;
canvas.width = W * RES; canvas.height = H * RES;
ctx.imageSmoothingEnabled = false;
const groundY = 112;

// ===================== CONFIG =====================
/* Zentrale Stellschrauben — Werte, die vorher als Magic Numbers im
   Code verstreut waren. Aendern hier wirkt ueberall.               */
const CONFIG = {
  walkSpeed: 72,        // px/s (entspricht dem alten 1.2 px/frame @60fps)
  walkAccel: 640,       // px/s^2 — kurzes Anlaufen/Abbremsen statt hartem Start
  fadeTime: 0.38,       // s — Einblenden beim Szenenwechsel
  interactRange: 18,    // px — Abstand, ab dem ein Hotspot aktiv wird
  stepInterval: 0.24,   // s — Fussschritt-Sound/Staub beim Laufen
  particleMax: 220,     // hartes Limit, damit nichts unbegrenzt wachsen kann
  musicVolume: 0.14,    // eigener Musik-Bus, deutlich unter dem Sfx-Master (0.22)
  musicFade: 0.6,       // s — Crossfade beim Szenenwechsel
  wipeTime: 0.35,       // s — Level-Wipe rein bzw. raus
  holdTime: 0.5,        // s — Level-Schild steht
  damageTime: 0.8,      // s — roter Schadensblitz klingt ab
  jumpVel: 165,         // px/s — Absprunggeschwindigkeit (reiner Huepfer, keine Plattformen)
  gravity: 560,         // px/s^2
  footprintMax: 80,     // Fussspuren pro Szene (aelteste fallen raus)
  cleanupSceneTime: 1.25 // s — Besenflug pro Szene beim Aufraeumen am Ende
};

// Einstellungen (Ton, Screenshake) ueberleben einen Reload.
// localStorage kann in manchen Kontexten fehlen/verboten sein -> try/catch.
const Prefs = {
  data: { muted:false, shake:true, music:true, learn:true, lang:'de' },
  load() {
    // Standardsprache aus dem Browser (fr/it), sonst Deutsch — nur beim allerersten Start
    try { const nl = (navigator.language || 'de').slice(0, 2); if (nl === 'fr' || nl === 'it') this.data.lang = nl; } catch (e) { /* egal */ }
    try {
      const raw = localStorage.getItem('bruno_prefs');
      if (raw) Object.assign(this.data, JSON.parse(raw));
    } catch (e) { /* egal — Defaults gelten */ }
    // Systemeinstellung respektieren: reduzierte Bewegung = kein Shake
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
          && localStorage.getItem('bruno_prefs') === null) this.data.shake = false;
    } catch (e) { /* egal */ }
  },
  save() {
    try { localStorage.setItem('bruno_prefs', JSON.stringify(this.data)); } catch (e) { /* egal */ }
  }
};
Prefs.load();

// ===================== PALETTE (placeholders only) =====================
const PAL = {
  skyTop:'#9fd8f2', skyBot:'#e8f8ff', skyMid:'#cfeaf6', farMtn:'#5b7fa6', farSnow:'#eef6fb',
  leafDark:'#1f3d1f', leafMid:'#2f5233', leafHi:'#4c7a3d', trunk:'#4a2f18',
  cave:'#241a14', caveDark:'#150f0b',
  river:'#2f7fa0', riverHi:'#62b3d0', riverLo:'#24627f',
  ground:'#5a3a22', grass:'#52863f', grassHi:'#6aae52',
  stone:'#6b6b6b', stoneDark:'#4a4a4a', stoneLi:'#8a8a8a', gold:'#ffd23f',
  web:'#cfd8dc', swamp:'#2f5b46', swampDark:'#20402f', palm:'#2f6b35',
  meadow:'#79cc52', meadowHi:'#9be070', sun:'#ffe066', palmTrunk:'#6b4226',
  bearBody:'#6b4226', bearBodyDark:'#4e2f19', bearBelly:'#d9a066',
  bearNose:'#2a1810', bearEye:'#1b1024',
  sword:'#c9d3d8', swordHi:'#eef3f5', hilt:'#8a5a2e',
  danger:'#e0453f',
  // Chalet
  wood:'#3a2416', woodDark:'#2a1810', woodHi:'#5a3a22', beam:'#4e3320',
  roof:'#4a3224', roofHi:'#5e4030', shutter:'#2f5233', geranium:'#d64545', geraniumHi:'#f06060',
  windowLight:'#ffd27a', windowWarm:'#ffb347'
};

/* ===================== 0. SOUND (Web Audio API) =====================
   Alles synthetisiert, keine externen Dateien — bleibt damit im
   "kein Build, keine Dependencies" Rahmen. Stil: 8-bit Chiptune
   (Square/Triangle/Saw + Rauschen), passend zum Pixel-Look.

   Benutzung:  Sfx.play('hit')   oder direkt  Sfx.hit()
   Neuen Sound ergaenzen: eine Methode dazuschreiben und in SFX_MAP
   eintragen. Sequenz-Schritte in playSequence() koennen ihn dann
   ueber  { key:'…', sfx:'name' }  ausloesen.                        */
const Sfx = {
  ctx: null, master: null, noiseBuf: null,
  get muted() { return Prefs.data.muted; },
  set muted(v) { Prefs.data.muted = v; Prefs.save(); },

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;                       // sehr alter Browser: still, aber lauffaehig
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.22;
    this.master.connect(this.ctx.destination);
    // Rauschpuffer einmalig, deterministisch (fuer Swoosh, Platscher, Rumpeln)
    const len = Math.floor(this.ctx.sampleRate * 1.2);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let s = 22695477;
    for (let i = 0; i < len; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = s / 0x3fffffff - 1; }
    this.noiseBuf = buf;
  },

  // Browser starten AudioContext erst nach einer echten Nutzergeste
  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  ok() { return !!this.ctx && !this.muted; },

  /* Ein Oszillator-Ton.
     f1 = Startfrequenz, f2 = Zielfrequenz (Glide, optional)          */
  tone(f1, dur, type, vol, f2, delay) {
    if (!this.ok()) return;
    const t0 = this.ctx.currentTime + (delay || 0);
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f1, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },

  /* Gefiltertes Rauschen. f1/f2 = Bandpass-Sweep.                    */
  noise(dur, vol, f1, f2, q, delay, type) {
    if (!this.ok()) return;
    const t0 = this.ctx.currentTime + (delay || 0);
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const flt = this.ctx.createBiquadFilter();
    flt.type = type || 'bandpass';
    flt.frequency.setValueAtTime(f1, t0);
    if (f2) flt.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t0 + dur);
    flt.Q.value = q || 1;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(flt); flt.connect(g); g.connect(this.master);
    src.start(t0); src.stop(t0 + dur + 0.02);
  },

  // --- die eigentlichen Effekte -------------------------------------
  blip()    { this.tone(660, 0.05, 'triangle', 0.12); },                     // UI-Klick
  step(alt) { this.noise(0.045, 0.035, alt ? 900 : 700, 300, 1.5); },        // Fussschritt, sehr leise
  pickup()  { this.tone(784, 0.09, 'triangle', 0.18); this.tone(1175, 0.14, 'triangle', 0.16, null, 0.07); },
  attack()  { this.noise(0.16, 0.28, 2600, 500, 0.8); this.tone(300, 0.10, 'square', 0.14, 160); },
  slash()   { this.tone(1400, 0.09, 'square', 0.18, 500); this.noise(0.10, 0.20, 4000, 1200, 1.2, 0.01); },
  hit()     { this.tone(190, 0.16, 'square', 0.32, 70); this.noise(0.12, 0.26, 900, 180, 0.7); },
  defeat()  { this.tone(300, 0.38, 'sawtooth', 0.26, 55); this.tone(150, 0.40, 'square', 0.14, 40, 0.05); },
  death()   { [0,1,2,3].forEach(i => this.tone(440 / (1 + i * 0.55), 0.16, 'square', 0.26, 300 / (1 + i * 0.7), i * 0.13)); },
  splash()  { this.noise(0.34, 0.30, 300, 2400, 0.6, 0, 'lowpass'); this.tone(180, 0.18, 'triangle', 0.12, 420); },
  crash()   { this.noise(0.42, 0.34, 1600, 120, 0.5); this.tone(120, 0.30, 'square', 0.20, 45); },
  error()   { this.tone(330, 0.16, 'sawtooth', 0.28, 220); this.tone(196, 0.34, 'sawtooth', 0.28, 110, 0.15); },
  win()     { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.16, 'square', 0.22, null, i * 0.10));
              this.tone(1046.5, 0.42, 'triangle', 0.20, null, 0.40); },
  gate()    { this.noise(0.60, 0.24, 120, 420, 0.4, 0, 'lowpass');           // Rumpeln
              this.tone(880, 0.55, 'triangle', 0.16, null, 0.28);            // Glocke
              this.tone(1320, 0.45, 'triangle', 0.10, null, 0.32); },
  star()    { [784, 988, 1319, 1568].forEach((f, i) => this.tone(f, 0.13, 'triangle', 0.20, null, i * 0.07)); },
  shatter() { this.noise(0.26, 0.30, 5000, 1400, 1.5);
              [0,1,2,3,4].forEach(i => this.tone(1500 - i * 220, 0.07, 'square', 0.14, null, 0.03 + i * 0.045)); },
  // magisches Schwert: steigendes Arpeggio + glitzernder Nachhall
  chime()   { [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) =>
                this.tone(f, 0.22, 'triangle', 0.18, null, i * 0.07));
              [2637, 3136, 3951].forEach((f, i) => this.tone(f, 0.9, 'sine', 0.05, f * 1.01, 0.42 + i * 0.06));
              this.noise(0.7, 0.06, 6000, 9000, 0.6, 0.4, 'highpass'); },
  // Finale: Akkordfolge C - F - G - C mit steigender Melodie und langem Schlusston
  fanfare() { const chords = [[261.63, 329.63, 392], [349.23, 440, 523.25], [392, 493.88, 587.33], [523.25, 659.25, 783.99, 1046.5]];
              chords.forEach((c, i) => c.forEach(f => this.tone(f, i === 3 ? 1.1 : 0.3, 'square', 0.11, null, i * 0.3)));
              [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.2, null, 0.9 + i * 0.09));
              this.tone(2093, 1.2, 'triangle', 0.16, null, 1.35);
              this.noise(0.5, 0.10, 3000, 8000, 0.5, 1.3, 'highpass'); },

  jump()    { this.tone(420, 0.12, 'square', 0.14, 760); },                      // kurzer Huepfer
  sweep()   { this.noise(0.12, 0.10, 1800, 600, 0.9); },                           // Besenstrich
  whoosh()  { this.noise(0.5, 0.16, 300, 2400, 0.6, 0, 'bandpass'); this.tone(260, 0.4, 'triangle', 0.08, 520); },
  land()    { this.noise(0.07, 0.12, 500, 200, 1.2); this.tone(140, 0.06, 'triangle', 0.10, 90); },
  sail()    { this.noise(0.9, 0.14, 400, 1200, 0.5, 0, 'lowpass'); this.tone(220, 0.5, 'triangle', 0.06, 330, 0.1); },
  drown()   { [0,1,2,3,4,5].forEach(i => this.tone(300 + i * 90, 0.08, 'sine', 0.10, 520 + i * 90, 0.15 + i * 0.18));
              this.noise(1.0, 0.10, 300, 900, 0.4, 0.1, 'lowpass'); },
  play(name) { const fn = SFX_MAP[name]; if (fn) fn.call(this); }
};
const SFX_MAP = {
  blip: Sfx.blip, attack: Sfx.attack, slash: Sfx.slash, hit: Sfx.hit, step: Sfx.step, pickup: Sfx.pickup,
  defeat: Sfx.defeat, death: Sfx.death, splash: Sfx.splash, crash: Sfx.crash,
  error: Sfx.error, win: Sfx.win, gate: Sfx.gate, star: Sfx.star, shatter: Sfx.shatter,
  chime: Sfx.chime, fanfare: Sfx.fanfare,
  jump: Sfx.jump, land: Sfx.land, sail: Sfx.sail, drown: Sfx.drown, sweep: Sfx.sweep, whoosh: Sfx.whoosh
};
// AudioContext bei der ersten Geste freischalten (Autoplay-Policy)
['pointerdown', 'keydown'].forEach(ev =>
  window.addEventListener(ev, () => Sfx.resume(), { once: false, passive: true }));
// Klick-Blip fuer alle Story-Buttons, ohne die UI-Funktionen anzufassen
document.addEventListener('click', e => {
  if (e.target && e.target.classList && e.target.classList.contains('btn')) Sfx.blip();
}, true);

/* ===================== 0b. MUSIK (Web Audio Step-Sequencer) =====================
   Retro-Hintergrundmusik, komplett synthetisiert — keine Dateien.
   Ein kleiner Sequencer: pro Spur mehrere Stimmen (Bass, Melodie, Pad)
   plus eine Rausch-Percussion. Die Patterns sind Achtelnoten, '.' = Pause;
   Voice-Patterns duerfen unterschiedlich lang sein (werden modulo gelesen).
   Geplant wird ~1 Takt voraus ueber AudioContext.currentTime in einem
   Lookahead-Timer (kein Oszillator pro Frame). Beim Szenenwechsel laeuft
   die alte Spur ueber CONFIG.musicFade aus, die neue ein.
   Eigener Gain-Bus (Music.master), getrennt vom Sfx-Master.           */
const NOTE_FREQ = (() => {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const map = {};
  for (let o = 0; o < 8; o++) names.forEach((n, i) => { map[n + o] = 440 * Math.pow(2, (o * 12 + i - 57) / 12); });
  return map;
})();
const MUSIC_TRACKS = {
  // Titelbildschirm: sanftes D-Dur-Arpeggio, kein Schlagzeug
  title: { bpm: 84, voices: [
    { type:'triangle', vol:0.11, len:7.5,
      pat:'D2 . . . . . . . G2 . . . . . . . A1 . . . . . . . D2 . . . . . . .' },
    { type:'triangle', vol:0.07, len:0.9,
      pat:'D4 F#4 A4 D5 A4 F#4 D4 . G4 B4 D5 G5 D5 B4 G4 . A4 C#5 E5 A5 E5 C#5 A4 . D5 . A4 . F#4 . D4 .' },
    { type:'sine', vol:0.05, len:7.5,
      pat:'F#4 . . . . . . . G4 . . . . . . . E4 . . . . . . . F#4 . . . . . . .' } ],
    perc:'. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .' },
  // ruhig / pastoral — C-Dur, Dreiklang-Bass, sanfte Dreieck-Melodie, leise Hi-Hats
  calm: { bpm: 96, voices: [
    { type:'triangle', vol:0.12, len:1.8,
      pat:'C2 . . . G2 . . . A1 . . . E2 . . . F2 . . . C2 . . . G2 . . . G2 . . .' },
    { type:'triangle', vol:0.075, len:0.9,
      pat:'E4 . G4 . A4 . . . G4 . E4 . . . . . C4 . D4 . E4 . . . D4 . C4 . . . . .' },
    { type:'sine', vol:0.05, len:7.5,
      pat:'C4 . . . . . . . . . . . . . . . F4 . . . . . . . G4 . . . . . . .' } ],
    perc:'h . . . h . . . h . . . h . . . h . . . h . . . h . . . h . h .' },
  // angespannt / Moll — A-Moll, pochender Bass, sparsame Melodie, Kick+Snare
  tense: { bpm: 104, voices: [
    { type:'triangle', vol:0.12, len:0.8,
      pat:'A1 . A1 . A1 . . . F1 . F1 . F1 . . . G1 . G1 . G1 . . . E1 . E1 . E1 . E1 .' },
    { type:'triangle', vol:0.09, len:1.5,
      pat:'A4 . . . C5 . . . B4 . . . . . . . G4 . . . A4 . . . E4 . . . . . . .' },
    { type:'sawtooth', vol:0.02, len:7.6,
      pat:'A2 . . . . . . . F2 . . . . . . . G2 . . . . . . . E2 . . . . . . .' } ],
    perc:'k . . . s . . . k . . . s . . . k . . . s . . . k . k . s . . .' },
  // treibend / Kampf — E-Moll, Achtel-Bass, Riff, durchgehendes Schlagzeug
  battle: { bpm: 150, voices: [
    { type:'square', vol:0.08, len:0.9,
      pat:'E2 E2 E2 E2 G2 G2 E2 E2 D2 D2 D2 D2 B1 B1 D2 D2 E2 E2 E2 E2 G2 G2 A2 A2 C2 C2 C2 C2 B1 B1 B1 B1' },
    { type:'triangle', vol:0.08, len:0.8,
      pat:'E5 . D5 E5 G5 . E5 . D5 . . . B4 . D5 . E5 . D5 E5 G5 . A5 . G5 . E5 . B4 . . .' } ],
    perc:'k h s h k h s h k h s h k h s s k h s h k h s h k k s h k h s s' },
  // funkelnd / wundersam — D-Dur Arpeggien, Pad, Glockenpunkte
  stars: { bpm: 88, voices: [
    { type:'triangle', vol:0.10, len:7.5,
      pat:'D2 . . . . . . . A1 . . . . . . . B1 . . . . . . . G1 . . . . . . .' },
    { type:'triangle', vol:0.075, len:0.95,
      pat:'D5 F#5 A5 D6 A5 F#5 D5 . A4 C#5 E5 A5 E5 C#5 A4 . B4 D5 F#5 B5 F#5 D5 B4 . G4 B4 D5 G5 D5 B4 G4 .' },
    { type:'sine', vol:0.06, len:7.5,
      pat:'F#4 . . . . . . . E4 . . . . . . . F#4 . . . . . . . G4 . . . . . . .' },
    { type:'sine', vol:0.045, len:2.5,
      pat:'. . . . . . A6 . . . . . . . . . . . . . . . F#6 . . . . . . . D6 .' } ],
    perc:'h . . . . . h . . . . . h . . . . . h . . . . . h . . . . . h .' },
  // Abspann: froehliche C-Dur-Fanfare im Loop
  end: { bpm: 120, voices: [
    { type:'triangle', vol:0.12, len:1.8,
      pat:'C2 . . . G2 . . . F2 . . . G2 . . . C2 . . . E2 . . . F2 . . . G2 . . .' },
    { type:'square', vol:0.055, len:0.9,
      pat:'C5 . E5 . G5 . . . A5 . G5 . E5 . . . F5 . A5 . C6 . . . B5 . G5 . E5 . C5 .' },
    { type:'triangle', vol:0.05, len:3.8,
      pat:'E4 . . . G4 . . . F4 . . . B4 . . . E4 . . . G4 . . . A4 . . . B4 . . .' } ],
    perc:'k . h . s . h . k . h . s . h . k . h . s . h . k . h . s . h h' }
};
// Szene -> Spur
const SCENE_MUSIC = {
  title:'title',
  inside:'calm', home:'calm', river:'calm', sword:'calm',
  gate:'tense', fork:'tense', confirmgate:'tense',
  spider:'battle', croc:'battle',
  stars:'stars', end:'end'
};
const Music = {
  ctx: null, master: null, layers: [], timer: null, started: false, current: null, scene: null,
  get enabled() { return Prefs.data.music; },

  init() {
    if (this.master) return;
    Sfx.init();
    if (!Sfx.ctx) return;
    this.ctx = Sfx.ctx;
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? CONFIG.musicVolume : 0;
    this.master.connect(this.ctx.destination);
  },
  // erst nach dem Start-Knopf (Autoplay-Policy)
  start() { this.started = true; this.init(); if (this.scene) this.setScene(this.scene); },
  setScene(scene) {
    this.scene = scene;
    if (!this.started) return;
    this.play(SCENE_MUSIC[scene] || null);
  },
  play(name) {
    this.init();
    if (!this.ctx) return;
    if (this.current && this.current.name === name) return;
    const now = this.ctx.currentTime;
    this.prune(now);
    if (this.current) {                     // alte Spur ausblenden
      const old = this.current;
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.setValueAtTime(old.gain.gain.value, now);
      old.gain.gain.linearRampToValueAtTime(0, now + CONFIG.musicFade);
      old.dieAt = now + CONFIG.musicFade;
      this.current = null;
    }
    if (!name || !MUSIC_TRACKS[name]) return;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(1, now + CONFIG.musicFade);
    g.connect(this.master);
    const spec = MUSIC_TRACKS[name];
    const layer = {
      name, spec, gain: g, step: 0, nextTime: now + 0.05, dieAt: null,
      voices: spec.voices.map(v => ({ ...v, notes: v.pat.trim().split(/\s+/) })),
      perc: spec.perc.trim().split(/\s+/)
    };
    this.layers.push(layer);
    this.current = layer;
    this.ensureTimer();
  },
  ensureTimer() {
    if (this.timer || !this.enabled || document.hidden || !this.ctx) return;
    this.timer = setInterval(() => this.tick(), 90);
    this.tick();
  },
  stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } },
  // ausgeblendete Spuren wegraeumen. Laeuft kein Timer (Tab versteckt, Musik
  // aus), wurde fuer sie auch nichts geplant -> sofort weg, sonst nach dem Fade.
  prune(now) {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const L = this.layers[i];
      const faded = !this.timer || this.ctx.state !== 'running' || now > L.dieAt + 0.1;
      if (L.dieAt !== null && faded) { L.gain.disconnect(); this.layers.splice(i, 1); }
    }
  },
  tick() {
    const now = this.ctx.currentTime;
    this.prune(now);
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const L = this.layers[i];
      const stepDur = 60 / L.spec.bpm / 2;          // Achtel
      const lookahead = stepDur * 8;                 // ~1 Takt voraus
      while (L.nextTime < now + lookahead) {
        if (L.dieAt === null || L.nextTime < L.dieAt) this.scheduleStep(L, L.step, L.nextTime, stepDur);
        L.step++; L.nextTime += stepDur;
      }
    }
    if (!this.layers.length) this.stopTimer();
  },
  scheduleStep(L, step, at, stepDur) {
    for (const v of L.voices) {
      const n = v.notes[step % v.notes.length];
      if (n !== '.' && NOTE_FREQ[n]) this.note(NOTE_FREQ[n], at, stepDur * v.len, v.type, v.vol, L.gain);
    }
    const d = L.perc[step % L.perc.length];
    if (d !== '.') this.drum(d, at, L.gain);
  },
  note(freq, at, dur, type, vol, out) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.012);
    g.gain.setValueAtTime(vol, at + Math.max(0.012, dur * 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(out);
    o.start(at); o.stop(at + dur + 0.03);
  },
  drum(kind, at, out) {
    if (kind === 'k') {                             // Kick: kurzer Pitch-Drop
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(150, at); o.frequency.exponentialRampToValueAtTime(40, at + 0.12);
      g.gain.setValueAtTime(0.22, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + 0.16);
      return;
    }
    // Hi-Hat / Snare aus dem Rauschpuffer
    const src = this.ctx.createBufferSource(); src.buffer = Sfx.noiseBuf; src.loop = true;
    const flt = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    const dur = kind === 's' ? 0.12 : 0.04;
    flt.type = kind === 's' ? 'bandpass' : 'highpass';
    flt.frequency.value = kind === 's' ? 1800 : 7000; flt.Q.value = kind === 's' ? 0.8 : 1;
    g.gain.setValueAtTime(kind === 's' ? 0.16 : 0.05, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(flt); flt.connect(g); g.connect(out);
    src.start(at); src.stop(at + dur + 0.02);
  },
  setEnabled(on) {
    Prefs.data.music = on; Prefs.save();
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(on ? CONFIG.musicVolume : 0, now + 0.3);
    if (on) this.resume(); else this.suspend();
  },
  // Tab versteckt / Musik aus: Timer stoppen, bereits geplante Noten laufen aus
  suspend() { this.stopTimer(); },
  resume() {
    if (!this.started || !this.enabled || document.hidden || !this.ctx) return;
    const now = this.ctx.currentTime;
    for (const L of this.layers) if (L.nextTime < now) L.nextTime = now + 0.05;
    this.ensureTimer();
  }
};
document.addEventListener('visibilitychange', () => { if (document.hidden) Music.suspend(); else Music.resume(); });

// ===================== SCREENSHAKE =====================
/* addShake(staerke_in_px, dauer_in_s) — wird von Sequenz-Schritten
   ueber  { key:'…', shake:3 }  ausgeloest und in frame() angewendet. */
const shake = { t: 0, dur: 0.001, mag: 0 };
function addShake(mag, dur) {
  if (!Prefs.data.shake) return;
  mag = mag || 2; dur = dur || 0.28;
  if (mag >= shake.mag * (shake.t / shake.dur)) { shake.mag = mag; shake.dur = dur; shake.t = dur; }
}
function updateShake(dt) { if (shake.t > 0) shake.t = Math.max(0, shake.t - dt); }
function shakeOffset() {
  if (shake.t <= 0) return null;
  const k = shake.t / shake.dur;              // 1 -> 0
  const m = shake.mag * k * k;                // quadratisch abklingend
  const p = (shake.dur - shake.t) * 60;
  const x = Math.round(Math.sin(p * 1.9) * m);
  const y = Math.round(Math.cos(p * 2.7) * m * 0.6);
  return (x || y) ? { x, y } : null;
}

// ===================== PARTIKEL =====================
/* Ein kleiner gepoolter Partikel-Layer fuer Staub, Funken, Splitter,
   Wassertropfen und Konfetti. Hart auf CONFIG.particleMax begrenzt —
   wird das Limit erreicht, ersetzt ein neuer Partikel den aeltesten.
   Rein dekorativ: kein Partikel beeinflusst Spiellogik.             */
const particles = [];
let pSeed = 1;
function pRand() { pSeed = (pSeed * 16807) % 2147483647; return pSeed / 2147483647; }
function spawnParticle(x, y, opt) {
  const p = {
    x, y,
    vx: (opt.vx || 0) + (pRand() - 0.5) * (opt.spread || 0),
    vy: (opt.vy || 0) - pRand() * (opt.up || 0),
    g: opt.g !== undefined ? opt.g : 90,
    life: opt.life || 0.5,
    t: 0,
    size: opt.size || 1,
    color: Array.isArray(opt.color) ? opt.color[(pRand() * opt.color.length) | 0] : opt.color,
    flutter: opt.flutter || 0
  };
  if (particles.length >= CONFIG.particleMax) particles.shift();
  particles.push(p);
}
function burst(x, y, n, opt) { for (let i = 0; i < n; i++) spawnParticle(x, y, opt); }
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.t += dt;
    if (p.t >= p.life) { particles.splice(i, 1); continue; }
    p.vy += p.g * dt;
    p.x += p.vx * dt + (p.flutter ? Math.sin((p.t * 10) + p.x) * p.flutter : 0);
    p.y += p.vy * dt;
  }
}
function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;
}
// vordefinierte Effekte, ausgeloest ueber den sfx-Namen eines Sequenz-Schritts
const PARTICLE_FX = {
  hit:     (x, y) => burst(x, y - 10, 8,  { spread: 70, up: 50, life: 0.4, color: ['#ffffff', '#ffd23f'] }),
  defeat:  (x, y) => burst(x, y - 8, 10,  { spread: 60, up: 70, life: 0.6, color: ['#cfd8dc', '#8a8a8a'] }),
  crash:   (x, y) => burst(x, y - 6, 12,  { spread: 90, up: 80, life: 0.7, color: ['#8a5a2e', '#5a3a22', '#4a2f18'], size: 2 }),
  splash:  (x, y) => burst(x, y - 2, 14,  { spread: 80, up: 110, life: 0.6, color: ['#4f9bb8', '#8fd3e8', '#ffffff'] }),
  gate:    (x, y) => burst(x, y - 40, 16, { spread: 50, up: 60, g: -25, life: 1.0, color: ['#ffd23f', '#ffe999'] }),
  star:    (x, y) => burst(x, y, 14,      { spread: 60, up: 70, g: -15, life: 0.9, color: ['#ffd23f', '#ffffff', '#ffe999'] }),
  shatter: (x, y) => burst(x, y, 14,      { spread: 110, up: 60, life: 0.6, color: ['#ffd23f', '#c9902a'] }),
  attack:  (x, y) => burst(x - 6, y, 4,   { spread: 40, up: 25, life: 0.35, color: ['#d9c9a6'] })
};

// Offscreen-Canvas in Render-Aufloesung, Zeichenkontext in Spielkoordinaten
function offscreen() {
  const c = document.createElement('canvas');
  c.width = W * RES; c.height = H * RES;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  cx.scale(RES, RES);
  return [c, cx];
}
// Vignette einmal vorrendern (jeden Frame neu waere Verschwendung), dezent
const [vignette, vctx] = offscreen();
{
  const g = vctx.createRadialGradient(W / 2, H / 2, H * 0.6, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(13,10,16,0.22)');
  vctx.fillStyle = g; vctx.fillRect(0, 0, W, H);
}

// Roter Schadensblitz (Minecraft-Vignette): einmal vorgerendert, pro Frame
// nur mit globalAlpha gezeichnet. Kraeftig am Rand, Mitte bleibt sichtbar.
const [damageVignette, dctx] = offscreen();
{
  const g = dctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(220,30,30,0.25)');
  g.addColorStop(1, 'rgba(200,10,10,1)');
  dctx.fillStyle = g; dctx.fillRect(0, 0, W, H);
}
const damage = { t: 0 };
/* Jeder Fehlschlag: roter Blitz + error-Sound + kurzer Shake.
   Blitz und Shake respektieren den FX-Schalter, der Ton nicht.        */
function failFlash() {
  Sfx.play('error');
  if (!Prefs.data.shake) return;
  damage.t = CONFIG.damageTime;
  addShake(2.5, 0.3);
}

// Szenenwechsel-Fade (nur Einblenden — blockiert nie die Logik)
let fadeAlpha = 1;

