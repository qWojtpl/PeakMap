using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using PeakMap.Objects;
using UnityEngine;

namespace PeakMap.Managers;

public abstract class DataManager
{

    public static readonly LevelInfo LevelInfo = new();
    
    public static void CreateData(int level, LevelInfo levelInfo, bool withSide = false)
    {
        
        CreateData(level,
            ScreenshotManager.CameraPositions[level],
            ScreenshotManager.CameraRotations[level],
            ScreenshotManager.CameraFoVs[level],
            levelInfo,
            "");

        if (withSide)
        {
            CreateData(level,
                ScreenshotManager.GetSideCameraPosition(level),
                ScreenshotManager.GetSideCameraRotation(),
                60,
                levelInfo,
                "_side");
        }
    }

    public static void CreateData(int level, Vector3 cameraPosition, Vector3 cameraRotation, float fov, LevelInfo levelInfo,
        string filePrefix)
    {
        
        List<ObjectInfo> objects = new();
        objects.AddRange(levelInfo.Luggage);
        objects.AddRange(levelInfo.Belltowers);
        objects.AddRange(levelInfo.Animals);
        objects.AddRange(levelInfo.Amulets);
        objects.AddRange(levelInfo.Tombs);
        
        foreach (ObjectInfo info in objects)
        {
            if (ScreenshotManager.GetObjectScreenPosition(
                    cameraPosition, 
                    cameraRotation,
                    fov, 
                    info.Position, out var positionOnScreen))
            {
                info.PositionOnScreen = positionOnScreen;
            }
            else
            {
                info.PositionOnScreen = null;
            }
            if (info.ReferenceComponent != null)
            {
                if (!info.ReferenceComponent.gameObject.activeInHierarchy)
                {
                    info.PositionOnScreen = null;
                }
            }
        }
        
        float previousWidth = -500;
        if(level > 0) {
            previousWidth = ScreenshotManager.LevelWidths[level - 1];
        }

        LevelInfo serializableInfo = new LevelInfo
        {
            Luggage = FilterWidth(level, previousWidth, levelInfo.Luggage),
            Belltowers = FilterWidth(level, previousWidth, levelInfo.Belltowers),
            Animals = FilterWidth(level, previousWidth, levelInfo.Animals),
            Amulets = FilterWidth(level, previousWidth, levelInfo.Amulets),
            Tombs = FilterWidth(level, previousWidth, levelInfo.Tombs)
        };

        File.WriteAllText(
            Path.Combine(PeakMapPlugin.ModFolder, "level_" + level + filePrefix + ".json"), 
            JsonConvert.SerializeObject(serializableInfo)
        );
    }

    private static List<ObjectInfo> FilterWidth(int level, float previousWidth, List<ObjectInfo> objects)
    {
        return objects.Where(n => n.PositionOnScreen != null)
            .Where(n => n.Position.z <= ScreenshotManager.LevelWidths[level] && n.Position.z > previousWidth)
            .Where(n => n.Position.y <= ScreenshotManager.LevelHeights[level] + 10f).ToList();
    }
    
}