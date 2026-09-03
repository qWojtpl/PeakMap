using System.Collections.Generic;
using System.IO;
using System.Linq;
using Photon.Pun;
using UnityEngine;
using Zorro.Core;

namespace PeakMap.Managers;

public static class ScreenshotManager
{

    public static readonly List<Vector3> CameraPositions = new()
    {
        new Vector3(0f, 100f, -500f),
        new Vector3(0f, 100f, 75f),
        new Vector3(),
        new Vector3(0f, 100f, 350f),
        new Vector3(0f, 120f, -150f)
    };

    public static readonly List<Vector3> CameraRotations = new()
    {
        new Vector3(0f, 0f, 0f),
        new Vector3(30f, 0f, 0f),
        new Vector3(23f, 0f, 0f),
        new Vector3(89.9f, -89.9f, 0f),
        new Vector3(0f, 0f, 0f)
    };

    public static readonly List<float> CameraFoVs = new()
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

    private static int _swampCounter = 0;
    private static int _volcanoCounter = 0;

    private static GameObject _currentMapObject;
    private static MapHandler.MapSegment _currentSegment;
    private static EnablingSubstep[] _currentEnablingSubsteps;
    
    public static void SetupLevelDimensions(int level)
    {
        MapHandler.MapSegment segment = Singleton<MapHandler>.Instance?.segments?[level];
        Vector3? campfire = segment?.segmentCampfire?.transform.position;

        if (campfire == null)
        {
            return;
        }
        
        if (segment.biome == Biome.BiomeType.Volcano && level == 3) // Klin patch
        {
            campfire = DataManager.LuggageList
                .Where(n => n.Name.ToLower().Equals("scout statue"))
                .MaxBy(n => n.Position.z)
                .Position;
            campfire = new Vector3(campfire.Value.x, campfire.Value.y, campfire.Value.z + 250f);
            PeakMapPlugin.Log.LogWarning("Updated campfire location for the klin to " + campfire);
        }
        
        CameraPositions[level + 1] += new Vector3(0f, campfire.Value.y + 100, campfire.Value.z + 25f);
        
        LevelWidths[level] = campfire.Value.z + 10f;
        LevelHeights[level] = campfire.Value.y;
        PeakMapPlugin.Log.LogWarning("New level width for " + level + " is " + LevelWidths[level] + ", with height " + LevelHeights[level]);
    }
    
    public static void CreateFor(int level, bool withSide = false)
    {
        MapHandler mapHandler = Singleton<MapHandler>.Instance;
        MapHandler.MapSegment segment = mapHandler?.segments?[level];
        GameObject mapObject = segment?.segmentParent;

        if (mapObject == null)
        {
            return;
        }
        
        _currentMapObject = mapObject;
        _currentEnablingSubsteps = (from enablingSubstep in mapObject.GetComponentsInChildren<EnablingSubstep>()
            where enablingSubstep.gameObject.activeSelf
            select enablingSubstep).ToArray();
        _currentSegment = segment;
        
        PrepareMap();
        
        PeakMapPlugin.Log.LogWarning("Taking screenshot of level " + level + "...");
        PeakMapPlugin.Log.LogWarning("Camera position: " + CameraPositions[level] + " with rotation " + CameraRotations[level] + " and FOV " + CameraFoVs[level]);

        GameObject tempCamObj = CreateTempCameraGameObject(CameraPositions[level], CameraRotations[level]);
        Camera tempCam = CreateTempCamera(CameraFoVs[level], tempCamObj);

        TakeScreenshot(tempCam, level + "");

        if (withSide)
        {
            GameObject tempSideCamObj = CreateTempCameraGameObject(GetSideCameraPosition(level), GetSideCameraRotation());
            Camera tempSideCam = CreateTempCamera(60, tempSideCamObj);
            TakeScreenshot(tempSideCam, level + "_side");
            Object.DestroyImmediate(tempSideCamObj);
        }
        
        Object.DestroyImmediate(tempCamObj);
        SpawnMapObjectItems();
    }

    public static Vector3 GetSideCameraPosition(int level)
    {
        float previousWidth = -200;
        if (level > 0)
        {
            previousWidth = LevelWidths[level - 1];
        }

        return new Vector3(280f, LevelHeights[level] + 100, (previousWidth + LevelWidths[level]) / 2);
    }

    public static Vector3 GetSideCameraRotation()
    {
        return new Vector3(45f, -90f, 0f);
    }

    private static void PrepareMap()
    {
        PhotonNetwork.IsMessageQueueRunning = false;
        _currentMapObject.SetActive(true);
        
        foreach(EnablingSubstep substep in _currentEnablingSubsteps)
        {
            substep.gameObject.SetActive(true);
        }
        _currentSegment.segmentCampfire?.SetActive(true);
        _currentSegment.wallNext?.SetActive(false);
        _currentSegment.wallPrevious?.SetActive(false);
        if (_currentSegment.biome == Biome.BiomeType.Swamp)
        {
            _swampCounter++;
        } else if (_currentSegment.biome == Biome.BiomeType.Volcano)
        {
            _volcanoCounter++;
        }
        if (_swampCounter == 2)
        {
            HideTempleObjects();
        }

        if (_volcanoCounter == 2)
        {
            HideVolcanoObjects();
        }
        PhotonNetwork.IsMessageQueueRunning = true;
    }

    private static void TakeScreenshot(Camera tempCam, string fileSuffix)
    {
        RenderTexture renderTexture = new RenderTexture(ResolutionWidth, ResolutionHeight, ResolutionDepth);
        tempCam.targetTexture = renderTexture;
        
        Texture2D screenshot = new Texture2D(ResolutionWidth, ResolutionHeight, TextureFormat.RGB24, false);
        tempCam.Render();
        
        RenderTexture.active = renderTexture;
        screenshot.ReadPixels(new Rect(0, 0, ResolutionWidth, ResolutionHeight), 0, 0);
        screenshot.Apply();
        
        byte[] bytes = screenshot.EncodeToJPG(92);
        string fullPath = Path.Combine(PeakMapPlugin.ModFolder, "level_" + fileSuffix + ".jpg");
        File.WriteAllBytes(fullPath, bytes);
        
        tempCam.targetTexture = null;
        RenderTexture.active = null;
        
        Object.DestroyImmediate(renderTexture);
        Object.DestroyImmediate(screenshot);
    }

    private static void SpawnMapObjectItems()
    {
        List<ISpawner> list = _currentMapObject
            .GetComponentsInChildren<ISpawner>(true)
            .ToList();

        foreach (ISpawner item in list)
        {
            item.TrySpawnItems();
        }
    }

    public static void Flush()
    {
        _currentMapObject.SetActive(false);
        foreach(EnablingSubstep substep in _currentEnablingSubsteps)
        {
            substep.gameObject.SetActive(false);
        }
    }

    public static bool GetObjectScreenPosition(Vector3 cameraPosition, Vector3 cameraRotation, float fov, Vector3 objectPosition, out Vector2 screenPosition)
    {
        GameObject tempCamObj = CreateTempCameraGameObject(cameraPosition, cameraRotation);
        Camera tempCam = CreateTempCamera(fov, tempCamObj);

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

    private static GameObject CreateTempCameraGameObject(Vector3 cameraPosition, Vector3 cameraRotation)
    {
        return new GameObject("TempCamera")
        {
            transform = {
                position = cameraPosition,
                eulerAngles = cameraRotation
            }
        };
    }

    private static Camera CreateTempCamera(float fov, GameObject tempCamObj)
    {
        Camera tempCam = tempCamObj.AddComponent<Camera>();
        tempCam.clearFlags = CameraClearFlags.Skybox;
        tempCam.fieldOfView = fov;
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

    private static void HideVolcanoObjects()
    {
        PeakMapPlugin.Log.LogWarning("Hiding volcano objects...");

        Transform volcano = Object.FindObjectsByType<Transform>(FindObjectsInactive.Include, FindObjectsSortMode.None)
            .FirstOrDefault(n => n.gameObject.name.ToLower().Equals("volcanomodel"));

        if (volcano != null)
        {
            PeakMapPlugin.Log.LogWarning("Destroying volcano: " + volcano.gameObject.name);
            Object.DestroyImmediate(volcano.gameObject);
        }
        
        List<Transform> rocks = Object.FindObjectsByType<Transform>(FindObjectsInactive.Include, FindObjectsSortMode.None)
            .Where(n => n.gameObject.name.ToLower().Contains("rock_round") || n.gameObject.name.ToLower().Contains("rockfinal")).ToList();

        foreach (Transform rock in rocks)
        {
            if (rock == null)
            {
                continue;
            }
            PeakMapPlugin.Log.LogWarning("Destroying rock: " + rock.gameObject.name);
            Object.DestroyImmediate(rock.gameObject);
        }
    }
    
}