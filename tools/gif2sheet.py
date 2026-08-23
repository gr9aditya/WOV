#!/usr/bin/env python3
"""
gif2sheet.py — GIF / PNG-Folge  ->  horizontales Pixel-Art Sprite Sheet

Fuer "Brunos Code-Abenteuer". Keine Runtime-Dependency des Spiels,
nur ein Build-Helfer. Braucht nur Pillow.

Was es macht
------------
1. Frames aus einem GIF (oder aus mehreren PNGs / einem fertigen Sheet) lesen
2. Hintergrund entfernen (Farb-Key, per Default aus den Ecken erraten)
3. Auf die native Pixelaufloesung zurueckrechnen (Blockgroesse wird erkannt)
4. Alphakante haerten -> kein milchiger Rand, kein Antialiasing-Halo
5. Alle Frames auf eine gemeinsame Bounding-Box trimmen (Animation bleibt stabil)
6. Als eine horizontale PNG speichern + die fertige ASSET_MANIFEST-Zeile ausgeben

Beispiele
---------
  python3 tools/gif2sheet.py assets/bruno/attack.gif -o assets/bruno/attack.png \
      --key bruno_attack --fps 14 --loop false
  python3 tools/gif2sheet.py assets/spider/defeated.gif -o assets/spider/defeated.png \
      --key spider_defeated --fps 8 --loop false --preview
  python3 tools/gif2sheet.py frames/*.png -o assets/bruno/walk.png --key bruno_walk --fps 10
  python3 tools/gif2sheet.py sheet.png --in-frames 6 -o out.png --key x   # Sheet neu aufbereiten
"""

import argparse
import math
import os
import sys
from functools import reduce

try:
    from PIL import Image, ImageSequence
except ImportError:
    sys.exit("Pillow fehlt:  pip install --break-system-packages Pillow")


# ----------------------------------------------------------------- laden
def load_frames(paths, in_frames=None):
    """Liefert (frames, durations_ms). Frames sind RGBA und gleich gross."""
    frames = []
    durations = []
    for p in paths:
        im = Image.open(p)
        n = getattr(im, "n_frames", 1)
        if n > 1:
            # GIF: ueber ImageSequence gehen, damit Disposal/Delta korrekt
            # zusammengesetzt wird (sonst fehlen bei Delta-GIFs halbe Frames).
            canvas = None
            for raw in ImageSequence.Iterator(im):
                cur = raw.convert("RGBA")
                if canvas is None:
                    canvas = cur.copy()
                else:
                    canvas = canvas.copy()
                    canvas.alpha_composite(cur)
                frames.append(canvas.copy())
                durations.append(raw.info.get("duration", 0) or 0)
        else:
            frames.append(im.convert("RGBA"))
            durations.append(0)

    if in_frames and len(frames) == 1:
        # ein bereits horizontal montiertes Sheet wieder zerlegen
        sheet = frames[0]
        fw = sheet.width // in_frames
        if fw * in_frames != sheet.width:
            sys.exit(f"Sheet-Breite {sheet.width} ist nicht durch {in_frames} teilbar.")
        frames = [sheet.crop((i * fw, 0, (i + 1) * fw, sheet.height))
                  for i in range(in_frames)]
        durations = [0] * in_frames

    if not frames:
        sys.exit("Keine Frames gefunden.")

    w = max(f.width for f in frames)
    h = max(f.height for f in frames)
    out = []
    for f in frames:
        if f.size != (w, h):
            pad = Image.new("RGBA", (w, h), (0, 0, 0, 0))
            pad.paste(f, ((w - f.width) // 2, h - f.height))  # bodenbuendig
            f = pad
        out.append(f)
    return out, durations


# ------------------------------------------------------- hintergrund weg
def guess_bg(frames):
    """Haeufigste Eckfarbe ueber alle Frames."""
    counts = {}
    for f in frames:
        w, h = f.size
        for xy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
            px = f.getpixel(xy)
            if px[3] == 0:
                continue
            counts[px[:3]] = counts.get(px[:3], 0) + 1
    if not counts:
        return None
    return max(counts, key=counts.get)


def flood_bg(frame, bg, tol):
    """Hintergrundfarbe nur von den Raendern her wegfressen.

    Verhindert, dass gleichfarbige Pixel INNERHALB des Sprites
    (z.B. weisse Augen auf weissem Hintergrund) auch verschwinden.
    """
    w, h = frame.size
    px = frame.load()
    tol2 = tol * tol * 3
    seen = bytearray(w * h)
    stack = []
    for x in range(w):
        stack.append((x, 0)); stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y)); stack.append((w - 1, y))

    def matches(p):
        if p[3] == 0:
            return True
        dr = p[0] - bg[0]; dg = p[1] - bg[1]; db = p[2] - bg[2]
        return dr * dr + dg * dg + db * db <= tol2

    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not matches(px[x, y]):
            continue
        px[x, y] = (0, 0, 0, 0)
        stack.append((x + 1, y)); stack.append((x - 1, y))
        stack.append((x, y + 1)); stack.append((x, y - 1))
    return frame


# ----------------------------------------------- native aufloesung finden
def _runs(values):
    """Laengen gleicher aufeinanderfolgender Eintraege."""
    out, cur, prev = [], 0, object()
    for v in values:
        if v == prev:
            cur += 1
        else:
            if cur:
                out.append(cur)
            cur, prev = 1, v
    if cur:
        out.append(cur)
    return out


def _reconstruction_error(frame, f):
    """Wie gut laesst sich das Bild als f-fach vergroessertes Pixelbild lesen?"""
    small = frame.resize((frame.width // f, frame.height // f), Image.BOX)
    back = small.resize(frame.size, Image.NEAREST)
    a, b = frame.tobytes(), back.tobytes()
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)


def detect_block(frame, max_block=16):
    """Erkennt den Vergroesserungsfaktor eines hochskalierten Pixel-Bildes.

    Zwei Wege, weil beide Sorten Input vorkommen:
      * harte Kanten (Nearest hochskaliert) -> ggT aller Lauflaengen ist exakt
      * weiche Kanten (Bicubic/Lanczos)     -> ggT faellt auf 1, deshalb wird
        zusaetzlich getestet, bei welchem Faktor sich das Bild verlustarm als
        Pixelraster rekonstruieren laesst
    """
    w, h = frame.size
    data = frame.load()
    cols = [tuple(data[x, y] for y in range(h)) for x in range(w)]
    rows = [tuple(data[x, y] for x in range(w)) for y in range(h)]
    cand = [c for c in _runs(cols) + _runs(rows) if c > 0]
    exact = reduce(math.gcd, cand) if cand else 1
    exact = max(1, min(exact, max_block))
    if exact > 1:
        return exact, exact

    # weiche Kanten: keine exakte Erkennung moeglich. Statt zu raten wird
    # eine Kandidatenliste mit Rekonstruktionsfehler zurueckgegeben, damit
    # man --scale / --native bewusst setzt.
    divs = [f for f in range(2, max_block + 1) if w % f == 0 and h % f == 0]
    errs = [(f, _reconstruction_error(frame, f)) for f in divs]
    return 1, errs


def downscale(frame, factor):
    if factor <= 1:
        return frame
    return frame.resize((frame.width // factor, frame.height // factor),
                        Image.NEAREST)


def downscale_to(frame, tw, th):
    """Sauberer Downscale auf eine Zielgroesse: erst mitteln, dann haerten."""
    if (frame.width, frame.height) == (tw, th):
        return frame
    return frame.resize((tw, th), Image.BOX)


# ------------------------------------------------------ alphakante haerten
def defringe(frame, cutoff=128):
    """Halbtransparente Randpixel entfaerben und Alpha binaer machen.

    Zuerst bekommen Pixel unter dem Cutoff die Farbe des naechsten
    kraeftigen Nachbarn (sonst bleibt beim Haerten der milchige Rand
    aus der Hintergrundfarbe stehen), danach wird Alpha auf 0/255
    geschnappt.
    """
    w, h = frame.size
    src = frame.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dst = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = src[x, y]
            if a >= cutoff:
                dst[x, y] = (r, g, b, 255)
    # zweiter Durchgang: Loecher schliessen gibt es nicht, aber Farbe der
    # gehaerteten Kante von Nachbarn uebernehmen, falls sie ausgeblichen ist
    hard = out.load()
    for y in range(h):
        for x in range(w):
            if hard[x, y][3] != 255:
                continue
            r, g, b, _ = src[x, y]
            a = src[x, y][3]
            if a >= 250:
                continue
            # ausgebleichte Kante: kraeftigsten Nachbarn suchen
            best = None
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        p = src[nx, ny]
                        if p[3] >= 250 and (best is None or p[3] > best[3]):
                            best = p
            if best:
                hard[x, y] = (best[0], best[1], best[2], 255)
    return out


# --------------------------------------------------------------- trimmen
def common_bbox(frames):
    box = None
    for f in frames:
        b = f.getbbox()
        if b is None:
            continue
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]),
                                     max(box[2], b[2]), max(box[3], b[3]))
    return box


# ----------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("inputs", nargs="+", help="GIF, PNG-Folge oder fertiges Sheet")
    ap.add_argument("-o", "--out", required=True, help="Ziel-PNG (Sprite Sheet)")
    ap.add_argument("--key", default=None, help="ASSET_MANIFEST Key fuer die Ausgabezeile")
    ap.add_argument("--fps", type=int, default=10)
    ap.add_argument("--loop", default="true", choices=["true", "false"])
    ap.add_argument("--in-frames", type=int, default=None,
                    help="Eingabe ist ein fertiges Sheet mit N Frames")
    ap.add_argument("--bg", default="auto",
                    help="'auto', 'none' oder Hexfarbe wie #ffffff")
    ap.add_argument("--tol", type=int, default=28, help="Farbtoleranz fuer den Key")
    ap.add_argument("--scale", type=int, default=0,
                    help="Downscale-Faktor erzwingen (0 = automatisch erkennen)")
    ap.add_argument("--native", default=None,
                    help="Zielgroesse pro Frame erzwingen, z.B. 32x32")
    ap.add_argument("--cutoff", type=int, default=128, help="Alpha-Schwelle 0..255")
    ap.add_argument("--trim", action="store_true",
                    help="gemeinsame Bounding-Box beschneiden (Standard: aus, "
                         "damit alle Animationen einer Figur deckungsgleich bleiben)")
    ap.add_argument("--max-frames", type=int, default=0,
                    help="nur die ersten N Frames verwenden (0 = alle)")
    ap.add_argument("--preview", action="store_true",
                    help="zusaetzlich <out>.preview.png in 6x mit Frame-Raster")
    args = ap.parse_args()

    frames, durations = load_frames(args.inputs, args.in_frames)
    if args.max_frames:
        frames = frames[:args.max_frames]
        durations = durations[:args.max_frames]
    print(f"  gelesen : {len(frames)} Frames, {frames[0].width}x{frames[0].height}")
    real = [d for d in durations if d > 0]
    if real:
        avg = sum(real) / len(real)
        uniq = sorted(set(real))
        print(f"  timing  : {uniq} ms pro Frame -> ca. {1000/avg:.1f} fps"
              + ("  (ungleichmaessig!)" if len(uniq) > 1 else ""))

    # 1. Hintergrund
    if args.bg != "none":
        bg = guess_bg(frames) if args.bg == "auto" else tuple(
            int(args.bg.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))
        if bg:
            print(f"  bg-key  : rgb{bg} (Toleranz {args.tol})")
            frames = [flood_bg(f, bg, args.tol) for f in frames]

    # 2. native Aufloesung
    if args.native:
        tw, th = (int(v) for v in args.native.lower().split("x"))
        frames = [downscale_to(f, tw, th) for f in frames]
        print(f"  skaliert: erzwungen auf {tw}x{th}")
    else:
        g, info = detect_block(frames[0])
        factor = args.scale or g
        if factor == 1 and isinstance(info, list) and info:
            w0, h0 = frames[0].size
            print("  hinweis : harte Pixelbloecke nicht erkennbar (weiche Kanten?).")
            print("            Kandidaten (Faktor -> Zielgroesse, Rekonstruktionsfehler,")
            print("            kleiner ist besser). Mit --scale N oder --native WxH setzen:")
            for f, e in sorted(info, key=lambda t: t[1])[:5]:
                print(f"              --scale {f:<2d} -> {w0//f}x{h0//f}   Fehler {e:6.2f}")
        if factor > 1:
            frames = [downscale(f, factor) for f in frames]
            print(f"  skaliert: Faktor {factor} -> {frames[0].width}x{frames[0].height}")
        else:
            print("  skaliert: bereits native Aufloesung")

    # 3. Alphakante haerten
    frames = [defringe(f, args.cutoff) for f in frames]

    # 4. gemeinsame Bounding-Box
    if args.trim:
        box = common_bbox(frames)
        if box and box != (0, 0, frames[0].width, frames[0].height):
            frames = [f.crop(box) for f in frames]
            print(f"  getrimmt: {box} -> {frames[0].width}x{frames[0].height}")

    fw, fh = frames[0].size
    sheet = Image.new("RGBA", (fw * len(frames), fh), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.paste(f, (i * fw, 0))
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    sheet.save(args.out)

    part = sum(1 for p in sheet.getdata() if 0 < p[3] < 255)
    print(f"  -> {args.out}  {sheet.width}x{sheet.height}  "
          f"({len(frames)} x {fw}x{fh}), halbtransparente Pixel: {part}")

    if args.preview:
        z = 6
        pv = Image.new("RGBA", (sheet.width * z, sheet.height * z), (24, 24, 32, 255))
        # Schachbrett, damit man Transparenz sieht
        for y in range(0, pv.height, 8):
            for x in range(0, pv.width, 8):
                if (x // 8 + y // 8) % 2 == 0:
                    pv.paste((40, 40, 52, 255), (x, y, min(x + 8, pv.width),
                                                 min(y + 8, pv.height)))
        pv.alpha_composite(sheet.resize((sheet.width * z, sheet.height * z),
                                        Image.NEAREST))
        pvp = os.path.splitext(args.out)[0] + ".preview.png"
        pv.save(pvp)
        print(f"  -> {pvp} (Kontrollbild {z}x)")

    key = args.key or os.path.splitext(os.path.basename(args.out))[0]
    rel = args.out
    if rel.startswith("./"):
        rel = rel[2:]
    print("\nASSET_MANIFEST Zeile:")
    print(f"  {key}: {{ src:'{rel}', frames:{len(frames)}, fps:{args.fps}, "
          f"w:{fw}, h:{fh}, loop:{args.loop} }},")


if __name__ == "__main__":
    main()
