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
  staticLayer('home_props', () => { chalet(groundY); drawPix('mailbox', 122, groundY, 1); });
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

/* Ruderboot (assets/props/boat.png, 56x26): naher Bordrand (Zeile 8) liegt auf
   y, der Rumpf haengt im Wasser. bobOn: sanftes Auf/Ab plus minimale Neigung
   um die Rumpfmitte, pro Boot versetzt (phase).                            */
function drawBoatHull(x, y, phase, bobOn) {
  const g = y === undefined ? groundY : y;
  const bob = bobOn ? Math.sin(t * 0.045 + phase) * 1.2 : 0;
  const tilt = bobOn ? Math.sin(t * 0.03 + phase * 1.7) * 0.03 : 0;
  const cy = g + 8 + bob;
  ctx.save();
  ctx.translate(x, cy); ctx.rotate(tilt); ctx.translate(-x, -cy);
  if (!drawSprite('boat', 0, x, g + 18 + bob, 1)) drawPix('boat', x, g + 8 + bob, 1);
  ctx.restore();
}
/* Holzschild am Pfosten auf dem Steg: Rahmen, Brett mit Maserung, Nummer als DOM-Label */
function drawBoatSign(x, label) {
  const g = groundY;
  ctx.fillStyle = '#3a2418'; ctx.fillRect(x - 1, g - 27, 3, 22);            // Pfosten
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - 1, g - 27, 1, 22);
  ctx.fillStyle = '#1b1024'; ctx.fillRect(x - 17, g - 42, 34, 16);          // Kontur
  ctx.fillStyle = '#3a2418'; ctx.fillRect(x - 16, g - 41, 32, 14);          // Rahmen
  ctx.fillStyle = '#8a5a2e'; ctx.fillRect(x - 14, g - 39, 28, 10);          // Brett
  ctx.fillStyle = '#a8743c'; ctx.fillRect(x - 14, g - 39, 28, 1);
  ctx.fillStyle = '#6b4a2a';                                                // Maserung
  for (let i = 0; i < 5; i++) { const gx = x - 13 + ((rnd(i * 7 + x) * 22) | 0), len = 3 + ((rnd(i + x) * 5) | 0); ctx.fillRect(gx, g - 37 + i * 2, len, 1); }
  ctx.fillStyle = '#2a1810'; ctx.fillRect(x - 15, g - 34, 1, 1); ctx.fillRect(x + 14, g - 34, 1, 1);   // Naegel
  Labels.set('boat' + label, label, x, g - 39, { align:'center', size:8, color:'#f4e9c9' });
}
/* Zerbrechendes Boot: das Sprite zerfaellt in drei Teile (Heck, Mitte, Bug),
   die auseinanderdriften, kippen und unter die Wasserlinie sinken.        */
function drawBoatWreck(x, y, p) {
  const img = Assets.imgs.boat, spec = ASSET_MANIFEST.boat;
  if (!img) { drawPix('boat_wreck', x, y + 8 + p * 5, 1); return; }
  const left = x - spec.w / 2, top = y + 18 - spec.h;
  const pieces = [
    { sx: 0,  w: 20, dx: -p * 14, dy: p * 10, rot: -0.6 * p },
    { sx: 20, w: 16, dx: 0,       dy: p * 14, rot: 0.12 * p },
    { sx: 36, w: 20, dx: p * 14,  dy: p * 9,  rot: 0.55 * p }
  ];
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, y + 12); ctx.clip();                 // unter der Wasserlinie verschwinden
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
  if (photo) staticLayer('gate_floor', () => stoneFloor(11));   // Stein statt Wiese unter dem Tor
  drawGate(128);
  hotspotMarker(128); drawBruno(); }

/* Tor-Zustand aus Sequenz/State: gate_open-Schritt dreht die Fluegel auf,
   danach bleiben sie offen (state.gateOpen), gate_reject pulst rot.    */
function drawGate(x) {
  const st = sequence && sequence.steps[sequence.i];
  let openK = state.gateOpen ? 1 : 0, red = 0;
  if (st && st.key === 'gate_open') openK = Math.max(openK, Math.min(1, seqProgress(st) * 1.15));
  if (st && st.key === 'gate_reject') red = 0.5 + Math.sin(seqProgress(st) * 24) * 0.4;
  gateDraw(x, groundY, openK, red);
  gateTorches(x, groundY);
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
  Labels.set('sign_cave', tr('sign.cave'), 97, groundY-15, { align:'center', size:5, color:'#f4e9c9', cls:'flat' });
  Labels.set('sign_swamp', tr('sign.swamp'), 159, groundY-15, { align:'center', size:5, color:'#f4e9c9', cls:'flat' });
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
  // Gegner — immer: Spinne am Faden, Leiche bis zur Pruefung
  const spiderBusy = sequence && sequence.steps[sequence.i] && sequence.steps[sequence.i].key.indexOf('spider') === 0;
  if (!spiderBusy && state.enemyState === 'alive') {
    const bob = Math.sin(t*0.06)*1.5;
    const breathe = 1 + Math.sin(t*0.06) * 0.02;
    ctx.strokeStyle='rgba(207,216,220,0.5)'; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.moveTo(150,0); ctx.lineTo(150,groundY-ASSET_MANIFEST.spider_idle.h+3+bob); ctx.stroke();
    ctx.save();
    ctx.translate(150, groundY + bob); ctx.scale(breathe, 1); ctx.translate(-150, -(groundY + bob));
    drawSprite('spider_idle', loopFrame('spider_idle'), 150, groundY+bob, 1);
    ctx.restore();
  } else if (!spiderBusy && state.enemyState === 'dead') {
    drawCorpse('spider_defeated', 150, 1);     // liegt da, bis der Statuswert geprueft ist
  }
  drawStatusMeter(72);
  if (state.enemyState === 'alive') hotspotMarker(150, 72);
  drawBruno(); }

/* Messgeraet fuer den Statuswert (Raute = Pruefcodes): Eisenpfosten mit
   Anzeige. Vor dem Kampf zeigt es nur Striche, danach den gemeldeten Wert
   (state.meterValue, gesetzt in der Story). Die Raute ist in die Blende
   eingebrannt; bei Anzeige leuchtet sie mit.                              */
function drawStatusMeter(x) {
  const y = groundY;
  const on = state.enemyState !== 'alive' && state.meterValue;
  // Pfosten + Fuss
  ctx.fillStyle = '#1b1e28'; ctx.fillRect(x - 2, y - 22, 4, 22); ctx.fillRect(x - 6, y - 2, 12, 2);
  ctx.fillStyle = '#4a5261'; ctx.fillRect(x - 1, y - 21, 2, 20);
  // Gehaeuse
  ctx.fillStyle = '#1b1e28'; ctx.fillRect(x - 15, y - 40, 30, 20);
  ctx.fillStyle = '#55606f'; ctx.fillRect(x - 14, y - 39, 28, 18);
  ctx.fillStyle = '#6c7584'; ctx.fillRect(x - 14, y - 39, 28, 1); ctx.fillStyle = '#3a4150'; ctx.fillRect(x - 14, y - 22, 28, 1);
  // Anzeige (rechts) + eingebrannte Raute (links)
  ctx.fillStyle = '#0c1018'; ctx.fillRect(x - 3, y - 36, 15, 12);
  const pulse = 0.7 + Math.sin(t * 0.15) * 0.3;
  if (on) { ctx.fillStyle = `rgba(111,224,255,${0.12 + 0.1 * pulse})`; ctx.fillRect(x - 3, y - 36, 15, 12); }
  drawSymbol('diamond', x - 8.5, y - 30, 5.5, 'burnt', '#15120f');
  if (on) drawSymbol('diamond', x - 8.5, y - 30, 3.2, 'glow', '#6fe0ff');
  Labels.set('meter', on ? state.meterValue : '– – –', x + 4.5, y - 31, { align: 'center', size: 6, color: on ? '#9ff0ff' : '#4a6a78', cls: 'flat mono' });
}

/* Leiche: letzter Frame der Defeated-Animation, 180 Grad um die Mitte
   gedreht (Bauch nach oben) und entsaettigt — exakt die Endlage des
   defeat-fx in drawSequence(). Kein Bob, kein Atmen. Bleibt sichtbar,
   bis der Spieler den Statuswert richtig bestaetigt hat.               */
function drawCorpse(key, x, facing) {
  const spec = ASSET_MANIFEST[key];
  if (!spec) return;
  const last = spec.frames - 1;
  const cy = groundY - spec.h / 2;
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
  drawStatusMeter(72);
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
// Tor im Bogen: zwei Fluegel mit Eisenbaendern, drehen ueber openK nach innen auf
function towerDoor(openK, red) {
  const x0 = ARCH.x0, x1 = ARCH.x1, top = ARCH.top, base = groundY;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, top + ARCH.r, x1 - x0, base - top - ARCH.r); ctx.arc(ARCH.cx, top + ARCH.r, ARCH.r, Math.PI, 0); ctx.clip();
  // Innenraum: dunkel, bei offenem Tor violett durchleuchtet
  ctx.fillStyle = '#0c0a12'; ctx.fillRect(x0, top, x1 - x0, base - top);
  if (openK > 0) {
    const g = ctx.createLinearGradient(0, top, 0, base);
    g.addColorStop(0, `rgba(140,90,255,${0.12 + 0.35 * openK})`); g.addColorStop(1, `rgba(120,220,255,${0.05 + 0.3 * openK})`);
    ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, base - top);
    ctx.fillStyle = `rgba(200,170,255,${0.5 * openK})`; ctx.fillRect(ARCH.cx - 1, top + 6, 2, base - top - 6);   // Lichtspalt
  }
  const half = (x1 - x0) / 2, lw = Math.max(0, Math.round(half * (1 - openK)));
  const leaf = (lx, dir) => {
    if (lw <= 0) return;
    ctx.fillStyle = '#1b1024'; ctx.fillRect(lx, top, lw, base - top);
    ctx.fillStyle = '#3a2416'; ctx.fillRect(lx + (dir > 0 ? 1 : 0), top + 1, Math.max(0, lw - 1), base - top - 1);
    ctx.fillStyle = '#2a1810'; for (let px = 3; px < lw - 1; px += 4) ctx.fillRect(lx + px, top, 1, base - top);
    ctx.fillStyle = '#2f2f36'; for (const py of [top + 14, top + 26, top + 38]) { ctx.fillRect(lx, py, lw, 3); ctx.fillStyle = '#55555e'; ctx.fillRect(lx, py, lw, 1); ctx.fillStyle = '#2f2f36'; }
    ctx.fillStyle = '#8a8a96'; for (const py of [top + 15, top + 27, top + 39]) for (let px = 2; px < lw - 1; px += 5) ctx.fillRect(lx + px, py, 1, 1);
    if (lw > 5) { ctx.fillStyle = '#6a6a78'; const rx = dir > 0 ? lx + lw - 4 : lx + 2; ctx.fillRect(rx, base - 22, 2, 3); }
  };
  leaf(x0, 1); leaf(x1 - lw, -1);
  if (red > 0) { ctx.fillStyle = `rgba(255,60,60,${0.35 * red})`; ctx.fillRect(x0, top, x1 - x0, base - top); }
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
/* Steintafel ueber dem Turmbogen mit grossem eingemeisseltem Fuenfeck */
function towerPlaque(red) {
  const cx = ARCH.cx, cy = ARCH.top - 16;
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
  // Tor + Tafel + Konsole
  towerDoor(openK, red);
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
  if (state.starTaken === i) return;                 // gewaehlt: zeichnet die Sequenz / ist zerbrochen
  const bob=Math.sin(t*0.06+i*1.4)*4, cy=STAR_Y+bob;
  const pulse = 1 + Math.sin(t*0.12 + i*1.7) * 0.12;
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
  drawStarShape(s_.x, cy, s_.c, pulse);
});
if (nearK > 0) { ctx.fillStyle = `rgba(255,236,180,${0.16*nearK})`; ctx.fillRect(0,0,W,H); }
// der gewonnene Stern schwebt ueber Bruno (nach der Sequenz, vor dem Abgang)
if (state.starTaken >= 0 && STARS[state.starTaken].id === CODEBLATT.finalStar && !sequence && !state.brunoHidden) drawWonStar(brunoX, groundY-40+Math.sin(t*0.05)*3, 0.6, STARS[state.starTaken].c);
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
  drawStarShape(x, y, c, 1 + Math.sin(t*0.1)*0.08);
}
/* Finale-Schritte (Keys star_flare / star_swoop / star_burst, keine Sheets) */
function drawStarFinale(key, x, y) {
  const step = sequence.steps[sequence.i];
  const p = seqProgress(step);
  const st = STARS[state.starTaken] || STARS[0];
  const fxOn = Prefs.data.shake;
  if (key === 'star_flare') {
    // Zeit steht fast still, der Stern flammt weiss auf
    ctx.fillStyle = `rgba(255,255,255,${0.35*p})`; ctx.beginPath(); ctx.arc(x, y, 14 + p*26, 0, Math.PI*2); ctx.fill();
    rays(x, y, 8, 10 + p*34, `rgba(255,250,220,${0.7*p})`, p*1.2);
    drawStarShape(x, y, mixHex(st.c, '#ffffff', p), 1 + p*1.4);
  } else if (key === 'star_swoop') {
    // Sturzflug zu Bruno mit Lichtschweif (Partikel, gedeckelt)
    const e = p*p;
    const px = x + (step.toX - x) * e;
    const py = y + (step.toY - y) * e - Math.sin(p*Math.PI) * 22;
    spawnParticle(px, py, { spread: 24, up: 12, g: 0, life: 0.35, color: ['#ffffff','#ffd23f','#ffe999'], size: 2 });
    spawnParticle(px, py, { spread: 34, up: 24, g: 0, life: 0.5, color: ['#ffd23f','#fff6cc'] });
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI*2); ctx.fill();
    drawStarShape(px, py, '#ffffff', 2.2 - p*0.8);
    drawStarShape(px, py, st.c, 1.6 - p*0.6);
  } else if (key === 'star_burst') {
    // Stern ueber Bruno, Schockwelle ueber den ganzen Schirm, Blitz
    const q = 1 - p;
    if (fxOn) {
      ctx.strokeStyle = `rgba(255,240,200,${q})`; ctx.lineWidth = 1 + 3*q;
      ctx.beginPath(); ctx.arc(x, y, 6 + p*250, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = `rgba(255,210,63,${q*0.6})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, 6 + p*180, 0, Math.PI*2); ctx.stroke();
    }
    rays(x, y, 12, 14 + Math.sin(p*Math.PI)*30, `rgba(255,250,220,${0.5*q})`, t*0.03);
    ctx.fillStyle = `rgba(255,255,255,${0.35*q})`; ctx.beginPath(); ctx.arc(x, y, 10 + q*16, 0, Math.PI*2); ctx.fill();
    drawStarShape(x, y, st.c, 1.5 + Math.sin(p*Math.PI)*0.5);
    if (fxOn && p < 0.5) { ctx.fillStyle = `rgba(255,255,255,${0.85*Math.pow(1 - p*2, 2)})`; ctx.fillRect(-8, -8, W+16, H+16); }
  }
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

