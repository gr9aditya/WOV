using UnityEngine;
using UnityEngine.InputSystem;

/// A pixel-art, step-by-step explainer of the Swiss Post e-voting voter journey.
/// Not a game: the viewer presses Next / Back and reads.
///
/// The scene is a fixed side-on view — desk, monitor, printed voting card, and the voter —
/// in the manner of a 16-bit platformer. The camera never moves; instead the character points
/// at whatever the current step is about, and a spinning coin carries each message between the
/// card and the screen.
///
/// Terminology, demo codes and screen flow follow the "Explain Swiss Post E-Voting Through a
/// Game" briefing and the demo.evoting.ch portal. See docs/voting-process.md.
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

    // ---------- text colours ----------
    static readonly Color Ink = new Color(0.10f, 0.09f, 0.15f);
    static readonly Color ScreenInk = new Color(0.78f, 0.86f, 0.95f);
    static readonly Color Accent = new Color(1.00f, 0.745f, 0.157f);
    static readonly Color OnPaper = new Color(0.48f, 0.32f, 0.02f);
    static readonly Color Good = new Color(0.35f, 0.78f, 0.47f);
    static readonly Color Dim = new Color(0.55f, 0.58f, 0.68f);
    static readonly Color Backdrop = new Color(0.055f, 0.055f, 0.09f);

    // ---------- the printed voting card ----------
    static readonly string[] RowLabel =
    {
        "INITIALIZATION CODE", "CHOICE RETURN CODES", "CONFIRMATION CODE", "FINALIZATION CODE",
    };

    const string InitializationCode = "2r6i 3gfn dfgq gy7j q4q6 aqq8";
    const string ConfirmationCode = "4419 7199 7";
    const string FinalizationCode = "4137 6763";

    static readonly string[] QuestionText = { "1. SONNIGES WETTER", "2. REGENWETTER" };
    static readonly string[][] QuestionCodes =
    {
        new[] { "Ja 1855", "Nein 0196", "Leer 7064" },
        new[] { "Ja 8393", "Nein 2938", "Leer 2033" },
    };
    static readonly int[] Selected = { 0, 1 };

    static readonly string[] PortalSteps =
    {
        "1 LEGAL TERMS",
        "2 START VOTING",
        "3 ENTER VOTE",
        "4 CHECK VOTE",
        "5 VERIFY CODES",
        "6 CONFIRM CODE",
        "7 FINAL CODE",
    };

    // ---------- the steps ----------
    struct Step
    {
        public string title;
        public string body;
        public string[] screen;
        public int portalStep;
        public int packet;         // 0 none, 1 voter -> system, 2 system -> voter
        public string packetLabel;
        public int highlightRow;   // index into the card rows, -1 for none
        public bool highlightCard;
        public bool highlightScreen;
        public bool showChoiceCodes;
        public int tone;           // 0 neutral, 1 attention, 2 success
    }

    static Step[] BuildSteps()
    {
        return new[]
        {
            new Step {
                title = "The voter's journey through e-voting",
                body = "How a vote is cast on the Swiss Post e-voting portal, and how the voter can check that it was " +
                       "registered correctly. The system uses a two-round return code scheme.    Use Next and Back, or the arrow keys.",
                screen = new[] { "demo.evoting.ch", "", "the portal is not open yet" },
                highlightRow = -1
            },
            new Step {
                title = "The voting card arrives by post",
                body = "Before the election, every voter receives a printed voting card. It carries an Initialization Code, " +
                       "a Choice Return Code for every option that can be selected, a Confirmation Code and a Finalization " +
                       "Code. All of them are generated freshly for this one voter and this one election.",
                screen = new[] { "demo.evoting.ch", "", "the portal is not open yet" },
                highlightRow = -1, highlightCard = true
            },
            new Step {
                title = "Before starting  -  Am I on the real portal?",
                body = "The voter types the portal address into the address bar by hand instead of following a link, then " +
                       "compares the certificate fingerprint shown by the browser with the one printed on the voting card. " +
                       "If the fingerprint differs, the connection is not going straight to the portal: stop and contact " +
                       "the canton's support team.",
                screen = new[] { "https://demo.evoting.ch", "", "FINGERPRINT (SHA-256)", "AC 03 03 58 89 E9 ...",
                                 "", "matches the printed card" },
                highlightRow = -1, tone = 1
            },
            new Step {
                title = "Before starting  -  A browser without add-ons",
                body = "Swiss Post recommends a browser mode that blocks add-ons automatically: Incognito in Chrome and " +
                       "Edge, a Private Window in Firefox, Private Browsing in Safari. Automatic page translation should " +
                       "also be turned off, or the portal may not display correctly.",
                screen = new[] { "Chrome / Edge:  Incognito", "Firefox:  Private window",
                                 "Safari:  Private Browsing", "", "add-ons blocked", "translation off" },
                highlightRow = -1, tone = 1
            },
            new Step {
                title = "Portal step 1  -  Legal provisions",
                body = "The portal states that voting electronically counts exactly like voting by post or at the polling " +
                       "station, and shows the criminal-law provisions that protect the ballot. The voter confirms having " +
                       "read them.",
                screen = new[] { "BESTIMMUNGEN", "", "[x] I vote online",
                                 "[x] I have read the terms" },
                portalStep = 1, highlightRow = -1
            },
            new Step {
                title = "Portal step 2  -  Start voting",
                body = "The voter enters the Initialization Code from the card, together with their year of birth as the " +
                       "Extended Authentication Factor. Only someone holding the physical card can start.",
                screen = new[] { "INITIALISIERUNGSCODE", InitializationCode, "", "GEBURTSJAHR", "1980" },
                portalStep = 2, highlightRow = 0
            },
            new Step {
                title = "Portal step 3  -  Enter the vote",
                body = "The voter answers the questions, or leaves them blank. Nothing has left the device yet and every " +
                       "selection can still be changed.",
                screen = new[] { "IHRE AUSWAHL", "", "1. Sonniges Wetter  [x] Ja",
                                 "2. Regenwetter     [x] Nein" },
                portalStep = 3, highlightRow = -1
            },
            new Step {
                title = "Portal step 4  -  Check the vote, then send it",
                body = "The voter reviews the selections and confirms. Only then does the voting client encrypt the ballot " +
                       "on the voter's own device and send it. After encryption the selections can no longer be changed — " +
                       "but the vote is not cast yet.",
                screen = new[] { "AUSWAHL KONTROLLIEREN", "", "Encrypting your vote...", "Sending..." },
                portalStep = 4, packet = 1, packetLabel = "encrypted vote",
                highlightRow = -1
            },
            new Step {
                title = "Portal step 5  -  Verify the Choice Return Codes",
                body = "The system sends back one Choice Return Code per selection. The voter looks up the same options on " +
                       "the printed card and compares. They match, so the system registered exactly what the voter chose. " +
                       "A manipulated computer could change the vote, but it could never guess the printed codes.",
                screen = new[] { "PRUEFCODES", "", "1. Sonniges Wetter, Ja   1855",
                                 "2. Regenwetter, Nein    2938", "", "[ Alle Codes stimmen ]" },
                portalStep = 5, packet = 2, packetLabel = "Choice Return Codes",
                highlightRow = 1, highlightScreen = true, showChoiceCodes = true, tone = 1
            },
            new Step {
                title = "Portal step 6  -  Enter the Confirmation Code",
                body = "Only once every code matches does the voter type the Confirmation Code. This is the step that " +
                       "actually casts the vote. Without it the ballot never enters the electronic ballot box — and until " +
                       "it is entered, the voter may still stop and vote by post or at the polling station instead.",
                screen = new[] { "BESTAETIGUNGSCODE", ConfirmationCode, "", "[ Stimme bestaetigen ]" },
                portalStep = 6, packet = 1, packetLabel = "Confirmation Code",
                highlightRow = 2, tone = 1
            },
            new Step {
                title = "Portal step 7  -  Verify the Finalization Code",
                body = "The system answers with the Finalization Code. It matches the card, so the vote is now in the " +
                       "electronic ballot box and the process is complete.",
                screen = new[] { "FINALISIERUNGSCODE", FinalizationCode, "", "[ Der Code stimmt ueberein ]" },
                portalStep = 7, packet = 2, packetLabel = "Finalization Code",
                highlightRow = 3, highlightScreen = true, tone = 2
            },
            new Step {
                title = "Stopping and resuming",
                body = "The voter may interrupt at any point and continue later, even on a different device. Before " +
                       "encryption the choices can still be changed. After encryption but before the Confirmation Code, " +
                       "the choices are fixed but the Choice Return Codes can be viewed again. After the Confirmation Code, " +
                       "only the Finalization Code can still be checked.",
                screen = new[] { "WILLKOMMEN ZURUECK", "", "resuming where you left off..." },
                highlightRow = -1
            },
            new Step {
                title = "After voting  -  Clearing the traces",
                body = "So that nothing on the device can reveal how the voter voted, the browsing data is cleared: a time " +
                       "range covering the session, then both Cookies and other website data and Cached images and files.    " +
                       "A private window stores no history in the first place, so this is only needed after voting in a " +
                       "normal window.",
                screen = new[] { "DELETE BROWSING DATA", "", "Time range:  Last hour",
                                 "[x] Cookies + site data", "[x] Cached images and files", "[ Delete data ]" },
                highlightRow = -1
            },
            new Step {
                title = "Why this is trustworthy",
                body = "Individual verifiability: the printed codes let the voter check that their own vote was registered " +
                       "as intended, even on a compromised computer.    Universal verifiability: independent auditors " +
                       "re-check the whole count afterwards with separate verifier software.    Vote secrecy: the ballot is " +
                       "encrypted on the voter's device and the decryption key is split among several parties.",
                screen = new[] { "VOTE REGISTERED", "", "Awaiting the count.", "Auditors verify the tally." },
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
        // A tiled brick wall behind everything, and a ground band along the bottom.
        var brick = PixelSprites.Brick(16);
        const float tile = 1f;      // 16 art pixels at 16 pixels per unit

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

        // The character bobs by exactly one art pixel, and points when a step is about the
        // card or the screen.
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
        float cardEdge = CardPos.x + CardWidth / 2f / PixelArt.PixelsPerUnit + 0.45f;
        float monitorEdge = MonitorPos.x - MonitorWidth / 2f / PixelArt.PixelsPerUnit - 0.45f;
        var cardSide = new Vector2(cardEdge, CardPos.y);
        var monitorSide = new Vector2(monitorEdge, MonitorPos.y);

        Vector2 from = step.packet == 1 ? cardSide : monitorSide;
        Vector2 to = step.packet == 1 ? monitorSide : cardSide;

        Vector2 position = Vector2.Lerp(from, to, progress);
        position.y += Mathf.Sin(progress * Mathf.PI) * 1.1f;

        // Snapping to the pixel grid keeps the coin from shimmering between pixels.
        coinObject.position = new Vector3(
            Mathf.Round(position.x * PixelArt.PixelsPerUnit) / PixelArt.PixelsPerUnit,
            Mathf.Round(position.y * PixelArt.PixelsPerUnit) / PixelArt.PixelsPerUnit, 0f);

        coinRenderer.sprite = coinFrames[Mathf.FloorToInt(Mathf.Repeat(animationTime * 8f, coinFrames.Length))];
        coinRenderer.color = step.tone == 2 ? Good : Color.white;
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

    void OnGUI()
    {
        var step = steps[index];
        Color tone = step.tone == 2 ? Good : step.tone == 1 ? Accent : Dim;

        DrawTitle(step, step.tone == 0 ? new Color(0.92f, 0.94f, 0.98f) : tone);
        DrawCard(step, step.tone == 2 ? Good : Accent);
        DrawScreen(step, tone);
        DrawCoinLabel(step, tone);
        DrawFooter(step);
    }

    void DrawTitle(Step step, Color tone)
    {
        GUI.Label(new Rect(0f, Screen.height * 0.025f, Screen.width, Screen.height * 0.075f),
            step.title, Label(FontSize(0.032f), tone, TextAnchor.UpperCenter, bold: true));
    }

    void DrawCard(Step step, Color tone)
    {
        Rect card = ToGui(cardObject, CardWidth / PixelArt.PixelsPerUnit, CardHeight / PixelArt.PixelsPerUnit);

        float pad = card.width * 0.07f;
        float x = card.x + pad;
        float textWidth = card.width - pad * 2f;
        float y = card.y + card.height * 0.115f;      // below the perforated stub

        Color faded = new Color(Ink.r, Ink.g, Ink.b, 0.58f);

        GUI.Label(new Rect(x, card.y + card.height * 0.02f, textWidth, card.height * 0.09f),
            "STIMMRECHTSAUSWEIS", Label(Mathf.RoundToInt(card.height * 0.052f), Ink, bold: true));

        int labelSize = Mathf.RoundToInt(card.height * 0.036f);
        int valueSize = Mathf.RoundToInt(card.height * 0.046f);
        int smallSize = Mathf.RoundToInt(card.height * 0.033f);

        float labelHeight = labelSize * 1.5f;
        float valueHeight = valueSize * 1.5f;
        float smallHeight = smallSize * 1.45f;
        float gap = card.height * 0.018f;

        for (int row = 0; row < 4; row++)
        {
            bool active = step.highlightRow == row;
            float rowHeight = row == 1
                ? labelHeight + 2f * (smallHeight + valueHeight * 0.85f)
                : labelHeight + valueHeight;

            if (active) Fill(new Rect(card.x + pad * 0.4f, y - gap * 0.5f,
                                      card.width - pad * 0.8f, rowHeight + gap), Fade(tone, 0.35f));

            Color ink = active ? Ink : faded;

            GUI.Label(new Rect(x, y, textWidth, labelHeight), Symbol(row) + "  " + RowLabel[row],
                Label(labelSize, ink, bold: active));

            if (row == 1)
            {
                float codeY = y + labelHeight;
                for (int question = 0; question < QuestionCodes.Length; question++)
                {
                    GUI.Label(new Rect(x, codeY, textWidth, smallHeight), QuestionText[question],
                        Label(smallSize, ink));
                    codeY += smallHeight;

                    for (int option = 0; option < 3; option++)
                    {
                        bool picked = step.showChoiceCodes && Selected[question] == option;
                        GUI.Label(new Rect(x + textWidth * 0.335f * option, codeY, textWidth * 0.335f, valueHeight * 0.85f),
                            QuestionCodes[question][option],
                            Label(smallSize, picked ? OnPaper : ink, bold: picked));
                    }
                    codeY += valueHeight * 0.85f;
                }
            }
            else
            {
                string value = row == 0 ? InitializationCode : row == 2 ? ConfirmationCode : FinalizationCode;
                GUI.Label(new Rect(x, y + labelHeight, textWidth, valueHeight), value,
                    Label(row == 0 ? smallSize : valueSize, active ? Ink : Fade(Ink, 0.8f), bold: active));
            }

            y += rowHeight + gap;
        }
    }

    /// The card's four symbols, as characters rather than sprites: at this size a drawn
    /// pentagon would be a smudge, and these read clearly.
    static string Symbol(int row)
    {
        switch (row)
        {
            case 0: return "[^]";
            case 1: return "[*]";
            case 2: return "[O]";
            default: return "[+]";
        }
    }

    void DrawScreen(Step step, Color tone)
    {
        Rect glass = ToGui(glassObject, GlassWidth / PixelArt.PixelsPerUnit, GlassHeight / PixelArt.PixelsPerUnit);

        float pad = glass.width * 0.035f;
        float sidebarWidth = glass.width * 0.38f;
        int sidebarSize = Mathf.RoundToInt(glass.height * 0.044f);

        var sidebar = new Rect(glass.x + pad, glass.y + pad, sidebarWidth, glass.height - pad * 2f);
        float itemHeight = sidebar.height / PortalSteps.Length;

        for (int i = 0; i < PortalSteps.Length; i++)
        {
            bool active = step.portalStep == i + 1;
            bool done = step.portalStep > i + 1;
            Color colour = active ? Accent : done ? Fade(Good, 0.9f) : Fade(Dim, 0.5f);

            GUI.Label(new Rect(sidebar.x, sidebar.y + i * itemHeight, sidebar.width, itemHeight),
                PortalSteps[i], Label(sidebarSize, colour, bold: active));
        }

        var content = new Rect(glass.x + pad * 2f + sidebarWidth, glass.y + pad,
                               glass.width - sidebarWidth - pad * 3f, glass.height - pad * 2f);

        if (step.highlightScreen) Fill(content, Fade(tone, 0.16f));

        float lineHeight = content.height / 7f;
        int lineSize = Mathf.RoundToInt(glass.height * 0.050f);

        for (int i = 0; i < step.screen.Length && i < 7; i++)
        {
            bool emphasis = step.highlightScreen && i == 1;
            GUI.Label(new Rect(content.x + pad * 0.5f, content.y + i * lineHeight, content.width - pad, lineHeight),
                step.screen[i],
                Label(emphasis ? Mathf.RoundToInt(lineSize * 1.6f) : lineSize,
                      emphasis ? tone : ScreenInk, bold: emphasis));
        }
    }

    void DrawCoinLabel(Step step, Color tone)
    {
        if (step.packet == 0 || !coinRenderer.enabled) return;

        Vector3 point = view.WorldToScreenPoint(coinObject.position + new Vector3(0f, 1.3f, 0f));
        var area = new Rect(point.x - Screen.width * 0.11f, Screen.height - point.y - 18f,
                            Screen.width * 0.22f, 28f);
        GUI.Label(area, step.packetLabel, Label(FontSize(0.016f), tone, TextAnchor.MiddleCenter));
    }

    void DrawFooter(Step step)
    {
        float top = Screen.height - Mathf.Max(120f, Screen.height * 0.20f);

        Fill(new Rect(0f, top, Screen.width, Screen.height - top), new Color(0.055f, 0.055f, 0.09f, 0.97f));
        Fill(new Rect(0f, top, Screen.width, Mathf.Max(2f, Screen.height * 0.003f)), Fade(Accent, 0.7f));

        float margin = Screen.width * 0.04f;
        float buttonWidth = Mathf.Max(110f, Screen.width * 0.10f);
        float buttonHeight = Mathf.Max(38f, Screen.height * 0.055f);

        var body = new Rect(margin, top + 16f,
                            Screen.width - margin * 2f - buttonWidth * 2f - 40f,
                            Screen.height - top - 40f);
        GUI.Label(body, step.body, Label(FontSize(0.0185f), new Color(0.86f, 0.89f, 0.94f), TextAnchor.UpperLeft, wrap: true));

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
