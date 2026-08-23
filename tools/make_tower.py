#!/usr/bin/env python3
"""
make_tower.py — magischer Runenturm in Seitenansicht (assets/props/tower.png)

Stil nach tower_reference.png: grosse blaugraue Steinquader mit Fugen, Risse,
Verwitterung, Eisenbeschlaege, eine Lage Runensteine, Rundbogen aus Keilsteinen, schmale Fenster,
Steinbrocken und Runenplatten am Fuss. Die leuchtenden Runen, das Tor, die
Runenkonsole und das Licht zeichnet das Spiel selbst (animiert) — das Sprite
liefert nur das Mauerwerk. 160x126 px; Turmkoerper x 30..129, Bogen mittig.
Unten-mittig auf groundY+2 gesetzt ragt der Turm oben aus dem Bild.

  python tools/make_tower.py [--preview out.png]
"""
import argparse, os, random
from PIL import Image, ImageDraw

W, H = 160, 126
TX0, TX1 = 30, 130          # Turmkoerper
ARCH_CX, ARCH_W, ARCH_H = 80, 28, 44   # Rundbogen: Mitte, Breite, Hoehe ab Unterkante (Zeile 123)
BASE = 124                  # Bodenlinie im Sprite (= groundY + 2 - 2)

OUT = (27, 30, 40, 255)
MORTAR = (43, 47, 58, 255)
STONES = [(91, 100, 114), (104, 114, 130), (82, 92, 106), (112, 122, 138), (74, 82, 97)]
CRACK = (48, 52, 64, 255)
WEATHER = (128, 138, 154, 255)
IRON = (52, 58, 72, 255); IRON_D = (30, 34, 44, 255); IRON_HI = (118, 128, 146, 255)
RUNE_ST = (70, 80, 100, 255); RUNE_D = (44, 50, 64, 255); RUNE_HI = (150, 170, 205, 255)
WINDOW = (38, 34, 58, 255); WINDOW_L = (96, 86, 140, 255)
KEY = (122, 132, 150); KEY_D = (86, 94, 110)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', '--out', default=os.path.join(os.path.dirname(__file__), '..', 'assets', 'props', 'tower.png'))
    ap.add_argument('--preview', default=None)
    args = ap.parse_args()
    random.seed(11)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    px = im.load()

    # ---- Mauerwerk: Reihen a 9 px, unregelmaessige Quader, versetzte Fugen ----
    y = BASE
    row = 0
    while y > -10:
        h = 9
        x = TX0 + (random.randint(0, 6) if row % 2 else 0)
        # erster Stein von links bis x
        if x > TX0:
            d.rectangle([TX0, y - h, x - 1, y - 1], fill=random.choice(STONES))
        while x < TX1:
            w = random.randint(10, 22)
            x2 = min(TX1, x + w)
            col = random.choice(STONES)
            d.rectangle([x, y - h, x2 - 1, y - 1], fill=col)
            # Fuge rechts + unten
            d.line([x2 - 1, y - h, x2 - 1, y - 1], fill=MORTAR)
            # leichte Kante oben (heller)
            d.line([x, y - h, x2 - 2, y - h], fill=tuple(min(255, c + 14) for c in col))
            x = x2
        d.line([TX0, y - 1, TX1 - 1, y - 1], fill=MORTAR)
        y -= h
        row += 1
    # Verwitterung + Risse
    for _ in range(70):
        x, yy = random.randint(TX0 + 1, TX1 - 2), random.randint(0, BASE - 2)
        if px[x, yy][3]:
            px[x, yy] = WEATHER if random.random() < 0.5 else CRACK
    for _ in range(9):
        x, yy = random.randint(TX0 + 4, TX1 - 6), random.randint(4, BASE - 8)
        for i in range(random.randint(3, 7)):
            xx, yy2 = x + (i if random.random() < 0.6 else 0), yy + i
            if 0 <= xx < W and 0 <= yy2 < H and px[xx, yy2][3]:
                px[xx, yy2] = CRACK

    # ---- Rundbogen-Oeffnung (Innenraum dunkel, wird im Spiel uebermalt) ----
    ax0, ax1 = ARCH_CX - ARCH_W // 2, ARCH_CX + ARCH_W // 2
    top = BASE - ARCH_H
    r = ARCH_W // 2
    d.rectangle([ax0, top + r, ax1 - 1, BASE - 1], fill=(12, 10, 18, 255))
    d.pieslice([ax0, top, ax1 - 1, top + 2 * r - 1], 180, 360, fill=(12, 10, 18, 255))
    # Keilsteine rund um den Bogen (9 Stueck) + Pfosten-Steine
    import math
    for i in range(9):
        a = math.pi + math.pi * i / 8
        cx, cy = ARCH_CX + math.cos(a) * (r + 4), top + r + math.sin(a) * (r + 4)
        d.rectangle([int(cx) - 4, int(cy) - 4, int(cx) + 3, int(cy) + 3], fill=KEY, outline=KEY_D)
    for yy in range(top + r, BASE, 8):
        d.rectangle([ax0 - 7, yy, ax0 - 1, yy + 6], fill=KEY, outline=KEY_D)
        d.rectangle([ax1, yy, ax1 + 6, yy + 6], fill=KEY, outline=KEY_D)
    # Schwelle
    d.rectangle([ax0 - 8, BASE - 2, ax1 + 7, BASE - 1], fill=(112, 122, 138, 255))

    # ---- kein Holz: dunkle Eisenbeschlaege an den Kanten, Runenstein-Lage statt Balken ----
    for x in (TX0 + 2, TX1 - 6):
        d.rectangle([x, 0, x + 3, BASE - ARCH_H - 10], fill=IRON)
        d.line([x, 0, x, BASE - ARCH_H - 10], fill=IRON_HI); d.line([x + 3, 0, x + 3, BASE - ARCH_H - 10], fill=IRON_D)
        for yy in range(3, BASE - ARCH_H - 10, 7):
            px[x + 1, yy] = IRON_HI; px[x + 2, yy + 1] = IRON_D                  # Nieten
    d.rectangle([TX0 + 6, 41, TX1 - 7, 46], fill=RUNE_ST)                        # Runenstein-Lage
    d.line([TX0 + 6, 41, TX1 - 7, 41], fill=RUNE_HI); d.line([TX0 + 6, 46, TX1 - 7, 46], fill=RUNE_D)
    for rx in range(TX0 + 9, TX1 - 9, 11):
        d.line([rx, 41, rx, 46], fill=RUNE_D)                                    # Fugen
        for (gx, gy) in [(0, 0), (1, 1), (2, 0), (1, 2), (1, 3)]:                # kleine Ritzrune
            px[rx + 4 + gx, 42 + gy] = RUNE_HI
    for (mx, my) in [(TX0 + 8, 8), (TX1 - 13, 8), (ARCH_CX - 3, 24)]:            # Metallplatten mit Nieten
        d.rectangle([mx, my, mx + 5, my + 5], fill=IRON, outline=IRON_D)
        px[mx + 1, my + 1] = IRON_HI; px[mx + 4, my + 4] = IRON_HI
    # ---- zwei schmale Fenster ----
    for (wx, wy) in [(ARCH_CX - 22, 18), (ARCH_CX + 18, 54)]:
        d.rectangle([wx - 2, wy - 1, wx + 3, wy + 11], fill=OUT)
        d.rectangle([wx - 1, wy, wx + 2, wy + 10], fill=WINDOW)
        d.rectangle([wx, wy + 3, wx + 1, wy + 7], fill=WINDOW_L)

    # ---- Kontur um den Turm ----
    d.line([TX0, 0, TX0, BASE], fill=OUT); d.line([TX1 - 1, 0, TX1 - 1, BASE], fill=OUT)
    d.line([TX0, BASE, TX1 - 1, BASE], fill=OUT)

    # ---- Runenplatten + Steinbrocken am Fuss (ausserhalb des Turms) ----
    def slab(x, y, w, h):
        d.rounded_rectangle([x, y, x + w, y + h], radius=3, fill=(88, 98, 112, 255), outline=OUT)
        d.line([x + 2, y + 1, x + w - 2, y + 1], fill=(118, 128, 144, 255))
    slab(6, BASE - 6, 22, 7); slab(132, BASE - 7, 24, 8)
    for (x, y, w, h) in [(2, BASE - 10, 6, 5), (20, BASE - 12, 5, 4), (140, BASE - 14, 7, 6), (152, BASE - 9, 5, 4), (12, BASE - 15, 4, 3)]:
        d.ellipse([x, y, x + w, y + h], fill=(96, 106, 120, 255), outline=OUT)
    # Bodenzeile unter allem (Schwelle) bis Sprite-Unterkante
    d.rectangle([0, BASE, W - 1, H - 1], fill=(0, 0, 0, 0))

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    im.save(args.out)
    print(f'-> {args.out} {W}x{H}  Bogen: x {ax0}..{ax1}, oben {top}, Boden {BASE}')
    if args.preview:
        z = 4
        pv = Image.new('RGBA', (W * z, H * z), (16, 14, 30, 255))
        big = im.resize((W * z, H * z), Image.NEAREST); pv.paste(big, (0, 0), big); pv.save(args.preview)


if __name__ == '__main__':
    main()
