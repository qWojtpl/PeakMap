using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace PeakMap.Managers;

public class ScreenshotManager
{
    
    private static bool ScreenshotsEnabled = true;

    private static List<Vector3> CameraPositions = new()
    {
        new Vector3(0f, 100f, -300f),
    };

    private static List<Vector3> CameraRotations = new()
    {
        new Vector3(0f, 0f, 0f),
    };

    private static int ResolutionWidth { get; set; } = 7680;
    private static int ResolutionHeight { get; set; } = 4320;
    private static int ResolutionDepth { get; set; } = 24;

    public static void TakeScreenshot(int position)
    {
        if (!ScreenshotsEnabled)
        {
            return;
        }
        ScreenshotsEnabled = false;
        GameObject tempCamObj = new GameObject("TempScreenshotCamera");
        tempCamObj.transform.position = CameraPositions[position];
        tempCamObj.transform.eulerAngles = CameraRotations[position];
        
        Camera tempCam = tempCamObj.AddComponent<Camera>();
        tempCam.clearFlags = CameraClearFlags.Skybox;
        
        RenderTexture renderTexture = new RenderTexture(ResolutionWidth, ResolutionHeight, ResolutionDepth);
        tempCam.targetTexture = renderTexture;
        
        Texture2D screenshot = new Texture2D(ResolutionWidth, ResolutionHeight, TextureFormat.RGB24, false);
        tempCam.Render();
        
        RenderTexture.active = renderTexture;
        screenshot.ReadPixels(new Rect(0, 0, ResolutionWidth, ResolutionHeight), 0, 0);
        screenshot.Apply();
        
        byte[] bytes = screenshot.EncodeToPNG();
        string fullPath = Path.Combine(PeakMapPlugin.ModFolder, "level_" + position + ".png");
        File.WriteAllBytes(fullPath, bytes);
        
        tempCam.targetTexture = null;
        RenderTexture.active = null;
        
        Object.Destroy(renderTexture);
        Object.Destroy(screenshot);
        Object.Destroy(tempCamObj);
    }
    
}