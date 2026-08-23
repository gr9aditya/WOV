# Goal of the gamification

The goal is not to make e-voting fun. It is to move individual verifiability from
something a voter has *read about* to something they have *done*.

## Why gamify at all

The verification steps are not difficult. Compare a number. Type a code. Check a
value. Anyone can do them. The problem is that nobody has a reason to care about
doing them properly, because the failure they prevent has never happened to them
and cannot be imagined from a leaflet.

Games are unusually good at exactly one thing here: **making a consequence
felt at the moment of the decision.** Not explained afterwards — felt, in the two
seconds after the choice.

That is the whole mechanism. Everything else is delivery.

## The design rules

### 1. The player performs the step; the game never performs it for them

There is no cutscene of Bruno comparing a number. The player opens the sheet, reads
it, and answers. If a step could be automated in the game it would also be skipped
in life, so nothing is automated.

### 2. Failure is instructive, not punitive

Every wrong path shows the consequence, explains it, and returns to the start of
the current scene. Never to the beginning.

This was not the original design — the game used to reset. It changed because a
player who fears losing progress stops experimenting, and the single most valuable
discovery in this game is that *the status value is sometimes wrong.* You only
find that out by trusting it once and being burned. A punishing game hides its own
best lesson.

### 3. Fantasy carries the mechanic, the learn card carries the vocabulary

"Initialisation code" is precise and forgettable. "The pattern carved into the
gate" is memorable and imprecise. The game uses the second to teach the action,
then names the first immediately afterwards in a learn card.

Neither half works alone. Fantasy without vocabulary produces a player who cannot
transfer anything to the real portal. Vocabulary without fantasy produces the
leaflet nobody read.

### 4. The mapping is not negotiable

When the fiction and the real process disagree, the fiction changes. See
[Mapping to e-voting](05-MAPPING-TO-E-VOTING.md). The rune tower exists because
the previous design used one visual for two different real steps.

### 5. Deliberately not a portal simulator

No screen resembles a real one. This is a choice, and it costs something — a
player will not recognise the interface — but it buys two things worth more:

- **The lesson outlives the interface.** Portals get redesigned. A player who
  learned "compare the returned value against paper" still knows what to do; a
  player who learned "the code goes in the third box" does not.
- **It cannot be mistaken for the real thing.** A convincing replica of a voting
  portal is a phishing template. This one could not be repurposed if you tried.

### 6. No score, no timer, no leaderboard

The reward for correct verification is that the story continues. Adding points
would teach players to optimise for points, and the correct real-world behaviour —
slow down, compare carefully — is exactly what a scoreboard punishes.

## What gamification cannot do here

Stating the limits, because a document claiming a game solves trust in elections
would be worth nothing.

- **It cannot make a compromised device safe.** If the browser is owned, the
  player's care is not enough. The game teaches the checks that catch a *dishonest
  server*, which is what individual verifiability is actually for.
- **It cannot verify anything.** No cryptography, no connection to any real
  system.
- **It cannot reach people who will not play it.** Fifteen minutes of attention is
  a real cost, and the people most at risk of clicking past a verification prompt
  are the least likely to spend it.
- **It cannot prove its own effect.** The claim in [Objectives](02-OBJECTIVES.md)
  — that a player verifies for real afterwards — is testable and has not been
  tested. It is a hypothesis this project is built on, not a result it has
  demonstrated.

## The success condition

One sentence:

> A player who has finished this game, sitting at the real portal, notices when the
> returned code does not match the paper — and stops.

Everything above serves that. Anything that does not serve it is decoration, and
decoration is fine as long as it is not mistaken for the point.

---

Previous: [Symbols and meaning](03-SYMBOLS-AND-MEANING.md) · Next: [Mapping to e-voting](05-MAPPING-TO-E-VOTING.md)
