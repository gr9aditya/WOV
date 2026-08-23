#!/usr/bin/env python3
"""make_symbols.py — die vier Code-Symbole des Stimmrechtsausweises als Referenzblatt.
Dreieck = Initialisierungscode, Raute = Pruefcodes, Fuenfeck = Bestaetigungscode, Stern = Finalisierungscode.
Schwarz gefuellt, ohne Rahmen. Gleiche Geometrie wie symbolPath() in pixart.js (im Spiel als Canvas-Pfade)."""
import math, sys, os
from PIL import Image, ImageDraw
def pts(kind, cx, cy, r):
    if kind == 'triangle': return [(cx + r*math.cos(math.radians(-90 + i*120)), cy + r*math.sin(math.radians(-90 + i*120))) for i in range(3)]
    if kind == 'diamond':  return [(cx, cy - r), (cx + r*0.78, cy), (cx, cy + r), (cx - r*0.78, cy)]
    if kind == 'pentagon': return [(cx + r*math.cos(math.radians(-90 + i*72)), cy + r*math.sin(math.radians(-90 + i*72))) for i in range(5)]
    if kind == 'star':
        out = []
        for i in range(10):
            rr = r if i % 2 == 0 else r * 0.42
            a = math.radians(-90 + i * 36); out.append((cx + rr*math.cos(a), cy + rr*math.sin(a)))
        return out
def main(out):
    z = 64; pad = 16
    im = Image.new('RGBA', (4*(z+pad)+pad, z+pad*2+28), (244,233,201,255))
    d = ImageDraw.Draw(im)
    for i, (k, name) in enumerate([('triangle','Initialisierungscode'),('diamond','Pruefcodes'),('pentagon','Bestaetigungscode'),('star','Finalisierungscode')]):
        cx, cy = pad + i*(z+pad) + z/2, pad + z/2
        d.polygon(pts(k, cx, cy, z/2), fill=(0,0,0,255))
        d.text((cx - 30, pad + z + 6), name[:12], fill=(40,24,16,255))
    im.save(out); print('->', out)
if __name__ == '__main__': main(sys.argv[1] if len(sys.argv) > 1 else 'symbols_preview.png')
