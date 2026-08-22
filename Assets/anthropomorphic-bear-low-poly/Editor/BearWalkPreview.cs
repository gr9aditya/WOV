// Renders PNG frames of the generated walk clip so the result can be inspected
// without opening the editor.
//
// The bear is translated forward at the clip matching ground speed over a
// checkered floor. If the stride and the ground speed agree, the planted foot
// sits still on the checks; any mismatch shows up immediately as skating.

using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

public static class BearWalkPreview
{
    const string ClipPath   = "Assets/anthropomorphic-bear-low-poly/Animations/BearWalk.anim";
    const string PrefabPath = "Assets/anthropomorphic-bear-low-poly/Animations/BearWalking.prefab";
    const int    Frames     = 24;
    const int    Width      = 420;
    const int    Height     = 460;

    [MenuItem("Bear/Render Preview")]
    public static void Render()
    {
        string outDir = Path.Combine(Directory.GetCurrentDirectory(), "PreviewFrames");
        Directory.CreateDirectory(outDir);

        EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        var clip = AssetDatabase.LoadAssetAtPath<AnimationClip>(ClipPath);
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
        if (clip == null || prefab == null) { Debug.LogError("BEARPREV: clip or prefab missing"); return; }

        var go = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
        go.transform.position = Vector3.zero;

        // measure the bear so the camera and floor can be sized from it
        var rend = go.GetComponentInChildren<SkinnedMeshRenderer>();
        Bounds b = rend.bounds;
        float legLen = Vector3.Distance(
            FindDeep(go.transform, "thigh_stretch.l").position,
            FindDeep(go.transform, "foot.l").position);
        float speed = BearWalkGenerator.MatchingSpeed(legLen);

        // Skinned bounds are padded, which would float the bear above the floor.
        // Bake the rest mesh and use its true lowest vertex instead.
        var restMesh = new Mesh();
        rend.BakeMesh(restMesh);
        float groundY = float.MaxValue;
        var l2w = rend.transform.localToWorldMatrix;
        foreach (var v in restMesh.vertices) groundY = Mathf.Min(groundY, l2w.MultiplyPoint3x4(v).y);
        Object.DestroyImmediate(restMesh);
        Debug.Log($"BEARPREV: bounds={b.size} groundY={groundY:F3} legLen={legLen:F3} speed={speed:F3}");

        BuildFloor(groundY, b.size.magnitude * 6f);
        BuildLights();

        var cam = new GameObject("Cam").AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = new Color(0.10f, 0.11f, 0.14f);
        cam.fieldOfView = 32f;
        cam.nearClipPlane = 0.01f;
        cam.farClipPlane = 200f;

        // frame the full height with headroom, so the feet are never cropped
        float dist = (b.size.y * 1.22f) / (2f * Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad));
        Vector3 focus = new Vector3(0f, groundY + b.size.y * 0.50f, 0f);

        RenderRest(go, cam, new Vector3(1f, 0.10f, 0f), dist, focus, outDir, "rest_side");
        RenderRest(go, cam, new Vector3(0.75f, 0.22f, 0.85f), dist, focus, outDir, "rest_front34");
        RenderPass(go, clip, cam, "side", new Vector3(1f, 0.10f, 0f), dist, focus, speed, outDir);
        RenderPass(go, clip, cam, "front34", new Vector3(0.75f, 0.22f, 0.85f), dist, focus, speed, outDir);

        Debug.Log("BEARPREV: DONE " + outDir);
    }

    /// The imported rest pose, unanimated — the reference the walk is layered on.
    static void RenderRest(GameObject go, Camera cam, Vector3 dir, float dist,
                           Vector3 focus, string outDir, string tag)
    {
        var rt = new RenderTexture(Width, Height, 24, RenderTextureFormat.ARGB32) { antiAliasing = 8 };
        cam.targetTexture = rt;
        var tex = new Texture2D(Width, Height, TextureFormat.RGB24, false);

        go.transform.position = Vector3.zero;
        cam.transform.position = focus + dir.normalized * dist;
        cam.transform.LookAt(focus);
        cam.Render();
        RenderTexture.active = rt;
        tex.ReadPixels(new Rect(0, 0, Width, Height), 0, 0);
        tex.Apply();
        RenderTexture.active = null;
        File.WriteAllBytes(Path.Combine(outDir, tag + ".png"), tex.EncodeToPNG());

        cam.targetTexture = null;
        Object.DestroyImmediate(rt);
        Object.DestroyImmediate(tex);
    }

    static void RenderPass(GameObject go, AnimationClip clip, Camera cam, string tag,
                           Vector3 dir, float dist, Vector3 focus, float speed, string outDir)
    {
        var rt = new RenderTexture(Width, Height, 24, RenderTextureFormat.ARGB32) { antiAliasing = 8 };
        cam.targetTexture = rt;
        var tex = new Texture2D(Width, Height, TextureFormat.RGB24, false);

        Transform ftL = FindDeep(go.transform, "foot.l");
        Transform ftR = FindDeep(go.transform, "foot.r");
        float sepMin = float.MaxValue, sepMax = float.MinValue;

        for (int i = 0; i < Frames; i++)
        {
            float t = clip.length * i / Frames;
            float travel = speed * t;

            go.transform.position = Vector3.zero;
            clip.SampleAnimation(go, t);
            // sampling drives the root bone, so apply the forward travel after it
            go.transform.position = new Vector3(0f, 0f, travel);

            float sep = ftL.position.z - ftR.position.z;
            sepMin = Mathf.Min(sepMin, sep);
            sepMax = Mathf.Max(sepMax, sep);

            Vector3 f = focus + Vector3.forward * travel;
            cam.transform.position = f + dir.normalized * dist;
            cam.transform.LookAt(f);

            cam.Render();
            RenderTexture.active = rt;
            tex.ReadPixels(new Rect(0, 0, Width, Height), 0, 0);
            tex.Apply();
            RenderTexture.active = null;
            File.WriteAllBytes(Path.Combine(outDir, $"{tag}_{i:00}.png"), tex.EncodeToPNG());
        }

        // if sampling silently failed, the feet never separate and this is ~0
        Debug.Log($"BEARPREV: [{tag}] foot separation range = {(sepMax - sepMin):F4}  [want ~0.45]");

        cam.targetTexture = null;
        Object.DestroyImmediate(rt);
        Object.DestroyImmediate(tex);
    }

    static void BuildFloor(float y, float size)
    {
        var floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
        floor.transform.position = new Vector3(0f, y, 0f);
        floor.transform.localScale = Vector3.one * (size / 10f);

        // a checker keeps ground motion visible, so foot sliding cannot hide
        const int N = 512, Cell = 32;
        var tex = new Texture2D(N, N);
        var a = new Color(0.34f, 0.35f, 0.38f);
        var c = new Color(0.26f, 0.27f, 0.30f);
        for (int x = 0; x < N; x++)
            for (int y2 = 0; y2 < N; y2++)
                tex.SetPixel(x, y2, ((x / Cell + y2 / Cell) % 2 == 0) ? a : c);
        tex.Apply();
        tex.wrapMode = TextureWrapMode.Repeat;

        var mat = new Material(Shader.Find("Standard"));
        mat.mainTexture = tex;
        mat.mainTextureScale = Vector2.one * (size / 2f);
        mat.SetFloat("_Glossiness", 0.05f);
        floor.GetComponent<Renderer>().sharedMaterial = mat;
    }

    static void BuildLights()
    {
        var key = new GameObject("Key").AddComponent<Light>();
        key.type = LightType.Directional;
        key.intensity = 1.5f;
        key.transform.rotation = Quaternion.Euler(38f, 145f, 0f);

        var fill = new GameObject("Fill").AddComponent<Light>();
        fill.type = LightType.Directional;
        fill.intensity = 0.55f;
        fill.shadows = LightShadows.None;
        fill.color = new Color(0.8f, 0.85f, 1f);
        fill.transform.rotation = Quaternion.Euler(15f, -55f, 0f);

        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.30f, 0.31f, 0.36f);
    }

    static Transform FindDeep(Transform root, string name)
    {
        foreach (var t in root.GetComponentsInChildren<Transform>())
            if (t.name == name) return t;
        return null;
    }
}
