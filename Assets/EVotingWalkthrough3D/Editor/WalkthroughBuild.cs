using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;

/// Creates the walkthrough scene and builds it, from the editor or headlessly.
///
///     Unity.exe -batchmode -quit -projectPath . -executeMethod WalkthroughBuild.PerformBuild -buildOutput <folder>
///
/// The scene is created rather than committed as a .unity asset so it cannot drift from the
/// code, and so the repository carries no YAML scene file to merge.
public static class WalkthroughBuild
{
    const string ProductName = "EVotingWalkthrough3D";
    const string ScenePath = "Assets/EVotingWalkthrough3D/Walkthrough3D.unity";

    [MenuItem("E-Voting Walkthrough 3D/Create and Open Scene")]
    public static string CreateScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        var cameraHolder = new GameObject("Main Camera") { tag = "MainCamera" };
        cameraHolder.AddComponent<Camera>();
        cameraHolder.transform.position = new Vector3(0f, 1.5f, -2f);

        new GameObject("Walkthrough").AddComponent<Walkthrough3D>();

        Directory.CreateDirectory(Path.GetDirectoryName(Path.Combine(
            Directory.GetParent(Application.dataPath).FullName, ScenePath)));
        EditorSceneManager.SaveScene(scene, ScenePath);

        Debug.Log("Created " + ScenePath + " — press Play.");
        return ScenePath;
    }

    [MenuItem("E-Voting Walkthrough 3D/Build Windows Player")]
    public static void BuildFromMenu()
    {
        Build(Path.Combine(Directory.GetParent(Application.dataPath).FullName, "Build"));
    }

    public static void PerformBuild()
    {
        string output = ArgumentValue("-buildOutput")
                        ?? Path.Combine(Directory.GetParent(Application.dataPath).FullName, "Build");
        Build(output);
    }

    static void Build(string output)
    {
        Directory.CreateDirectory(output);

        if (!File.Exists(ScenePath)) CreateScene();

        var options = new BuildPlayerOptions
        {
            scenes = new[] { ScenePath },
            locationPathName = Path.Combine(output, ProductName + ".exe"),
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.None
        };

        BuildReport report = BuildPipeline.BuildPlayer(options);

        if (report.summary.result == BuildResult.Succeeded)
        {
            Debug.Log("Build succeeded: " + options.locationPathName);
        }
        else
        {
            Debug.LogError("Build failed: " + report.summary.result);
            EditorApplication.Exit(1);
        }
    }

    static string ArgumentValue(string name)
    {
        string[] arguments = System.Environment.GetCommandLineArgs();
        for (int i = 0; i < arguments.Length - 1; i++)
        {
            if (arguments[i] == name) return arguments[i + 1];
        }
        return null;
    }
}
