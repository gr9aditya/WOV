#!/usr/bin/env python3
"""
darken_bruno.py — Brunos Fell eine kleine Stufe dunkler und waermer (assets/bruno/idle.png)

Nur die braunen Fellfarben (r > g > b, deutlicher Rot-Blau-Abstand) werden
angefasst: Helligkeit -7 %, Saettigung leicht rauf, Farbton minimal Richtung
Orange (waermeres Dunkelbraun). Bauch (creme), Augen, Schnauze und die dunkle
Kontur bleiben unveraendert. Jede Ausgangsfarbe wird auf genau EINE neue Farbe
abgebildet — die Anzahl der Farbstufen bleibt gleich, keine Verlaeufe.

Das Original liegt danach als assets/bruno/idle_original.png daneben (einmalig).

  python tools/darken_bruno.py [--dry]
"""
import argparse, colorsys, os, shutil
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'assets', 'bruno', 'idle.png')
BAK = os.path.join(HERE, '..', 'assets', 'bruno', 'idle_original.png')


def is_fur(rgb):
    r, g, b = rgb
    return r > g > b and (r - b) >= 60 and r >= 130     # Fell: warm, klar heller als die Kontur


def shift(rgb):
    h, s, v = colorsys.rgb_to_hsv(*(c / 255 for c in rgb))
    v *= 0.93                      # ~7 % dunkler
    s = min(1.0, s + 0.04)         # einen Hauch satter (nicht grau)
    h = (h + 0.006) % 1.0          # minimal Richtung Orange = waermer
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    return tuple(int(round(c * 255)) for c in (r, g, b))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry', action='store_true')
    args = ap.parse_args()
    src = BAK if os.path.exists(BAK) else SRC      # idempotent: immer vom Original ausgehen
    im = Image.open(src).convert('RGBA')
    px = im.load()
    table = {}
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0 or not is_fur((r, g, b)):
                continue
            key = (r, g, b)
            if key not in table:
                table[key] = shift(key)
            px[x, y] = table[key] + (a,)
    for k, v in sorted(table.items(), key=lambda kv: -sum(kv[0])):
        print(f'  {k} -> {v}')
    print(f'{len(table)} Fellfarben angepasst')
    if args.dry:
        return
    if not os.path.exists(BAK):
        shutil.copyfile(SRC, BAK)
    im.save(SRC)
    print('->', os.path.relpath(SRC, os.path.join(HERE, '..')))


if __name__ == '__main__':
    main()
