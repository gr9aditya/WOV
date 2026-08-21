"""Assemble docs/walkthrough.gif from the per-step screenshots.

Run after regenerating the screenshots:

    ./Build/EVotingWalkthrough.exe -capture ./docs/screenshots -screen-width 1600 -screen-height 900 -screen-fullscreen 0
    python tools/make_gif.py

Requires Pillow:  python -m pip install --user Pillow
"""

import glob
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  python -m pip install --user Pillow")

SCREENSHOTS = "docs/screenshots/step-*.png"
OUTPUT = "docs/walkthrough.gif"
WIDTH = 1000            # keeps the GIF small enough to display inline on GitHub
MILLISECONDS_PER_STEP = 2600
COLOURS = 128


def main():
    paths = sorted(glob.glob(SCREENSHOTS))
    if not paths:
        sys.exit("No screenshots found at %s — run the capture step first." % SCREENSHOTS)

    frames = []
    for path in paths:
        image = Image.open(path).convert("RGB")
        height = int(image.height * WIDTH / image.width)
        image = image.resize((WIDTH, height), Image.LANCZOS)
        frames.append(image.convert("P", palette=Image.ADAPTIVE, colors=COLOURS))

    frames[0].save(
        OUTPUT,
        save_all=True,
        append_images=frames[1:],
        duration=MILLISECONDS_PER_STEP,
        loop=0,
        optimize=True,
        disposal=2,
    )

    size_mb = os.path.getsize(OUTPUT) / 1024 / 1024
    print("Wrote %s — %d frames, %.2f MB" % (OUTPUT, len(frames), size_mb))

    if size_mb > 5:
        print("Warning: GitHub renders large GIFs slowly. Consider lowering WIDTH or COLOURS.")


if __name__ == "__main__":
    main()
