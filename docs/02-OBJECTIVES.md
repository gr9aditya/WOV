# Objectives

Every objective here is behavioural. "Understands verification" is not an
objective, because it cannot be observed. "Compares the returned code against the
sheet before continuing" is, because you can watch someone do it or fail to.

## Primary learning outcomes

After one complete playthrough — roughly fifteen minutes — the player should be
able to do the following.

### 1. Recognise the code sheet as the anchor of the whole process

The player has consulted it seven times, at their own initiative, under time
pressure. They know it is the one thing the system cannot generate, because it
arrived on paper, and therefore the one thing an attacker on the network cannot
forge.

*Observable:* asked what the paper is for, they say it is what you check the
screen **against**, not what you type **into** the screen.

### 2. Verify before committing, not after

The boat number is checked before boarding. The pattern is entered before the gate
opens. The player has learned the order because the game enforces it.

*Observable:* on the real portal, they pause at the returned codes instead of
clicking through.

### 3. Read a returned value as a claim to be checked

Choice Return Codes are the least intuitive part of real e-voting: the system
tells you what it recorded, and your job is to disbelieve it until it matches
paper. The game teaches this by making the guardian's status value **wrong about
half the time**, with *Stimmt* / *Falsch* buttons — so trusting it is a losing
strategy that the player discovers by losing.

*Observable:* they can explain why the system showing a value is not proof, and
what the paper adds.

### 4. Distinguish "cast" from "recorded"

The confirmation code is the moment the vote becomes binding. Before it, nothing
is final. The game separates these into two different gates in two different
places, which is why the second gate was rebuilt as a rune tower — so the two
checks cannot be remembered as one repeated obstacle.

*Observable:* they know there is a step after choosing, and that stopping early
means not having voted.

### 5. Treat finalisation as proof of completeness

The final star proves the vote arrived whole. The threat is the quiet one: an
incomplete submission nobody notices.

*Observable:* they look for a completion confirmation rather than assuming the
absence of an error means success.

### 6. Protect the session at both ends

The hat is the private browser window before starting. The sweeping is clearing
history, cache and cookies afterwards. Both are device hygiene rather than
cryptography, and both are the player's responsibility alone.

*Observable:* they open a private window unprompted, and clear up afterwards on a
shared machine.

### 7. Name the threat each step defeats

Not just *what* to do, but *what would otherwise happen*. Every learn card states
the averted threat explicitly, and the closing panel collects them into one table.

*Observable:* given a step, they can state the attack it prevents.

## Design objectives that serve the learning ones

- **No failure is terminal.** Every wrong path returns to a checkpoint, never to
  the start. A player who is punished with lost progress learns to avoid risk,
  including the risk of experimenting — which is the opposite of what this needs.
- **Fifteen minutes, start to finish.** Long enough to earn the ending, short
  enough for a fair booth or a classroom period.
- **Playable without sound and without fine motor control.** Keyboard, mouse and
  touch all work; effects and shake can be switched off; `prefers-reduced-motion`
  is honoured.
- **Three languages.** DE, FR and IT, switchable mid-run, because a Swiss civic
  tool that is German-only excludes the people it claims to serve.

## How to tell whether it worked

Ranked by how much they actually tell you.

| Signal | Method | Reads as success |
|---|---|---|
| Unprompted comparison | Watch a first-time player at the river. Do they open the sheet before boarding? | They open it without being told |
| Threat articulation | Afterwards: "why does the system show you a code?" | They mention checking against paper |
| Transfer | Show the real portal. Where do they slow down? | They pause at the returned codes |
| Completion rate | Instrument scene entries | Most reach the ending unaided |
| Failure distribution | Which checks are failed most? | Concentrated failures mean an unclear step, not a stupid player |

The last row is the important one for iteration. A step that everyone fails is a
design bug in the game, not a comprehension failure in the player.

## Explicit non-objectives

- **Not teaching the cryptography.** No mixnets, no zero-knowledge proofs. The
  player learns which checks to perform and why, not how the guarantees are
  constructed.
- **Not simulating the portal.** No screen here resembles a real one, deliberately
  — see [Goal of the gamification](04-GOAL-OF-GAMIFICATION.md).
- **Not persuading anyone that e-voting is safe.** The goal is a voter equipped to
  check, which serves them whatever they conclude.

---

Previous: [Motivation](01-MOTIVATION.md) · Next: [Symbols and meaning](03-SYMBOLS-AND-MEANING.md)
