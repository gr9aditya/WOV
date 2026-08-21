using UnityEngine;

/// Builds all the sprites in code, so the project needs no imported images.
public static class Art
{
    const int Size = 64;
    const float PixelsPerUnit = 64f;

    public static Sprite Circle(Color color)
    {
        return Build(color, (x, y) =>
        {
            float dx = x - 0.5f, dy = y - 0.5f;
            return dx * dx + dy * dy <= 0.25f;
        });
    }

    public static Sprite RoundedBox(Color color)
    {
        return Build(color, (x, y) =>
        {
            // Squarish paddle with soft corners.
            float dx = Mathf.Max(0f, Mathf.Abs(x - 0.5f) - 0.30f);
            float dy = Mathf.Max(0f, Mathf.Abs(y - 0.5f) - 0.14f);
            return dx * dx + dy * dy <= 0.2f * 0.2f;
        });
    }

    public static Sprite Star(Color color)
    {
        Vector2[] points = new Vector2[10];
        for (int i = 0; i < 10; i++)
        {
            float angle = Mathf.PI / 2f + i * Mathf.PI / 5f;
            float radius = (i % 2 == 0) ? 0.5f : 0.21f;
            points[i] = new Vector2(0.5f + Mathf.Cos(angle) * radius, 0.5f + Mathf.Sin(angle) * radius);
        }
        return Build(color, (x, y) => InsidePolygon(points, x, y));
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
                // 2x2 supersample so the edges are not jagged.
                int hits = 0;
                for (int sy = 0; sy < 2; sy++)
                {
                    for (int sx = 0; sx < 2; sx++)
                    {
                        float u = (px + 0.25f + sx * 0.5f) / Size;
                        float v = (py + 0.25f + sy * 0.5f) / Size;
                        if (inside(u, v)) hits++;
                    }
                }

                var pixel = color;
                pixel.a *= hits / 4f;
                pixels[py * Size + px] = hits == 0 ? clear : (Color32)pixel;
            }
        }

        texture.SetPixels32(pixels);
        texture.Apply();

        return Sprite.Create(texture, new Rect(0, 0, Size, Size), new Vector2(0.5f, 0.5f), PixelsPerUnit);
    }

    static bool InsidePolygon(Vector2[] points, float x, float y)
    {
        bool inside = false;
        for (int i = 0, j = points.Length - 1; i < points.Length; j = i++)
        {
            if ((points[i].y > y) != (points[j].y > y) &&
                x < (points[j].x - points[i].x) * (y - points[i].y) / (points[j].y - points[i].y) + points[i].x)
            {
                inside = !inside;
            }
        }
        return inside;
    }
}
