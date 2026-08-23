#!/usr/bin/env python3
"""
prepare_bg.py — Hintergrundbild -> 256x144 Szenenhintergrund fuer Brunos Code-Abenteuer

Skaliert die Vorlage auf die Canvas-Breite (256 px), verschiebt sie so, dass die
begehbare Bodenkante exakt auf groundY = 112 liegt, und fuellt oben/unten
entstehende Luecken durch Strecken der Rand-Pixelzeilen. Ergebnis: ein Bild, das
bgOrElse() 1:1 mit drawImage(img,0,0,256,144) zeichnen kann.

  python3 prepare_bg.py quelle.png -o assets/bg/alpen.png --ground 0.803 --preview
"""
import argparse, os, sys
try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow fehlt:  pip install --break-system-packages Pillow")

W, H, GROUND_Y = 256, 144, 112

def prepare(src_path, out_path, ground_frac, preview=False):
    src = Image.open(src_path).convert('RGB')
    sw, sh = src.size

    # 1. auf Canvas-Breite skalieren (volle Komposition bleibt sichtbar)
    scaled_h = max(1, round(sh * W / sw))
    scaled = src.resize((W, scaled_h), Image.LANCZOS)

    # 2. so verschieben, dass die Bodenkante auf GROUND_Y landet
    ground_in_scaled = ground_frac * scaled_h
    offset_y = round(GROUND_Y - ground_in_scaled)

    out = Image.new('RGB', (W, H))
    out.paste(scaled, (0, offset_y))

    # 3. Luecken schliessen: oberste/unterste Zeile der Vorlage strecken
    top_gap = max(0, offset_y)
    if top_gap:
        out.paste(scaled.crop((0, 0, W, 1)).resize((W, top_gap), Image.NEAREST), (0, 0))
    bottom_start = offset_y + scaled_h
    if bottom_start < H:
        strip = scaled.crop((0, scaled_h - 3, W, scaled_h))
        out.paste(strip.resize((W, H - bottom_start), Image.NEAREST), (0, bottom_start))

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    out.save(out_path)
    print(f"  {os.path.basename(src_path):26s} {sw}x{sh} -> {W}x{H}  "
          f"ground {ground_frac:.3f}  offsetY {offset_y:+d}  "
          f"Luecken oben {top_gap} unten {max(0, H - bottom_start)}")

    if preview:
        z = 4
        pv = out.resize((W*z, H*z), Image.NEAREST).convert('RGB')
        px = pv.load()
        for x in range(W*z):                      # Bodenlinie markieren
            for dy in range(2):
                px[x, GROUND_Y*z + dy] = (255, 40, 40)
        p = os.path.splitext(out_path)[0] + '.preview.png'
        pv.save(p)
    return out

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('-o', '--out', required=True)
    ap.add_argument('--ground', type=float, required=True,
                    help='Bodenkante als Anteil der Bildhoehe, 0..1')
    ap.add_argument('--preview', action='store_true')
    a = ap.parse_args()
    prepare(a.src, a.out, a.ground, a.preview)
