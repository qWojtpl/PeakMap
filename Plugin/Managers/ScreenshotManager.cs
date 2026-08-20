using System.Collections.Generic;
using System.IO;
using System.Linq;
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
        new Vector3(0f, 120f, -150f)
    };

    private static readonly List<Vector3> CameraRotations = new()
    {
        new Vector3(0f, 0f, 0f),
        new Vector3(30f, 0f, 0f),
        new Vector3(23f, 0f, 0f),
        new Vector3(89.9f, -89.9f, 0f),
        new Vector3(0f, 0f, 0f)
    };

    private static readonly List<float> CameraFOVs = new()
    {
        45f,
        90f,
        90f,
        90f,
        90f
    };

    public static readonly List<float> LevelWidths = new() { 0, 0, 0, 0, 5000 };
    public static readonly List<float> LevelHeights = new() { 0, 0, 0, 0, 5000 };
        
    private static int ResolutionWidth { get; set; } = 7680;
    private static int ResolutionHeight { get; set; } = 4320;
    private static int ResolutionDepth { get; set; } = 24;

    private static int swampCounter = 0;

    private static GameObject currentMapObject;
    private static EnablingSubstep[] currentEnablingSubsteps;
    
    public static void SetupLevelDimensions(int level)
    {
        GameObject campfire = Singleton<MapHandler>.Instance?.segments?[level]?.segmentCampfire;

        if (campfire == null)
        {
            return;
        }
            
        CameraPositions[level + 1] += new Vector3(0f, campfire.transform.position.y + 100, campfire.transform.position.z + 25f);
        LevelWidths[level] = campfire.transform.position.z + 10f;
        LevelHeights[level] = campfire.transform.position.y;
            
        PeakMapPlugin.Log.LogWarning("New level width for " + level + " is " + LevelWidths[level] + ", with height " + LevelHeights[level]);
    }
    
    public static void TakeScreenshot(int level)
    {

        MapHandler mapHandler = Singleton<MapHandler>.Instance;
        MapHandler.MapSegment segment = mapHandler?.segments?[level];
        GameObject mapObject = segment?.segmentParent;

        if (mapObject == null)
        {
            return;
        }
        
        PhotonNetwork.IsMessageQueueRunning = false;
        mapObject.SetActive(true);
        EnablingSubstep[] substeps = (from enablingSubstep in mapObject.GetComponentsInChildren<EnablingSubstep>()
            where enablingSubstep.gameObject.activeSelf
            select enablingSubstep).ToArray();
        foreach(EnablingSubstep substep in substeps)
        {
            substep.gameObject.SetActive(true);
        }
        currentMapObject = mapObject;
        currentEnablingSubsteps = substeps;
        segment.segmentCampfire?.SetActive(true);
        segment.wallNext?.SetActive(false);
        segment.wallPrevious?.SetActive(false);
        if (segment.biome == Biome.BiomeType.Swamp)
        {
            swampCounter++;
        }
        if (swampCounter == 2)
        {
            HideTempleObjects();
        }
        PhotonNetwork.IsMessageQueueRunning = true;
        
        PeakMapPlugin.Log.LogWarning("Taking screenshot of level " + level + "...");

        GameObject tempCamObj = CreateTempCameraGameObject(level);
        Camera tempCam = CreateTempCamera(level, tempCamObj);
        
        RenderTexture renderTexture = new RenderTexture(ResolutionWidth, ResolutionHeight, ResolutionDepth);
        tempCam.targetTexture = renderTexture;
        
        Texture2D screenshot = new Texture2D(ResolutionWidth, ResolutionHeight, TextureFormat.RGB24, false);
        tempCam.Render();
        
        RenderTexture.active = renderTexture;
        screenshot.ReadPixels(new Rect(0, 0, ResolutionWidth, ResolutionHeight), 0, 0);
        screenshot.Apply();
        
        byte[] bytes = screenshot.EncodeToJPG(92);
        string fullPath = Path.Combine(PeakMapPlugin.ModFolder, "level_" + level + ".jpg");
        File.WriteAllBytes(fullPath, bytes);
        
        tempCam.targetTexture = null;
        RenderTexture.active = null;
        
        Object.DestroyImmediate(renderTexture);
        Object.DestroyImmediate(screenshot);
        Object.DestroyImmediate(tempCamObj);
        
        List<ISpawner> list = segment.segmentParent
            .GetComponentsInChildren<ISpawner>(true)
            .ToList();

        foreach (ISpawner item in list)
        {
            item.TrySpawnItems();
        }
    }

    public static void DeactivateCurrentSegment()
    {
        currentMapObject.SetActive(false);
        foreach(EnablingSubstep substep in currentEnablingSubsteps)
        {
            substep.gameObject.SetActive(false);
        }
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

    private static void HideTempleObjects()
    {
        PeakMapPlugin.Log.LogWarning("Hiding temple objects...");
        
        Transform tower = Object.FindObjectsByType<Transform>(FindObjectsInactive.Include, FindObjectsSortMode.None)
            .FirstOrDefault(n => n.gameObject.name.ToLower().Contains("gloom temple"));

        if (tower != null)
        {
            PeakMapPlugin.Log.LogWarning("Destroying temple: " + tower.gameObject.name);
            Object.DestroyImmediate(tower.gameObject);
        }
        
    }

}