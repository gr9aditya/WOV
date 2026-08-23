#!/usr/bin/env python3
"""
make_boat.py — Ruderboot in Seitenansicht als Pixel-Sprite
  assets/props/boat.png        ganzes Boot (72x29, Bug rechts)
  assets/props/boat_front.png  nur die nahe Bordwand (ab Zeile RIM) — wird waehrend
                               der Fahrt VOR Bruno gezeichnet, damit seine Beine im
                               Boot verschwinden (hinterer Bootsteil, Bruno, Bordwand).

Stil nach boat_reference.png: Holzplanken mit Maserung, Farbverlauf hell oben ->
dunkel unten, dunkle Kontur, Sitzbaenke, Ruder, Tau, Anker. Gegenueber der
ersten Fassung (56x26) ~29 % breiter und ~12 % hoeher; alle Koordinaten laufen
ueber T() aus der alten 56x26-Vorlage, damit die Proportionen stimmen.

  python tools/make_boat.py [--preview out.png]
"""
import argparse, os, random
from PIL import Image, ImageDraw

W, H = 72, 29
SX, SY = W / 56, H / 26
RIM = 9                       # Sprite-Zeile der nahen Bordrand-Oberkante (alt: 8)
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


def T(x, y):
    return (int(round(x * SX)), int(round(y * SY)))


def lerp(a, b, k):
    return tuple(int(round(a[i] + (b[i] - a[i]) * k)) for i in range(3)) + (255,)


def put(px, x, y, col):
    if 0 <= x < W and 0 <= y < H:
        px[x, y] = col


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', '--out', default=os.path.join(os.path.dirname(__file__), '..', 'assets', 'props', 'boat.png'))
    ap.add_argument('--preview', default=None)
    args = ap.parse_args()
    random.seed(7)

    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    px = im.load()

    # ---- Rumpf (nahe Bordwand): Heck links, Bug rechts hochgezogen ----
    hull = [T(*p) for p in [(3, 9), (14, 8), (30, 8), (46, 8), (53, 3), (54, 5), (52, 12), (47, 20), (40, 24), (24, 25), (10, 24), (4, 20), (2, 14)]]
    # Bordrand exakt auf Zeile RIM ziehen
    hull = [(x, RIM if y == T(0, 8)[1] else y) for (x, y) in hull]
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).polygon(hull, fill=255)
    m = mask.load()
    # ferne Bordwand etwas hoeher -> Innenraum sichtbar
    far = [T(*p) for p in [(6, 6), (15, 5), (31, 5), (46, 5), (52, 2), (53, 3), (46, 8), (30, 8), (14, 8), (4, 9)]]
    fmask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(fmask).polygon(far, fill=255)
    fm = fmask.load()
    keel = max(y for (_, y) in hull)

    # Planken: Verlauf hell -> dunkel, Fuge alle 5 Zeilen, Maserung
    for y in range(H):
        for x in range(W):
            if not m[x, y]:
                continue
            k = (y - RIM) / max(1, keel - RIM)
            col = lerp(PLANK_TOP, PLANK_BOT, max(0.0, min(1.0, k)))
            if (y - RIM) % 5 == 4:
                col = SEAM
            px[x, y] = col
    for y in range(RIM + 1, keel):
        if (y - RIM) % 5 == 4:
            continue
        for _ in range(4):
            x0 = random.randint(5, W - 12)
            ln = random.randint(4, 10)
            light = random.random() < 0.5
            for x in range(x0, min(W, x0 + ln)):
                if m[x, y] and px[x, y] != SEAM:
                    r, g, b, a = px[x, y]
                    d = 18 if light else -16
                    px[x, y] = (max(0, min(255, r + d)), max(0, min(255, g + d)), max(0, min(255, b + d)), 255)
    # Astloch
    kx, ky = T(33, 17)
    for (x, y) in [(kx, ky), (kx + 1, ky), (kx, ky + 1), (kx + 1, ky + 1)]:
        if m[x, y]:
            px[x, y] = (58, 36, 20, 255)

    # ---- Innenraum + Sitzbaenke ----
    for y in range(H):
        for x in range(W):
            if fm[x, y] and not m[x, y]:
                px[x, y] = INTERIOR
    by = T(0, 6)[1]
    for (x0, x1) in [T(12, 0)[0:1] + T(19, 0)[0:1], T(28, 0)[0:1] + T(35, 0)[0:1]]:
        for x in range(x0, x1 + 1):
            put(px, x, by, BENCH); put(px, x, by + 1, BENCH_D)
    # helle Oberkante der nahen Bordwand
    for x in range(W):
        if m[x, RIM]:
            px[x, RIM] = lerp(PLANK_TOP, (230, 180, 110), 0.35)

    # ---- Kontur ----
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

    # ---- Tau am Bug ----
    cx0, cy0 = T(45, 3)
    for dx in range(-2, 3):
        for dy in range(-1, 2):
            if abs(dx) + abs(dy) <= 2:
                put(px, cx0 + dx, cy0 + dy, ROPE if (dx + dy) % 2 == 0 else ROPE_D)
    hx, hy = T(48, 5)
    for i in range(6):
        put(px, hx + (1 if i > 1 else 0), hy + i, ROPE_D)
    # ---- Anker-Symbol auf der Bordwand ----
    ax, ay = T(39, 13)
    for (dx, dy) in [(0, -2), (0, -1), (0, 0), (0, 1), (0, 2), (0, 3), (-2, 0), (-1, 0), (1, 0), (2, 0), (-3, 2), (-3, 3), (-2, 4), (-1, 4), (1, 4), (2, 4), (3, 3), (3, 2)]:
        put(px, ax + dx, ay + dy, ANCHOR)
    put(px, ax, ay - 3, ANCHOR_HI); put(px, ax - 1, ay - 2, ANCHOR_HI); put(px, ax + 1, ay - 2, ANCHOR_HI)

    # ---- Ruder: Dolle, Schaft schraeg nach links unten, Blatt im Wasser ----
    dx0, dy0 = T(25, 7)
    put(px, dx0, dy0, ANCHOR); put(px, dx0 + 1, dy0, ANCHOR_HI)
    n = int(16 * SX)
    for i in range(n):
        x, y = dx0 - i, RIM - 1 + int(i * 0.75 * SY / SX)
        put(px, x, y, OAR_HI if i < 8 else OAR)
        put(px, x, y + 1, OAR_D)
    bx0, by0 = T(7, 21)
    for (dx, dy) in [(2, -1), (1, -1), (0, 0), (-1, 0), (-2, 1), (2, 0), (1, 1), (0, 1), (-1, 2), (1, 0), (3, -1), (3, -2)]:
        put(px, bx0 + dx, by0 + dy, OAR)
    for (dx, dy) in [(-3, 1), (-2, 2), (-1, 3), (0, 2), (2, 1), (3, 0), (4, -1), (4, -2)]:
        put(px, bx0 + dx, by0 + dy, OUTLINE)
    gx, gy = T(27, 6)
    for i in range(4):
        put(px, gx + i, gy - i, OAR_HI)
    put(px, gx + 4, gy - 4, OAR_D)

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    im.save(args.out)
    # nahe Bordwand (ab Zeile RIM) als eigene Ebene: Bruno sitzt dazwischen
    front = im.copy()
    fp = front.load()
    for y in range(RIM):
        for x in range(W):
            fp[x, y] = (0, 0, 0, 0)
    for y in range(RIM, H):
        for x in range(W):
            if not m[x, y]:
                fp[x, y] = (0, 0, 0, 0)
    front_path = os.path.join(os.path.dirname(os.path.abspath(args.out)), 'boat_front.png')
    front.save(front_path)
    print(f'-> {args.out} {W}x{H}, Bordrand Zeile {RIM}, Kiel Zeile {keel}; {front_path}')
    if args.preview:
        z = 6
        pv = Image.new('RGBA', (W * z * 2 + 12, H * z), (60, 120, 160, 255))
        pv.paste(im.resize((W * z, H * z), Image.NEAREST), (0, 0), im.resize((W * z, H * z), Image.NEAREST))
        pv.paste(front.resize((W * z, H * z), Image.NEAREST), (W * z + 12, 0), front.resize((W * z, H * z), Image.NEAREST))
        pv.save(args.preview)


if __name__ == '__main__':
    main()
