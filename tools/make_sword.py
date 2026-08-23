#!/usr/bin/env python3
"""
make_sword.py — grosses Schwert als Sprite-Sheet (assets/props/sword_big.png)

8 Frames 10x30, Klinge zeigt im Sheet nach UNTEN (wie das alte sword_small.png:
Knauf Zeile 0, Griff 1..6, Parierstange 7..8, Klinge 9..29). Die Frames drehen
das Schwert um seine Laengsachse (Breite = |cos|), fuer das Rotieren am Altar.
In der Pfote nutzt das Spiel Frame 0 vertikal gespiegelt (Klinge nach oben),
Drehpunkt = Griffmitte (Zeile 4, ASSET_MANIFEST.sword.pivot).

Laenge 30 px ~ Brunos Koerperhoehe (33 px); Klinge 21 px lang, 4 px breit.
Nur Pillow, transparenter Hintergrund.

  python tools/make_sword.py [--preview out.png]
"""
import argparse, math, os
from PIL import Image

FW, FH, FRAMES = 10, 30, 8
OUT = (27, 16, 36, 255)
STEEL = (201, 211, 216, 255); STEEL_HI = (238, 243, 245, 255); STEEL_D = (140, 152, 160, 255)
GRIP = (138, 90, 46, 255); GRIP_D = (92, 58, 30, 255); GRIP_HI = (176, 122, 62, 255)
GOLD = (255, 210, 63, 255); GOLD_D = (184, 146, 31, 255); GOLD_HI = (255, 240, 150, 255)


def frame(k):
    im = Image.new('RGBA', (FW, FH), (0, 0, 0, 0)); px = im.load()
    w = abs(math.cos(k * math.pi / FRAMES))            # Breitenfaktor der Drehung
    cx = FW // 2                                         # Mittelachse (Spalte 5)
    def span(width):                                     # Spaltenbereich um die Achse
        n = max(1, int(round(width * w)))
        x0 = cx - n // 2
        return x0, x0 + n
    def fill(y, width, col, hi=None, dk=None):
        x0, x1 = span(width)
        for x in range(x0, x1):
            px[x, y] = col
        if hi is not None and x1 - x0 >= 2: px[x0, y] = hi
        if dk is not None and x1 - x0 >= 3: px[x1 - 1, y] = dk
    # Knauf
    fill(0, 4, GOLD, GOLD_HI, GOLD_D)
    # Griff
    for y in range(1, 7):
        fill(y, 3, GRIP if y % 2 else GRIP_D, GRIP_HI)
    # Parierstange (volle Breite)
    fill(7, 10, GOLD, GOLD_HI, GOLD_D); fill(8, 8, GOLD_D)
    # Klinge: 4 px breit, ab Zeile 24 verjuengend, Hohlkehle heller
    for y in range(9, FH):
        width = 4 if y < 24 else max(1, 4 - (y - 23))
        fill(y, width, STEEL, STEEL_HI, STEEL_D)
        x0, x1 = span(width)
        if x1 - x0 >= 3 and y < 22: px[x0 + 1, y] = STEEL_HI
    # Kontur: jeder gesetzte Pixel, der an Transparenz grenzt, bekommt aussen eine dunkle Linie
    src = im.copy(); sp = src.load()
    for y in range(FH):
        for x in range(FW):
            if sp[x, y][3]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < FW and 0 <= ny < FH and sp[nx, ny][3]:
                    px[x, y] = OUT; break
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', '--out', default=os.path.join(os.path.dirname(__file__), '..', 'assets', 'props', 'sword_big.png'))
    ap.add_argument('--preview', default=None)
    args = ap.parse_args()
    sheet = Image.new('RGBA', (FW * FRAMES, FH), (0, 0, 0, 0))
    for k in range(FRAMES):
        sheet.paste(frame(k), (k * FW, 0))
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    sheet.save(args.out)
    print(f'-> {args.out} {FRAMES} Frames {FW}x{FH}, Griffmitte Zeile 4')
    if args.preview:
        z = 8
        pv = Image.new('RGBA', (FW * FRAMES * z + 8 * FRAMES, FH * z), (60, 90, 60, 255))
        for k in range(FRAMES):
            f = sheet.crop((k * FW, 0, (k + 1) * FW, FH)).resize((FW * z, FH * z), Image.NEAREST)
            pv.paste(f, (k * (FW * z + 8), 0), f)
        pv.save(args.preview)


if __name__ == '__main__':
    main()
