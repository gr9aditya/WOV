# Brunos Code-Abenteuer — Übergabe an Claude Code

## Was das ist
Ein 2D Pixel Adventure für den BärnHäckt Hackathon (Challenge:
Swiss Post E-Voting als Spiel erklären). Läuft komplett im Browser,
kein Build, keine Engine. Bruno der Bär durchläuft die echten
E-Voting Sicherheitsschritte, verpackt als Story: Codeblatt =
Stimmrechtsausweis, Schiffsnummer prüfen = Verifikation, Muster =
Initialisierungscode, Statuswert = Choice Return Codes,
Bestätigungscode = Confirmation Code, Stern = Finalisierungscode.

## Stack
Reines HTML + CSS + Canvas + JavaScript. Keine Frameworks, keine
Dependencies. `index.html` lädt `style.css` und `game.js`.

## Dateien (seit v6 in Module aufgeteilt — Ladereihenfolge = index.html)
- `index.html`   — Shell (Topbar, Touch-Leiste, Titel, Live-Region)
- `style.css`    — UI (Panels, Buttons, Codeblatt, Menü, Label-Layer, Touch)
- `core.js`      — Canvas (RES=2), CONFIG, Prefs, Palette, Sfx, Music, Shake, Partikel, Vignetten
- `i18n.js`      — Sprachtabelle DE/FR/IT, `tr(key, params)`, `setLanguage()`
- `labels.js`    — DOM-Text-Layer in Bildschirmauflösung (`Labels.set`)
- `pixart.js`    — handgezeichnete Pixel-Sprites (`PIX`, `drawPix`, `pixIcon`) + prozedurales Tor
- `engine.js`    — Asset-Manifest/-Manager, Anim, drawSprite, Spielzustand, Sequenzen, Eingabe
- `draw.js`      — Zeichenhelfer, `staticLayer`, Bruno, Schwert (`HAND`), Sequenz-Platzhalter
- `scenes.js`    — Szenen-Kulissen, Gegner/Leichen, Sterne-Finale, Endszene
- `story.js`     — Codeblatt (pro Runde gewürfelt), Szenen, Dialoge, Menü, Lernkarten, Checkpoints, `update()`
- `main.js`      — Frame-Loop, `fitCanvas`, Boot, Touch-Steuerung
- `assets/`      — Sprite Sheets (siehe assets/README.md)
- `tools/gif2sheet.py` — GIF -> Sheet

## Architektur (ehemals game.js, seit v6 in Module aufgeteilt — Reihenfolge wie gehabt)
1. **ASSET_MANIFEST** — jede Animation deklariert (src, frames, fps, w, h, loop)
2. **Assets** — lädt die Sheets, fällt bei fehlender Datei auf Platzhalter zurück
3. **Anim** — frame-basierter Abspieler (loop oder einmalig)
4. **drawSprite / Platzhalter** — echtes Sheet wenn geladen, sonst code-gezeichnet
5. **playSequence()** — Einmal-Animationen die das Spiel pausieren
   (Angriff, Tod, Tor öffnen, Stern zerbrechen). Nächster Schritt
   startet erst wenn die Sequenz durch ist.
6. **Story Scenes** — der ganze Bruno Flow als State Machine

Wichtig: das Spiel LÄUFT JETZT SCHON mit Platzhaltern (bunte
Rechtecke, aber korrekt animiert und getimt). So sieht man Ablauf
und Timing, bevor ein einziges echtes Asset da ist.

## Was schon fertig ist
- Kompletter Story Ablauf aus dem Skript (11 Szenen), alle richtigen
  und falschen Pfade, alle Fehlschlag-Konsequenzen (seit Pass 3:
  Checkpoint statt Neustart, siehe unten)
- Codeblatt Modal mit Vorder-/Rückseite und Flip, jederzeit oben
  rechts abrufbar sobald man es hat
- Bewegung (A/D bzw. Pfeiltasten), Hotspot System mit Kontext Button
- Animations- und Sequenz-System inklusive Platzhalter für: Angriff,
  Schwerthieb, Gegner Treffer/besiegt, Boot zerbricht, Wasserspritzer,
  Tor öffnen/ablehnen, Stern einsammeln/zerbrechen, Bruno Tod

## Neu dazugekommen (Stand: Claude-Durchgang)

* **`tools/gif2sheet.py`** — GIF (oder PNG-Folge, oder ein fertiges Sheet)
  wird zu einem horizontalen Sprite Sheet: Frames raus, Hintergrund weg,
  Rückrechnung auf die native Pixelauflösung, harte Alphakante, und am
  Ende die fertige ASSET_MANIFEST-Zeile auf der Konsole. Details und alle
  Optionen in `assets/README.md`. Braucht nur Pillow, das Spiel selbst
  bleibt dependency-frei.
* **Screenshake** — `addShake(stärke_px, dauer_s)`, angewendet in `frame()`.
  Sequenz-Schritte lösen ihn über `{ key:'…', shake:3 }` aus. Liegt bei
  Treffern, zerbrechendem Boot, abgelehntem Tor und zerbrechendem Stern an.
* **Soundeffekte** — `Sfx` ganz oben in `game.js`, komplett über die Web
  Audio API synthetisiert (8-bit Chiptune), keine Dateien. Sequenz-Schritte
  lösen sie über `{ key:'…', sfx:'hit' }` aus. Vorhanden: `blip attack
  slash hit defeat death splash crash error win gate star shatter`.
  Neuen Sound = Methode dazuschreiben + in `SFX_MAP` eintragen.
  Ton-an/aus-Knopf oben links, AudioContext wird bei der ersten Geste
  freigeschaltet (Autoplay-Policy der Browser).

Story-Logik, Szenenreihenfolge und Codeblatt-Werte sind dabei unverändert
geblieben — die Sequenz-Schritte haben nur `sfx`/`shake` als zusätzliche
Felder bekommen.

### Zweiter Durchgang (Polish-Pass)

* **Titelbildschirm** mit Start-Button (liefert auch die Nutzergeste für
  die Web-Audio-Freigabe), Enter startet direkt.
* **Tastatur-Steuerung:** E/Enter/Space benutzt Hotspots, Enter/Space
  blättert Dialoge (nur bei genau einem Button — nie eine inhaltliche
  Wahl!), Ziffern 1–4 wählen Optionen, Enter bestätigt die Code-Eingabe,
  Eingabefeld bekommt automatisch Fokus.
* **Bugfixes:** Codeblatt während einer Sequenz öffnete → Softlock
  (Sequenz fror ein); Bewegung war framerate-abhängig (144 Hz = 2,4× so
  schnell — jetzt dt-basiert, `CONFIG.walkSpeed`); Doppelklick auf den
  Hotspot-Button startete Sequenzen doppelt; während Brunos Angriff
  verschwand der Gegner bzw. standen zwei Brunos im Bild; das Modal aus
  einem Dialog heraus setzte den Dialogzustand nicht zurück.
* **Game Feel:** Beschleunigen/Abbremsen beim Laufen, Lauf-Bob + Fussstaub
  + leise Schrittgeräusche, Partikel (Treffer, Splitter, Spritzer,
  Tor-Funken, Konfetti im Abspann — gedeckelt über `CONFIG.particleMax`),
  Szenen-Fade, Vignette, Hit-Blitz färbt nur noch den Gegner (Tint-Puffer)
  statt einer weissen Box, Todes-Schritte kippen um, Gegner atmen im Idle.
* **UI:** Panels/Karten sliden ein, Typewriter-Text (Klick deckt auf),
  Hotspot-Marker sind immer sichtbar (gedimmt) und leuchten in Reichweite,
  Button-Hover/Focus-Zustände, animierter Ladehinweis, Favicon.
* **Einstellungen:** Ton- und Screenshake-Schalter oben links, beide
  überleben einen Reload (`localStorage`, mit try/catch abgesichert);
  `prefers-reduced-motion` schaltet Shake und CSS-Animationen ab.
* **Responsiv:** Canvas skaliert ganzzahlig auf die Fenstergrösse
  (Beamer!), `fitCanvas()` in game.js.
* Zentrale Stellschrauben jetzt im `CONFIG`-Block ganz oben.

### Dritter Durchgang (Asset-Pass)

* **Echte Sprites eingebunden:** Spinne (14 Frames), Krokodil (8), Fischer 1
  (8), Fischer 2 (5) und das Schwert (8 Frames Drehung) — alle über
  `tools/gif2sheet.py` aus den GIFs gebaut, die Quell-GIFs liegen neben den
  Sheets in `assets/`. Manifest-Zeilen sind 1:1 die Script-Ausgabe.
* **`loopFrame(key)`** (neben `Anim`): Frame eines Endlos-Loops direkt aus
  der Spielzeit — Kulissenfiguren brauchen so keinen eigenen Anim-Zustand
  und laufen nach einem Szenenwechsel automatisch weiter.
* **Asset-Loader** lädt jede Datei nur noch einmal, auch wenn mehrere Keys
  darauf zeigen (spider_idle/hit/defeated teilen sich ein Sheet).
* **Fixes:** Krokodil schaute von Bruno weg (Sheet war gespiegelt) — jetzt
  `facing:1` im Idle und in den Kampf-Schritten. `drawHeldSword` zeichnete
  das ganze Bild statt eines Frames (wäre mit dem 8-Frame-Sheet ein
  Schwert-Streifen geworden) — zeichnet jetzt Frame 0, vertikal gespiegelt,
  weil das Sheet die Klinge nach unten zeigt; Drehpunkt auf dem Griff.
  Am Boden steckt das Schwert mit der Spitze in der Erde und dreht sich.
* `spider_hit/defeated` und `croc_hit/defeated` nutzen das Idle-Sheet mit
  anderem Tempo (24 bzw. 4 fps); Zucken/Umkippen kommen aus den
  `fx`-Transformationen. Eigene hit/defeated-GIFs: durch `gif2sheet.py`
  jagen, `src`/`frames` ersetzen — fertig.

### Vierter Durchgang (Overhaul Pass 3)

* **Musik** — `Music` neben `Sfx`: Step-Sequencer über die Web Audio API,
  vier Spuren in `MUSIC_TRACKS` (`calm`, `tense`, `battle`, `stars`),
  Zuordnung in `SCENE_MUSIC`. Eigener Gain-Bus (`CONFIG.musicVolume`),
  Crossfade `CONFIG.musicFade`, Lookahead ~1 Takt. Startet erst mit dem
  Start-Knopf, pausiert bei `visibilitychange`. Dritter Schalter oben
  links (`#musicBtn`), in `Prefs.data.music` persistiert.
* **Tastatur** — `E` blättert Dialoge (nur bei genau einem Button) und
  schliesst das Codeblatt; `G` öffnet/schliesst das Codeblatt
  (`toggleCodeblatt()`, gleiche Sperren wie der Knopf). Jede Taste
  überspringt den Level-Wipe.
* **Bruno steht und steht auf dem Boden** — Idle ist Frame 0 des Sheets
  (`frames:1, start:0`), Walk nimmt Frame 2–7 (`start:2`). Der Asset-Loader
  scannt leere Zeilen unter den Füssen (`spec.padBottom`), `drawSprite`
  zieht sie ab; manuell überschreibbar im Manifest.
* **Schwert** — Aufheben ist eine Sequenz (`swordPickup()`: beugen,
  Schwert steigt leuchtend auf + `Sfx.chime`, hochhalten); `hasSword`
  erst danach. `HAND` definiert den Pfoten-Anker pro Animation/Frame,
  `drawHeldSword` zeichnet das Schwert in zwei Ebenen (`back`/`front`):
  getragen liegt es über der Schulter hinter Bruno, beim Hieb vorn.
* **Level-Wipe** — `goToScene()` startet `transition` (schwarz von rechts,
  Schild `LEVEL n — NAME` aus `LEVELS`, nach links raus). Szene wechselt
  unter dem schwarzen Bild (`applyScene`), `onEnter` feuert erst danach
  (`finishTransition`). Rein zeitgesteuert in `frame()`, FX aus = harter
  Schnitt. `ui.mode === 'transition'` sperrt Eingaben und das Codeblatt.
* **Durchs Tor** — `doorWalk()`: Bruno läuft zur Tormitte, wird kleiner
  und blasser (`fx:'enter'`, Schritte mit `fromX/toX`), dann der Wipe.
* **Text 2×** in `style.css`; Schalter oben links liegen jetzt in
  `#topbar`. Canvas-Text (Level-Schild, Bootsnummern, MISSION ERFÜLLT)
  über `crispText()` pixelscharf.
* **Gegner bleibt liegen** — `state.enemyState = 'alive'|'dead'|'verified'`
  (ersetzt `state.defeated`). `drawCorpse()` zeigt den letzten
  Defeated-Frame auf dem Rücken, entsättigt, ohne Bob — bis der
  Statuswert richtig bestätigt ist. Krokodil schaut zu Bruno.
* **Checkpoints** — `recordCheckpoint()` beim Betreten jeder Szene,
  `respawnAtCheckpoint()` statt `resetGame()` auf allen Fehlerpfaden
  (Label `Nochmal versuchen`). `showDialogue` bekommt `failure:true`
  statt des Label-Vergleichs; `failFlash()` = roter Rand-Blitz
  (`damageVignette`, vorgerendert) + `error` + Shake, hängt am FX-Schalter.
  `resetGame()` bleibt für „Noch einmal spielen".
* **Finale** — Sterne pulsieren, Ringe drehen, Lichtkegel, Raum hellt
  sich auf. Richtiger Stern: `starFinale()` (Zeitlupe über `timeScale`,
  Flare, Sturzflug mit Schweif, Schockwelle, Blitz, `Sfx.fanfare`).
  Endszene: Sonnenaufgang (`sceneTime`), strahlender Stern, Titel-Slam,
  mehr Konfetti. Alles unter `CONFIG.particleMax`, Blitz/Zeitlupe/Shake
  nur mit FX.
* **Chalet** — Szene `cave` heisst jetzt `home` (`drawHomeScene`,
  `chalet()`, `alpsBG()`); Briefkasten und Hotspot x=200 unverändert.

### Fünfter Durchgang (MASTERPROMPT, v6)

* **Auflösung** — Bild wird in 512×288 gerendert (`RES = 2` in core.js,
  `ctx.setTransform` pro Frame), alle Zeichenroutinen bleiben in 256×144.
  Sprites runden weiter aufs 256er-Raster; Kreise/Rotationen/Linien werden
  feiner. `fitCanvas` skaliert auf ganze Bildschirm-Pixel pro Render-Pixel
  und setzt `--gs` (Bildschirm-px pro Spiel-px) für den Label-Layer.
* **Performance** — statische Kulissenteile laufen einmal durch
  `staticLayer(key, fn)` in einen Offscreen-Canvas (draw.js); nur Wasser,
  Wolken, Rauch, Glühen sind live. `ctx` ist deshalb `let`.
* **Text** — kein Canvas-Text mehr: Level-Schild, Bootsnummern, Wegweiser,
  MISSION ERFÜLLT laufen über `Labels` (labels.js, DOM über der Canvas,
  positioniert in Spielkoordinaten, Wipe-Clip und Shake inklusive).
* **Bruno** — Sprung (Leertaste/W/↑, `CONFIG.jumpVel/gravity`), falsche
  Bootswahl = einsteigen → ablegen → Bruch → untergehen im Bild
  (`fx:'drown'`), richtige Wahl = Fahrt aus dem Bild (`boat_sail`),
  Bosse aus 72 px Reichweite angreifbar (Hotspot `range`), Bruno läuft hin.
* **Schwert** — halbe Grösse (`assets/props/sword_small.png`, 6×14), in der
  vorderen Pfote nach oben/vorn, Altar (`drawAltar`), neuer Satz im Dialog.
* **Pixel-Art** (pixart.js) — Briefkasten (neben dem Haus, Hotspot x=122),
  Boote, Wrack, Schriftrolle (Codeblatt-Icon), Wegweiser, Totenkopf/Knochen,
  Laternen, Symbole, Stern. Tor prozedural (`gateDraw`): Flügel drehen über
  `openK` auf und bleiben offen (`state.gateOpen`) — Animation nicht mehr
  abgeschnitten. Himmel in Farbbändern mit Dithering.
* **Level-Regeln** — Muster und Sterne als Bilder in den Buttons und auf
  dem Codeblatt; Vergleich über IDs (`PATTERNS`, `STARS[].id`).
  `rollCodeblatt()` würfelt pro Runde Muster, Stern und Statuswerte.
  Nach dem Kampf zeigt das Messgerät zu ~50 % den „noch wach"-Wert:
  Knöpfe **Stimmt / Falsch** — „Falsch" auf einen falschen Wert meldet ihn,
  das Gerät misst neu. Platzhalter `XXX-000`. Sterne-Hotspot bei x=40.
  Richtiger Stern: Bruno fliegt mit dem Stern aus dem Bild (`fx:'flyout'`).
* **UI** — Esc-Menü (`openMenu`, `ui.mode 'menu'`: Weiter, Codeblatt,
  Neustart, Spiel verlassen → Titel, Sprache, Schalter), Lernkarten-Schalter,
  Sprachknöpfe DE/FR/IT (Titel, Topbar-Menü), Touch-Leiste bei `pointer:
  coarse` (`#touchbar`), Fokusfalle + Fokus-Rückgabe, `aria-live`-Region
  (`announce()`), Canvas `aria-label` pro Level.
* **i18n** — alle Texte in `i18n.js`; `showDialogue/showChoice/showInput`
  nehmen Schlüssel und rendern bei Sprachwechsel neu (`ui.rerender`).
  Hotspot-Labels sind Funktionen (`L('hs.…')`).
* **Audio** — Spuren `title` und `end` dazu, Leads auf Dreieck, leiser;
  neue Sfx `jump land sail drown`. Titelmusik läuft erst nach der ersten
  Geste (Autoplay-Policy) — also ab dem ersten „Spiel verlassen".
* **Lernkarten** — `learnCard(step, ok, next)` nach jedem Erfolg/Fehlschlag
  (Schritte ship/pattern/status/confirm/star), Texte `learn.*`, abschaltbar
  (`Prefs.data.learn`). Endpanel mit Zuordnungstabelle (`map.*`) und
  aufklappbarem „Warum ist das sicher?".

### Sechster Durchgang (Stube + Hut)

* Neue allererste Szene `inside` (`drawInsideScene`): Brunos Stube mit Fenster
  zum Wald, Haustür rechts (gleiches Design wie aussen), Hutaken links.
  Hotspots: Haken „Hut aufsetzen" (nur solange `!state.hasHat`, Hotspot-Feld
  `when`), Tür „Haus verlassen" (ohne Hut: Dialog, Szene bleibt).
* `state.hasHat` — im Checkpoint gespeichert, `resetGame`/`quitToTitle`
  setzen zurück; Neustart beginnt wieder ohne Hut in der Stube.
* `assets/props/hat.png` (16×9, per Pillow gezeichnet, Manifest-Key `hat`).
  `drawHat(cx, bottomY, facing, animKey, frame)` in draw.js — Overlay auf
  dem Kopf, wird direkt nach dem Sprite gezeichnet (drawBruno, drawSequence,
  Boots-Platzhalter) und damit innerhalb derselben Transformationen:
  rotiert/blendet bei death/defeat/drown/flyout mit. `HAT_DY` gleicht den
  Kopfversatz der Walk-Frames aus.
* Hut-Offsets pro Animationsframe (`HAT_OFF` in draw.js), per Script aus dem
  Sheet gemessen: Idle (0,0); Walk/Attack dx +1 für alle Frames, dy +1 bei den
  Frames 2/3/7. Hut ist schwarz (dunkelgrau, Schattenseite, Aufhellung an der
  Krone, fast schwarze Kontur). Die Stube ist ausgebaut (Maserung,
  perspektivische Dielen, Wandleiste, Garderobe mit drei Haken, Bett,
  Tisch+Stuhl mit Geschirr, Regal, Truhe, Teppich, Lichtkegel vom Fenster,
  flackernde Öllampe) — der Haken-Hotspot liegt jetzt bei x=34 (mittlerer
  Haken der Garderobe).
* Codeblatt-Vorderseite: Eintrag „Privater Browser-Modus" (Hut = privater
  Modus des Browsers vor dem Öffnen des Wahlportals). Texte DE/FR/IT.

### Siebter Durchgang (Fussspuren + Besenflug)

* Jeder Schritt am Boden setzt eine schlammige Pfotenspur (`addFootprint`,
  `state.footprints[szene]`, Deckel `CONFIG.footprintMax`). Gezeichnet von
  `drawFootprints()` am Anfang von `drawBruno()` — also in jeder Szene unter
  Bruno, auch während Sequenzen. Spuren bleiben über Szenenwechsel und
  Checkpoints bestehen; `resetGame`/`quitToTitle` löschen sie.
* Ende: nach dem Titel-Slam holt Bruno den Besen, der am Baum lehnt
  (`state.broomTaken`, Sprite `PIX.broom`), hebt ab und fliegt rückwärts
  durch alle Szenen (`cleanup`-Zustandsmaschine in story.js: takeoff → fly →
  land; `CONFIG.cleanupSceneTime` pro Szene). `sweepFootprints()` wischt
  Spuren in seiner Nähe weg (Staub + `Sfx.sweep`). Danach landet er in der
  Endszene, erst dann kommt das Abschluss-Panel. Jede Taste überspringt den
  Flug (`finishCleanup`: alle Spuren weg, sofort landen).
  `drawFlyingBruno()` (draw.js) zeichnet ihn auf dem Besen mit Hut und Schwert.

### Neunter Durchgang (Spuren + Fegen)

* Spuren sind jetzt kurze dunkelgraue Striche (2x1 px, optional ein
  Zehenpunkt), nur jeder zweite Schritt setzt eine, Deckel 80 pro Szene.
* Kein Besenflug mehr: `drawSweepingBruno(x, facing)` — Bruno gleitet mit
  den Fuessen am Boden (Phasen `exit` -> `sweep` -> `return`, y immer
  groundY), leicht geneigt, Besen schraeg nach vorn-unten, Borsten am Boden
  (`broomTip`), Staub an den Borsten; `sweepFootprints()` wischt alles in
  Borsten-Naehe weg. Am Ende gleitet er abbremsend bis x=128 in die Endszene.

### Achter Durchgang (Boote)

* `assets/props/boat.png` (56x26, Seitenansicht, erzeugt mit `tools/make_boat.py`
  nach boat_reference.png: Planken mit Fugen und Maserung, Verlauf hell ->
  dunkel, Kontur, Innenraum mit zwei Baenken, Ruder, Tau, Anker). Manifest-Key
  `boat`; naher Bordrand = Sprite-Zeile 8 liegt auf Stegniveau.
* `drawBoatHull(x, y, phase, bobOn)` (scenes.js) zeichnet das Boot mit sanftem
  Auf/Ab und minimaler Neigung um die Rumpfmitte; `BOATS[].phase` versetzt die
  beiden Boote. `drawBoatSign(x, num)` = Holzschild am Pfosten auf dem Steg
  (Rahmen, Maserung, Nummer als DOM-Label). `drawBoatWreck(x, y, p)` zerlegt
  das Sprite in drei Teile (Heck/Mitte/Bug), die kippen, auseinanderdriften
  und unter die Wasserlinie sinken (Clip).
* Sequenzen abgestimmt: Bruno sitzt in der Fahrt im Boot (Beine hinter der
  Bordwand), Fahrt bis x = W+60 in 2.6 s; falsches Boot faehrt 26 px, bricht
  (0.9 s), Bruno geht daneben unter.

### Zehnter Durchgang (echte Szenenhintergründe)

* `assets/bg/` enthält fünf 256x144-Bilder (alpen, fork, spider, croc, stars),
  Bodenlinie exakt auf `groundY` (Ausrichtung mit `tools/prepare_bg.py`).
  Im Manifest hängen `bg_home/river/sword/gate/confirmgate/end` an alpen.png,
  `bg_fork/spider/croc/stars` an ihrem Bild; der Loader lädt jede Datei nur
  einmal. `bgOrElse()` blittet 1:1 (Spielkoordinaten), ohne Bild greift der
  code-gezeichnete Platzhalter.
* Jede Szenenfunktion hat jetzt drei Ebenen: Kulisse (Foto ODER Platzhalter,
  nur Landschaft) -> Boden-Overlay (Fluss: Wasser ab groundY + Steg auf
  groundY; Tore: `stoneFloor()` mit Steinplättchen-Blend in die Graslinie;
  Ende: Abendlicht-Verlauf + Sonne) -> Requisiten, die IMMER gezeichnet
  werden (Chalet/Briefkasten, Schilder/Boote/Fischer, Altar/Schwert, Tor,
  Wegweiser, Gegner/Leichen, Sterne, Besen/Stern, Marker, Bruno).
* Doppelte Kulisse entfernt: bei geladenem Foto gibt es keine code-gezeichneten
  Berge, Ufer, Höhle, Palmen, Stalaktiten, Säulen, Sternenhimmel mehr.
* `bg_inside` bleibt ohne Bild (die Stube ist code-gezeichnet).

### Elfter Durchgang (eigene Musik)

* Die synthetisierte Musik (Step-Sequencer, Oszillatoren, Notenmuster) ist
  komplett raus. `Music` in core.js spielt jetzt Audiodateien aus
  `assets/audio/` über normale `<audio>`-Elemente: `SCENE_MUSIC` (Szene ->
  Dateipfad) ist die einzige Stelle, die man zum Umbelegen anfassen muss.
  Gleicher Track in der Folgeszene = läuft weiter; anderer Track = Crossfade
  (`CONFIG.musicFade`). Loop, Start erst mit dem Start-Knopf, Grundlautstärke
  `CONFIG.musicVolume` = 0.3, Mute über den Musik-Knopf (persistiert), Pause
  bei verstecktem Tab, Ladefehler = Konsolenwarnung, Spiel läuft weiter.
  Titelbildschirm hat bewusst keinen Track (nicht in der Zuordnung).
  Soundeffekte (`Sfx`) bleiben synthetisiert.

### Zwölfter Durchgang (Aufräum-Knopf + Lernkarte)

* Endszene: nach dem Titel-Slam erscheint ein Panel mit dem Knopf
  „Spuren wegfegen" (`dlg.end.sweepPrompt` / `btn.sweep`). Erst der Klick
  (oder E) startet Besen holen + Fegen. Das Fegen läuft gemächlicher
  (`CONFIG.cleanupSceneTime` = 2.4 s pro Szene).
* Danach Lernkarte `clean` (nur bei eingeschalteten Lernkarten): Browserverlauf,
  Cache und Cookies nach der Stimmabgabe löschen (`learn.clean.*`, Zeile
  `map.clean` auch in der Zuordnungstabelle des Abschluss-Panels). Dann das
  Abschluss-Panel.

### Dreizehnter Durchgang (Runenturm statt Bestätigungstor)

* `confirmgate` ist neu: Mauerwerk als Sprite `assets/props/tower.png`
  (`tools/make_tower.py`, 160×126, unten-mittig auf groundY+2, ragt oben aus
  dem Bild), alles Leuchtende im Code (scenes.js, Block „Runenturm"):
  `TOWER_RUNES` (9 Bogen-Keilsteine, 4 Wand, 2 Bodenplatten) mit je eigenem
  langsamem Puls, `towerDoor()` (Holztor mit Eisenbändern, öffnet über openK),
  `towerConsole()` (Runentafel links vom Eingang, leuchtet bei Nähe), Nacht-
  Overlay + Sterne, violetter Schein auf Boden und Mauer.
* Sequenzen unverändert: `gate_open` → Runen am Bogen leuchten nacheinander
  auf, dann öffnet das Tor (bleibt offen über `state.gateOpen`);
  `gate_reject` → Runen und Tor rot, flackern, erlöschen. Das Initialisierungs-
  tor (`gate`) bleibt wie es war.

### Vierzehnter Durchgang (Symbole des Stimmrechtsausweises)

* Feste Zuordnung wie auf dem echten Ausweis (`CODE_SYMBOLS` in pixart.js):
  Dreieck = Initialisierungscode (Muster), Raute = Prüfcodes (Statuswert),
  Fünfeck = Bestätigungscode, Stern = Finalisierungscode. Schwarz gefüllte
  einfache Formen, ohne Rahmen, ohne Farbe.
* Technik: ein Canvas-Pfad pro Form (`symbolPath`), gezeichnet über
  `drawSymbol(kind, cx, cy, r, style)` mit den Stilen `flat` (Codeblatt),
  `carved` (in Stein gemeisselt), `burnt` (eingebrannt), `glow` (leuchtend).
  Die Icons für die Oberfläche (`symbolIcon` → Data-URI, `codeSym(step, cls)`)
  kommen aus demselben Pfad — darum kein Pillow-Sprite: dieselbe Form in jeder
  Grösse ohne Treppen, und es gibt keine Datei, die aus dem Tritt kommen kann.
* Codeblatt: jede Zeile = Symbol links, Bezeichnung + Wert rechts
  (`cardEntry`); Schiffsnummer und Hut haben eine leere Symbolspalte.
  Rückseite: alle vier Prüfcode-Zeilen tragen die Raute.
* Welt: Dreieck im Schlussstein über dem ersten Tor (`gateDraw`), Raute auf dem
  Messgerät in Spinnenhöhle/Krokodilsumpf (`drawStatusMeter`, zeigt
  `state.meterValue` — denselben Wert wie der Dialog, vor dem Kampf Striche),
  Fünfeck auf der Runenkonsole und als grosse Steintafel über dem Turmbogen
  (`towerConsole`, `towerPlaque`), Stern: alle Sterne im Sternenraum sind jetzt
  fünfzackig (`drawStarShape` nutzt denselben Pfad) plus Bodenmedaillon vor der
  Sternwahl (`drawStarMedallion`).
* Oberfläche: `showDialogue` / `showChoice` / `showInput` nehmen `opts.icon`
  (pattern/status/confirm/star) und zeigen das Symbol links vom Text; die
  Muster-Auswahlknöpfe tragen das Dreieck vorne; Lernkarten und die
  Zuordnungstabelle am Ende tragen das Symbol des Schritts.
* Logik, Reihenfolge und Codewerte unverändert.

### Fünfzehnter Durchgang (Game-Update „ohne Schloss": Massstab, Fluss, Baumtor, Portal, UI)

* **Figuren-Massstab**: `CONFIG.charScale` = 1.2 (Bruno +20 %). `spriteScale(key)` in
  engine.js leitet Schwert, Hut, Spinne und Krokodil vom selben Wert ab; `drawSprite`
  skaliert und setzt die Fusszeile exakt auf `bottomY` (auf Geraetepixel gerundet,
  `padBottom` herausgerechnet — Idle und alle Walk-Frames enden bei 0 px über dem Boden).
  Hand-Anker (`HAND`), Hut-Offsets, Schwert-Pivot und Hieb-Bogen skalieren mit.
  Bruno ist sichtbar 33 px hoch, die Fischer 32 px.
* **Fell**: `tools/darken_bruno.py` macht nur die neun Fellfarben ~7 % dunkler/wärmer
  (Bauch, Augen, Kontur unverändert); Original liegt als `assets/bruno/idle_original.png`.
* **Fluss**: Boot neu (`tools/make_boat.py`, 72x29 statt 56x26, +29 % breit, +12 % hoch),
  liegt `BOAT_SINK` = 4 px tiefer, Wasserlinie als halbdurchsichtiges Band ab
  `BOAT_WATER`; zweite Ebene `boat_front.png` (nahe Bordwand) liegt bei der Fahrt VOR
  Bruno (Passagier an fester lokaler Position, `drawBoatHull(..., passenger)`). Bob
  ganzzahlig, keine Rotation mehr -> kein Flackern. Wasser: drei Sinus-Wellenbänder pro
  Spalte, zeitbasiert, nahtlos (`drawWaterStrip`). Bootsnummern und die Wegweiser
  „Höhle/Sumpf" sind jetzt Pixelschrift IM Canvas (`PIXFONT`, `drawPixText` in
  pixart.js) — keine DOM-Labels mehr, Bruno läuft vor Schild und Schrift.
* **Baumtor** (Musterwahl): `assets/props/treegate.png` (`tools/make_treegate.py`),
  Durchgang x 108..148. Ranken (`drawVines`), die vier Muster als Schnitzungen in der
  Rinde (`CARVED_COLS`, gewähltes leuchtet grün / rot, `state.pickedPattern`), Dreieck
  auf der Rindentafel, Waldboden mit Moos/Laub/Farn/Pilzen (`forestFloor`), Lichtbahnen
  und grüner Schimmer. Ohne Sprite fällt die Szene auf das alte Steintor zurück.
* **Galaxy-Portal**: im Turmbogen ersetzt `drawPortal` das Holztor (`towerDoor` entfernt):
  28x44 Pixel pro Frame berechnet, 7-Farben-Palette, Spiralarme, Randpartikel; openK =
  heller/schneller, red = rot. Turm, Runen, Konsole, Tafel unverändert.
* **Sterne**: ein fünfzackiges Sprite `PIX.star` (13x12) für Sternenraum, Auswahlpanel
  und Codeblatt, Farbe per Tint (Cache-Key pro Farbe — vorher kollidierten die Tints).
  Keine Ringe im Panel. Finale-Effekte nutzen weiter den Pfad (gleiche Silhouette).
* **Chalet**: `assets/props/chalet.png` (`tools/make_chalet.py`, 112x92) an derselben
  Stelle (unten-mittig 53, groundY); `chalet()` bleibt Fallback.
* **UI**: Schrift Pixelify Sans (OFL, `assets/fonts/`) für alles; Codeblatt-Knopf heisst
  nur noch „Codeblatt" (ohne Icon, gleiche Form wie die Leiste); Fortschritt
  „Etappe n von 8" unter der Leiste (`updateProgress`, `PROGRESS_MAX`); Textbox (`.panel`)
  mit marineblauem Rahmen, Doppelkante, blaugrauem Fussstreifen und Eckpixeln.
* Nicht geändert: Logik, Reihenfolge, Codewerte, Audio, Texte (ausser Knopf/Fortschritt).
  Level 5 (Weggabelung): nur das Wegweiser-Schild (Abschnitt 10.3 des Auftrags).

### Sechzehnter Durchgang (letzte Korrekturen: Boden, Arme, Burgtor, Boss-HUD, Sternensammeln)

* **Boden**: Ursache des „Schwebens" war das Sprite selbst — im Idle stand nur die
  vordere Fussspitze (4 px) in der untersten Zeile 29, der hintere Fuss endete in
  Zeile 28; dazu beginnt die helle Steinkante des Höhlen-Fotos erst 2 px unter
  `groundY`. Fix: `tools/fix_bruno_sprite.py` zieht den hinteren Fuss in Frame 0/1
  bis Zeile 29 (alle 8 Frames enden jetzt in Zeile 29 = gemeinsamer Fussanker,
  `padBottom` 2), `drawSprite` setzt diese Zeile auf Gerätepixel genau auf
  `groundY`; in der Höhle wird die Fotokante auf die Bodenlinie gezogen
  (`spider_lip`). Debug-Ansicht mit `?debug=1` (Bodenlinie, Sprite-Box, gemessene
  Fusskante, Pivot) — in Produktion nie sichtbar.
* **Arme**: Frame 2 (beide Arme auf Schulterhöhe) und 3/7 (seitlich abgespreizt)
  bekommen die hängenden Arme aus Frame 4/6, Frame 3/7 mit 1 px Gegenschwung.
  Beine, Körper, Frame-Anzahl unverändert (gleiches Script).
* **Burgtor im Turm** (`drawCastleGate`, `castleStone`, `castleDoors`): Pfeiler aus
  grossen blaugrauen Quadern, Keilsteinbogen mit Schlussstein, Fugen, Risse,
  Schwelle; doppelflügeliges Holztor mit Eisenbändern, Scharnieren, Nieten und
  Mittelspalt — linker Flügel nach links, rechter nach rechts, ganzzahlige Breiten.
  Dahinter der dunkle Durchgang mit dem Galaxy-Portal. Bogenrunen liegen in den
  Keilsteinen. Logik unverändert. (Das Baumtor in Level 4 bleibt wie beauftragt.)
* **Boss-HUD** (`drawBossHud`, Hook `scene.hud` in main.js, ohne Shake): das
  Messgerät als Weltobjekt (mit DOM-Label, das über Bruno lag) ist entfernt; die
  Anzeige sitzt fest oben rechts (x 150..250, y 26..42): Name + Balken solange
  der Boss lebt, danach Raute + Statuswert, nach der Prüfung ausgeblendet.
* **Sternensammeln** (`starFinale`): Laufen zum Sammelpunkt (8 px vor dem Stern,
  normale Geschwindigkeit `CONFIG.walkSpeed`), kurzer Halt, Sprung (fx `jump`,
  0.6 s, Scheitel so, dass der Oberkörper den Stern erreicht), Einsammeln bei 50 %
  des Sprungs (Partikel + Pixel-Lichtring in der Sternfarbe, `state.starCollected`),
  Landung, dann erst Dialog/Lernkarte/Endszene. `flyout`, `star_flare/swoop/burst`
  und `drawStarFinale` sind entfernt; der eingesammelte Stern schwebt über Bruno.

### Siebzehnter Durchgang (Schweben endgültig: Foto-Bodenkanten)

* Diagnose per Script: alle 8 Bruno-Frames haben genau 2 leere Zeilen unter den
  Füssen (Bounding-Box-Unterkante 30 von 32) — `padBottom` 2 gleicht das aus, die
  unterste Pixelzeile liegt in jeder Szene auf Zeile 111, direkt über `groundY` 112.
* Eigentliche Ursache der sichtbaren Lücke: die Foto-Hintergründe haben ihre
  sichtbare Bodenkante nicht auf 112 — alpen.png/fork.png 113, spider.png 114
  (dazwischen eine dunkle Konturzeile). `BG_FLOOR_ROW` in draw.js versetzt jedes
  Foto um die Differenz nach oben (`bgOrElse`), untere Zeilen werden aufgefüllt.
  Bodenhöhe, Sprite und Figurenpositionen unverändert; Hut/Schwert hängen an
  Brunos Anker und wandern mit.
* Geprüft mit herangezoomten Streifen in allen 11 Szenen plus Angriff, Hieb,
  Bootsfahrt, Ertrinken, Schwert heben.

### Achtzehnter Durchgang (Feinschliff: Schilder, Hinweis, Baumtor, Code, Aufräumen, Stern, Musik, Fortschritt, Altar-Schwert, Turm)

* Bootsschilder: Pfosten reichen bis zur Stegkante (`drawBoatSign`).
* Steuerungshinweis (`idleHint`, `updateIdleHint`, `#ctrlHint`): nach 10 s ohne Eingabe
  bei frei steuerbarem Bruno, unten links, 55 % Deckkraft, Tasten aus `KEYBINDS`
  (engine.js — einzige Quelle für Steuerung und Hinweis); weg bei Eingabe oder nach 5 s,
  erst nach echter Eingabe + erneuter Pause wieder. `CONFIG.idleHintAfter/Show`.
* Baumtor: `tools/make_treegate.py` zeichnet über einen Skalier-Proxy (+12 %, 233x139),
  gezackter Kronenrand, dunkle Blätterballen; Weltkonstanten (`PASSAGE`, `CARVED_COLS`,
  Tafel) aus der Script-Ausgabe. Waldboden: halb so viele Moos-/Laubpixel.
* Bestätigungscode: `genConfirmCode()` in `rollCodeblatt()` (Format XXX-000, ohne I/J/O/Q),
  zentral in `CODEBLATT.confirmCode`; Codeblatt und Turm lesen denselben Wert.
  Kein persistenter Spielstand vorhanden → keine Migration nötig.
* Aufräumen: `drawSweepingBruno` zeichnet kein Schwert mehr (nur Besen), Bruno verlässt
  die Endszene nach links (`cleanup.phase 'exit'`), fegt leftwards, kommt am Ende von
  links zurück. `state.hasSword` bleibt erhalten.
* Stern: `STAR_Y` 64 (48 px über dem Boden), Sprunghöhe folgt automatisch.
* Musik: `CONFIG.musicVolume` 0.21 (vorher 0.3). Sfx unverändert.
* Fortschritt: unten mittig (`#progress`), weicht nach oben aus, wenn der Hotspot-Knopf
  steht (`.lift`), unsichtbar hinter Panels/Modal/Menü (`.dim`; `syncProgressPos`).
* Altar-Schwert: Manifest-Key `sword_altar` (gleiches Sheet, `scale: 1.44`), auch in der
  Aufnahme-Sequenz (`lift` + `raise` über `step.swordScale`); getragenes Schwert bleibt 1.2.
* Turm: kein Holz mehr — `tools/make_tower.py` zeichnet Eisenbeschläge, Runenstein-Lage,
  Metallplatten; das Burgtor ist ein Metalltor mit Rune je Flügel (`castleDoors`).

### Neunzehnter Durchgang (visueller Polish — nur Optik)

* `SCENE_LOOK` (draw.js): pro Szene Lichtrichtung, Farbstimmung (`drawMood`), Dunst über
  dem Hintergrund (`drawHaze`, in `bgOrElse`), Vordergrund-Silhouetten + dunklerer
  Boden (`drawForeground`: grass/reeds/rocks/leaves, statisch gerastert), Wolkenschleier
  (`drawCloudWisps`). `drawSprite` dunkelt die lichtabgewandte Sprite-Hälfte (16 %) ab
  (`noShade` im Manifest für Hut/Schwert/Bootsfront).
* Bodenschatten `groundShadow(x, w, alpha, lift)` unter Bruno (auch im Sprung, kleiner/
  schwächer), Fischern, Spinne, Krokodil, Leichen, Sequenz-Figuren, Chalet, Briefkasten,
  Altar, Schildern, Turm, Baumtor.
* Bewegung: Blätter am Baumtor, Sporen + flackerndes Glimmen in der Höhle, Glühwürmchen
  im Sumpf, Lichtmotten am Turm (alle `spawnParticle`, dezent).
* Szenenwechsel ohne FX: Ab-/Aufblenden (`transition.quick` → 0.22 s Fade statt hartem
  Schnitt; `applyScene` erst bei t ≥ wipe). Mit FX bleibt der Wipe.
* Feedback: `successFlash()` (core.js, `flash`, `CONFIG.flashTime`) bei Tor, Boot, Schwert,
  Statusprüfung, Code und Sternfang; Bruch-Partikel beim falschen Stern und beim Boot.
* UI: eine Rahmensprache (Marine #0e1a30 + Doppelkante #3b5270 + Eckpixel) für Textbox,
  Codeblatt, Pausenmenü, Titelkarte; Knöpfe (Leiste, Codeblatt, .btn, Touch, Hotspot)
  dunkelgrün/gold mit Pixel-Fase. Keine Logik-, Text- oder Codeänderungen.

### Zwanzigster Durchgang (Lernkarten vollständig, grosses Schwert, Stern-Medaillon weg)

* Lernkarten: ein Mechanismus (`learnCard(step, ok, next)`), immer nach dem Ergebnisdialog,
  vor Szenenwechsel/Respawn. Neu: `hat` (Stube, nach `dlg.inside.hat`) und `codeblatt`
  (nach dem ersten Codeblatt + `dlg.codeblatt.intro`), Texte `learn.hat.*`,
  `learn.codeblatt.*`, Tabellenzeile `map.hat` (DE/FR/IT). Bestehende Texte unverändert.
  Die Karte erscheint nur bei „Lernkarten AN" (Prefs.learn, persistiert).
* Schwert: neues Sheet `assets/props/sword_big.png` (`tools/make_sword.py`, 8 Frames 10x30,
  Klinge 21 px, Gesamtlänge ~Brunos Höhe), Manifest `sword`/`sword_altar` mit `scale:1`
  und `pivot:4` (Griffmitte). `drawHeldSword` nutzt `spec.scale`/`spec.pivot`, Hieb-Bogen
  = 0.75·h. Am Altar steckt das Schwert mit der Spitze im Stein (Unterkante groundY-2,
  unterhalb der Deckplatte abgeschnitten); die Aufnahme startet dort und schneidet
  ebenfalls ab, bis die Spitze frei ist. Das Altar-Schwert bleibt sichtbar, bis der
  Schritt `sword_altar` es selbst zeichnet.
* Sternenkammer: das Bodenmedaillon mit dem Stern (`drawStarMedallion`) ist entfernt.

## Was ihr / Claude Code noch machen müsst
1. **Echte 32px Sprites einbinden.** Sheets in `assets/` legen, im
   ASSET_MANIFEST den `src` und `frames` setzen. Liste in
   `assets/README.md`. Platzhalter verschwinden dann automatisch.
2. **Animationen verfeinern** falls eure Frames andere Grössen/Timings
   haben — einfach w/h/fps im Manifest anpassen.
3. ~~Optional Sound~~ — erledigt, siehe oben.
4. **Optional Feinschliff**: Partikel, ~~Screenshake~~, Übergänge
   zwischen Szenen.
5. **Offen:** `bruno_walk`, `bruno_attack`, `bruno_hit`, `bruno_death`
   und `bruno_cheer` zeigen als Notlösung noch alle das Idle-Sheet.
   Sobald echte GIFs in `assets/bruno/` liegen, durch `gif2sheet.py`
   jagen und die ausgegebenen Manifest-Zeilen ersetzen. Dasselbe gilt für
   `spider_hit/defeated` und `croc_hit/defeated` (laufen auf dem Idle-Loop).
   Noch ohne Art: Boot (`boat_idle/break`), Sterne, Splash, Slash.

## Aufgaben an Claude Code (Vorschlag zum Reinkopieren)
„Hier ist ein lauffähiges HTML/Canvas Spiel mit Platzhalter Grafik.
Ich habe echte 32px Pixel Sprites in assets/ gelegt. Binde sie über
das ASSET_MANIFEST in game.js ein, passe Frame Grössen und Timing an
meine Assets an, und ergänze wo sinnvoll Screenshake und einfache
Soundeffekte. Ändere die Story Logik nicht."

## Lokal testen
Wegen Bild-Laden am besten über einen lokalen Server statt Doppelklick:
```
cd bruno
python -m http.server 8000
```
Dann im Browser http://localhost:8000 öffnen.
(Ohne echte Assets läuft es auch per Doppelklick auf index.html.)

## Steuerung
A/D oder Pfeiltasten = laufen, Leertaste/W/↑ = springen, E/Enter =
benutzen bzw. Dialog weiter, Ziffern 1–4 = Auswahl, G = Codeblatt auf/zu,
Esc = Menü. Jede Taste überspringt den Level-Wipe. Oben links: Ton, FX,
Musik, Lernkarten, Menü. Auf Touch-Geräten erscheint unten eine Leiste
(◀ ▶ ⤒ E).
