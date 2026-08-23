# Symbols and meaning

Every object the player interacts with stands for something. This document is the
dictionary. The rule it follows: **a symbol must behave like the thing it
represents, or it teaches the wrong lesson.**

A code sheet that could be regenerated in-game would quietly teach that the paper
does not matter. So it cannot be regenerated. That constraint decides most of the
design below.

## The objects

### The hat 🎩

**Stands for:** the private browser window you open before the voting portal.

Bruno takes it off a hook before leaving the house, and the door will not let him
out without it. It is the first interaction in the game — before the code sheet,
before any puzzle — because in reality it is the first thing you do, and doing it
afterwards is worthless.

> *"Hut auf — jetzt kann mir unterwegs niemand über die Schulter schauen."*

**Why a hat:** it is worn for the whole journey and visible in every frame. The
protection is continuous, not a one-off action, and the sprite says so without a
word.

### The code sheet (Codeblatt) 📜

**Stands for:** the voting card that arrives by post.

Recoverable at any time with `G`, with a front and a back that flip. Every value
the player needs is on it, and **nothing in the game can produce a second one**.
It arrives once, from the mailbox, from outside the system.

**Why it matters that it is paper:** this is the anchor of individual
verifiability. An attacker who controls the network and the browser still cannot
change what was printed and posted. The game reproduces this by making the sheet
the only source of truth that no puzzle can alter.

Its values are re-rolled per playthrough, so a player cannot memorise answers and
skip the comparing — the comparing is the skill.

### The boat and its number ⛵

**Stands for:** verifying the voting card before you begin.

Two boats at the jetty, each with a number on a post. One matches the sheet. Board
the wrong one and it puts out, breaks up and sinks.

**Threat:** a forged or stolen card, phishing. The doc string in the game is exact
about this: *a foreign "ship" looks real, but takes you nowhere.*

**Why a boat:** boarding is irreversible in a way that clicking is not. The
player feels the commitment before they make it, which is the feeling the real
step needs and does not have.

### The pattern on the gate 🔷

**Stands for:** the initialisation code that starts your session.

A gate with carved symbols; the player picks the pattern from their sheet. Right
opens it, wrong flares red and rejects.

**Threat:** someone opening a session in your name.

**Why a gate:** it is a threshold. Nothing before it counts, and it either opens
or it does not — a binary that matches the real check exactly.

### The status value 📟

**Stands for:** the Choice Return Codes.

After beating a guardian, a device shows a status value, and the player answers
*Stimmt* or *Falsch* against their sheet.

**This is the most important symbol in the game, and the only one that lies.**
The value is wrong roughly half the time. A player who trusts the readout fails
about half their attempts; a player who compares against paper succeeds always.

**Threat:** your vote altered in transit, or recorded as something you did not
intend.

**Why a measuring device rather than a person:** the real Choice Return Code comes
from the system, and the system is precisely what you are not supposed to take on
faith. A device that is sometimes wrong teaches this in a way that no amount of
explanation does.

### The guardians: spider and crocodile 🕷️🐊

**Stand for:** nothing. They are deliberately not symbols.

They are obstacles that make the status value worth reaching, and they give the
sword a purpose. Every other object here maps onto a real step; these two do not,
and pretending otherwise would break the mapping's credibility.

### The sword ⚔️

**Stands for:** the means of getting through the checks — closest to "the tooling
you have been given," but held loosely.

Taken from an altar in a clearing. It has no e-voting counterpart and does not
appear in the mapping table.

### The confirmation code and the rune tower 🗼

**Stands for:** the Confirmation Code that makes the vote binding.

A tower whose runes light one after another as the code is accepted, then the door
opens. Wrong, and everything flares red and dies.

**Threat:** a vote cast without your conscious confirmation.

**Why a tower and not a second gate:** it was a second gate, and that was a
mistake. Two identical walls taught players that this was the same check again,
when it is a different check at a different moment — *choosing* versus *casting*.
Rebuilding it as a tower (v15) separates them in memory. When the fiction blurs
two real steps into one, the fiction is what changes.

### The final star ⭐

**Stands for:** the finalisation code, proving the vote arrived complete.

In a star chamber the player picks the star matching their sheet from several
candidates. Correct, and Bruno flies out with it.

**Threat:** an incomplete submission that nobody notices — the quiet failure, with
no error message.

**Why a star and why last:** it is a receipt. The game ends in daylight because
finalisation is what lets you stop worrying.

### Sweeping the tracks 🧹

**Stands for:** clearing browser history, cache and cookies after voting.

Bruno's footprints persist across every scene for the whole game. At the end the
player presses a button and he sweeps them away, backwards through the world.

**Threat:** whoever uses the device next reading what you did.

**Why footprints, accumulating all game:** the player has been leaving them for
fifteen minutes without noticing. The realisation that a trail existed the whole
time *is* the lesson, and it only works because the trail was real and visible the
whole time. As of v14 the player must press the button — being shown the cleanup
is weaker than choosing it.

### The lives, the checkpoints 💚

**Stand for:** nothing, and that is deliberate.

Failure returns the player to the start of the current scene, never to the
beginning. Real verification has no lives; you check, or you do not. Punishing
mistakes with lost progress teaches risk-aversion, and a player afraid to
experiment never discovers that the status value lies.

## The symbol test

Before adding one, three questions:

1. **Does it map to a real step?** If not, it is scenery — fine, but it stays out
   of the mapping table.
2. **Does it behave like the real thing?** The sheet cannot be reissued. The
   status value can be wrong. The confirmation is irreversible.
3. **Would getting it wrong here teach something false?** A re-issuable sheet
   would teach that paper does not matter. That is worse than teaching nothing.

---

Previous: [Objectives](02-OBJECTIVES.md) · Next: [Goal of the gamification](04-GOAL-OF-GAMIFICATION.md)
