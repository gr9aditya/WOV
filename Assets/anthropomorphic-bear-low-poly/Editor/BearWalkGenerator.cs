// Generates a looping walk cycle for the Anthropo Bear rig.
//
// The rig is an Auto-Rig Pro export, so bone local axes are arbitrary. Nothing
// here is expressed in bone-local terms: the character axes are measured from
// the rest pose, the legs are driven by two-bone IK against explicit world-space
// foot targets, and the upper body is posed with world-space rotation deltas
// whose signs are probed from the rig itself. That keeps the result independent
// of FBX-to-Unity axis conventions.
//
// The legs use IK rather than forward-kinematic angle tables so that the stance
// foot is genuinely planted: it holds a constant ground height and travels
// backwards at a constant rate, which is what makes the walk read as walking
// instead of skating.

using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

public static class BearWalkGenerator
{
    const string FbxPath    = "Assets/anthropomorphic-bear-low-poly/source/Anthropo Bear.fbx";
    const string ClipPath   = "Assets/anthropomorphic-bear-low-poly/Animations/BearWalk.anim";
    const string CtrlPath   = "Assets/anthropomorphic-bear-low-poly/Animations/BearWalk.controller";
    const string PrefabPath = "Assets/anthropomorphic-bear-low-poly/Animations/BearWalking.prefab";

    public const float CycleTime = 1.20f;  // seconds for a full stride (both feet)
    const int   Samples   = 36;     // poses baked per cycle
    const float FrameRate = 30f;

    // ------------------------------------------------------------- gait shape
    public const float Duty       = 0.62f;  // fraction of the cycle each foot is grounded
    public const float StrideFrac = 0.85f;  // stride length, as a fraction of leg length

    /// Ground speed the character must travel at for the planted foot not to slide.
    /// The stance foot moves back by `StrideFrac * legLen` over `Duty * CycleTime`.
    public static float MatchingSpeed(float legLen) => StrideFrac * legLen / (Duty * CycleTime);
    const float LiftFrac   = 0.17f;  // swing-foot clearance
    const float BobFrac    = 0.018f; // hip vertical amplitude
    const float SwayFrac   = 0.035f; // hip lateral amplitude
    const float CrouchFrac = 0.015f; // hip drop, keeps a visible knee bend

    // Foot pitch and toe bend, 8 evenly spaced keys over one leg cycle.
    // p=0 is heel strike. Positive pitch = toe down, positive toe = toe tip up.
    static readonly float[] KPitch = { -10f,   2f,   0f,   2f,   8f,  18f,  -2f,  -8f };
    static readonly float[] KToe   = {   0f,   0f,   0f,   6f,  22f,  10f,   0f,   0f };

    const float ArmSwing     = 28f;
    const float ElbowBase    = 22f;
    const float ElbowSwing   = 11f;
    const float ShoulderRoll = 4f;

    const float PelvisTwist = 6f;   // + = left hip forward
    const float PelvisRoll  = 4f;   // + = left hip up
    const float SpineLean   = 7f;   // constant forward lean
    const float SpineTwist  = 4f;   // counter-rotation
    const float HeadNod     = 3f;

    // -------------------------------------------------------------- plumbing
    class Bone
    {
        public Transform t;
        public string path;
        public Quaternion restLocal;
        public Quaternion restWorld;
        public Vector3 restLocalPos;
        public Quaternion pose = Quaternion.identity;  // world delta for this sample
        public Quaternion[] baked;
    }

    static Dictionary<string, Bone> bones;
    static Transform rigRoot;
    static Vector3 AxFwd, AxRight, AxUp;
    static int ikClamped;

    [MenuItem("Bear/Generate Walk Clip")]
    public static void Run()
    {
        var importer = AssetImporter.GetAtPath(FbxPath) as ModelImporter;
        if (importer == null) { Debug.LogError("BEARGEN: FBX not found at " + FbxPath); return; }
        if (importer.animationType != ModelImporterAnimationType.Generic || importer.optimizeGameObjects)
        {
            importer.animationType = ModelImporterAnimationType.Generic;
            importer.optimizeGameObjects = false;   // keep the transform hierarchy addressable
            importer.SaveAndReimport();
        }

        var src = AssetDatabase.LoadAssetAtPath<GameObject>(FbxPath);
        var inst = (GameObject)Object.Instantiate(src);
        inst.name = "BEARGEN_TEMP";
        try { Build(inst); }
        finally { Object.DestroyImmediate(inst); }
    }

    static void Build(GameObject inst)
    {
        rigRoot = inst.transform;
        bones = new Dictionary<string, Bone>();
        foreach (var t in inst.GetComponentsInChildren<Transform>())
        {
            if (t == rigRoot) continue;
            bones[t.name] = new Bone {
                t = t,
                path = AnimationUtility.CalculateTransformPath(t, rigRoot),
                restLocal = t.localRotation,
                restWorld = t.rotation,
                restLocalPos = t.localPosition,
            };
        }

        // ---- character frame, measured from the rest pose -------------------
        Transform root = B("root.x").t, head = B("head.x").t;
        Transform thL = B("thigh_stretch.l").t, thR = B("thigh_stretch.r").t;
        Transform shL = B("leg_stretch.l").t,   shR = B("leg_stretch.r").t;
        Transform ftL = B("foot.l").t, ftR = B("foot.r").t;
        Transform toL = B("toes_01.l").t, toR = B("toes_01.r").t;

        AxUp = Vector3.up;   // gravity defines up for ground work; the bear leans
        if (Vector3.Dot(head.position - root.position, AxUp) < 0f) AxUp = -AxUp;
        AxRight = Vector3.ProjectOnPlane(thR.position - thL.position, AxUp).normalized;
        AxFwd   = Vector3.Cross(AxRight, AxUp).normalized;
        Vector3 toeDir = ((toL.position - ftL.position) + (toR.position - ftR.position)).normalized;
        if (Vector3.Dot(AxFwd, toeDir) < 0f) AxFwd = -AxFwd;    // the feet decide which way is front
        AxRight = Vector3.Cross(AxUp, AxFwd).normalized;

        float legLen = Vector3.Distance(thL.position, ftL.position);
        float upperL = Vector3.Distance(thL.position, shL.position);
        float lowerL = Vector3.Distance(shL.position, ftL.position);
        float footLen = Vector3.Distance(ftL.position, toL.position);
        Debug.Log($"BEARGEN: fwd={AxFwd} right={AxRight} up={AxUp}");
        Debug.Log($"BEARGEN: legLen={legLen:F3} upper={upperL:F3} lower={lowerL:F3} " +
                  $"maxReach={(upperL + lowerL):F3} footLen={footLen:F3}");

        // ---- rotation sign probes -------------------------------------------
        float sAnkL = ProbeMove(ftL, toL.position, AxRight, -AxUp);   // toe down
        float sAnkR = ProbeMove(ftR, toR.position, AxRight, -AxUp);
        float sToeL = ProbeMove(toL, toL.position + toeDir * footLen, AxRight, AxUp);
        float sToeR = ProbeMove(toR, toR.position + toeDir * footLen, AxRight, AxUp);

        Transform armL = B("arm_stretch.l").t, armR = B("arm_stretch.r").t;
        Transform fArmL = B("forearm_stretch.l").t, fArmR = B("forearm_stretch.r").t;
        Transform hndL = B("hand.l").t, hndR = B("hand.r").t;
        float sArmL = ProbeMove(armL, fArmL.position, AxRight, AxFwd);   // elbow forward
        float sArmR = ProbeMove(armR, fArmR.position, AxRight, AxFwd);
        float sElbL = ProbeCloser(fArmL, hndL, AxRight, armL.position);  // hand toward shoulder
        float sElbR = ProbeCloser(fArmR, hndR, AxRight, armR.position);
        float sShoL = ProbeMove(B("shoulder.l").t, armL.position, AxFwd, AxUp);
        float sShoR = ProbeMove(B("shoulder.r").t, armR.position, AxFwd, AxUp);
        float sTwist = ProbeMove(root, B("shoulder.l").t.position, AxUp, AxFwd);
        float sRoll  = ProbeMove(root, thL.position, AxFwd, AxUp);
        float sLean  = ProbeMove(B("spine_01.x").t, head.position, AxRight, AxFwd);
        Debug.Log($"BEARGEN: signs ankle={sAnkL}/{sAnkR} toe={sToeL}/{sToeR} arm={sArmL}/{sArmR} " +
                  $"elbow={sElbL}/{sElbR} shoulder={sShoL}/{sShoR} twist={sTwist} roll={sRoll} lean={sLean}");

        // ---- gait constants ---------------------------------------------------
        float stride = StrideFrac * legLen;
        float lift   = LiftFrac * legLen;
        float bob    = BobFrac * legLen;
        float sway   = SwayFrac * legLen;
        float crouch = CrouchFrac * legLen;

        // Foot targets are absolute world positions, centred fore/aft under the hip.
        Vector3 baseL = ftL.position + AxFwd * Vector3.Dot(root.position - ftL.position, AxFwd);
        Vector3 baseR = ftR.position + AxFwd * Vector3.Dot(root.position - ftR.position, AxFwd);

        // ---- bones to bake -----------------------------------------------------
        string[] order = {
            "root.x","spine_01.x","spine_02.x","spine_03.x","spine_04.x","spine_05.x",
            "c_subneck_1.x","neck.x","head.x",
            "shoulder.l","arm_stretch.l","forearm_stretch.l",
            "shoulder.r","arm_stretch.r","forearm_stretch.r",
            "thigh_stretch.l","leg_stretch.l","foot.l","toes_01.l",
            "thigh_stretch.r","leg_stretch.r","foot.r","toes_01.r" };
        var animated = new List<Bone>();
        foreach (var n in order)
            if (bones.TryGetValue(n, out var b) && !animated.Contains(b)) animated.Add(b);
        foreach (var b in animated) b.baked = new Quaternion[Samples + 1];

        Bone rootB = B("root.x");
        Transform rootParent = rootB.t.parent;
        string[] spine = { "spine_01.x", "spine_02.x", "spine_03.x", "spine_04.x", "spine_05.x" };

        var rootPos = new Vector3[Samples + 1];
        var groundedY = new List<float>();
        var toeTrack = new float[Samples + 1];
        var hipY = new float[Samples + 1];
        ikClamped = 0;

        for (int i = 0; i <= Samples; i++)
        {
            float pL = (float)(i % Samples) / Samples;
            float pR = Mathf.Repeat(pL + 0.5f, 1f);

            // reset to rest so each sample is posed from a clean slate
            foreach (var b in animated) { b.t.localRotation = b.restLocal; b.pose = Quaternion.identity; }
            rootB.t.localPosition = rootB.restLocalPos;

            // ---- hip ---------------------------------------------------------
            // Hip peaks at mid-stance (p=0.3 left, p=0.8 right) and dips at the
            // contacts, which is where the two dips per stride come from.
            float up = -crouch + bob * Mathf.Cos(2f * Mathf.PI * 2f * (pL - 0.3f));
            float side = sway * Mathf.Cos(2f * Mathf.PI * (pL - 0.8f));
            Vector3 hipOffset = AxUp * up + AxRight * side;
            rootB.t.localPosition = rootB.restLocalPos + rootParent.InverseTransformVector(hipOffset);

            float twist = PelvisTwist * Mathf.Cos(2f * Mathf.PI * pL);
            float roll  = PelvisRoll  * Mathf.Sin(2f * Mathf.PI * pL);
            rootB.pose = Quaternion.AngleAxis(sTwist * twist, AxUp)
                       * Quaternion.AngleAxis(sRoll * roll, AxFwd);
            Apply(rootB);

            // ---- spine, neck, head -------------------------------------------
            float twistPer = -sTwist * SpineTwist * Mathf.Cos(2f * Mathf.PI * pL) / spine.Length;
            float leanPer  = sLean * SpineLean / spine.Length;
            foreach (var sn in spine)
            {
                var b = B(sn);
                b.pose = Quaternion.AngleAxis(twistPer, AxUp) * Quaternion.AngleAxis(leanPer, AxRight);
                Apply(b);
            }
            Apply(B("c_subneck_1.x"));
            SetApply(B("neck.x"), AxRight, sLean * -SpineLean * 0.6f);
            SetApply(B("head.x"), AxRight,
                     sLean * (-SpineLean * 0.4f + HeadNod * Mathf.Cos(4f * Mathf.PI * pL)));

            // ---- arms, counter-swinging the same-side leg ----------------------
            float aL = -ArmSwing * Mathf.Cos(2f * Mathf.PI * pL);
            float aR = -ArmSwing * Mathf.Cos(2f * Mathf.PI * pR);
            SetApply(B("shoulder.l"), AxFwd, sShoL * ShoulderRoll * Mathf.Cos(2f * Mathf.PI * pL));
            SetApply(B("arm_stretch.l"), AxRight, sArmL * aL);
            SetApply(B("forearm_stretch.l"), AxRight, sElbL * (ElbowBase + ElbowSwing * (aL / ArmSwing)));
            SetApply(B("shoulder.r"), AxFwd, sShoR * ShoulderRoll * Mathf.Cos(2f * Mathf.PI * pR));
            SetApply(B("arm_stretch.r"), AxRight, sArmR * aR);
            SetApply(B("forearm_stretch.r"), AxRight, sElbR * (ElbowBase + ElbowSwing * (aR / ArmSwing)));

            // ---- legs ----------------------------------------------------------
            PoseLeg(pL, baseL, "thigh_stretch.l", "leg_stretch.l", "foot.l", "toes_01.l",
                    upperL, lowerL, footLen, sAnkL, sToeL, stride, lift);
            PoseLeg(pR, baseR, "thigh_stretch.r", "leg_stretch.r", "foot.r", "toes_01.r",
                    upperL, lowerL, footLen, sAnkR, sToeR, stride, lift);

            foreach (var b in animated) b.baked[i] = b.t.localRotation;
            rootPos[i] = rootB.t.localPosition;

            if (i < Samples)
            {
                // whichever foot is grounded should hold a constant height
                if (pL < Duty) groundedY.Add(ftL.position.y - AnkleLift(Cyc(KPitch, pL), footLen));
                if (pR < Duty) groundedY.Add(ftR.position.y - AnkleLift(Cyc(KPitch, pR), footLen));
                toeTrack[i] = Vector3.Dot(ftL.position - root.position, AxFwd);
                hipY[i] = root.position.y;
            }
        }

        BakeClip(animated, rootB, rootPos);

        // ---- verification -----------------------------------------------------
        float plantSpread = groundedY.Max() - groundedY.Min();
        float hipRange = hipY.Take(Samples).Max() - hipY.Take(Samples).Min();
        float travel = toeTrack.Take(Samples).Max() - toeTrack.Take(Samples).Min();
        float maxQ = animated.Max(b => Quaternion.Angle(b.baked[0], b.baked[Samples]));
        Debug.Log($"BEARGEN: grounded-foot height spread = {plantSpread:F5} " +
                  $"({100f * plantSpread / legLen:F2}% of leg length)  [want ~0]");
        Debug.Log($"BEARGEN: hip bob = {hipRange:F4} ({100f * hipRange / legLen:F2}% of leg length)");
        Debug.Log($"BEARGEN: foot travel = {travel:F4}, step length = {(MatchingSpeed(legLen) * CycleTime / 2f):F4} " +
                  $"({100f * MatchingSpeed(legLen) * CycleTime / 2f / legLen:F0}% of leg length)");
        Debug.Log($"BEARGEN: matching ground speed = {MatchingSpeed(legLen):F3} units/s");
        Debug.Log($"BEARGEN: IK clamped on {ikClamped} of {2 * (Samples + 1)} solves  [want 0]");
        Debug.Log($"BEARGEN: loop delta pos = {Vector3.Distance(rootPos[0], rootPos[Samples]):F6}, rot = {maxQ:F4} deg");

        MakeControllerAndPrefab();
        Debug.Log("BEARGEN: DONE");
    }

    // --------------------------------------------------------------- leg posing
    /// Ankle lift that keeps the sole from digging in when the foot pitches.
    static float AnkleLift(float pitchDeg, float footLen)
        => footLen * 0.35f * Mathf.Abs(Mathf.Sin(pitchDeg * Mathf.Deg2Rad));

    static void PoseLeg(float p, Vector3 basePos, string thighN, string shinN, string footN, string toeN,
                        float upperL, float lowerL, float footLen, float sAnk, float sToe,
                        float stride, float lift)
    {
        Bone thigh = B(thighN), shin = B(shinN), foot = B(footN), toe = B(toeN);

        float pitch = Cyc(KPitch, p);
        float fwd, upOff;
        if (p < Duty)
        {
            // stance: travels backwards at a constant rate, flat on the ground
            float s = p / Duty;
            fwd = stride * (0.5f - s);
            upOff = 0f;
        }
        else
        {
            // swing: eases forward and arcs over the ground
            float s = (p - Duty) / (1f - Duty);
            fwd = stride * (-0.5f + s * s * (3f - 2f * s));
            upOff = lift * Mathf.Sin(Mathf.PI * s);
        }

        Vector3 target = basePos + AxFwd * fwd;
        target.y = basePos.y + upOff + AnkleLift(pitch, footLen);

        SolveTwoBone(thigh.t, shin.t, foot.t, target, upperL, lowerL, AxFwd);

        // the foot is oriented in world space so it stays level with the ground
        foot.t.rotation = Quaternion.AngleAxis(sAnk * pitch, AxRight) * foot.restWorld;
        SetApply(toe, AxRight, sToe * Cyc(KToe, p));
    }

    /// Analytic two-bone IK. Places the knee in the plane spanned by the
    /// hip-to-target line and `pole`, so the knee always bends forwards.
    static void SolveTwoBone(Transform hip, Transform knee, Transform ankle,
                             Vector3 target, float a, float b, Vector3 pole)
    {
        Vector3 restHipDir = (knee.position - hip.position).normalized;
        Vector3 toT = target - hip.position;
        float d = toT.magnitude;
        float dMin = Mathf.Abs(a - b) + 1e-4f, dMax = a + b - 1e-4f;
        if (d > dMax || d < dMin) ikClamped++;
        d = Mathf.Clamp(d, dMin, dMax);

        Vector3 u = toT.normalized;
        Vector3 w = Vector3.ProjectOnPlane(pole, u).normalized;
        float cosA = Mathf.Clamp((a * a + d * d - b * b) / (2f * a * d), -1f, 1f);
        float angA = Mathf.Acos(cosA);

        Vector3 kneePos = hip.position + a * (Mathf.Cos(angA) * u + Mathf.Sin(angA) * w);
        Vector3 dirThigh = (kneePos - hip.position).normalized;
        Vector3 dirShin = ((hip.position + u * d) - kneePos).normalized;

        hip.rotation = Quaternion.FromToRotation(restHipDir, dirThigh) * hip.rotation;
        Vector3 curShin = (ankle.position - knee.position).normalized;
        knee.rotation = Quaternion.FromToRotation(curShin, dirShin) * knee.rotation;
    }

    // ------------------------------------------------------------------ helpers
    static Bone B(string n)
    {
        if (!bones.TryGetValue(n, out var b)) { Debug.LogError("BEARGEN: missing bone " + n); return null; }
        return b;
    }

    /// Applies the bone world-space delta on top of its parent current pose.
    /// Must be called parents-first.
    static void Apply(Bone b)
    {
        if (b == null) return;
        Quaternion pw = b.t.parent.rotation;
        b.t.localRotation = Quaternion.Inverse(pw) * b.pose * pw * b.restLocal;
    }

    static void SetApply(Bone b, Vector3 axis, float deg)
    {
        if (b == null) return;
        b.pose = Quaternion.AngleAxis(deg, axis);
        Apply(b);
    }

    /// +1 when rotating bone by a positive angle about axis moves point along want.
    static float ProbeMove(Transform bone, Vector3 point, Vector3 axis, Vector3 want)
    {
        Vector3 d = point - bone.position;
        Vector3 moved = Quaternion.AngleAxis(10f, axis) * d;
        return Mathf.Sign(Vector3.Dot(moved - d, want.normalized));
    }

    /// +1 when a positive angle about axis brings child closer to target.
    static float ProbeCloser(Transform bone, Transform child, Vector3 axis, Vector3 target)
    {
        Vector3 d = child.position - bone.position;
        Vector3 after = bone.position + Quaternion.AngleAxis(10f, axis) * d;
        return (after - target).sqrMagnitude < (child.position - target).sqrMagnitude ? 1f : -1f;
    }

    /// Catmull-Rom through evenly spaced keys, wrapping around the cycle.
    static float Cyc(float[] k, float p)
    {
        int n = k.Length;
        float f = Mathf.Repeat(p, 1f) * n;
        int i = Mathf.FloorToInt(f);
        float t = f - i;
        float p0 = k[(i - 1 + n) % n], p1 = k[i % n], p2 = k[(i + 1) % n], p3 = k[(i + 2) % n];
        return 0.5f * (2f * p1 + (-p0 + p2) * t + (2f * p0 - 5f * p1 + 4f * p2 - p3) * t * t
                     + (-p0 + 3f * p1 - 3f * p2 + p3) * t * t * t);
    }

    static void BakeClip(List<Bone> animated, Bone rootB, Vector3[] rootPos)
    {
        var clip = new AnimationClip { frameRate = FrameRate };
        float dt = CycleTime / Samples;

        foreach (var b in animated)
        {
            var cx = new AnimationCurve(); var cy = new AnimationCurve();
            var cz = new AnimationCurve(); var cw = new AnimationCurve();
            for (int i = 0; i <= Samples; i++)
            {
                float t = i * dt; var q = b.baked[i];
                cx.AddKey(t, q.x); cy.AddKey(t, q.y); cz.AddKey(t, q.z); cw.AddKey(t, q.w);
            }
            Smooth(cx); Smooth(cy); Smooth(cz); Smooth(cw);
            clip.SetCurve(b.path, typeof(Transform), "localRotation.x", cx);
            clip.SetCurve(b.path, typeof(Transform), "localRotation.y", cy);
            clip.SetCurve(b.path, typeof(Transform), "localRotation.z", cz);
            clip.SetCurve(b.path, typeof(Transform), "localRotation.w", cw);
        }

        var px = new AnimationCurve(); var py = new AnimationCurve(); var pz = new AnimationCurve();
        for (int i = 0; i <= Samples; i++)
        {
            float t = i * dt; var p = rootPos[i];
            px.AddKey(t, p.x); py.AddKey(t, p.y); pz.AddKey(t, p.z);
        }
        Smooth(px); Smooth(py); Smooth(pz);
        clip.SetCurve(rootB.path, typeof(Transform), "localPosition.x", px);
        clip.SetCurve(rootB.path, typeof(Transform), "localPosition.y", py);
        clip.SetCurve(rootB.path, typeof(Transform), "localPosition.z", pz);

        clip.EnsureQuaternionContinuity();
        var s = AnimationUtility.GetAnimationClipSettings(clip);
        s.loopTime = true;
        AnimationUtility.SetAnimationClipSettings(clip, s);

        Directory.CreateDirectory(Path.GetDirectoryName(ClipPath));
        AssetDatabase.DeleteAsset(ClipPath);
        AssetDatabase.CreateAsset(clip, ClipPath);
        AssetDatabase.SaveAssets();
    }

    static void Smooth(AnimationCurve c)
    {
        for (int i = 0; i < c.length; i++) c.SmoothTangents(i, 0f);
    }

    static void MakeControllerAndPrefab()
    {
        var clip = AssetDatabase.LoadAssetAtPath<AnimationClip>(ClipPath);
        AssetDatabase.DeleteAsset(CtrlPath);
        var ctrl = UnityEditor.Animations.AnimatorController
            .CreateAnimatorControllerAtPathWithClip(CtrlPath, clip);

        var src = AssetDatabase.LoadAssetAtPath<GameObject>(FbxPath);
        var go = (GameObject)Object.Instantiate(src);
        go.name = "BearWalking";
        // Unity fakes null on absent components, so ?? is unreliable here.
        var anim = go.GetComponent<Animator>();
        if (anim == null) anim = go.AddComponent<Animator>();
        anim.runtimeAnimatorController = ctrl;
        anim.applyRootMotion = false;
        Directory.CreateDirectory(Path.GetDirectoryName(PrefabPath));
        PrefabUtility.SaveAsPrefabAsset(go, PrefabPath);
        Object.DestroyImmediate(go);
        AssetDatabase.SaveAssets();
    }
}
