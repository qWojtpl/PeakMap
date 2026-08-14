using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace PeakMap.Managers;

public static class ScreenshotManager
{
    
    private static bool _screenShotEnabled = true;

    private static readonly List<Vector3> CameraPositions = new()
    {
        new Vector3(0f, 100f, -300f),
    };

    private static readonly List<Vector3> CameraRotations = new()
    {
        new Vector3(0f, 0f, 0f),
    };

    private static readonly List<float> CameraFOVs = new()
    {
        60f
    };

    private static int ResolutionWidth { get; set; } = 7680;
    private static int ResolutionHeight { get; set; } = 4320;
    private static int ResolutionDepth { get; set; } = 24;

    public static void TakeScreenshot(int level)
    {
        if (!_screenShotEnabled)
        {
            return;
        }
        
        _screenShotEnabled = false;
        
        GameObject tempCamObj = CreateTempCameraGameObject(level);
        Camera tempCam = CreateTempCamera(level, tempCamObj);
        
        RenderTexture renderTexture = new RenderTexture(ResolutionWidth, ResolutionHeight, ResolutionDepth);
        tempCam.targetTexture = renderTexture;
        
        Texture2D screenshot = new Texture2D(ResolutionWidth, ResolutionHeight, TextureFormat.RGB24, false);
        tempCam.Render();
        
        RenderTexture.active = renderTexture;
        screenshot.ReadPixels(new Rect(0, 0, ResolutionWidth, ResolutionHeight), 0, 0);
        screenshot.Apply();
        
        byte[] bytes = screenshot.EncodeToPNG();
        string fullPath = Path.Combine(PeakMapPlugin.ModFolder, "level_" + level + ".png");
        File.WriteAllBytes(fullPath, bytes);
        
        tempCam.targetTexture = null;
        RenderTexture.active = null;
        
        Object.Destroy(renderTexture);
        Object.Destroy(screenshot);
        Object.Destroy(tempCamObj);
    }

    public static bool GetObjectScreenPosition(int level, Vector3 objectPosition, out Vector2 screenPosition)
    {
        GameObject tempCamObj = CreateTempCameraGameObject(level);
        Camera tempCam = CreateTempCamera(level, tempCamObj);

        Vector3 viewportPoint = tempCam.WorldToViewportPoint(objectPosition);
        
        Object.DestroyImmediate(tempCamObj);
        if (viewportPoint is { z: > 0, x: >= 0f and <= 1f, y: >= 0f and <= 1f })
        {
            screenPosition = new Vector2
            (
                viewportPoint.x * ResolutionWidth, 
                ResolutionHeight - viewportPoint.y * ResolutionHeight
            );
            return true;
        }
        
        screenPosition = default;
        return false;
    }

    private static GameObject CreateTempCameraGameObject(int level)
    {
        return new GameObject("TempCamera")
        {
            transform = {
                position = CameraPositions[level],
                eulerAngles = CameraRotations[level]
            }
        };
    }

    private static Camera CreateTempCamera(int level, GameObject tempCamObj)
    {
        Camera tempCam = tempCamObj.AddComponent<Camera>();
        tempCam.clearFlags = CameraClearFlags.Skybox;
        tempCam.fieldOfView = CameraFOVs[level];
        return tempCam;
    }
    
}