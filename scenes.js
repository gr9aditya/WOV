/* ===================== SCENES — Szenen-Hintergruende, Gegner, Sterne-Finale, Endszene, Hotspot-Marker =====================
   Teil von game.js (aufgeteilt in Module, Ladereihenfolge siehe index.html).
   Klassische Scripts: alle Top-Level-Deklarationen sind global sichtbar.
   ===================== */

// ---- Scene backgrounds (each tries real bg_* first) ----
// Berner Alpen: Dreigestirn Eiger-Moench-Jungfrau als Silhouette, davor
// ein bewaldeter Ruecken. Ersetzt mountainsBG() nur in der Heimatszene.
function alpsBG() {
  // Dreigestirn (hinten, blau-grau, Schneefelder)
  ctx.fillStyle = '#6d8fb3';
  ctx.beginPath(); ctx.moveTo(-10, 70);
  const peaks = [[10,52],[34,38],[58,48],[84,40],[112,54],[136,44],[156,18],[170,34],[188,12],[204,30],[226,20],[244,40],[266,50]];
  for (const [x, y] of peaks) ctx.lineTo(x, y);
  ctx.lineTo(266, 72); ctx.lineTo(-10, 72); ctx.closePath(); ctx.fill();
  // Schnee auf den drei grossen Gipfeln + Schattenflanken
  for (const [x, y, w] of [[156,18,9],[188,12,11],[226,20,9]]) {
    ctx.fillStyle = '#eef6fb';
    ctx.beginPath(); ctx.moveTo(x - w, y + w * 1.3); ctx.lineTo(x, y); ctx.lineTo(x + w, y + w * 1.3); ctx.lineTo(x + 3, y + w * 1.1); ctx.lineTo(x - 2, y + w * 1.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c3d6e4';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + w * 1.3); ctx.lineTo(x + 2, y + w * 1.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5b7fa6';
    ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x + w * 2.2, y + w * 3.2); ctx.lineTo(x, y + w * 3.2); ctx.closePath(); ctx.fill();
  }
  // Schneegrenze als gezackte Linie
  ctx.fillStyle = 'rgba(238,246,251,0.55)';
  for (let i = 0; i < 14; i++) { const x = 140 + i * 8; ctx.fillRect(x, 44 + ((rnd(i) * 6) | 0), 5, 1); }
  // bewaldeter Ruecken davor
  ctx.fillStyle = '#3f6b52';
  ctx.beginPath(); ctx.moveTo(-10, 78);
  for (const [x, y] of [[20,66],[52,74],[84,62],[118,72],[150,64],[184,74],[214,66],[244,76],[266,70]]) ctx.lineTo(x, y);
  ctx.lineTo(266, groundY); ctx.lineTo(-10, groundY); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2f5240';
  for (let i = 0; i < 26; i++) {
    const x = 4 + i * 10 + (rnd(i) * 4 | 0), base = 76 + Math.sin(i * 0.9) * 5, hgt = 4 + (rnd(i + 50) * 4 | 0);
    ctx.beginPath(); ctx.moveTo(x - 2, base); ctx.lineTo(x, base - hgt); ctx.lineTo(x + 2, base); ctx.closePath(); ctx.fill();
  }
}

// Berner Chalet: flaches, weit ueberstehendes Satteldach mit Steinen,
// dunkle Holzfassade mit Balkenlagen auf Steinsockel, geschnitzter Balkon,
// Fensterlaeden, warmes Licht, rote Geranien, Kamin mit Rauch.
function chalet(g) {
  const L = 10, R = 96, mid = 53;
  // Steinsockel
  ctx.fillStyle = '#6b6b6b'; ctx.fillRect(L, g - 9, R - L, 9);
  ctx.fillStyle = '#4a4a4a';
  for (let y = g - 9; y < g; y += 3) for (let x = L + ((y / 3) | 0) % 2 * 3; x < R; x += 7) ctx.fillRect(x, y, 1, 3);
  ctx.fillStyle = '#8a8a8a'; ctx.fillRect(L, g - 9, R - L, 1);
  // Fassade mit Balkenlagen, Giebel
  ctx.fillStyle = PAL.wood;
  ctx.fillRect(L + 2, g - 52, R - L - 4, 43);
  ctx.beginPath(); ctx.moveTo(L + 2, g - 52); ctx.lineTo(mid, g - 74); ctx.lineTo(R - 2, g - 52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PAL.woodDark;
  for (let y = g - 50; y < g - 9; y += 5) ctx.fillRect(L + 2, y, R - L - 4, 1);
  ctx.fillStyle = PAL.beam;
  for (let y = g - 48; y < g - 9; y += 5) ctx.fillRect(L + 2, y, R - L - 4, 1);
  // senkrechte Eckbalken
  ctx.fillStyle = PAL.woodHi; ctx.fillRect(L + 2, g - 52, 2, 43); ctx.fillRect(R - 4, g - 52, 2, 43);
  // Giebelfenster (rund, warm)
  ctx.fillStyle = '#1b1024'; ctx.beginPath(); ctx.arc(mid, g - 62, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PAL.windowLight; ctx.beginPath(); ctx.arc(mid, g - 62, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1b1024'; ctx.fillRect(mid, g - 65, 1, 6); ctx.fillRect(mid - 3, g - 62, 6, 1);
  // Fenster: (x, y) = linke obere Ecke, 10x8, Laeden links/rechts, Geranien darunter
  const win = (x, y) => {
    ctx.fillStyle = '#1b1024'; ctx.fillRect(x - 1, y - 1, 12, 10);
    ctx.fillStyle = PAL.windowLight; ctx.fillRect(x, y, 10, 8);
    ctx.fillStyle = PAL.windowWarm; ctx.fillRect(x + 1, y + 4, 8, 3);
    ctx.fillStyle = '#1b1024'; ctx.fillRect(x + 5, y, 1, 8); ctx.fillRect(x, y + 4, 10, 1);
    ctx.fillStyle = PAL.shutter; ctx.fillRect(x - 4, y - 1, 3, 10); ctx.fillRect(x + 11, y - 1, 3, 10);
    ctx.fillStyle = '#1b1024'; ctx.fillRect(x - 3, y + 3, 1, 1); ctx.fillRect(x + 12, y + 3, 1, 1);   // Herzchen-Ausschnitt
    // Blumenkasten mit Geranien
    ctx.fillStyle = PAL.woodHi; ctx.fillRect(x - 2, y + 9, 14, 3);
    ctx.fillStyle = PAL.grass; for (let i = 0; i < 6; i++) ctx.fillRect(x - 1 + i * 2, y + 8, 2, 1);
    ctx.fillStyle = PAL.geranium; for (let i = 0; i < 5; i++) ctx.fillRect(x - 1 + i * 3, y + 7, 2, 2);
    ctx.fillStyle = PAL.geraniumHi; for (let i = 0; i < 4; i++) ctx.fillRect(x + 1 + i * 3, y + 6, 1, 1);
  };
  win(22, g - 48); win(70, g - 48);
  win(62, g - 28);
  // Tuer (Bruno steht davor)
  ctx.fillStyle = '#1b1024'; ctx.fillRect(26, g - 30, 14, 21);
  ctx.fillStyle = PAL.woodHi; ctx.fillRect(27, g - 29, 12, 20);
  ctx.fillStyle = PAL.woodDark; ctx.fillRect(33, g - 29, 1, 20); for (let y = g - 27; y < g - 9; y += 4) ctx.fillRect(27, y, 12, 1);
  ctx.fillStyle = PAL.windowLight; ctx.fillRect(29, g - 27, 3, 3); ctx.fillRect(34, g - 27, 3, 3);
  ctx.fillStyle = PAL.gold; ctx.fillRect(31, g - 19, 1, 2);
  // Balkon: Boden, geschnitzte Bruestung mit Pfosten
  ctx.fillStyle = PAL.woodDark; ctx.fillRect(L - 3, g - 32, R - L + 6, 1);
  ctx.fillStyle = PAL.woodHi; ctx.fillRect(L - 3, g - 35, R - L + 6, 3);
  ctx.fillStyle = PAL.beam; ctx.fillRect(L - 3, g - 35, R - L + 6, 1);
  for (let x = L - 2; x <= R + 2; x += 6) { ctx.fillStyle = PAL.woodHi; ctx.fillRect(x, g - 43, 2, 8); }
  ctx.fillStyle = PAL.woodHi; ctx.fillRect(L - 3, g - 44, R - L + 6, 2);
  ctx.fillStyle = PAL.woodDark; for (let x = L + 1; x <= R; x += 6) { ctx.fillRect(x, g - 40, 1, 1); ctx.fillRect(x, g - 38, 1, 1); }  // Schnitzmuster
  // Dach: flach, weit ueberstehend, mit Steinen beschwert
  const eaveY = g - 50, apexY = g - 76, eL = L - 12, eR = R + 12;
  ctx.fillStyle = PAL.woodDark;                                   // Untersicht / Traufe
  ctx.beginPath(); ctx.moveTo(eL, eaveY + 3); ctx.lineTo(mid, apexY + 3); ctx.lineTo(eR, eaveY + 3); ctx.lineTo(eR, eaveY + 5); ctx.lineTo(mid, apexY + 5); ctx.lineTo(eL, eaveY + 5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PAL.roof;
  ctx.beginPath(); ctx.moveTo(eL, eaveY); ctx.lineTo(mid, apexY); ctx.lineTo(eR, eaveY); ctx.lineTo(eR, eaveY + 3); ctx.lineTo(mid, apexY + 3); ctx.lineTo(eL, eaveY + 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PAL.roofHi;                                     // Schindelreihen
  for (let i = 1; i < 4; i++) {
    const k = i / 4;
    ctx.beginPath(); ctx.moveTo(eL + (mid - eL) * k, eaveY + (apexY - eaveY) * k); ctx.lineTo(eL + (mid - eL) * k + 1, eaveY + (apexY - eaveY) * k + 1);
    ctx.lineTo(eR - (eR - mid) * k + 1, eaveY + (apexY - eaveY) * k + 1); ctx.lineTo(eR - (eR - mid) * k, eaveY + (apexY - eaveY) * k); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#1b1024'; ctx.fillRect(mid - 1, apexY - 1, 2, 2);   // First
  for (let i = 0; i < 7; i++) {                                    // Dachsteine
    const k = 0.12 + i * 0.13;
    const xl = eL + (mid - eL) * k, xr = eR - (eR - mid) * k, y = eaveY + (apexY - eaveY) * k;
    ctx.fillStyle = '#8a8a8a'; ctx.fillRect(Math.round(xl), Math.round(y) - 2, 3, 2); ctx.fillRect(Math.round(xr) - 2, Math.round(y) - 2, 3, 2);
    ctx.fillStyle = '#5a5a5a'; ctx.fillRect(Math.round(xl), Math.round(y) - 1, 3, 1); ctx.fillRect(Math.round(xr) - 2, Math.round(y) - 1, 3, 1);
  }
  // Kamin aus Stein (Rauch: chaletSmoke(), animiert)
  ctx.fillStyle = '#6b6b6b'; ctx.fillRect(72, g - 86, 7, 24);
  ctx.fillStyle = '#4a4a4a'; ctx.fillRect(72, g - 80, 7, 1); ctx.fillRect(72, g - 74, 7, 1); ctx.fillRect(75, g - 84, 1, 3);
  ctx.fillStyle = '#3a3a3a'; ctx.fillRect(71, g - 88, 9, 2);
}
function chaletSmoke(g) {
  for (let i = 0; i < 5; i++) {
    const k = ((t * 0.35 + i * 14) % 70) / 70;
    const sx = 75.5 + Math.sin(k * 6 + i) * (2 + k * 5) + k * 6, sy = g - 90 - k * 34;
    ctx.fillStyle = `rgba(235,235,240,${0.45 * (1 - k)})`;
    ctx.beginPath(); ctx.arc(sx, sy, 1.5 + k * 3, 0, Math.PI * 2); ctx.fill();
  }
}

function drawMailbox(x) {
  ctx.fillStyle='#4a2f18'; ctx.fillRect(x-1,groundY-9,3,9);
  ctx.fillStyle='#1b1024'; ctx.fillRect(x-7,groundY-21,15,12);
  ctx.fillStyle='#e0b23f'; ctx.fillRect(x-6,groundY-20,13,10);
  ctx.fillStyle='#c9902a'; ctx.fillRect(x-6,groundY-16,13,2);
  ctx.fillStyle='#8a6a1c'; ctx.fillRect(x+3,groundY-14,3,3);
  // red flag up
  ctx.fillStyle='#1b1024'; ctx.fillRect(x+7,groundY-27,2,8);
  ctx.fillStyle='#d64545'; ctx.fillRect(x+9,groundY-27,5,4);
}

/* Brunos Stube: Holzwaende mit Balkenlagen, Dielenboden, Fenster mit Blick
   auf den Wald, rechts die Haustuer (gleiches Design wie aussen: dunkler
   Rahmen, helles Holz, zwei Scheiben, goldener Knauf), links der Hutaken. */
function drawInsideScene() { bgOrElse('bg_inside', () => {
  staticLayer('inside_all', () => {
    const g = groundY;
    // ---- Holzwand: Bretter mit leicht unterschiedlichem Ton, Maserung, Astloecher ----
    for (let y = 0, i = 0; y < g - 3; y += 7, i++) {
      const k = rnd(i * 13) * 0.4 - 0.2;                     // -0.2 .. +0.2 heller/dunkler
      ctx.fillStyle = mixHex(PAL.wood, k > 0 ? '#5a3a22' : '#2a1810', Math.abs(k));
      ctx.fillRect(0, y, W, 7);
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(0, y + 6, W, 1);    // Fuge
      ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, y, W, 1);  // Kante
      ctx.fillStyle = 'rgba(0,0,0,0.16)';                                  // Maserung: kurze Striche
      for (let j = 0; j < 9; j++) { const x = (rnd(i * 31 + j * 7) * W) | 0, len = 4 + ((rnd(i + j * 3) * 9) | 0); ctx.fillRect(x, y + 2 + ((rnd(j * 5 + i) * 3) | 0), len, 1); }
      if (rnd(i * 17) > 0.72) { const x = (rnd(i * 23) * W) | 0; ctx.fillStyle = '#2a1810'; ctx.fillRect(x, y + 2, 3, 2); ctx.fillStyle = '#1b1024'; ctx.fillRect(x + 1, y + 3, 1, 1); }   // Astloch
    }
    // ---- Fussboden: Dielen in perspektivischer Andeutung (hinten schmal, vorn breit) ----
    const rows = [[g, 5], [g + 5, 8], [g + 13, 11], [g + 24, H - g - 24]];
    rows.forEach(([y, hgt], r) => {
      ctx.fillStyle = mixHex('#7d5a35', '#5a3d22', r * 0.22); ctx.fillRect(0, y, W, hgt);
      ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(0, y, W, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, y + hgt - 1, W, 1);
      const pitch = 18 + r * 9, off = (r * 7) % pitch;                     // Stoesse wandern, Bretter werden vorn breiter
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for (let x = off; x < W; x += pitch) ctx.fillRect(x, y, 1, hgt);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      for (let x = off + 4; x < W; x += pitch) ctx.fillRect(x, y + 1 + ((r * 3) % (hgt - 1)), 6, 1);   // Maserung
    });
    // ---- Wandleiste ----
    ctx.fillStyle = '#2a1810'; ctx.fillRect(0, g - 4, W, 4);
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(0, g - 4, W, 1);
    ctx.fillStyle = '#1b1024'; ctx.fillRect(0, g - 1, W, 1);
    // ---- Fenster: Blick nach draussen, Rahmen, Sprossen, Vorhaenge ----
    ctx.save(); ctx.beginPath(); ctx.rect(150, 30, 40, 32); ctx.clip();
    sky(); ctx.fillStyle = '#3f6b52'; ctx.fillRect(150, 52, 40, 10);
    tree(158, 62, 0.7); tree(172, 62, 0.9); tree(186, 62, 0.6);
    ctx.restore();
    ctx.fillStyle = '#1b1024';
    ctx.fillRect(148, 28, 44, 2); ctx.fillRect(148, 62, 44, 2); ctx.fillRect(148, 28, 2, 36); ctx.fillRect(190, 28, 2, 36);
    ctx.fillRect(169, 28, 2, 36); ctx.fillRect(148, 45, 44, 2);
    ctx.fillStyle = '#d64545'; ctx.fillRect(143, 26, 6, 42); ctx.fillRect(191, 26, 6, 42);
    ctx.fillStyle = '#b83a3a'; for (let y = 28; y < 66; y += 4) { ctx.fillRect(145, y, 1, 2); ctx.fillRect(193, y, 1, 2); }
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(141, 66, 58, 3);
    ctx.fillStyle = '#4c9a4b'; ctx.fillRect(152, 62, 8, 4); ctx.fillStyle = '#d64545'; ctx.fillRect(153, 61, 2, 2); ctx.fillRect(157, 61, 2, 2);   // Blumentopf
    ctx.fillStyle = '#8a5a2e'; ctx.fillRect(151, 64, 10, 3);
    // ---- warmes Licht durchs Fenster auf den Boden ----
    ctx.fillStyle = 'rgba(255,220,150,0.11)';
    ctx.beginPath(); ctx.moveTo(150, 64); ctx.lineTo(190, 64); ctx.lineTo(222, H); ctx.lineTo(112, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,150,0.08)';
    ctx.beginPath(); ctx.moveTo(156, 64); ctx.lineTo(184, 64); ctx.lineTo(206, H); ctx.lineTo(128, H); ctx.closePath(); ctx.fill();
    // ---- Garderobe links: Brett mit drei Haken, Schal am rechten Haken ----
    ctx.fillStyle = '#1b1024'; ctx.fillRect(18, g - 52, 36, 6);
    ctx.fillStyle = '#8a5a2e'; ctx.fillRect(19, g - 51, 34, 4);
    ctx.fillStyle = '#a8743c'; ctx.fillRect(19, g - 51, 34, 1);
    for (const hx of [24, 34, 44]) { ctx.fillStyle = '#2f2f36'; ctx.fillRect(hx - 1, g - 47, 2, 6); ctx.fillRect(hx - 3, g - 42, 4, 2); ctx.fillStyle = '#55555e'; ctx.fillRect(hx - 1, g - 47, 1, 5); }
    ctx.fillStyle = '#4aa8ff'; ctx.fillRect(43, g - 42, 3, 14); ctx.fillRect(46, g - 38, 2, 10);   // Schal
    ctx.fillStyle = '#2f78c4'; for (let y = g - 40; y < g - 28; y += 4) ctx.fillRect(43, y, 3, 1);
    // ---- Bett: Rahmen, Matratze, Kissen, Decke mit Muster ----
    ctx.fillStyle = '#1b1024'; ctx.fillRect(54, g - 22, 52, 22);
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(55, g - 21, 50, 20);
    ctx.fillStyle = '#8a5a2e'; ctx.fillRect(55, g - 21, 3, 20); ctx.fillRect(102, g - 16, 3, 15);   // Kopf-/Fussteil
    ctx.fillStyle = '#e8d9a8'; ctx.fillRect(58, g - 15, 44, 8);                                       // Matratze
    ctx.fillStyle = '#ffffff'; ctx.fillRect(59, g - 17, 11, 6); ctx.fillStyle = '#d9d0b8'; ctx.fillRect(59, g - 12, 11, 1);   // Kissen
    ctx.fillStyle = '#a13d3d'; ctx.fillRect(71, g - 15, 31, 9);                                       // Decke
    ctx.fillStyle = '#ffd23f'; for (let x = 74; x < 100; x += 6) ctx.fillRect(x, g - 12, 2, 2);
    ctx.fillStyle = '#d64545'; ctx.fillRect(71, g - 15, 31, 1);
    ctx.fillStyle = '#3a2416'; ctx.fillRect(56, g - 4, 3, 4); ctx.fillRect(101, g - 4, 3, 4);        // Fuesse
    // ---- Bild ueber dem Bett ----
    ctx.fillStyle = '#1b1024'; ctx.fillRect(68, 32, 24, 20);
    ctx.fillStyle = '#8a5a2e'; ctx.fillRect(69, 33, 22, 18);
    ctx.fillStyle = '#9fd8f2'; ctx.fillRect(71, 35, 18, 14);
    ctx.fillStyle = '#6d8fb3'; ctx.beginPath(); ctx.moveTo(71, 49); ctx.lineTo(77, 38); ctx.lineTo(81, 45); ctx.lineTo(85, 39); ctx.lineTo(89, 49); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#eef6fb'; ctx.fillRect(76, 38, 2, 2); ctx.fillRect(84, 39, 2, 2);
    ctx.fillStyle = '#3f6b52'; ctx.fillRect(71, 46, 18, 3);
    // ---- Tisch mit Stuhl und Geschirr ----
    ctx.fillStyle = '#3a2416'; ctx.fillRect(120, g - 15, 3, 15); ctx.fillRect(146, g - 15, 3, 15);
    ctx.fillStyle = '#8a5a2e'; ctx.fillRect(116, g - 18, 37, 3);
    ctx.fillStyle = '#a8743c'; ctx.fillRect(116, g - 18, 37, 1);
    ctx.fillStyle = '#f4e9c9'; ctx.fillRect(122, g - 20, 10, 2); ctx.fillStyle = '#d9d0b8'; ctx.fillRect(124, g - 20, 6, 1);   // Teller
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(136, g - 24, 7, 6); ctx.fillStyle = '#c9902a'; ctx.fillRect(136, g - 21, 7, 1); ctx.fillStyle = '#e8d9a8'; ctx.fillRect(137, g - 25, 5, 1);   // Honigtopf
    ctx.fillStyle = '#4aa8ff'; ctx.fillRect(146, g - 23, 4, 5); ctx.fillRect(150, g - 22, 1, 3);      // Becher
    ctx.fillStyle = '#3a2416'; ctx.fillRect(106, g - 26, 3, 26); ctx.fillRect(106, g - 14, 10, 2); ctx.fillRect(114, g - 12, 2, 12);   // Stuhl
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(107, g - 25, 1, 10);
    // ---- Teppich (unter Tisch und Stuhl) ----
    ctx.fillStyle = '#a13d3d'; ctx.fillRect(98, g + 3, 66, 12);
    ctx.fillStyle = '#d64545'; ctx.fillRect(100, g + 5, 62, 8);
    ctx.fillStyle = '#ffd23f'; for (let x = 104; x < 160; x += 8) ctx.fillRect(x, g + 8, 3, 2);
    ctx.fillStyle = '#f4e9c9'; for (let x = 99; x < 163; x += 4) { ctx.fillRect(x, g + 3, 1, 1); ctx.fillRect(x, g + 14, 1, 1); }   // Fransen
    // ---- Regal mit Krug, Buechern, Oellampe ----
    ctx.fillStyle = '#1b1024'; ctx.fillRect(196, 40, 32, 4); ctx.fillRect(196, 58, 32, 4);
    ctx.fillStyle = '#8a5a2e'; ctx.fillRect(197, 41, 30, 2); ctx.fillRect(197, 59, 30, 2);
    ctx.fillStyle = '#c9902a'; ctx.fillRect(199, 33, 6, 8); ctx.fillStyle = '#e8b85a'; ctx.fillRect(200, 33, 2, 6); ctx.fillStyle = '#1b1024'; ctx.fillRect(201, 31, 2, 2);   // Krug
    for (const [x, c, hh] of [[208,'#2f78c4',7],[212,'#4ad66d',8],[216,'#e0453f',6]]) { ctx.fillStyle = c; ctx.fillRect(x, 41 - hh, 3, hh); ctx.fillStyle = '#1b1024'; ctx.fillRect(x, 41 - hh, 3, 1); }   // Buecher
    ctx.fillStyle = '#2f2f36'; ctx.fillRect(203, 52, 8, 7); ctx.fillRect(205, 48, 4, 4); ctx.fillStyle = '#ffd27a'; ctx.fillRect(204, 53, 6, 4);   // Oellampe (Flamme animiert)
    ctx.fillStyle = '#d9c9a6'; ctx.fillRect(214, 51, 9, 8); ctx.fillStyle = '#8a5a2e'; ctx.fillRect(214, 51, 9, 2);   // Schachtel
    // ---- Truhe unter dem Regal ----
    ctx.fillStyle = '#1b1024'; ctx.fillRect(180, g - 14, 26, 14);
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(181, g - 13, 24, 12);
    ctx.fillStyle = '#8a5a2e'; ctx.fillRect(181, g - 13, 24, 3);
    ctx.fillStyle = '#2f2f36'; ctx.fillRect(181, g - 9, 24, 1); ctx.fillRect(186, g - 13, 1, 12); ctx.fillRect(199, g - 13, 1, 12);
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(192, g - 9, 2, 3);
    // ---- Haustuer rechts (wie aussen) ----
    const dx = 228;
    ctx.fillStyle = '#1b1024'; ctx.fillRect(dx - 14, g - 46, 28, 46);
    ctx.fillStyle = PAL.woodHi; ctx.fillRect(dx - 12, g - 44, 24, 44);
    ctx.fillStyle = PAL.woodDark; ctx.fillRect(dx, g - 44, 1, 44); for (let y = g - 40; y < g - 2; y += 8) ctx.fillRect(dx - 12, y, 24, 1);
    ctx.fillStyle = '#1b1024'; ctx.fillRect(dx - 9, g - 40, 7, 7); ctx.fillRect(dx + 2, g - 40, 7, 7);
    ctx.fillStyle = PAL.windowLight; ctx.fillRect(dx - 8, g - 39, 5, 5); ctx.fillRect(dx + 3, g - 39, 5, 5);
    ctx.fillStyle = PAL.gold; ctx.fillRect(dx - 9, g - 24, 2, 3);
    ctx.fillStyle = '#2a1810'; ctx.fillRect(dx - 16, g - 48, 32, 2); ctx.fillRect(dx - 16, g - 48, 2, 48); ctx.fillRect(dx + 14, g - 48, 2, 48);   // Tuerrahmen
  });
  // Hut am mittleren Haken, solange er noch nicht aufgesetzt ist
  if (!state.hasHat) drawSprite('hat', 0, 34, groundY - 33, 1);
  // Oellampe flackert + warmer Schein
  const f = Math.sin(t * 0.33) * 0.8 + Math.sin(t * 0.9) * 0.4;
  ctx.fillStyle = '#ffb347'; ctx.fillRect(205, 49 + f, 4, 4); ctx.fillStyle = '#ffe066'; ctx.fillRect(206, 48 + f, 2, 3);
  ctx.fillStyle = `rgba(255,190,110,${0.10 + Math.sin(t * 0.3) * 0.03})`; ctx.beginPath(); ctx.arc(207, 52, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255,190,110,${0.05 + Math.sin(t * 0.3) * 0.02})`; ctx.beginPath(); ctx.ellipse(205, groundY + 2, 40, 9, 0, 0, Math.PI * 2); ctx.fill();
});
if (!state.hasHat) hotspotMarker(34);
hotspotMarker(228);
drawBruno(); }

function drawHomeScene() {
  // Kulisse: Foto (alpen.png) oder code-gezeichnete Alpen — nur Landschaft
  bgOrElse('bg_home', () => {
    staticLayer('home_sky', () => sky());
    drawClouds();
    staticLayer('home_scenery', () => {
      alpsBG();
      groundStrip('#5a3a22', PAL.meadow, 5);
      grassTufts(5);
      for (let i = 0; i < 26; i++) {
        const x = (rnd(i * 31) * W) | 0, y = groundY + 2 + ((rnd(i * 17) * 12) | 0);
        ctx.fillStyle = ['#ffffff', '#ffd23f', '#f2789f', '#7ec8ff'][i % 4]; ctx.fillRect(x, y, 1, 1);
        ctx.fillStyle = PAL.grassHi; ctx.fillRect(x, y + 1, 1, 1);
      }
      tree(156, groundY, 0.7); tree(236, groundY, 1.0); tree(250, groundY, 0.75);
      bush(140, groundY, 0.8); bush(190, groundY, 0.8); bush(224, groundY, 0.7);
    });
  });
  // Requisiten — immer: Chalet mit Rauch, Briefkasten (Hotspot x=122)
  staticLayer('home_props', () => { if (!drawSprite('chalet', 0, 53, groundY, 1)) chalet(groundY); drawPix('mailbox', 122, groundY, 1); });
  chaletSmoke(groundY);
  hotspotMarker(122); drawBruno(); }

// x = Bootsmitte, sign = Pfosten des Holzschilds auf dem Steg, phase = Schaukel-Versatz
const BOATS = [{ x:70, num:'1234', sign:100, phase:0 }, { x:190, num:'2345', sign:160, phase:2.1 }];
function drawRiverScene() {
  // Kulisse: Foto (Wald = gegenueberliegendes Ufer) oder Platzhalter mit eigenem Ufer
  const photo = bgOrElse('bg_river', () => {
    staticLayer('river_sky', () => sky());
    drawClouds();
    staticLayer('river_mid', () => {
      mountainsBG();
      ctx.fillStyle='#3f6b52'; ctx.fillRect(0,groundY-30,W,8);
      ctx.fillStyle='#2f5240';
      for (let i=0;i<20;i++){ const x=i*13; ctx.beginPath(); ctx.moveTo(x-2,groundY-30); ctx.lineTo(x,groundY-36); ctx.lineTo(x+2,groundY-30); ctx.closePath(); ctx.fill(); }
    });
  });
  // Boden-Overlay — immer: der Raum braucht Wasser ab groundY, darueber der Steg.
  // Mit Foto beginnt das Wasser an der Graslinie (Wiese = Ufer), ohne Foto etwas hoeher.
  const top = photo ? groundY : groundY - 22;
  drawWaterStrip(top, H - top, PAL.river, PAL.riverHi, PAL.riverLo);
  staticLayer('river_jetty', () => {
    // Steg: Planken liegen AUF groundY (Bruno steht auf der Oberkante), Pfosten im Wasser
    ctx.fillStyle='#5a3a22'; ctx.fillRect(0,groundY,W,5);
    ctx.fillStyle='#7a5230'; ctx.fillRect(0,groundY,W,2);
    ctx.fillStyle='#3a2418';
    for (let x=6;x<W;x+=13) ctx.fillRect(x,groundY,1,5);
    for (let x=18;x<W;x+=52){ ctx.fillStyle='#3a2418'; ctx.fillRect(x,groundY+5,3,10); }
  });
  if (!photo) {                                     // Schilf nur im Platzhalter (das Foto hat eigenes Ufer)
    ctx.fillStyle='#4c7a3d';
    for (let i=0;i<12;i++){ const x=(rnd(i*3)*W)|0; const h=5+((rnd(i*9)*6)|0); ctx.fillRect(x,groundY-h,1,h); }
  }
  // Requisiten — immer: Schilder, Boote, Fischer
  for (const b of BOATS) { drawBoatSign(b.sign, b.num); if (state.boatGone !== b.num) drawBoatHull(b.x, groundY, b.phase, true); }
  drawSprite('fisher_good', loopFrame('fisher_good'), 44, groundY, 1);
  drawSprite('fisher_evil', loopFrame('fisher_evil'), 220, groundY, -1);
  hotspotMarker(70); hotspotMarker(190); drawBruno(); }

/* Ruderboot (assets/props/boat.png 72x29, tools/make_boat.py). Der nahe Bordrand
   (Sprite-Zeile BOAT_RIM) liegt BOAT_SINK px unter der Stegkante, der Rumpf
   steht im Wasser: ab BOAT_WATER px unter dem Rand wird ein halbdurchsichtiges
   Wasserband ueber den Rumpf gelegt (Wasserlinie im unteren/mittleren Rumpf).
   Bob ist ganzzahlig und ohne Neigung -> keine Sub-Pixel, kein Flackern.
   passenger(x, y): zeichnet Bruno ZWISCHEN hinterem Bootsteil und naher
   Bordwand (boat_front) — Fuesse im Rumpf, feste Position relativ zum Boot. */
const BOAT_RIM = 9, BOAT_SINK = 4, BOAT_WATER = 11;
function drawBoatHull(x, y, phase, bobOn, passenger) {
  const g = Math.round(y === undefined ? groundY : y);
  const spec = ASSET_MANIFEST.boat;
  const bob = bobOn ? Math.round(Math.sin(t * 0.045 + phase) * 1.5) : 0;
  const bx = Math.round(x), rim = g + BOAT_SINK + bob;
  const bottom = rim + (spec.h - BOAT_RIM);
  if (!drawSprite('boat', 0, bx, bottom, 1)) { drawPix('boat', bx, rim + 8, 1); if (passenger) passenger(bx - 6, rim + 3); return; }
  if (passenger) { passenger(bx - 6, rim + 3); drawSprite('boat_front', 0, bx, bottom, 1); }
  const wl = rim + BOAT_WATER, left = bx - Math.ceil(spec.w / 2);
  ctx.fillStyle = hexA(PAL.river, 0.62); ctx.fillRect(left, wl, spec.w, bottom - wl + 1);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < spec.w; i += 3) if (Math.sin((bx + i + t * 0.4) * 0.35) > 0) ctx.fillRect(left + i, wl, 2, 1);
}
/* Holzschild am Pfosten auf dem Steg: Pixelkontur, Rahmen, Brett mit Maserung
   und Schattenkante; die Nummer steht als Pixelschrift IM Schild (gleiche Ebene). */
function drawBoatSign(x, label) {
  const g = groundY;
  ctx.fillStyle = '#1b1024'; ctx.fillRect(x - 2, g - 28, 5, 23);            // Pfosten mit Kontur
  ctx.fillStyle = '#3a2418'; ctx.fillRect(x - 1, g - 27, 3, 22);
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - 1, g - 27, 1, 22);
  ctx.fillStyle = '#1b1024'; ctx.fillRect(x - 20, g - 44, 40, 18);          // Kontur
  ctx.fillStyle = '#3a2418'; ctx.fillRect(x - 19, g - 43, 38, 16);          // Rahmen
  ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x - 19, g - 28, 38, 1);           // Rahmen-Schattenkante
  ctx.fillStyle = '#8a5a2e'; ctx.fillRect(x - 17, g - 41, 34, 12);          // Brett
  ctx.fillStyle = '#a8743c'; ctx.fillRect(x - 17, g - 41, 34, 1); ctx.fillRect(x - 17, g - 41, 1, 12);   // Licht oben/links
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - 17, g - 30, 34, 1); ctx.fillRect(x + 16, g - 41, 1, 12);   // Schatten unten/rechts
  ctx.fillStyle = '#7a4e28';                                                // Maserung
  for (let i = 0; i < 5; i++) { const gx = x - 16 + ((rnd(i * 7 + x) * 28) | 0), len = 3 + ((rnd(i + x) * 5) | 0); ctx.fillRect(gx, g - 39 + i * 2, len, 1); }
  ctx.fillStyle = '#2a1810'; ctx.fillRect(x - 18, g - 35, 1, 1); ctx.fillRect(x + 17, g - 35, 1, 1);   // Naegel
  drawPixText(label, x, g - 40, '#f4e9c9', 2, 'center', '#2a1810');
}
/* Zerbrechendes Boot: das Sprite zerfaellt in drei Teile (Heck, Mitte, Bug),
   die auseinanderdriften, kippen und unter die Wasserlinie sinken.        */
function drawBoatWreck(x, y, p) {
  const img = Assets.imgs.boat, spec = ASSET_MANIFEST.boat;
  if (!img) { drawPix('boat_wreck', x, y + 8 + p * 5, 1); return; }
  const left = x - spec.w / 2, top = y + BOAT_SINK + (spec.h - BOAT_RIM) - spec.h;
  const pieces = [
    { sx: 0,  w: 26, dx: -p * 14, dy: p * 10, rot: -0.6 * p },
    { sx: 26, w: 20, dx: 0,       dy: p * 14, rot: 0.12 * p },
    { sx: 46, w: 26, dx: p * 14,  dy: p * 9,  rot: 0.55 * p }
  ];
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, y + BOAT_SINK + BOAT_WATER); ctx.clip();   // unter der Wasserlinie verschwinden
  ctx.globalAlpha = 1 - p * 0.35;
  for (const pc of pieces) {
    const cx = left + pc.sx + pc.w / 2 + pc.dx, cy = top + spec.h / 2 + pc.dy;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(pc.rot);
    ctx.drawImage(img, pc.sx, 0, pc.w, spec.h, -pc.w / 2, -spec.h / 2, pc.w, spec.h);
    ctx.restore();
  }
  ctx.restore();
}

function drawSwordScene() {
  bgOrElse('bg_sword', () => {
    staticLayer('sword_sky', () => sky());
    drawClouds();
    staticLayer('sword_scenery', () => {
      mountainsBG();
      groundStrip(undefined, undefined, 23); grassTufts(23);
      tree(22,groundY,1.1); tree(52,groundY,0.7); tree(210,groundY,0.9); tree(242,groundY,1.0);
      bush(80,groundY,0.8); bush(176,groundY,0.9);
    });
  });
  // Requisiten — immer: Altar, Lichtschein, Funken, Schwert
  staticLayer('sword_altar', () => drawAltar(128));
  const glow=0.35+Math.sin(t*0.07)*0.18;
  ctx.fillStyle=`rgba(255,232,150,${glow})`;
  ctx.beginPath(); ctx.ellipse(128,groundY-11,18,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=`rgba(255,232,150,${glow*0.5})`;
  ctx.beginPath(); ctx.ellipse(128,groundY-10,30,8,0,0,Math.PI*2); ctx.fill();
  for (let i=0;i<5;i++){
    const sy = groundY - 12 - ((t*0.6 + i*22) % 40);
    const sx = 128 + Math.sin(t*0.05+i*2)*9;
    ctx.fillStyle=`rgba(255,240,190,${(sy-groundY+52)/40*0.7})`;
    ctx.fillRect(sx,sy,1,1);
  }
  // the sword itself, standing in the altar slot, slowly turning
  // (waehrend der Aufheb-Sequenz zeichnet drawSequence() das Schwert)
  if (!state.hasSword && !sequence) {
    if (!drawSprite('sword', loopFrame('sword'), 128, groundY-10, 1)) { ctx.fillStyle=PAL.sword; ctx.fillRect(126,groundY-24,4,14); }
    hotspotMarker(128);
  }
  drawBruno(); }

// Steinaltar, in dessen Deckplatte das Schwert steckt (Pixelraster, 3 Stufen)
function drawAltar(x) {
  const g = groundY;
  ctx.fillStyle='#4a4a4a'; ctx.fillRect(x-22, g-3, 44, 3);
  ctx.fillStyle='#7a7a7a'; ctx.fillRect(x-22, g-4, 44, 1);
  ctx.fillStyle='#5a5a5a'; ctx.fillRect(x-16, g-10, 32, 7);
  ctx.fillStyle='#8a8a8a'; ctx.fillRect(x-16, g-10, 32, 1);
  ctx.fillStyle='#3a3a3a'; for (let i=0;i<4;i++) ctx.fillRect(x-12+i*8, g-8, 1, 4);   // Fugen
  ctx.fillStyle='#9a9a9a'; ctx.fillRect(x-18, g-12, 36, 2);                            // Deckplatte
  ctx.fillStyle='#b4b4b4'; ctx.fillRect(x-18, g-12, 36, 1);
  ctx.fillStyle='#1b1024'; ctx.fillRect(x-2, g-12, 4, 2);                              // Schlitz
  ctx.fillStyle='#ffd23f';                                                             // Runen
  ctx.fillRect(x-11, g-7, 2, 1); ctx.fillRect(x-10, g-6, 1, 2); ctx.fillRect(x+9, g-7, 2, 1); ctx.fillRect(x+10, g-6, 1, 2);
  ctx.fillRect(x-1, g-7, 1, 1); ctx.fillRect(x+1, g-7, 1, 1); ctx.fillRect(x, g-6, 1, 1);
}

/* Steinboden fuer die Tor-Raeume: ab groundY ueber das Foto, die Oberkante
   mit verstreuten Steinplaettchen ueber ~6 px in die Graslinie ausgeblendet. */
function stoneFloor(seed) {
  groundStrip('#4a4642', '#6b6b60', seed);
  for (let i = 0; i < 60; i++) {
    const x = (rnd(seed + i * 7.3) * W) | 0, d = 1 + ((rnd(seed + i * 3.1) * 6) | 0);   // d = Abstand ueber groundY
    ctx.fillStyle = `rgba(74,70,66,${0.85 - d * 0.13})`;
    ctx.fillRect(x, groundY - d, 2 + ((rnd(i + seed) * 3) | 0), 1);
  }
  ctx.fillStyle = 'rgba(107,107,96,0.35)'; ctx.fillRect(0, groundY - 1, W, 1);
}
function drawGateScene() {
  const photo = bgOrElse('bg_gate', () => {
    staticLayer('gate_sky', () => sky());
    drawClouds();
    staticLayer('gate_scenery', () => {
      mountainsBG();
      groundStrip('#4a4642', '#6b6b60', 11);
      bush(24, groundY, 0.9); bush(232, groundY, 0.8);
      tree(12, groundY, 0.8); tree(246, groundY, 0.7);
    });
  });
  void photo;
  // Waldboden + warmes Licht ueber Foto/Platzhalter: Moos, Laub, Farn, Pilze statt
  // Steinplatten; Lichtbahnen durchs Blattwerk; gruener Schimmer (Kontrast zum kalten Turm)
  staticLayer('gate_forest', () => {
    ctx.fillStyle = 'rgba(70,130,40,0.16)'; ctx.fillRect(0, 0, W, H);
    forestFloor(11);
    ctx.fillStyle = 'rgba(255,240,170,0.10)';
    for (const [x0, w] of [[30, 14], [84, 10], [150, 12], [204, 16]]) { ctx.beginPath(); ctx.moveTo(x0 + 30, 0); ctx.lineTo(x0 + 30 + w, 0); ctx.lineTo(x0 + w, groundY); ctx.lineTo(x0, groundY); ctx.closePath(); ctx.fill(); }
  });
  drawTreeGate();
  hotspotMarker(128); drawBruno(); }

/* ===================== Baumtor (Musterwahl) =====================
   Zwei alte Baeume, oben ineinandergewachsen (assets/props/treegate.png,
   tools/make_treegate.py), Durchgang x 108..148. Was sich bewegt, zeichnet der
   Code: Ranken im Durchgang (ziehen sich bei richtigem Muster zurueck, ziehen
   sich bei falschem rot zusammen), die vier in die Rinde geschnitzten Muster
   (das gewaehlte leuchtet gruen bzw. rot) und das geschnitzte Dreieck ueber
   dem Durchgang (Initialisierungscode). Die Logik (pickPattern) ist unveraendert;
   ohne Sprite faellt die Szene auf das alte Steintor zurueck.               */
const TREEGATE_X = 128, PASSAGE = { x0: 108, x1: 148, top: 56 };
const CARVED_COLS = [85, 101, 157, 173];        // Welt-x (Mitte) der vier Musterspalten in der Rinde
function forestFloor(seed) {
  ctx.fillStyle = '#3b2a1c'; ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = '#4a3524'; ctx.fillRect(0, groundY, W, 2);
  for (let i = 0; i < 40; i++) {                                            // Moosflecken
    const x = (rnd(i * 3.7 + seed) * W) | 0, y = groundY + 2 + ((rnd(i * 5.1 + seed) * (H - groundY - 4)) | 0), w = 4 + ((rnd(i + seed) * 10) | 0);
    ctx.fillStyle = rnd(i * 2.3) > 0.5 ? '#4f7a2e' : '#5f8f38'; ctx.fillRect(x, y, w, 2);
    ctx.fillStyle = '#70a040'; ctx.fillRect(x + 1, y, Math.max(1, w - 3), 1);
  }
  for (let i = 0; i < 30; i++) {                                            // Laub
    const x = (rnd(i * 7.3 + seed) * W) | 0, y = groundY + 1 + ((rnd(i * 9.7 + seed) * (H - groundY - 2)) | 0);
    ctx.fillStyle = ['#b8642a', '#d08a3a', '#8a4a22', '#c9a04a'][i % 4]; ctx.fillRect(x, y, 2, 1);
  }
  for (const [fx, fy] of [[18, groundY + 4], [62, groundY + 7], [196, groundY + 5], [238, groundY + 8]]) {   // Farne
    for (const ang of [-1.1, -0.55, 0, 0.55, 1.1]) {
      for (let k = 1; k < 8; k++) { ctx.fillStyle = k > 5 ? '#6aae52' : '#3f7a2e'; ctx.fillRect(Math.round(fx + Math.sin(ang) * k * 1.2), Math.round(fy - Math.cos(ang) * k), 1, 1); }
    }
  }
  for (const [mx, my, c] of [[44, groundY + 10, '#d64545'], [210, groundY + 11, '#e0b23f'], [222, groundY + 13, '#d64545']]) {   // Pilze
    ctx.fillStyle = '#f4e9c9'; ctx.fillRect(mx, my - 2, 1, 3);
    ctx.fillStyle = '#1b1024'; ctx.fillRect(mx - 2, my - 3, 5, 1);
    ctx.fillStyle = c; ctx.fillRect(mx - 2, my - 5, 5, 2); ctx.fillRect(mx - 1, my - 6, 3, 1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(mx - 1, my - 5, 1, 1); ctx.fillRect(mx + 1, my - 4, 1, 1);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(56, groundY, 144, 3);   // Wurzelschatten unter dem Tor
}
function drawTreeGate() {
  const st = sequence && sequence.steps[sequence.i];
  let openK = state.gateOpen ? 1 : 0, red = 0;
  if (st && st.key === 'gate_open') openK = Math.max(openK, Math.min(1, seqProgress(st) * 1.15));
  if (st && st.key === 'gate_reject') red = 0.5 + Math.sin(seqProgress(st) * 24) * 0.4;
  const opening = st && st.key === 'gate_open';
  if (!drawSprite('treegate', 0, TREEGATE_X, groundY + 4, 1)) { gateDraw(TREEGATE_X, groundY, openK, red); gateTorches(TREEGATE_X, groundY); return; }
  // geschnitzte Muster: Spalte i = PATTERNS[i], drei Symbole untereinander (Kerbe + Schnitzung).
  // Die Schnitzungen sind statisch -> einmal in eine Ebene gezeichnet; nur das Leuchten ist live.
  staticLayer('gate_carved', () => PATTERNS.forEach((pat, i) => pat.forEach((id, j) => {
    drawPixTint('sym_' + id, CARVED_COLS[i] + 1, 73 + j * 14, '#1b1024', 0.85);   // Kerbe (Schatten)
    drawPixTint('sym_' + id, CARVED_COLS[i], 72 + j * 14, '#d9b27a', 0.55);       // freigelegtes helles Holz
  })));
  const picked = state.pickedPattern;
  PATTERNS.forEach((pat, i) => {
    const x = CARVED_COLS[i];
    const lit = picked === i && (opening || state.gateOpen || red > 0);
    if (!lit) return;
    pat.forEach((id, j) => {
      const by = 72 + j * 14;
      if (red > 0) drawPixTint('sym_' + id, x, by, '#ff4a4a', 0.5 + red * 0.5);
      else { ctx.globalAlpha = state.gateOpen ? 0.8 + Math.sin(t * 0.1) * 0.2 : Math.min(1, openK * 1.5); drawPix('sym_' + id, x, by, 1); ctx.globalAlpha = 1; }
    });
    if (lit && red === 0) runeHalo(x, 80, '#8fd968', Math.min(1, openK * 1.2), 12);
  });
  // geschnitztes Dreieck (Initialisierungscode) auf der Rindentafel ueber dem Durchgang
  drawSymbol('triangle', TREEGATE_X, 45, 6, 'carved', red > 0 ? '#5a1a1a' : '#2a1810');
  drawVines(openK, red);
}
/* Ranken im Durchgang: sieben Straenge, abwechselnd von links/rechts, leicht
   schwingend (zeitbasiert). openK zieht sie zur eigenen Seite zurueck, bei
   falschem Muster (red) werden sie dunkelrot, flach und zittern (ziehen sich
   zusammen).                                                                */
function drawVines(openK, red) {
  const span = PASSAGE.x1 - PASSAGE.x0;
  const len = Math.round(span * (1 - openK));
  if (len <= 0) return;
  const tight = red > 0 ? 1 - red * 0.5 : 1;
  for (let i = 0; i < 7; i++) {
    const fromLeft = i % 2 === 0;
    const y0 = PASSAGE.top + 5 + i * 7;
    const col = red > 0 ? '#6b2a1a' : (i % 3 === 0 ? '#2f6b35' : '#3f7f3a');
    const lf = red > 0 ? '#a83a2a' : '#8fd968';
    for (let s = 0; s < len; s++) {
      const x = fromLeft ? PASSAGE.x0 + s : PASSAGE.x1 - 1 - s;
      const y = Math.round(y0 + Math.sin(s * 0.3 + i * 1.3 + t * 0.02) * 3 * tight + (red > 0 ? Math.sin(t * 0.6 + s) * 0.8 : 0));
      ctx.fillStyle = col; ctx.fillRect(x, y, 1, 2);
      if (s % 9 === 4) { ctx.fillStyle = lf; ctx.fillRect(x, y - 2, 2, 2); }
    }
  }
}

function drawForkScene() {
  // Foto: Hoehle links, Sumpf rechts. Platzhalter: code-gezeichnete Version davon.
  const photo = bgOrElse('bg_fork', () => {
    staticLayer('fork_sky', () => sky());
    drawClouds();
    staticLayer('fork_mid', () => {
      mountainsBG();
      groundStrip(undefined, undefined, 31); grassTufts(31);
      ctx.fillStyle='#3a2c22';
      ctx.beginPath(); ctx.moveTo(0,groundY); ctx.lineTo(0,40); ctx.lineTo(28,32); ctx.lineTo(74,groundY); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#2a2019';
      ctx.beginPath(); ctx.moveTo(6,groundY); ctx.lineTo(10,48); ctx.lineTo(30,42); ctx.lineTo(64,groundY); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#0d0908';
      ctx.beginPath(); ctx.ellipse(40,groundY,17,24,0,Math.PI,0); ctx.fill();
      ctx.strokeStyle='rgba(207,216,220,0.5)'; ctx.lineWidth=0.5;
      for (let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(24+i*6,groundY-24); ctx.lineTo(30+i*5,groundY-8); ctx.stroke(); }
      ctx.fillStyle=PAL.swampDark; ctx.fillRect(160,groundY-2,W-160,H-groundY+2);
    });
    drawWaterStrip(groundY+1,H-groundY,PAL.swamp,'#5e9a4b',PAL.swampDark);
    staticLayer('fork_front', () => {
      ctx.fillStyle='#0d1b2a'; ctx.fillRect(0,groundY+1,160,H-groundY);
      groundStrip(undefined,undefined,31);
      ctx.fillStyle=PAL.swamp; ctx.fillRect(168,groundY,W-168,H-groundY);
      ctx.fillStyle='#3f7a58'; ctx.fillRect(168,groundY,W-168,2);
      for (let i=0;i<5;i++){ ctx.fillStyle='#4c7a3d'; ctx.fillRect(180+i*15,groundY+6+((i%2)*5),6,2); }
      ctx.fillStyle=PAL.palmTrunk; ctx.fillRect(206,groundY-34,4,34); ctx.fillRect(238,groundY-26,3,26);
      ctx.fillStyle=PAL.palm;
      for (const [px_,py_,sc] of [[208,groundY-34,1],[239,groundY-26,0.75]]) {
        for (let a=0;a<5;a++){ const ang=-0.4-a*0.5; ctx.save(); ctx.translate(px_,py_); ctx.rotate(ang); ctx.fillRect(0,-1,13*sc,3); ctx.restore(); }
      }
      drawPix('skull', 58, groundY - 20, 1);
      drawPix('bones', 20, groundY + 6, 1);
      ctx.fillStyle = '#cfd8dc'; ctx.fillRect(44, groundY - 40, 1, 14);
      ctx.fillStyle = '#1b1024'; ctx.fillRect(42, groundY - 27, 5, 4); ctx.fillRect(40, groundY - 26, 9, 1);
    });
    if (pRand() < 0.06) spawnParticle(176 + pRand() * 70, groundY + 6 + pRand() * 14, { up: 12, g: -10, life: 0.8, color: ['#9fd9a0', '#ffffff'] });
  });
  // Requisiten — immer: die beiden Wegweiser (Hoehle links, Sumpf rechts)
  staticLayer('fork_signs', () => { drawPix('arrow_sign', 96, groundY, 1); drawPix('arrow_sign', 160, groundY, -1); });
  // Beschriftung als Pixelschrift im Brett (gleiche Ebene wie das Schild, Bruno laeuft davor)
  drawPixText(tr('sign.cave'), 98, groundY - 15, '#f4e9c9', 1, 'center', '#2a1810');
  drawPixText(tr('sign.swamp'), 158, groundY - 15, '#f4e9c9', 1, 'center', '#2a1810');
  void photo;
  hotspotMarker(50); hotspotMarker(206); drawBruno(); }

function drawSpiderScene() {
  bgOrElse('bg_spider', () => staticLayer('spider_scenery', () => {
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0d0a0c'); g.addColorStop(1,'#1e1712');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#2a2019'; ctx.fillRect(0,0,W,16);
    for (let i=0;i<16;i++){ const x=i*17+((rnd(i)*8)|0); const h=6+((rnd(i+7)*14)|0);
      ctx.fillStyle='#241a14'; ctx.beginPath(); ctx.moveTo(x-3,16); ctx.lineTo(x,16+h); ctx.lineTo(x+3,16); ctx.closePath(); ctx.fill(); }
    for (let i=0;i<40;i++){ const x=(rnd(i*5)*W)|0, y=20+((rnd(i*11)*70)|0);
      ctx.fillStyle=rnd(i)>0.5?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.25)'; ctx.fillRect(x,y,3,2); }
    ctx.strokeStyle='rgba(207,216,220,0.42)'; ctx.lineWidth=0.5;
    for (const cx0 of [0,W]) {
      for (let i=1;i<=5;i++){ ctx.beginPath(); ctx.moveTo(cx0,0); ctx.lineTo(cx0+(cx0?-1:1)*i*13, i*9); ctx.stroke(); }
      for (let i=1;i<=4;i++){ ctx.beginPath(); ctx.moveTo(cx0+(cx0?-1:1)*i*11,0); ctx.lineTo(cx0+(cx0?-1:1)*4, i*11); ctx.stroke(); }
    }
    ctx.fillStyle='rgba(255,170,60,0.10)';
    ctx.beginPath(); ctx.ellipse(60,groundY,26,8,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(200,groundY,26,8,0,0,Math.PI*2); ctx.fill();
    groundStrip('#241a14','#3a2c22',41);
    drawPix('bones', 96, groundY + 8, 1);
    drawPix('skull', 198, groundY + 10, -1);
    drawPix('bones', 226, groundY + 14, 1);
  }));
  // Foto: die helle Steinkante des Bodens liegt im Bild 2 px unter groundY — die Kante wird
  // auf die Bodenlinie gezogen (Zeilen 114/115 nach 112/113), damit Bruno sichtbar darauf steht
  if (Assets.has('bg_spider')) staticLayer('spider_lip', () => ctx.drawImage(Assets.imgs.bg_spider, 0, groundY + 2, W, 2, 0, groundY, W, 2));
  // Gegner — immer: Spinne am Faden, Leiche bis zur Pruefung
  const spiderBusy = sequence && sequence.steps[sequence.i] && sequence.steps[sequence.i].key.indexOf('spider') === 0;
  if (!spiderBusy && state.enemyState === 'alive') {
    const bob = Math.sin(t*0.06)*1.5;
    const breathe = 1 + Math.sin(t*0.06) * 0.02;
    ctx.strokeStyle='rgba(207,216,220,0.5)'; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.moveTo(150,0); ctx.lineTo(150,groundY-Math.round(ASSET_MANIFEST.spider_idle.h*CHAR_SCALE)+3+bob); ctx.stroke();
    ctx.save();
    ctx.translate(150, groundY + bob); ctx.scale(breathe, 1); ctx.translate(-150, -(groundY + bob));
    drawSprite('spider_idle', loopFrame('spider_idle'), 150, groundY+bob, 1);
    ctx.restore();
  } else if (!spiderBusy && state.enemyState === 'dead') {
    drawCorpse('spider_defeated', 150, 1);     // liegt da, bis der Statuswert geprueft ist
  }
  if (state.enemyState === 'alive') hotspotMarker(150, 72);
  drawBruno(); }

/* Boss-Anzeige: festes HUD oben rechts, ausserhalb von Brunos Laufbahn, ohne
   Kollision, gezeichnet nach der Welt und ohne Shake (Hook scene.hud in main.js).
   alive: Name + voller Balken. dead: Balken leer, dazu der Statuswert mit der
   Raute (Pruefcode) — das ist, was der Spieler mit dem Codeblatt vergleicht.
   verified: ausgeblendet. Das fruehere Messgeraet in der Welt ist entfernt.   */
function drawBossHud(kind) {
  if (state.enemyState === 'verified') return;
  const x0 = 150, y0 = 26, w = 100, h = 16;
  ctx.fillStyle = '#1b1e28'; ctx.fillRect(x0 - 1, y0 - 1, w + 2, h + 2);
  ctx.fillStyle = '#3a4150'; ctx.fillRect(x0, y0, w, h);
  ctx.fillStyle = '#55606f'; ctx.fillRect(x0, y0, w, 1); ctx.fillRect(x0, y0, 1, h);
  drawPixText(tr('hud.' + kind), x0 + 3, y0 + 3, '#f4e9c9', 1, 'left', '#1b1024');
  const alive = state.enemyState === 'alive';
  const bx = x0 + 3, by = y0 + 10, bw = w - 6;
  ctx.fillStyle = '#0c1018'; ctx.fillRect(bx, by, bw, 3);
  if (alive) { ctx.fillStyle = '#d64545'; ctx.fillRect(bx, by, bw, 3); ctx.fillStyle = '#f06060'; ctx.fillRect(bx, by, bw, 1); }
  else if (state.meterValue) {
    drawSymbol('diamond', x0 + w - 22, y0 + 5, 3.5, 'glow', '#6fe0ff');
    drawPixText(state.meterValue, x0 + w - 3, y0 + 3, '#9ff0ff', 1, 'right', '#0c1018');
  }
}

/* Leiche: letzter Frame der Defeated-Animation, 180 Grad um die Mitte
   gedreht (Bauch nach oben) und entsaettigt — exakt die Endlage des
   defeat-fx in drawSequence(). Kein Bob, kein Atmen. Bleibt sichtbar,
   bis der Spieler den Statuswert richtig bestaetigt hat.               */
function drawCorpse(key, x, facing) {
  const spec = ASSET_MANIFEST[key];
  if (!spec) return;
  const last = spec.frames - 1;
  const cy = groundY - spec.h * spriteScale(key) / 2;
  ctx.save();
  ctx.translate(x, cy); ctx.rotate(Math.PI * facing); ctx.translate(-x, -cy);
  if (!drawSprite(key, last, x, groundY, facing)) {
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(x - 12, groundY - 6, 24, 6);
  }
  drawSpriteTinted(key, last, x, groundY, facing, '#55505a', 0.55);
  ctx.restore();
}

function drawCrocScene() {
  const photo = bgOrElse('bg_croc', () => {
    staticLayer('croc_sky', () => sky('#8fc99b','#d9f0dd'));
    drawClouds();
    staticLayer('croc_mid', () => {
      ctx.fillStyle='#3f6b52'; ctx.fillRect(0,52,W,groundY-52);
      ctx.fillStyle='#2f5240';
      for (let i=0;i<22;i++){ const x=i*12+((rnd(i)*6)|0); const h=10+((rnd(i+3)*16)|0);
        ctx.beginPath(); ctx.moveTo(x-5,60); ctx.lineTo(x,60-h); ctx.lineTo(x+5,60); ctx.closePath(); ctx.fill(); }
      ctx.strokeStyle='#2f6b35'; ctx.lineWidth=1;
      for (let i=0;i<7;i++){ const x=14+i*36; ctx.beginPath(); ctx.moveTo(x,52);
        ctx.quadraticCurveTo(x+5,70,x-2,86); ctx.stroke(); }
    });
    drawWaterStrip(groundY-14,H-groundY+14,PAL.swamp,'#5e9a4b',PAL.swampDark);
    staticLayer('croc_front', () => {
      ctx.fillStyle='#4a4030'; ctx.fillRect(0,groundY,W,H-groundY);
      ctx.fillStyle='#5c5140'; ctx.fillRect(0,groundY,W,3);
      for (const [lx,ly,ls] of [[36,groundY-9,1],[92,groundY-5,0.8],[214,groundY-11,0.9],[248,groundY-4,0.7]]) {
        ctx.fillStyle='#3f7a3d'; ctx.beginPath(); ctx.ellipse(lx,ly,7*ls,3*ls,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#4c9a4b'; ctx.beginPath(); ctx.ellipse(lx-1,ly-1,5*ls,2*ls,0,0,Math.PI*2); ctx.fill();
      }
      ctx.fillStyle='#6b4226'; ctx.fillRect(22,groundY-46,4,46); ctx.fillRect(232,groundY-38,4,38);
      ctx.fillStyle=PAL.palm;
      for (const [px_,py_,sc] of [[24,groundY-46,1],[234,groundY-38,0.8]]) {
        for (let a=0;a<6;a++){ const ang=-0.35-a*0.42; ctx.save(); ctx.translate(px_,py_); ctx.rotate(ang); ctx.fillRect(0,-1,16*sc,3); ctx.restore(); }
      }
      ctx.fillStyle='#3f6b3d';
      for (let i=0;i<16;i++){ const x=(rnd(i*17)*W)|0; const h=6+((rnd(i*23)*8)|0); ctx.fillRect(x,groundY-h,1,h); }
    });
    if (pRand() < 0.05) spawnParticle(20 + pRand() * 216, groundY - 12 + pRand() * 6, { up: 10, g: -8, life: 0.7, color: ['#9fd9a0', '#ffffff'] });
  });
  void photo;
  // Gegner — immer
  const crocBusy = sequence && sequence.steps[sequence.i] && sequence.steps[sequence.i].key.indexOf('croc') === 0;
  if (!crocBusy && state.enemyState === 'alive') {
    const bob = Math.sin(t*0.05)*1.5;
    const breathe = 1 + Math.sin(t*0.05) * 0.02;
    ctx.save();
    ctx.translate(150, groundY + bob); ctx.scale(breathe, 1); ctx.translate(-150, -(groundY + bob));
    // Sheet schaut nach links — also Bruno entgegen, nicht spiegeln
    drawSprite('croc_idle', loopFrame('croc_idle'), 150, groundY+bob, 1);
    ctx.restore();
  } else if (!crocBusy && state.enemyState === 'dead') {
    drawCorpse('croc_defeated', 150, 1);
  }
  if (state.enemyState === 'alive') hotspotMarker(150, 72);
  drawBruno(); }

/* ===================== Bestaetigungstor = Runenturm =====================
   Das Sprite (assets/props/tower.png, 160x126) liefert nur das Mauerwerk und
   sitzt unten-mittig auf groundY+2 -> Sprite-Origin (48, -12); der Rundbogen
   liegt in Weltkoordinaten bei x 114..142, Scheitel y 68, Schwelle groundY.
   Alles, was leuchtet oder sich bewegt, zeichnet der Code: Runen (Bogen,
   Wand, Bodenplatten, Konsole) mit eigenem, langsamem Puls, das Holztor mit
   Eisenbaendern, der violette Schein auf Mauer und Boden. Die Sequenzen
   'gate_open' / 'gate_reject' (Story unveraendert) steuern Kaskade, Tor und
   Rotflackern.                                                              */
const TOWER_X = 128, TOWER_OX = TOWER_X - 80, TOWER_OY = groundY + 2 - 126;
const ARCH = { x0: TOWER_OX + 66, x1: TOWER_OX + 94, top: TOWER_OY + 80, r: 14, cx: TOWER_X, cy: TOWER_OY + 94 };
const RUNE_GLYPHS = [
  ['#.#','##.','#.#','#..','#..'], ['###','#..','##.','#..','###'], ['.#.','#.#','###','#.#','#.#'], ['##.','#.#','##.','#.#','#.#'],
  ['#.#','###','#.#','#.#','#.#'], ['###','.#.','.#.','.#.','###'], ['#..','#..','#..','#..','###'], ['#.#','.#.','#.#','.#.','#.#'],
  ['###','#.#','#.#','#.#','###'], ['.#.','###','.#.','.#.','.#.'], ['#.#','#.#','###','..#','..#'], ['##.','#.#','##.','#..','#..'],
  ['#..','##.','#.#','##.','#..'], ['###','..#','.#.','#..','###'], ['#.#','#.#','#.#','###','.#.']
];
// Runenliste: Bogen (9, im Uhrzeigersinn von links unten), Wand (4), Bodenplatten (2)
const TOWER_RUNES = (() => {
  const list = [];
  for (let i = 0; i < 9; i++) {
    const ang = Math.PI + Math.PI * i / 8;
    list.push({ x: Math.round(ARCH.cx + Math.cos(ang) * (ARCH.r + 4)), y: Math.round(ARCH.cy + Math.sin(ang) * (ARCH.r + 4)), kind: 'arch', i });
  }
  for (const [x, y] of [[92, 30], [164, 48], [88, 98], [168, 102]]) list.push({ x, y, kind: 'wall', i: list.length });
  for (const [x, y] of [[65, 108], [192, 107]]) list.push({ x, y, kind: 'slab', i: list.length });
  return list.map((r, i) => ({ ...r, glyph: RUNE_GLYPHS[i % RUNE_GLYPHS.length], cyan: i % 3 === 1, sp1: 0.022 + 0.011 * (i % 4), sp2: 0.057 + 0.009 * (i % 3), ph: i * 1.7 }));
})();
function runeGlyph(x, y, color, alpha, glyph) {
  ctx.globalAlpha = alpha; ctx.fillStyle = color;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (glyph[r][c] === '#') ctx.fillRect(x - 1 + c, y - 2 + r, 1, 1);
  ctx.globalAlpha = 1;
}
function runeHalo(x, y, color, alpha, rad) {
  ctx.fillStyle = hexA(color, alpha * 0.28); ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = hexA(color, alpha * 0.18); ctx.beginPath(); ctx.arc(x, y, rad * 1.8, 0, Math.PI * 2); ctx.fill();
}
/* ===================== Galaxy-Portal im Turmbogen =====================
   Statt des Holztors: ein animiertes Pixel-Portal im Rundbogen. Pro Frame
   werden die 28x44 Bogen-Pixel direkt berechnet (drei Spiralarme, dunkles
   tiefes Zentrum, heller Rand, Magenta-Funken) und auf eine feste Palette
   (Dunkelblau, Blau, Violett, Tuerkis, Cyan, Magenta, Weiss) gerastert —
   keine Verlaeufe, keine Unschaerfe. Zeit = t (dt-basiert, bildratenunabhaengig),
   alles ueber sin/cos -> nahtloser Loop. openK hellt auf und beschleunigt
   (richtiger Code), red faerbt rot (falscher Code). Acht Partikel laufen auf
   ganzzahligen Pixeln am Rand entlang.                                       */
const PORTAL_W = ARCH.x1 - ARCH.x0, PORTAL_H = groundY - ARCH.top;
const portalCanvas = document.createElement('canvas'); portalCanvas.width = PORTAL_W; portalCanvas.height = PORTAL_H;
const portalCtx = portalCanvas.getContext('2d');
const portalImg = portalCtx.createImageData(PORTAL_W, PORTAL_H);
const PORTAL_PAL = [[10, 12, 42], [24, 40, 110], [78, 52, 160], [36, 140, 170], [90, 220, 225], [205, 70, 200], [235, 250, 255]];
function drawPortal(openK, red) {
  const d = portalImg.data, cx = PORTAL_W / 2, cy = PORTAL_H / 2;
  const time = t * (0.012 + 0.03 * openK);
  const bright = 0.45 + 0.55 * openK;
  for (let y = 0; y < PORTAL_H; y++) for (let x = 0; x < PORTAL_W; x++) {
    const i = (y * PORTAL_W + x) * 4;
    const dx = (x + 0.5 - cx) / cx, dy = (y + 0.5 - cy) / cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    if (r > 1) { d[i + 3] = 0; continue; }
    const a = Math.atan2(dy, dx);
    const arm = Math.sin(a * 3 + r * 10 - time * 6);               // drei Spiralarme, drehen langsam
    const v = (arm * 0.5 + 0.5) * (0.25 + 0.75 * r);               // Mitte dunkel, aussen heller
    let idx = v < 0.22 ? 0 : v < 0.45 ? 1 : v < 0.62 ? 2 : v < 0.8 ? 3 : 4;
    if (arm > 0.93 && r > 0.35 && r < 0.85) idx = 5;               // Magenta-Funken in den Armen
    if (r > 0.9) idx = 4;
    if (r > 0.96) idx = 6;                                         // heller Rand
    if (r < 0.12) idx = 0;                                         // tiefes Zentrum
    let R = PORTAL_PAL[idx][0] * bright, G = PORTAL_PAL[idx][1] * bright, B = PORTAL_PAL[idx][2] * bright;
    if (red > 0) { R += (200 - R) * red; G *= 1 - red * 0.7; B *= 1 - red * 0.7; }
    d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = 255;
  }
  portalCtx.putImageData(portalImg, 0, 0);
  ctx.save();
  ctx.beginPath(); ctx.rect(ARCH.x0, ARCH.top + ARCH.r, PORTAL_W, groundY - ARCH.top - ARCH.r); ctx.arc(ARCH.cx, ARCH.top + ARCH.r, ARCH.r, Math.PI, 0); ctx.clip();
  ctx.fillStyle = '#07081a'; ctx.fillRect(ARCH.x0, ARCH.top, PORTAL_W, PORTAL_H);
  ctx.drawImage(portalCanvas, ARCH.x0, ARCH.top);
  for (let k = 0; k < 8; k++) {
    const ang = time * 2.2 + k * Math.PI / 4, rr = 0.93 + Math.sin(time * 5 + k) * 0.04;
    const px = Math.round(ARCH.cx + Math.cos(ang) * cx * rr), py = Math.round(ARCH.top + cy + Math.sin(ang) * cy * rr);
    ctx.fillStyle = k % 3 === 0 ? '#ff8ae8' : '#cffcff'; ctx.fillRect(px, py, 1, 1);
  }
  ctx.restore();
}
// Runenkonsole (Steintafel) links vom Eingang — leuchtet auf, wenn Bruno davorsteht
function towerConsole(near, red) {
  const x = 102, y = groundY;
  ctx.fillStyle = '#1b1e28'; ctx.fillRect(x - 7, y - 24, 14, 24);
  ctx.fillStyle = '#5b6472'; ctx.fillRect(x - 6, y - 23, 12, 22);
  ctx.fillStyle = '#6c7584'; ctx.fillRect(x - 6, y - 23, 12, 1); ctx.fillStyle = '#4a5261'; ctx.fillRect(x - 6, y - 2, 12, 1);
  ctx.fillStyle = '#2b2f3a'; ctx.fillRect(x - 4, y - 21, 8, 16);
  const k = near ? 0.75 + Math.sin(t * 0.2) * 0.25 : 0.18 + Math.sin(t * 0.03) * 0.06;
  const col = red > 0 ? '#ff4a4a' : '#6fe0ff';
  // eingemeisseltes Fuenfeck (Bestaetigungscode), leuchtet wenn Bruno davor steht
  drawSymbol('pentagon', x, y - 15, 4.2, 'carved', '#14161e');
  ctx.globalAlpha = Math.min(1, k + (red > 0 ? red * 0.5 : 0));
  drawSymbol('pentagon', x, y - 15, 3.2, 'glow', col);
  ctx.globalAlpha = 1;
  runeGlyph(x, y - 6, col, Math.min(1, k + (red > 0 ? red * 0.5 : 0)), RUNE_GLYPHS[6]);
  if (near || red > 0) runeHalo(x, y - 13, col, k, 9);
}
/* ===================== Burgtor im Turm (Eingang) =====================
   Klassischer Burgeingang in reiner Seitenansicht um den Turmbogen: kraeftige
   Pfeiler aus grossen blaugrauen Quadern, Rundbogen aus Keilsteinen mit
   Schlussstein, dunkle Fugen, Risse und verwitterte Kanten (statisch, einmal in
   eine Ebene gerastert, Pixel fuer Pixel). Darin das dunkle doppelfluegelige
   Holztor mit Eisenbaendern, Scharnieren, Nieten und Mittelspalt: linker
   Fluegel geht nach links, rechter nach rechts auf — gleicher Fortschritt
   openK, ganzzahlige Breiten, nichts wird skaliert. Dahinter der dunkle
   Durchgang mit dem Galaxy-Portal. Die neun Bogenrunen (TOWER_RUNES 'arch')
   liegen in den Keilsteinen und leuchten wie bisher (violett/cyan).
   Logik, Codeeingabe und Uebergang (gate_open -> doorWalk) unveraendert.      */
const GATE_PIER = 10, GATE_RING = 9;
function castleStone() {
  const x0 = ARCH.x0, x1 = ARCH.x1, cx = ARCH.cx, cy = ARCH.top + ARCH.r, r = ARCH.r;
  const base = '#6b7686', light = '#8793a3', dark = '#4b5563', mortar = '#262c36', crack = '#3a4150';
  // Pfeiler: grosse Quader, Reihen versetzt, Licht oben/links, Schatten unten/rechts
  const pier = (px) => {
    ctx.fillStyle = mortar; ctx.fillRect(px, cy - 2, GATE_PIER, groundY + 2 - (cy - 2));
    let row = 0;
    for (let y = cy - 2; y < groundY + 2; y += 7, row++) {
      const h = Math.min(6, groundY + 2 - y - 1);
      const split = row % 2 ? 4 : 6;
      for (const [bx, bw] of [[px, split], [px + split + 1, GATE_PIER - split - 1]]) {
        ctx.fillStyle = base; ctx.fillRect(bx, y, bw, h);
        ctx.fillStyle = light; ctx.fillRect(bx, y, bw, 1); ctx.fillRect(bx, y, 1, h);
        ctx.fillStyle = dark; ctx.fillRect(bx, y + h - 1, bw, 1); ctx.fillRect(bx + bw - 1, y, 1, h);
      }
    }
  };
  pier(x0 - GATE_PIER); pier(x1);
  // Bogenring aus Keilsteinen: Pixel fuer Pixel (Radius r..r+GATE_RING, 9 Keile, Fugen dazwischen)
  for (let y = cy - r - GATE_RING - 3; y <= cy; y++) for (let x = cx - r - GATE_RING - 1; x <= cx + r + GATE_RING + 1; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.sqrt(dx * dx + dy * dy);
    if (dy > 0 || d < r || d > r + GATE_RING) continue;
    const a = Math.atan2(-dy, dx) / Math.PI;               // 0 rechts .. 1 links
    const seg = a * 9, k = seg - Math.floor(seg);
    let col = base;
    if (k < 0.09 || k > 0.91 || d < r + 1 || d > r + GATE_RING - 1) col = mortar;
    else if (d < r + 2.2 || k < 0.2) col = light;
    else if (d > r + GATE_RING - 2.2 || k > 0.8) col = dark;
    if (((x * 31 + y * 17) % 23) === 0 && col === base) col = crack;   // Verwitterung
    ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1);
  }
  // Schlussstein: ragt 3 px ueber den Ring
  ctx.fillStyle = mortar; ctx.fillRect(cx - 5, cy - r - GATE_RING - 3, 10, 6);
  ctx.fillStyle = light; ctx.fillRect(cx - 4, cy - r - GATE_RING - 2, 8, 4);
  ctx.fillStyle = base; ctx.fillRect(cx - 3, cy - r - GATE_RING - 1, 6, 3);
  // Risse
  ctx.fillStyle = crack;
  for (const [sx, sy, n] of [[x0 - 7, cy + 10, 5], [x1 + 4, cy + 22, 6], [cx - 9, cy - r - 5, 4]]) for (let i = 0; i < n; i++) ctx.fillRect(sx + (i % 2), sy + i, 1, 1);
  // Schwelle + Schatten unter dem Bogen
  ctx.fillStyle = dark; ctx.fillRect(x0 - 3, groundY, x1 - x0 + 6, 2); ctx.fillStyle = mortar; ctx.fillRect(x0 - 3, groundY + 2, x1 - x0 + 6, 1);
}
function castleDoors(openK, red) {
  const x0 = ARCH.x0, x1 = ARCH.x1, top = ARCH.top, base = groundY;
  const half = (x1 - x0) / 2, lw = Math.round(half * (1 - openK));
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, top + ARCH.r, x1 - x0, base - top - ARCH.r); ctx.arc(ARCH.cx, top + ARCH.r, ARCH.r, Math.PI, 0); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x0, top, x1 - x0, 5);           // Schatten unter dem Bogen
  if (lw > 0) {
    const leaf = (lx, dir) => {
      ctx.fillStyle = '#1b1024'; ctx.fillRect(lx, top, lw, base - top);
      ctx.fillStyle = '#3a2416'; ctx.fillRect(lx + (dir > 0 ? 1 : 0), top + 1, Math.max(0, lw - 1), base - top - 1);
      ctx.fillStyle = '#2a1810'; for (let px = 3; px < lw - 1; px += 4) ctx.fillRect(lx + px, top, 1, base - top);     // Planken
      ctx.fillStyle = '#4a3020'; for (let px = 1; px < lw - 1; px += 4) ctx.fillRect(lx + px, top + 1, 1, base - top - 1);
      for (const py of [top + 13, top + 25, top + 37]) {                                                               // Eisenbaender
        ctx.fillStyle = '#2f2f36'; ctx.fillRect(lx, py, lw, 3); ctx.fillStyle = '#55555e'; ctx.fillRect(lx, py, lw, 1);
        ctx.fillStyle = '#8a8a96'; for (let px = 2; px < lw - 1; px += 4) ctx.fillRect(lx + px, py + 1, 1, 1);           // Nieten
        const hx = dir > 0 ? lx : lx + lw - 2;                                                                         // Scharnier aussen
        ctx.fillStyle = '#1b1e28'; ctx.fillRect(hx, py - 1, 2, 5); ctx.fillStyle = '#6a6a78'; ctx.fillRect(hx, py, 2, 3);
      }
      if (lw > 5) { const rx = dir > 0 ? lx + lw - 4 : lx + 2; ctx.fillStyle = '#8a8a96'; ctx.fillRect(rx, base - 22, 2, 3); ctx.fillStyle = '#1b1e28'; ctx.fillRect(rx, base - 21, 2, 1); }   // Ring
    };
    leaf(x0, 1); leaf(x1 - lw, -1);
    if (openK < 0.02) { ctx.fillStyle = '#0c0a12'; ctx.fillRect(ARCH.cx - 1, top + 1, 1, base - top - 1); }         // Spalt
    if (red > 0) { ctx.fillStyle = `rgba(255,60,60,${0.18 * red})`; ctx.fillRect(x0, top, x1 - x0, base - top); }
  }
  ctx.restore();
}
function drawCastleGate(openK, red) {
  drawPortal(openK, red);                  // dunkler Durchgang mit Portal — hinter den Fluegeln
  castleDoors(openK, red);
  staticLayer('castle_stone', castleStone);
}
/* Steintafel ueber dem Turmbogen mit grossem eingemeisseltem Fuenfeck */
function towerPlaque(red) {
  const cx = ARCH.cx, cy = ARCH.top - 26;
  ctx.fillStyle = '#1b1e28'; ctx.fillRect(cx - 13, cy - 11, 26, 22);
  ctx.fillStyle = '#6c7584'; ctx.fillRect(cx - 12, cy - 10, 24, 20);
  ctx.fillStyle = '#5b6472'; ctx.fillRect(cx - 11, cy - 9, 22, 18);
  ctx.fillStyle = '#4a5261'; ctx.fillRect(cx - 11, cy + 8, 22, 1); ctx.fillRect(cx + 10, cy - 9, 1, 18);
  drawSymbol('pentagon', cx, cy + 0.5, 8, 'carved', red > 0 ? '#4a1616' : '#1c1e26');
}
function drawConfirmGateScene() {
  const photo = bgOrElse('bg_confirmgate', () => {
    staticLayer('confirm_sky', () => sky('#7ea9c9','#c8e2f0'));
    drawClouds();
    staticLayer('confirm_scenery', () => {
      mountainsBG();
      groundStrip('#4a4642', '#6b6b60', 17);
      bush(30, groundY, 0.8); bush(226, groundY, 0.9);
    });
  });
  if (photo) staticLayer('confirm_floor', () => stoneFloor(17));
  // Nacht: dunkelblaue Daemmerung ueber Foto/Platzhalter + Sterne
  staticLayer('confirm_night', () => {
    ctx.fillStyle = 'rgba(8,6,30,0.74)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(90,70,140,0.25)'; ctx.fillRect(0, groundY, W, H - groundY);
    for (let i = 0; i < 40; i++) { const x = (rnd(i * 5.3) * W) | 0, y = (rnd(i * 9.1) * 60) | 0; ctx.fillStyle = `rgba(255,255,255,${0.3 + rnd(i) * 0.5})`; ctx.fillRect(x, y, 1, 1); }
  });
  // Zustand aus Sequenz/State
  const st = sequence && sequence.steps[sequence.i];
  const p = st ? seqProgress(st) : 0;
  const opening = st && st.key === 'gate_open', rejecting = st && st.key === 'gate_reject';
  let openK = state.gateOpen ? 1 : 0, red = 0;
  if (opening) openK = Math.max(openK, Math.min(1, (p - 0.45) / 0.5));
  if (rejecting) red = p < 0.7 ? 0.55 + 0.45 * Math.sin(p * 46) : Math.max(0, (1 - p) / 0.3);
  // falscher Bestaetigungscode: die Story loest nur den roten Schadensblitz aus —
  // der Turm reagiert darauf: Runen rot, kurzes Flackern, dann erloeschen
  const dmgK = damage.t / CONFIG.damageTime;                 // 1 -> 0
  if (!st && dmgK > 0 && !state.gateOpen) red = dmgK > 0.3 ? 0.55 + 0.45 * Math.sin((1 - dmgK) * 46) : dmgK / 0.3;
  const rejectingNow = rejecting || red > 0;
  // Gesamtleuchten (fuer den Schein auf Boden und Mauer)
  let glowSum = 0;
  const runeAlpha = (r) => {
    if (rejectingNow) return 0.4 + 0.6 * red;
    if (state.gateOpen) return 0.9 + Math.sin(t * 0.1 + r.ph) * 0.1;
    const base = 0.42 + 0.25 * Math.sin(t * r.sp1 + r.ph) + 0.18 * Math.sin(t * r.sp2 + r.ph * 2);
    if (opening && r.kind === 'arch') return p * 1.5 > r.i / 9 ? 1 : base * 0.4;     // Kaskade von links nach rechts
    return Math.max(0.15, base);
  };
  // Schein auf dem Boden vor dem Turm
  for (const r of TOWER_RUNES) glowSum += runeAlpha(r);
  const gl = glowSum / TOWER_RUNES.length;
  ctx.fillStyle = rejectingNow ? `rgba(255,60,60,${0.14 * red})` : `rgba(150,90,255,${0.10 + 0.14 * gl})`;
  ctx.beginPath(); ctx.ellipse(TOWER_X, groundY + 2, 70, 10, 0, 0, Math.PI * 2); ctx.fill();
  // Turm-Mauerwerk (Sprite) — faellt ohne Datei auf einen Steinblock zurueck
  if (!drawSprite('tower', 0, TOWER_X, groundY + 2, 1)) { ctx.fillStyle = '#5b6472'; ctx.fillRect(TOWER_OX + 30, -10, 100, groundY + 12); }
  // violetter Schimmer auf dem Mauerwerk um den Bogen
  ctx.fillStyle = rejectingNow ? `rgba(255,60,60,${0.12 * red})` : `rgba(160,100,255,${0.06 + 0.10 * gl})`;
  ctx.beginPath(); ctx.arc(ARCH.cx, ARCH.cy, 34, 0, Math.PI * 2); ctx.fill();
  // Fenster: schwaches, flackerndes Licht dahinter
  for (const [wx, wy, ph] of [[TOWER_OX + 58, TOWER_OY + 18, 0], [TOWER_OX + 98, TOWER_OY + 54, 2]]) {
    ctx.fillStyle = `rgba(170,140,240,${0.25 + Math.sin(t * 0.07 + ph) * 0.08 + Math.sin(t * 0.23 + ph) * 0.05})`; ctx.fillRect(wx - 1, wy, 4, 11);
  }
  // Burgtor (Steinbogen, Holzfluegel, dahinter das Portal) + Tafel + Konsole
  drawCastleGate(openK, red);
  towerPlaque(red);
  const near = Math.abs(brunoX - TOWER_X) < CONFIG.interactRange && ui.mode === null;
  towerConsole(near || opening || ui.mode === 'panel', red);
  // Runen: Halo zuerst, dann Glyphen (langsam, unregelmaessig pulsierend)
  for (const r of TOWER_RUNES) {
    const a = runeAlpha(r);
    const col = rejectingNow ? '#ff4a4a' : (r.cyan ? '#6fe0ff' : '#b57cff');
    runeHalo(r.x, r.y, col, a, r.kind === 'slab' ? 7 : 5);
    runeGlyph(r.x, r.y, col, Math.min(1, a), r.glyph);
  }
  hotspotMarker(128); drawBruno(); }

function drawStarsScene() {
  // Foto: Sternenhimmel mit zwei Saeulen (x~25 / x~228); die vier Sterne (74..188) liegen dazwischen
  bgOrElse('bg_stars', () => {
    staticLayer('stars_sky', () => {
      const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0a1226'); g.addColorStop(1,'#1c2b4a');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    });
    for (let i=0;i<70;i++){
      const x=(rnd(i*3.1)*W)|0, y=(rnd(i*7.7)*90)|0;
      const tw=0.35+Math.abs(Math.sin(t*0.04+i))*0.6;
      ctx.fillStyle=`rgba(255,255,255,${tw})`; ctx.fillRect(x,y,1,1);
    }
    staticLayer('stars_front', () => {
      ctx.fillStyle='#2a2a33'; ctx.fillRect(0,0,16,H); ctx.fillRect(W-16,0,16,H);
      ctx.fillStyle='#3a3a45';
      for (let y=0;y<H;y+=9){ ctx.fillRect(0,y,16,1); ctx.fillRect(W-16,y,16,1); }
      ctx.fillStyle='#4a4a55'; ctx.fillRect(40,26,8,groundY-26); ctx.fillRect(208,26,8,groundY-26);
      ctx.fillStyle='#5d5d69'; ctx.fillRect(40,26,3,groundY-26); ctx.fillRect(208,26,3,groundY-26);
      ctx.fillStyle='#33333d'; ctx.fillRect(37,22,14,5); ctx.fillRect(205,22,14,5);
      groundStrip('#33333d','#4a4a55',53);
    });
  });
// Raum hellt sich auf, je naeher Bruno der Wahl kommt
const nearK = 1 - Math.min(1, Math.abs(brunoX - 128) / 100);
STARS.forEach((s_,i)=>{
  if (state.starTaken === i && (state.starCollected || s_.id !== CODEBLATT.finalStar)) return;   // eingesammelt / zerbrochen
  const bob=Math.sin(t*0.06+i*1.4)*4, cy=STAR_Y+bob;
  const pulse = 1 + Math.sin(t*0.12 + i*1.7) * 0.12;
  // richtiger Stern waehrend des Sprungs: kurz heller, beim Erreichen in Pixelpartikel aufloesen
  const jst = sequence && sequence.steps[sequence.i];
  if (state.starTaken === i && jst && jst.fx === 'jump') {
    const p = seqProgress(jst);
    if (p >= 0.5 && !state.starCollected) {
      state.starCollected = true; state.starCollectT = t;
      burst(s_.x, cy, 26, { spread: 70, up: 50, g: 40, life: 0.6, color: [s_.c, '#ffffff', s_.c], size: 2 });
      Sfx.play('star');
    }
    if (!state.starCollected) { drawPix('star', s_.x, Math.round(cy) + 6, 1, { ch:'s', color:s_.c }); drawPixTint('star', s_.x, Math.round(cy) + 6, '#ffffff', Math.min(0.8, p * 1.6)); }
    return;
  }
  // farbiger Lichtschein auf dem Boden
  ctx.fillStyle = hexA(s_.c, 0.10 + 0.12*nearK + Math.sin(t*0.12+i*1.7)*0.03);
  ctx.beginPath(); ctx.ellipse(s_.x, groundY+1, 22, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = hexA(s_.c, 0.05 + 0.05*nearK);
  ctx.beginPath(); ctx.moveTo(s_.x-5, cy); ctx.lineTo(s_.x-24, groundY); ctx.lineTo(s_.x+24, groundY); ctx.lineTo(s_.x+5, cy); ctx.closePath(); ctx.fill();
  // Halo
  ctx.fillStyle = hexA(s_.c, 0.16*pulse); ctx.beginPath(); ctx.arc(s_.x, cy, 13*pulse, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(s_.x,cy,11,0,Math.PI*2); ctx.fill();
  // Ringe drehen, jeder Stern mit eigenem Tempo und Drehsinn
  ctx.strokeStyle=s_.c; ctx.lineWidth=1;
  for (let r=0;r<s_.rings;r++){
    ctx.globalAlpha=0.75;
    ctx.beginPath(); ctx.ellipse(s_.x,cy,9+r*3,3.5+r*1.2, t*s_.speed*(r%2?-1.3:1)+i, 0, Math.PI*2); ctx.stroke();
  }
  ctx.globalAlpha=1;
  drawPix('star', s_.x, Math.round(cy) + 6, 1, { ch:'s', color:s_.c });
});
if (nearK > 0) { ctx.fillStyle = `rgba(255,236,180,${0.16*nearK})`; ctx.fillRect(0,0,W,H); }
// der gewonnene Stern schwebt ueber Bruno (nach der Sequenz, vor dem Abgang)
// Lichtimpuls beim Einsammeln: ein Ring aus Pixeln, der 0.3 s lang waechst (ganzzahlig)
if (state.starCollected && state.starCollectT >= 0 && t - state.starCollectT < 18) {
  const k = (t - state.starCollectT) / 18, st_ = STARS[state.starTaken], r = Math.round(4 + k * 14);
  ctx.fillStyle = hexA(st_.c, 1 - k);
  for (let a = 0; a < 16; a++) ctx.fillRect(Math.round(st_.x + Math.cos(a * Math.PI / 8) * r), Math.round(STAR_Y + Math.sin(a * Math.PI / 8) * r), 1, 1);
}
// der eingesammelte Stern schwebt ueber Bruno (nach der Landung, bis zum Abgang)
if (state.starCollected && !sequence && !state.brunoHidden) drawWonStar(brunoX, groundY - Math.round(40 * CHAR_SCALE) + Math.sin(t*0.05)*3, 0.6, STARS[state.starTaken].c);
drawStarMedallion(40);
hotspotMarker(40); drawBruno(); }

// Fuenfzackiger Stern (gleiche Form wie das Finalisierungs-Symbol), scale 1 = 14 px
function drawStarShape(x, y, color, sc) {
  sc = sc || 1;
  drawSymbol('star', x, y + 0.6 * sc, 7 * sc, 'flat', color);
  ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.fillRect(x-1, y-2*sc, 2, 2);
}
// Bodenmedaillon mit eingemeisseltem Stern vor der Sternwahl
function drawStarMedallion(x) {
  ctx.fillStyle = '#2a2a33'; ctx.beginPath(); ctx.ellipse(x, groundY + 7, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a4a55'; ctx.beginPath(); ctx.ellipse(x, groundY + 6, 15, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(x, groundY + 6); ctx.scale(1, 0.55);
  drawSymbol('star', 0, 0.5, 9, 'carved', '#1a1a22');
  ctx.restore();
}
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`; }
function mixHex(h1, h2, k) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const ch = (sh) => Math.round(((a>>sh)&255) * (1-k) + ((b>>sh)&255) * k);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
function rays(x, y, n, len, color, rot) {
  ctx.strokeStyle = color; ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const a = rot + i * Math.PI * 2 / n;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a)*4, y + Math.sin(a)*4); ctx.lineTo(x + Math.cos(a)*len, y + Math.sin(a)*len); ctx.stroke();
  }
}
// gewonnener Stern (Farbe + Ringe des gezogenen Sterns) + Strahlenkranz, k = Leuchtstaerke 0..1
function drawWonStar(x, y, k, color) {
  const st = starById(typeof CODEBLATT !== 'undefined' ? CODEBLATT.finalStar : 'gold');
  const c = color || st.c;
  rays(x, y, 10, 16 + k*26, `rgba(255,240,190,${0.35*k})`, t*0.015);
  ctx.fillStyle = hexA(c, 0.18 + 0.2*k); ctx.beginPath(); ctx.arc(x,y,12+k*8,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=c; ctx.lineWidth=1;
  for (let r=0;r<Math.max(1, st.rings);r++){ ctx.beginPath(); ctx.ellipse(x,y,8+r*3,3+r,t*0.04*(r%2?-1:1),0,Math.PI*2); ctx.stroke(); }
  drawPix('star', Math.round(x), Math.round(y) + 6, 1, { ch:'s', color:c });
}
function drawEndScene() {
  // Foto: alpen.png wie Level 1, aber mit warmem Abendlicht (Verlauf + Sonne) als Sieges-Stimmung
  const photo = bgOrElse('bg_end', () => {
    staticLayer('end_sky', () => {
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#f6b26b'); g.addColorStop(0.45,'#ffd9a0'); g.addColorStop(1,'#fff0d4');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#ffe066'; ctx.beginPath(); ctx.arc(214,30,15,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,224,102,0.25)'; ctx.beginPath(); ctx.arc(214,30,24,0,Math.PI*2); ctx.fill();
    });
    drawClouds();
    staticLayer('end_mid', () => mountainsBG());
    drawWaterStrip(groundY-10,10,'#3d7f96','#6fb0c4','#2c5f74');
    staticLayer('end_front', () => {
      groundStrip('#4a7a35','#6fbf4a',61); grassTufts(61);
      tree(20,groundY,1.0); tree(48,groundY,0.7); tree(216,groundY,0.9); tree(244,groundY,1.1);
      bush(84,groundY,0.9); bush(170,groundY,0.8);
      for (let i=0;i<10;i++){ const x=(rnd(i*29)*W)|0;
        ctx.fillStyle=['#ffd23f','#f2789f','#ffffff'][i%3]; ctx.fillRect(x,groundY-4,1,1); }
    });
  });
  if (photo) staticLayer('end_sunset', () => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(255,120,40,0.42)'); g.addColorStop(0.5, 'rgba(255,190,80,0.26)'); g.addColorStop(1, 'rgba(255,220,140,0.12)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,224,102,0.30)'; ctx.beginPath(); ctx.arc(214, 30, 24, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(214, 30, 13, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(211, 27, 5, 0, Math.PI*2); ctx.fill();
  });
// Besen lehnt am Baum, bis Bruno ihn holt
if (!state.broomTaken) {
  ctx.save(); ctx.translate(58, groundY); ctx.rotate(-1.25); drawPix('broom', 12, 4, 1); ctx.restore();
}
// langsamer Sonnenaufgang: die ersten 4 s hellt sich alles auf
const sun = Math.min(1, sceneTime / 4);
if (sun < 1) { ctx.fillStyle = `rgba(20,18,50,${0.55*(1-sun)})`; ctx.fillRect(0,0,W,H); }
// der gewonnene Stern strahlt hinter Bruno
const bob=Math.sin(t*0.05)*3, sy=groundY-42+bob;
ctx.fillStyle=`rgba(255,230,140,${0.10 + 0.08*Math.sin(t*0.06)})`;
ctx.beginPath(); ctx.moveTo(brunoX-6, sy); ctx.lineTo(brunoX-30, groundY); ctx.lineTo(brunoX+30, groundY); ctx.lineTo(brunoX+6, sy); ctx.closePath(); ctx.fill();
drawWonStar(brunoX, sy, 0.6 + 0.4*sun);
drawBruno();
// MISSION ERFUELLT — DOM-Label, knallt per CSS-Animation gross rein und federt
if (sceneTime > 0.05) Labels.set('endTitle', tr('dlg.end.title'), 128, 22, { align:'center', cls:'title slam' });
}

function hotspotMarker(x, range) {
  if (ui.mode !== null) return;                    // nur im freien Spiel
  const near = Math.abs(brunoX - x) < (range || CONFIG.interactRange);
  const bob = Math.sin(t * (near ? 0.15 : 0.08)) * 2;
  // von weitem: gedimmter Hinweis, dass hier etwas ist (Auffindbarkeit);
  // in Reichweite: hell und schneller huepfend
  ctx.globalAlpha = near ? 1 : 0.45;
  ctx.fillStyle = near ? PAL.gold : '#e8dfc0';
  ctx.fillRect(x - 1, groundY - 34 + bob, 2, 6);
  ctx.fillRect(x - 1, groundY - 24 + bob, 2, 2);
  if (near) {                                       // kleiner Glanzpunkt
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(x - 1, groundY - 34 + bob, 1, 1);
  }
  ctx.globalAlpha = 1;
}

