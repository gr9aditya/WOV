# The Swiss Post e-voting process

This is the process the walkthrough teaches, written out in full. Every section names the source
it came from; see [sources.md](sources.md) for the exact files.

## The idea in one paragraph

The Swiss Post Voting System is a **two-round return code scheme**. Before the election, the voter
receives a printed voting card carrying codes that were generated for that one voter and that one
election. While voting, the system sends codes back to the screen, and the voter compares them
against the paper. A compromised computer can display anything it likes, but it cannot know what
is printed on a card that arrived by post. That asymmetry is what makes the vote verifiable.

## The voting card

The printed card (*Stimmrechtsausweis*) contains:

| Symbol | Code | German | Purpose |
|---|---|---|---|
| ▲ | Initialization Code | Initialisierungscode | Starts the voting process |
| ◆ | Choice Return Codes | Prüfcodes | One per selectable option, to verify what was registered |
| ⬟ | Confirmation Code | Bestätigungscode | Casts the vote |
| ★ | Finalization Code | Finalisierungscode | Confirms the vote reached the ballot box |

It also carries voter identification, election information, portal instructions, support contact
details, the **portal URL and its certificate fingerprint**, and general security information.

There is a Choice Return Code for **every selectable option** — candidates, lists, referendum
answers, blank selections and cumulative selections — not only for the ones chosen. This matters:
the voter looks up their own selection among all the printed options.

For elections with abstentions, the card also carries an **Abstention Choice Return Code** per
abstention group, so that abstaining and voting blank stay distinguishable.

## The seven portal steps

The portal shows these as a sidebar, and the walkthrough mirrors it.

### 1 · Legal provisions (Gesetzliche Bestimmungen)

The voter confirms they are voting electronically and acknowledges the criminal-law provisions
protecting the ballot (Swiss Criminal Code, Art. 279–283).

### 2 · Start voting (Stimmabgabe starten)

The voter enters the **Initialization Code** from the card, plus the **Extended Authentication
Factor** — the year of birth (some cantons use the full date). Capitalisation of the code does not
matter.

### 3 · Enter the vote (Stimme erfassen)

The voter makes their selections, or leaves them blank. Nothing has left the device yet.

### 4 · Check the vote (Stimme kontrollieren)

The voter reviews the selections and confirms sending. The client then **encrypts the ballot on
the voter's own device** and transmits it.

Two consequences the portal states explicitly:

- After encryption and transmission, the selections **can no longer be changed**.
- Until the Confirmation Code is entered, the voter may still abandon the process entirely and
  vote by post or at the polling station instead.

### 5 · Verify the Choice Return Codes (Prüfcodes verifizieren) — the key step

The system returns a Choice Return Code for each selection. The voter compares each one against
the code printed next to that same option on the card.

- **All match** → the system registered exactly what the voter chose. Continue.
- **Any mismatch** → stop, and contact the municipality or canton.

The portal makes the voter assert this explicitly, with *Alle Codes stimmen überein* ("all codes
match") and *Nicht alle Codes stimmen überein* ("not all codes match") as separate buttons.

### 6 · Enter the Confirmation Code (Bestätigungscode eingeben)

Only once every code matches does the voter type the Confirmation Code.

**This is the step that casts the vote.** Without it, the ballot never enters the electronic
ballot box. After it, the vote is final and cannot be replaced by a postal or in-person vote.

### 7 · Verify the Finalization Code (Finalisierungscode verifizieren)

The system returns the Finalization Code. The voter compares it with the card. A match means the
vote is in the electronic ballot box and the process is complete. A mismatch means contacting the
municipality.

## Stopping and resuming

The voter may interrupt the process and resume later, **including from a different device**. What
is still possible depends on how far they got:

| Interrupted… | On returning, the voter can… |
|---|---|
| before ballot encryption | log in again and **change** the selections |
| after encryption, before the Confirmation Code | view the Choice Return Codes again and continue; selections are **fixed** |
| after the Confirmation Code | only verify the Finalization Code; the vote is **final** |

Reporting a problem is always possible. Because the Finalization Code can be re-checked from any
device, a voter who distrusts one computer can confirm their vote from another.

## The recommended security checks

From Swiss Post's security advice. The first two belong **before** voting, the last **after**.

### Before · Confirm the portal is genuine

Type the portal address into the address bar by hand rather than following a link, then compare
the browser's **certificate fingerprint (SHA-256)** with the one printed on the voting card.

If the fingerprint differs, stop and inform the canton's support team. Note that a mismatch is
*usually not* an attack: corporate networks and antivirus software commonly intercept TLS
connections to inspect traffic, which changes the fingerprint.

### Before · Use a browser mode without add-ons

| Browser | Mode |
|---|---|
| Chrome, Edge | Incognito / InPrivate window |
| Firefox | Private Window |
| Safari | Private Browsing |

In Chrome: three-dot menu → **New incognito window** → continue in the dark-background window.
Add-ons can be disabled manually instead.

**Also turn off the browser's automatic translation**, or the portal may not display correctly.

### After · Clear the browsing data

So that nothing on the device reveals how the voter voted. In Chrome: three-dot menu → **Delete
browser data** → a time range covering the voting session (e.g. *Last hour*) → tick both
**Cookies and other website data** and **Cached images and files** → **Delete data**.

A private window stores no history in the first place, so this clean-up is **only needed if the
voter used a normal window**.

### Two further checks, not yet in the walkthrough

- **Verify the integrity of the HTML and JavaScript**, by comparing hash values of the JavaScript
  files against those published by the cantons and external experts. HTML can only be checked
  manually.
- **Synchronise the system clock**, which the portal requires to work correctly.

## Why the process is trustworthy

The system is designed around three properties:

**Individual verifiability.** The return codes let a voter confirm their own vote was registered
as intended. Because the codes are printed on paper the computer never sees, this holds *even if
the voting client is malicious* — an attacker controlling the client and most of the server
infrastructure still cannot alter or drop a vote without a diligent voter noticing.

**Universal verifiability.** Independent auditors re-check every step of the count — from the
registration of encrypted votes through decryption and tallying — using separate verifier
software, without learning how anyone voted. Zero-knowledge proofs and verifiable mix-nets make
this possible.

**Vote secrecy.** The ballot is encrypted end-to-end on the voter's device, and the decryption key
is split among several control components, so no single party can read a vote.

### The limits, stated honestly

The specification is explicit about what the system does *not* promise:

- Security holds against a computationally bounded adversary. A sufficiently capable quantum
  computer would break some of the underlying assumptions; quantum resistance is future work.
- Vote secrecy assumes the voting client is not controlled by the attacker. Individual
  verifiability survives a malicious client; **secrecy does not** — cryptography cannot stop a
  compromised device from observing the voter's choices.
- The setup and printing component is assumed trustworthy. It generates the codes and prints the
  cards, and is not distributed the way the rest of the system is, because a voter cannot
  reasonably combine several code sheets by hand.

A walkthrough that omits these would be marketing rather than education, which is why they are
recorded here.
