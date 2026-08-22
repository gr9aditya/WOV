using UnityEngine;
using UnityEngine.InputSystem;

/// A 3D, step-by-step explainer of the Swiss Post e-voting voter journey.
/// Not a game: the viewer presses Next / Back and reads.
///
/// The scene is a desk with a monitor and a printed voting card. The camera moves between
/// three viewpoints so that whichever of the two the current step is about fills the frame,
/// and a glowing packet travels between them when a message is sent.
///
/// Terminology, demo codes and screen flow follow the "Explain Swiss Post E-Voting Through a
/// Game" briefing and the demo.evoting.ch portal. See docs/voting-process.md.
public class Walkthrough3D : MonoBehaviour
{
    // ---------- palette ----------
    static readonly Color Room = new Color(0.055f, 0.070f, 0.105f);
    static readonly Color DeskColour = new Color(0.34f, 0.28f, 0.23f);
    static readonly Color MetalColour = new Color(0.22f, 0.24f, 0.30f);
    static readonly Color Paper = new Color(0.96f, 0.96f, 0.93f);
    static readonly Color Ink = new Color(0.12f, 0.13f, 0.16f);
    static readonly Color Glass = new Color(0.07f, 0.10f, 0.15f);
    static readonly Color ScreenInk = new Color(0.82f, 0.88f, 0.96f);
    static readonly Color Accent = new Color(1.00f, 0.72f, 0.12f);
    static readonly Color OnPaper = new Color(0.52f, 0.36f, 0.02f);
    static readonly Color Good = new Color(0.30f, 0.74f, 0.46f);
    static readonly Color Skin = new Color(0.55f, 0.78f, 1.00f);
    static readonly Color Dim = new Color(0.55f, 0.60f, 0.70f);

    // ---------- the printed voting card ----------
    static readonly string[] RowLabel =
    {
        "Initialization Code", "Choice Return Codes", "Confirmation Code", "Finalization Code",
    };

    static readonly string[] RowGerman =
    {
        "Initialisierungscode", "Prüfcodes", "Bestätigungscode", "Finalisierungscode",
    };

    const string InitializationCode = "2r6i 3gfn dfgq gy7j q4q6 aqq8";
    const string ConfirmationCode = "4419 7199 7";
    const string FinalizationCode = "4137 6763";

    static readonly string[] QuestionText = { "1.  Sonniges Wetter", "2.  Regenwetter" };
    static readonly string[][] QuestionCodes =
    {
        new[] { "Ja 1855", "Nein 0196", "Leer 7064" },
        new[] { "Ja 8393", "Nein 2938", "Leer 2033" },
    };
    static readonly int[] Selected = { 0, 1 };

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

    // ---------- viewpoints ----------
    enum View { Overview, Card, Monitor, Both }

    struct Viewpoint
    {
        public Vector3 position;
        public Vector3 target;

        public Viewpoint(Vector3 position, Vector3 target)
        {
            this.position = position;
            this.target = target;
        }
    }

    static Viewpoint ViewpointFor(View view)
    {
        switch (view)
        {
            case View.Card:
                return new Viewpoint(new Vector3(-0.62f, 1.34f, -1.06f), new Vector3(-0.62f, 1.06f, 0.05f));
            case View.Monitor:
                return new Viewpoint(new Vector3(0.58f, 1.44f, -1.10f), new Vector3(0.58f, 1.16f, 0.26f));
            case View.Both:
                return new Viewpoint(new Vector3(-0.02f, 1.52f, -1.80f), new Vector3(-0.02f, 1.10f, 0.15f));
            default:
                return new Viewpoint(new Vector3(-0.40f, 2.05f, -2.55f), new Vector3(-0.10f, 1.05f, 0.10f));
        }
    }

    // ---------- the steps ----------
    struct Step
    {
        public string title;
        public string body;
        public string[] screen;
        public View view;
        public int portalStep;
        public int packet;         // 0 none, 1 voter -> system, 2 system -> voter
        public string packetLabel;
        public int highlightRow;
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
                view = View.Overview, highlightRow = -1
            },
            new Step {
                title = "The voting card arrives by post",
                body = "Before the election, every voter receives a printed voting card. It carries an Initialization Code, " +
                       "a Choice Return Code for every option that can be selected, a Confirmation Code and a Finalization " +
                       "Code. All of them are generated freshly for this one voter and this one election.",
                screen = new[] { "demo.evoting.ch", "", "the portal is not open yet" },
                view = View.Card, highlightRow = -1, highlightCard = true
            },
            new Step {
                title = "Before starting  ·  Am I on the real portal?",
                body = "The voter types the portal address into the address bar by hand instead of following a link, then " +
                       "compares the certificate fingerprint shown by the browser with the one printed on the voting card. " +
                       "If the fingerprint differs, the connection is not going straight to the portal: stop and contact " +
                       "the canton's support team.",
                screen = new[] { "https://demo.evoting.ch", "", "Fingerprint (SHA-256)", "AC 03 03 58 89 E9 19 18 ...",
                                 "", "matches the printed card" },
                view = View.Monitor, highlightRow = -1, tone = 1
            },
            new Step {
                title = "Before starting  ·  A browser without add-ons",
                body = "Swiss Post recommends a browser mode that blocks add-ons automatically: Incognito in Chrome and " +
                       "Edge, a Private Window in Firefox, Private Browsing in Safari. Automatic page translation should " +
                       "also be turned off, or the portal may not display correctly.",
                screen = new[] { "Chrome / Edge:   Incognito window", "Firefox:   Private window",
                                 "Safari:   Private Browsing", "", "add-ons blocked", "page translation off" },
                view = View.Monitor, highlightRow = -1, tone = 1
            },
            new Step {
                title = "Portal step 1  ·  Legal provisions",
                body = "The portal states that voting electronically counts exactly like voting by post or at the polling " +
                       "station, and shows the criminal-law provisions that protect the ballot. The voter confirms having " +
                       "read them.",
                screen = new[] { "Gesetzliche Bestimmungen", "", "[x]  I cast my vote electronically",
                                 "[x]  I have read the legal provisions" },
                view = View.Monitor, portalStep = 1, highlightRow = -1
            },
            new Step {
                title = "Portal step 2  ·  Start voting",
                body = "The voter enters the Initialization Code from the card, together with their year of birth as the " +
                       "Extended Authentication Factor. Only someone holding the physical card can start.",
                screen = new[] { "Initialisierungscode", InitializationCode, "", "Geburtsjahr", "1980" },
                view = View.Both, portalStep = 2, highlightRow = 0
            },
            new Step {
                title = "Portal step 3  ·  Enter the vote",
                body = "The voter answers the questions, or leaves them blank. Nothing has left the device yet and every " +
                       "selection can still be changed.",
                screen = new[] { "Treffen Sie Ihre Auswahl", "", "1.  Sonniges Wetter?   [x] Ja",
                                 "2.  Regenwetter?        [x] Nein" },
                view = View.Monitor, portalStep = 3, highlightRow = -1
            },
            new Step {
                title = "Portal step 4  ·  Check the vote, then send it",
                body = "The voter reviews the selections and confirms. Only then does the voting client encrypt the ballot " +
                       "on the voter's own device and send it. After encryption the selections can no longer be changed — " +
                       "but the vote is not cast yet.",
                screen = new[] { "Kontrollieren Sie Ihre Auswahl", "", "Encrypting your vote...", "Sending..." },
                view = View.Both, portalStep = 4, packet = 1, packetLabel = "encrypted vote",
                highlightRow = -1
            },
            new Step {
                title = "Portal step 5  ·  Verify the Choice Return Codes",
                body = "The system sends back one Choice Return Code per selection. The voter looks up the same options on " +
                       "the printed card and compares. They match, so the system registered exactly what the voter chose. " +
                       "A manipulated computer could change the vote, but it could never guess the printed codes.",
                screen = new[] { "Prüfcodes verifizieren", "", "1. Sonniges Wetter, Ja      1855",
                                 "2. Regenwetter, Nein       2938", "", "[ Alle Codes stimmen überein ]" },
                view = View.Both, portalStep = 5, packet = 2, packetLabel = "Choice Return Codes",
                highlightRow = 1, highlightScreen = true, showChoiceCodes = true, tone = 1
            },
            new Step {
                title = "Portal step 6  ·  Enter the Confirmation Code",
                body = "Only once every code matches does the voter type the Confirmation Code. This is the step that " +
                       "actually casts the vote. Without it the ballot never enters the electronic ballot box — and until " +
                       "it is entered, the voter may still stop and vote by post or at the polling station instead.",
                screen = new[] { "Bestätigungscode eingeben", ConfirmationCode, "", "[ Stimme bestätigen ]" },
                view = View.Both, portalStep = 6, packet = 1, packetLabel = "Confirmation Code",
                highlightRow = 2, tone = 1
            },
            new Step {
                title = "Portal step 7  ·  Verify the Finalization Code",
                body = "The system answers with the Finalization Code. It matches the card, so the vote is now in the " +
                       "electronic ballot box and the process is complete.",
                screen = new[] { "Finalisierungscode verifizieren", FinalizationCode, "", "[ Der Code stimmt überein ]" },
                view = View.Both, portalStep = 7, packet = 2, packetLabel = "Finalization Code",
                highlightRow = 3, highlightScreen = true, tone = 2
            },
            new Step {
                title = "Stopping and resuming",
                body = "The voter may interrupt at any point and continue later, even on a different device. Before " +
                       "encryption the choices can still be changed. After encryption but before the Confirmation Code, " +
                       "the choices are fixed but the Choice Return Codes can be viewed again. After the Confirmation Code, " +
                       "only the Finalization Code can still be checked.",
                screen = new[] { "Willkommen zurück", "", "resuming where you left off..." },
                view = View.Overview, highlightRow = -1
            },
            new Step {
                title = "After voting  ·  Clearing the traces",
                body = "So that nothing on the device can reveal how the voter voted, the browsing data is cleared: a time " +
                       "range covering the session, then both Cookies and other website data and Cached images and files.    " +
                       "A private window stores no history in the first place, so this is only needed after voting in a " +
                       "normal window.",
                screen = new[] { "Delete browsing data", "", "Time range:   Last hour",
                                 "[x]  Cookies and other site data", "[x]  Cached images and files", "[ Delete data ]" },
                view = View.Monitor, highlightRow = -1
            },
            new Step {
                title = "Why this is trustworthy",
                body = "Individual verifiability: the printed codes let the voter check that their own vote was registered " +
                       "as intended, even on a compromised computer.    Universal verifiability: independent auditors " +
                       "re-check the whole count afterwards with separate verifier software.    Vote secrecy: the ballot is " +
                       "encrypted on the voter's device and the decryption key is split among several parties.",
                screen = new[] { "Vote registered.", "", "Awaiting the count.", "Auditors verify the tally." },
                view = View.Overview, highlightRow = -1, tone = 2
            },
        };
    }

    // ---------- scene ----------
    Step[] steps;
    int index;

    Camera view;
    Transform cardPanel, screenPanel, packetCube, cardGlow;
    Material cardGlowMaterial, packetMaterial;
    Texture2D fillTexture;

    Viewpoint current;
    Viewpoint desired;
    float packetProgress;

    static readonly Vector3 CardCentre = new Vector3(-0.62f, 1.17f, 0.05f);
    static readonly Vector3 ScreenCentre = new Vector3(0.58f, 1.27f, 0.26f);

    void Awake()
    {
        steps = BuildSteps();

        fillTexture = new Texture2D(1, 1);
        fillTexture.SetPixel(0, 0, Color.white);
        fillTexture.Apply();

        BuildScene();
        ShowStep(0, instant: true);
    }

    void BuildScene()
    {
        BuildCameraAndLights();
        BuildRoom();
        BuildDesk();
        BuildMonitor();
        BuildCard();
        BuildVoter();

        packetMaterial = Stage.Glowing(Accent);
        packetCube = Stage.Solid(PrimitiveType.Cube, transform, Vector3.zero,
                                 new Vector3(0.07f, 0.07f, 0.07f), packetMaterial);
        packetCube.gameObject.SetActive(false);
    }

    void BuildCameraAndLights()
    {
        view = Camera.main;
        if (view == null)
        {
            var holder = new GameObject("Main Camera") { tag = "MainCamera" };
            view = holder.AddComponent<Camera>();
        }

        view.clearFlags = CameraClearFlags.SolidColor;
        view.backgroundColor = Room;
        view.fieldOfView = 42f;
        view.nearClipPlane = 0.03f;

        var sun = new GameObject("Key Light").AddComponent<Light>();
        sun.type = LightType.Directional;
        sun.color = new Color(1f, 0.96f, 0.90f);
        sun.intensity = 2.1f;
        sun.shadows = LightShadows.Soft;
        sun.transform.rotation = Quaternion.Euler(48f, 155f, 0f);

        var fill = new GameObject("Fill Light").AddComponent<Light>();
        fill.type = LightType.Directional;
        fill.color = new Color(0.45f, 0.60f, 0.90f);
        fill.intensity = 0.8f;
        fill.shadows = LightShadows.None;
        fill.transform.rotation = Quaternion.Euler(15f, -40f, 0f);

        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.28f, 0.31f, 0.40f);
    }

    void BuildRoom()
    {
        Stage.Solid(PrimitiveType.Cube, transform, new Vector3(0f, -0.05f, 0.6f),
                    new Vector3(8f, 0.1f, 8f), Stage.Unlit(new Color(0.085f, 0.10f, 0.145f)));

        // A back wall gives the scene depth without needing a full environment.
        Stage.Solid(PrimitiveType.Cube, transform, new Vector3(0f, 1.6f, 1.9f),
                    new Vector3(8f, 3.2f, 0.1f), Stage.Unlit(new Color(0.115f, 0.135f, 0.19f)));
    }

    void BuildDesk()
    {
        var wood = Stage.Lit(DeskColour, smoothness: 0.15f);
        Stage.Solid(PrimitiveType.Cube, transform, new Vector3(0f, 0.72f, 0.1f),
                    new Vector3(2.4f, 0.05f, 1.0f), wood);

        var metal = Stage.Lit(MetalColour, smoothness: 0.6f, metallic: 0.6f);
        for (int corner = 0; corner < 4; corner++)
        {
            float x = (corner % 2 == 0) ? -1.1f : 1.1f;
            float z = (corner < 2) ? -0.28f : 0.48f;
            Stage.Solid(PrimitiveType.Cylinder, transform, new Vector3(x, 0.36f, z),
                        new Vector3(0.05f, 0.36f, 0.05f), metal);
        }
    }

    void BuildMonitor()
    {
        var metal = Stage.Lit(MetalColour, smoothness: 0.55f, metallic: 0.4f);

        Stage.Solid(PrimitiveType.Cylinder, transform, new Vector3(0.58f, 0.79f, 0.32f),
                    new Vector3(0.22f, 0.02f, 0.16f), metal);
        Stage.Solid(PrimitiveType.Cube, transform, new Vector3(0.58f, 0.90f, 0.33f),
                    new Vector3(0.05f, 0.24f, 0.05f), metal);
        Stage.Solid(PrimitiveType.Cube, transform, new Vector3(0.58f, 1.27f, 0.29f),
                    new Vector3(1.16f, 0.72f, 0.03f), metal);

        screenPanel = Stage.Panel(transform, ScreenCentre, new Vector2(1.08f, 0.64f), Stage.Unlit(Glass));
    }

    void BuildCard()
    {
        cardGlowMaterial = Stage.Unlit(new Color(Accent.r, Accent.g, Accent.b, 0.55f));
        cardGlow = Stage.Panel(transform, CardCentre + new Vector3(0f, 0f, 0.004f),
                               new Vector2(0.74f, 0.78f), cardGlowMaterial);

        cardPanel = Stage.Panel(transform, CardCentre, new Vector2(0.70f, 0.74f), Stage.Unlit(Paper));

        // A little easel, so the card stands on the desk instead of floating.
        var metal = Stage.Lit(MetalColour, smoothness: 0.5f, metallic: 0.4f);
        Stage.Solid(PrimitiveType.Cube, transform, new Vector3(-0.62f, 0.77f, 0.12f),
                    new Vector3(0.42f, 0.02f, 0.16f), metal);
        Stage.Solid(PrimitiveType.Cube, transform, new Vector3(-0.62f, 0.95f, 0.15f),
                    new Vector3(0.03f, 0.36f, 0.03f), metal, new Vector3(12f, 0f, 0f));
    }

    void BuildVoter()
    {
        var body = Stage.Lit(Skin, smoothness: 0.2f);
        var root = new GameObject("Voter").transform;
        root.SetParent(transform, false);
        root.localPosition = new Vector3(-1.35f, 0f, -0.55f);
        root.localEulerAngles = new Vector3(0f, 28f, 0f);

        Stage.Solid(PrimitiveType.Sphere, root, new Vector3(0f, 1.60f, 0f), new Vector3(0.20f, 0.22f, 0.20f), body);
        Stage.Solid(PrimitiveType.Capsule, root, new Vector3(0f, 1.20f, 0f), new Vector3(0.30f, 0.30f, 0.20f), body);
        Stage.Solid(PrimitiveType.Capsule, root, new Vector3(-0.21f, 1.18f, 0.02f), new Vector3(0.09f, 0.24f, 0.09f), body, new Vector3(0f, 0f, 8f));
        Stage.Solid(PrimitiveType.Capsule, root, new Vector3(0.21f, 1.18f, 0.02f), new Vector3(0.09f, 0.24f, 0.09f), body, new Vector3(0f, 0f, -8f));
        Stage.Solid(PrimitiveType.Capsule, root, new Vector3(-0.10f, 0.48f, 0f), new Vector3(0.11f, 0.46f, 0.11f), body);
        Stage.Solid(PrimitiveType.Capsule, root, new Vector3(0.10f, 0.48f, 0f), new Vector3(0.11f, 0.46f, 0.11f), body);
    }

    // ---------- navigation ----------
    void Update()
    {
        ReadInput();

        // Ease the camera towards the current step's viewpoint.
        current.position = Vector3.Lerp(current.position, desired.position, 1f - Mathf.Exp(-6f * Time.deltaTime));
        current.target = Vector3.Lerp(current.target, desired.target, 1f - Mathf.Exp(-6f * Time.deltaTime));
        view.transform.position = current.position;
        view.transform.LookAt(current.target);

        AnimatePacket();
    }

    void ReadInput()
    {
        var keyboard = Keyboard.current;
        if (keyboard == null) return;

        if (keyboard.rightArrowKey.wasPressedThisFrame || keyboard.spaceKey.wasPressedThisFrame ||
            keyboard.enterKey.wasPressedThisFrame || keyboard.downArrowKey.wasPressedThisFrame) Go(1);

        if (keyboard.leftArrowKey.wasPressedThisFrame || keyboard.backspaceKey.wasPressedThisFrame ||
            keyboard.upArrowKey.wasPressedThisFrame) Go(-1);

        if (keyboard.rKey.wasPressedThisFrame) ShowStep(0, instant: false);
    }

    void AnimatePacket()
    {
        var step = steps[index];
        if (step.packet == 0)
        {
            packetCube.gameObject.SetActive(false);
            return;
        }

        packetCube.gameObject.SetActive(true);
        packetProgress = Mathf.Repeat(packetProgress + Time.deltaTime * 0.6f, 1f);

        Vector3 from = step.packet == 1 ? CardCentre : ScreenCentre;
        Vector3 to = step.packet == 1 ? ScreenCentre : CardCentre;

        Vector3 position = Vector3.Lerp(from, to, packetProgress);
        position.y += Mathf.Sin(packetProgress * Mathf.PI) * 0.14f;   // a gentle arc
        packetCube.position = position;
        packetCube.localEulerAngles = new Vector3(packetProgress * 360f, packetProgress * 260f, 0f);

        Color tone = step.tone == 2 ? Good : Accent;
        packetMaterial.SetColor("_BaseColor", tone);
        packetMaterial.SetColor("_EmissionColor", tone * 2.5f);
    }

    void Go(int direction)
    {
        int next = Mathf.Clamp(index + direction, 0, steps.Length - 1);
        if (next == index) return;
        ShowStep(next, instant: false);
    }

    /// Also the entry point for the documentation screenshot pass, which needs the camera
    /// to arrive immediately rather than easing into place.
    public void ShowStep(int step, bool instant)
    {
        index = Mathf.Clamp(step, 0, steps.Length - 1);
        desired = ViewpointFor(steps[index].view);
        packetProgress = 0.5f;

        cardGlow.gameObject.SetActive(steps[index].highlightCard);

        if (instant)
        {
            current = desired;
            view.transform.position = current.position;
            view.transform.LookAt(current.target);
            AnimatePacket();
        }
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

        DrawTitle(step, step.tone == 0 ? new Color(0.90f, 0.93f, 0.97f) : tone);
        DrawCard(step, step.tone == 2 ? Good : Accent);
        DrawScreen(step, tone);
        DrawPacketLabel(step, tone);
        DrawFooter(step);
    }

    void DrawTitle(Step step, Color tone)
    {
        GUI.Label(new Rect(0f, Screen.height * 0.028f, Screen.width, Screen.height * 0.075f),
            step.title, Label(FontSize(0.033f), tone, TextAnchor.UpperCenter, bold: true));
    }

    void DrawCard(Step step, Color tone)
    {
        Rect card = Stage.ScreenRect(cardPanel, view);
        if (card.width < 60f) return;      // too far away to read; skip rather than draw noise

        float pad = card.width * 0.055f;
        float iconSize = card.width * 0.085f;
        float iconX = card.x + pad;
        float textX = iconX + iconSize + card.width * 0.035f;
        float textWidth = card.xMax - pad - textX;

        Color faded = new Color(Ink.r, Ink.g, Ink.b, 0.62f);
        float y = card.y + pad * 0.9f;

        float headerHeight = card.height * 0.075f;
        GUI.Label(new Rect(iconX, y, card.width - pad * 2f, headerHeight), "STIMMRECHTSAUSWEIS",
            Label(Mathf.RoundToInt(card.height * 0.044f), Ink, bold: true));
        y += headerHeight;

        float urlHeight = card.height * 0.06f;
        GUI.Label(new Rect(iconX, y, card.width - pad * 2f, urlHeight), "https://demo.evoting.ch",
            Label(Mathf.RoundToInt(card.height * 0.033f), faded));
        y += urlHeight + pad * 0.4f;

        // Sizes follow the card's on-screen height, so the text stays proportional as the
        // camera moves closer or further away.
        int labelSize = Mathf.RoundToInt(card.height * 0.029f);
        int valueSize = Mathf.RoundToInt(card.height * 0.039f);
        int questionSize = Mathf.RoundToInt(card.height * 0.027f);
        int codeSize = Mathf.RoundToInt(card.height * 0.031f);

        float labelHeight = labelSize * 1.5f;
        float valueHeight = valueSize * 1.5f;
        float questionHeight = questionSize * 1.45f;
        float codeHeight = codeSize * 1.5f;
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

            Color previous = GUI.color;
            GUI.color = active ? OnPaper : new Color(Ink.r, Ink.g, Ink.b, 0.70f);
            GUI.DrawTexture(new Rect(iconX, y + (rowHeight - iconSize) / 2f, iconSize, iconSize),
                IconFor(row), ScaleMode.ScaleToFit);
            GUI.color = previous;

            GUI.Label(new Rect(textX, y, textWidth, labelHeight),
                RowLabel[row] + "   ·   " + RowGerman[row], Label(labelSize, ink));

            if (row == 1)
            {
                float codeY = y + labelHeight;
                for (int question = 0; question < QuestionCodes.Length; question++)
                {
                    GUI.Label(new Rect(textX, codeY, textWidth, questionHeight), QuestionText[question],
                        Label(questionSize, ink));
                    codeY += questionHeight;

                    for (int option = 0; option < 3; option++)
                    {
                        bool picked = step.showChoiceCodes && Selected[question] == option;
                        GUI.Label(new Rect(textX + textWidth * 0.335f * option, codeY, textWidth * 0.335f, codeHeight),
                            QuestionCodes[question][option],
                            Label(picked ? Mathf.RoundToInt(codeSize * 1.1f) : codeSize,
                                  picked ? OnPaper : ink, bold: picked));
                    }
                    codeY += codeHeight;
                }
            }
            else
            {
                string value = row == 0 ? InitializationCode : row == 2 ? ConfirmationCode : FinalizationCode;
                GUI.Label(new Rect(textX, y + labelHeight, textWidth, valueHeight), value,
                    Label(valueSize, active ? Ink : new Color(Ink.r, Ink.g, Ink.b, 0.85f), bold: active));
            }

            y += rowHeight + rowGap;
        }
    }

    static Texture2D IconFor(int row)
    {
        switch (row)
        {
            case 0: return Symbols.Triangle;
            case 1: return Symbols.Diamond;
            case 2: return Symbols.Pentagon;
            default: return Symbols.Star;
        }
    }

    void DrawScreen(Step step, Color tone)
    {
        Rect screen = Stage.ScreenRect(screenPanel, view);
        if (screen.width < 60f) return;

        float pad = screen.width * 0.035f;
        float sidebarWidth = screen.width * 0.36f;
        int sidebarSize = Mathf.RoundToInt(screen.height * 0.045f);

        var sidebar = new Rect(screen.x + pad, screen.y + pad, sidebarWidth, screen.height - pad * 2f);
        float itemHeight = sidebar.height / PortalSteps.Length;

        for (int i = 0; i < PortalSteps.Length; i++)
        {
            bool currentStep = step.portalStep == i + 1;
            bool done = step.portalStep > i + 1;
            Color colour = currentStep ? Accent : done ? Fade(Good, 0.85f) : Fade(Dim, 0.5f);

            GUI.Label(new Rect(sidebar.x, sidebar.y + i * itemHeight, sidebar.width, itemHeight),
                PortalSteps[i], Label(sidebarSize, colour, wrap: true, bold: currentStep));
        }

        var content = new Rect(screen.x + pad * 2f + sidebarWidth, screen.y + pad,
                               screen.width - sidebarWidth - pad * 3f, screen.height - pad * 2f);

        if (step.highlightScreen) Fill(content, Fade(tone, 0.14f));

        float lineHeight = content.height / 7f;
        int lineSize = Mathf.RoundToInt(screen.height * 0.055f);

        for (int i = 0; i < step.screen.Length && i < 7; i++)
        {
            bool emphasis = step.highlightScreen && i == 1;
            GUI.Label(new Rect(content.x + pad * 0.5f, content.y + i * lineHeight, content.width - pad, lineHeight),
                step.screen[i],
                Label(emphasis ? Mathf.RoundToInt(lineSize * 1.7f) : lineSize,
                      emphasis ? tone : ScreenInk, bold: emphasis));
        }
    }

    void DrawPacketLabel(Step step, Color tone)
    {
        if (step.packet == 0 || !packetCube.gameObject.activeSelf) return;

        Vector3 point = view.WorldToScreenPoint(packetCube.position + new Vector3(0f, 0.09f, 0f));
        if (point.z <= 0f) return;

        var area = new Rect(point.x - Screen.width * 0.12f, Screen.height - point.y - 20f,
                            Screen.width * 0.24f, 30f);
        GUI.Label(area, step.packetLabel, Label(FontSize(0.017f), tone, TextAnchor.MiddleCenter));
    }

    void DrawFooter(Step step)
    {
        float top = Screen.height - Mathf.Max(120f, Screen.height * 0.20f);

        Fill(new Rect(0f, top, Screen.width, Screen.height - top), new Color(Room.r, Room.g, Room.b, 0.96f));
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
}
