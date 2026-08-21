# E-Voting Walkthrough

An interactive, step-by-step explainer of how a vote is cast on the **Swiss Post e-voting
system** — and, more importantly, how a voter can verify that their vote was registered
exactly as they intended, even on a computer they do not trust.

Built in Unity 2D with no imported assets: every shape on screen is generated in code.

![The walkthrough, step by step](docs/walkthrough.gif)

---

## What this is

A voter receives a **printed voting card** by post. The card carries codes that the voter's
computer cannot know. During voting, the system sends codes back to the screen and the voter
compares them with the paper. If they match, the vote was registered correctly. If they do not,
something tampered with the vote and the voter stops.

That single comparison is the heart of the system, and this walkthrough exists to make it
obvious. It covers all fourteen steps of the journey — including the security checks before
starting and the clean-up afterwards, which are easy to skip and matter more than they look.

This is currently an **explainer, not a game**. See [Roadmap](#roadmap).

## Quick start

Requires **Unity 6000.5.9f1** (or any Unity 6 release).

1. Unity Hub → **Add** → **Add project from disk** → select this folder
2. Open it, then press **Play**

There is no scene to open and nothing to wire up in the Inspector: a
`[RuntimeInitializeOnLoadMethod]` hook builds the camera and the whole scene when Play starts,
so an empty scene is enough.

Set the Game view to **16:9** for the intended framing. The camera adapts to other aspect
ratios, but 16:9 is what the layout is tuned for.

### Controls

| Input | Action |
|---|---|
| `→` `Space` `Enter` or **Next** | Next step |
| `←` `Backspace` or **Back** | Previous step |
| `R` | Back to the first step |

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
| 11 | Portal step 7 · Verify the Finalization Code | Confirmation that the vote is in the ballot box |
| 12 | Stopping and resuming | What can still be changed, and when |
| 13 | After voting · Clearing the traces | Cookies and cache, and when it is unnecessary |
| 14 | Why this is trustworthy | Individual and universal verifiability, vote secrecy |

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

If you pull text from the specification or from `Security-advices/`, translate the names to the
portal's set so the walkthrough stays internally consistent.

## Project structure

```
Assets/
  Scripts/Walkthrough/
    VotingWalkthrough.cs   All fourteen steps, layout, navigation, text
    Shapes.cs              Procedural sprites: box, circle, triangle, diamond, pentagon, star
    ScreenshotCapture.cs   Documentation screenshot pass (-capture flag)
  Editor/
    BuildScript.cs         Headless build entry point
  StarCatcherDemo/         Unrelated sample game from before this project; not used
docs/
  voting-process.md        The documented process, with sources
  sources.md               Where every fact came from
  development.md           How to run, build, and regenerate the screenshots
  screenshots.md           Index of the per-step images
  screenshots/             One PNG per step (generated)
  walkthrough.gif          All steps as an animation (generated)
tools/
  make_gif.py              Assembles the GIF from the screenshots
```

### Documentation

| Document | Contents |
|---|---|
| [docs/voting-process.md](docs/voting-process.md) | The full process, the security checks, and the system's stated limits |
| [docs/sources.md](docs/sources.md) | Every source, and the terminology discrepancy between them |
| [docs/development.md](docs/development.md) | Architecture, editing content, building, regenerating images |
| [docs/screenshots.md](docs/screenshots.md) | All fourteen steps as images |

### Editing the content

Everything a reader sees lives in one array: `BuildSteps()` in
[`VotingWalkthrough.cs`](Assets/Scripts/Walkthrough/VotingWalkthrough.cs). Each entry is one
step — its title, its explanatory paragraph, the lines shown on the portal screen, which card row
to highlight, and which way the arrow points. Adding a step means adding one entry; nothing else
needs to change.

## Sources

Content is drawn from Swiss Post's public disclosure at
[gitlab.com/swisspost-evoting](https://gitlab.com/swisspost-evoting) and from the
"Explain Swiss Post E-Voting Through a Game" briefing. Every claim is traced to a file in
**[docs/sources.md](docs/sources.md)**.

The live demo portal is at [demo.evoting.ch](https://demo.evoting.ch) — download a fresh voting
card per session, and authenticate with birth year **1980**.

## Roadmap

The obvious next step is turning the explainer into the game the briefing asks for. The mechanic
is already implied by step 9: show the code the portal returned, and let the player find the
match on the card — with some rounds where the codes *deliberately do not match*, and the correct
answer is to stop and report it. That one interaction teaches the entire trust model.

Further ideas, in rough order of value:

- Verifying JavaScript hash values and system time (the two advanced security checks not yet covered)
- The counting phase and the independent Verifier — the "universal verifiability" half of the story
- German / French / Italian / Romansh text (the source security advice already exists in all four)

## Status

Explainer complete and verified to compile cleanly against Unity 6000.5.9f1. Not yet reviewed by
anyone with Swiss Post e-voting expertise — corrections very welcome.

## Licence

Not yet chosen. **Add a licence before making this repository public.** Note that the reference
material in `docs/sources.md` belongs to Swiss Post and is published under their own terms; this
repository contains only original code and original prose describing their public documentation.
