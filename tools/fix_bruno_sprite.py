#!/usr/bin/env python3
"""
fix_bruno_sprite.py — zwei Korrekturen am Bruno-Sheet (assets/bruno/idle.png, 8 Frames 32x32)

1. Fusspunkt: Im Idle (Frame 0/1) stand nur die vordere Fussspitze (4 px) in der
   untersten Zeile 29, der hintere Fuss endete in Zeile 28 — 1 px ueber dem Boden.
   Jetzt reichen beide Fuesse bis Zeile 29 (Sohle des hinteren Fusses eine Zeile
   nach unten verlaengert). Alle acht Frames enden damit in Zeile 29 = gemeinsamer
   Fussanker; padBottom bleibt 2 (Zeilen 30/31 leer).

2. Arme beim Laufen: In Frame 2 waren beide Arme auf Schulterhoehe seitlich
   ausgestreckt, in Frame 3/7 seitlich abgespreizt. Die Arme werden durch die
   haengenden Arme aus Frame 4 (Durchgangspose) ersetzt; Frame 3/7 bekommen den
   linken Arm 1 px hoeher (kleiner Gegenschwung zu den Beinen). Beine, Koerper,
   Kopf und Frame-Anzahl bleiben unveraendert.

Wird auf idle.png UND idle_original.png angewendet (gleiche Pixeloperationen,
nur Umkopieren innerhalb desselben Bildes — funktioniert fuer beide Paletten).

  python tools/fix_bruno_sprite.py [--preview out.png]
"""
import argparse, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
FILES = [os.path.join(HERE, '..', 'assets', 'bruno', 'idle.png'), os.path.join(HERE, '..', 'assets', 'bruno', 'idle_original.png')]
FW = 32
# Armbereiche (Spalten) links und rechts des Rumpfes, Zeilen 13..24
L_COLS, R_COLS, ROWS = range(0, 12), range(21, 32), range(13, 25)


def frame_px(im, f):
    return im.crop((f * FW, 0, (f + 1) * FW, im.height))


def fix(path):
    im = Image.open(path).convert('RGBA')
    px = im.load()
    src = frame_px(im, 4).load()            # Durchgangspose: Arme haengen
    # --- 2. Arme: Frame 2 (dy 0), Frame 3 und 7 (linker Arm dy -1) ---
    # links: Spalten 0..11 in den Zeilen 13..21, Zeilen 22/23 nur bis Spalte 10 (Bein-Kontur bleibt);
    # rechts: Spalten 21..31 in den Zeilen 13..23
    for f, dy in ((2, 0), (3, -1), (7, -1)):
        ox = f * FW
        for y in ROWS:
            for x in list(L_COLS) + list(R_COLS):
                if x in L_COLS and (y > 23 or (y > 21 and x > 10)):
                    continue
                if x in R_COLS and y > 23:
                    continue
                sy = y - dy if x in L_COLS else y
                px[ox + x, y] = src[x, sy] if 0 <= sy < im.height else (0, 0, 0, 0)
    # --- 1. Fuesse im Idle: hinteren Fuss (Spalten 19..22) um eine Zeile nach unten ziehen ---
    for f in (0, 1):
        ox = f * FW
        for x in range(19, 23):
            if px[ox + x, 28][3] and not px[ox + x, 29][3]:
                px[ox + x, 29] = px[ox + x, 28]
    im.save(path)
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', default=None)
    args = ap.parse_args()
    last = None
    for p in FILES:
        if os.path.exists(p):
            last = fix(p)
            print('->', os.path.relpath(p, os.path.join(HERE, '..')))
    if args.preview and last is not None:
        z = 6
        pv = Image.new('RGBA', (8 * (FW * z + 4), 32 * z), (60, 90, 60, 255))
        for f in range(8):
            fr = frame_px(last, f).resize((FW * z, 32 * z), Image.NEAREST)
            pv.paste(fr, (f * (FW * z + 4), 0), fr)
        pv.save(args.preview)


if __name__ == '__main__':
    main()
