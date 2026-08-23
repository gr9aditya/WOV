# Motivation

## The problem is not that people distrust e-voting

It is that they have no way to form an opinion about it.

Swiss Post's e-voting system is individually verifiable. A voter can check, with
codes printed on paper they received by post, that the system recorded the vote
they intended and that it arrived complete. That property is the whole point of
the design, and it is why the system can be trusted at all.

Almost nobody uses it.

The steps are explained accurately, in leaflets and on the portal, and the
explanations are read the way terms and conditions are read. The voter sees a
field asking for a code, finds the code, types it, and moves on. Nothing in that
experience communicates *why* the field is there or *what would go wrong* if the
codes did not match. So the check becomes a formality, and a formality is exactly
the thing an attacker relies on: a voter who types codes without comparing them
is a voter who cannot be warned.

## Reading about a check is not the same as performing one

Security instructions have a specific failure mode. They are written in the
conditional — *if the code does not match, do not continue* — and the reader has
never been in the situation the conditional describes. The instruction is
understood and not retained, because nothing about it was ever at stake.

A game inverts that. The instruction becomes a situation the player is inside.

In Bruno's world the boat number has to match the number on the code sheet before
he steps aboard. A player who does not compare gets on the wrong boat, and the
boat breaks apart in open water and sinks. Nobody has to explain that verification
matters. The player has just been told, by the game rather than by a leaflet, and
the telling took two seconds and cost them a checkpoint.

That is the entire argument for this project: **the cost of skipping a check is
abstract in a leaflet and concrete in a game.**

## Why a bear, and why Bern

The BärnHäckt challenge asked for the Swiss Post e-voting process explained as a
game. The bear is the Bern coat of arms, so the setting places the subject without
a word of exposition — the player knows whose election this is before the first
dialogue box.

The fantasy framing does something else, too. Words like *initialisation code* and
*Choice Return Code* are precise and forgettable. A pattern carved into a gate and
a status value read off a defeated guardian are neither precise nor forgettable —
but they are *memorable*, and the game maps each one back to its real name in a
learn card immediately after the player uses it. The fantasy carries the mechanic;
the learn card carries the vocabulary. Neither alone would work.

## What this is not

It is not a simulator of the Swiss Post portal, and it does not try to look like
one. Someone who plays it will not recognise a screen. They will recognise a
*situation*: a code that has to be compared before continuing, a system reporting
back what it recorded, a final confirmation that makes the thing binding.

It is also not a security tool. It cannot make a compromised device safe. What it
can do is produce a voter who notices when the number does not match — and that
voter is the one part of the system no cryptography can supply.

## The bet

The claim being tested is narrow and falsifiable:

> A person who has played through the verification steps once will perform them on
> the real portal, instead of clicking past them.

Everything in [Objectives](02-OBJECTIVES.md) exists to make that claim measurable.

---

Next: [Objectives](02-OBJECTIVES.md) · [Symbols and meaning](03-SYMBOLS-AND-MEANING.md)
