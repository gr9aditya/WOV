using UnityEngine;

/// Step-by-step explainer of the Swiss Post e-voting voter journey.
/// Not a game: the viewer presses Next / Back and reads.
/// Terminology, demo codes and screen flow follow the "Explain Swiss Post E-Voting
/// Through a Game" briefing and the demo.evoting.ch portal.
public class VotingWalkthrough : MonoBehaviour
{
    // ---------- layout ----------
    // Panels are placed in world units; everything printed on them is laid out in
    // pixels inside the panel's rectangle, so text can never drift off a panel.
    const float WorldWidth = 18f;

    static readonly Vector2 VoterPos = new Vector2(-8.0f, 0.55f);
    static readonly Vector2 CardPos = new Vector2(-4.3f, 0.55f);
    static readonly Vector2 CardSize = new Vector2(4.9f, 5.0f);
    static readonly Vector2 DevicePos = new Vector2(4.9f, 0.55f);
    static readonly Vector2 DeviceSize = new Vector2(7.6f, 5.0f);
    static readonly Vector2 ScreenPos = new Vector2(4.9f, 0.60f);
    static readonly Vector2 ScreenSize = new Vector2(7.0f, 4.2f);

    const float ArrowY = 0.55f;

    // ---------- palette ----------
    static readonly Color Background = new Color(0.055f, 0.080f, 0.125f);
    static readonly Color Paper = new Color(0.96f, 0.96f, 0.94f);
    static readonly Color Ink = new Color(0.12f, 0.13f, 0.16f);
    static readonly Color Bezel = new Color(0.24f, 0.27f, 0.34f);
    static readonly Color Glass = new Color(0.09f, 0.12f, 0.17f);
    static readonly Color ScreenInk = new Color(0.80f, 0.87f, 0.95f);
    static readonly Color Accent = new Color(1.00f, 0.72f, 0.12f);   // Swiss Post yellow
    static readonly Color OnPaper = new Color(0.52f, 0.36f, 0.02f);  // accent dark enough for white paper
    static readonly Color Good = new Color(0.30f, 0.72f, 0.45f);
    static readonly Color VoterColor = new Color(0.55f, 0.80f, 1.00f);
    static readonly Color Dim = new Color(0.55f, 0.60f, 0.70f);

    // ---------- the printed voting card ----------
    static readonly string[] RowLabel =
    {
        "Initialization Code",
        "Choice Return Codes",
        "Confirmation Code",
        "Finalization Code",
    };

    static readonly string[] RowGerman =
    {
        "Initialisierungscode",
        "Prüfcodes",
        "Bestätigungscode",
        "Finalisierungscode",
    };

    // The demo card from the briefing.
    const string InitializationCode = "2r6i 3gfn dfgq gy7j q4q6 aqq8";
    const string ConfirmationCode = "4419 7199 7";
    const string FinalizationCode = "4137 6763";

    static readonly string[] QuestionText = { "1.  Sonniges Wetter", "2.  Regenwetter" };
    static readonly string[][] QuestionCodes =
    {
        new[] { "Ja 1855", "Nein 0196", "Leer 7064" },
        new[] { "Ja 8393", "Nein 2938", "Leer 2033" },
    };
    // What the voter selected: Yes to sunny weather, No to rainy weather.
    static readonly int[] Selected = { 0, 1 };

    // ---------- the portal's own seven steps ----------
    static readonly string[] PortalSteps =
    {
        "1   Legal provisions",
        "2   Start voting",
        "3   Enter vote",
        "4   Check vote",
        "5   Verify Choice Return Codes",
        "6   Enter Confirmation Code",
        "7   Verify Finalization Code",
    };

    // ---------- the steps ----------
    struct Step
    {
        public string title;
        public string body;
        public string[] screen;
        public int portalStep;     // 1..7, or 0 when the portal is not in the flow yet
        public int arrow;          // 0 none, 1 voter -> system, 2 system -> voter
        public string arrowLabel;
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
                title = "Before starting  ·  Am I on the real portal?",
                body = "The voter types the portal address into the address bar by hand instead of following a link, then " +
                       "compares the certificate fingerprint shown by the browser with the one printed on the voting card. " +
                       "If the fingerprint differs, the connection is not going straight to the portal: stop and contact " +
                       "the canton's support team.",
                screen = new[] { "https://demo.evoting.ch", "", "Fingerprint (SHA-256)", "AC 03 03 58 89 E9 19 18 ...",
                                 "", "matches the printed card" },
                highlightRow = -1, tone = 1
            },
            new Step {
                title = "Before starting  ·  A browser without add-ons",
                body = "Swiss Post recommends a browser mode that blocks add-ons automatically: Incognito in Chrome and " +
                       "Edge, a Private Window in Firefox, Private Browsing in Safari. In Chrome that is the three-dot " +
                       "menu, then New incognito window. Automatic page translation should also be turned off, or the " +
                       "portal may not display correctly.",
                screen = new[] { "Chrome / Edge:   Incognito window", "Firefox:   Private window",
                                 "Safari:   Private Browsing", "", "add-ons blocked",
                                 "page translation off" },
                highlightRow = -1, tone = 1
            },
            new Step {
                title = "Portal step 1  ·  Legal provisions",
                body = "The portal states that voting electronically counts exactly like voting by post or at the polling " +
                       "station, and shows the criminal-law provisions that protect the ballot. The voter confirms having " +
                       "read them.",
                screen = new[] { "Gesetzliche Bestimmungen", "", "[x]  I cast my vote electronically",
                                 "[x]  I have read the legal provisions" },
                portalStep = 1, highlightRow = -1
            },
            new Step {
                title = "Portal step 2  ·  Start voting",
                body = "The voter enters the Initialization Code from the card, together with their year of birth as the " +
                       "Extended Authentication Factor. Only someone holding the physical card can start.",
                screen = new[] { "Initialisierungscode", InitializationCode, "", "Geburtsjahr", "1980" },
                portalStep = 2, highlightRow = 0
            },
            new Step {
                title = "Portal step 3  ·  Enter the vote",
                body = "The voter answers the questions, or leaves them blank. Nothing has left the device yet and every " +
                       "selection can still be changed.",
                screen = new[] { "Treffen Sie Ihre Auswahl", "", "1.  Sonniges Wetter?   [x] Ja",
                                 "2.  Regenwetter?        [x] Nein" },
                portalStep = 3, highlightRow = -1
            },
            new Step {
                title = "Portal step 4  ·  Check the vote, then send it",
                body = "The voter reviews the selections and confirms. Only then does the voting client encrypt the ballot " +
                       "on the voter's own device and send it. After encryption the selections can no longer be changed — " +
                       "but the vote is not cast yet.",
                screen = new[] { "Kontrollieren Sie Ihre Auswahl", "", "Encrypting your vote...", "Sending..." },
                portalStep = 4, arrow = 1, arrowLabel = "encrypted vote",
                highlightRow = -1
            },
            new Step {
                title = "Portal step 5  ·  Verify the Choice Return Codes",
                body = "The system sends back one Choice Return Code per selection. The voter looks up the same options on " +
                       "the printed card and compares. They match, so the system registered exactly what the voter chose. " +
                       "A manipulated computer could change the vote, but it could never guess the printed codes.",
                screen = new[] { "Prüfcodes verifizieren", "", "1. Sonniges Wetter, Ja      1855",
                                 "2. Regenwetter, Nein       2938", "", "[ Alle Codes stimmen überein ]" },
                portalStep = 5, arrow = 2, arrowLabel = "Choice Return Codes",
                highlightRow = 1, highlightScreen = true, showChoiceCodes = true, tone = 1
            },
            new Step {
                title = "Portal step 6  ·  Enter the Confirmation Code",
                body = "Only once every code matches does the voter type the Confirmation Code. This is the step that " +
                       "actually casts the vote. Without it the ballot never enters the electronic ballot box — and until " +
                       "it is entered, the voter may still stop and vote by post or at the polling station instead.",
                screen = new[] { "Bestätigungscode eingeben", ConfirmationCode, "", "[ Stimme bestätigen ]" },
                portalStep = 6, arrow = 1, arrowLabel = "Confirmation Code",
                highlightRow = 2, tone = 1
            },
            new Step {
                title = "Portal step 7  ·  Verify the Finalization Code",
                body = "The system answers with the Finalization Code. It matches the card, so the vote is now in the " +
                       "electronic ballot box and the process is complete.",
                screen = new[] { "Finalisierungscode verifizieren", FinalizationCode, "", "[ Der Code stimmt überein ]" },
                portalStep = 7, arrow = 2, arrowLabel = "Finalization Code",
                highlightRow = 3, highlightScreen = true, tone = 2
            },
            new Step {
                title = "Stopping and resuming",
                body = "The voter may interrupt at any point and continue later, even on a different device. Before " +
                       "encryption the choices can still be changed. After encryption but before the Confirmation Code, " +
                       "the choices are fixed but the Choice Return Codes can be viewed again. After the Confirmation Code, " +
                       "only the Finalization Code can still be checked.",
                screen = new[] { "Willkommen zurück", "", "resuming where you left off..." },
                highlightRow = -1
            },
            new Step {
                title = "After voting  ·  Clearing the traces",
                body = "So that nothing on the device can reveal how the voter voted, the browsing data is cleared: in " +
                       "Chrome, the three-dot menu, then Delete browser data, a time range covering the session, and both " +
                       "Cookies and other website data and Cached images and files.    A private window stores no history " +
                       "in the first place, so this clean-up is only needed after voting in a normal window.",
                screen = new[] { "Delete browsing data", "", "Time range:   Last hour",
                                 "[x]  Cookies and other site data", "[x]  Cached images and files",
                                 "[ Delete data ]" },
                highlightRow = -1
            },
            new Step {
                title = "Why this is trustworthy",
                body = "Individual verifiability: the printed codes let the voter check that their own vote was registered " +
                       "as intended, even on a compromised computer.    Universal verifiability: independent auditors " +
                       "re-check the whole count afterwards with separate verifier software.    Vote secrecy: the ballot is " +
                       "encrypted on the voter's device and the decryption key is split among several parties.",
                screen = new[] { "Vote registered.", "", "Awaiting the count.", "Auditors verify the tally." },
                highlightRow = -1, tone = 2
            },
        };
    }

    // ---------- scene objects ----------
    Step[] steps;
    int index;

    SpriteRenderer cardGlow, arrowShaft, arrowHead;
    readonly Sprite[] icons = new Sprite[4];
    Texture2D fillTexture;

    void Awake()
    {
        steps = BuildSteps();
        BuildScene();
        ApplyStep();
    }

    void BuildScene()
    {
        SyncCamera();
        Camera.main.clearFlags = CameraClearFlags.SolidColor;
        Camera.main.backgroundColor = Background;

        BuildVoter();

        cardGlow = Shape(CardPos, CardSize + new Vector2(0.35f, 0.35f), Accent, 0, rounded: true);
        Shape(CardPos, CardSize, Paper, 1, rounded: true);

        Shape(DevicePos, DeviceSize, Bezel, 1, rounded: true);
        Shape(ScreenPos, ScreenSize, Glass, 2, rounded: true);

        arrowShaft = Shape(new Vector2(0f, ArrowY), new Vector2(1.9f, 0.14f), Accent, 1);
        arrowHead = Shape(new Vector2(0f, ArrowY), new Vector2(0.5f, 0.5f), Accent, 1, triangle: true);

        // Drawn white so the GUI can tint them per state.
        icons[0] = Shapes.Triangle(Color.white);
        icons[1] = Shapes.Diamond(Color.white);
        icons[2] = Shapes.Pentagon(Color.white);
        icons[3] = Shapes.Star(Color.white);

        fillTexture = new Texture2D(1, 1);
        fillTexture.SetPixel(0, 0, Color.white);
        fillTexture.Apply();
    }

    /// Keeps the full 18-unit width visible, and follows the window if it is resized.
    void SyncCamera()
    {
        var camera = Camera.main;
        camera.orthographic = true;
        camera.orthographicSize = WorldWidth / 2f / Mathf.Max(0.1f, camera.aspect);
    }

    void BuildVoter()
    {
        var root = new GameObject("Voter");
        root.transform.SetParent(transform);
        root.transform.position = VoterPos;
        root.transform.localScale = new Vector3(0.85f, 0.85f, 1f);

        Limb(root, new Vector2(0f, 1.15f), new Vector2(0.75f, 0.75f), 0f, circle: true);
        Limb(root, new Vector2(0f, 0.35f), new Vector2(0.14f, 1.25f), 0f);
        Limb(root, new Vector2(0f, 0.65f), new Vector2(1.05f, 0.14f), 0f);
        Limb(root, new Vector2(-0.22f, -0.75f), new Vector2(0.14f, 1.10f), 14f);
        Limb(root, new Vector2(0.22f, -0.75f), new Vector2(0.14f, 1.10f), -14f);
    }

    void Limb(GameObject parent, Vector2 offset, Vector2 size, float angle, bool circle = false)
    {
        var part = new GameObject("part");
        part.transform.SetParent(parent.transform);
        part.transform.localPosition = offset;
        part.transform.localRotation = Quaternion.Euler(0f, 0f, angle);
        part.transform.localScale = size;

        var renderer = part.AddComponent<SpriteRenderer>();
        renderer.sprite = circle ? Shapes.Circle(VoterColor) : Shapes.Box(VoterColor);
        renderer.sortingOrder = 1;
    }

    SpriteRenderer Shape(Vector2 center, Vector2 size, Color color, int order,
                         bool rounded = false, bool triangle = false)
    {
        var item = new GameObject("shape");
        item.transform.SetParent(transform);
        item.transform.position = center;
        item.transform.localScale = size;

        var renderer = item.AddComponent<SpriteRenderer>();
        renderer.sprite = triangle ? Shapes.Triangle(color)
                        : rounded ? Shapes.RoundedBox(color)
                        : Shapes.Box(color);
        renderer.sortingOrder = order;
        return renderer;
    }

    // ---------- navigation ----------
    void Update()
    {
        SyncCamera();

        if (Input.GetKeyDown(KeyCode.RightArrow) || Input.GetKeyDown(KeyCode.Space) ||
            Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.DownArrow)) Go(1);

        if (Input.GetKeyDown(KeyCode.LeftArrow) || Input.GetKeyDown(KeyCode.Backspace) ||
            Input.GetKeyDown(KeyCode.UpArrow)) Go(-1);

        if (Input.GetKeyDown(KeyCode.R)) { index = 0; ApplyStep(); }
    }

    void Go(int direction)
    {
        int next = Mathf.Clamp(index + direction, 0, steps.Length - 1);
        if (next == index) return;
        index = next;
        ApplyStep();
    }

    /// Used by the documentation screenshot pass.
    public int StepCount { get { return steps.Length; } }

    public string StepTitle(int step)
    {
        return steps[Mathf.Clamp(step, 0, steps.Length - 1)].title;
    }

    public void ShowStep(int step)
    {
        index = Mathf.Clamp(step, 0, steps.Length - 1);
        ApplyStep();
    }

    void ApplyStep()
    {
        var step = steps[index];
        Color tone = step.tone == 2 ? Good : Accent;

        cardGlow.enabled = step.highlightCard;
        cardGlow.color = Fade(Accent, 0.35f);

        bool showArrow = step.arrow != 0;
        arrowShaft.enabled = showArrow;
        arrowHead.enabled = showArrow;

        if (showArrow)
        {
            bool toSystem = step.arrow == 1;
            float from = toSystem ? -1.70f : 0.85f;
            float to = toSystem ? 0.55f : -1.40f;

            arrowShaft.transform.position = new Vector3((from + to) / 2f, ArrowY, 0f);
            arrowShaft.transform.localScale = new Vector3(Mathf.Abs(to - from), 0.14f, 1f);
            arrowShaft.color = tone;

            arrowHead.transform.position = new Vector3(to + (toSystem ? 0.2f : -0.2f), ArrowY, 0f);
            arrowHead.transform.localRotation = Quaternion.Euler(0f, 0f, toSystem ? -90f : 90f);
            arrowHead.color = tone;
        }
    }

    static Color Fade(Color color, float alpha)
    {
        color.a = alpha;
        return color;
    }

    // ---------- drawing helpers ----------
    int FontSize(float fraction)
    {
        return Mathf.Max(9, Mathf.RoundToInt(Screen.height * fraction));
    }

    static Rect ToGui(Vector2 center, Vector2 size)
    {
        var camera = Camera.main;
        Vector3 topLeft = camera.WorldToScreenPoint(new Vector3(center.x - size.x / 2f, center.y + size.y / 2f));
        Vector3 bottomRight = camera.WorldToScreenPoint(new Vector3(center.x + size.x / 2f, center.y - size.y / 2f));
        float top = Screen.height - topLeft.y;
        return new Rect(topLeft.x, top, bottomRight.x - topLeft.x, (Screen.height - bottomRight.y) - top);
    }

    void Fill(Rect area, Color color)
    {
        Color previous = GUI.color;
        GUI.color = color;
        GUI.DrawTexture(area, fillTexture);
        GUI.color = previous;
    }

    GUIStyle Label(int size, Color color, TextAnchor anchor = TextAnchor.MiddleLeft, bool wrap = false, bool bold = false)
    {
        var style = new GUIStyle(GUI.skin.label)
        {
            fontSize = size,
            alignment = anchor,
            wordWrap = wrap,
            fontStyle = bold ? FontStyle.Bold : FontStyle.Normal,
            clipping = TextClipping.Clip
        };
        style.normal.textColor = color;
        return style;
    }

    void OnGUI()
    {
        var step = steps[index];
        Color tone = step.tone == 2 ? Good : step.tone == 1 ? Accent : Dim;

        DrawTitle(step, tone);
        DrawCard(step, step.tone == 2 ? Good : Accent);
        DrawScreen(step, tone);
        DrawArrowLabel(step, tone);
        DrawFooter(step);
    }

    void DrawTitle(Step step, Color tone)
    {
        var area = new Rect(0f, Screen.height * 0.028f, Screen.width, Screen.height * 0.075f);
        GUI.Label(area, step.title, Label(FontSize(0.033f), tone, TextAnchor.UpperCenter, bold: true));
    }

    // ---------- the voting card ----------
    void DrawCard(Step step, Color tone)
    {
        Rect card = ToGui(CardPos, CardSize);
        float pad = card.width * 0.055f;
        float iconSize = card.width * 0.085f;
        float iconX = card.x + pad;
        float textX = iconX + iconSize + card.width * 0.035f;
        float textWidth = card.xMax - pad - textX;

        Color faded = new Color(Ink.r, Ink.g, Ink.b, 0.62f);

        float y = card.y + pad * 0.9f;

        float headerHeight = FontSize(0.019f) * 1.45f;
        GUI.Label(new Rect(iconX, y, card.width - pad * 2f, headerHeight), "STIMMRECHTSAUSWEIS",
            Label(FontSize(0.019f), Ink, bold: true));
        y += headerHeight;

        float urlHeight = FontSize(0.015f) * 1.4f;
        GUI.Label(new Rect(iconX, y, card.width - pad * 2f, urlHeight), "https://demo.evoting.ch",
            Label(FontSize(0.015f), faded));
        y += urlHeight + pad * 0.4f;

        float labelHeight = FontSize(0.0135f) * 1.5f;
        float valueHeight = FontSize(0.018f) * 1.5f;
        float questionHeight = FontSize(0.0125f) * 1.45f;
        float codeHeight = FontSize(0.0145f) * 1.5f;
        float rowGap = pad * 0.45f;

        for (int row = 0; row < 4; row++)
        {
            bool active = step.highlightRow == row;
            float rowHeight = row == 1
                ? labelHeight + 2f * (questionHeight + codeHeight)
                : labelHeight + valueHeight;

            if (active)
            {
                Fill(new Rect(card.x + pad * 0.35f, y - rowGap * 0.45f,
                              card.width - pad * 0.7f, rowHeight + rowGap * 0.9f), Fade(tone, 0.26f));
            }

            Color ink = active ? Ink : faded;
            Color mark = active ? OnPaper : new Color(Ink.r, Ink.g, Ink.b, 0.70f);

            Color previous = GUI.color;
            GUI.color = mark;
            GUI.DrawTexture(new Rect(iconX, y + (rowHeight - iconSize) / 2f, iconSize, iconSize),
                icons[row].texture, ScaleMode.ScaleToFit);
            GUI.color = previous;

            GUI.Label(new Rect(textX, y, textWidth, labelHeight),
                RowLabel[row] + "   ·   " + RowGerman[row], Label(FontSize(0.0135f), ink));

            if (row == 1)
            {
                DrawChoiceCodes(step, textX, y + labelHeight, textWidth, questionHeight, codeHeight, ink);
            }
            else
            {
                string value = row == 0 ? InitializationCode : row == 2 ? ConfirmationCode : FinalizationCode;
                GUI.Label(new Rect(textX, y + labelHeight, textWidth, valueHeight), value,
                    Label(FontSize(0.018f), active ? Ink : new Color(Ink.r, Ink.g, Ink.b, 0.85f), bold: active));
            }

            y += rowHeight + rowGap;
        }

        var caption = ToGui(new Vector2(VoterPos.x, VoterPos.y - 1.55f), new Vector2(3f, 0.6f));
        GUI.Label(caption, "voter", Label(FontSize(0.018f), Dim, TextAnchor.MiddleCenter));
    }

    /// Every option is printed on the card; the voter finds the one they selected.
    void DrawChoiceCodes(Step step, float x, float y, float width, float questionHeight, float codeHeight, Color ink)
    {
        for (int question = 0; question < QuestionCodes.Length; question++)
        {
            GUI.Label(new Rect(x, y, width, questionHeight), QuestionText[question],
                Label(FontSize(0.0125f), ink));
            y += questionHeight;

            for (int option = 0; option < 3; option++)
            {
                bool picked = step.showChoiceCodes && Selected[question] == option;
                GUI.Label(new Rect(x + width * 0.335f * option, y, width * 0.335f, codeHeight),
                    QuestionCodes[question][option],
                    Label(FontSize(picked ? 0.016f : 0.0145f), picked ? OnPaper : ink, bold: picked));
            }
            y += codeHeight;
        }
    }

    // ---------- the portal ----------
    void DrawScreen(Step step, Color tone)
    {
        Rect screen = ToGui(ScreenPos, ScreenSize);
        float pad = screen.width * 0.035f;
        float sidebarWidth = screen.width * 0.36f;

        var sidebar = new Rect(screen.x + pad, screen.y + pad, sidebarWidth, screen.height - pad * 2f);
        float itemHeight = sidebar.height / PortalSteps.Length;

        for (int i = 0; i < PortalSteps.Length; i++)
        {
            bool current = step.portalStep == i + 1;
            bool done = step.portalStep > i + 1;
            Color color = current ? Accent : done ? Fade(Good, 0.85f) : Fade(Dim, 0.5f);

            GUI.Label(new Rect(sidebar.x, sidebar.y + i * itemHeight, sidebar.width, itemHeight),
                PortalSteps[i], Label(FontSize(0.0135f), color, wrap: true, bold: current));
        }

        var content = new Rect(screen.x + pad * 2f + sidebarWidth, screen.y + pad,
                               screen.width - sidebarWidth - pad * 3f, screen.height - pad * 2f);

        if (step.highlightScreen) Fill(content, Fade(tone, 0.14f));

        float lineHeight = content.height / 7f;
        for (int i = 0; i < step.screen.Length && i < 7; i++)
        {
            bool emphasis = step.highlightScreen && i == 1;
            GUI.Label(new Rect(content.x + pad * 0.5f, content.y + i * lineHeight, content.width - pad, lineHeight),
                step.screen[i],
                Label(FontSize(emphasis ? 0.028f : 0.0165f), emphasis ? tone : ScreenInk, bold: emphasis));
        }
    }

    void DrawArrowLabel(Step step, Color tone)
    {
        if (step.arrow == 0) return;

        var area = ToGui(new Vector2(-0.45f, ArrowY + 0.9f), new Vector2(2.9f, 0.9f));
        GUI.Label(area, step.arrowLabel, Label(FontSize(0.016f), tone, TextAnchor.MiddleCenter, wrap: true));
    }

    // ---------- the footer ----------
    void DrawFooter(Step step)
    {
        float top = Screen.height - Mathf.Max(120f, Screen.height * 0.20f);

        // Opaque, so nothing behind it shows through the explanation text.
        Fill(new Rect(0f, top, Screen.width, Screen.height - top), Background);
        Fill(new Rect(0f, top, Screen.width, Mathf.Max(1f, Screen.height * 0.0015f)), Fade(Dim, 0.35f));

        float margin = Screen.width * 0.04f;
        float buttonWidth = Mathf.Max(110f, Screen.width * 0.10f);
        float buttonHeight = Mathf.Max(38f, Screen.height * 0.055f);

        var body = new Rect(margin, top + 16f,
                            Screen.width - margin * 2f - buttonWidth * 2f - 40f,
                            Screen.height - top - 40f);
        GUI.Label(body, step.body, Label(FontSize(0.0185f), new Color(0.86f, 0.89f, 0.94f), TextAnchor.UpperLeft, wrap: true));

        GUI.Label(new Rect(margin, Screen.height - 26f, 300f, 22f), "step " + (index + 1) + " of " + steps.Length,
            Label(FontSize(0.015f), Dim));

        float buttonY = top + (Screen.height - top - buttonHeight) / 2f;
        float rightEdge = Screen.width - margin;

        GUI.enabled = index > 0;
        if (GUI.Button(new Rect(rightEdge - buttonWidth * 2f - 12f, buttonY, buttonWidth, buttonHeight), "Back")) Go(-1);

        GUI.enabled = index < steps.Length - 1;
        if (GUI.Button(new Rect(rightEdge - buttonWidth, buttonY, buttonWidth, buttonHeight), "Next")) Go(1);

        GUI.enabled = true;
    }

    // ---------- entry point ----------
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void Launch()
    {
        if (FindAnyObjectByType<VotingWalkthrough>() != null) return;

        if (Camera.main == null)
        {
            var cameraObject = new GameObject("Main Camera") { tag = "MainCamera" };
            cameraObject.AddComponent<Camera>();
            cameraObject.transform.position = new Vector3(0f, 0f, -10f);
        }

        new GameObject("Walkthrough").AddComponent<VotingWalkthrough>();
    }
}
