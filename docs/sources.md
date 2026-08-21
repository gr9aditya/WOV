# Sources

Every factual claim in this project traces back to one of the sources below. Where two sources
disagree, the disagreement is recorded rather than silently resolved.

## Primary sources

### 1 · The briefing deck

*"Explain Swiss Post E-Voting Through a Game"* — Post CH Digital Services. A printed deck covering
the voting card, the seven portal steps with real screenshots, stop-and-resume rules, the
recommended security checks, and how to reach the demo platform.

**This is the authority for terminology and for the portal flow**, because it matches what a voter
actually sees on screen.

Photographs of the deck are in `images/` and are **excluded from version control** — see
[Reference material and licensing](#reference-material-and-licensing).

### 2 · Swiss Post's public disclosure

[gitlab.com/swisspost-evoting](https://gitlab.com/swisspost-evoting) — group `10239218`, public.

| File | Used for |
|---|---|
| [`e-voting-documentation/System/System_Specification.pdf`](https://gitlab.com/swisspost-evoting/e-voting/e-voting-documentation/-/blob/master/System/System_Specification.pdf) §1.1–1.3, pp. 10–17 | The two-round return code scheme, security objectives, stated limitations |
| [`e-voting-documentation/Security-advices/en/readme.md`](https://gitlab.com/swisspost-evoting/e-voting/e-voting-documentation/-/tree/master/Security-advices/en) | The recommended security checks and what to do when a fingerprint mismatches |
| `Security-advices/en/incognito_chrome.md` | Incognito / private mode instructions, translation warning |
| `Security-advices/en/del_chrome.md` | Clearing cookies and cache, and when it is unnecessary |
| [`e-voting-documentation/ABOUT.md`](https://gitlab.com/swisspost-evoting/e-voting/e-voting-documentation/-/blob/master/ABOUT.md) | Which components exist and how the disclosure is organised |

Version read: **System Specification v1.6.1**, dated 2026-08-07.

### 3 · The demo portal

[demo.evoting.ch](https://demo.evoting.ch). A voting card can only be used **once**, so a fresh
card must be downloaded per session, and authentication always uses birth year **1980**.

## Known discrepancy: two sets of names

The specification and the portal call the same four codes by different names. This project uses
the portal's names throughout.

| Portal / briefing (used here) | System Specification v1.6.1 |
|---|---|
| Initialization Code | Start Voting Key |
| Choice Return Codes | Choice Return Codes |
| Confirmation Code | Ballot Casting Key |
| Finalization Code | Vote Cast Return Code |

Note that `Security-advices/en/readme.md` uses the **specification's** names ("ballot casting key",
"vote cast code") even though it is voter-facing documentation. When importing text from there,
translate the names.

The Extended Authentication Factor is likewise described as *year of birth* on the demo portal and
as *date of birth* in parts of the specification; cantons differ, and the demo uses the year.

## What is original, and what is taken

**Taken from the sources.** The codes shown on screen — `2r6i 3gfn dfgq gy7j q4q6 aqq8`,
`4419 7199 7`, `4137 6763`, and the Prüfcodes for *Sonniges Wetter* and *Regenwetter* — are the
real values from the briefing deck's sample card. Using them means the walkthrough matches what a
reader sees if they open the demo portal themselves. They are demonstration values from a public
demo system, not anyone's real voting credentials.

**Original.** All prose, the visual design, and every line of code. The stick figure, card layout
and colour scheme are our own, loosely following Swiss Post's use of yellow as the highlight colour.

An earlier revision of the walkthrough used invented codes and the specification's terminology.
Both were replaced once the briefing deck was consulted — it is the better source.

## Reference material and licensing

`images/` holds photographs of the printed Swiss Post briefing deck. That material is Swiss Post's,
not ours, so `.gitignore` keeps it out of the repository. Remove that line only if you have
permission to redistribute it.

The Swiss Post source code and documentation are published under their own terms — Apache 2.0 for
some components, a proprietary Swiss Post licence for others. This repository contains only
original code and original prose describing their public documentation; it redistributes neither.
