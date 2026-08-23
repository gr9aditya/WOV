#!/usr/bin/env python3
"""
make_boat.py — Ruderboot in Seitenansicht als Pixel-Sprite (assets/props/boat.png)

Stil nach boat_reference.png (Holzplanken mit Maserung, Farbverlauf hell oben ->
dunkel unten, dunkle Kontur, Sitzbaenke, Ruder, Tau, Anker), aber in reiner
Seitenansicht fuer die Flussszene. 56x26 px, Bug rechts. Nur Pillow.

  python tools/make_boat.py            -> assets/props/boat.png (+ Vorschau in --preview)
"""
import argparse, os, random
from PIL import Image, ImageDraw

W, H = 56, 26
OUTLINE = (27, 16, 36, 255)
SEAM = (42, 24, 16, 255)
INTERIOR = (38, 22, 14, 255)
BENCH = (168, 116, 60, 255)
BENCH_D = (110, 74, 38, 255)
OAR = (138, 90, 46, 255); OAR_HI = (176, 122, 62, 255); OAR_D = (74, 47, 24, 255)
ROPE = (217, 178, 74, 255); ROPE_D = (166, 130, 50, 255)
ANCHOR = (92, 92, 102, 255); ANCHOR_HI = (150, 150, 160, 255)
PLANK_TOP = (176, 122, 62)
PLANK_BOT = (74, 47, 24)


def lerp(a, b, k):
    return tuple(int(round(a[i] + (b[i] - a[i]) * k)) for i in range(3)) + (255,)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', '--out', default=os.path.join(os.path.dirname(__file__), '..', 'assets', 'props', 'boat.png'))
    ap.add_argument('--preview', default=None)
    args = ap.parse_args()
    random.seed(7)

    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    px = im.load()

    # ---- Rumpf (nahe Bordwand) als Polygon: Heck links, Bug rechts hochgezogen ----
    hull = [(3, 9), (14, 8), (30, 8), (46, 8), (53, 3), (54, 5), (52, 12), (47, 20), (40, 24), (24, 25), (10, 24), (4, 20), (2, 14)]
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).polygon(hull, fill=255)
    m = mask.load()
    # hinterer Bordrand (ferne Bordwand) ein wenig hoeher -> Innenraum sichtbar
    far = [(6, 6), (15, 5), (31, 5), (46, 5), (52, 2), (53, 3), (46, 8), (30, 8), (14, 8), (4, 9)]
    fmask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(fmask).polygon(far, fill=255)
    fm = fmask.load()

    # Planken: Farbverlauf hell oben -> dunkel unten, Fuge alle 4 Zeilen, Maserung
    for y in range(H):
        for x in range(W):
            if not m[x, y]:
                continue
            k = (y - 8) / (25 - 8)
            col = lerp(PLANK_TOP, PLANK_BOT, max(0.0, min(1.0, k)))
            if (y - 8) % 4 == 3:
                col = SEAM
            px[x, y] = col
    # Maserung: kurze hellere/dunklere Striche innerhalb der Planken
    for y in range(9, 25):
        if (y - 8) % 4 == 3:
            continue
        for _ in range(3):
            x0 = random.randint(4, 46)
            ln = random.randint(3, 8)
            light = random.random() < 0.5
            for x in range(x0, min(W, x0 + ln)):
                if m[x, y] and px[x, y] != SEAM:
                    r, g, b, a = px[x, y]
                    d = 18 if light else -16
                    px[x, y] = (max(0, min(255, r + d)), max(0, min(255, g + d)), max(0, min(255, b + d)), 255)
    # Astloch
    for (x, y) in [(33, 17), (34, 17), (33, 18)]:
        if m[x, y]:
            px[x, y] = (58, 36, 20, 255)

    # ---- Innenraum zwischen ferner und naher Bordwand + Sitzbaenke ----
    for y in range(H):
        for x in range(W):
            if fm[x, y] and not m[x, y]:
                px[x, y] = INTERIOR
    for (x0, x1) in [(12, 19), (28, 35)]:
        for x in range(x0, x1 + 1):
            px[x, 6] = BENCH
            px[x, 7] = BENCH_D
    # Bordrand-Leiste (helle Oberkante der nahen Bordwand)
    for x in range(4, 47):
        if m[x, 8]:
            px[x, 8] = lerp(PLANK_TOP, (230, 180, 110), 0.35)

    # ---- Kontur: Rand der Gesamtform (Rumpf + ferne Bordwand) ----
    allm = [[(m[x, y] or fm[x, y]) for y in range(H)] for x in range(W)]
    for y in range(H):
        for x in range(W):
            if not allm[x][y]:
                continue
            edge = False
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= W or ny >= H or not allm[nx][ny]:
                    edge = True
            if edge:
                px[x, y] = OUTLINE

    # ---- Tau: aufgeschossen am Bug + haengendes Ende ----
    coil = [(44, 2), (45, 2), (46, 2), (43, 3), (47, 3), (43, 4), (44, 4), (45, 4), (46, 4), (47, 4), (44, 3), (46, 3)]
    for (x, y) in coil:
        px[x, y] = ROPE if (x + y) % 2 == 0 else ROPE_D
    for (x, y) in [(48, 5), (48, 6), (49, 7), (49, 8), (49, 9), (48, 10)]:
        px[x, y] = ROPE_D
    # Anker-Symbol auf der Bordwand
    anchor = [(39, 11), (39, 12), (39, 13), (39, 14), (39, 15), (39, 16), (37, 13), (38, 13), (40, 13), (41, 13),
              (36, 15), (36, 16), (37, 17), (38, 17), (40, 17), (41, 17), (42, 16), (42, 15)]
    for (x, y) in anchor:
        px[x, y] = ANCHOR
    px[39, 10] = ANCHOR_HI; px[38, 11] = ANCHOR_HI; px[40, 11] = ANCHOR_HI

    # ---- Ruder: Dolle an der Bordwand, Schaft schraeg nach links unten, Blatt im Wasser ----
    px[25, 7] = ANCHOR; px[26, 7] = ANCHOR_HI
    for i in range(16):
        x, y = 26 - i, 8 + int(i * 0.75)
        if 0 <= x < W and 0 <= y < H:
            px[x, y] = OAR_HI if i < 6 else OAR
            if y + 1 < H:
                px[x, y + 1] = OAR_D
    for (x, y) in [(9, 20), (8, 20), (7, 21), (6, 21), (5, 22), (9, 21), (8, 22), (7, 22), (6, 23), (8, 21), (10, 20)]:
        px[x, y] = OAR
    for (x, y) in [(4, 22), (5, 23), (6, 24), (7, 23), (9, 22), (10, 21), (11, 20)]:
        px[x, y] = OUTLINE
    # Griffende des Ruders ueber dem Boot
    for (x, y) in [(27, 6), (28, 5), (29, 4)]:
        px[x, y] = OAR_HI
    px[30, 3] = OAR_D

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    im.save(args.out)
    print(f'-> {args.out} {W}x{H}')
    if args.preview:
        z = 8
        pv = Image.new('RGBA', (W * z + 16, H * z + 16), (159, 216, 242, 255))
        pv.paste(im.resize((W * z, H * z), Image.NEAREST), (8, 8), im.resize((W * z, H * z), Image.NEAREST))
        pv.save(args.preview)
        print(f'-> {args.preview}')


if __name__ == '__main__':
    main()
