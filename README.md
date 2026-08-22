# E-Voting Walkthrough 3D

An interactive, step-by-step explainer of how a vote is cast on the **Swiss Post e-voting
system** — and, more importantly, how a voter can verify that their vote was registered exactly as
they intended, even on a computer they do not trust.

A desk, a monitor, and a printed voting card, in 3D. No imported models or textures: every prop is
a Unity primitive with a material generated in code.

![The walkthrough, step by step](docs/walkthrough.gif)

---

## What this is

A voter receives a **printed voting card** by post. The card carries codes that the voter's
computer cannot know. During voting, the portal sends codes back to the screen and the voter
compares them against the paper. If they match, the vote was registered correctly. If they do not,
something tampered with the vote and the voter stops.

That comparison is the heart of the system, and this walkthrough exists to make it obvious. The
camera moves between the card and the monitor so that whichever the current step is about fills the
frame, and a glowing packet travels between them whenever a message is sent.

Fourteen steps, including the security checks before starting and the clean-up afterwards — both
easy to skip and more important than they look.

This is an **explainer, not a game**. See [Roadmap](#roadmap).

## Quick start

Requires **Unity 6000.5.9f1** — the version this project already targets. No extra packages.

1. Open the project in Unity Hub
2. Open the scene **`Assets/EVotingWalkthrough3D/Walkthrough3D.unity`**
3. Press **Play**, then **→** or **Next** to advance

The scene holds only a camera and one `Walkthrough3D` component; everything visible — desk,
monitor, card, voter, lighting — is built in `Awake`. If the scene ever goes missing,
**E-Voting Walkthrough 3D → Create and Open Scene** recreates it.

Note that this is a slideshow, not an animation: each step is a still image until you advance.

### Controls

| Input | Action |
|---|---|
| `→` `Space` `Enter` or **Next** | Next step |
| `←` `Backspace` or **Back** | Previous step |
| `R` | Back to the first step |

## The fourteen steps

| # | Step | Camera | What it shows |
|---|---|---|---|
| 1 | The voter's journey | Overview | Title and framing |
| 2 | The voting card arrives by post | Card | The four codes, generated per voter and per election |
| 3 | Am I on the real portal? | Monitor | Typing the address by hand, checking the certificate fingerprint |
| 4 | A browser without add-ons | Monitor | Incognito / Private mode, translation off |
| 5 | Portal step 1 · Legal provisions | Monitor | Acknowledging the terms |
| 6 | Portal step 2 · Start voting | Both | Initialization Code + year of birth |
| 7 | Portal step 3 · Enter the vote | Monitor | Making the selections |
| 8 | Portal step 4 · Check the vote | Both | Review, then encrypt and send |
| 9 | Portal step 5 · Verify the Choice Return Codes | Both | **The key step** — screen vs. paper |
| 10 | Portal step 6 · Enter the Confirmation Code | Both | The step that actually casts the vote |
| 11 | Portal step 7 · Verify the Finalization Code | Both | Confirmation the vote is in the ballot box |
| 12 | Stopping and resuming | Overview | What can still be changed, and when |
| 13 | After voting · Clearing the traces | Monitor | Cookies and cache, and when it is unnecessary |
| 14 | Why this is trustworthy | Overview | Individual and universal verifiability, vote secrecy |

Full detail, with sources, in **[docs/voting-process.md](docs/voting-process.md)**.

## Terminology

The Swiss Post documentation uses **two different sets of names** for the same four codes. This
project uses the names a voter actually sees on the portal:

| Used here (portal) | Also called (System Specification v1.6.1) |
|---|---|
| ▲ Initialization Code | Start Voting Key |
| ◆ Choice Return Codes | Choice Return Codes |
| ⬟ Confirmation Code | Ballot Casting Key |
| ★ Finalization Code | Vote Cast Return Code |

If you pull text from the specification or from `Security-advices/`, translate the names so the
walkthrough stays internally consistent.

## Project structure

The walkthrough is self-contained under one folder and touches nothing else in the project.

```
Assets/EVotingWalkthrough3D/
  Scripts/
    Walkthrough3D.cs        All fourteen steps, scene, camera, text
    Stage.cs                Primitives, URP materials, 3D-to-screen projection
    Symbols.cs              The four voting card symbols as generated textures
    ScreenshotCapture3D.cs  Documentation screenshot pass (-capture flag)
  Editor/
    WalkthroughBuild.cs     Scene creation and headless build
docs/
  voting-process.md         The documented process, with sources
  sources.md                Where every fact came from
  development.md            Architecture, editing content, building, regenerating images
  screenshots.md            All fourteen steps as images
  screenshots/              One PNG per step (generated)
  walkthrough.gif           All steps as an animation (generated)
tools/
  make_gif.py               Assembles the GIF from the screenshots
```

The rest of the repository is the Unity URP starter project from the initial commit (sample scene,
first-person controller, starter assets). The walkthrough does not use or modify it.

### Editing the content

Everything a reader sees lives in one array: `BuildSteps()` in
`Assets/EVotingWalkthrough3D/Scripts/Walkthrough3D.cs`. Each entry is one step — title, explanatory
paragraph, the lines on the monitor, which camera viewpoint to use, which card row to highlight, and
which way the packet travels. Adding a step means adding one entry.

## Two things worth knowing about this project

Both will bite anyone who forgets them, and both are why the walkthrough is written the way it is:

- **Universal Render Pipeline.** Materials built from the Built-in `Standard` shader render
  **magenta**. `Stage.cs` creates everything from URP shaders.
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

## Roadmap

The obvious next step is turning the explainer into the game the briefing asks for. The mechanic is
already implied by step 9: show the code the portal returned, and let the player find the match on
the card — with some rounds where the codes *deliberately do not match*, and the correct answer is
to stop and report it. That one interaction teaches the entire trust model.

Further ideas, in rough order of value:

- Letting the player pick the card up and turn it, instead of the camera doing the moving
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
