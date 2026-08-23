/* ===================== STORY — Codeblatt, Szenen, Dialoge, Menue, Lernkarten, Szenenwechsel, update() =====================
   Teil von game.js (aufgeteilt in Module, Ladereihenfolge siehe index.html).
   Klassische Scripts: alle Top-Level-Deklarationen sind global sichtbar.
   Alle sichtbaren Texte kommen aus i18n.js ueber tr(key) — hier stehen nur
   Schluessel und IDs. Inhaltliche Vergleiche (Muster, Stern) laufen ueber
   IDs, nie ueber uebersetzte Labels.
   ===================== */

// ===================== CODEBLATT DATA =====================
/* Das Codeblatt ist wie eine echte Stimmkarte: pro Runde wird ein neues
   "gedruckt" (rollCodeblatt). Schiffsnummer und Bestaetigungscode bleiben
   fest (sie kommen in Dialogen/Labels vor), Muster, Stern und Statuswerte
   werden gezogen. Die Spielmechanik <-> E-Voting-Zuordnung aendert sich
   dadurch nicht — nur die Werte auf dem Blatt.                          */
const SYMBOL_IDS = ['moon', 'leaf', 'triangle', 'star', 'sun', 'circle'];
const PATTERNS = [['moon','leaf','triangle'], ['star','leaf','moon'], ['triangle','sun','leaf'], ['moon','circle','star']];
const STARS = [
  { id:'gold',  x:74,  c:'#ffd23f', rings:2, speed:0.035 },
  { id:'blue',  x:112, c:'#4aa8ff', rings:1, speed:-0.05 },
  { id:'red',   x:150, c:'#e0453f', rings:0, speed:0.06 },
  { id:'green', x:188, c:'#4ad66d', rings:3, speed:-0.028 }
];
const STAR_Y = 52;
const STATUS_POOL = { spider: { win:['077','142','519'], awake:['280','361','808'] }, croc: { win:['130','247','605'], awake:['300','418','962'] } };
const CODEBLATT = {
  ship: '1234',
  pattern: PATTERNS[0],
  confirmCode: 'BÄR-582',
  finalStar: 'gold',
  spider: { win:'077', awake:'280' },
  croc: { win:'130', awake:'300' }
};
function rollCodeblatt() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  CODEBLATT.pattern = pick(PATTERNS);
  CODEBLATT.finalStar = pick(STARS).id;
  for (const kind of ['spider', 'croc']) {
    CODEBLATT[kind] = { win: pick(STATUS_POOL[kind].win), awake: pick(STATUS_POOL[kind].awake) };
  }
}
rollCodeblatt();
const starById = (id) => STARS.find(s => s.id === id) || STARS[0];
const patternText = (ids) => ids.map(id => tr('sym.' + id)).join(' – ');
const patternHtml = (ids) => ids.map(id => symImg(id) + '<span class="symname">' + tr('sym.' + id) + '</span>').join('<span class="symsep">–</span>');
const starHtml = (id, short) => {
  const s = starById(id);
  return `<img class="sym" alt="" src="${pixIcon('star', 4, { ch:'s', color:s.c })}"> ${tr('star.' + id + (short ? '.short' : '.long'))}`;
};

// ===================== 6. STORY SCENES =====================
const scenes = {};
function defScene(id, opts) { scenes[id] = opts; }
const L = (key, params) => () => tr(key, params);      // Hotspot-Label, zur Laufzeit uebersetzt

defScene('inside', {
  startX: 128, bg: drawInsideScene,
  hotspots: [
    { id:'hook', x:34, label: L('hs.hat'), when: () => !state.hasHat,
      onInteract: () => {
        state.hasHat = true;                     // ab jetzt traegt Bruno den Hut in jeder Szene und Sequenz
        Sfx.play('pickup');
        PARTICLE_FX.star(brunoX, groundY - 30);
        showDialogue('dlg.inside.hat');
      } },
    { id:'door', x:228, label: L('hs.leave'),
      onInteract: () => { if (state.hasHat) goToScene('home'); else showDialogue('dlg.inside.noHat'); } }
  ]
});

defScene('home', {
  startX: 34, bg: drawHomeScene,
  hotspots: [
    { id:'mailbox', x:122, label: L('hs.mailbox'),
      onInteract: () => showDialogue('dlg.home.post', { onFinal: firstCodeblattReveal }) }
  ],
  onEnter: () => { if (!state.hasCodeblatt) showDialogue('dlg.home.intro'); }
});

defScene('river', {
  startX: 24, bg: drawRiverScene,
  hotspots: [
    { id:'boat1', x:70,  label: L('hs.boat', { n:'1234' }),
      onInteract: () => showDialogue('dlg.river.f1', { params:{ n:'1234' }, onFinal: () => chooseBoat('1234') }) },
    { id:'boat2', x:190, label: L('hs.boat', { n:'2345' }),
      onInteract: () => showDialogue('dlg.river.f2', { params:{ n:'2345' }, onFinal: () => chooseBoat('2345') }) }
  ],
  onEnter: () => showDialogue('dlg.river.intro')
});
function chooseBoat(num) {
  const boat = BOATS.find(b => b.num === num) || BOATS[0];
  const bx = boat.x;
  const walk = { key:'bruno_walk', fromX: brunoX, toX: bx - 8, dur: Math.max(0.3, Math.abs(bx - 8 - brunoX) / 60) };
  state.boatGone = num;                 // dieses Boot zeichnet jetzt die Sequenz, nicht die Kulisse
  if (num === CODEBLATT.ship) {
    // FAHRT: einsteigen, ablegen, bis aus dem Bild segeln — dann erst der Wipe
    playSequence([
      walk,
      { key:'boat_sail', fromX: bx, toX: W + 60, dur: 2.6, num, hideBruno: true, sfx:'sail' }
    ], () => {
      state.brunoHidden = true;         // er ist auf dem Boot weg, nicht wieder auf dem Steg
      showDialogue('dlg.river.ok', { onFinal: () => learnCard('ship', true, () => goToScene('sword')) });
    });
  } else {
    // FALSCHE WAHL: Boot legt ab, bricht auseinander, Bruno geht im Bild unter
    playSequence([
      walk,
      { key:'boat_sail', fromX: bx, toX: bx + 26, dur: 1.1, num, hideBruno: true, sfx:'sail' },
      { key:'boat_break', x: bx + 26, bottomY: groundY, dur: 0.9, num, hideBruno: true, sfx:'crash', shake: 3.5, shakeDur: 0.45 },
      { key:'bruno_death', x: bx + 18, bottomY: groundY + 4, dur: 1.6, sfx:'drown', fx:'drown' },
      { key:'splash', x: bx + 18, bottomY: groundY + 5, dur: 0.45, sfx:'splash', shake: 1.5, hideBruno: true }
    ], () => {
      state.brunoHidden = true;         // bleibt unter Wasser, bis der Checkpoint ihn zuruecksetzt
      showDialogue('dlg.river.fail', { finalLabel:'ui.retry', failure:true, onFinal: () => learnCard('ship', false, respawnAtCheckpoint) });
    });
  }
}

defScene('sword', {
  startX: 24, bg: drawSwordScene,
  hotspots: [
    { id:'sword', x:128, label: L('hs.altar'),
      onInteract: () => showChoice('dlg.sword.found', [
        { label:'opt.accept', onClick: showSwordRules },
        { label:'opt.decline', onClick: () => showDialogue('dlg.sword.declined', { finalLabel:'ui.retry', failure:true, onFinal: respawnAtCheckpoint }) }
      ]) }
  ]
});
function showSwordRules() {
  showChoice('dlg.sword.rules', [
    { label:'opt.rulesAccept', onClick: swordPickup },
    { label:'opt.decline', onClick: () => showDialogue('dlg.sword.declined2', { finalLabel:'ui.retry', failure:true, onFinal: respawnAtCheckpoint }) }
  ]);
}
/* Aufheben: Bruno beugt sich zum Schwert, es loest sich leuchtend aus dem
   Altar (Chime + goldener Funkenregen), er richtet sich mit dem Schwert in
   der Pfote auf. hasSword wird erst gesetzt, wenn die Sequenz durch ist.  */
function swordPickup() {
  const facing = brunoX <= 128 ? 1 : -1;
  const x = 128 - facing * 15;          // neben dem Altar stehen, nicht darauf
  playSequence([
    { key:'bruno_walk', fromX: brunoX, toX: x, facing, dur:0.3 },
    { key:'bruno_idle', x, facing, dur:0.55, fx:'reach' },
    { key:'sword', x:128, bottomY:groundY-10, dur:0.75, fx:'lift', sfx:'chime',
      onStart: () => PARTICLE_FX.star(128, groundY - 14) },
    { key:'bruno_idle', x, facing, dur:0.85, fx:'raise',
      onStart: () => PARTICLE_FX.star(x + facing * 14, groundY - 30) }
  ], () => {
    brunoX = x; brunoFacing = facing;
    state.hasSword = true;
    showDialogue('dlg.sword.taken', { onFinal: () => goToScene('gate') });
  });
}
/* Durchs offene Tor: Bruno laeuft selbst zur Tormitte, wird im Durchgang
   kleiner und blasser, erst dann kommt der Level-Wipe.                    */
function doorWalk(next) {
  const from = brunoX;
  const dur = Math.max(0.7, Math.abs(128 - from) / 50 + 0.5);
  playSequence([{ key:'bruno_walk', fromX: from, toX: 128, dur, fx:'enter' }], next);
}

defScene('gate', {
  startX: 24, bg: drawGateScene,
  hotspots: [
    { id:'gate', x:128, label: L('hs.gate'),
      onInteract: () => showChoice('dlg.gate.prompt', PATTERNS.map(p => ({
        label: () => codeSym('pattern', 'inbtn', '#f4e9c9') + patternHtml(p), text: () => patternText(p), cls:'symrow', onClick: () => pickPattern(p) })), { cls:'symbols', icon:'pattern' }) }
  ]
});
function pickPattern(p) {
  if (p.join('-') === CODEBLATT.pattern.join('-')) {
    playSequence([{ key:'gate_open', x:128, bottomY:groundY, dur:0.9, sfx:'gate', shake:1.5, shakeDur:0.5 }],
      () => { state.gateOpen = true; showDialogue('dlg.gate.ok', { icon:'pattern', onFinal: () => learnCard('pattern', true, () => doorWalk(() => goToScene('fork'))) }); });
  } else {
    playSequence([{ key:'gate_reject', x:128, bottomY:groundY, dur:0.6, sfx:'error', shake:2.5, shakeDur:0.35 }],
      () => showDialogue('dlg.gate.fail', { icon:'pattern', finalLabel:'ui.retry', failure:true, onFinal: () => learnCard('pattern', false, respawnAtCheckpoint) }));
  }
}

defScene('fork', {
  startX: 128, bg: drawForkScene,
  hotspots: [
    { id:'spider', x:50,  label: L('hs.spider'), onInteract: () => { state.path='spider'; goToScene('spider'); } },
    { id:'croc',   x:206, label: L('hs.croc'),   onInteract: () => { state.path='croc'; goToScene('croc'); } }
  ],
  onEnter: () => showDialogue('dlg.fork.intro')
});

function combatScene(kind, bg) {
  defScene(kind, {
    startX: 24, bg,
    hotspots: [
      { id:'enemy', x:150, range:72, label: L('hs.attack'),
        onInteract: () => {
          // ACTION ANIMATION: hinlaufen -> Bruno attacks -> slash -> enemy hit -> defeated
          const from = brunoX;
          playSequence([
            { key:'bruno_walk', fromX: from, toX: 130, facing:1, dur: Math.max(0.2, Math.abs(130 - from) / 75) },
            { key:'bruno_attack', x:130, bottomY:groundY, facing:1, dur:0.45, fx:'lunge', sfx:'attack' },
            { key:'slash',        x:148, bottomY:groundY-4, dur:0.25, sfx:'slash' },
            { key:kind+'_hit',    x:150, bottomY:groundY, facing:1, dur:0.35, fx:'hit', sfx:'hit', shake:3, shakeDur:0.28 },
            { key:kind+'_defeated', x:150, bottomY:groundY, facing:1, dur:0.7, fx:'defeat', sfx:'defeat', shake:1.5, shakeDur:0.25 }
          ], () => {
            state.enemyState = 'dead';
            // Das Messgeraet zeigt in ~50 % der Faelle absichtlich einen falschen Wert
            // (den "noch wach"-Wert) — der Spieler muss ihn am Blatt erkennen und melden.
            const real = CODEBLATT[kind].win;
            const shown = Math.random() < 0.5 ? real : CODEBLATT[kind].awake;
            state.meterValue = shown;                  // das Messgeraet in der Szene zeigt denselben Wert
            showDialogue([tr('dlg.' + kind + '.taunt'), tr('dlg.combat.won'), tr('dlg.combat.meter', { code: shown })], { icon:'status', onFinal: () => showStatusCheck(kind, shown, 1) });
          });
        } }
    ],
    onEnter: () => showDialogue('dlg.' + kind + '.enter')
  });
}
combatScene('spider', drawSpiderScene);
combatScene('croc', drawCrocScene);

/* Statuswert pruefen. Zwei Knoepfe: "Stimmt" / "Falsch".
   - Wert richtig  + Stimmt -> verifiziert, weiter
   - Wert falsch   + Falsch -> gemeldet, das Geraet misst neu (zeigt dann den richtigen Wert)
   - Wert falsch   + Stimmt -> Fehlschlag (falschen Wert bestaetigt)
   - Wert richtig  + Falsch -> Fehlschlag (richtigen Wert angezweifelt)       */
function showStatusCheck(kind, shown, attempt) {
  const real = CODEBLATT[kind].win;
  state.meterValue = shown;
  const ask = () => showChoice(tr('dlg.status.shown', { code: shown }), [
    { label:'ui.correct', onClick: () => {
        if (shown === real) { state.enemyState = 'verified'; showDialogue('dlg.status.ok', { icon:'status', onFinal: () => learnCard('status', true, () => goToScene('confirmgate')) }); }
        else showDialogue('dlg.status.failAccept', { icon:'status', finalLabel:'ui.retry', failure:true, onFinal: () => learnCard('status', false, respawnAtCheckpoint) });
      } },
    { label:'ui.wrong', onClick: () => {
        // der Gegner bleibt liegen — gescheitert ist hoechstens die Pruefung, nicht der Kampf
        if (shown !== real) showDialogue('dlg.status.reported', { icon:'status', onFinal: () => {
            Sfx.play('blip');
            state.meterValue = real;                   // neu gemessen: jetzt der richtige Wert
            showDialogue([tr('dlg.combat.meter', { code: real })], { icon:'status', onFinal: () => showStatusCheck(kind, real, attempt + 1) });
          } });
        else showDialogue('dlg.status.falseAlarm', { icon:'status', finalLabel:'ui.retry', failure:true, onFinal: () => learnCard('status', false, respawnAtCheckpoint) });
      } }
  ], { icon:'status' });
  if (attempt === 1) showDialogue('dlg.status.check', { icon:'status', onFinal: ask }); else ask();
}

defScene('confirmgate', {
  startX: 24, bg: drawConfirmGateScene,
  hotspots: [ { id:'gate2', x:128, label: L('hs.confirm'), onInteract: askConfirmCode } ],
  onEnter: () => showDialogue('dlg.confirm.intro')
});
function askConfirmCode() {
  showInput('dlg.confirm.title', 'dlg.confirm.placeholder', (val) => {
    const norm = (val||'').trim().toUpperCase();
    if (norm === CODEBLATT.confirmCode) {
      playSequence([{ key:'gate_open', x:128, bottomY:groundY, dur:0.9, sfx:'gate', shake:1.5, shakeDur:0.5 }],
        () => { state.gateOpen = true; showDialogue('dlg.confirm.ok', { icon:'confirm', onFinal: () => learnCard('confirm', true, () => doorWalk(() => goToScene('stars'))) }); });
    } else {
      failFlash();
      showChoice('dlg.confirm.fail', [
        { label:'ui.again', onClick: askConfirmCode },
        { label:'ui.backGate', onClick: () => learnCard('confirm', false, respawnAtCheckpoint) }
      ], { icon:'confirm' });
    }
  }, { icon:'confirm' });
}

defScene('stars', {
  startX: 24, bg: drawStarsScene,
  hotspots: [
    { id:'stars', x:40, label: L('hs.stars'),
      onInteract: () => showChoice('dlg.stars.prompt', STARS.map((s, i) => ({
        label: () => starHtml(s.id, true), text: () => tr('star.' + s.id + '.short'), cls:'symrow', onClick: () => pickStar(i) })), { cls:'symbols', icon:'star' }) }
  ],
  onEnter: () => showDialogue('dlg.stars.intro')
});
function pickStar(i) {
  const st = STARS[i];
  if (st.id === CODEBLATT.finalStar) {
    starFinale(i);
  } else {
    playSequence([{ key:'star_shatter', x:st.x, bottomY:STAR_Y, dur:0.6, sfx:'shatter', shake:2.5, shakeDur:0.3, onStart: () => { state.starTaken = i; } }],
      () => showDialogue('dlg.stars.fail', { icon:'star', finalLabel:'ui.retry', failure:true, onFinal: () => learnCard('star', false, respawnAtCheckpoint) }));
  }
}
/* Finale: Zeit steht fast still, der Stern flammt weiss auf, stuerzt mit
   Lichtschweif zu Bruno, Schockwelle + Funkenregen + Blitz, Fanfare — und
   dann hebt der Stern Bruno hoch und traegt ihn oben rechts aus dem Bild.
   Blitz, Zeitlupe und Shake haengen am FX-Schalter.                     */
function starFinale(i) {
  const st = STARS[i];
  const fxOn = Prefs.data.shake;
  const tx = brunoX, ty = groundY - 40;
  playSequence([
    { key:'star_flare', x:st.x, bottomY:STAR_Y, dur: fxOn ? 0.55 : 0.3,
      onStart: () => { state.starTaken = i; if (fxOn) timeScale = 0.05; } },
    { key:'star_swoop', x:st.x, bottomY:STAR_Y, toX:tx, toY:ty, dur:0.7, sfx:'fanfare',
      onStart: () => { timeScale = 1; } },
    { key:'star_burst', x:tx, bottomY:ty, dur:1.0, shake: fxOn ? 3.5 : 0, shakeDur:0.5,
      onStart: () => {
        burst(tx, ty, 70, { spread: 160, up: 120, g: 60, life: 1.1, color: [st.c, '#ffffff', '#ffe999', '#ffb347'], size: 2 });
        burst(tx, ty, 30, { spread: 60, up: 40, g: -20, life: 1.4, color: ['#fff6cc', st.c] });
      } },
    { key:'bruno_idle', fromX: tx, toX: tx + 150, facing: 1, dur: 1.6, fx:'flyout', sfx:'star' }
  ], () => {
    timeScale = 1;
    state.brunoHidden = true;                      // er ist mit dem Stern davongeflogen
    showDialogue('dlg.stars.ok', { icon:'star', finalLabel:'ui.finish', onFinal: () => learnCard('star', true, () => goToScene('end')) });
  });
}

defScene('end', {
  startX: 128, bg: drawEndScene, hotspots: [],
  // Titel-Slam (1.6 s) -> Aktionsknopf "Spuren wegfegen" -> Bruno holt den Besen,
  // fegt gemaechlich alle Level zurueck -> Lernkarte (nur wenn Lernkarten an:
  // Browserverlauf/Cache nach der Stimmabgabe loeschen) -> Abschluss-Panel
  onEnter: () => playSequence([{ key:'end_title', x:128, dur:1.6 }], () =>
    showChoice('dlg.end.sweepPrompt', [
      { label:'btn.sweep', onClick: () => playSequence([
          { key:'bruno_walk', fromX: brunoX, toX: 72, dur: Math.max(0.5, Math.abs(brunoX - 72) / 60) },
          { key:'bruno_idle', x: 72, facing: -1, dur: 0.5, fx:'reach', onStart: () => { state.broomTaken = true; Sfx.play('pickup'); } }
        ], () => startCleanup(() => learnCard('clean', true, showEndPanel))) }
    ]))
});

/* ===================== AUFRAEUMEN =====================
   Bruno gleitet mit dem Besen am Boden rueckwaerts durch alle Szenen
   (rechts -> links, immer in Bodenkontakt) und fegt die Spuren weg, dann
   gleitet er wieder in die Endszene hinein. Eigene kleine Zustandsmaschine
   (kein Wipe, harter Schnitt mit kurzem Einblenden); jede Taste ueberspringt
   (finishCleanup).                                                         */
const cleanup = { active:false, phase:null, list:[], i:0, x:0, y:0, t:0, done:null };
function startCleanup(done) {
  const boss = state.path === 'croc' ? 'croc' : 'spider';
  cleanup.list = ['stars', 'confirmgate', boss, 'fork', 'gate', 'sword', 'river', 'home', 'inside'];
  cleanup.done = done; cleanup.active = true; cleanup.i = -1;
  cleanup.phase = 'exit'; cleanup.x = 72; cleanup.y = groundY; cleanup.t = 0;
  state.brunoHidden = true; ui.mode = 'anim';
  Sfx.play('sweep');
}
function enterCleanupScene(id) {
  state.scene = id;
  state.gateOpen = true; state.enemyState = 'verified'; state.starTaken = -1; state.boatGone = null; state.brunoHidden = true;
  particles.length = 0; shake.t = 0; fadeAlpha = 0.55;
  cleanup.x = W + 30; cleanup.t = 0;
  Sfx.play('sweep');
}
// Spuren in Reichweite der Borsten wegwischen
function sweepFootprints(x) {
  const arr = state.footprints[state.scene];
  if (!arr) return;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (Math.abs(arr[i].x - x) < 12) {
      burst(arr[i].x + 1, arr[i].y, 3, { spread: 30, up: 22, g: 50, life: 0.4, color: ['#55505a', '#d9c9a6'] });
      arr.splice(i, 1);
      if (pRand() < 0.3) Sfx.play('sweep');
    }
  }
}
function updateCleanup(dt) {
  cleanup.t += dt;
  cleanup.y = groundY;                                   // immer am Boden
  const speed = (W + 60) / CONFIG.cleanupSceneTime;
  if (cleanup.phase === 'exit') {
    // aus der Endszene nach rechts hinausgleiten
    cleanup.x += speed * 0.8 * dt;
    if (cleanup.x > W + 40) { cleanup.phase = 'sweep'; cleanup.i = 0; enterCleanupScene(cleanup.list[0]); }
  } else if (cleanup.phase === 'sweep') {
    cleanup.x -= speed * dt;
    sweepFootprints(broomTip(cleanup.x, -1).x);
    if (cleanup.x < -30) {
      cleanup.i++;
      if (cleanup.i < cleanup.list.length) enterCleanupScene(cleanup.list[cleanup.i]);
      else { cleanup.phase = 'return'; state.scene = 'end'; state.brunoHidden = true; particles.length = 0; fadeAlpha = 0.55; cleanup.x = -30; cleanup.t = 0; }
    }
  } else if (cleanup.phase === 'return') {
    // von links in die Endszene gleiten und bei x=128 stehen bleiben (abbremsend)
    const p = Math.min(1, cleanup.t / 1.3);
    cleanup.x = -30 + (128 + 30) * (1 - (1 - p) * (1 - p));
    if (p >= 1) endCleanup();
  }
}
function endCleanup() {
  cleanup.active = false; cleanup.phase = null;
  state.scene = 'end'; state.brunoHidden = false; brunoX = 128; brunoFacing = 1; brunoY = 0; brunoVY = 0;
  Sfx.play('land');
  burst(128, groundY - 1, 8, { spread: 60, up: 25, g: 60, life: 0.4, color: 'rgba(220,205,175,0.85)' });
  ui.mode = null;
  const done = cleanup.done; cleanup.done = null;
  if (done) done();
}
// Taste: Flug ueberspringen — alle Spuren weg, sofort landen
function finishCleanup() {
  if (!cleanup.active) return;
  state.footprints = {};
  endCleanup();
}
function drawCleanupBruno() {
  if (!cleanup.active) return;
  drawSweepingBruno(cleanup.x, cleanup.phase === 'sweep' ? -1 : 1);
}
function mappingTableHtml() {
  const rows = ['codeblatt', 'ship', 'pattern', 'status', 'confirm', 'star', 'clean'].map(k => {
    const r = tr('map.' + k, { n: CODEBLATT.ship });
    return `<tr><td>${codeSym(k, 'tbl', '#2a1810')}${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`;
  }).join('');
  return `<table class="mapping"><thead><tr><th>${tr('map.h.game')}</th><th>${tr('map.h.real')}</th><th>${tr('map.h.threat')}</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function showEndPanel() {
  const render = () => {
    ui.mode = 'panel'; clearUI();
    ui.rerender = render;
    const panel = document.createElement('div');
    panel.className = 'panel endpanel';
    panel.setAttribute('role', 'dialog');
    panel.innerHTML = `<div class="line"><b>${tr('dlg.end.title')}</b><br>${tr('dlg.end.text')}</div>
      <details class="mapbox" open><summary>${tr('ui.mapping')}</summary>${mappingTableHtml()}</details>
      <details class="whybox"><summary>${tr('ui.why')}</summary><p>${tr('dlg.end.why')}</p></details>
      <div class="btnrow"><button class="btn" id="againBtn">${tr('ui.playAgain')}</button><button class="btn" id="quitBtn">${tr('ui.quit')}</button></div>`;
    document.getElementById('uiLayer').appendChild(panel);
    document.getElementById('againBtn').onclick = () => { clearUI(); ui.mode = null; resetGame(); };
    document.getElementById('quitBtn').onclick = () => { clearUI(); ui.mode = null; quitToTitle(); };
    announce(tr('dlg.end.title') + ' ' + tr('dlg.end.text'));
    focusFirst(panel);
  };
  ui.rerender = render;
  render();
}

// ===================== LERNKARTEN =====================
/* Nach jedem Erfolg/Fehlschlag eine kurze, optionale Karte: echter Schritt +
   abgewehrte Bedrohung. Abschaltbar (Prefs.data.learn), dann direkt next().  */
const LEARN_STEP_KEY = { ship:'map.ship', pattern:'map.pattern', status:'map.status', confirm:'map.confirm', star:'map.star', clean:'map.clean' };
function learnCard(step, ok, next) {
  if (!Prefs.data.learn) { next(); return; }
  const render = () => {
    ui.mode = 'panel'; clearUI();
    ui.rerender = render;
    const name = tr(LEARN_STEP_KEY[step], { n: CODEBLATT.ship });
    const panel = document.createElement('div');
    panel.className = 'panel learn' + (ok ? ' ok' : ' fail');
    panel.setAttribute('role', 'dialog');
    panel.innerHTML = `<div class="line"><span class="learntag">${codeSym(step, 'tag', '#f4e9c9')}${tr('ui.learnTitle')}: ${name[1]}</span><br>${tr('learn.' + step + '.step')}<br>${tr('learn.' + step + '.threat')}<br><i>${ok ? tr('learn.ok') : tr('learn.fail')}</i></div>
      <div class="btnrow"><button class="btn gold" id="learnOkBtn">${tr('ui.learnOk')}</button></div>`;
    document.getElementById('uiLayer').appendChild(panel);
    document.getElementById('learnOkBtn').onclick = () => { clearUI(); ui.mode = null; next(); };
    announce(panel.querySelector('.line').textContent);
    focusFirst(panel);
  };
  ui.rerender = render;
  render();
}

// ===================== CODEBLATT MODAL =====================
let cardState = null;                       // { side, isFirstTime } — fuer Sprachwechsel bei offener Karte
let focusBeforeModal = null;
function firstCodeblattReveal() { ui.mode = 'modal'; focusBeforeModal = document.activeElement; renderCodeblattCard('front', true); }
/* Eine Zeile des Codeblatts wie auf dem echten Stimmrechtsausweis:
   Symbol links (Dreieck/Raute/Fuenfeck/Stern), Bezeichnung und Wert rechts.
   step = null: Zeile ohne Symbol (Schiffsnummer, Hut) — Spalte bleibt leer. */
function cardEntry(step, name, valueHtml, isRow) {
  return `<div class="entry"><span class="csym">${step ? codeSym(step, 'card') : ''}</span><div class="ebody"><b>${name}</b><span class="val${isRow ? ' symrow' : ''}">${valueHtml}</span></div></div>`;
}
function renderCodeblattCard(side, isFirstTime) {
  cardState = { side, isFirstTime };
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('hidden');
  const card = document.createElement('div');
  card.id = 'codeblattCard';
  card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-labelledby', 'cardTitle');
  const star = starById(CODEBLATT.finalStar);
  if (side === 'front') {
    card.innerHTML = `
      <h3 id="cardTitle">${tr('card.front')}</h3>
      ${cardEntry(null,      tr('card.ship'),    CODEBLATT.ship)}
      ${cardEntry('pattern', tr('card.pattern'), patternHtml(CODEBLATT.pattern), true)}
      ${cardEntry('confirm', tr('card.confirm'), CODEBLATT.confirmCode)}
      ${cardEntry('star',    tr('card.final'),   starHtml(CODEBLATT.finalStar, false), true)}
      ${cardEntry(null,      tr('card.hat'),     `<img class="sym hat" alt="" src="assets/props/hat.png"> ${tr('card.hatVal')}`, true)}
      <div class="cardhint">${tr('card.hint')}</div>
      <div class="btnrow">
        <button class="btn" id="flipBtn">${tr('ui.flip')}</button>
        ${isFirstTime ? '' : `<button class="btn" id="closeCardBtn">${tr('ui.close')}</button>`}
      </div>`;
  } else {
    card.innerHTML = `
      <h3 id="cardTitle">${tr('card.back')}</h3>
      ${cardEntry('status', tr('card.spiderWin'),   CODEBLATT.spider.win)}
      ${cardEntry('status', tr('card.spiderAwake'), CODEBLATT.spider.awake)}
      ${cardEntry('status', tr('card.crocWin'),     CODEBLATT.croc.win)}
      ${cardEntry('status', tr('card.crocAwake'),   CODEBLATT.croc.awake)}
      <div class="btnrow">
        <button class="btn" id="flipBtn">${tr('ui.flip')}</button>
        <button class="btn" id="closeCardBtn">${tr('ui.close')}</button>
      </div>`;
  }
  void star;
  overlay.innerHTML = ''; overlay.appendChild(card);
  document.getElementById('flipBtn').onclick = () => renderCodeblattCard(side === 'front' ? 'back' : 'front', isFirstTime);
  const closeBtn = document.getElementById('closeCardBtn');
  if (closeBtn) closeBtn.onclick = () => {
    overlay.classList.add('hidden'); overlay.innerHTML = ''; cardState = null;
    if (isFirstTime && !state.hasCodeblatt) {
      showDialogue('dlg.codeblatt.intro', {
        finalLabel: 'ui.understood',
        onFinal: () => { state.hasCodeblatt = true; document.getElementById('codeblattBtn').classList.remove('hidden'); goToScene('river'); }
      });
    } else { ui.mode = ui.prevMode !== undefined ? ui.prevMode : null; ui.prevMode = undefined; restoreFocus(); }
  };
  announce(card.textContent.replace(/\s+/g, ' ').trim());
  focusFirst(card);
}
function codeblattOpen() { return !!document.getElementById('codeblattCard'); }
function openCodeblatt() {
  if (!state.hasCodeblatt) return;
  // Waehrend einer Einmal-Animation (oder des Level-Wipes) wuerde das Modal
  // ui.mode ueberschreiben und die Sequenz einfrieren (onDone feuert nie
  // mehr) -> Softlock. Diese Sperre bleibt.
  if (ui.mode === 'anim' || ui.mode === 'modal' || ui.mode === 'transition' || ui.mode === 'menu') return;
  ui.prevMode = ui.mode;              // 'panel' oder null — nachher wiederherstellen
  ui.mode = 'modal';
  focusBeforeModal = document.activeElement;
  renderCodeblattCard('front', false);
}
// schliesst ueber denselben Weg wie der Knopf (stellt ui.prevMode wieder her);
// beim allerersten Blatt gibt es vorne keinen Schliessen-Knopf -> erst umdrehen
function closeCodeblatt() { const b = document.getElementById('closeCardBtn'); if (b) b.click(); }
function toggleCodeblatt() { if (codeblattOpen()) closeCodeblatt(); else openCodeblatt(); }
document.getElementById('codeblattBtn').onclick = toggleCodeblatt;

// ===================== TOPBAR (Ton / FX / Musik / Lernkarten / Sprache) =====================
function syncTopbar() {
  const set = (id, key, on) => { const b = document.getElementById(id); if (!b) return; b.textContent = tr(key) + ' ' + tr(on ? 'top.on' : 'top.off'); b.classList.toggle('off', !on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); };
  set('muteBtn', 'top.sound', !Prefs.data.muted);
  set('shakeBtn', 'top.fx', Prefs.data.shake);
  set('musicBtn', 'top.music', Prefs.data.music);
  set('learnBtn', 'top.learn', Prefs.data.learn);
}
const muteBtn = document.getElementById('muteBtn');
if (muteBtn) muteBtn.onclick = () => { Sfx.resume(); Sfx.muted = !Sfx.muted; syncTopbar(); };
const shakeBtn = document.getElementById('shakeBtn');
if (shakeBtn) shakeBtn.onclick = () => { Prefs.data.shake = !Prefs.data.shake; Prefs.save(); syncTopbar(); if (Prefs.data.shake) addShake(2, 0.25); };
const musicBtn = document.getElementById('musicBtn');
if (musicBtn) musicBtn.onclick = () => { Sfx.resume(); Music.setEnabled(!Prefs.data.music); syncTopbar(); };
const learnTopBtn = document.getElementById('learnBtn');
if (learnTopBtn) learnTopBtn.onclick = () => { Prefs.data.learn = !Prefs.data.learn; Prefs.save(); syncTopbar(); };
document.querySelectorAll('[data-lang]').forEach(b => { b.onclick = () => { Sfx.play('blip'); setLanguage(b.getAttribute('data-lang')); }; });

// ===================== ESCAPE-MENUE =====================
/* ui.mode 'menu': Weiterspielen, Neustart, Spiel verlassen (-> Titel), Sprache,
   Schalter. Nicht waehrend Sequenzen/Wipe (gleiche Sperre wie das Codeblatt). */
function menuOpen() { return !!document.getElementById('pauseMenu'); }
function openMenu() {
  if (menuOpen()) return;
  if (ui.mode === 'anim' || ui.mode === 'transition' || ui.mode === 'modal') return;
  ui.prevMode = ui.mode; ui.mode = 'menu';
  focusBeforeModal = document.activeElement;
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('hidden');
  const render = () => {
    overlay.innerHTML = `<div id="pauseMenu" role="dialog" aria-modal="true" aria-labelledby="menuTitle">
      <h3 id="menuTitle">${tr('menu.title')}</h3>
      <div class="btnrow col">
        <button class="btn gold" id="mResume">${tr('menu.resume')}</button>
        ${state.hasCodeblatt ? `<button class="btn" id="mCard">${tr('menu.codeblatt')}</button>` : ''}
        <button class="btn" id="mRestart">${tr('menu.restart')}</button>
        <button class="btn danger" id="mQuit">${tr('menu.quit')}</button>
      </div>
      <div class="menurow"><span>${tr('menu.lang')}</span> ${LANGS.map(l => `<button class="btn small ${l === currentLang() ? '' : 'off'}" data-mlang="${l}" aria-pressed="${l === currentLang()}">${l.toUpperCase()}</button>`).join('')}</div>
      <div class="menurow toggles">
        <button class="btn small" id="mSound"></button><button class="btn small" id="mFx"></button><button class="btn small" id="mMusic"></button><button class="btn small" id="mLearn"></button>
      </div></div>`;
    const syncM = () => {
      const set = (id, key, on) => { const b = document.getElementById(id); b.textContent = tr(key) + ' ' + tr(on ? 'top.on' : 'top.off'); b.classList.toggle('off', !on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); };
      set('mSound', 'top.sound', !Prefs.data.muted); set('mFx', 'top.fx', Prefs.data.shake); set('mMusic', 'top.music', Prefs.data.music); set('mLearn', 'top.learn', Prefs.data.learn);
    };
    syncM();
    document.getElementById('mResume').onclick = closeMenu;
    const mc = document.getElementById('mCard'); if (mc) mc.onclick = () => { closeMenu(); openCodeblatt(); };
    document.getElementById('mRestart').onclick = () => { closeMenu(); resetGame(); };
    document.getElementById('mQuit').onclick = () => { closeMenu(); quitToTitle(); };
    document.getElementById('mSound').onclick = () => { Sfx.resume(); Sfx.muted = !Sfx.muted; syncTopbar(); syncM(); };
    document.getElementById('mFx').onclick = () => { Prefs.data.shake = !Prefs.data.shake; Prefs.save(); syncTopbar(); syncM(); };
    document.getElementById('mMusic').onclick = () => { Sfx.resume(); Music.setEnabled(!Prefs.data.music); syncTopbar(); syncM(); };
    document.getElementById('mLearn').onclick = () => { Prefs.data.learn = !Prefs.data.learn; Prefs.save(); syncTopbar(); syncM(); };
    overlay.querySelectorAll('[data-mlang]').forEach(b => { b.onclick = () => { setLanguage(b.getAttribute('data-mlang')); render(); }; });
    focusFirst(overlay);
  };
  render();
  announce(tr('menu.title'));
}
function closeMenu() {
  if (!menuOpen()) return;
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('hidden'); overlay.innerHTML = '';
  ui.mode = ui.prevMode !== undefined ? ui.prevMode : null; ui.prevMode = undefined;
  restoreFocus();
}
function toggleMenu() { if (menuOpen()) closeMenu(); else openMenu(); }
/* Zurueck zum Titelbildschirm (Spiel verlassen) — kompletter Neustart beim naechsten Start */
function quitToTitle() {
  clearUI(); sequence = null; transition.active = false; Labels.clear();
  state.hasCodeblatt = false; state.hasSword = false; state.hasHat = false; state.path = null; state.enemyState = 'alive'; state.starTaken = -1;
  state.boatGone = null; state.brunoHidden = false; state.gateOpen = false; checkpoint = null; state.footprints = {};
  cleanup.active = false; cleanup.phase = null;
  document.getElementById('codeblattBtn').classList.add('hidden');
  rollCodeblatt();
  state.scene = 'home'; brunoX = scenes.home.startX; brunoY = 0; brunoVY = 0; brunoFacing = 1;
  Music.setScene('title');
  ui.mode = 'modal';
  const startScreen = document.getElementById('startScreen');
  startScreen.classList.remove('hidden');
  const sb = document.getElementById('startBtn'); if (sb) sb.focus();
}

// ===================== GENERIC UI =====================
function clearUI() { stopTyper(); document.getElementById('uiLayer').innerHTML = ''; ui.rerender = null; }
let typer = null;   // laufender Typewriter — bei jedem UI-Wechsel stoppen
function stopTyper() { if (typer) { clearInterval(typer.id); typer = null; } }
const resolveText = (v, params) => typeof v === 'function' ? v() : (typeof v === 'string' && I18N.de[v] !== undefined) ? tr(v, params) : v;

/* showDialogue(lines | key, opts)
   lines: Array von Seiten ODER i18n-Schluessel (Array-Wert). opts: finalLabel (Key),
   failure (roter Blitz + Ton), onFinal, params. Sprachwechsel rendert die
   aktuelle Seite neu (ui.rerender).                                          */
function showDialogue(lines, opts) {
  opts = opts || {};
  const finalKey = opts.finalLabel || 'ui.next';
  if (opts.failure) failFlash();
  const onFinal = opts.onFinal || (() => {});
  ui.mode = 'panel';
  let idx = 0;
  const pages = () => { const v = resolveText(lines, opts.params); return Array.isArray(v) ? v : [v]; };
  function render() {
    clearUI();
    ui.rerender = render;
    const all = pages();
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.setAttribute('role', 'dialog');
    const isLast = idx === all.length - 1;
    panel.innerHTML = `<div class="linewrap">${opts.icon ? codeSym(opts.icon, 'dlg', '#2a1810') : ''}<div class="line"></div></div><div class="btnrow"><button class="btn" id="dlgBtn">${isLast ? tr(finalKey) : tr('ui.next')}</button></div>`;
    document.getElementById('uiLayer').appendChild(panel);
    // Typewriter: Text laeuft ein; erster Klick zeigt alles, zweiter blaettert.
    const lineEl = panel.querySelector('.line');
    const full = all[idx];
    const chars = Array.from(full);                 // Emoji/Umlaute nicht zerreissen
    let n = 0;
    stopTyper();
    typer = { id: setInterval(() => {
      n = Math.min(chars.length, n + 2);
      lineEl.textContent = chars.slice(0, n).join('');
      if (n >= chars.length) stopTyper();
    }, 16) };
    lineEl.textContent = '';
    announce(full);
    const btn = document.getElementById('dlgBtn');
    btn.onclick = () => {
      if (typer) { stopTyper(); lineEl.textContent = full; return; }
      if (isLast) { clearUI(); ui.mode = null; onFinal(); } else { idx++; render(); }
    };
    focusFirst(panel);
  }
  render();
}
/* showChoice(prompt | key, options, opts)
   option: { label: key | string | () => html, text?: () => plain, cls?, onClick } */
function showChoice(prompt, options, opts) {
  opts = opts || {};
  const render = () => {
    ui.mode = 'panel'; clearUI();
    ui.rerender = render;
    const panel = document.createElement('div');
    panel.className = 'panel ' + (opts.cls || '');
    panel.setAttribute('role', 'dialog');
    const btns = options.map((o, i) => `<button class="btn ${o.cls || ''}" data-i="${i}"><span class="key">${i + 1}</span>${resolveText(o.label)}</button>`).join('');
    panel.innerHTML = `<div class="linewrap">${opts.icon ? codeSym(opts.icon, 'dlg', '#2a1810') : ''}<div class="line">${resolveText(prompt)}</div></div><div class="btnrow">${btns}</div>`;
    document.getElementById('uiLayer').appendChild(panel);
    panel.querySelectorAll('button').forEach(b => { b.onclick = () => { clearUI(); ui.mode = null; options[+b.dataset.i].onClick(); }; });
    announce(resolveText(prompt) + ' ' + tr('a11y.choice', { n: options.length }) + ' ' + options.map((o, i) => (i + 1) + ': ' + (o.text ? o.text() : stripHtml(resolveText(o.label)))).join(', '));
    focusFirst(panel);
  };
  render();
}
function showInput(promptKey, placeholderKey, onSubmit, opts) {
  opts = opts || {};
  let typed = '';
  const render = () => {
    ui.mode = 'panel'; clearUI();
    ui.rerender = render;
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.setAttribute('role', 'dialog');
    panel.innerHTML = `<div class="linewrap">${opts.icon ? codeSym(opts.icon, 'dlg', '#2a1810') : ''}<label class="line" for="txtInput">${tr(promptKey)}</label></div><input type="text" id="txtInput" placeholder="${tr(placeholderKey)}" autocomplete="off" spellcheck="false" aria-label="${tr(promptKey)}"><div class="btnrow"><button class="btn gold" id="submitBtn">${tr('ui.confirm')}</button></div>`;
    document.getElementById('uiLayer').appendChild(panel);
    const inp = document.getElementById('txtInput');
    inp.value = typed;
    inp.oninput = () => { typed = inp.value; };
    setTimeout(() => inp.focus(), 30);   // nach dem Einblenden fokussieren
    document.getElementById('submitBtn').onclick = () => { const val = inp.value; clearUI(); ui.mode = null; onSubmit(val); };
    announce(tr(promptKey));
  };
  render();
}
function stripHtml(s) { const d = document.createElement('div'); d.innerHTML = s; return d.textContent; }

// ===================== BARRIEREFREIHEIT =====================
/* Die Canvas ist fuer Screenreader unsichtbar. Alles Relevante (Szene,
   Dialogtext, Auswahl, Hotspot in Reichweite) wird zusaetzlich in eine
   aria-live-Region geschrieben; die Canvas traegt ein aria-label mit dem
   aktuellen Level. Fokus: Panels/Modale bekommen den Fokus, Tab bleibt
   darin (Trap), beim Schliessen kehrt er zurueck.                         */
let lastAnnounced = '';
function announce(text) {
  const live = document.getElementById('a11yLive');
  if (!live || !text || text === lastAnnounced) return;
  lastAnnounced = text;
  live.textContent = '';
  setTimeout(() => { live.textContent = text; }, 20);
}
function focusFirst(container) {
  const el = container.querySelector('button, input, [tabindex]');
  if (el) setTimeout(() => el.focus(), 20);
}
function restoreFocus() {
  const el = focusBeforeModal;
  focusBeforeModal = null;
  if (el && document.contains(el) && typeof el.focus === 'function') el.focus();
}
function activeContainer() {
  if (ui.mode === 'modal' || ui.mode === 'menu') return document.getElementById('modalOverlay');
  if (ui.mode === 'panel') return document.querySelector('#uiLayer .panel');
  return null;
}
// Tab-Fokus im aktiven Dialog halten
window.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const c = activeContainer();
  if (!c) return;
  const f = [...c.querySelectorAll('button, input, summary, [tabindex]')].filter(el => !el.disabled);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  else if (!c.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
});

// ===================== SCENE MGMT =====================
// Szene -> Levelnummer + Namensschluessel fuer das Schild im Level-Wipe
const LEVELS = {
  inside:      { n:1, name:'level.inside' },
  home:        { n:1, name:'level.home' },
  river:       { n:2, name:'level.river' },
  sword:       { n:3, name:'level.sword' },
  gate:        { n:4, name:'level.gate' },
  fork:        { n:5, name:'level.fork' },
  spider:      { n:6, name:'level.spider' },
  croc:        { n:6, name:'level.croc' },
  confirmgate: { n:7, name:'level.confirmgate' },
  stars:       { n:8, name:'level.stars' },
  end:         { n:9, name:'level.end' }
};

/* Level-Wipe: schwarz von rechts nach links rein, Schild steht, dann nach
   links wieder raus. Rein zeitgesteuert in frame() -> kann nicht haengen.
   Jede Taste ueberspringt. FX aus / reduced-motion: harter Schnitt mit
   kurzem Schild. Die Szene wird unter dem schwarzen Bild gewechselt,
   onEnter (Dialoge!) feuert erst, wenn das Bild wieder frei ist.        */
const transition = { active:false, id:null, t:0, applied:false, quick:false };
function transitionTimes() {
  return transition.quick ? { wipe:0, hold:0.3 } : { wipe:CONFIG.wipeTime, hold:CONFIG.holdTime };
}
function goToScene(id) {
  clearUI(); sequence = null; nearestHotspot = null; brunoVel = 0; timeScale = 1;
  cleanup.active = false; cleanup.phase = null;
  if (menuOpen()) closeMenu();
  document.getElementById('hotspotPrompt').classList.add('hidden');
  Music.setScene(id);
  transition.active = true; transition.id = id; transition.t = 0; transition.applied = false;
  transition.quick = !Prefs.data.shake;
  ui.mode = 'transition';
  if (transition.quick) applyScene(id);
}
// eigentlicher Szenenwechsel (unter dem Wipe); setzt den Checkpoint
function applyScene(id) {
  if (transition.applied) return;
  transition.applied = true;
  state.scene = id; brunoX = scenes[id].startX; brunoFacing = 1; brunoVel = 0;
  state.enemyState = 'alive'; state.starTaken = -1;
  state.boatGone = null; state.brunoHidden = false; state.gateOpen = false; state.broomTaken = false;
  brunoY = 0; brunoVY = 0; hopTimer = 1.8;
  shake.t = 0; particles.length = 0; sceneTime = 0;
  recordCheckpoint(id);
  const lv = LEVELS[id];
  canvas.setAttribute('aria-label', tr('a11y.canvas', { name: tr(lv.name) }));
}
function updateTransition(dt) {
  if (!transition.active) return;
  const { wipe, hold } = transitionTimes();
  transition.t += dt;
  if (!transition.applied && transition.t >= wipe) applyScene(transition.id);
  if (transition.t >= wipe * 2 + hold) finishTransition();
}
function finishTransition() {
  if (!transition.active) return;
  if (!transition.applied) applyScene(transition.id);
  transition.active = false;
  Labels.setWipe(null); Labels.setClip(0, 0);
  ui.mode = null; sceneTime = 0;
  const id = transition.id;
  const lv = LEVELS[id];
  announce(tr('a11y.scene', { n: lv.n, name: tr(lv.name) }));
  if (id === 'end') Sfx.play('win');
  if (scenes[id].onEnter) scenes[id].onEnter();
}
function drawTransition() {
  if (!transition.active) return;
  const { wipe, hold } = transitionTimes();
  const tt = transition.t;
  const ease = (p) => p * p * (3 - 2 * p);
  ctx.fillStyle = '#06050a';
  if (wipe > 0 && tt < wipe) {
    const p = ease(tt / wipe); const wdt = Math.round(p * W);
    ctx.fillRect(W - wdt, 0, wdt + 1, H);
    Labels.setClip(0, wdt);                       // DOM-Labels gleich mit abdecken
  } else if (tt < wipe + hold) {
    ctx.fillRect(0, 0, W, H);
    Labels.setClip(W, 0);
  } else {
    const p = wipe > 0 ? ease(Math.min(1, (tt - wipe - hold) / wipe)) : 1;
    const left = Math.round((1 - p) * W);
    ctx.fillRect(0, 0, left, H);
    Labels.setClip(left, 0);
  }
  // Schild: LEVEL n / NAME — erscheint sobald das Bild schwarz ist (DOM, scharf)
  const lv = LEVELS[transition.id];
  if (!lv || tt < wipe) { Labels.setWipe(null); return; }
  const a = Math.min(1, (tt - wipe) / 0.12) * Math.max(0, Math.min(1, (wipe * 2 + hold - tt) / 0.12));
  Labels.setWipe(tr('level.label', { n: lv.n }), tr(lv.name).toUpperCase(), a);
}

/* Checkpoints: beim Betreten jeder Szene werden Szene + Flags gemerkt.
   Fehlschlaege fuehren zurueck zum Checkpoint, nicht zu Level 1 —
   die Fehlermeldung (die Lektion) bleibt, nur die Strafe wird milder. */
let checkpoint = null;
function recordCheckpoint(id) {
  checkpoint = { scene:id, hasCodeblatt:state.hasCodeblatt, hasSword:state.hasSword, hasHat:state.hasHat, path:state.path };
}
function respawnAtCheckpoint() {
  const cp = checkpoint || { scene:'inside', hasCodeblatt:false, hasSword:false, hasHat:false, path:null };
  state.hasCodeblatt = cp.hasCodeblatt; state.hasSword = cp.hasSword; state.hasHat = !!cp.hasHat; state.path = cp.path;
  document.getElementById('codeblattBtn').classList.toggle('hidden', !state.hasCodeblatt);
  goToScene(cp.scene);
}
// echter Neustart: "Noch einmal spielen" / neue Runde — mit frisch gedrucktem Codeblatt
function resetGame() {
  state.hasCodeblatt = false; state.hasSword = false; state.hasHat = false; state.path = null;
  state.enemyState = 'alive'; state.starTaken = -1; state.footprints = {};
  checkpoint = null;
  rollCodeblatt();
  document.getElementById('codeblattBtn').classList.add('hidden');
  goToScene('inside');                 // ohne Hut zurueck in die Stube
}

// ===================== UPDATE =====================
let brunoVel = 0;      // px/s — fuer sanftes Anlaufen/Abbremsen
let stepTimer = 0;     // Fussschritt-Sound + Staub
let stepAlt = false;
let hopTimer = 0;      // Freudenhuepfer in der Endszene
let lastPromptText = '';
function update(dt) {
  const s = scenes[state.scene];
  if (cleanup.active) { updateCleanup(dt); return; }
  if (ui.mode === 'anim') { updateSequence(dt); return; }
  // Sprung: einfache Parabel, Landung mit Staub + Ton (laeuft auch, wenn
  // gerade ein Panel offen ist, damit niemand in der Luft haengen bleibt)
  if (brunoY > 0 || brunoVY < 0) {
    brunoVY += CONFIG.gravity * dt;
    brunoY -= brunoVY * dt;
    if (brunoY <= 0) {
      brunoY = 0; brunoVY = 0;
      Sfx.play('land');
      burst(brunoX, groundY - 1, 6, { spread: 50, up: 20, g: 60, life: 0.35, color: 'rgba(220,205,175,0.85)' });
    }
  }
  // Endszene: Bruno huepft vor Freude
  if (state.scene === 'end' && !transition.active && ui.mode !== 'transition') {
    hopTimer -= dt;
    if (hopTimer <= 0 && brunoY <= 0) { hopTimer = 1.1; brunoVY = -115; }
  }
  if (ui.mode === null) {
    let dir = 0;
    if (left()) dir -= 1;
    if (right()) dir += 1;
    // Beschleunigen/Abbremsen statt hartem Start — dt-basiert,
    // damit das Spiel auf 60-Hz- und 144-Hz-Monitoren gleich schnell ist
    const target = dir * CONFIG.walkSpeed;
    if (brunoVel < target) brunoVel = Math.min(target, brunoVel + CONFIG.walkAccel * dt);
    else if (brunoVel > target) brunoVel = Math.max(target, brunoVel - CONFIG.walkAccel * dt);
    const moving = Math.abs(brunoVel) > 6;
    if (dir !== 0) brunoFacing = dir;
    brunoAnim.set(moving ? 'bruno_walk' : 'bruno_idle');
    brunoX += brunoVel * dt;
    brunoX = Math.max(10, Math.min(W-10, brunoX));
    brunoAnim.update(dt);

    // Fussschritte: leiser Tick + Staubwoelkchen im Laufrhythmus (nur am Boden)
    if (moving && brunoY <= 0) {
      stepTimer -= dt;
      if (stepTimer <= 0) {
        stepTimer = CONFIG.stepInterval;
        stepAlt = !stepAlt;
        Sfx.step(stepAlt);
        spawnParticle(brunoX - brunoFacing * 6, groundY - 1,
          { spread: 16, up: 14, g: 40, life: 0.35, color: 'rgba(220,205,175,0.8)' });
        // nur jeder zweite Schritt hinterlaesst eine Spur — ein paar Striche, keine Fussabdruck-Kette
        if (stepAlt) addFootprint(brunoX - brunoFacing * 6, groundY + (pRand() < 0.5 ? 0 : 1), pRand() < 0.6);
      }
    } else stepTimer = 0;

    let nearest = null, nearestD = 999;
    for (const hs of s.hotspots) { if (hs.when && !hs.when()) continue; const d = Math.abs(brunoX - hs.x); if (d < (hs.range || CONFIG.interactRange) && d < nearestD) { nearest = hs; nearestD = d; } }
    nearestHotspot = nearest;
    const prompt = document.getElementById('hotspotPrompt');
    if (nearest) {
      const text = resolveText(nearest.label);
      if (text !== lastPromptText) { prompt.textContent = text; lastPromptText = text; announce(tr('a11y.hotspot', { label: text })); }
      prompt.classList.remove('hidden');
      // Guard gegen Doppelklick: ein zweiter Klick, bevor die UI reagiert
      // hat, darf die Interaktion nicht noch einmal ausloesen
      prompt.onclick = () => { if (ui.mode === null && brunoY <= 0) { nearestHotspot = null; nearest.onInteract(); } };
    }
    else { prompt.classList.add('hidden'); lastPromptText = ''; }
  } else {
    nearestHotspot = null;
    brunoVel = 0;
    document.getElementById('hotspotPrompt').classList.add('hidden'); lastPromptText = '';
    brunoAnim.set('bruno_idle'); brunoAnim.update(dt);
  }
}
