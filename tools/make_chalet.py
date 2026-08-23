#!/usr/bin/env python3
"""
make_chalet.py — Brunos Chalet als Pixel-Sprite (assets/props/chalet.png, 112x92)

Gleiche Silhouette, Position und Grundfarbe wie die bisherige Code-Zeichnung
(chalet() in scenes.js): Steinsockel, braune Holzfassade mit Balkenlagen,
Giebel, drei Fenster mit Laeden und Geranien, Tuer (Bruno startet davor),
Balkon, weit ueberstehendes Dach mit Schindeln und Dachsteinen, Steinkamin.
Neu: durchgehende dunkle Pixelkontur, Schattenseite rechts, Lichtkanten,
Schindelreihen mit Licht/Schatten. 1 Sprite-Pixel = 1 Spiel-Pixel.

Im Spiel unten-mittig auf (53, groundY) gesetzt -> deckt Welt-x -3..109.

  python tools/make_chalet.py [--preview out.png]
"""
import argparse, os
from PIL import Image, ImageDraw

W, H = 112, 92
OX, G = 3, 92                       # Welt-x + OX = Sprite-x; Welt-y = g - (G - Sprite-y)
OUT = (27, 16, 36, 255)
WOOD = (58, 36, 22, 255); WOOD_D = (42, 24, 16, 255); WOOD_H = (90, 58, 34, 255); BEAM = (78, 51, 32, 255)
WOOD_S = (48, 30, 18, 255)          # Schattenseite
ROOF = (74, 50, 36, 255); ROOF_H = (94, 64, 48, 255); ROOF_D = (56, 38, 27, 255)
STONE = (107, 107, 107, 255); STONE_D = (74, 74, 74, 255); STONE_L = (138, 138, 138, 255)
WIN = (255, 210, 122, 255); WIN_W = (255, 179, 71, 255); SHUT = (47, 82, 51, 255); SHUT_L = (66, 110, 70, 255)
GER = (214, 69, 69, 255); GER_H = (240, 96, 96, 255); GRASS = (82, 134, 63, 255); GOLD = (255, 210, 63, 255)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', '--out', default=os.path.join(os.path.dirname(__file__), '..', 'assets', 'props', 'chalet.png'))
    ap.add_argument('--preview', default=None)
    args = ap.parse_args()
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    px = im.load()

    def X(x): return x + OX
    def Y(dy): return G + dy          # dy = Welt-y relativ zu g (negativ = oben)
    def rect(x0, dy0, x1, dy1, fill, outline=None):
        d.rectangle([X(x0), Y(dy0), X(x1), Y(dy1)], fill=fill, outline=outline)
    L, R, mid = 10, 96, 53

    # ---- Steinsockel ----
    rect(L, -9, R - 1, -1, STONE, OUT)
    for yy in range(-8, -1, 3):
        for xx in range(L + 1 + ((yy // 3) % 2) * 3, R - 1, 7):
            rect(xx, yy, xx, yy + 1, STONE_D)
    rect(L + 1, -8, R - 2, -8, STONE_L)
    # ---- Fassade ----
    rect(L + 2, -52, R - 3, -10, WOOD, OUT)
    d.polygon([(X(L + 2), Y(-52)), (X(mid), Y(-74)), (X(R - 2), Y(-52))], fill=WOOD, outline=OUT)
    for dy in range(-50, -10, 5):
        rect(L + 3, dy, R - 4, dy, WOOD_D)
        rect(L + 3, dy + 2, R - 4, dy + 2, BEAM)
    # Schattenseite rechts + Lichtkante links
    rect(R - 12, -51, R - 4, -10, WOOD_S)
    for dy in range(-50, -10, 5):
        rect(R - 12, dy, R - 4, dy, WOOD_D)
    rect(L + 2, -52, L + 3, -10, WOOD_H); rect(R - 5, -52, R - 4, -10, WOOD_D)
    # Giebelfenster
    d.ellipse([X(mid) - 5, Y(-67), X(mid) + 5, Y(-57)], fill=OUT)
    d.ellipse([X(mid) - 4, Y(-66), X(mid) + 4, Y(-58)], fill=WIN)
    rect(mid, -65, mid, -59, OUT); rect(mid - 3, -62, mid + 3, -62, OUT)

    def window(x, dy):
        rect(x - 1, dy - 1, x + 10, dy + 8, OUT)
        rect(x, dy, x + 9, dy + 7, WIN)
        rect(x + 1, dy + 4, x + 8, dy + 6, WIN_W)
        rect(x + 5, dy, x + 5, dy + 7, OUT); rect(x, dy + 4, x + 9, dy + 4, OUT)
        rect(x + 1, dy + 1, x + 3, dy + 1, (255, 240, 190, 255))           # Glanz
        for sx in (x - 4, x + 11):
            rect(sx - 1, dy - 2, sx + 3, dy + 9, OUT)
            rect(sx, dy - 1, sx + 2, dy + 8, SHUT)
            rect(sx, dy - 1, sx, dy + 8, SHUT_L)
            rect(sx + 1, dy + 3, sx + 1, dy + 3, OUT)                       # Herzchen
        rect(x - 3, dy + 9, x + 12, dy + 11, OUT)
        rect(x - 2, dy + 9, x + 11, dy + 10, WOOD_H)
        for i in range(6): rect(x - 1 + i * 2, dy + 8, x + i * 2, dy + 8, GRASS)
        for i in range(5): rect(x - 1 + i * 3, dy + 7, x + i * 3, dy + 8, GER)
        for i in range(4): rect(x + 1 + i * 3, dy + 6, x + 1 + i * 3, dy + 6, GER_H)
    window(22, -48); window(70, -48); window(62, -28)
    # ---- Tuer ----
    rect(26, -30, 39, -10, OUT)
    rect(27, -29, 38, -10, WOOD_H)
    rect(33, -29, 33, -10, WOOD_D)
    for dy in range(-27, -10, 4): rect(27, dy, 38, dy, WOOD_D)
    rect(29, -27, 31, -25, WIN); rect(34, -27, 36, -25, WIN)
    rect(31, -19, 31, -18, GOLD)
    rect(27, -29, 38, -29, (120, 80, 48, 255))
    # ---- Balkon ----
    rect(L - 3, -32, R + 2, -32, WOOD_D)
    rect(L - 4, -36, R + 3, -32, OUT)
    rect(L - 3, -35, R + 2, -33, WOOD_H); rect(L - 3, -35, R + 2, -35, BEAM)
    for xx in range(L - 2, R + 3, 6):
        rect(xx - 1, -44, xx + 2, -36, OUT); rect(xx, -43, xx + 1, -36, WOOD_H)
    rect(L - 4, -45, R + 3, -43, OUT); rect(L - 3, -44, R + 2, -44, WOOD_H); rect(L - 3, -45, R + 2, -45, BEAM)
    for xx in range(L + 1, R + 1, 6):
        rect(xx, -40, xx, -40, WOOD_D); rect(xx, -38, xx, -38, WOOD_D)
    # ---- Dach ----
    eaveY, apexY, eL, eR = -50, -76, L - 12, R + 12
    d.polygon([(X(eL), Y(eaveY + 5)), (X(mid), Y(apexY + 5)), (X(eR), Y(eaveY + 5)), (X(eR), Y(eaveY + 7)), (X(mid), Y(apexY + 7)), (X(eL), Y(eaveY + 7))], fill=OUT)
    d.polygon([(X(eL), Y(eaveY + 3)), (X(mid), Y(apexY + 3)), (X(eR), Y(eaveY + 3)), (X(eR), Y(eaveY + 5)), (X(mid), Y(apexY + 5)), (X(eL), Y(eaveY + 5))], fill=ROOF_D)
    d.polygon([(X(eL), Y(eaveY)), (X(mid), Y(apexY)), (X(eR), Y(eaveY)), (X(eR), Y(eaveY + 3)), (X(mid), Y(apexY + 3)), (X(eL), Y(eaveY + 3))], fill=ROOF)
    d.line([(X(eL), Y(eaveY - 1)), (X(mid), Y(apexY - 1)), (X(eR), Y(eaveY - 1))], fill=OUT)
    for i in range(1, 6):
        k = i / 6
        x0, y0 = X(eL) + (X(mid) - X(eL)) * k, Y(eaveY) + (Y(apexY) - Y(eaveY)) * k
        x1 = X(eR) - (X(eR) - X(mid)) * k
        d.line([(x0, y0 + 1), (x1, y0 + 1)], fill=ROOF_H)
        d.line([(x0, y0 + 2), (x1, y0 + 2)], fill=ROOF_D)
    rect(mid - 1, apexY - 1, mid, apexY, OUT)
    for i in range(7):
        k = 0.12 + i * 0.13
        xl, xr, yy = X(eL) + (X(mid) - X(eL)) * k, X(eR) - (X(eR) - X(mid)) * k, Y(eaveY) + (Y(apexY) - Y(eaveY)) * k
        for (sx, sy) in ((round(xl), round(yy)), (round(xr) - 2, round(yy))):
            d.rectangle([sx - 1, sy - 3, sx + 3, sy], fill=OUT)
            d.rectangle([sx, sy - 2, sx + 2, sy - 1], fill=STONE_L)
            d.rectangle([sx, sy - 1, sx + 2, sy - 1], fill=STONE_D)
    # ---- Kamin ----
    rect(71, -87, 79, -62, OUT)
    rect(72, -86, 78, -63, STONE)
    rect(72, -80, 78, -80, STONE_D); rect(72, -74, 78, -74, STONE_D); rect(75, -84, 75, -82, STONE_D)
    rect(70, -89, 80, -87, OUT); rect(71, -88, 79, -88, STONE_D)

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    im.save(args.out)
    print(f'-> {args.out} {W}x{H}')
    if args.preview:
        z = 5
        pv = Image.new('RGBA', (W * z, H * z), (120, 190, 120, 255))
        big = im.resize((W * z, H * z), Image.NEAREST); pv.paste(big, (0, 0), big); pv.save(args.preview)


if __name__ == '__main__':
    main()
