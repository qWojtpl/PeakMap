using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using PeakMap.Objects;
using UnityEngine;

namespace PeakMap.Managers;

public abstract class BaseManager
{
    protected static void CreateData(int level, List<ObjectInfo> objects, string fileSuffix)
    {
        foreach (ObjectInfo info in objects)
        {
            Vector2 positionOnScreen = new Vector2();
            if (ScreenshotManager.GetObjectScreenPosition(level, info.Position, out positionOnScreen))
            {
                info.PositionOnScreen = positionOnScreen;
            }
        }

        float previousWidth = -500;
        if(level > 0) {
            previousWidth = ScreenshotManager.LevelWidths[level - 1];
        }
        
        File.WriteAllText(
            Path.Combine(PeakMapPlugin.ModFolder, "level_" + level + "_" + fileSuffix + ".json"), 
            JsonConvert.SerializeObject(objects
                .Where(n => n.Position.z <= ScreenshotManager.LevelWidths[level] && n.Position.z > previousWidth)
                .Where(n => n.PositionOnScreen != null))
        );
        
    }
}