using UnityEngine;
using UnityEngine.InputSystem;

/// A pixel-art, step-by-step retelling of the "Explain Swiss Post E-Voting Through a Game"
/// briefing. Not a game: the viewer presses Next / Back and reads.
///
/// The scene is a fixed side-on view — desk, monitor, printed voting card, and the voter — in the
/// manner of a 16-bit platformer. The camera never moves; instead the character points at whatever
/// the current step is about, and a spinning coin carries each message between the card and the
/// screen.
///
/// The split between languages follows the briefing itself: the monitor shows the German portal a
/// voter actually sees, while the title and the footer explain it in English.
public class PixelWalkthrough : MonoBehaviour
{
    // ---------- layout ----------
    // The scene is designed at 320 x 180 art pixels; at 16:9 one art pixel is a whole number
    // of screen pixels, which is what keeps the art crisp.
    const int ArtHeight = 180;

    const int CardWidth = 80, CardHeight = 96;
    const int MonitorWidth = 128, MonitorHeight = 96;
    const int GlassWidth = 120, GlassHeight = 77;

    static readonly Vector2 CardPos = new Vector2(-4.55f, 1.25f);
    static readonly Vector2 MonitorPos = new Vector2(5.05f, 1.25f);
    static readonly Vector2 GlassOffset = new Vector2(0f, 0.28f);
    static readonly Vector2 VoterPos = new Vector2(-8.50f, -0.70f);
    const float VoterScale = 2.5f;
    const float CoinScale = 2f;

    const int MaxScreenLines = 10;

    // ---------- text colours ----------
    static readonly Color Ink = new Color(0.10f, 0.09f, 0.15f);
    static readonly Color ScreenInk = new Color(0.78f, 0.86f, 0.95f);
    static readonly Color Accent = new Color(1.00f, 0.745f, 0.157f);
    static readonly Color OnPaper = new Color(0.48f, 0.32f, 0.02f);
    static readonly Color Good = new Color(0.35f, 0.78f, 0.47f);
    static readonly Color Bad = new Color(0.90f, 0.36f, 0.34f);
    static readonly Color Dim = new Color(0.55f, 0.58f, 0.68f);
    static readonly Color Backdrop = new Color(0.055f, 0.055f, 0.09f);

    // ---------- what is printed on the sample voting card ----------
    // These values are transcribed from the briefing's sample card and must stay byte-identical.
    const string InitializationCode = "2r6i 3gfn dfgq gy7j q4q6 aqq8";
    const string ConfirmationCode = "4419 7199 7";
    const string FinalizationCode = "4137 6763";
    const string PortalUrl = "https://demo.evoting.ch";
    const string BirthYear = "1980";

    const string FingerprintSha256 =
        "AC 03 03 58 89 E9 19 18 75 9C 60 6B 0D 42 A0 AD 61 E2 73 F3 81 A9 74 15 E4 62 9D 28 54 DA 69 13";

    static readonly string[] RowLabel =
    {
        "Initialisierungscode", "Prüfcodes", "Bestätigungscode", "Finalisierungscode",
    };

    /// The symbols printed beside each code on the card. The card uses a filled pentagon for the
    /// Bestätigungscode, but U+2B1F has no glyph in Unity's default font, so this uses the filled
    /// circle the portal also uses for that step.
    static string Symbol(int row)
    {
        switch (row)
        {
            case 0: return "▲";   // ▲ Initialisierungscode
            case 1: return "◆";   // ◆ Prüfcodes
            case 2: return "●";   // ● Bestätigungscode (card prints a pentagon)
            default: return "★";  // ★ Finalisierungscode
        }
    }

    /// The portal's own sidebar, in the language the voter sees it.
    static readonly string[] PortalSteps =
    {
        "1 Gesetzliche Bestimmungen",
        "2 Stimmabgabe starten",
        "3 Stimme erfassen",
        "4 Stimme kontrollieren",
        "5 Prüfcodes verifizieren",
        "6 Bestätigungscode eingeben",
        "7 Finalisierungscode verifizieren",
    };

    // ---------- the steps ----------
    struct Step
    {
        public string title;
        public string body;
        public string[] screen;
        public int portalStep;
        public int packet;          // 0 none, 1 voter -> system, 2 system -> voter
        public string packetLabel;
        public int highlightRow;    // index into the card's four rows, -1 for none
        public bool highlightCard;
        public bool highlightScreen;
        public int[] cardSections;  // when set, the card turns to its Prüfcodes pages
        public int tone;            // 0 neutral, 1 attention, 2 success, 3 failure
    }

    static Step[] BuildSteps()
    {
        return new[]
        {
            // 1 — cover
            new Step {
                title = "Explain Swiss Post E-Voting Through a Game",
                body = "The Swiss Post Voting System is a two-round return code scheme: before the election every voter " +
                       "receives a printed voting card, and during voting the portal returns codes that the voter checks " +
                       "against the paper.    Use Next and Back, or the arrow keys.",
                screen = new[] { PortalUrl, "", "Das Portal ist noch nicht geöffnet." },
                highlightRow = -1
            },

            // 2 — the two-round scheme, as the briefing's sequence diagram
            new Step {
                title = "Two rounds, in sequence",
                body = "The voter authenticates with the Initialization Code and an Extended Authentication Factor, then " +
                       "selects options. The system returns a Choice Return Code per selection, which the voter verifies " +
                       "against the card. The voter then confirms with the Confirmation Code and receives a Finalization " +
                       "Code. If it matches the card, the voting process is complete.",
                screen = new[] { "Voter                    System", "",
                                 "1  Initialisierungscode + EAF", "2  Auswahl treffen",
                                 "3  Stimme senden          ->", "4  <-  Prüfcodes",
                                 "5  Prüfcodes prüfen", "6  Bestätigungscode      ->",
                                 "7  <-  Finalisierungscode", "8  Finalisierungscode prüfen" },
                highlightRow = -1
            },

            // 3 — what the card carries
            new Step {
                title = "The voting card",
                body = "A voting card contains voter identification, election information, voter portal instructions, " +
                       "support contact details, the portal URL and certificate fingerprint, security information, an " +
                       "Initialization Code, a Choice Return Code for every selectable voting option — candidates, lists, " +
                       "referendum answers, blank and cumulative selections — a Confirmation Code, and a Finalization Code.",
                screen = new[] { PortalUrl, "", "Das Portal ist noch nicht geöffnet." },
                highlightRow = -1, highlightCard = true
            },

            // 4 — reaching the genuine portal
            new Step {
                title = "Access the portal, then check the certificate",
                body = "The voter types the portal address into the browser's address bar directly, or scans the QR code " +
                       "on the card, rather than following a link. The browser's certificate fingerprint must match the " +
                       "SHA-256 fingerprint printed on the card:    " + FingerprintSha256 +
                       "    A mismatch means the connection is not going straight to the portal: stop and contact the canton.",
                screen = new[] { PortalUrl, "", "Fingerabdruck (SHA-256)", "AC 03 03 58 89 E9 19 18 ...",
                                 "... 28 54 DA 69 13", "", "stimmt mit dem", "Stimmrechtsausweis überein" },
                highlightRow = -1, tone = 1
            },

            // 5 — the rest of the recommended checks
            new Step {
                title = "The recommended security checks",
                body = "Swiss Post asks voters to verify the portal certificate, verify the integrity of the HTML and " +
                       "JavaScript delivered to the device, use a browser mode that blocks add-ons, verify the Choice " +
                       "Return Codes and the Finalization Code, and clear the browser cache after voting.",
                screen = new[] { "Sicherheitshinweise", "",
                                 "Zertifikat des Portals prüfen", "Integrität der Software prüfen",
                                 "Browsermodus ohne Add-ons", "(Inkognito oder Privat)",
                                 "Übersetzung deaktivieren", "", "Prüfcodes und Finalisierungs-",
                                 "code verifizieren" },
                highlightRow = -1, tone = 1
            },

            // 6 — portal step 1
            new Step {
                title = "Portal step 1  -  Legal provisions",
                body = "Voting electronically counts exactly as voting by post or at the polling station. The portal shows " +
                       "the provisions of the Swiss Criminal Code (Art. 279–283) that protect the ballot, and the voter " +
                       "confirms both statements before continuing.",
                screen = new[] { "Gesetzliche Bestimmungen", "",
                                 "Teilnahme an der elektronischen", "Stimmabgabe", "",
                                 "[x] Ich gebe meine Stimme", "     elektronisch ab.",
                                 "[x] Ich habe die gesetzlichen", "     Bestimmungen zur Kenntnis",
                                 "     genommen.   (StGB 279-283)" },
                portalStep = 1, highlightRow = -1
            },

            // 7 — portal step 2
            new Step {
                title = "Portal step 2  -  Start voting",
                body = "The voter enters the Initialization Code printed on the card together with their year of birth, " +
                       "the Extended Authentication Factor. Capitalisation of the code does not matter. Only someone " +
                       "holding the physical card can begin.",
                screen = new[] { "Stimmabgabe starten", "",
                                 "Geben Sie Ihren", "Initialisierungscode ein", InitializationCode, "",
                                 "Geburtsjahr", BirthYear, "", "[ Starten -> ]" },
                portalStep = 2, highlightRow = 0
            },

            // 8 — portal step 3
            new Step {
                title = "Portal step 3  -  Enter the vote",
                body = "The voter answers the questions and picks candidates, or leaves entries blank. Nothing has left " +
                       "the device yet and every selection can still be changed.",
                screen = new[] { "Treffen Sie Ihre Auswahl", "",
                                 "Demo Abstimmung", "1. Sonniges Wetter   [x] Ja", "2. Regenwetter       [x] Nein", "",
                                 "Variantenabstimmung", "1a. Volksinitiative  [x] Ja", "1b. Gegenvorschlag   [x] Ja",
                                 "[ Auswahl kontrollieren -> ]" },
                portalStep = 3, highlightRow = -1
            },

            // 9 — portal step 4, including the encrypt-and-send dialog
            new Step {
                title = "Portal step 4  -  Check the vote, then send it",
                body = "The voter reviews the selections, then confirms the dialog. The voting client encrypts the ballot " +
                       "on the voter's own device and transmits it. After that the selections cannot be changed — but the " +
                       "vote is not cast yet, and the voter may still abandon the process and vote on paper instead.",
                screen = new[] { "Kontrollieren Sie Ihre Auswahl", "",
                                 "Möchten Sie Ihre Stimme", "verschlüsseln und übermitteln?", "",
                                 "Nach der Verschlüsselung und", "Übermittlung können Sie diese",
                                 "nicht mehr ändern.", "",
                                 "[ Ja, verschlüsseln und übermitteln ]" },
                portalStep = 4, packet = 1, packetLabel = "verschlüsselte Stimme",
                highlightRow = -1
            },

            // 10 — portal step 5, the codes match
            new Step {
                title = "Portal step 5  -  Verify the Choice Return Codes",
                body = "The system returns one Choice Return Code per selection. The voter finds the same options on the " +
                       "card and compares. All four match, so the system registered exactly what the voter chose. A " +
                       "manipulated computer could change the vote, but it could never guess codes printed on paper.",
                screen = new[] { "Prüfcodes verifizieren", "",
                                 "1. Sonniges Wetter   Ja    1855", "2. Regenwetter       Nein  2938",
                                 "1a. Volksinitiative  Ja    9697", "1b. Gegenvorschlag   Ja    0238", "",
                                 "Stimmen sie mit dem", "Stimmrechtsausweis überein?",
                                 "[ Alle Codes stimmen überein ]" },
                portalStep = 5, packet = 2, packetLabel = "Prüfcodes",
                highlightRow = -1, highlightScreen = true, tone = 1,
                cardSections = new[] { Ballot.DemoAbstimmung, Ballot.Variantenabstimmung }
            },

            // 11 — portal step 5, the codes do not match
            new Step {
                title = "Portal step 5  -  If a code does not match",
                body = "This is the half of the trust model that matters most. If any returned code is absent from the " +
                       "card, the vote on the server is not the vote the voter cast. The voter chooses \"Nicht alle Codes " +
                       "stimmen überein\", aborts the process, and contacts their municipality or canton. The Confirmation " +
                       "Code is never entered, so the ballot never enters the electronic ballot box.",
                screen = new[] { "Prüfcodes verifizieren", "",
                                 "1. Sonniges Wetter   Ja    1855", "2. Regenwetter       Nein  4712  <-", "",
                                 "4712 steht nicht auf dem", "Stimmrechtsausweis.", "",
                                 "[ Nicht alle Codes stimmen überein ]", "Stimmabgabe abbrechen" },
                portalStep = 5, highlightRow = -1, highlightScreen = true, tone = 3,
                cardSections = new[] { Ballot.DemoAbstimmung }
            },

            // 12 — portal step 6
            new Step {
                title = "Portal step 6  -  Enter the Confirmation Code",
                body = "Only once every code matches does the voter type the Confirmation Code. This is the step that " +
                       "actually casts the vote: without it the ballot never enters the electronic ballot box. After it, " +
                       "the vote is definitive and can no longer be replaced by a postal or in-person vote.",
                screen = new[] { "Bestätigungscode eingeben", "",
                                 "Geben Sie Ihren Bestätigungs-", "code ein, um Ihre Stimme",
                                 "elektronisch abzugeben", ConfirmationCode, "",
                                 "Nach der Bestätigung gilt diese", "als definitiv abgegeben.",
                                 "[ Stimme bestätigen ]" },
                portalStep = 6, packet = 1, packetLabel = "Bestätigungscode",
                highlightRow = 2, tone = 1
            },

            // 13 — portal step 7
            new Step {
                title = "Portal step 7  -  Verify the Finalization Code",
                body = "The system answers with the Finalization Code. It matches the card, so the vote is in the " +
                       "electronic ballot box and the process is complete. Had a different code appeared, the voter would " +
                       "contact the municipality.",
                screen = new[] { "Finalisierungscode verifizieren", "",
                                 "Bitte vergleichen Sie den", "Finalisierungscode mit dem-",
                                 "jenigen auf Ihrem Stimm-", "rechtsausweis", "", FinalizationCode, "",
                                 "[ Der Code stimmt überein ]" },
                portalStep = 7, packet = 2, packetLabel = "Finalisierungscode",
                highlightRow = 3, highlightScreen = true, tone = 2
            },

            // 14 — stop and resume
            new Step {
                title = "Stopping and resuming",
                body = "The voter may interrupt the process and resume later, also from a different device. Interrupted " +
                       "before ballot encryption, they may log in again and modify the voting choices. After encryption but " +
                       "before entering the Confirmation Code, the selections are fixed, but they may log in again, view " +
                       "the corresponding Choice Return Codes, and continue from that stage. After entering the " +
                       "Confirmation Code, they may only verify the Finalization Code. It is always possible to report an issue.",
                screen = new[] { "Willkommen zurück", "",
                                 "vor Verschlüsselung:", "  Auswahl änderbar", "",
                                 "nach Verschlüsselung:", "  Prüfcodes erneut sichtbar", "",
                                 "nach Bestätigung:", "  nur Finalisierungscode" },
                highlightRow = -1
            },

            // 15 — after voting
            new Step {
                title = "After voting  -  Clearing the traces",
                body = "So that no conclusions about the vote can be drawn from the device, the voter clears the browsing " +
                       "data: a time range covering the voting session, then both cookies and other website data and cached " +
                       "images and files. A private window stores no history in the first place, so this is only needed " +
                       "after voting in a normal window.",
                screen = new[] { "Browserdaten löschen", "",
                                 "Zeitraum:  Letzte Stunde", "",
                                 "[x] Cookies und andere", "     Websitedaten",
                                 "[x] Bilder und Dateien im Cache", "", "[ Daten löschen ]" },
                highlightRow = -1, tone = 2
            },
        };
    }

    // ---------- scene ----------
    Step[] steps;
    int index;

    Camera view;
    Transform cardObject, glassObject, coinObject, voterObject;
    SpriteRenderer voterRenderer, coinRenderer, cardGlowRenderer;
    Sprite[] voterFrames, coinFrames;
    Texture2D fillTexture;

    float animationTime;

    void Awake()
    {
        steps = BuildSteps();

        fillTexture = new Texture2D(1, 1);
        fillTexture.SetPixel(0, 0, Color.white);
        fillTexture.Apply();

        BuildScene();
        ShowStep(0);
    }

    void BuildScene()
    {
        view = Camera.main;
        if (view == null)
        {
            var holder = new GameObject("Main Camera") { tag = "MainCamera" };
            view = holder.AddComponent<Camera>();
            holder.transform.position = new Vector3(0f, 0f, -10f);
        }

        view.orthographic = true;
        view.clearFlags = CameraClearFlags.SolidColor;
        view.backgroundColor = Backdrop;
        view.orthographicSize = ArtHeight / 2f / PixelArt.PixelsPerUnit;

        BuildBackdrop();

        Place(PixelSprites.Desk(268, 44), new Vector2(0.7f, -2.35f), 2);

        cardGlowRenderer = Place(PixelSprites.Block('Y'),
            CardPos, 3, new Vector2((CardWidth + 6) / PixelArt.PixelsPerUnit,
                                    (CardHeight + 6) / PixelArt.PixelsPerUnit));
        cardGlowRenderer.enabled = false;

        cardObject = Place(PixelSprites.Card(CardWidth, CardHeight), CardPos, 4).transform;
        Place(PixelSprites.Monitor(MonitorWidth, MonitorHeight), MonitorPos, 4);

        glassObject = Place(PixelSprites.Block('N'), MonitorPos + GlassOffset, 5,
            new Vector2(GlassWidth / PixelArt.PixelsPerUnit, GlassHeight / PixelArt.PixelsPerUnit)).transform;

        voterFrames = PixelSprites.Voter();
        voterRenderer = Place(voterFrames[0], VoterPos, 6);
        voterRenderer.transform.localScale = new Vector3(VoterScale, VoterScale, 1f);
        voterObject = voterRenderer.transform;

        coinFrames = PixelSprites.Coin();
        coinRenderer = Place(coinFrames[0], Vector2.zero, 8);
        coinRenderer.transform.localScale = new Vector3(CoinScale, CoinScale, 1f);
        coinObject = coinRenderer.transform;
        coinRenderer.enabled = false;
    }

    void BuildBackdrop()
    {
        var brick = PixelSprites.Brick(16);
        const float tile = 1f;

        for (float x = -10f; x < 10f; x += tile)
        {
            for (float y = -3.5f; y < 5.7f; y += tile)
            {
                Place(brick, new Vector2(x + tile / 2f, y + tile / 2f), 0);
            }
        }

        Place(PixelSprites.Ground(320, 36), new Vector2(0f, -4.5f), 1);
    }

    SpriteRenderer Place(Sprite sprite, Vector2 position, int order, Vector2? size = null)
    {
        var item = new GameObject("piece");
        item.transform.SetParent(transform);
        item.transform.position = position;

        var renderer = item.AddComponent<SpriteRenderer>();
        renderer.sprite = sprite;
        renderer.sortingOrder = order;

        if (size.HasValue)
        {
            renderer.drawMode = SpriteDrawMode.Sliced;
            renderer.size = size.Value;
        }

        return renderer;
    }

    // ---------- navigation ----------
    void Update()
    {
        animationTime += Time.deltaTime;
        ReadInput();
        Animate();
    }

    void ReadInput()
    {
        var keyboard = Keyboard.current;
        if (keyboard == null) return;

        if (keyboard.rightArrowKey.wasPressedThisFrame || keyboard.spaceKey.wasPressedThisFrame ||
            keyboard.enterKey.wasPressedThisFrame || keyboard.downArrowKey.wasPressedThisFrame) Go(1);

        if (keyboard.leftArrowKey.wasPressedThisFrame || keyboard.backspaceKey.wasPressedThisFrame ||
            keyboard.upArrowKey.wasPressedThisFrame) Go(-1);

        if (keyboard.rKey.wasPressedThisFrame) ShowStep(0);
    }

    void Animate()
    {
        var step = steps[index];

        bool pointing = step.highlightRow >= 0 || step.highlightCard || step.highlightScreen;
        voterRenderer.sprite = voterFrames[pointing ? 1 : 0];

        float bob = Mathf.Floor(Mathf.Repeat(animationTime * 2f, 2f)) / PixelArt.PixelsPerUnit;
        voterObject.position = new Vector3(VoterPos.x, VoterPos.y + bob, 0f);

        if (step.packet == 0)
        {
            coinRenderer.enabled = false;
            return;
        }

        coinRenderer.enabled = true;

        float progress = Mathf.Repeat(animationTime * 0.55f, 1f);

        // The coin flies between the facing edges, so it never crosses the card or the screen.
        float cardEdge = CardPos.x + CardWidth / 2f / PixelArt.PixelsPerUnit + 0.45f;
        float monitorEdge = MonitorPos.x - MonitorWidth / 2f / PixelArt.PixelsPerUnit - 0.45f;
        var cardSide = new Vector2(cardEdge, CardPos.y);
        var monitorSide = new Vector2(monitorEdge, MonitorPos.y);

        Vector2 from = step.packet == 1 ? cardSide : monitorSide;
        Vector2 to = step.packet == 1 ? monitorSide : cardSide;

        Vector2 position = Vector2.Lerp(from, to, progress);
        position.y += Mathf.Sin(progress * Mathf.PI) * 1.1f;

        coinObject.position = new Vector3(
            Mathf.Round(position.x * PixelArt.PixelsPerUnit) / PixelArt.PixelsPerUnit,
            Mathf.Round(position.y * PixelArt.PixelsPerUnit) / PixelArt.PixelsPerUnit, 0f);

        coinRenderer.sprite = coinFrames[Mathf.FloorToInt(Mathf.Repeat(animationTime * 8f, coinFrames.Length))];
        coinRenderer.color = step.tone == 2 ? Good : step.tone == 3 ? Bad : Color.white;
    }

    void Go(int direction)
    {
        int next = Mathf.Clamp(index + direction, 0, steps.Length - 1);
        if (next == index) return;
        ShowStep(next);
    }

    public void ShowStep(int step)
    {
        index = Mathf.Clamp(step, 0, steps.Length - 1);
        cardGlowRenderer.enabled = steps[index].highlightCard;
        Animate();
    }

    public int StepCount { get { return steps.Length; } }

    public string StepTitle(int step)
    {
        return steps[Mathf.Clamp(step, 0, steps.Length - 1)].title;
    }

    // ---------- text ----------
    int FontSize(float fraction)
    {
        return Mathf.Max(9, Mathf.RoundToInt(Screen.height * fraction));
    }

    Rect ToGui(Transform target, float widthUnits, float heightUnits)
    {
        Vector3 topLeft = view.WorldToScreenPoint(target.position + new Vector3(-widthUnits / 2f, heightUnits / 2f));
        Vector3 bottomRight = view.WorldToScreenPoint(target.position + new Vector3(widthUnits / 2f, -heightUnits / 2f));
        float top = Screen.height - topLeft.y;
        return new Rect(topLeft.x, top, bottomRight.x - topLeft.x, (Screen.height - bottomRight.y) - top);
    }

    void Fill(Rect area, Color colour)
    {
        Color previous = GUI.color;
        GUI.color = colour;
        GUI.DrawTexture(area, fillTexture);
        GUI.color = previous;
    }

    GUIStyle Label(int size, Color colour, TextAnchor anchor = TextAnchor.MiddleLeft, bool wrap = false, bool bold = false)
    {
        var style = new GUIStyle(GUI.skin.label)
        {
            fontSize = size,
            alignment = anchor,
            wordWrap = wrap,
            fontStyle = bold ? FontStyle.Bold : FontStyle.Normal,
            clipping = TextClipping.Clip
        };
        style.normal.textColor = colour;
        return style;
    }

    static Color Fade(Color colour, float alpha)
    {
        colour.a = alpha;
        return colour;
    }

    Color ToneOf(Step step)
    {
        switch (step.tone)
        {
            case 2: return Good;
            case 3: return Bad;
            case 1: return Accent;
            default: return Dim;
        }
    }

    void OnGUI()
    {
        var step = steps[index];
        Color tone = ToneOf(step);
        Color paperTone = step.tone == 2 ? Good : Accent;   // the card is never the error

        DrawTitle(step, step.tone == 0 ? new Color(0.92f, 0.94f, 0.98f) : tone);
        DrawCard(step, paperTone);
        DrawScreen(step, tone);
        DrawCoinLabel(step, tone);
        DrawFooter(step);
    }

    void DrawTitle(Step step, Color tone)
    {
        GUI.Label(new Rect(0f, Screen.height * 0.025f, Screen.width, Screen.height * 0.075f),
            step.title, Label(FontSize(0.032f), tone, TextAnchor.UpperCenter, bold: true));
    }

    // ---------- the card ----------
    void DrawCard(Step step, Color tone)
    {
        Rect card = ToGui(cardObject, CardWidth / PixelArt.PixelsPerUnit, CardHeight / PixelArt.PixelsPerUnit);

        if (step.cardSections != null) DrawCardCodePage(step, card, tone);
        else DrawCardFront(step, card, tone);
    }

    void DrawCardFront(Step step, Rect card, Color tone)
    {
        float pad = card.width * 0.07f;
        float x = card.x + pad;
        float textWidth = card.width - pad * 2f;
        float y = card.y + card.height * 0.115f;

        Color faded = new Color(Ink.r, Ink.g, Ink.b, 0.58f);

        GUI.Label(new Rect(x, card.y + card.height * 0.02f, textWidth, card.height * 0.09f),
            "STIMMRECHTSAUSWEIS", Label(Mathf.RoundToInt(card.height * 0.052f), Ink, bold: true));

        int labelSize = Mathf.RoundToInt(card.height * 0.038f);
        int valueSize = Mathf.RoundToInt(card.height * 0.046f);
        float labelHeight = labelSize * 1.5f;
        float valueHeight = valueSize * 1.5f;
        float gap = card.height * 0.022f;

        for (int row = 0; row < 4; row++)
        {
            bool active = step.highlightRow == row;
            float rowHeight = labelHeight + valueHeight;

            if (active) Fill(new Rect(card.x + pad * 0.4f, y - gap * 0.5f,
                                      card.width - pad * 0.8f, rowHeight + gap), Fade(tone, 0.35f));

            Color ink = active ? Ink : faded;

            GUI.Label(new Rect(x, y, textWidth, labelHeight), Symbol(row) + "  " + RowLabel[row],
                Label(labelSize, ink, bold: active));

            // The real card prints "Prüfcodes ab Seite 2"; the codes live on the following pages.
            string value = row == 0 ? InitializationCode
                         : row == 1 ? "ab Seite 2"
                         : row == 2 ? ConfirmationCode : FinalizationCode;

            GUI.Label(new Rect(x, y + labelHeight, textWidth, valueHeight), value,
                Label(row == 0 ? Mathf.RoundToInt(card.height * 0.036f) : valueSize,
                      active ? Ink : Fade(Ink, 0.8f), bold: active));

            y += rowHeight + gap;
        }

        GUI.Label(new Rect(x, card.y + card.height * 0.90f, textWidth, card.height * 0.07f),
            PortalUrl, Label(Mathf.RoundToInt(card.height * 0.034f), faded));
    }

    /// Page 2 of the card: the Prüfcodes tables. Only the sections the current step needs are
    /// shown, because the printed card runs to several pages and the prop is 80 x 96 pixels.
    void DrawCardCodePage(Step step, Rect card, Color tone)
    {
        float pad = card.width * 0.07f;
        float x = card.x + pad;
        float textWidth = card.width - pad * 2f;
        float y = card.y + card.height * 0.03f;

        Color faded = new Color(Ink.r, Ink.g, Ink.b, 0.62f);

        int headerSize = Mathf.RoundToInt(card.height * 0.044f);
        int sectionSize = Mathf.RoundToInt(card.height * 0.036f);
        int lineSize = Mathf.RoundToInt(card.height * 0.032f);

        GUI.Label(new Rect(x, y, textWidth, headerSize * 1.5f),
            Symbol(1) + "  Prüfcodes  ·  Seite 2", Label(headerSize, Ink, bold: true));
        y = card.y + card.height * 0.155f;   // clear of the perforated stub

        foreach (int sectionIndex in step.cardSections)
        {
            var section = Ballot.Sections[sectionIndex];

            GUI.Label(new Rect(x, y, textWidth, sectionSize * 1.4f), section.title,
                Label(sectionSize, Ink, bold: true));
            y += sectionSize * 1.5f;

            foreach (var question in section.questions)
            {
                GUI.Label(new Rect(x, y, textWidth, lineSize * 1.35f), question.title,
                    Label(lineSize, faded));
                y += lineSize * 1.35f;

                float column = textWidth / Mathf.Max(1, question.options.Length);
                for (int i = 0; i < question.options.Length; i++)
                {
                    var option = question.options[i];
                    if (option.selected)
                    {
                        Fill(new Rect(x + column * i - 2f, y, column - 4f, lineSize * 1.4f), Fade(tone, 0.38f));
                    }

                    GUI.Label(new Rect(x + column * i, y, column, lineSize * 1.4f),
                        option.label + " " + option.code,
                        Label(lineSize, option.selected ? OnPaper : faded, bold: option.selected));
                }
                y += lineSize * 1.6f;
            }

            y += lineSize * 0.4f;
        }
    }

    // ---------- the portal ----------
    void DrawScreen(Step step, Color tone)
    {
        Rect glass = ToGui(glassObject, GlassWidth / PixelArt.PixelsPerUnit, GlassHeight / PixelArt.PixelsPerUnit);

        float pad = glass.width * 0.03f;
        float sidebarWidth = glass.width * 0.36f;
        int sidebarSize = Mathf.RoundToInt(glass.height * 0.040f);

        var sidebar = new Rect(glass.x + pad, glass.y + pad, sidebarWidth, glass.height - pad * 2f);
        float itemHeight = sidebar.height / PortalSteps.Length;

        for (int i = 0; i < PortalSteps.Length; i++)
        {
            bool active = step.portalStep == i + 1;
            bool done = step.portalStep > i + 1;
            Color colour = active ? Accent : done ? Fade(Good, 0.9f) : Fade(Dim, 0.5f);

            GUI.Label(new Rect(sidebar.x, sidebar.y + i * itemHeight, sidebar.width, itemHeight),
                PortalSteps[i], Label(sidebarSize, colour, wrap: true, bold: active));
        }

        var content = new Rect(glass.x + pad * 2f + sidebarWidth, glass.y + pad,
                               glass.width - sidebarWidth - pad * 3f, glass.height - pad * 2f);

        if (step.highlightScreen) Fill(content, Fade(tone, 0.16f));

        float lineHeight = content.height / MaxScreenLines;
        int lineSize = Mathf.RoundToInt(glass.height * 0.042f);

        for (int i = 0; i < step.screen.Length && i < MaxScreenLines; i++)
        {
            // The first line is the portal's own heading for the page.
            bool heading = i == 0;
            GUI.Label(new Rect(content.x + pad * 0.5f, content.y + i * lineHeight, content.width - pad, lineHeight),
                step.screen[i],
                Label(heading ? Mathf.RoundToInt(lineSize * 1.15f) : lineSize,
                      heading ? (step.highlightScreen ? tone : ScreenInk) : ScreenInk, bold: heading));
        }
    }

    void DrawCoinLabel(Step step, Color tone)
    {
        if (step.packet == 0 || !coinRenderer.enabled) return;

        Vector3 point = view.WorldToScreenPoint(coinObject.position + new Vector3(0f, 1.3f, 0f));
        var area = new Rect(point.x - Screen.width * 0.12f, Screen.height - point.y - 18f,
                            Screen.width * 0.24f, 28f);
        GUI.Label(area, step.packetLabel, Label(FontSize(0.016f), tone, TextAnchor.MiddleCenter));
    }

    void DrawFooter(Step step)
    {
        float top = Screen.height - Mathf.Max(120f, Screen.height * 0.215f);

        Fill(new Rect(0f, top, Screen.width, Screen.height - top), new Color(0.055f, 0.055f, 0.09f, 0.97f));
        Fill(new Rect(0f, top, Screen.width, Mathf.Max(2f, Screen.height * 0.003f)), Fade(ToneOf(step), 0.8f));

        float margin = Screen.width * 0.04f;
        float buttonWidth = Mathf.Max(110f, Screen.width * 0.10f);
        float buttonHeight = Mathf.Max(38f, Screen.height * 0.055f);

        var body = new Rect(margin, top + 14f,
                            Screen.width - margin * 2f - buttonWidth * 2f - 40f,
                            Screen.height - top - 36f);
        GUI.Label(body, step.body, Label(FontSize(0.0175f), new Color(0.86f, 0.89f, 0.94f), TextAnchor.UpperLeft, wrap: true));

        GUI.Label(new Rect(margin, Screen.height - 26f, 300f, 22f), "STEP " + (index + 1) + " OF " + steps.Length,
            Label(FontSize(0.015f), Dim));

        float buttonY = top + (Screen.height - top - buttonHeight) / 2f;
        float rightEdge = Screen.width - margin;

        GUI.enabled = index > 0;
        if (GUI.Button(new Rect(rightEdge - buttonWidth * 2f - 12f, buttonY, buttonWidth, buttonHeight), "BACK")) Go(-1);

        GUI.enabled = index < steps.Length - 1;
        if (GUI.Button(new Rect(rightEdge - buttonWidth, buttonY, buttonWidth, buttonHeight), "NEXT")) Go(1);

        GUI.enabled = true;
    }
}
