# Development

## Requirements

- **Unity 6000.5.9f1** (any Unity 6 release should work)
- Windows for the build script as written; the walkthrough itself is platform-independent

No packages beyond a handful of built-in modules, listed in `Packages/manifest.json`. There are no
imported textures, fonts, materials or prefabs — every sprite is generated at runtime by
`Shapes.cs`, and all text is drawn with IMGUI.

## Running

Open the project in Unity Hub and press **Play**. There is deliberately no scene to open:

```csharp
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
static void Launch() { ... }
```

builds the camera and the entire scene when Play starts, so an empty scene is enough. This keeps
the repository free of `.unity` scene files, which merge badly and hide state in YAML.

The build script creates `Assets/Scenes/Walkthrough.unity` on demand, because a standalone player
does need a scene to boot into.

## Architecture

Three scripts, each with one job.

### `Shapes.cs`

Generates sprites procedurally: box, rounded box, circle, triangle, diamond, pentagon, star. Each
is a 64×64 RGBA texture filled by a point-inside test, with 2×2 supersampling so edges are not
jagged. The polygon shapes share a point-in-polygon helper.

Why: it removes the entire asset pipeline. Nothing to import, no `.meta` churn, no licensing
questions about artwork, and the four voting card symbols (▲ ◆ ⬟ ★) render identically everywhere —
the pentagon in particular has no dependable glyph in Unity's default font.

### `VotingWalkthrough.cs`

Everything the reader sees. Three parts:

1. **Content** — `BuildSteps()` returns the array of steps. This is the only place to edit text.
2. **Scene** — panels, the stick figure and the arrow, as world-space sprites built once in `Awake`.
3. **Drawing** — `OnGUI` lays out all text.

The layout rule worth knowing: **panels are positioned in world units, but everything printed on a
panel is laid out in pixels inside that panel's rectangle**, obtained with `ToGui()`. An earlier
version positioned card text in world space independently of the card sprite, and the two drifted
apart whenever the aspect ratio changed — text escaped the card and slid under the footer. Laying
out inside the panel rect makes that impossible.

The camera keeps a fixed 18-unit width at any aspect ratio, and `SyncCamera()` re-applies this
every frame so resizing the Game view during Play behaves.

### `ScreenshotCapture.cs`

Dormant unless `-capture` is passed on the command line. Steps through every step, writes one PNG
each, quits.

## Editing the content

Open `BuildSteps()` and add or change an entry:

```csharp
new Step {
    title = "Portal step 5  ·  Verify the Choice Return Codes",
    body = "The explanatory paragraph shown in the footer.",
    screen = new[] { "lines", "shown", "on the portal" },
    portalStep = 5,          // highlights item 5 in the portal's sidebar
    arrow = 2,               // 0 none, 1 voter -> system, 2 system -> voter
    arrowLabel = "Choice Return Codes",
    highlightRow = 1,        // 0 ▲, 1 ◆, 2 ⬟, 3 ★, -1 for none
    highlightScreen = true,
    showChoiceCodes = true,  // emphasises the selected codes on the card
    tone = 1                 // 0 neutral, 1 attention, 2 success
},
```

Nothing else needs changing — the step counter, navigation and screenshot pass all read the array's
length.

Keep the portal's German labels on the portal screen (`Prüfcodes verifizieren`) and English in the
explanations. The screen should show what a voter actually sees; the footer explains it.

## Building a standalone player

From the command line, without opening the editor:

```bash
Unity.exe -batchmode -quit -nographics -projectPath . -executeMethod BuildScript.PerformBuild -buildOutput ./Build -logFile build.log
```

Or in the editor: **E-Voting Walkthrough → Build Windows Player**.

## Regenerating the screenshots and the GIF

The images in `docs/screenshots/` and `docs/walkthrough.gif` are generated, not hand-captured.
After changing any step, regenerate them so the documentation does not drift.

```bash
# 1. Build a player
Unity.exe -batchmode -quit -nographics -projectPath . -executeMethod BuildScript.PerformBuild -buildOutput ./Build -logFile build.log

# 2. Capture one PNG per step
./Build/EVotingWalkthrough.exe -capture ./docs/screenshots -screen-width 1600 -screen-height 900 -screen-fullscreen 0

# 3. Assemble the GIF (requires Pillow: python -m pip install --user Pillow)
python tools/make_gif.py
```

The capture runs at 1600×900 and quits by itself. Filenames are derived from step titles, so
renaming a step renames its screenshot — delete stale files after renaming.

## Verifying a change compiles

Unity refuses to open a project that is already open in the editor, so compile-checking from a
terminal while the editor is running needs a copy:

```bash
cp -r Assets Packages ProjectSettings /tmp/verify/
Unity.exe -batchmode -nographics -quit -projectPath /tmp/verify -logFile /tmp/verify.log
grep -c "error CS" /tmp/verify.log
```

Exit code 0 with a log of a few hundred lines means a real compile happened. A log of about twenty
lines that ends in `return code 1` means Unity bailed on the project lock and compiled nothing —
that is not a passing check.

## Conventions

- Full words in identifiers: `renderer`, not `r`; `walkthrough`, not `w`.
- Comments explain *why*, not *what*. The `ToGui` layout rule above is the kind of thing worth a
  comment; a loop over four rows is not.
- No `#region`, no abbreviations in public names, no partial classes.
- Colours live in one block at the top of `VotingWalkthrough.cs`. Add to the palette rather than
  writing literals inline.
