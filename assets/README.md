# Assets

Alle Sprites sind **horizontale Sprite Sheets**: die Einzelbilder (Frames)
liegen nebeneinander in einer PNG. Beispiel bei 6 Frames à 24x16:

```
[f0][f1][f2][f3][f4][f5]   -> PNG ist 144 x 16 px
```

Transparenter Hintergrund (PNG mit Alpha). Pixel Art, kein Antialiasing.

## Wohin welche Datei

| Manifest Key       | Datei                       | Frames | Frame Grösse | Zweck |
|--------------------|-----------------------------|--------|--------------|-------|
| bruno_idle         | bruno/idle.png ✅           | 1      | 32x32        | Steht (Frame 0 des Sheets, `start:0`) |
| bruno_walk         | bruno/idle.png ✅           | 6      | 32x32        | Läuft (Frame 2–7 desselben Sheets, `start:2`) |
| bruno_attack       | bruno/attack.png            | 6      | 24x16        | Schwertangriff |
| bruno_hit          | bruno/hit.png               | 3      | 16x16        | Wird getroffen |
| bruno_death        | bruno/death.png             | 6      | 20x16        | Tod / Fall ins Wasser |
| bruno_cheer        | bruno/cheer.png             | 4      | 16x16        | Jubel am Ende |
| spider_idle        | spider/idle.png ✅          | 14     | 32x19        | Spinne wartet (aus spider/idle.gif) |
| spider_hit         | spider/hit.png              | 3      | 32x19        | Spinne getroffen — *zeigt z.Z. idle.png, 24 fps* |
| spider_defeated    | spider/defeated.png         | 5      | 32x19        | Spinne besiegt — *zeigt z.Z. idle.png, 4 fps* |
| croc_idle          | croc/idle.png ✅            | 8      | 32x15        | Krokodil wartet (aus croc/idle.gif, schaut nach links) |
| croc_hit           | croc/hit.png                | 3      | 32x15        | Krokodil getroffen — *zeigt z.Z. idle.png, 24 fps* |
| croc_defeated      | croc/defeated.png           | 5      | 32x15        | Krokodil besiegt — *zeigt z.Z. idle.png, 4 fps* |
| fisher_good        | props/fisher_good.png ✅    | 8      | 19x32        | Fischer 1 (aus props/fisher_good.gif) |
| hat                | props/hat.png ✅            | 1      | 16x9         | Hut (Fedora), per Pillow erzeugt; hängt am Haken, danach Overlay auf Brunos Kopf (`drawHat`) |
| fisher_evil        | props/fisher_evil.png ✅    | 5      | 20x32        | Fischer 2 (aus props/fisher_evil.gif) |
| sword              | props/sword_small.png ✅    | 8      | 6x14         | Schwert (halbe Grösse), Drehung. Klinge zeigt im Sheet nach **unten**; im Altar dreht es sich, in der Pfote wird Frame 0 gespiegelt gezeigt. `props/sword.png` (12x29) liegt als Reserve bei |
| boat               | props/boat.png (ok)         | 1      | 56x26        | Ruderboot Seitenansicht, erzeugt mit `tools/make_boat.py`; Schaukeln/Wrack im Code (`drawBoatHull`, `drawBoatWreck`) |
| boat_break         | props/boat_break.png        | 6      | 34x20        | Boot zerbricht (falsche Wahl) |
| gate_closed        | props/gate_closed.png       | 1      | 64x96        | (unbenutzt seit v6 — das Tor ist prozedurale Pixel-Art in `pixart.js`, `gateDraw`) |
| gate_open          | props/gate_open.png         | 6      | 64x96        | (unbenutzt, s.o.) |
| gate_reject        | props/gate_reject.png       | 4      | 64x96        | (unbenutzt, s.o.) |
| sword_glow         | props/sword_glow.png        | 4      | 12x16        | (frei — Drehung steckt schon in `sword`) |
| star_float         | props/star_float.png        | 4      | 12x12        | Stern schwebt |
| star_collect       | fx/star_collect.png         | 5      | 16x16        | Richtiger Stern eingesammelt |
| star_shatter       | fx/star_shatter.png         | 5      | 16x16        | Falscher Stern zerbricht |
| splash             | fx/splash.png               | 5      | 20x16        | Wasserspritzer |
| slash              | fx/slash.png                | 4      | 16x16        | Schwerthieb Effekt |
| bg_home …          | bg/home.png … (optional)    | 1      | 256x144      | Ganze Szene als Bild statt Code |

Requisiten ohne Sheet (Briefkasten, Boote, Schriftrolle, Wegweiser, Symbole,
Stern, Laterne, Totenkopf) sind Pixelkarten in `pixart.js` (`PIX`): ein
Zeichen = ein Pixel, Palette pro Sprite. `drawPix(name, x, bottomY)` zeichnet
sie, `pixIcon(name, scale)` liefert ein data-URL fürs DOM.

✅ = echtes Sheet liegt drin. Die Quell-GIFs liegen jeweils daneben
(`idle.gif`, `fisher_good.gif`, …), damit man ein Sheet jederzeit mit
`gif2sheet.py` neu bauen kann.

Kulissen-Loops (Fischer, Spinne, Krokodil, Schwert am Boden) laufen über
`loopFrame(key)` in `game.js` — der Frame kommt direkt aus der Spielzeit,
`fps` im Manifest bestimmt das Tempo. Bruno und die Sequenz-Schritte
laufen weiter über `Anim`.

## So bindest du ein Asset ein

In `game.js` ganz oben im `ASSET_MANIFEST` beim passenden Key `src`
setzen und `frames` prüfen:

```js
bruno_walk: { src:'assets/bruno/walk.png', frames:6, fps:10, w:16, h:16, loop:true },
```

Mehr nicht. Solange `src:null` bleibt, zeichnet die Engine den
Platzhalter. Sobald ein echtes Sheet geladen ist, verschwindet der
Platzhalter automatisch.

Zwei optionale Felder:

* `start:N` — erster Frame im Sheet. Damit können mehrere Animationen in
  einer PNG liegen (Bruno: Idle = Frame 0, Walk = Frame 2–7).
* `padBottom:N` — leere Zeilen unter den Füssen. Wird beim Laden
  **automatisch gescannt** (über das ganze Sheet) und von `drawSprite`
  abgezogen, damit niemand über dem Boden schwebt. Nur setzen, wenn der
  Scan danebenliegt (z.B. ein Schatten, der tiefer reicht als die Füsse).
  Über `file://` kann der Browser nicht in die Canvas lesen — dann gilt 0.

Frame Grössen sind Vorschläge — passt sie an eure echten Assets an,
dann stimmt die Engine sich automatisch darauf ein.

---

## GIF -> Sprite Sheet: `tools/gif2sheet.py`

Du musst Frames nicht von Hand extrahieren. Leg das GIF in den passenden
Ordner und lass das Script laufen — es macht Frames raus, entfernt den
Hintergrund, rechnet auf die native Pixelaufloesung zurueck, haertet die
Alphakante und schreibt ein horizontales Sheet. Am Ende druckt es die
fertige `ASSET_MANIFEST` Zeile, die du nur noch reinkopieren musst.

Braucht nur Pillow (`pip install --break-system-packages Pillow`).
Das Spiel selbst bleibt dependency-frei — das Script ist ein Build-Helfer.

```bash
# Standardfall: GIF -> Sheet, Kontrollbild dazu
python3 tools/gif2sheet.py assets/bruno/attack.gif -o assets/bruno/attack.png \
    --key bruno_attack --fps 14 --loop false --native 32x32 --preview

# So sind die aktuellen Sheets entstanden (GIFs waren schon sauber: 32x32,
# transparenter Hintergrund -> --bg none; Kulissenfiguren duerfen --trim):
python3 tools/gif2sheet.py assets/spider/idle.gif -o assets/spider/idle.png --key spider_idle --fps 6 --bg none --trim
python3 tools/gif2sheet.py assets/croc/idle.gif   -o assets/croc/idle.png   --key croc_idle   --fps 8 --bg none --trim
python3 tools/gif2sheet.py assets/props/fisher_good.gif -o assets/props/fisher_good.png --key fisher_good --fps 8 --bg none --trim
python3 tools/gif2sheet.py assets/props/fisher_evil.gif -o assets/props/fisher_evil.png --key fisher_evil --fps 8 --bg none --trim
python3 tools/gif2sheet.py assets/props/sword.gif -o assets/props/sword.png --key sword --fps 6 --bg none --native 32x32 --trim

python3 tools/gif2sheet.py assets/spider/defeated.gif -o assets/spider/defeated.png \
    --key spider_defeated --fps 8 --loop false --preview

# Einzelne PNG-Frames statt GIF
python3 tools/gif2sheet.py frames/walk_*.png -o assets/bruno/walk.png --key bruno_walk --fps 10

# Ein bereits montiertes Sheet neu aufbereiten (z.B. hochskaliert geliefert)
python3 tools/gif2sheet.py sheet.png --in-frames 6 -o assets/bruno/attack.png --key bruno_attack
```

### Die wichtigsten Optionen

| Option | Wofuer |
|---|---|
| `--native 32x32` | Zielgroesse pro Frame erzwingen. **Bei hochskalierten Assets mit weichen Kanten immer setzen.** |
| `--scale N` | stattdessen den Verkleinerungsfaktor angeben |
| `--bg auto\|none\|#ffffff` | Hintergrundfarbe. `auto` errät sie aus den Ecken, `none` laesst Alpha wie es ist |
| `--tol 28` | Farbtoleranz beim Freistellen. Bei Verlaufshintergrund hochdrehen (40–60) |
| `--cutoff 128` | Alpha-Schwelle beim Haerten. Hoeher = knappere Silhouette |
| `--trim` | gemeinsame Bounding-Box beschneiden. **Standard aus**, damit alle Animationen einer Figur deckungsgleich bleiben |
| `--in-frames N` | Eingabe ist ein fertiges Sheet mit N Frames |
| `--max-frames N` | nur die ersten N Frames nehmen |
| `--preview` | schreibt zusaetzlich `<out>.preview.png` in 6x mit Schachbrett — zur Sichtkontrolle |

### Worauf du achten musst

* **`frames`, `w` und `h` muessen exakt zum Sheet passen**, sonst ruckelt es
  oder es werden halbe Frames gezeigt. Das Script gibt die richtigen Werte
  aus — uebernimm sie, statt zu schaetzen.
* Das Script meldet die **Frame-Dauern aus dem GIF** und die daraus
  errechneten fps. Ungleichmaessige Dauern werden markiert; die Engine
  spielt mit konstanter fps ab, such dir also den passenden Mittelwert.
* GIF-Exporter **werfen identische Folgeframes raus**. Wenn du 8 Frames
  gezeichnet hast und das Script 7 meldet, waren zwei gleich. Kein Fehler,
  aber `frames` muss dann eben 7 sein.
* `--trim` nur benutzen, wenn eine Animation allein steht (Effekte, Props).
  Fuer Bruno und die Gegner **nicht** trimmen, sonst wandert die Figur
  zwischen den Animationen.
* Halbtransparente Pixel werden am Ende gezaehlt. Steht dort nicht `0`,
  ist die Alphakante nicht sauber — `--cutoff` anpassen.

### Ordner

`assets/bruno/`, `assets/spider/`, `assets/croc/`, `assets/props/`,
`assets/fx/`, `assets/bg/` — die Zuordnung steht in der Tabelle oben.
