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
    
    public static readonly List<ObjectInfo> LuggageList = new();
    public static readonly List<ObjectInfo> BelltowerList = new();
    public static readonly List<ObjectInfo> AnimalList = new();
    public static readonly List<ObjectInfo> AmuletList = new();
    
    public static void CreateData(int level, List<ObjectInfo> objects, string fileSuffix, bool withSide = false)
    {
        CreateData(level,
            ScreenshotManager.CameraPositions[level],
            ScreenshotManager.CameraRotations[level],
            ScreenshotManager.CameraFoVs[level],
            objects,
            "",
            fileSuffix);

        if (withSide)
        {
            CreateData(level,
                ScreenshotManager.GetSideCameraPosition(level),
                ScreenshotManager.GetSideCameraRotation(),
                60,
                objects,
                "_side",
                fileSuffix);
        }
    }

    public static void CreateData(int level, Vector3 cameraPosition, Vector3 cameraRotation, float fov, List<ObjectInfo> objects,
        string filePrefix, string fileSuffix)
    {
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
        
        File.WriteAllText(
            Path.Combine(PeakMapPlugin.ModFolder, "level_" + level + filePrefix + "_" + fileSuffix + ".json"), 
            JsonConvert.SerializeObject(objects
                .Where(n => n.PositionOnScreen != null)
                .Where(n => n.Position.z <= ScreenshotManager.LevelWidths[level] && n.Position.z > previousWidth)
                .Where(n => n.Position.y <= ScreenshotManager.LevelHeights[level] + 10f))
        );
    }
}