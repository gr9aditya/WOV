/* ===================== LABELS — Text in nativer Bildschirmaufloesung =====================
   Canvas-Text wird mit dem 256x144-Bild hochskaliert und ist auf dem Beamer
   kaum lesbar. Deshalb liegt ueber der Canvas ein DOM-Layer (#labelLayer),
   der in Spielkoordinaten positioniert wird: left/top/font-size rechnen mit
   der CSS-Variable --gs (Bildschirm-Pixel pro Spiel-Pixel, gesetzt von
   fitCanvas). Der Text wird dadurch vom Browser in voller Aufloesung
   gerendert — scharf bei jeder Skalierung.

   Immediate-Mode wie Canvas-Zeichnen: Szenenfunktionen rufen jeden Frame
   Labels.set(id, …) auf; was in einem Frame nicht gesetzt wurde, verschwindet
   in endFrame(). Setzen ist idempotent (kein DOM-Schreiben ohne Aenderung),
   damit CSS-Animationen (Titel-Slam) nicht neu starten.

   Zwei Ebenen: #sceneLabels bekommt Screenshake-Versatz und den Level-Wipe
   als clip-path mit; #wipeLabels (das LEVEL-Schild) liegt darueber und
   wackelt nicht.                                                             */
const Labels = {
  layer: null, scene: null, wipe: null,
  items: new Map(), used: new Set(),
  lastShake: '', lastClip: '', lastFade: -1, wipeSig: '',

  init() {
    this.layer = document.getElementById('labelLayer');
    this.scene = document.getElementById('sceneLabels');
    this.wipe = document.getElementById('wipeLabels');
  },
  beginFrame() { this.used.clear(); },

  /* id: stabiler Schluessel; gx/gy: Spielkoordinaten (gy = Oberkante);
     opts: align 'left'|'center'|'right', size (Spiel-px, Default 9),
           color, cls (zusaetzliche CSS-Klassen), alpha 0..1              */
  set(id, text, gx, gy, opts) {
    if (!this.scene) return;
    opts = opts || {};
    this.used.add(id);
    const alpha = opts.alpha === undefined ? 1 : opts.alpha;
    const sig = [text, gx, gy, opts.align || '', opts.size || '', opts.color || '', opts.cls || '', alpha.toFixed(2)].join('|');
    let it = this.items.get(id);
    if (it && it.sig === sig) return;
    if (!it) {
      const el = document.createElement('div');
      this.scene.appendChild(el);
      it = { el, sig: '' };
      this.items.set(id, it);
    }
    const el = it.el;
    el.textContent = text;
    el.className = 'lbl ' + (opts.align === 'center' ? 'c ' : opts.align === 'right' ? 'r ' : '') + (opts.cls || '');
    el.style.setProperty('--gx', gx);
    el.style.setProperty('--gy', gy);
    el.style.setProperty('--fs', opts.size || 9);
    if (opts.color) el.style.setProperty('--col', opts.color); else el.style.removeProperty('--col');
    el.style.opacity = alpha >= 1 ? '' : String(alpha);
    it.sig = sig;
  },
  endFrame() {
    for (const [id, it] of this.items) {
      if (!this.used.has(id)) { it.el.remove(); this.items.delete(id); }
    }
  },
  clear() {
    for (const it of this.items.values()) it.el.remove();
    this.items.clear();
    this.setWipe(null);
  },

  // Screenshake: gleicher Versatz wie die Canvas (in Spiel-px)
  setShake(off) {
    if (!this.scene) return;
    const v = off ? `translate(calc(${off.x}px * var(--gs)), calc(${off.y}px * var(--gs)))` : '';
    if (v !== this.lastShake) { this.scene.style.transform = v; this.lastShake = v; }
  },
  // Level-Wipe: Szenen-Labels dort wegschneiden, wo die Canvas schwarz ist.
  // left/right = abgedeckte Breite von links bzw. rechts in Spiel-px.
  setClip(left, right) {
    if (!this.scene) return;
    const v = (left > 0 || right > 0)
      ? `inset(0 calc(${right}px * var(--gs)) 0 calc(${left}px * var(--gs)))` : '';
    if (v !== this.lastClip) { this.scene.style.clipPath = v; this.lastClip = v; }
  },
  // Einblenden beim allerersten Bild (fadeAlpha der Canvas)
  setFade(fadeAlpha) {
    if (!this.layer) return;
    const a = Math.round((1 - fadeAlpha) * 100) / 100;
    if (a !== this.lastFade) { this.layer.style.opacity = a >= 1 ? '' : String(a); this.lastFade = a; }
  },
  // LEVEL-Schild waehrend des Wipes (null = weg)
  setWipe(line1, line2, alpha) {
    if (!this.wipe) return;
    const sig = line1 === null ? '' : [line1, line2, (alpha || 0).toFixed(2)].join('|');
    if (sig === this.wipeSig) return;
    this.wipeSig = sig;
    if (line1 === null) { this.wipe.innerHTML = ''; return; }
    if (!this.wipe.firstChild) {
      this.wipe.innerHTML = '<div class="lbl c level1"></div><div class="lbl c rule"></div><div class="lbl c level2"></div>';
    }
    const [a, r, b] = this.wipe.children;
    if (a.textContent !== line1) a.textContent = line1;
    if (b.textContent !== line2) b.textContent = line2;
    this.wipe.style.opacity = String(alpha);
    void r;
  }
};
