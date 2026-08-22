# E-Voting Walkthrough — Pixel Edition

An interactive, step-by-step explainer of how a vote is cast on the **Swiss Post e-voting
system** — and, more importantly, how a voter can verify that their vote was registered exactly as
they intended, even on a computer they do not trust.

Drawn as 16-bit style pixel art, generated entirely in code. No imported sprites, no texture files.

![The walkthrough, step by step](docs/walkthrough.gif)

---

## What this is

A voter receives a **printed voting card** by post. The card carries codes that the voter's
computer cannot know. During voting, the portal sends codes back to the screen and the voter
compares them against the paper. If they match, the vote was registered correctly. If they do not,
something tampered with the vote and the voter stops.

That comparison is the heart of the system, and this walkthrough exists to make it obvious.
Fourteen steps, including the security checks before starting and the clean-up afterwards — both
easy to skip and more important than they look.

This is an **explainer, not a game**. See [Roadmap](#roadmap).

## Quick start

Requires **Unity 6000.5.9f1** — the version this project already targets. No extra packages.

1. Open the project in Unity Hub
2. Open the scene **`Assets/EVotingWalkthroughPixel/PixelWalkthrough.unity`**
3. Press **Play**, then **→** or **Next** to advance

The scene holds only a camera and one `PixelWalkthrough` component; the room, desk, monitor, card
and character are all built in `Awake`.

This is a slideshow, not an animation: each step holds until you advance. The character bobs and
the coin spins continuously, but the story only moves when you do.

### Controls

| Input | Action |
|---|---|
| `→` `Space` `Enter` or **Next** | Next step |
| `←` `Backspace` or **Back** | Previous step |
| `R` | Back to the first step |

## The art

Everything on screen is generated at runtime. Sprites are authored as rows of characters, one
character per pixel, mapped through a twenty-colour palette — the way console-era sprites were
drawn:

```
....KKKKKKK.....        K  outline
...KHHHHHHHK....        H  cap
...KSSSSSSSK....        S  skin
...KSKSSSKSK....        B  shirt
...KsSSSSSsK....        P  trousers
```

The voter is 16×24 pixels with two frames — idle, and pointing at whatever the current step is
about. The travelling message is an 8×8 coin with four frames of spin. Furniture is assembled from
pixel primitives (`Rect`, `Border`, `Dither`), which keeps the larger shapes editable.

Everything uses point filtering and integer pixel sizes, and the coin snaps to the pixel grid as it
flies, so nothing shimmers between pixels.

**Two deliberate compromises.** The card's four symbols are `[^] [*] [O] [+]` rather than drawn
shapes — at the size those rows occupy, a pixel pentagon would be an unreadable smudge. And the
text uses a normal font rather than a bitmap one, because a 5×7 pixel font would make the
explanatory paragraphs genuinely hard to read. This is an explainer first and a pixel-art piece
second.

## The fourteen steps

| # | Step | What it shows |
|---|---|---|
| 1 | The voter's journey | Title and framing |
| 2 | The voting card arrives by post | The four codes, generated per voter and per election |
| 3 | Am I on the real portal? | Typing the address by hand, checking the certificate fingerprint |
| 4 | A browser without add-ons | Incognito / Private mode, translation off |
| 5 | Portal step 1 · Legal provisions | Acknowledging the terms |
| 6 | Portal step 2 · Start voting | Initialization Code + year of birth |
| 7 | Portal step 3 · Enter the vote | Making the selections |
| 8 | Portal step 4 · Check the vote | Review, then encrypt and send |
| 9 | Portal step 5 · Verify the Choice Return Codes | **The key step** — screen vs. paper |
| 10 | Portal step 6 · Enter the Confirmation Code | The step that actually casts the vote |
| 11 | Portal step 7 · Verify the Finalization Code | Confirmation the vote is in the ballot box |
| 12 | Stopping and resuming | What can still be changed, and when |
| 13 | After voting · Clearing the traces | Cookies and cache, and when it is unnecessary |
| 14 | Why this is trustworthy | Individual and universal verifiability, vote secrecy |

Full detail, with sources, in **[docs/voting-process.md](docs/voting-process.md)**.

## Terminology

The Swiss Post documentation uses **two different sets of names** for the same four codes. This
project uses the names a voter actually sees on the portal:

| Used here (portal) | Also called (System Specification v1.6.1) |
|---|---|
| `[^]` Initialization Code | Start Voting Key |
| `[*]` Choice Return Codes | Choice Return Codes |
| `[O]` Confirmation Code | Ballot Casting Key |
| `[+]` Finalization Code | Vote Cast Return Code |

If you pull text from the specification or from `Security-advices/`, translate the names so the
walkthrough stays internally consistent.

## Project structure

The walkthrough is self-contained under one folder and touches nothing else in the project.

```
Assets/EVotingWalkthroughPixel/
  Scripts/
    PixelWalkthrough.cs        All fourteen steps, scene, animation, text
    PixelArt.cs                Palette, sprite building, pixel drawing primitives
    PixelSprites.cs            The art: character, coin, card, monitor, desk, tiles
    PixelScreenshotCapture.cs  Documentation screenshot pass (-capture flag)
  Editor/
    PixelWalkthroughBuild.cs   Scene creation and headless build
docs/
  voting-process.md            The documented process, with sources
  sources.md                   Where every fact came from
  development.md               Architecture, editing content, building, regenerating images
  screenshots.md               All fourteen steps as images
  screenshots/                 One PNG per step (generated)
  walkthrough.gif              All steps as an animation (generated)
tools/
  make_gif.py                  Assembles the GIF from the screenshots
```

The rest of the repository is the Unity URP starter project from the initial commit. The
walkthrough does not use or modify it.

### Editing the content

Everything a reader sees lives in one array: `BuildSteps()` in
`Assets/EVotingWalkthroughPixel/Scripts/PixelWalkthrough.cs`. Each entry is one step — title,
explanatory paragraph, the lines on the monitor, which card row to highlight, and which way the
coin travels. Adding a step means adding one entry.

To change the art, edit the character grids in `PixelSprites.cs` or add colours to the palette in
`PixelArt.cs`.

## Two things worth knowing about this project

- **Universal Render Pipeline.** Sprites render fine, but any material built from the Built-in
  `Standard` shader would come out **magenta**.
- **Input System package only** (`activeInputHandler: 1`). The legacy `Input.GetKey` API throws at
  runtime; input goes through `Keyboard.current`.

Details in [docs/development.md](docs/development.md).

## Documentation

| Document | Contents |
|---|---|
| [docs/voting-process.md](docs/voting-process.md) | The full process, the security checks, and the system's stated limits |
| [docs/sources.md](docs/sources.md) | Every source, and the terminology discrepancy between them |
| [docs/development.md](docs/development.md) | Architecture, editing content, building, regenerating images |
| [docs/screenshots.md](docs/screenshots.md) | All fourteen steps as images |

## Sources

Content is drawn from Swiss Post's public disclosure at
[gitlab.com/swisspost-evoting](https://gitlab.com/swisspost-evoting) and from the "Explain Swiss
Post E-Voting Through a Game" briefing. Every claim is traced to a file in
**[docs/sources.md](docs/sources.md)**.

The live demo portal is at [demo.evoting.ch](https://demo.evoting.ch) — download a fresh voting card
per session, and authenticate with birth year **1980**.

## Other versions

This repository carries the same walkthrough in three renderings, on separate branches:

| Branch | Rendering |
|---|---|
| `evoting-walkthrough-pixel` | **This one** — 16-bit pixel art, fixed side-on view |
| `evoting-walkthrough-3d` | 3D desk scene with a camera that moves between card and monitor |
| `evoting-walkthrough` | Flat 2D, in a separate standalone Unity project |

The content and sources are identical; only the presentation differs.

## Roadmap

The obvious next step is turning the explainer into the game the briefing asks for. The mechanic is
already implied by step 9: show the code the portal returned, and let the player find the match on
the card — with some rounds where the codes *deliberately do not match*, and the correct answer is
to stop and report it. That one interaction teaches the entire trust model.

Further ideas, in rough order of value:

- A walk cycle, so the character moves between the card and the desk rather than standing still
- A proper 5×7 bitmap font, so the interface matches the art
- Verifying JavaScript hash values and system time (the two advanced security checks not yet covered)
- The counting phase and the independent Verifier — the "universal verifiability" half of the story
- German / French / Italian / Romansh text (the source security advice already exists in all four)

## Status

Explainer complete and verified to build cleanly. Not yet reviewed by anyone with Swiss Post
e-voting expertise — corrections very welcome.

## Licence

Not yet chosen. **Add a licence before making this repository public.** The reference material
described in `docs/sources.md` belongs to Swiss Post and is published under their own terms; this
walkthrough contains only original code and original prose describing their public documentation.
