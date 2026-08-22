using UnityEngine;

/// Builds the props for the 3D walkthrough out of Unity primitives and code-generated
/// materials, so the scene needs no imported models, textures or prefabs.
///
/// The project renders with the Universal Render Pipeline, so materials are created against
/// URP shaders; the Built-in "Standard" shader would render magenta here.
public static class Stage
{
    static Shader lit;
    static Shader unlit;

    public static Material Lit(Color colour, float smoothness = 0.25f, float metallic = 0f)
    {
        if (lit == null) lit = Shader.Find("Universal Render Pipeline/Lit");
        var material = new Material(lit != null ? lit : Shader.Find("Sprites/Default"));
        Tint(material, colour);
        material.SetFloat("_Smoothness", smoothness);
        material.SetFloat("_Metallic", metallic);
        return material;
    }

    public static Material Unlit(Color colour)
    {
        if (unlit == null) unlit = Shader.Find("Universal Render Pipeline/Unlit");
        var material = new Material(unlit != null ? unlit : Shader.Find("Sprites/Default"));
        Tint(material, colour);
        return material;
    }

    public static Material Glowing(Color colour, float intensity = 2.5f)
    {
        var material = Lit(colour);
        material.EnableKeyword("_EMISSION");
        material.SetColor("_EmissionColor", colour * intensity);
        material.globalIlluminationFlags = MaterialGlobalIlluminationFlags.RealtimeEmissive;
        return material;
    }

    static void Tint(Material material, Color colour)
    {
        // URP uses _BaseColor; setting _Color too keeps fallback shaders working.
        if (material.HasProperty("_BaseColor")) material.SetColor("_BaseColor", colour);
        if (material.HasProperty("_Color")) material.SetColor("_Color", colour);

        if (colour.a < 1f && material.HasProperty("_Surface"))
        {
            material.SetFloat("_Surface", 1f);           // transparent
            material.SetFloat("_Blend", 0f);             // alpha
            material.renderQueue = (int)UnityEngine.Rendering.RenderQueue.Transparent;
            material.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
        }
    }

    /// Creates a primitive with no collider — nothing in this scene is simulated.
    public static Transform Solid(PrimitiveType type, Transform parent, Vector3 position,
                                  Vector3 scale, Material material, Vector3 euler = default)
    {
        var item = GameObject.CreatePrimitive(type);
        item.transform.SetParent(parent, false);
        item.transform.localPosition = position;
        item.transform.localEulerAngles = euler;
        item.transform.localScale = scale;
        item.GetComponent<Renderer>().sharedMaterial = material;

        var collider = item.GetComponent<Collider>();
        if (collider != null) Object.Destroy(collider);

        return item.transform;
    }

    /// A flat panel facing the camera, which sits down the -Z axis looking towards +Z.
    /// Unity's Quad faces +Z, so it is turned around to face the viewer.
    public static Transform Panel(Transform parent, Vector3 position, Vector2 size, Material material)
    {
        return Solid(PrimitiveType.Quad, parent, position, new Vector3(size.x, size.y, 1f),
                     material, new Vector3(0f, 180f, 0f));
    }

    /// Projects a quad's four corners to screen space and returns the rectangle covering them.
    /// This is what lets text be laid out in pixels over a panel that moves in 3D: as the
    /// camera dollies between viewpoints, the rectangle follows the panel automatically.
    public static Rect ScreenRect(Transform quad, Camera camera)
    {
        float minX = float.MaxValue, minY = float.MaxValue;
        float maxX = float.MinValue, maxY = float.MinValue;

        for (int corner = 0; corner < 4; corner++)
        {
            var local = new Vector3((corner & 1) == 0 ? -0.5f : 0.5f,
                                    (corner & 2) == 0 ? -0.5f : 0.5f, 0f);
            Vector3 point = camera.WorldToScreenPoint(quad.TransformPoint(local));

            minX = Mathf.Min(minX, point.x);
            maxX = Mathf.Max(maxX, point.x);
            minY = Mathf.Min(minY, point.y);
            maxY = Mathf.Max(maxY, point.y);
        }

        // GUI space has its origin at the top left; screen space has it at the bottom left.
        return new Rect(minX, Screen.height - maxY, maxX - minX, maxY - minY);
    }
}
