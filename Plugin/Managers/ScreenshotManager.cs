using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Photon.Pun;
using UnityEngine;
using Zorro.Core;

namespace PeakMap.Managers;

public static class ScreenshotManager
{

    private static readonly List<Vector3> CameraPositions = new()
    {
        new Vector3(0f, 100f, -500f),
        new Vector3(0f, 500f, 200f),
        new Vector3(0f, 600f, 750f),
        new Vector3(0f, 1050f, 1450f),
    };

    private static readonly List<Vector3> CameraRotations = new()
    {
        new Vector3(0f, 0f, 0f),
        new Vector3(45f, 0f, 0f),
        new Vector3(0f, 0f, 0f),
        new Vector3(75f, 0f, 0f),
    };

    private static readonly List<float> CameraFOVs = new()
    {
        45f,
        90f,
        90f,
        90f
    };

    public static readonly List<float> LevelWidths = new()
    {
        100f,
        400f,
        800f,
        1000f
    };

    private static int ResolutionWidth { get; set; } = 7680;
    private static int ResolutionHeight { get; set; } = 4320;
    private static int ResolutionDepth { get; set; } = 24;
    
    private static List<int> _takenScreenshots = new();

    public static void TakeScreenshot(int level)
    {
        if (_takenScreenshots.Contains(level))
        {
            return;
        }
        
        GameObject heavyGameObject = Singleton<MapHandler>.Instance?.segments?[level]?.segmentParent;
        if (heavyGameObject != null)
        {
            GameObject campfire = Singleton<MapHandler>.Instance?.segments?[level]?.segmentCampfire;
            
            LevelWidths[level] = campfire.transform.position.z;
            
            PeakMapPlugin.Log.LogWarning("New level width for " + level + " is " + LevelWidths[level]);
            
            PhotonNetwork.IsMessageQueueRunning = false;
            heavyGameObject.SetActive(true);
            PhotonNetwork.IsMessageQueueRunning = true;
        }
        else
        {
            return;
        }
        
        _takenScreenshots.Add(level);

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
        tempCam.aspect = (float)ResolutionWidth / ResolutionHeight;
        return tempCam;
    }
    
}