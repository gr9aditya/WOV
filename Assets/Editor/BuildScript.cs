using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;
using UnityEngine.SceneManagement;

/// Headless build entry point, so the walkthrough can be built and screenshotted from CI
/// or a terminal without opening the editor. See docs/development.md.
///
///     Unity.exe -batchmode -quit -projectPath . -executeMethod BuildScript.PerformBuild -buildOutput <folder>
public static class BuildScript
{
    const string ProductName = "EVotingWalkthrough";

    [MenuItem("E-Voting Walkthrough/Build Windows Player")]
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

        // The walkthrough builds itself at runtime, so an empty scene is all the player needs.
        string sceneFolder = "Assets/Scenes";
        string scenePath = sceneFolder + "/Walkthrough.unity";

        if (!File.Exists(scenePath))
        {
            Directory.CreateDirectory(Path.Combine(Application.dataPath, "Scenes"));
            var scene = UnityEditor.SceneManagement.EditorSceneManager.NewScene(
                UnityEditor.SceneManagement.NewSceneSetup.EmptyScene,
                UnityEditor.SceneManagement.NewSceneMode.Single);

            var cameraObject = new GameObject("Main Camera") { tag = "MainCamera" };
            cameraObject.AddComponent<Camera>();
            cameraObject.transform.position = new Vector3(0f, 0f, -10f);

            UnityEditor.SceneManagement.EditorSceneManager.SaveScene(scene, scenePath);
        }

        var options = new BuildPlayerOptions
        {
            scenes = new[] { scenePath },
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
