using UnityEngine;

/// The art for the walkthrough. The character and the coin are drawn pixel by pixel; the
/// furniture is assembled from pixel primitives, which keeps the larger shapes editable.
public static class PixelSprites
{
    // ---------- the voter ----------
    // 16 x 24, two frames. The second raises the arm holding the card, so the character can
    // gesture at whichever thing the current step is about.

    static readonly string[] VoterIdle =
    {
        "................",
        "....KKKKKKK.....",
        "...KHHHHHHHK....",
        "...KHHHHHHHK....",
        "...KhhhhhhhK....",
        "...KSSSSSSSK....",
        "...KSKSSSKSK....",
        "...KSSSSSSSK....",
        "...KsSSSSSsK....",
        "....KSSSSSK.....",
        ".....KKKKK......",
        "...KKBBBBBKK....",
        "..KBBBBBBBBBK...",
        "..KBBBBBBBBBK...",
        ".KSBBBBBBBBBSK..",
        ".KSBbbbbbbbBSK..",
        ".KSKBBBBBBBKSK..",
        "..KKBBBBBBBKK...",
        "....KPPPPPK.....",
        "....KPPPPPK.....",
        "....KPP.PPK.....",
        "....KPP.PPK.....",
        "...KKKK.KKKK....",
        "...KKKK.KKKK....",
    };

    static readonly string[] VoterPointing =
    {
        "................",
        "....KKKKKKK.....",
        "...KHHHHHHHK....",
        "...KHHHHHHHK....",
        "...KhhhhhhhK....",
        "...KSSSSSSSK....",
        "...KSKSSSKSK....",
        "...KSSSSSSSK....",
        "...KsSSSSSsK....",
        "....KSSSSSK.....",
        "..KS.KKKKK......",
        "..KSKKBBBBBKK...",
        "..KSKBBBBBBBBK..",
        "...KKBBBBBBBBK..",
        "....KBBBBBBBBSK.",
        "....KBbbbbbbBSK.",
        "....KBBBBBBBKSK.",
        "....KBBBBBBBKK..",
        "....KPPPPPK.....",
        "....KPPPPPK.....",
        "....KPP.PPK.....",
        "....KPP.PPK.....",
        "...KKKK.KKKK....",
        "...KKKK.KKKK....",
    };

    // ---------- the travelling packet ----------
    // 8 x 8, four frames of a spinning coin: the classic way to show something moving.

    static readonly string[][] CoinFrames =
    {
        new[] { "..KKKK..", ".KYYYYK.", "KYYyyYYK", "KYyKKyYK", "KYyKKyYK", "KYYyyYYK", ".KYYYYK.", "..KKKK.." },
        new[] { "...KK...", "..KYYK..", ".KYYyYK.", ".KYyKyK.", ".KYyKyK.", ".KYYyYK.", "..KYYK..", "...KK..." },
        new[] { "...KK...", "...KK...", "..KYK...", "..KyK...", "..KyK...", "..KYK...", "...KK...", "...KK..." },
        new[] { "...KK...", "..KYK...", ".KYYyK..", ".KYyyK..", ".KYyyK..", ".KYYyK..", "..KYK...", "...KK..." },
    };

    public static Sprite[] Coin()
    {
        var frames = new Sprite[CoinFrames.Length];
        for (int i = 0; i < CoinFrames.Length; i++) frames[i] = PixelArt.FromRows(CoinFrames[i]);
        return frames;
    }

    public static Sprite[] Voter()
    {
        return new[] { PixelArt.FromRows(VoterIdle), PixelArt.FromRows(VoterPointing) };
    }

    // ---------- furniture ----------

    /// The printed voting card: paper with a border and a torn-off stub along the top.
    public static Sprite Card(int width, int height)
    {
        var pixels = PixelArt.NewCanvas(width, height);

        PixelArt.Rect(pixels, width, 1, 0, width - 2, height, 'W');
        PixelArt.Rect(pixels, width, 0, 1, width, height - 2, 'W');

        // A shaded right and bottom edge, so the card reads as a physical sheet.
        PixelArt.Rect(pixels, width, width - 2, 1, 1, height - 3, 'w');
        PixelArt.Rect(pixels, width, 1, 0, width - 2, 1, 'w');

        PixelArt.Border(pixels, width, 0, 0, width, height, 'K');

        // The perforated stub across the top of a Swiss voting card.
        PixelArt.Rect(pixels, width, 2, height - 12, width - 4, 1, 'w');
        PixelArt.Dither(pixels, width, 2, height - 12, width - 4, 1, 'K');

        return PixelArt.FromCanvas(pixels, width, height);
    }

    /// A CRT-ish monitor: bezel, screen, stand and base.
    public static Sprite Monitor(int width, int height)
    {
        var pixels = PixelArt.NewCanvas(width, height);

        int standHeight = 10;
        int bezelHeight = height - standHeight;

        PixelArt.Rect(pixels, width, 0, standHeight, width, bezelHeight, 'D');
        PixelArt.Rect(pixels, width, 1, standHeight + 1, width - 2, bezelHeight - 2, 'd');
        PixelArt.Rect(pixels, width, 4, standHeight + 4, width - 8, bezelHeight - 9, 'N');
        PixelArt.Border(pixels, width, 3, standHeight + 3, width - 6, bezelHeight - 7, 'K');
        PixelArt.Border(pixels, width, 0, standHeight, width, bezelHeight, 'K');

        // Power light.
        PixelArt.Rect(pixels, width, width - 8, standHeight + 2, 2, 2, 'G');

        int stemWidth = 12;
        PixelArt.Rect(pixels, width, width / 2 - stemWidth / 2, 4, stemWidth, standHeight - 3, 'D');
        PixelArt.Border(pixels, width, width / 2 - stemWidth / 2, 4, stemWidth, standHeight - 3, 'K');

        int baseWidth = width / 2;
        PixelArt.Rect(pixels, width, width / 2 - baseWidth / 2, 0, baseWidth, 5, 'D');
        PixelArt.Border(pixels, width, width / 2 - baseWidth / 2, 0, baseWidth, 5, 'K');

        return PixelArt.FromCanvas(pixels, width, height);
    }

    /// The desk the monitor and card stand on.
    public static Sprite Desk(int width, int height)
    {
        var pixels = PixelArt.NewCanvas(width, height);

        PixelArt.Rect(pixels, width, 0, height - 6, width, 6, 'R');
        PixelArt.Rect(pixels, width, 0, height - 8, width, 2, 'r');
        PixelArt.Dither(pixels, width, 0, height - 6, width, 2, 'r');

        // Legs.
        PixelArt.Rect(pixels, width, 6, 0, 6, height - 8, 'r');
        PixelArt.Rect(pixels, width, width - 12, 0, 6, height - 8, 'r');

        PixelArt.Border(pixels, width, 0, height - 8, width, 8, 'K');
        PixelArt.Border(pixels, width, 6, 0, 6, height - 7, 'K');
        PixelArt.Border(pixels, width, width - 12, 0, 6, height - 7, 'K');

        return PixelArt.FromCanvas(pixels, width, height);
    }

    /// A brick tile for the back wall, in the spirit of the platformers this style comes from.
    public static Sprite Brick(int size)
    {
        var pixels = PixelArt.NewCanvas(size, size);

        PixelArt.Rect(pixels, size, 0, 0, size, size, 'k');
        PixelArt.Rect(pixels, size, 0, size / 2, size, 1, 'K');
        PixelArt.Rect(pixels, size, 0, 0, size, 1, 'K');
        PixelArt.Rect(pixels, size, size / 2, size / 2, 1, size / 2, 'K');
        PixelArt.Rect(pixels, size, 0, 0, 1, size / 2, 'K');

        return PixelArt.FromCanvas(pixels, size, size);
    }

    /// The floor: a solid band with a lighter top edge, like a platformer ground tile.
    public static Sprite Ground(int width, int height)
    {
        var pixels = PixelArt.NewCanvas(width, height);

        PixelArt.Rect(pixels, width, 0, 0, width, height, 'd');
        PixelArt.Rect(pixels, width, 0, height - 2, width, 2, 'D');
        PixelArt.Dither(pixels, width, 0, height - 6, width, 4, 'D');

        return PixelArt.FromCanvas(pixels, width, height);
    }

    /// A plain rectangle, used for highlight bands behind text.
    public static Sprite Block(char key)
    {
        var pixels = PixelArt.NewCanvas(1, 1, key);
        return PixelArt.FromCanvas(pixels, 1, 1);
    }
}
