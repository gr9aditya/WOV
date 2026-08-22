using UnityEngine;

/// The four symbols printed beside the codes on a Swiss Post voting card, generated as
/// textures. They are drawn rather than typed because the pentagon in particular has no
/// dependable glyph in Unity's default font.
public static class Symbols
{
    const int Size = 64;

    static Texture2D triangle, diamond, pentagon, star;

    public static Texture2D Triangle
    {
        get { return triangle != null ? triangle : (triangle = Build(3, 0.5f, 0.5f)); }
    }

    public static Texture2D Diamond
    {
        get { return diamond != null ? diamond : (diamond = Build(4, 0.5f, 0.5f)); }
    }

    public static Texture2D Pentagon
    {
        get { return pentagon != null ? pentagon : (pentagon = Build(5, 0.5f, 0.5f)); }
    }

    public static Texture2D Star
    {
        get { return star != null ? star : (star = Build(10, 0.5f, 0.21f)); }
    }

    /// Regular polygon when outer == inner, five-pointed star when points == 10 and inner is smaller.
    static Texture2D Build(int points, float outer, float inner)
    {
        var corners = new Vector2[points];
        for (int i = 0; i < points; i++)
        {
            float angle = Mathf.PI / 2f + i * 2f * Mathf.PI / points;
            float radius = (points > 5 && i % 2 == 1) ? inner : outer;
            corners[i] = new Vector2(0.5f + Mathf.Cos(angle) * radius, 0.5f + Mathf.Sin(angle) * radius);
        }

        var texture = new Texture2D(Size, Size, TextureFormat.RGBA32, false)
        {
            filterMode = FilterMode.Bilinear,
            wrapMode = TextureWrapMode.Clamp
        };

        var pixels = new Color32[Size * Size];
        var clear = new Color32(255, 255, 255, 0);

        for (int y = 0; y < Size; y++)
        {
            for (int x = 0; x < Size; x++)
            {
                // 2x2 supersampling keeps the edges smooth at any on-screen size.
                int hits = 0;
                for (int sampleY = 0; sampleY < 2; sampleY++)
                {
                    for (int sampleX = 0; sampleX < 2; sampleX++)
                    {
                        if (Inside(corners, (x + 0.25f + sampleX * 0.5f) / Size,
                                            (y + 0.25f + sampleY * 0.5f) / Size)) hits++;
                    }
                }

                pixels[y * Size + x] = hits == 0
                    ? clear
                    : new Color32(255, 255, 255, (byte)(255 * hits / 4));
            }
        }

        texture.SetPixels32(pixels);
        texture.Apply();
        return texture;
    }

    static bool Inside(Vector2[] corners, float x, float y)
    {
        bool inside = false;
        for (int i = 0, j = corners.Length - 1; i < corners.Length; j = i++)
        {
            if ((corners[i].y > y) != (corners[j].y > y) &&
                x < (corners[j].x - corners[i].x) * (y - corners[i].y) / (corners[j].y - corners[i].y) + corners[i].x)
            {
                inside = !inside;
            }
        }
        return inside;
    }
}
