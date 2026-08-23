/* ===================== ENGINE — Asset-Manifest, Asset-Manager, Anim, drawSprite, Spielzustand, Sequenzen, Eingabe =====================
   Teil von game.js (aufgeteilt in Module, Ladereihenfolge siehe index.html).
   Klassische Scripts: alle Top-Level-Deklarationen sind global sichtbar.
   ===================== */

/* ===================== 1. ASSET MANIFEST =====================
   Fill in src + frames for each. w/h = single frame size in px.
   fps = playback speed. loop = repeat vs play once.
   Leave src:null to keep the code-drawn placeholder.
   start     = erster Frame im Sheet (mehrere Animationen in einer PNG)
   padBottom = leere Zeilen unter den Fuessen. Wird beim Laden automatisch
               gescannt; hier setzen, wenn der Scan danebenliegt.      */
const ASSET_MANIFEST = {
  // --- Bruno ---
  // bruno/idle.png ist in Wahrheit ein Laufzyklus: Frame 0+1 = Ruhepose,
  // Frame 2-7 = Gehen. Idle steht deshalb still (frames:1), Walk nimmt
  // ueber start:2 nur den Zyklus.
  bruno_idle:      { src:'assets/bruno/idle.png', frames:1, fps:1,  w:32, h:32, loop:true, start:0 },
  bruno_walk:      { src:'assets/bruno/idle.png', frames:6, fps:12, w:32, h:32, loop:true, start:2 },
  // NOTLOESUNG: attack/hit/death/cheer haben noch kein eigenes Sheet.
  // Sobald ein echtes GIF in assets/bruno/ liegt:
  //   python3 tools/gif2sheet.py assets/bruno/attack.gif -o assets/bruno/attack.png \
  //       --key bruno_attack --fps 14 --loop false --native 32x32 --preview
  // und die ausgegebene Zeile hier eintragen (frames/w/h exakt uebernehmen!).
  bruno_attack:    { src:'assets/bruno/idle.png', frames:6, fps:20, w:32, h:32, loop:true, start:2 },
  bruno_hit:       { src:'assets/bruno/idle.png', frames:1, fps:1,  w:32, h:32, loop:true, start:0 },
  bruno_death:     { src:'assets/bruno/idle.png', frames:1, fps:1,  w:32, h:32, loop:true, start:0 },
  bruno_cheer:     { src:'assets/bruno/idle.png', frames:1, fps:1,  w:32, h:32, loop:true, start:0 },
  // Schwert: 8 Frames Drehung, HALBE Groesse (sword.gif -> gif2sheet --native 16x16),
  // damit es zu Bruno passt. Auf dem Altar dreht es sich, in der Pfote Frame 0.
  // Das grosse Sheet (assets/props/sword.png, 12x29) bleibt als Reserve liegen.
  sword:           { src:'assets/props/sword_small.png', frames:8, fps:6, w:6, h:14, loop:true },
  // Hut (Fedora, 16x9, per Pillow erzeugt): haengt am Haken, danach Overlay auf Brunos Kopf (drawHat)
  hat:             { src:'assets/props/hat.png', frames:1, fps:1, w:16, h:9, loop:false },
  // Ruderboot in Seitenansicht (tools/make_boat.py): naher Bordrand = Zeile 8, Kiel = Zeile 25
  boat:            { src:'assets/props/boat.png', frames:1, fps:1, w:56, h:26, loop:false },
  // --- Enemies ---
  // Spinne + Krokodil: echte Idle-Loops (assets/<tier>/idle.gif -> idle.png).
  // hit/defeated nutzen dasselbe Sheet — schneller bzw. langsamer abgespielt,
  // den Rest (Zucken, Umkippen, Ausblenden) machen die fx-Transformationen
  // in drawSequence(). Eigene Sheets: hit.gif / defeated.gif durch
  // gif2sheet.py jagen und hier src/frames ersetzen.
  spider_idle:     { src:'assets/spider/idle.png', frames:14, fps:6,  w:32, h:19, loop:true  },
  spider_hit:      { src:'assets/spider/idle.png', frames:14, fps:24, w:32, h:19, loop:true  },
  spider_defeated: { src:'assets/spider/idle.png', frames:14, fps:4,  w:32, h:19, loop:true  },
  croc_idle:       { src:'assets/croc/idle.png',   frames:8,  fps:8,  w:32, h:15, loop:true  },
  croc_hit:        { src:'assets/croc/idle.png',   frames:8,  fps:24, w:32, h:15, loop:true  },
  croc_defeated:   { src:'assets/croc/idle.png',   frames:8,  fps:4,  w:32, h:15, loop:true  },
  // --- Props ---
  fisher_good:     { src:'assets/props/fisher_good.png', frames:8, fps:8, w:19, h:32, loop:true },
  fisher_evil:     { src:'assets/props/fisher_evil.png', frames:5, fps:8, w:20, h:32, loop:true },
  boat_idle:       { src:null, frames:2, fps:3,  w:34, h:16, loop:true  },
  boat_break:      { src:null, frames:6, fps:10, w:34, h:20, loop:false },
  gate_closed:     { src:'assets/props/gate_closed.png', frames:1, fps:1, w:64, h:96, loop:false },
  gate_open:       { src:'assets/props/gate_open.png', frames:6, fps:9, w:64, h:96, loop:false },
  gate_reject:     { src:'assets/props/gate_reject.png', frames:4, fps:10, w:64, h:96, loop:false },
  sword_glow:      { src:null, frames:4, fps:6,  w:12, h:16, loop:true  },
  star_float:      { src:null, frames:4, fps:5,  w:12, h:12, loop:true  },
  star_collect:    { src:null, frames:5, fps:10, w:16, h:16, loop:false },
  star_shatter:    { src:null, frames:5, fps:12, w:16, h:16, loop:false },
  // --- FX ---
  splash:          { src:null, frames:5, fps:12, w:20, h:16, loop:false },
  slash:           { src:null, frames:4, fps:16, w:16, h:16, loop:false },
  // --- Backgrounds (optional full-scene art, 256x144) ---
  bg_home:         { src:null, frames:1, fps:1, w:256, h:144, loop:false },
  bg_river:        { src:null, frames:1, fps:1, w:256, h:144, loop:false },
  bg_sword:        { src:null, frames:1, fps:1, w:256, h:144, loop:false },
  bg_gate:         { src:null, frames:1, fps:1, w:256, h:144, loop:false },
  bg_fork:         { src:null, frames:1, fps:1, w:256, h:144, loop:false },
  bg_spider:       { src:null, frames:1, fps:1, w:256, h:144, loop:false },
  bg_croc:         { src:null, frames:1, fps:1, w:256, h:144, loop:false },
  bg_confirmgate:  { src:null, frames:1, fps:1, w:256, h:144, loop:false },
  bg_stars:        { src:null, frames:1, fps:1, w:256, h:144, loop:false },
  bg_end:          { src:null, frames:1, fps:1, w:256, h:144, loop:false }
};

// ===================== 2. ASSET MANAGER =====================
const Assets = {
  imgs: {},      // key -> HTMLImageElement (loaded ones only)
  ready: false,
  load(cb) {
    const entries = Object.entries(ASSET_MANIFEST).filter(([k,v]) => v.src);
    if (entries.length === 0) { this.ready = true; cb(); return; }
    // Mehrere Keys duerfen auf dieselbe Datei zeigen (spider_idle/hit/defeated
    // teilen sich ein Sheet) — jede Datei wird trotzdem nur einmal geladen.
    const bySrc = {};
    for (const [key, spec] of entries) (bySrc[spec.src] = bySrc[spec.src] || []).push(key);
    const srcs = Object.keys(bySrc);
    let pending = srcs.length;
    const done = () => { if (--pending === 0) { this.ready = true; cb(); } };
    for (const src of srcs) {
      const img = new Image();
      img.onload = () => {
        const pad = this.scanPadBottom(img);
        for (const key of bySrc[src]) {
          this.imgs[key] = img;
          const spec = ASSET_MANIFEST[key];
          if (spec.padBottom === undefined) spec.padBottom = pad;   // manueller Wert gewinnt
        }
        done();
      };
      img.onerror = () => { console.warn('Missing asset (using placeholder):', src); done(); };
      img.src = src;
    }
  },
  /* Leere Zeilen unter den Fuessen zaehlen (ueber das ganze Sheet, also
     alle Frames). drawSprite zieht sie ab, damit nichts schwebt.
     Ueber file:// ist die Canvas "tainted" -> getImageData wirft -> 0.   */
  scanPadBottom(img) {
    try {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const cx = c.getContext('2d', { willReadFrequently: true });
      cx.drawImage(img, 0, 0);
      const d = cx.getImageData(0, 0, img.width, img.height).data;
      let rows = 0;
      for (let y = img.height - 1; y >= 0; y--) {
        let empty = true;
        for (let x = 0; x < img.width; x++) if (d[(y * img.width + x) * 4 + 3] !== 0) { empty = false; break; }
        if (!empty) break;
        rows++;
      }
      return rows;
    } catch (e) { return 0; }
  },
  has(key) { return !!this.imgs[key]; }
};

// ===================== 3. ANIM PLAYER =====================
class Anim {
  constructor(key) { this.set(key); }
  set(key) {
    if (this.key === key) return;
    this.key = key;
    this.spec = ASSET_MANIFEST[key] || { frames:1, fps:1, loop:true };
    this.t = 0; this.frame = 0; this.done = false;
  }
  update(dt) {
    if (this.done) return;
    this.t += dt;
    const step = 1 / this.spec.fps;
    while (this.t >= step) {
      this.t -= step;
      this.frame++;
      if (this.frame >= this.spec.frames) {
        if (this.spec.loop) this.frame = 0;
        else { this.frame = this.spec.frames - 1; this.done = true; }
      }
    }
  }
  reset() { this.t = 0; this.frame = 0; this.done = false; }
}
/* Frame eines Endlos-Loops direkt aus der Spielzeit ableiten — fuer
   Kulissenfiguren (Fischer, Spinne, Krokodil, Schwert am Boden), die
   keinen eigenen Anim-Zustand brauchen. t laeuft in 1/60 s.          */
function loopFrame(key) {
  const spec = ASSET_MANIFEST[key];
  if (!spec || spec.frames <= 1) return 0;
  return Math.floor((t / 60) * spec.fps) % spec.frames;
}

// draw a loaded sprite frame centered at (cx, groundLevel bottom)
function drawSprite(key, frame, cx, bottomY, facing) {
  const spec = ASSET_MANIFEST[key];
  const img = Assets.imgs[key];
  if (!img) return false;
  const sx = ((spec.start || 0) + frame) * spec.w;
  const top = Math.round(bottomY - spec.h + (spec.padBottom || 0));   // Fuesse auf bottomY
  ctx.save();
  if (facing < 0) {
    ctx.translate(Math.round(cx + spec.w/2), top);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, 0, spec.w, spec.h, 0, 0, spec.w, spec.h);
  } else {
    ctx.drawImage(img, sx, 0, spec.w, spec.h, Math.round(cx - spec.w/2), top, spec.w, spec.h);
  }
  ctx.restore();
  return true;
}

// Sprite einmal in einen Zwischenpuffer zeichnen und dort einfaerben —
// so trifft der weisse Hit-Blitz nur den Gegner, nicht den Hintergrund.
const tintCanvas = document.createElement('canvas');
const tintCtx = tintCanvas.getContext('2d');
function drawSpriteTinted(key, frame, cx, bottomY, facing, color, alpha) {
  const spec = ASSET_MANIFEST[key];
  const img = Assets.imgs[key];
  if (!img) return false;
  if (tintCanvas.width < spec.w || tintCanvas.height < spec.h) {
    tintCanvas.width = Math.max(tintCanvas.width, spec.w);
    tintCanvas.height = Math.max(tintCanvas.height, spec.h);
  }
  tintCtx.clearRect(0, 0, spec.w, spec.h);
  tintCtx.drawImage(img, ((spec.start || 0) + frame) * spec.w, 0, spec.w, spec.h, 0, 0, spec.w, spec.h);
  tintCtx.globalCompositeOperation = 'source-atop';
  tintCtx.fillStyle = color;
  tintCtx.globalAlpha = alpha;
  tintCtx.fillRect(0, 0, spec.w, spec.h);
  tintCtx.globalAlpha = 1;
  tintCtx.globalCompositeOperation = 'source-over';
  const top = Math.round(bottomY - spec.h + (spec.padBottom || 0));
  ctx.save();
  if (facing < 0) {
    ctx.translate(Math.round(cx + spec.w / 2), top);
    ctx.scale(-1, 1);
    ctx.drawImage(tintCanvas, 0, 0, spec.w, spec.h, 0, 0, spec.w, spec.h);
  } else {
    ctx.drawImage(tintCanvas, 0, 0, spec.w, spec.h, Math.round(cx - spec.w / 2), top, spec.w, spec.h);
  }
  ctx.restore();
  return true;
}

// ===================== GAME STATE =====================
/* enemyState: 'alive' (wartet) | 'dead' (liegt da, Statuswert noch nicht
   geprueft) | 'verified' (Sieg bestaetigt). Der Gegner verschwindet erst
   mit 'verified' — die Pruefung ist die Lektion, nicht der Hieb.
   starTaken: Index des gewaehlten Sterns im Finale (-1 = keiner).         */
const state = { scene:'home', hasCodeblatt:false, hasSword:false, hasHat:false, path:null, enemyState:'alive', starTaken:-1,
  footprints: {},          // Szene -> [{x, y}] — schlammige Pfotenabdruecke, bleiben bis zum Aufraeumen am Ende
  broomTaken: false };
const ui = { mode:null }; // null | 'panel' | 'modal' | 'anim' | 'transition'
let timeScale = 1;        // Zeitlupe fuer das Finale (skaliert nur die Kulissen-Zeit t)
let sceneTime = 0;        // s seit dem Aufdecken der Szene (Sonnenaufgang, Titel-Slam)
let brunoX = 24, brunoFacing = 1;
let brunoY = 0, brunoVY = 0;       // Sprung: Hoehe ueber dem Boden, Vertikalgeschwindigkeit (neg. = aufwaerts)
function jump() {
  if (brunoY > 0 || ui.mode !== null) return;
  brunoVY = -CONFIG.jumpVel;
  Sfx.play('jump');
}
const brunoAnim = new Anim('bruno_idle');
let t = 0, lastTime = 0;

// One-shot animation sequence player (pauses gameplay) --------
let sequence = null; // { steps:[{key,x,bottomY,facing,dur,onStart}], i, onDone }
function playSequence(steps, onDone) {
  ui.mode = 'anim';
  sequence = { steps, i:-1, onDone, anim:new Anim('bruno_idle'), timer:0 };
  advanceSequence();
}
function advanceSequence() {
  sequence.i++;
  if (sequence.i >= sequence.steps.length) {
    const done = sequence.onDone; sequence = null; ui.mode = null;
    if (done) done();
    return;
  }
  const step = sequence.steps[sequence.i];
  sequence.anim.set(step.key);
  sequence.anim.reset();
  sequence.timer = step.dur || 0.6;
  if (step.sfx) {
    Sfx.play(step.sfx);
    const pfx = PARTICLE_FX[step.sfx];
    if (pfx) pfx(step.x, step.bottomY || groundY);
  }
  if (step.shake) addShake(step.shake, step.shakeDur || 0.3);
  if (step.onStart) step.onStart();
}
function updateSequence(dt) {
  if (!sequence) return;
  sequence.anim.update(dt);
  sequence.timer -= dt;
  if (sequence.timer <= 0) advanceSequence();
}
// Fortschritt 0..1 des laufenden Schritts
function seqProgress(step) { return Math.max(0, Math.min(1, 1 - (sequence.timer / (step.dur || 0.6)))); }
// Schritte duerfen wandern: { fromX, toX } statt festem x
function seqX(step, p) { return step.toX !== undefined ? step.fromX + (step.toX - step.fromX) * p : step.x; }

function drawSequence() {
  if (!sequence) return;
  const step = sequence.steps[sequence.i];
  if (!step) return;
  const f = sequence.anim.frame;
  const spec = ASSET_MANIFEST[step.key] || { frames:1, w:32, h:32 };
  const p = seqProgress(step);
  const sx = seqX(step, p);
  const by = step.bottomY || groundY;
  const facing = step.facing || (step.toX !== undefined ? (step.toX >= step.fromX ? 1 : -1) : 1);
  const isBruno = step.key.indexOf('bruno') === 0;

  // Transform-based effects so single-frame sprites still read as animated
  const fx = step.fx;
  if (fx) {
    ctx.save();
    if (fx === 'hit') {
      ctx.translate(Math.sin(p * 40) * 3, 0);
    } else if (fx === 'defeat') {
      // Hochschnellen und auf den Ruecken kippen (180 Grad um die Mitte) —
      // Endlage ist exakt die Leichenpose aus drawCorpse()
      const cy = by - (spec.h || 16) / 2;
      ctx.translate(sx, cy - Math.sin(p * Math.PI) * 8);
      ctx.rotate(p * Math.PI * facing);
      ctx.translate(-sx, -cy);
    } else if (fx === 'lunge') {
      ctx.translate(p * 14, -Math.sin(p * Math.PI) * 6);
    } else if (fx === 'death') {
      // umkippen + leicht absinken — funktioniert auch mit dem Idle-Sheet
      ctx.translate(sx, by);
      ctx.rotate(p * 1.35);
      ctx.translate(-sx, -by + p * 4);
    } else if (fx === 'reach') {
      // in die Knie, leicht zum Schwert beugen (Pose ohne eigenes Sheet)
      const k = Math.sin(p * Math.PI);
      ctx.translate(sx, by);
      ctx.rotate(0.18 * k * facing);
      ctx.scale(1, 1 - 0.14 * k);
      ctx.translate(-sx, -by);
    } else if (fx === 'lift') {
      // Schwert loest sich aus dem Boden und steigt leuchtend auf
      const g = 0.25 + 0.35 * p;
      ctx.fillStyle = `rgba(255,236,170,${g * 0.5})`;
      ctx.beginPath(); ctx.ellipse(sx, by - 14 - p * 22, 16 + p * 6, 16 + p * 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,250,220,${g})`;
      ctx.beginPath(); ctx.ellipse(sx, by - 14 - p * 22, 8 + p * 3, 8 + p * 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.translate(sx, by);
      ctx.rotate(-0.18 * (1 - p));
      ctx.translate(-sx, -by - p * 22);
    } else if (fx === 'drown') {
      // ins Wasser: kurz strampeln, dann unter die Wasserlinie sinken (Clip
      // an der Wasseroberflaeche — er faellt nicht aus dem Bild), Luftblasen
      const sink = p < 0.35 ? Math.sin(p * 20) * 2 : Math.pow((p - 0.35) / 0.65, 2) * 34;
      ctx.beginPath(); ctx.rect(0, 0, W, by + 2); ctx.clip();
      ctx.translate(sx, by); ctx.rotate(Math.sin(p * 14) * 0.12 * (1 - p)); ctx.translate(-sx, -by + sink);
      if (p > 0.3 && pRand() < 0.35) spawnParticle(sx + (pRand() - 0.5) * 10, by - 2, { up: 30, g: -40, life: 0.7, color: ['#d6f2ff', '#ffffff'] });
    } else if (fx === 'flyout') {
      // vom Stern emporgehoben: Bogen nach oben rechts, kleiner werdend, Stern ueber dem Kopf, Funkenspur
      const e = p * p;
      const dy = -e * 150 - Math.sin(p * Math.PI) * 10;
      const sc = 1 - 0.45 * e;
      ctx.translate(sx, by + dy); ctx.scale(sc, sc); ctx.translate(-sx, -by);
      const sc2 = (typeof CODEBLATT !== 'undefined') ? starById(CODEBLATT.finalStar).c : '#ffd23f';
      drawWonStar(sx, by - 38 + Math.sin(t * 0.2) * 2, 0.9, sc2);
      if (pRand() < 0.6) spawnParticle(sx + (pRand() - 0.5) * 16, by + dy - 20, { spread: 20, up: 10, g: 30, life: 0.6, color: [sc2, '#ffffff', '#ffe999'] });
    } else if (fx === 'enter') {
      // durchs Tor: ab 55 % des Wegs kleiner und blasser werden
      const q = Math.max(0, (p - 0.55) / 0.45);
      ctx.translate(sx, by);
      ctx.scale(1 - 0.35 * q, 1 - 0.35 * q);
      ctx.translate(-sx, -by);
      ctx.globalAlpha = 1 - 0.75 * q;
    }
  }

  // Schwert hinter Bruno (getragen) — vor dem Sprite zeichnen
  let swing = 0, anchorKey = step.key;
  if (isBruno) {
    if (step.key === 'bruno_attack') swing = p;
    if (fx === 'raise') { anchorKey = 'bruno_raise'; }
    drawHeldSword(sx, by, facing, swing, anchorKey, f, 'back', fx === 'raise' || fx === 'enter');
  }

  if (!drawSprite(step.key, f, sx, by, facing)) {
    placeholderOneShot(step.key, sx, by, sequence.anim);
  }
  // Hut im selben Transform wie der Sprite (rotiert/blendet bei death/defeat/drown/flyout mit)
  if (isBruno) drawHat(sx, by, facing, step.key, f);

  // Schwert vor Bruno (Hieb, hochgehalten)
  if (isBruno) drawHeldSword(sx, by, facing, swing, anchorKey, f, 'front', fx === 'raise' || fx === 'enter');

  if (fx === 'hit') {
    // weisser Blitz NUR auf dem Sprite (ueber den Tint-Puffer),
    // nicht mehr als Rechteck ueber dem Hintergrund
    drawSpriteTinted(step.key, f, sx, by, facing, '#ffffff', 0.7 * (1 - p));
  }
  if (fx === 'raise') {
    // Funkeln um das erhobene Schwert
    const hx = sx + facing * 14, hy = by - 16 - 20;
    ctx.fillStyle = `rgba(255,240,180,${0.35 * Math.sin(p * Math.PI)})`;
    ctx.beginPath(); ctx.ellipse(hx, hy, 10, 14, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (fx) ctx.restore();
}

// ===================== INPUT =====================
const keys = {};
let nearestHotspot = null;   // von update() gesetzt, von der Interakt-Taste benutzt
function isTyping(e) {
  const el = e.target;
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
}
window.addEventListener('keydown', e => {
  if (isTyping(e)) {
    // im Eingabefeld: Enter = Bestaetigen, sonst nichts anfassen
    if (e.key === 'Enter') {
      const btn = document.getElementById('submitBtn');
      if (btn) { e.preventDefault(); btn.click(); }
    }
    return;
  }
  keys[e.code] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();

  // ---- Tastatur-UX ------------------------------------------------
  // Level-Wipe: jede Taste ueberspringt ihn (und macht sonst nichts)
  if (transition.active) { finishTransition(); return; }
  // Besenflug am Ende: jede Taste ueberspringt ihn
  if (cleanup.active) { finishCleanup(); return; }
  // Esc: Pausenmenue auf/zu (nicht auf dem Titelbildschirm)
  if (e.code === 'Escape') { if (ui.mode !== 'modal' || menuOpen()) toggleMenu(); else closeCodeblatt(); return; }
  if (ui.mode === 'menu') return;            // im Menue nur Maus/Tab/Enter auf den Knoepfen
  // G: Codeblatt auf/zu (gleiche Regeln wie der Knopf oben rechts)
  if (e.code === 'KeyG') { toggleCodeblatt(); return; }
  // E im Codeblatt: schliessen
  if (e.code === 'KeyE' && ui.mode === 'modal') { closeCodeblatt(); return; }
  // Leertaste / W / Pfeil hoch: springen (nur im freien Spiel)
  if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') && ui.mode === null) { jump(); return; }
  // E / Enter: Hotspot benutzen (nur im freien Spiel, nur am Boden)
  if ((e.code === 'KeyE' || e.code === 'Enter') && ui.mode === null) {
    if (nearestHotspot && brunoY <= 0) { const hs = nearestHotspot; nearestHotspot = null; hs.onInteract(); }
    return;
  }
  // In Panels: E/Enter/Space blaettert weiter — aber NUR wenn es genau einen
  // Button gibt (nie automatisch eine inhaltliche Wahl treffen!)
  if ((e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') && ui.mode === 'panel') {
    const btns = document.querySelectorAll('#uiLayer .btn');
    if (btns.length === 1) btns[0].click();
    return;
  }
  // Ziffern 1..9 waehlen die n-te Option einer Mehrfachauswahl
  if (ui.mode === 'panel' && /^Digit[1-9]$/.test(e.code)) {
    const btns = document.querySelectorAll('#uiLayer .btn');
    const i = +e.code.slice(5) - 1;
    if (btns.length > 1 && btns[i]) btns[i].click();
  }
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function left(){ return keys['ArrowLeft']||keys['KeyA']; }
function right(){ return keys['ArrowRight']||keys['KeyD']; }

