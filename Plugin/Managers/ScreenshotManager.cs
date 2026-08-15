using System.Collections.Generic;
using System.IO;
using Photon.Pun;
using UnityEngine;
using Zorro.Core;

namespace PeakMap.Managers;

public static class ScreenshotManager
{

    private static readonly List<Vector3> CameraPositions = new()
    {
        new Vector3(0f, 100f, -500f),
        new Vector3(0f, 100f, 75f),
        new Vector3(),
        new Vector3(0f, 100f, 350f),
        new Vector3()
    };

    private static readonly List<Vector3> CameraRotations = new()
    {
        new Vector3(0f, 0f, 0f),
        new Vector3(30f, 0f, 0f),
        new Vector3(20f, 0f, 0f),
        new Vector3(89.9f, -89.9f, 0f),
    };

    private static readonly List<float> CameraFOVs = new()
    {
        45f,
        90f,
        90f,
        90f
    };

    public static readonly List<float> LevelWidths = new() { 0, 0, 0, 0 };
    public static readonly List<float> LevelHeights = new() { 0, 0, 0, 0 };
        
    private static int ResolutionWidth { get; set; } = 7680;
    private static int ResolutionHeight { get; set; } = 4320;
    private static int ResolutionDepth { get; set; } = 24;
    
    private static List<int> _takenScreenshots = new();

    public static void SetupLevelDimensions(int level)
    {
        GameObject campfire = Singleton<MapHandler>.Instance?.segments?[level]?.segmentCampfire;

        if (campfire == null)
        {
            return;
        }
            
        CameraPositions[level + 1] += new Vector3(0f, campfire.transform.position.y + 100, campfire.transform.position.z + 25f);
        LevelWidths[level] = campfire.transform.position.z;
        LevelHeights[level] = campfire.transform.position.y;
            
        PeakMapPlugin.Log.LogWarning("New level width for " + level + " is " + LevelWidths[level] + ", with height " + LevelHeights[level]);
    }
    
    public static void TakeScreenshot(int level)
    {
        if (_takenScreenshots.Contains(level))
        {
            return;
        }

        MapHandler.MapSegment segment = Singleton<MapHandler>.Instance?.segments?[level];
        GameObject mapObject = segment?.segmentParent;
        if (mapObject != null)
        {
            PhotonNetwork.IsMessageQueueRunning = false;
            mapObject.SetActive(true);
            segment.wallNext?.SetActive(false);
            segment.wallPrevious?.SetActive(false);
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
        
        Object.DestroyImmediate(renderTexture);
        Object.DestroyImmediate(screenshot);
        Object.DestroyImmediate(tempCamObj);
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