#!/usr/bin/env python3
"""
make_treegate.py — Baumtor fuer die Musterwahl (assets/props/treegate.png)

Zwei alte Baeume links und rechts, oben ineinandergewachsene Aeste als
natuerlicher Torbogen, knorrige Staemme mit Rindenstruktur, Wurzeln ueber den
Boden, dichtes Blattwerk mit gezacktem Rand und dunklen Blaetterballen fuer
Tiefe. Der Durchgang bleibt frei — Ranken, geschnitztes Dreieck und die
geschnitzten Muster zeichnet das Spiel (animiert). Nur Pillow.

Alle Formen sind in einem 208x124-Raster entworfen und werden ueber SCALE
(1.12 = +12 %) in das Sprite gezeichnet (der Zeichen-Proxy skaliert jede
Koordinate), damit die Pixel 1:1 zum Spielraster bleiben. Ausgabe 233x139.
Unten-mittig auf (128, groundY+4) gesetzt. Das Script gibt die Weltkoordinaten
von Durchgang, Rindentafel und Musterspalten aus (fuer scenes.js).

  python tools/make_treegate.py [--preview out.png]
"""
import argparse, math, os, random
from PIL import Image, ImageDraw

SCALE = 1.12
W0, H0 = 208, 124
W, H = int(round(W0 * SCALE)), int(round(H0 * SCALE))
G = 120                       # Bodenlinie im Entwurfsraster (= groundY)
OUT = (27, 16, 36, 255)
BARK = (90, 58, 34, 255); BARK_D = (62, 40, 22, 255); BARK_L = (122, 82, 48, 255); BARK_X = (46, 28, 16, 255)
MOSS = (79, 122, 46, 255); MOSS_L = (112, 160, 64, 255)
LEAF_D = (38, 92, 44, 255); LEAF = (66, 138, 62, 255); LEAF_L = (124, 196, 88, 255); LEAF_X = (170, 224, 120, 255)
PLAQUE = (104, 70, 40, 255); PLAQUE_L = (132, 92, 54, 255)
PANEL = (104, 70, 40, 255)


class SD:
    """ImageDraw-Proxy: skaliert alle Koordinaten/Breiten mit SCALE."""
    def __init__(self, draw): self.d = draw
    @staticmethod
    def _pts(seq):
        out = []
        for p in seq:
            if isinstance(p, (tuple, list)): out.append((p[0] * SCALE, p[1] * SCALE))
            else: out.append(p * SCALE)
        return out
    def polygon(self, pts, **kw): self.d.polygon(self._pts(pts), **kw)
    def line(self, pts, width=1, **kw): self.d.line(self._pts(pts), width=max(1, int(round(width * SCALE))), **kw)
    def ellipse(self, box, **kw): self.d.ellipse(self._pts(box), **kw)
    def rectangle(self, box, **kw): self.d.rectangle(self._pts(box), **kw)


def S(v): return int(round(v * SCALE))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', '--out', default=os.path.join(os.path.dirname(__file__), '..', 'assets', 'props', 'treegate.png'))
    ap.add_argument('--preview', default=None)
    args = ap.parse_args()
    random.seed(21)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = SD(ImageDraw.Draw(im))
    wood = Image.new('L', (W, H), 0); wd = SD(ImageDraw.Draw(wood))
    leaf = Image.new('L', (W, H), 0); ld = SD(ImageDraw.Draw(leaf))
    dark = Image.new('L', (W, H), 0); dd = SD(ImageDraw.Draw(dark))

    def trunk(cx, flare):
        def half(y):
            k = (y - 56) / (G - 56)
            return 10 + 4 * k + 7 * k * k
        def wob(y):
            return math.sin(y * 0.09 + cx) * 2.2 + math.sin(y * 0.31 + cx * 0.5) * 0.8
        pts = [(cx - half(y) + wob(y), y) for y in range(56, G + 1)]
        pts += [(cx + half(y) + wob(y) * 0.6, y) for y in range(G, 55, -1)]
        wd.polygon(pts, fill=255)
        for (sy, sd) in [(74, -1), (92, 1)]:                                   # Aststummel
            wd.polygon([(cx + sd * half(sy), sy - 3), (cx + sd * (half(sy) + 9), sy - 9), (cx + sd * (half(sy) + 10), sy - 6), (cx + sd * half(sy), sy + 3)], fill=255)
        for (dx, ln, th) in [(-1, 40, 8), (-1, 24, 6), (1, 22, 6), (1, 36, 7), (-1, 12, 5)]:   # Wurzeln
            if flare > 0: dx = -dx
            x0 = cx + dx * (half(G) - 6)
            for i in range(0, 13):
                k = i / 12
                x = x0 + dx * ln * k
                y = G - 9 + 11 * (k ** 0.8) + math.sin(i * 1.9 + cx) * 0.8
                r = th * (1 - k * 0.8) / 2 + 1
                wd.ellipse([x - r, y - r, x + r, y + r], fill=255)
    trunk(68, -1)
    trunk(140, 1)

    def branch(pts, w0, w1):
        n = len(pts) - 1
        for i in range(n):
            w = w0 + (w1 - w0) * i / max(1, n - 1)
            wd.line([pts[i], pts[i + 1]], fill=255, width=w)
            wd.ellipse([pts[i + 1][0] - w / 2, pts[i + 1][1] - w / 2, pts[i + 1][0] + w / 2, pts[i + 1][1] + w / 2], fill=255)
    branch([(72, 60), (86, 50), (100, 42), (112, 36), (124, 34)], 11, 6)
    branch([(136, 60), (122, 50), (108, 42), (96, 36), (84, 34)], 11, 6)
    branch([(60, 60), (52, 44), (44, 30), (40, 16)], 10, 4)
    branch([(148, 60), (156, 44), (164, 30), (168, 16)], 10, 4)
    branch([(70, 58), (78, 40), (80, 24)], 8, 4)
    branch([(138, 58), (130, 40), (128, 24)], 8, 4)
    branch([(78, 62), (92, 58), (104, 56), (116, 58), (130, 62)], 9, 9)      # Querast (Sturz)

    # ---- Rinde ----
    wp = wood.load(); px = im.load()
    for y in range(H):
        for x in range(W):
            if not wp[x, y]:
                continue
            streak = math.sin(x * 1.7 + math.sin(y * 0.06) * 3) + random.uniform(-0.3, 0.3)
            col = BARK
            if streak > 0.75: col = BARK_L
            elif streak < -0.7: col = BARK_D
            if (x * 7 + y * 13) % 97 == 0: col = BARK_X
            px[x, y] = col
    for (kx, ky) in [(62, 78), (76, 98), (146, 84), (134, 104), (60, 104), (148, 70)]:        # Knoten
        d.ellipse([kx - 3, ky - 2, kx + 3, ky + 2], fill=BARK_X, outline=BARK_D)
        px[S(kx), S(ky - 1)] = BARK_L
    for (mx, my, mw, mh) in [(54, 112, 14, 6), (70, 116, 18, 5), (140, 114, 16, 6), (152, 110, 12, 5), (48, 98, 6, 10), (160, 92, 6, 12)]:   # Moos
        for y in range(S(my), S(my + mh)):
            for x in range(S(mx), S(mx + mw)):
                if 0 <= x < W and 0 <= y < H and wp[x, y] and random.random() < 0.75:
                    px[x, y] = MOSS_L if random.random() < 0.3 else MOSS
    # Rindentafel (Dreieck) + glatte Flaechen fuer die Muster
    d.rectangle([95, 44, 113, 61], fill=OUT)
    d.rectangle([96, 45, 112, 60], fill=PLAQUE)
    d.line([96, 45, 112, 45], fill=PLAQUE_L); d.line([96, 45, 96, 60], fill=PLAQUE_L)
    wd.rectangle([95, 44, 113, 61], fill=255)
    for x0 in (55, 71, 127, 143):
        d.rectangle([x0, 66, x0 + 11, 108], fill=PANEL)
        d.line([x0, 66, x0 + 11, 66], fill=BARK_D); d.line([x0, 66, x0, 108], fill=BARK_D)
    # Kontur um alles Holz
    for y in range(H):
        for x in range(W):
            if not wp[x, y]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= W or ny >= H or not wp[nx, ny]:
                    px[x, y] = OUT
                    break

    # ---- Laubkrone: Ballen + gezackter Rand (kleine Ellipsen entlang der Unterkante) ----
    blobs = [(40, 18, 34, 22), (72, 10, 40, 24), (104, 6, 44, 22), (136, 10, 40, 24), (168, 18, 34, 22),
             (20, 34, 26, 16), (188, 34, 26, 16), (56, 30, 30, 16), (152, 30, 30, 16), (104, 22, 30, 14),
             (88, 58, 14, 9), (120, 58, 14, 9), (36, 48, 16, 10), (172, 48, 16, 10)]
    for (bx, by, rx, ry) in blobs:
        ld.ellipse([bx - rx, by - ry, bx + rx, by + ry], fill=255)
    for i in range(0, 200, 9):                                                 # gezackte Unterkante
        bx, by = 6 + i, 50 + math.sin(i * 0.45) * 4 + (8 if 60 < i < 150 else 0)
        ld.ellipse([bx - 6, by - 4, bx + 6, by + 4], fill=255)
    for (hx, hy, hr) in [(60, 12, 5), (150, 8, 4), (100, 30, 3), (180, 26, 4), (30, 30, 3)]:   # Lichtloecher
        ld.ellipse([hx - hr, hy - hr // 2, hx + hr, hy + hr // 2], fill=0)
    for (bx, by, rx, ry) in [(50, 36, 16, 8), (150, 34, 18, 8), (104, 40, 20, 7), (24, 44, 10, 5), (186, 44, 10, 5)]:   # dunkle Ballen (Tiefe)
        dd.ellipse([bx - rx, by - ry, bx + rx, by + ry], fill=255)
    lp = leaf.load(); dp = dark.load()
    for y in range(H):
        for x in range(W):
            if not lp[x, y] or (wp[x, y] and y > S(40)):
                continue
            shade = (y - S(10)) / S(60) + random.uniform(-0.25, 0.25)
            col = LEAF_L if shade < 0.25 else LEAF if shade < 0.7 else LEAF_D
            if shade < 0.08 and random.random() < 0.35: col = LEAF_X
            if dp[x, y] and random.random() < 0.7: col = LEAF_D
            px[x, y] = col
    for y in range(H):                                                         # Laubkontur gegen Himmel
        for x in range(W):
            if px[x, y][3] == 0 or px[x, y] == OUT or not lp[x, y]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= W or ny >= H or px[nx, ny][3] == 0:
                    px[x, y] = OUT
                    break
    for (hx, hy) in [(90, 66), (94, 70), (118, 68), (122, 64), (100, 64), (112, 66), (86, 72), (126, 70)]:   # haengende Blaetter
        for (dx, dy, c) in [(0, 0, LEAF), (0, 1, LEAF_D), (1, 0, LEAF_L), (-1, 1, OUT), (1, 2, OUT)]:
            X, Y = S(hx) + dx, S(hy) + dy
            if 0 <= X < W and 0 <= Y < H:
                px[X, Y] = c

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    im.save(args.out)
    # Weltkoordinaten (Sprite unten-mittig auf (128, groundY+4); groundY = 112)
    ox, oy = round(128 - W / 2), 116 - H
    def wx(v): return round(ox + v * SCALE)
    def wy(v): return round(oy + v * SCALE)
    print(f'-> {args.out} {W}x{H}')
    print(f'   Durchgang Welt x {wx(84)}..{wx(124)}, Sturz-Unterkante y {wy(62)}')
    print(f'   Rindentafel Mitte ({(wx(95) + wx(113)) // 2}, {(wy(44) + wy(61)) // 2})')
    print(f'   Musterspalten Mitte x {[ (wx(x0) + wx(x0 + 11)) // 2 for x0 in (55, 71, 127, 143) ]}, Flaeche y {wy(66)}..{wy(108)}')
    if args.preview:
        z = 4
        pv = Image.new('RGBA', (W * z, H * z), (120, 170, 200, 255))
        big = im.resize((W * z, H * z), Image.NEAREST); pv.paste(big, (0, 0), big); pv.save(args.preview)


if __name__ == '__main__':
    main()
