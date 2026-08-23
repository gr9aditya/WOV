/* ===================== PIXART — handgezeichnete Pixel-Sprites =====================
   Requisiten, die vorher aus Rechtecken "code-designt" waren (Briefkasten,
   Boote, Schriftrolle, Schilder, Totenkopf …), liegen hier als Pixelkarten:
   ein Zeichen = ein Spiel-Pixel, Palette pro Sprite. Beim ersten Gebrauch
   wird die Karte in einen Offscreen-Canvas gerastert und danach nur noch
   geblittet — exakt auf dem 256x144-Raster, also derselbe Look wie die
   PNG-Sprites. Neue Requisite = neue Karte, keine Zeichenfunktion.

   drawPix(name, x, bottomY, facing)  — unten-mittig verankert wie drawSprite
   pixIcon(name, scale)               — data:-URL fuer DOM (Codeblatt-Knopf, Karten)

   Das Tor ist prozedural (gateDraw), weil es sich oeffnet: Steinbogen,
   Fluegel mit Eisenbaendern, Fackeln — Fluegel drehen ueber openK 0..1 auf.  */

const PIX = {
  // Schweizer Briefkasten: gelber Kasten mit Posthorn, rote Fahne, Holzpfosten
  mailbox: { pal: { k:'#1b1024', y:'#f2c200', Y:'#ffe25a', d:'#c9960a', r:'#d64545', R:'#ff7a7a', p:'#4a2f18', P:'#6b4226', s:'#2a2a2a', w:'#ffffff' },
    rows: [
      '........kk......',
      '........kRr.....',
      '........kRRr....',
      '........kRr.....',
      '..kkkkkkkkkkk...',
      '.kYYYYYYYYYYYk..',
      'kYyyyyyyyyyyyYk.',
      'kyyyyyyyyyyyyyk.',
      'kyyksssssssskyk.',
      'kyykkkkkkkkkkyk.',
      'kyyyyyyyyyyyyyk.',
      'kyyyyywwwyyyyyk.',
      'kyyyywkkkwyyyyk.',
      'kyyyyywwwyyyyyk.',
      'kyyyyyyyyyyyyyk.',
      'kdyyyyyyyyyyydk.',
      '.kdddddddddddk..',
      '..kkkkkkkkkkk...',
      '......kPpk......',
      '......kPpk......',
      '......kPpk......',
      '......kPpk......',
      '......kPpk......',
      '......kPpk......',
      '.....kkkkkk.....' ] },

  // Boot: Rumpf mit Planken, Mast, Rahsegel, Wimpel. Wasserlinie = Zeile 19.
  boat: { pal: { k:'#1b1024', h:'#8a5a2e', H:'#b07a3e', d:'#5a3a22', D:'#3a2418', m:'#3a2418', s:'#f4e9c9', S:'#ffffff', t:'#d9c9a6', r:'#d64545', g:'#ffd23f' },
    rows: [
      '..................kr................',
      '..................krr...............',
      '..................krrr..............',
      '..................kr................',
      '..................kk................',
      '..................km.kkkkkkkkkkkk...',
      '..................kmkSSSSSSSSSSSSk..',
      '..................kmksssssssssssSk..',
      '..................kmksssttsssssSk...',
      '..................kmksssttsssssSk...',
      '..................kmkssssssssssk....',
      '..................kmksssssssssk.....',
      '..................kmkssssssssk......',
      '..................kmkkkkkkkkk.......',
      '..................km................',
      '..................km................',
      '..kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
      '.kHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHk.',
      'kdhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhk',
      'kdhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhk',
      '.kdhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhk.',
      '..kddhhhhhhhhhhhhhhhhhhhhhhhhhhddk..',
      '...kkDDDDDDDDDDDDDDDDDDDDDDDDDDkk...',
      '.....kkkkkkkkkkkkkkkkkkkkkkkkkk.....' ] },

  // Boot, zerbrochen: Rumpf in zwei Haelften, Mast geknickt
  boat_wreck: { pal: { k:'#1b1024', h:'#8a5a2e', H:'#b07a3e', d:'#5a3a22', D:'#3a2418', m:'#3a2418', s:'#f4e9c9' },
    rows: [
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '.......................km...........',
      '......................km............',
      '.....................km.kssk........',
      '....................km.kssssk.......',
      '...................km.kssssk........',
      '..................km...kkkk.........',
      '.................kmk................',
      '..kkkkkkkkkkkkkkkkkk....kkkkkkkkkk..',
      '.kHHHHHHHHHHHHHHHHHk...kHHHHHHHHHHk.',
      'kdhhhhhhhhhhhhhhhhhk...kdhhhhhhhhhhk',
      'kdhhhhhhhhhhhhhhhhk.....kdhhhhhhhhhk',
      '.kdhhhhhhhhhhhhhhk.......kdhhhhhhhk.',
      '..kddhhhhhhhhhhhk.........kdhhhddk..',
      '...kkDDDDDDDDDDk...........kDDDkk...',
      '.....kkkkkkkkk..............kkk.....',
      '....................................' ] },

  // Schriftrolle mit Siegel (Codeblatt)
  scroll: { pal: { k:'#1b1024', p:'#e8d9a8', P:'#f4e9c9', d:'#c9b27a', r:'#b8322e', R:'#e04a45', i:'#5a3a22' },
    rows: [
      '.kkkk..............kkkk.',
      'kPppdk............kPppdk',
      'kpkkkkkkkkkkkkkkkkkkkkpk',
      'kdkPPPPPPPPPPPPPPPPPPkdk',
      '.kkPpppppppppppppppppkk.',
      '...kppiiiipppiiiippppk..',
      '...kppppppppppppppppppk.',
      '...kppiiiiiiipppiiiippk.',
      '...kpppppppppppppppppk..',
      '...kppiiiippiiiiippppk..',
      '...kpppppppppppppprRk...',
      '.kkkPpppppppppppppRRRk..',
      'kPppdkkkkkkkkkkkkkkRkk.k',
      'kpkkkkkkkkkkkkkkkkkkkkpk',
      'kdkPPPPPPPPPPPPPPPPPPkdk',
      '.kkkk..............kkkk.' ] },

  // Wegweiser-Brett mit Pfeil nach links (fuer rechts: facing -1)
  arrow_sign: { pal: { k:'#1b1024', w:'#8a5a2e', W:'#a8743c', d:'#5a3a22', p:'#4a2f18' },
    rows: [
      '....kkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
      '...kWWWWWWWWWWWWWWWWWWWWWWWWWWWWk',
      '..kWwwwwwwwwwwwwwwwwwwwwwwwwwwwwk',
      '.kWwwwwwwwwwwwwwwwwwwwwwwwwwwwwwk',
      'kWwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwk',
      '.kdwwwwwwwwwwwwwwwwwwwwwwwwwwwwwk',
      '..kdwwwwwwwwwwwwwwwwwwwwwwwwwwwwk',
      '...kddddddddddddddddddddddddddddk',
      '....kkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
      '...............kpk...............',
      '...............kpk...............',
      '...............kpk...............',
      '...............kpk...............',
      '...............kpk...............',
      '...............kpk...............',
      '..............kkkkk..............' ] },

  // Besen (quer, Borsten links — facing -1 spiegelt); Bruno sitzt auf dem Stiel (Zeile 3)
  broom: { pal: { k:'#1b1024', y:'#d9b24a', Y:'#f0cc6a', w:'#8a5a2e', W:'#a8743c', b:'#3a2418' },
    rows: [
      '.kkk....................',
      'kYyyk...................',
      'kyyyykkkkkkkkkkkkkkkkkkk',
      'kyyyybWwwwwwwwwwwwwwwwwk',
      'kyyyykkkkkkkkkkkkkkkkkkk',
      'kyyyk...................',
      '.kkk....................' ] },

  // Totenkopf am Hoehleneingang
  skull: { pal: { k:'#1b1024', b:'#e8e2cc', B:'#ffffff', d:'#b8b09a' },
    rows: [
      '..kkkkk..',
      '.kBbbbbk.',
      'kBbbbbbbk',
      'kbbkbbkbk',
      'kbkkbkkbk',
      '.kbbbbbk.',
      '..kdkdk..',
      '..kkkkk..' ] },

  // Schaedel + Knochen (Sumpf/Hoehle-Boden)
  bones: { pal: { k:'#1b1024', b:'#e8e2cc', d:'#b8b09a' },
    rows: [
      'kk.......kk',
      'kbkkkkkkkbk',
      '.kbdddddbk.',
      'kbkkkkkkkbk',
      'kk.......kk' ] },

  // Laterne (Bestaetigungstor)
  lantern: { pal: { k:'#1b1024', i:'#3a3a3a', g:'#ffd27a', G:'#ffffff', o:'#ffb347' },
    rows: [
      '...k...',
      '..kik..',
      '.kiiik.',
      'kigggik',
      'kigGgik',
      'kiooojk'.replace('j','i'),
      '.kiiik.',
      '..kkk..' ] },

  // Stern-Symbol (Codeblatt / Sternwahl), Farbe ueber pal.s
  star: { pal: { k:'#1b1024', s:'#ffd23f', S:'#ffffff' },
    rows: [
      '.....k.....',
      '....ksk....',
      '....ksk....',
      '...kssSk...',
      'kkkksSSskkk',
      'kssssSsssSk',
      '.ksssssssk.',
      '..kssssk...',
      '..ksskssk..',
      '.kssk.kssk.',
      'kkk....kkk.' ] },

  // Symbole 12x12 fuer Muster/Codeblatt (Palette pro Symbol)
  sym_moon: { pal: { k:'#1b1024', m:'#ffe066', M:'#fff6c0' },
    rows: ['....kkkk....','..kkmmmmkk..','.kmmmmmkkk..','.kmmmmk.....','kmmmmk......','kmmmmk......','kmmmmk......','kmmmmk......','.kmmmmk.....','.kmmmmmkkk..','..kkmmmmkk..','....kkkk....'] },
  sym_leaf: { pal: { k:'#1b1024', l:'#4c9a4b', L:'#8fd968', v:'#2f6b35' },
    rows: ['..........k.','.........kLk','.......kkLLk','.....kkLLLlk','....kLLLvllk','...kLLLvlllk','..kLLLvllllk','.kLLLvlllllk','kLLvllllllk.','kLvlllllkk..','kvllllkk....','kkkkkk......'] },
  sym_triangle: { pal: { k:'#1b1024', t:'#4aa8ff', T:'#9fd0ff' },
    rows: ['.....kk.....','....kTtk....','....kTtk....','...kTttTk...','...kTtttk...','..kTttttTk..','..kTtttttk..','.kTttttttTk.','.kTtttttttk.','kTttttttttTk','kttttttttttk','kkkkkkkkkkkk'] },
  sym_star: { pal: { k:'#1b1024', s:'#ffd23f', S:'#ffffff' },
    rows: ['.....kk.....','.....kSk....','....ksSk....','....kssk....','kkkkkssskkkk','kSsssssssssk','.kssssssssk.','..kssssssk..','..kssksssk..','.kssk..kssk.','kssk....kssk','kkk......kkk'] },
  sym_sun: { pal: { k:'#1b1024', s:'#ffb347', S:'#ffe066' },
    rows: ['.....kk.....','.k...kk...k.','..k.kSSk.k..','...kSSSSk...','..kSSSSSSk..','kkkSSssSSkkk','kkkSSssSSkkk','..kSSSSSSk..','...kSSSSk...','..k.kSSk.k..','.k...kk...k.','.....kk.....'] },
  sym_circle: { pal: { k:'#1b1024', c:'#e0453f', C:'#ff9a94' },
    rows: ['....kkkk....','..kkCCCCkk..','.kCCCccccCk.','.kCccccccck.','kCccccccccck','kCccccccccck','kcccccccccck','kcccccccccck','.kccccccccck','.kcccccccck.','..kkcccckk..','....kkkk....'] }
};

const pixCache = {};
function pixSprite(name, tint) {
  const key = tint ? name + '|' + tint : name;
  let e = pixCache[key];
  if (e) return e;
  const def = PIX[name];
  if (!def) return null;
  const rows = def.rows, h = rows.length, w = Math.max(...rows.map(r => r.length));
  const c = document.createElement('canvas');
  c.width = w * RES; c.height = h * RES;
  const cx = c.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) {
    const ch = rows[y][x];
    let col = def.pal[ch];
    if (!col) continue;
    if (tint && ch === tint.ch) col = tint.color;
    cx.fillStyle = col; cx.fillRect(x * RES, y * RES, RES, RES);
  }
  e = pixCache[key] = { c, w, h };
  return e;
}
/* unten-mittig verankert; facing -1 spiegelt */
function drawPix(name, cxPos, bottomY, facing, tint) {
  const s = pixSprite(name, tint);
  if (!s) return false;
  const left = Math.round(cxPos - s.w / 2), top = Math.round(bottomY - s.h);
  ctx.save();
  if (facing < 0) { ctx.translate(left + s.w, top); ctx.scale(-1, 1); ctx.drawImage(s.c, 0, 0, s.c.width, s.c.height, 0, 0, s.w, s.h); }
  else ctx.drawImage(s.c, 0, 0, s.c.width, s.c.height, left, top, s.w, s.h);
  ctx.restore();
  return true;
}
/* als Bild fuer das DOM (Knopf-Icon, Symbol in Buttons/Codeblatt) */
const pixIconCache = {};
function pixIcon(name, scale, tint) {
  const key = name + '|' + (scale || 4) + '|' + (tint ? tint.color : '');
  if (pixIconCache[key]) return pixIconCache[key];
  const s = pixSprite(name, tint);
  if (!s) return '';
  const z = scale || 4;
  const c = document.createElement('canvas');
  c.width = s.w * z; c.height = s.h * z;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  cx.drawImage(s.c, 0, 0, s.c.width, s.c.height, 0, 0, c.width, c.height);
  return (pixIconCache[key] = c.toDataURL('image/png'));
}
/* <img> fuer ein Symbol, z.B. in Auswahl-Buttons und auf dem Codeblatt */
function symImg(id, cls) {
  return `<img class="sym ${cls || ''}" alt="${id}" src="${pixIcon('sym_' + id, 4)}">`;
}

/* ---------- Die vier Symbole des Stimmrechtsausweises ----------
   Feste Zuordnung (Spiel-Schritt -> Form), wie auf dem echten Ausweis:
     pattern = Dreieck  (Initialisierungscode)
     status  = Raute    (Pruefcodes)
     confirm = Fuenfeck (Bestaetigungscode)
     star    = Stern    (Finalisierungscode)
   Als Canvas-Pfad, nicht als Sprite: derselbe Pfad laeuft klein auf dem
   Codeblatt (Icon via Data-URI) und gross in der Welt (eingemeisselt /
   eingebrannt / leuchtend), ohne Treppen beim Skalieren.                 */
const CODE_SYMBOLS = { pattern: 'triangle', status: 'diamond', confirm: 'pentagon', star: 'star' };
function symbolPath(kind, cx, cy, r) {
  ctx.beginPath();
  const go = (i, a, rr) => { const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); };
  if (kind === 'triangle')      for (let i = 0; i < 3; i++) go(i, -Math.PI / 2 + i * 2 * Math.PI / 3, r);
  else if (kind === 'diamond')  { ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r * 0.78, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r * 0.78, cy); }
  else if (kind === 'pentagon') for (let i = 0; i < 5; i++) go(i, -Math.PI / 2 + i * 2 * Math.PI / 5, r);
  else                          for (let i = 0; i < 10; i++) go(i, -Math.PI / 2 + i * Math.PI / 5, i % 2 ? r * 0.42 : r);
  ctx.closePath();
}
/* drawSymbol(kind, cx, cy, r, style, color)
   'flat'   : schwarz ausgefuellt, ohne Rahmen (Codeblatt-Look)
   'carved' : in Stein gemeisselt — dunkle Form, Lichtkante unten rechts, Schatten oben links
   'burnt'  : in Holz/Metall gebrannt — verkohlt, leicht roetlicher Rand
   'glow'   : leuchtende Form (Anzeige, Konsole), color = Leuchtfarbe      */
function drawSymbol(kind, cx, cy, r, style, color) {
  if (style === 'carved') {
    symbolPath(kind, cx + 0.7, cy + 0.7, r); ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.fill();
    symbolPath(kind, cx - 0.5, cy - 0.5, r); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
    symbolPath(kind, cx, cy, r * 0.9); ctx.fillStyle = color || '#24242b'; ctx.fill();
  } else if (style === 'burnt') {
    symbolPath(kind, cx, cy, r); ctx.fillStyle = 'rgba(140,60,20,0.55)'; ctx.fill();
    symbolPath(kind, cx, cy, r * 0.84); ctx.fillStyle = color || '#140b08'; ctx.fill();
  } else if (style === 'glow') {
    const c = color || '#6fe0ff';
    ctx.globalAlpha = 0.22; symbolPath(kind, cx, cy, r * 1.6); ctx.fillStyle = c; ctx.fill();
    ctx.globalAlpha = 0.45; symbolPath(kind, cx, cy, r * 1.25); ctx.fill();
    ctx.globalAlpha = 1;    symbolPath(kind, cx, cy, r); ctx.fill();
    symbolPath(kind, cx, cy, r * 0.45); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
  } else {
    symbolPath(kind, cx, cy, r); ctx.fillStyle = color || '#000'; ctx.fill();
  }
}
/* Data-URI-Icon fuer die Oberflaeche (Codeblatt, Dialoge, Knoepfe) —
   gerendert aus demselben Pfad; px = Kantenlaenge des Icons.             */
const symbolIconCache = {};
function symbolIcon(kind, px, color) {
  const key = kind + '|' + px + '|' + (color || '');
  if (symbolIconCache[key]) return symbolIconCache[key];
  const c = document.createElement('canvas'); c.width = c.height = px;
  const saved = ctx; ctx = c.getContext('2d');
  drawSymbol(kind, px / 2, px / 2 + (kind === 'triangle' ? px * 0.06 : 0), px * 0.46, 'flat', color || '#000');
  ctx = saved;
  return (symbolIconCache[key] = c.toDataURL('image/png'));
}
/* <img> fuer einen Schritt (pattern/status/confirm/star); cls = Groessenklasse */
function codeSym(step, cls, color) {
  const kind = CODE_SYMBOLS[step]; if (!kind) return '';
  return `<img class="codesym ${cls || ''}" alt="" aria-hidden="true" src="${symbolIcon(kind, 64, color)}">`;
}

/* ---------- Das Tor: prozedurale Pixel-Art, weil es sich oeffnet ----------
   x = Mitte, g = Bodenlinie. openK 0..1 = Fluegel aufgedreht, red 0..1 = rot
   (Ablehnung). Alles in ganzen Spiel-Pixeln gezeichnet, damit es zum Raster
   passt. Fackeln werden separat animiert (gateTorches).                    */
function gateDraw(x, g, openK, red) {
  const L = x - 34, R = x + 34, top = g - 94;
  const stone = '#7d7d84', stoneD = '#5c5c63', stoneL = '#9a9aa2', mortar = '#3b3b42';
  // Pfeiler aus Quadern
  const pier = (px) => {
    ctx.fillStyle = stone; ctx.fillRect(px, top + 8, 14, g - top - 8);
    for (let y = top + 8; y < g; y += 6) {
      ctx.fillStyle = mortar; ctx.fillRect(px, y, 14, 1);
      const off = ((y - top) / 6 | 0) % 2 ? 6 : 2;
      ctx.fillRect(px + off, y, 1, 6);
      ctx.fillStyle = stoneL; ctx.fillRect(px + 1, y + 1, 12, 1);
      ctx.fillStyle = stoneD; ctx.fillRect(px + 1, y + 5, 12, 1);
    }
    ctx.fillStyle = '#1b1024'; ctx.fillRect(px - 1, top + 8, 1, g - top - 8); ctx.fillRect(px + 14, top + 8, 1, g - top - 8);
  };
  pier(L); pier(R - 14);
  // Bogen / Sturz mit Zinnen
  ctx.fillStyle = '#1b1024'; ctx.fillRect(L - 3, top, R - L + 6, 10);
  ctx.fillStyle = stone; ctx.fillRect(L - 2, top + 1, R - L + 4, 8);
  ctx.fillStyle = stoneL; ctx.fillRect(L - 2, top + 1, R - L + 4, 1);
  ctx.fillStyle = mortar; for (let px = L + 2; px < R; px += 8) ctx.fillRect(px, top + 1, 1, 8);
  for (let i = 0; i < 5; i++) { const zx = L - 2 + i * 17; ctx.fillStyle = '#1b1024'; ctx.fillRect(zx, top - 5, 9, 6); ctx.fillStyle = stone; ctx.fillRect(zx + 1, top - 4, 7, 5); ctx.fillStyle = stoneL; ctx.fillRect(zx + 1, top - 4, 7, 1); }
  // Schlussstein ueber dem Eingang mit eingemeisseltem Dreieck (Initialisierungscode)
  ctx.fillStyle = '#1b1024'; ctx.fillRect(x - 10, top - 5, 20, 24);
  ctx.fillStyle = stoneL; ctx.fillRect(x - 9, top - 4, 18, 22);
  ctx.fillStyle = stone; ctx.fillRect(x - 8, top - 3, 16, 20);
  ctx.fillStyle = stoneD; ctx.fillRect(x - 8, top + 16, 16, 1); ctx.fillRect(x + 7, top - 3, 1, 20);
  drawSymbol('triangle', x, top + 7.5, 8, 'carved', red > 0 ? '#5a1a1a' : '#1e1e24');
  // Durchgang: dunkel, mit Licht je nach Oeffnung
  const iw = (R - 14) - (L + 14);
  ctx.fillStyle = '#0c0a10'; ctx.fillRect(L + 14, top + 10, iw, g - top - 10);
  if (openK > 0) {
    const grd = ctx.createLinearGradient(0, top + 10, 0, g);
    grd.addColorStop(0, `rgba(255,230,150,${0.05 + 0.35 * openK})`); grd.addColorStop(1, `rgba(255,240,200,${0.1 + 0.6 * openK})`);
    ctx.fillStyle = grd; ctx.fillRect(L + 14, top + 10, iw, g - top - 10);
  }
  // Fluegel: Holz mit Eisenbaendern, drehen nach innen auf (Breite schrumpft)
  const half = iw / 2;
  const leafW = Math.max(0, Math.round(half * (1 - openK)));
  const leaf = (lx, dir) => {
    if (leafW <= 0) return;
    ctx.fillStyle = '#1b1024'; ctx.fillRect(lx, top + 10, leafW, g - top - 10);
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(lx + (dir > 0 ? 1 : 0), top + 11, Math.max(0, leafW - 1), g - top - 12);
    ctx.fillStyle = '#3a2418';
    for (let py = top + 14; py < g - 2; py += 7) ctx.fillRect(lx, py, leafW, 1);
    ctx.fillStyle = '#6b4226'; for (let px = 2; px < leafW - 1; px += 4) ctx.fillRect(lx + px, top + 11, 1, g - top - 12);
    // Eisenbaender
    ctx.fillStyle = '#2f2f36'; for (const py of [top + 22, top + 50, top + 78]) { ctx.fillRect(lx, py, leafW, 3); ctx.fillStyle = '#55555e'; ctx.fillRect(lx, py, leafW, 1); ctx.fillStyle = '#2f2f36'; }
    // Ring
    ctx.fillStyle = '#ffd23f'; const rx = dir > 0 ? lx + leafW - 5 : lx + 2; if (leafW > 6) { ctx.fillRect(rx, g - 46, 3, 1); ctx.fillRect(rx, g - 44, 3, 1); ctx.fillRect(rx, g - 45, 1, 1); ctx.fillRect(rx + 2, g - 45, 1, 1); }
  };
  leaf(L + 14, 1);
  leaf(R - 14 - leafW, -1);
  // Ablehnung: rotes Gluehen ueber den Fluegeln
  if (red > 0) { ctx.fillStyle = `rgba(224,69,63,${0.45 * red})`; ctx.fillRect(L + 14, top + 10, iw, g - top - 10); }
  // Stufe
  ctx.fillStyle = '#1b1024'; ctx.fillRect(L + 8, g, R - L - 16, 3);
  ctx.fillStyle = stoneL; ctx.fillRect(L + 9, g, R - L - 18, 1); ctx.fillStyle = stone; ctx.fillRect(L + 9, g + 1, R - L - 18, 2);
}
// Fackeln links/rechts vom Tor: Halter statisch, Flamme animiert
function gateTorches(x, g) {
  for (const tx of [x - 44, x + 44]) {
    ctx.fillStyle = '#3a2418'; ctx.fillRect(tx - 1, g - 58, 3, 10);
    ctx.fillStyle = '#2f2f36'; ctx.fillRect(tx - 2, g - 59, 5, 2);
    const f = Math.sin(t * 0.4 + tx) * 1.5;
    ctx.fillStyle = '#ff8c1a'; ctx.fillRect(tx - 2, g - 64 + f, 5, 5);
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(tx - 1, g - 66 + f, 3, 5);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(tx, g - 64 + f, 1, 2);
    ctx.fillStyle = `rgba(255,180,80,${0.12 + Math.sin(t * 0.3 + tx) * 0.04})`;
    ctx.beginPath(); ctx.arc(tx, g - 60, 18, 0, Math.PI * 2); ctx.fill();
  }
}
