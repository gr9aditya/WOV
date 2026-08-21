using UnityEngine;

/// Minimal procedural sprites, so the project needs no imported art.
public static class Shapes
{
    const int Size = 64;

    public static Sprite Box(Color color)
    {
        return Build(color, (x, y) => true);
    }

    public static Sprite RoundedBox(Color color)
    {
        return Build(color, (x, y) =>
        {
            const float r = 0.08f;
            float dx = Mathf.Max(0f, Mathf.Abs(x - 0.5f) - (0.5f - r));
            float dy = Mathf.Max(0f, Mathf.Abs(y - 0.5f) - (0.5f - r));
            return dx * dx + dy * dy <= r * r;
        });
    }

    public static Sprite Circle(Color color)
    {
        return Build(color, (x, y) =>
        {
            float dx = x - 0.5f, dy = y - 0.5f;
            return dx * dx + dy * dy <= 0.25f;
        });
    }

    /// Triangle pointing up. Rotate the transform to aim it elsewhere.
    public static Sprite Triangle(Color color)
    {
        return Build(color, (x, y) => y <= 1f - Mathf.Abs(x - 0.5f) * 2f);
    }

    /// The four voting card symbols, drawn as the printed card shows them.
    public static Sprite Diamond(Color color)
    {
        return Build(color, (x, y) => Mathf.Abs(x - 0.5f) + Mathf.Abs(y - 0.5f) <= 0.5f);
    }

    public static Sprite Pentagon(Color color)
    {
        return Build(color, Polygon(5, 0.5f, 0.5f));
    }

    public static Sprite Star(Color color)
    {
        return Build(color, Polygon(10, 0.5f, 0.21f));
    }

    /// Point-in-polygon test for a regular (or star) polygon centred in the sprite.
    static System.Func<float, float, bool> Polygon(int points, float outer, float inner)
    {
        var corners = new Vector2[points];
        for (int i = 0; i < points; i++)
        {
            float angle = Mathf.PI / 2f + i * 2f * Mathf.PI / points;
            float radius = (points > 5 && i % 2 == 1) ? inner : outer;
            corners[i] = new Vector2(0.5f + Mathf.Cos(angle) * radius, 0.5f + Mathf.Sin(angle) * radius);
        }

        return (x, y) =>
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
        };
    }

    static Sprite Build(Color color, System.Func<float, float, bool> inside)
    {
        var texture = new Texture2D(Size, Size, TextureFormat.RGBA32, false)
        {
            filterMode = FilterMode.Bilinear,
            wrapMode = TextureWrapMode.Clamp
        };

        var pixels = new Color32[Size * Size];
        var clear = new Color32(0, 0, 0, 0);

        for (int py = 0; py < Size; py++)
        {
            for (int px = 0; px < Size; px++)
            {
                int hits = 0;
                for (int sy = 0; sy < 2; sy++)
                {
                    for (int sx = 0; sx < 2; sx++)
                    {
                        if (inside((px + 0.25f + sx * 0.5f) / Size, (py + 0.25f + sy * 0.5f) / Size)) hits++;
                    }
                }

                var pixel = color;
                pixel.a *= hits / 4f;
                pixels[py * Size + px] = hits == 0 ? clear : (Color32)pixel;
            }
        }

        texture.SetPixels32(pixels);
        texture.Apply();
        return Sprite.Create(texture, new Rect(0, 0, Size, Size), new Vector2(0.5f, 0.5f), Size);
    }
}
