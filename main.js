/* ===================== MAIN — Frame-Loop, fitCanvas, Boot =====================
   Teil von game.js (aufgeteilt in Module, Ladereihenfolge siehe index.html).
   Klassische Scripts: alle Top-Level-Deklarationen sind global sichtbar.
   ===================== */

// ===================== MAIN LOOP =====================
let confettiTimer = 0;
function frame(now) {
  // dt auf [0, 50 ms] klemmen: nie negativ (Zeitstempel-Sprung), nie riesig (Tab war weg)
  const dt = Math.max(0, Math.min(0.05, (now - lastTime) / 1000 || 0));
  lastTime = now; t += dt * 60 * timeScale; sceneTime += dt;
  // Render-Aufloesung: absolut setzen (heilt unbalancierte save/restore), Pixel scharf
  ctx.setTransform(RES, 0, 0, RES, 0, 0);
  ctx.imageSmoothingEnabled = false;
  Labels.beginFrame();
  updateTransition(dt);
  update(dt);
  updateShake(dt);
  updateParticles(dt);
  if (damage.t > 0) damage.t = Math.max(0, damage.t - dt);
  if (flash.t > 0) flash.t = Math.max(0, flash.t - dt);

  // Konfetti-Regen in der Endszene (dekorativ, gedeckelt durch particleMax)
  if (state.scene === 'end' && !transition.active) {
    confettiTimer -= dt;
    if (confettiTimer <= 0) {
      confettiTimer = 0.05;
      spawnParticle(pRand() * W, -4, {
        vy: 26, g: 8, spread: 12, life: 3.2, flutter: 0.5,
        color: ['#ffd23f', '#f2789f', '#4aa8ff', '#4ad66d', '#ffffff'], size: 2
      });
    }
  }

  const off = shakeOffset();
  Labels.setShake(off);
  if (off) {
    // Rand fuellen, sonst blitzt beim Verschieben der Canvas-Hintergrund durch
    ctx.fillStyle = '#0d1b2a'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(off.x, off.y);
  }
  scenes[state.scene].bg();
  drawSequence();
  drawCleanupBruno();                  // Bruno auf dem Besen (nur waehrend des Aufraeumflugs)
  drawParticles();
  drawForeground();                    // Silhouetten am unteren Rand (vor Bruno, aber unter der Bodenlinie)
  drawMood();                          // Farbstimmung der Szene
  if (off) ctx.restore();
  if (scenes[state.scene].hud) scenes[state.scene].hud();   // festes HUD (Boss-Anzeige), ohne Shake, ueber der Welt
  updateIdleHint(dt); syncProgressPos();
  if (CONFIG.debug) drawDebugFeet();

  ctx.drawImage(vignette, 0, 0, W, H);       // dezente Rand-Abdunklung

  if (flash.t > 0) {                   // warmer Erfolgsblitz, klingt linear ab
    ctx.fillStyle = `rgba(255,244,200,${0.42 * (flash.t / CONFIG.flashTime)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (damage.t > 0) {                  // roter Schadensblitz, klingt linear ab
    ctx.globalAlpha = 0.42 * (damage.t / CONFIG.damageTime);
    ctx.drawImage(damageVignette, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  drawTransition();                    // Level-Wipe ganz oben

  if (fadeAlpha > 0) {                 // weiches Einblenden beim allerersten Bild
    fadeAlpha = Math.max(0, fadeAlpha - dt / CONFIG.fadeTime);
    ctx.fillStyle = `rgba(10,8,12,${fadeAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }
  Labels.setFade(fadeAlpha);
  Labels.endFrame();
  requestAnimationFrame(frame);
}

// ===================== RESPONSIVE SCALING =====================
/* Canvas auf ganzzahlige Vielfache skalieren (Pixel bleiben scharf)
   und an die Fenstergroesse anpassen — wichtig fuer Beamer am Demo-Tag. */
function fitCanvas() {
  const pad = 24;
  // ganzzahlige Bildschirm-Pixel pro RENDER-Pixel, sonst flimmern die 2x2-Bloecke
  const k = Math.min((window.innerWidth - pad) / (W * RES), (window.innerHeight - pad) / (H * RES));
  const kk = k >= 1 ? Math.floor(k) : Math.max(0.25, k);  // unter 1: stufenlos statt unsichtbar
  const gs = RES * kk;                                    // Bildschirm-Pixel pro Spiel-Pixel
  canvas.style.width = (W * gs) + 'px';
  canvas.style.height = (H * gs) + 'px';
  document.getElementById('wrap').style.setProperty('--gs', gs);   // fuer den Label-Layer
}
window.addEventListener('resize', fitCanvas);
Labels.init();
fitCanvas();

// ===================== BOOT =====================
/* Erst ein Titelbildschirm: gibt dem Spiel einen sauberen Einstieg und
   liefert die Nutzergeste, die Browser fuer die Web-Audio-Freigabe wollen. */
Assets.load(() => {
  document.getElementById('loadingScreen').classList.add('hidden');
  state.scene = 'home';                // Chalet als lebendes Titel-Hintergrundbild
  ui.mode = 'modal';                   // Eingaben blockieren, bis gestartet wird
  const startScreen = document.getElementById('startScreen');
  startScreen.classList.remove('hidden');
  applyLanguage(); syncTopbar();
  Music.setScene('title');             // Titelmusik, sobald die erste Geste die Audio-Freigabe bringt
  const startBtn = document.getElementById('startBtn');
  startBtn.onclick = () => {
    Sfx.resume();
    Sfx.play('star');
    Music.start();                     // Musik erst nach der Nutzergeste
    startScreen.classList.add('hidden');
    ui.mode = null;
    goToScene('inside');               // erst die Stube: Hut aufsetzen, dann raus
  };
  startBtn.focus();                    // Enter startet direkt
  // Menue-Knopf oben links
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) menuBtn.onclick = () => { Sfx.resume(); toggleMenu(); };
  // Touch-/Pointer-Steuerung: Halte-Knoepfe setzen dieselben keys[] wie die Tastatur
  document.querySelectorAll('#touchbar button').forEach(b => {
    const code = b.getAttribute('data-touch');
    const down = (ev) => { ev.preventDefault(); Sfx.resume();
      noteInput();
      if (code === 'Space') { jump(); return; }
      if (code === 'KeyE') { window.dispatchEvent(new KeyboardEvent('keydown', { code:'KeyE', bubbles:true })); return; }
      keys[code] = true; };
    const up = () => { if (code === 'KeyA' || code === 'KeyD') keys[code] = false; };
    b.addEventListener('pointerdown', down);
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, up);
  });
  // Hotspot-Hinweis ist auch per Tastatur ein Knopf
  const prompt = document.getElementById('hotspotPrompt');
  prompt.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); prompt.click(); } });
  requestAnimationFrame(frame);
});

