using System.Collections;
using System.IO;
using UnityEngine;

/// Walks every step of the 3D walkthrough and writes one PNG per step, then quits.
/// Used to regenerate docs/screenshots; see docs/development.md.
///
///     EVotingPixelWalkthrough.exe -capture <folder> -screen-width 1600 -screen-height 900 -screen-fullscreen 0
///
/// Does nothing unless -capture is present on the command line.
public class PixelScreenshotCapture : MonoBehaviour
{
    string folder;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void Install()
    {
        string folder = FolderFromCommandLine();
        if (string.IsNullOrEmpty(folder)) return;

        var host = new GameObject("PixelScreenshotCapture");
        host.AddComponent<PixelScreenshotCapture>().folder = folder;
    }

    static string FolderFromCommandLine()
    {
        string[] arguments = System.Environment.GetCommandLineArgs();
        for (int i = 0; i < arguments.Length - 1; i++)
        {
            if (arguments[i] == "-capture") return arguments[i + 1];
        }
        return null;
    }

    IEnumerator Start()
    {
        var walkthrough = FindAnyObjectByType<PixelWalkthrough>();
        if (walkthrough == null)
        {
            Debug.LogError("PixelScreenshotCapture: no PixelWalkthrough in the scene.");
            Application.Quit(1);
            yield break;
        }

        Directory.CreateDirectory(folder);
        Debug.Log("PixelScreenshotCapture: writing " + walkthrough.StepCount + " screenshots to " + folder);

        for (int step = 0; step < walkthrough.StepCount; step++)
        {
            // The pixel scene has no camera movement, so the step is ready on the next frame.
            walkthrough.ShowStep(step);

            yield return null;
            yield return new WaitForEndOfFrame();

            string path = Path.Combine(folder,
                string.Format("step-{0:00}-{1}.png", step + 1, Slug(walkthrough.StepTitle(step))));
            ScreenCapture.CaptureScreenshot(path);

            for (int frame = 0; frame < 10; frame++) yield return new WaitForEndOfFrame();
        }

        Debug.Log("PixelScreenshotCapture: done.");
        Application.Quit(0);
    }

    static string Slug(string title)
    {
        var builder = new System.Text.StringBuilder();
        bool separated = true;

        foreach (char character in title.ToLowerInvariant())
        {
            if (char.IsLetterOrDigit(character) && character < 128)
            {
                builder.Append(character);
                separated = false;
            }
            else if (!separated)
            {
                builder.Append('-');
                separated = true;
            }
        }

        return builder.ToString().Trim('-');
    }
}
