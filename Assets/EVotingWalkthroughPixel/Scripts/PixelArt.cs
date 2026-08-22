using System.Collections.Generic;
using UnityEngine;

/// Builds pixel-art sprites in code. Art is authored as rows of characters, one character per
/// pixel, mapped through a palette — the same way sprites were drawn for 8- and 16-bit consoles.
///
/// Everything uses point filtering and integer pixel sizes, so pixels stay hard-edged instead of
/// being blurred by bilinear sampling.
public static class PixelArt
{
    /// One art pixel is this many world units. The camera is sized to match, so a sprite pixel
    /// lands on a whole number of screen pixels at 16:9.
    public const float PixelsPerUnit = 16f;

    /// The palette used by every sprite in this project: a small, deliberately limited set.
    public static readonly Dictionary<char, Color32> Palette = new Dictionary<char, Color32>
    {
        { '.', new Color32(0, 0, 0, 0) },            // transparent
        { 'K', new Color32(26, 22, 38, 255) },       // outline
        { 'k', new Color32(48, 44, 68, 255) },       // soft outline
        { 'S', new Color32(255, 205, 165, 255) },    // skin
        { 's', new Color32(214, 158, 120, 255) },    // skin shadow
        { 'H', new Color32(196, 62, 55, 255) },      // cap
        { 'h', new Color32(140, 38, 38, 255) },      // cap shadow
        { 'B', new Color32(64, 122, 200, 255) },     // shirt
        { 'b', new Color32(42, 84, 148, 255) },      // shirt shadow
        { 'P', new Color32(72, 58, 108, 255) },      // trousers
        { 'W', new Color32(244, 244, 236, 255) },    // paper white
        { 'w', new Color32(206, 206, 196, 255) },    // paper shade
        { 'Y', new Color32(255, 190, 40, 255) },     // Swiss Post yellow
        { 'y', new Color32(206, 140, 20, 255) },     // yellow shade
        { 'G', new Color32(90, 200, 120, 255) },     // success green
        { 'D', new Color32(58, 62, 82, 255) },       // device body
        { 'd', new Color32(38, 41, 56, 255) },       // device shadow
        { 'N', new Color32(20, 28, 44, 255) },       // screen glass
        { 'R', new Color32(120, 78, 52, 255) },      // desk wood
        { 'r', new Color32(88, 56, 38, 255) },       // desk wood shadow
    };

    public static Sprite FromRows(string[] rows)
    {
        int height = rows.Length;
        int width = rows[0].Length;

        var texture = NewTexture(width, height);
        var pixels = new Color32[width * height];

        for (int y = 0; y < height; y++)
        {
            // Rows are written top-down, but texture memory runs bottom-up.
            string row = rows[height - 1 - y];
            for (int x = 0; x < width; x++)
            {
                char key = x < row.Length ? row[x] : '.';
                pixels[y * width + x] = Palette.TryGetValue(key, out var colour) ? colour : Palette['.'];
            }
        }

        texture.SetPixels32(pixels);
        texture.Apply();
        return ToSprite(texture);
    }

    /// A blank canvas to draw on with the helpers below.
    public static Color32[] NewCanvas(int width, int height, char fill = '.')
    {
        var pixels = new Color32[width * height];
        var colour = Palette[fill];
        for (int i = 0; i < pixels.Length; i++) pixels[i] = colour;
        return pixels;
    }

    public static void Rect(Color32[] pixels, int width, int x, int y, int w, int h, char key)
    {
        var colour = Palette[key];
        for (int py = y; py < y + h; py++)
        {
            for (int px = x; px < x + w; px++)
            {
                int index = py * width + px;
                if (px >= 0 && px < width && index >= 0 && index < pixels.Length) pixels[index] = colour;
            }
        }
    }

    /// A one-pixel outline, drawn inside the given rectangle.
    public static void Border(Color32[] pixels, int width, int x, int y, int w, int h, char key)
    {
        Rect(pixels, width, x, y, w, 1, key);
        Rect(pixels, width, x, y + h - 1, w, 1, key);
        Rect(pixels, width, x, y, 1, h, key);
        Rect(pixels, width, x + w - 1, y, 1, h, key);
    }

    /// Every other pixel, for the classic dithered shading between two tones.
    public static void Dither(Color32[] pixels, int width, int x, int y, int w, int h, char key)
    {
        var colour = Palette[key];
        for (int py = y; py < y + h; py++)
        {
            for (int px = x; px < x + w; px++)
            {
                if (((px + py) & 1) != 0) continue;
                int index = py * width + px;
                if (px >= 0 && px < width && index >= 0 && index < pixels.Length) pixels[index] = colour;
            }
        }
    }

    public static Sprite FromCanvas(Color32[] pixels, int width, int height)
    {
        var texture = NewTexture(width, height);
        texture.SetPixels32(pixels);
        texture.Apply();
        return ToSprite(texture);
    }

    static Texture2D NewTexture(int width, int height)
    {
        return new Texture2D(width, height, TextureFormat.RGBA32, false)
        {
            filterMode = FilterMode.Point,       // hard pixel edges
            wrapMode = TextureWrapMode.Clamp
        };
    }

    static Sprite ToSprite(Texture2D texture)
    {
        var sprite = Sprite.Create(texture, new UnityEngine.Rect(0, 0, texture.width, texture.height),
                                   new Vector2(0.5f, 0.5f), PixelsPerUnit, 0, SpriteMeshType.FullRect);
        return sprite;
    }
}
