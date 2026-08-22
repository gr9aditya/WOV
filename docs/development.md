# Development

## Requirements

**Unity 6000.5.9f1**, the version this project already targets. The walkthrough adds no packages —
it uses what the project already has.

Two properties of this project shaped how the walkthrough is written, and both will bite anyone
who forgets them:

| Project setting | Consequence |
|---|---|
| **Universal Render Pipeline** (`com.unity.render-pipelines.universal` 17.5.0) | Materials must use URP shaders. A material created from the Built-in `Standard` shader renders **magenta**. `Stage.cs` creates everything from `Universal Render Pipeline/Lit` and `/Unlit`. |
| **Input System package only** (`activeInputHandler: 1`) | The legacy `Input.GetKey` API throws `InvalidOperationException` at runtime. Input is read through `UnityEngine.InputSystem.Keyboard.current`. |

## Running

Open `Assets/EVotingWalkthroughPixel/PixelWalkthrough.unity` and press **Play**.

The scene is deliberately almost empty — a camera and one `PixelWalkthrough` component. Everything
visible (desk, monitor, card, voter, lights) is built in `Awake`, so the scene file stays tiny and
essentially never changes, which keeps it out of merge conflicts.

**E-Voting Walkthrough Pixel → Create and Open Scene** regenerates it from scratch if needed.

An earlier revision kept the scene out of version control and made creating it a required first
step. That optimised for a tidy repository at the cost of anyone trying to run the thing, so the
scene is now committed.

## Architecture

Three runtime scripts and one editor script.

### `PixelArt.cs`

The drawing layer. Sprites are authored as rows of characters, one character per pixel, mapped
through a twenty-colour palette — the way console-era sprites were drawn. Also provides `Rect`,
`Border` and `Dither` for assembling larger shapes.

Two details matter for the look:

- **Point filtering.** Bilinear sampling would blur pixel edges into mush.
- **`PixelsPerUnit = 16`.** The camera is sized to show 180 art pixels vertically, so at 16:9 one
  art pixel lands on a whole number of screen pixels and nothing half-pixels.

### `PixelSprites.cs`

The art itself. The character (16×24, two frames) and the coin (8×8, four frames) are hand-drawn
grids; the furniture is assembled from pixel primitives so the larger shapes stay editable.

### `PixelWalkthrough.cs`

Content, scene, animation and text.

- **Content** — `BuildSteps()` returns the array of steps. The only place to edit text.
- **Scene** — tiled brick wall, ground band, desk, monitor, card, character. Fixed camera.
- **Animation** — the character bobs by exactly one art pixel and switches to its pointing frame
  when a step is about the card or screen; the coin arcs between the *facing edges* of the card and
  monitor, never across them, and snaps to the pixel grid so it does not shimmer.
- **Text** — IMGUI, laid out inside rectangles projected from the card and screen objects.

### `PixelScreenshotCapture.cs`

Dormant unless `-capture` is on the command line. Steps through every step, captures a PNG each,
and quits.

## Editing the content

```csharp
new Step {
    title = "Portal step 5  ·  Verify the Choice Return Codes",
    body = "The paragraph shown in the footer.",
    screen = new[] { "lines", "on the monitor" },
    view = View.Both,        // Overview, Card, Monitor, Both
    portalStep = 5,          // highlights item 5 in the portal's sidebar
    packet = 2,              // 0 none, 1 voter -> system, 2 system -> voter
    packetLabel = "Choice Return Codes",
    highlightRow = 1,        // 0 ▲, 1 ◆, 2 ⬟, 3 ★, -1 for none
    highlightScreen = true,
    showChoiceCodes = true,
    tone = 1                 // 0 neutral, 1 attention, 2 success
},
```

Nothing else changes — the step counter, navigation and screenshot pass all read the array length.

Keep the portal's German labels on the monitor (`Prüfcodes verifizieren`) and English in the
footer. The monitor should show what a voter actually sees; the footer explains it.

## Building

```bash
Unity.exe -batchmode -quit -nographics -projectPath . -executeMethod PixelWalkthroughBuild.PerformBuild -buildOutput ./Build -logFile build.log
```

Or **E-Voting Walkthrough Pixel → Build Windows Player**.

## Regenerating the screenshots and the GIF

`docs/screenshots/` and `docs/walkthrough.gif` are generated. Regenerate them after changing a
step so the documentation cannot drift.

```bash
# 1. Build
Unity.exe -batchmode -quit -nographics -projectPath . -executeMethod PixelWalkthroughBuild.PerformBuild -buildOutput ./Build -logFile build.log

# 2. One PNG per step
./Build/EVotingPixelWalkthrough.exe -capture ./docs/screenshots -screen-width 1600 -screen-height 900 -screen-fullscreen 0

# 3. Assemble the GIF (needs Pillow: python -m pip install --user Pillow)
python tools/make_gif.py
```

Filenames derive from step titles, so renaming a step renames its screenshot — delete stale files
afterwards.

## Verifying a change compiles

Unity will not open a project already open in the editor, so compile-checking from a terminal while
the editor is running needs a copy:

```bash
cp -r Assets Packages ProjectSettings /tmp/verify/
Unity.exe -batchmode -nographics -quit -projectPath /tmp/verify -logFile /tmp/verify.log
grep -c "error CS" /tmp/verify.log
```

A log of several hundred lines ending in `return code 0` means a real compile happened. A log of
about twenty lines ending in `return code 1` means Unity bailed on the project lock and compiled
nothing — that is not a passing check.

## Conventions

- Full words in identifiers: `renderer`, not `r`.
- Comments explain *why*. The `ScreenRect` projection trick and the URP/Input System constraints
  are worth comments; a loop over four card rows is not.
- Colours live in one block at the top of `PixelWalkthrough.cs`. Extend the palette rather than
  writing literals inline.
- The walkthrough lives entirely under `Assets/EVotingWalkthroughPixel/` and touches nothing else in
  the project.
