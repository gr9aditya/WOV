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

The scene is generated rather than committed, so create it once:

**E-Voting Walkthrough 3D → Create and Open Scene**

That writes `Assets/EVotingWalkthrough3D/Walkthrough3D.unity` with a camera and a `Walkthrough3D`
component, and opens it. Press **Play**.

Keeping the scene out of the repository means it cannot drift from the code, and there is no
`.unity` YAML file to produce merge conflicts. Everything visible — desk, monitor, card, voter,
lights — is built in `Awake`.

## Architecture

Three runtime scripts and one editor script.

### `Stage.cs`

Builds props from Unity primitives and code-generated URP materials, and contains the one piece of
maths the layout depends on:

```csharp
public static Rect ScreenRect(Transform quad, Camera camera)
```

It projects a quad's four corners into screen space and returns the rectangle covering them. This
is what allows text to be laid out **in pixels over a surface that moves in 3D**: as the camera
dollies between viewpoints, the card's rectangle follows it, and the text with it. Font sizes are
derived from the rectangle's height, so text scales with distance instead of staying a fixed size
while the card grows.

### `Symbols.cs`

Generates the four voting card symbols (▲ ◆ ⬟ ★) as textures by point-in-polygon filling with 2×2
supersampling. They are drawn rather than typed because the pentagon has no dependable glyph in
Unity's default font.

### `Walkthrough3D.cs`

Content, scene, camera and text.

- **Content** — `BuildSteps()` returns the array of steps. The only place to edit text.
- **Scene** — desk, monitor, card on an easel, a voter, two directional lights.
- **Camera** — four viewpoints (`Overview`, `Card`, `Monitor`, `Both`); each step names the one it
  wants and the camera eases towards it with an exponential lerp, which is frame-rate independent.
- **Packet** — a glowing cube arcs between card and monitor on steps that send or receive a
  message, coloured by the step's tone.
- **Text** — IMGUI, laid out inside the rectangles returned by `Stage.ScreenRect`.

Why IMGUI rather than TextMeshPro in world space: TMP needs its Essential Resources imported into
the project before a `TextMeshPro` component will render, which a headless build cannot rely on.
IMGUI has no such dependency and stays legible at every camera distance.

### `ScreenshotCapture3D.cs`

Dormant unless `-capture` is on the command line. Steps through every step with
`ShowStep(step, instant: true)` so the camera arrives immediately rather than easing, captures a
PNG each, and quits.

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
Unity.exe -batchmode -quit -nographics -projectPath . -executeMethod WalkthroughBuild.PerformBuild -buildOutput ./Build -logFile build.log
```

Or **E-Voting Walkthrough 3D → Build Windows Player**.

## Regenerating the screenshots and the GIF

`docs/screenshots/` and `docs/walkthrough.gif` are generated. Regenerate them after changing a
step so the documentation cannot drift.

```bash
# 1. Build
Unity.exe -batchmode -quit -nographics -projectPath . -executeMethod WalkthroughBuild.PerformBuild -buildOutput ./Build -logFile build.log

# 2. One PNG per step
./Build/EVotingWalkthrough3D.exe -capture ./docs/screenshots -screen-width 1600 -screen-height 900 -screen-fullscreen 0

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
- Colours live in one block at the top of `Walkthrough3D.cs`. Extend the palette rather than
  writing literals inline.
- The walkthrough lives entirely under `Assets/EVotingWalkthrough3D/` and touches nothing else in
  the project.
