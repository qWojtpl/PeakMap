using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using PeakMap.Objects;

namespace PeakMap.Managers;

public abstract class DataManager
{
    
    public static readonly List<ObjectInfo> LuggageList = new();
    public static readonly List<ObjectInfo> BelltowerList = new();
    public static readonly List<ObjectInfo> AnimalList = new();
    public static readonly List<ObjectInfo> AmuletList = new();
    
    public static void CreateData(int level, List<ObjectInfo> objects, string fileSuffix)
    {
        
        foreach (ObjectInfo info in objects)
        {
            if (ScreenshotManager.GetObjectScreenPosition(level, info.Position, out var positionOnScreen))
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
                .Where(n => n.PositionOnScreen != null)
                .Where(n => n.Position.z <= ScreenshotManager.LevelWidths[level] && n.Position.z > previousWidth)
                .Where(n => n.Position.y <= ScreenshotManager.LevelHeights[level] + 10f))
        );
        
    }
}