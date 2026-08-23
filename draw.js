/* ===================== DRAW — Zeichenhelfer, Bruno, Schwert (HAND-Anker), Sequenz-Platzhalter =====================
   Teil von game.js (aufgeteilt in Module, Ladereihenfolge siehe index.html).
   Klassische Scripts: alle Top-Level-Deklarationen sind global sichtbar.
   ===================== */

// ===================== DRAW HELPERS (placeholders) =====================
// deterministic pseudo-random for stable scenery
function rnd(seed) { const x = Math.sin(seed * 127.1) * 43758.5453; return x - Math.floor(x); }

// Himmel als flache Farbbaender statt Verlauf (Pixel-Look), dazwischen
// eine Zeile Dithering — alles auf dem Spielraster.
function sky(topC, botC) {
  const top = topC || PAL.skyTop, bot = botC || PAL.skyBot;
  const bands = 6, bh = Math.ceil(H / bands);
  for (let i = 0; i < bands; i++) {
    const k = i / (bands - 1);
    const col = mixHex(top, bot, k);
    ctx.fillStyle = col; ctx.fillRect(0, i * bh, W, bh);
    if (i > 0) {                                   // Dither-Zeile zur Band darueber
      ctx.fillStyle = mixHex(top, bot, (i - 1) / (bands - 1));
      for (let x = (i % 2) * 2; x < W; x += 4) ctx.fillRect(x, i * bh, 2, 1);
    }
  }
}

function drawClouds() {
  const drift = (t * 0.06) % (W + 80);
  const puffs = [[0,18,1.0],[70,30,0.75],[150,14,0.9],[210,34,0.6]];
  for (const [bx,by,sc] of puffs) {
    const x = ((bx - drift) % (W + 80) + W + 80) % (W + 80) - 40;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(x, by+3*sc, 26*sc, 5*sc);
    ctx.fillRect(x+5*sc, by, 15*sc, 5*sc);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(x+3*sc, by+1*sc, 12*sc, 3*sc);
  }
}

// layered mountains: far snowy ridge + nearer forested ridge
function mountainsBG() {
  // --- far ridge ---
  ctx.fillStyle = '#6d8fb3';
  ctx.beginPath(); ctx.moveTo(-10,62);
  const far = [[14,34],[34,20],[52,36],[74,14],[96,32],[120,18],[146,36],[172,16],[198,34],[224,22],[252,38],[266,44]];
  for (const [x,y] of far) ctx.lineTo(x,y);
  ctx.lineTo(266,64); ctx.lineTo(-10,64); ctx.closePath(); ctx.fill();
  // snow caps + shadow sides
  for (const [x,y] of far) {
    if (y > 26) continue;
    ctx.fillStyle = '#eef6fb';
    ctx.beginPath(); ctx.moveTo(x-5,y+6); ctx.lineTo(x,y); ctx.lineTo(x+5,y+6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c3d6e4';
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+5,y+6); ctx.lineTo(x+1,y+6); ctx.closePath(); ctx.fill();
  }
  // --- near ridge (darker, forested) ---
  ctx.fillStyle = '#3f6b52';
  ctx.beginPath(); ctx.moveTo(-10,72);
  const near = [[20,54],[48,64],[78,50],[110,62],[142,52],[176,64],[210,54],[244,66],[266,58]];
  for (const [x,y] of near) ctx.lineTo(x,y);
  ctx.lineTo(266,groundY); ctx.lineTo(-10,groundY); ctx.closePath(); ctx.fill();
  // tiny tree silhouettes on the near ridge
  ctx.fillStyle = '#2f5240';
  for (let i=0;i<26;i++) {
    const x = 4 + i*10 + (rnd(i)*4|0);
    const base = 66 + Math.sin(i*0.9)*5;
    const hgt = 4 + (rnd(i+50)*4|0);
    ctx.beginPath(); ctx.moveTo(x-2,base); ctx.lineTo(x,base-hgt); ctx.lineTo(x+2,base); ctx.closePath(); ctx.fill();
  }
}

// fuller layered tree
function tree(x,y,scale=1) {
  const s = scale;
  // trunk with shading
  ctx.fillStyle = '#3a2416'; ctx.fillRect(x-2*s, y-9*s, 4*s, 9*s);
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(x-2*s, y-9*s, 2*s, 9*s);
  // canopy: three stacked tiers
  const tiers = [[10,0,'#1f3d1f'],[8,-6,'#2f5233'],[6,-11,'#3f6b3d']];
  for (const [wid,off,col] of tiers) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x-wid*s, y-9*s+off*s);
    ctx.lineTo(x, y-9*s+off*s-8*s);
    ctx.lineTo(x+wid*s, y-9*s+off*s);
    ctx.closePath(); ctx.fill();
  }
  // sun-side highlight
  ctx.fillStyle = '#5e9a4b';
  ctx.fillRect(x-3*s, y-24*s, 2*s, 3*s);
}

function bush(x,y,s=1) {
  ctx.fillStyle='#26482a'; ctx.fillRect(x-5*s,y-5*s,10*s,5*s);
  ctx.fillStyle='#35633a'; ctx.fillRect(x-4*s,y-7*s,8*s,4*s);
  ctx.fillStyle='#4c7a3d'; ctx.fillRect(x-2*s,y-7*s,3*s,2*s);
}

function grassTufts(seed) {
  for (let i=0;i<34;i++) {
    const x = (rnd(seed+i)*W)|0;
    const h = 2 + ((rnd(seed+i+99)*3)|0);
    ctx.fillStyle = i%3 ? '#5e9a4b' : '#6fbf4a';
    ctx.fillRect(x, groundY-h, 1, h);
    if (i%4===0) ctx.fillRect(x+2, groundY-h+1, 1, h-1);
  }
}

// ground with soil layers, pebbles and a grass lip
function groundStrip(color=PAL.ground, grassColor=PAL.grass, seed=3) {
  ctx.fillStyle=color; ctx.fillRect(0,groundY,W,H-groundY);
  // darker subsoil
  ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(0,groundY+12,W,H-groundY-12);
  // grass lip with uneven edge
  ctx.fillStyle=grassColor; ctx.fillRect(0,groundY,W,5);
  for (let x=0;x<W;x+=2) { if (rnd(seed+x)>0.55) ctx.fillRect(x,groundY-1,2,1); }
  ctx.fillStyle='rgba(255,255,255,0.16)'; ctx.fillRect(0,groundY,W,1);
  // pebbles
  for (let i=0;i<18;i++) {
    const x=(rnd(seed+i*7)*W)|0, y=groundY+6+((rnd(seed+i*13)*20)|0);
    if (y>H-2) continue;
    ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.fillRect(x,y,2,1);
    ctx.fillStyle='rgba(255,255,255,0.10)'; ctx.fillRect(x,y-1,2,1);
  }
}

/* Wasser: Grundflaeche + drei Wellenbaender, die als Sinuslinien pro Spalte
   laufen (t ist dt-basiert -> zeitbasiert, bildratenunabhaengig; Sinus ->
   nahtlos, kein Zuruecksetzen). Alle Pixel ganzzahlig, Wasserhoehe unveraendert. */
function drawWaterStrip(y,h,base,hi,lo) {
  y = Math.round(y); h = Math.round(h);
  ctx.fillStyle=base; ctx.fillRect(0,y,W,h);
  ctx.fillStyle=lo; ctx.fillRect(0,y+Math.round(h*0.55),W,h-Math.round(h*0.55));
  const bands = [
    [4,  0.20,  0.55, 2,   hi],
    [9,  0.16, -0.40, 2,   'rgba(255,255,255,0.22)'],
    [15, 0.12,  0.30, 1.5, 'rgba(255,255,255,0.12)']
  ];
  for (const [off, k, sp, amp, col] of bands) {
    if (off >= h) continue;
    ctx.fillStyle = col;
    for (let x = 0; x < W; x++) {
      const ph = (x + t * sp) * k;
      if (Math.sin(ph * 0.5 + 1.3) < 0.05) continue;            // Wellenkamm als unterbrochene Linie
      ctx.fillRect(x, y + off + Math.round(Math.sin(ph) * amp), 1, 1);
    }
  }
  // Uferschaum: langsam driftende Punkte statt Zufallsflackern
  ctx.fillStyle='rgba(255,255,255,0.4)';
  for (let i=0;i<18;i++){ const x = Math.round((i*14.3 + rnd(i)*9 + t*0.25) % W); ctx.fillRect(x, y, 2, 1); }
  // Sonnenglitzer
  ctx.fillStyle='rgba(255,255,255,0.5)';
  for (let i=0;i<7;i++){
    const gx=Math.round((i*41 + t*0.3)%W), gy=y+3+((rnd(i)*h*0.5)|0);
    if (Math.sin(t*0.1+i)>0.3) ctx.fillRect(gx,gy,1,1);
  }
}

/* ===================== Szenen-Look (nur Optik) =====================
   light: Lichtrichtung (-1 = Sonne links -> Schattenseite rechts, 1 = umgekehrt),
   gilt fuer alle Sprites (drawSprite schattiert die abgewandte Haelfte) und die
   Bodenschatten. haze: Luftdunst ueber dem Hintergrund (heller, kontrastaermer),
   tint: Farbstimmung ueber der ganzen Szene (gemeinsame Grundpalette, pro Szene
   ein Akzent). fg: Silhouetten am unteren Bildrand (dunkler, kontrastreicher
   Vordergrund). Gameplay, Positionen und Texte bleiben unberuehrt.         */
const SCENE_LOOK = {
  inside:      { light: 1,  tint: 'rgba(255,170,80,0.10)',  haze: null,                      fg: null },
  home:        { light: -1, tint: 'rgba(120,170,50,0.08)',  haze: 'rgba(205,228,255,0.22)',  fg: 'grass', clouds: true },
  river:       { light: -1, tint: 'rgba(90,160,130,0.08)',  haze: 'rgba(205,228,255,0.22)',  fg: 'reeds', clouds: true },
  sword:       { light: -1, tint: 'rgba(140,180,50,0.10)',  haze: 'rgba(205,228,255,0.22)',  fg: 'grass', clouds: true },
  gate:        { light: -1, tint: null,                     haze: 'rgba(190,225,170,0.16)',  fg: 'leaves', clouds: true },
  fork:        { light: 1,  tint: 'rgba(60,90,70,0.12)',    haze: 'rgba(120,140,150,0.18)',  fg: 'grass', clouds: true },
  spider:      { light: 1,  tint: 'rgba(20,30,90,0.22)',    haze: 'rgba(40,44,90,0.26)',     fg: 'rocks' },
  croc:        { light: -1, tint: 'rgba(50,80,60,0.20)',    haze: 'rgba(90,120,110,0.22)',   fg: 'reeds' },
  confirmgate: { light: 1,  tint: 'rgba(90,40,160,0.10)',   haze: null,                      fg: 'rocks' },
  stars:       { light: 1,  tint: 'rgba(30,40,120,0.10)',   haze: null,                      fg: null },
  end:         { light: -1, tint: 'rgba(255,170,60,0.14)',  haze: 'rgba(255,220,170,0.18)',  fg: 'grass', clouds: true }
};
/* ziehende Wolkenschleier ueber dem Foto-Himmel (dezent, zeitbasiert, endlos) */
function drawCloudWisps() {
  const look = sceneLook();
  if (!look.clouds) return;
  const wisps = [[0, 14, 54, 5, 0.09], [110, 24, 40, 4, 0.07], [190, 9, 62, 6, 0.08], [70, 36, 30, 3, 0.05]];
  for (const [bx, by, w, h, a] of wisps) {
    const x = ((bx - t * 0.035 * (1 + h / 6)) % (W + w) + W + w) % (W + w) - w;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(Math.round(x), by, w, h); ctx.fillRect(Math.round(x) + 6, by - 2, w - 14, 2); ctx.fillRect(Math.round(x) + 3, by + h, w - 8, 1);
  }
}
function sceneLook() { return SCENE_LOOK[state.scene] || SCENE_LOOK.home; }
/* weicher Bodenschatten (Ellipse auf der Bodenlinie); lift = Hoehe ueber dem Boden -> kleiner/schwaecher */
function groundShadow(x, w, alpha, lift) {
  const k = Math.max(0, 1 - (lift || 0) / 40);
  if (k <= 0) return;
  ctx.fillStyle = `rgba(0,0,0,${(alpha || 0.28) * k})`;
  ctx.beginPath(); ctx.ellipse(Math.round(x) + sceneLook().light * -2, groundY + 1.5, (w || 14) * (0.7 + 0.3 * k), 2.6, 0, 0, Math.PI * 2); ctx.fill();
}
/* Luftdunst: Hintergrund oben heller und kontrastaermer, bis kurz ueber die Bodenlinie */
function drawHaze() {
  const look = sceneLook();
  if (!look.haze) return;
  const g = ctx.createLinearGradient(0, 0, 0, groundY - 10);
  g.addColorStop(0, look.haze); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, groundY - 10);
}
/* Vordergrund: dunklerer Boden nach unten + Silhouetten am unteren Bildrand (statisch gerastert) */
function drawForeground() {
  const look = sceneLook();
  if (!look.fg) return;
  staticLayer('fg_' + look.fg + '_' + state.scene, () => {
    const g = ctx.createLinearGradient(0, groundY + 4, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = g; ctx.fillRect(0, groundY + 4, W, H - groundY - 4);
    const dark = look.fg === 'rocks' ? '#0c0a12' : look.fg === 'reeds' ? '#101a12' : '#0f180c';
    ctx.fillStyle = dark;
    if (look.fg === 'grass' || look.fg === 'leaves') {
      for (let i = 0; i < 46; i++) {                                       // Grasbueschel-Silhouetten
        const x = (rnd(i * 3.3 + 7) * (W + 20)) | 0, h = 5 + ((rnd(i * 1.7) * 9) | 0), w = 2 + ((rnd(i * 2.1) * 3) | 0);
        ctx.beginPath(); ctx.moveTo(x - w, H); ctx.lineTo(x + (rnd(i) - 0.5) * 4, H - h); ctx.lineTo(x + w, H); ctx.closePath(); ctx.fill();
      }
      if (look.fg === 'leaves') {                                           // Ast mit Blaettern links unten
        ctx.fillRect(0, H - 9, 44, 3); ctx.fillRect(30, H - 14, 22, 3);
        for (const [lx, ly] of [[8, H - 14], [18, H - 12], [28, H - 17], [40, H - 19], [50, H - 15], [14, H - 5]]) { ctx.beginPath(); ctx.ellipse(lx, ly, 5, 3, -0.5, 0, Math.PI * 2); ctx.fill(); }
      }
    } else if (look.fg === 'reeds') {
      for (let i = 0; i < 24; i++) {                                       // Schilf
        const x = (rnd(i * 4.1 + 3) * (W + 10)) | 0, h = 6 + ((rnd(i * 2.3) * 8) | 0);
        ctx.fillRect(x, H - h, 1, h); ctx.fillRect(x - 1, H - h, 3, 4);
      }
    } else if (look.fg === 'rocks') {
      for (let i = 0; i < 12; i++) {                                       // Felsbrocken
        const x = (rnd(i * 5.7 + 11) * (W + 30)) | 0 - 15, w = 10 + ((rnd(i * 1.3) * 22) | 0), h = 4 + ((rnd(i * 3.1) * 8) | 0);
        ctx.beginPath(); ctx.ellipse(x, H + 1, w, h, 0, Math.PI, 0); ctx.fill();
      }
    }
  });
}
/* Farbstimmung der Szene ueber der ganzen Welt (dezent) */
function drawMood() {
  const look = sceneLook();
  if (!look.tint) return;
  ctx.fillStyle = look.tint; ctx.fillRect(0, 0, W, H);
}

/* Foto-Hintergruende: die sichtbare Bodenkante (erste helle Zeile der Bodenflaeche,
   per Script aus den PNGs gemessen) liegt nicht in jedem Bild auf groundY (112):
     alpen.png 113, fork.png 113, spider.png 114, croc.png 112, stars.png 112.
   Das Bild wird um die Differenz nach oben versetzt, damit die Kante exakt auf der
   Bodenlinie liegt und Brunos unterste Pixelzeile (111) direkt darauf steht; die
   freiwerdenden Zeilen unten werden mit der letzten Bildzeile aufgefuellt.
   Bodenhoehe (groundY) und Figurenpositionen bleiben unveraendert.            */
const BG_FLOOR_ROW = { bg_home: 113, bg_river: 113, bg_sword: 113, bg_gate: 113, bg_confirmgate: 113, bg_end: 113, bg_fork: 113, bg_spider: 114, bg_croc: 112, bg_stars: 112 };
function bgOrElse(key, placeholderFn) {
  if (Assets.has(key)) {
    const img = Assets.imgs[key], dy = groundY - (BG_FLOOR_ROW[key] || groundY);
    ctx.drawImage(img, 0, dy, W, H);
    if (dy < 0) ctx.drawImage(img, 0, img.height - 1, img.width, 1, 0, H + dy, W, -dy);
    drawHaze(); drawCloudWisps();
    return true;
  }
  placeholderFn(); drawHaze(); return false;
}

/* Statische Kulissenteile einmal in einen Offscreen-Canvas zeichnen und
   danach nur noch blitten (A1: keine hundert fillRects pro Frame). fn()
   zeichnet ganz normal ueber `ctx` — der wird dafuer kurz umgebogen.
   Alles, was von t abhaengt (Wasser, Wolken, Rauch, Glimmen), gehoert
   NICHT hier hinein, sondern wird danach live darueber gezeichnet.     */
const layerCache = {};
function staticLayer(key, fn) {
  let c = layerCache[key];
  if (!c) {
    const [cv, lc] = offscreen();
    const main = ctx;
    ctx = lc;
    try { fn(); } finally { ctx = main; }
    c = layerCache[key] = cv;
  }
  ctx.drawImage(c, 0, 0, W, H);
}

// Bruno placeholder (also honours walk bob via anim.frame)
function drawBrunoPlaceholder(cx, bottomY, facing, anim) {
  const sx = Math.round(cx-7), sy = Math.round(bottomY-16);
  const step = anim && anim.key==='bruno_walk' ? (anim.frame%2) : 0;
  const legOff = anim && anim.key==='bruno_walk' ? (step===0?1:-1) : 0;
  ctx.save();
  if (facing < 0) { ctx.translate(sx+14,sy); ctx.scale(-1,1); } else ctx.translate(sx,sy);
  ctx.fillStyle = PAL.bearBodyDark;
  ctx.fillRect(2,11+(legOff>0?1:0),3,3-(legOff>0?1:0));
  ctx.fillRect(7,11+(legOff<0?1:0),3,3-(legOff<0?1:0));
  ctx.fillStyle = PAL.bearBody; ctx.fillRect(1,4,10,8);
  ctx.fillStyle = PAL.bearBelly; ctx.fillRect(3,6,6,5);
  ctx.fillStyle = PAL.bearBody; ctx.fillRect(6,0,7,6);
  ctx.fillRect(6,-1,2,2); ctx.fillRect(11,-1,2,2);
  ctx.fillStyle = PAL.bearBelly; ctx.fillRect(11,2,3,3);
  ctx.fillStyle = PAL.bearNose; ctx.fillRect(13,2,1,1);
  ctx.fillStyle = PAL.bearEye; ctx.fillRect(10,1,1,1);
  if (state.hasSword) { ctx.fillStyle=PAL.hilt; ctx.fillRect(-3,6,2,4); ctx.fillStyle=PAL.sword; ctx.fillRect(-3,-2,2,8); ctx.fillStyle=PAL.swordHi; ctx.fillRect(-3,-2,1,8); }
  ctx.restore();
}
/* Schlammige Pfotenabdruecke der aktuellen Szene — unter Bruno, ueber dem
   Boden. Wird am Anfang von drawBruno() gezeichnet (jede Szene ruft das als
   Letztes auf), also auch waehrend Sequenzen und beim Besenflug.          */
function drawFootprints() {
  const arr = state.footprints[state.scene];
  if (!arr || !arr.length) return;
  ctx.fillStyle = 'rgba(22,20,26,0.78)';                 // dunkelgrau/schwarz
  for (const p of arr) {
    ctx.fillRect(p.x, p.y, 2, 1);                        // kurzer Strich = Tatzenabdruck auf dem Boden
    if (p.toe) ctx.fillRect(p.x + 2, p.y - 1, 1, 1);     // kleiner Zehenpunkt davor
  }
}
function addFootprint(x, y, toe) {
  const arr = state.footprints[state.scene] || (state.footprints[state.scene] = []);
  arr.push({ x: Math.round(x), y: Math.round(y), toe: !!toe });
  if (arr.length > CONFIG.footprintMax) arr.shift();
}
/* Bruno fegt am Boden (Aufraeumen am Ende): gleitet mit den Fuessen auf dem
   Boden in Bewegungsrichtung, leicht nach vorn geneigt, den Besen schraeg
   nach vorn-unten in der Pfote — die Borsten beruehren den Boden. Hut und
   Schwert bleiben dran; Staub an den Borsten. Liefert die Borsten-Position
   (zum Wegwischen der Spuren).                                              */
function broomTip(x, facing) { return { x: x + facing * 8 + facing * 17, y: groundY + 1 }; }
function drawSweepingBruno(x, facing) {
  const y = groundY;
  ctx.save();
  groundShadow(x, 13, 0.3, 0);
  ctx.translate(x, y); ctx.rotate(facing * 0.1); ctx.translate(-x, -y);    // in Fahrtrichtung lehnen
  // beim Fegen nur der Besen in der Pfote — kein Schwert (state.hasSword bleibt, wird danach wieder gezeichnet)
  if (!drawSprite('bruno_idle', 0, x, y, facing)) drawBrunoPlaceholder(x, y, facing, null);
  drawHat(x, y, facing, 'bruno_idle', 0);
  // Besen: Stielende in der vorderen Pfote, Borsten vorn am Boden
  const s = pixSprite('broom');
  if (s) {
    ctx.save();
    ctx.translate(x + facing * 8, y - 14);
    ctx.scale(facing < 0 ? 1 : -1, 1);
    ctx.rotate(-0.75);
    ctx.drawImage(s.c, 0, 0, s.c.width, s.c.height, -s.w, -Math.round(s.h / 2), s.w, s.h);
    ctx.restore();
  }
  ctx.restore();
  const tip = broomTip(x, facing);
  if (pRand() < 0.8) spawnParticle(tip.x + (pRand() - 0.5) * 6, tip.y - 1, { vx: facing * 26, spread: 18, up: 16, g: 50, life: 0.45, color: ['#d9c9a6', '#b8b0a0', '#f4e9c9'] });
}
// Kompatibilitaet: frueherer Name
function drawFlyingBruno(x, y, facing) { drawSweepingBruno(x, facing); }

function drawBruno() {
  drawFootprints();
  // Waehrend ein bruno_*-Sequenzschritt laeuft, zeichnet drawSequence()
  // Bruno an der Aktionsposition — der normale Bruno muss dann aussetzen,
  // sonst stehen zwei Brunos gleichzeitig im Bild.
  const st = sequence && sequence.steps[sequence.i];
  if (st && (st.key.indexOf('bruno') === 0 || st.hideBruno)) return;
  if (state.brunoHidden) return;       // auf dem Boot weg / im Fluss versunken
  // Nur der Platzhalter braucht den Lauf-Bob; das echte Walk-Sheet hat
  // seinen Zyklus selbst, und die Fuesse sollen auf der Graslinie bleiben.
  const walking = brunoAnim.key === 'bruno_walk';
  const bob = (walking && !Assets.has('bruno_walk')) ? Math.abs(Math.sin(t * 0.22)) * 1.6 : 0;
  // in der Luft: Laufframe mit gespreizten Beinen
  const key = brunoY > 0 ? 'bruno_walk' : brunoAnim.key;
  const fr = brunoY > 0 ? 3 : brunoAnim.frame;
  const by = groundY - bob - Math.round(brunoY);
  groundShadow(brunoX, 13, 0.3, brunoY);
  // getragenes Schwert liegt hinter der Schulter -> zuerst zeichnen
  drawHeldSword(brunoX, by, brunoFacing, 0, key, fr, 'back');
  if (!drawSprite(key, fr, brunoX, by, brunoFacing))
    drawBrunoPlaceholder(brunoX, by, brunoFacing, brunoAnim);
  drawHat(brunoX, by, brunoFacing, key, fr);
  drawHeldSword(brunoX, by, brunoFacing, 0, key, fr, 'front');
}

/* Hut-Overlay (analog drawHeldSword): sitzt auf dem Kopf, Krempe ueberlappt die
   obersten zwei Kopfzeilen. Der Kopf liegt im Sheet eine Spalte links der
   Mitte (gespiegelt rechts), in den Walk-Frames 2/3/7 eine Zeile tiefer —
   HAT_DY gleicht das aus. Wird an denselben Stellen wie der Sprite gezeichnet,
   also innerhalb derselben save()/restore()-Transformationen.             */
/* Kopfposition pro Frame, per Script aus dem Sheet gemessen (Bounding-Box
   der obersten Kopfzeilen, relativ zu Frame 0): Idle = Kopf oben Zeile 2,
   Mitte Spalte 16. Alle Walk-Frames (Sheet 2-7) liegen 1 px weiter rechts,
   Frames 2/3/7 ausserdem 1 px tiefer. dx wird mit facing gespiegelt.       */
const HAT_OFF = {
  bruno_idle:   [[0, 0]],
  bruno_walk:   [[1, 1], [1, 1], [1, 0], [1, 0], [1, 0], [1, 1]],
  bruno_attack: [[1, 1], [1, 1], [1, 0], [1, 0], [1, 0], [1, 1]],
  default:      [[0, 0]]
};
function drawHat(cx, bottomY, facing, animKey, frame) {
  if (!state.hasHat) return;
  const tbl = HAT_OFF[animKey] || HAT_OFF.default;
  const [dx, dy] = tbl[Math.abs(frame || 0) % tbl.length];
  const hx = cx + facing * Math.round(dx * CHAR_SCALE);            // Kopfmitte dieses Frames
  const hy = bottomY - Math.round(26 * CHAR_SCALE) + Math.round(dy * CHAR_SCALE);   // Krempen-Unterkante: 2 px unter der Kopfoberkante (28, skaliert)
  if (!drawSprite('hat', 0, hx, hy, facing)) {
    ctx.fillStyle = '#44444e'; ctx.fillRect(Math.round(hx) - 8, hy - 3, 16, 3); ctx.fillRect(Math.round(hx) - 4, hy - 8, 8, 5);
  }
}

/* Hand-Anker pro Bruno-Animation — Daten statt Magic Numbers.
   x = Pixel vor der Sprite-Mitte (in Blickrichtung), y = Pixel ueber den
   Fuessen. frames[] wird mit dem Animationsframe indiziert (modulo), damit
   die Pfote beim Gehen mitwandert. front = Klinge auf der Kameraseite
   -> Schwert VOR Bruno zeichnen; sonst hinter ihm (ueber der Schulter).   */
const HAND = {
  bruno_idle:   { frames: [{ x:10, y:14 }], front:true },
  bruno_walk:   { frames: [{ x:10, y:15 }, { x:10, y:15 }, { x:9, y:14 }, { x:8, y:14 }, { x:9, y:14 }, { x:10, y:15 }], front:true },
  bruno_attack: { frames: [{ x:13, y:15 }], front:true },
  bruno_raise:  { frames: [{ x:13, y:17 }], front:true },   // Schwert hochhalten (Aufheben)
  bruno_death:  { frames: [{ x:10, y:14 }], front:true },
  default:      { frames: [{ x:10, y:14 }], front:true }
};
function handAnchor(key, frame) {
  const h = HAND[key] || HAND.default;
  const a = h.frames[Math.abs(frame || 0) % h.frames.length];
  // Anker in Sprite-Pixeln, mit dem Figuren-Massstab mitskaliert (Griff bleibt in der Pfote)
  return { x: Math.round(a.x * CHAR_SCALE), y: Math.round(a.y * CHAR_SCALE), front: h.front };
}
// Klingenwinkel: getragen = in der vorderen Pfote, Klinge nach oben und leicht
// nach vorn (+0.3 rad) — das kleine Schwert liegt damit ganz vor dem Koerper,
// nie ueber Schnauze oder Augen. Der Hieb dreht ~115 Grad nach vorn durch.
// Hochhalten (Aufheben) = senkrecht vor Bruno.
function swordAngle(key, swing) {
  if (key === 'bruno_raise') return 0.05;
  return 0.3 + swing * 2.0;
}

/* Sword held in Bruno's paw.
   swing = 0 (carried) .. 1 (full swing).  layer = 'back' | 'front':
   zeichnet nur, wenn das Schwert in dieser Ebene liegt — drawBruno ruft
   beide Ebenen um das Sprite herum auf.  force = auch ohne state.hasSword
   (Aufheb-Sequenz).                                                     */
function drawHeldSword(cx, bottomY, facing, swing, animKey, frame, layer, force, scale) {
  const spec0 = ASSET_MANIFEST['sword'];
  const SC = scale || spec0.scale || 1;             // Sheet ist auf Brunos Groesse gezeichnet -> Massstab 1
  if (!state.hasSword && !force) return;
  const anchor = handAnchor(animKey, frame);
  const inFront = anchor.front || swing > 0.02;
  if (layer === 'back' && inFront) return;
  if (layer === 'front' && !inFront) return;
  const img = Assets.imgs['sword'];
  const spec = ASSET_MANIFEST['sword'];
  const pawX = cx + facing * anchor.x;
  const pawY = bottomY - anchor.y;
  const angle = swordAngle(animKey, swing) * facing;
  ctx.save();
  ctx.translate(Math.round(pawX), Math.round(pawY));
  ctx.rotate(angle);
  if (facing < 0) ctx.scale(-1, 1);
  if (img) {
    // Das Sheet zeigt die Klinge nach unten (Knauf Zeile 0, Griff 1-4,
    // Parierstange 5, Klinge 6-13). In der Pfote: Frame 0, vertikal
    // gespiegelt -> Klinge nach oben, Drehpunkt auf dem Griff (Zeile 3).
    ctx.scale(1, -1);
    const sw = Math.round(spec.w * SC), sh = Math.round(spec.h * SC);
    ctx.drawImage(img, 0, 0, spec.w, spec.h, -Math.round(sw / 2), -Math.round((spec.pivot || 3) * SC), sw, sh);   // Drehpunkt = Griffmitte
  } else {
    ctx.fillStyle = PAL.hilt; ctx.fillRect(-1, -2, 2, 4);
    ctx.fillStyle = PAL.sword; ctx.fillRect(-1, -11, 2, 9);
  }
  ctx.restore();
  // swing arc trail
  if (swing > 0.05 && swing < 0.95) {
    const a0 = swordAngle(animKey, 0) * facing;
    ctx.strokeStyle = `rgba(255,255,255,${0.5 * Math.sin(swing * Math.PI)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pawX, pawY, Math.round(spec.h * 0.75), a0 - (facing < 0 ? Math.PI : 0), angle - (facing < 0 ? Math.PI : 0), facing < 0);
    ctx.stroke();
  }
}

/* Debug-Ansicht (CONFIG.debug, ?debug=1): rote Bodenlinie, cyan Sprite-Box,
   gelbe Linie = tatsaechlich sichtbare Fuss-Unterkante (gemessen), magenta Pivot,
   Text mit der Luecke in Spiel-Pixeln. Nur fuer die Entwicklung.          */
function drawDebugFeet() {
  const st = sequence && sequence.steps[sequence.i];
  const key = brunoAnim.key, spec = ASSET_MANIFEST[key] || ASSET_MANIFEST.bruno_idle, sc = spriteScale(key);
  const dw = Math.round(spec.w * sc), dh = Math.round(spec.h * sc);
  const bx = Math.round(brunoX), by = groundY - Math.round(brunoY);
  const left = Math.round(brunoX - dw / 2), top = by - dh;
  // sichtbare Unterkante: unterste Zeile mit deckenden Pixeln in der Sprite-Box (nur ohne Sequenz sinnvoll)
  let feet = null;
  if (!st && !state.brunoHidden) {
    const img = ctx.getImageData(left * RES, top * RES, dw * RES, (dh + 4) * RES).data;
    const w = dw * RES;
    for (let y = (dh + 4) * RES - 1; y >= 0 && feet === null; y--) for (let x = 0; x < w; x++) if (img[(y * w + x) * 4 + 3] > 200) { feet = top + (y + 1) / RES; break; }
  }
  ctx.save(); ctx.lineWidth = 0.5;
  ctx.strokeStyle = 'rgba(255,40,40,0.95)'; ctx.beginPath(); ctx.moveTo(0, groundY + 0.25); ctx.lineTo(W, groundY + 0.25); ctx.stroke();
  ctx.strokeStyle = 'rgba(60,230,255,0.9)'; ctx.strokeRect(left + 0.25, top + 0.25, dw, dh);
  ctx.fillStyle = '#ff40ff'; ctx.fillRect(bx - 1, by - 1, 2, 2);
  if (feet !== null) { ctx.strokeStyle = 'rgba(255,230,40,0.95)'; ctx.beginPath(); ctx.moveTo(left - 6, feet + 0.25); ctx.lineTo(left + dw + 6, feet + 0.25); ctx.stroke(); }
  ctx.restore();
  Labels.set('dbg', 'feet ' + (feet === null ? '?' : (feet - groundY).toFixed(1)) + ' px  y=' + by + ' ' + key, 4, 130, { size: 5, color: '#ffe040', cls: 'flat' });
}

// One-shot placeholders so sequences are visible before real art exists
function placeholderOneShot(key, x, bottomY, anim) {
  if (key === 'boat_sail') {
    // Fahrt: Boot und Bruno sind EINE Einheit — Bruno steht an fester lokaler
    // Position im Boot (Passagier), seine Beine verschwinden hinter der nahen
    // Bordwand (hinterer Bootsteil -> Bruno -> Bordwand). Bob ganzzahlig.
    const bob = Math.round(Math.sin(t * 0.12) * 1.5);
    const bx = Math.round(x);
    drawBoatHull(bx, bottomY + bob, 0, false, (px, py) => {
      drawHeldSword(px, py, 1, 0, 'bruno_idle', 0, 'back');
      if (!drawSprite('bruno_idle', 0, px, py, 1)) drawBrunoPlaceholder(px, py, 1, null);
      drawHat(px, py, 1, 'bruno_idle', 0);
      drawHeldSword(px, py, 1, 0, 'bruno_idle', 0, 'front');
    });
    if (pRand() < 0.6) spawnParticle(bx - 34, bottomY + 14, { vx: -22, spread: 14, up: 5, g: 0, life: 0.7, color: ['#cfefff', '#ffffff'] });
    return;
  }
  if (key === 'end_title') return;                      // Titel zeichnet drawEndScene() selbst
  const p = (anim && ASSET_MANIFEST[key]) ? anim.frame / Math.max(1,(ASSET_MANIFEST[key].frames-1)) : 0;
  if (key === 'bruno_attack') { drawBrunoPlaceholder(x + p*10, bottomY, 1, null); return; }
  if (key === 'bruno_death')  { ctx.save(); ctx.translate(x,bottomY-8); ctx.rotate(p*1.4); drawBrunoPlaceholder(0,8,1,null); ctx.restore(); return; }
  if (key === 'slash')        { ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(x,bottomY-6,8, -0.5+p*2, 1+p*2); ctx.stroke(); return; }
  if (key === 'spider_hit' || key === 'spider_defeated') { ctx.fillStyle='#1a1a1a'; const sq=1-p*0.6; ctx.beginPath(); ctx.ellipse(x,bottomY-6*sq,10,7*sq,0,0,Math.PI*2); ctx.fill(); return; }
  if (key === 'croc_hit' || key === 'croc_defeated') { ctx.fillStyle='#2f6b35'; const sq=1-p*0.6; ctx.fillRect(x-12,bottomY-8*sq,24,8*sq); return; }
  if (key === 'boat_break')   { drawBoatWreck(x, bottomY, p); ctx.fillStyle=PAL.hilt; for (let i=0;i<5;i++){ const a=i*1.3+p*3; ctx.fillRect(x+Math.cos(a)*p*22, bottomY-4+Math.sin(a)*p*14, 4,2);} return; }
  if (key === 'splash')       { ctx.fillStyle=PAL.riverHi; for (let i=0;i<6;i++){ const a=i; ctx.fillRect(x+Math.cos(a)*p*14, bottomY-p*14+Math.sin(a)*4, 2,2);} return; }
  if (key === 'gate_open' || key === 'gate_reject') return;   // das Tor zeichnet sich selbst (gateDraw in der Szene)
  if (key === 'star_collect') { ctx.fillStyle=PAL.gold; const s=3+p*6; ctx.fillRect(x-s/2,bottomY-s/2,s,s); return; }
  if (key === 'star_shatter') { ctx.fillStyle=PAL.gold; for (let i=0;i<6;i++){ const a=i; ctx.fillRect(x+Math.cos(a)*p*14, bottomY+Math.sin(a)*p*14, 2,2);} return; }
}

