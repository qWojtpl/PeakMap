using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using PeakMap.Objects;
using UnityEngine;

namespace PeakMap.Managers;

public static class LuggageDataManager
{
    
    public static readonly List<LuggageInfo> LuggageList = new();

    public static void CreateLuggageData(int level)
    {
        foreach (LuggageInfo info in LuggageList)
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
            Path.Combine(PeakMapPlugin.ModFolder, "level_" + level + "_luggage.json"), 
            JsonConvert.SerializeObject(LuggageList
                .Where(n => n.Position.z <= ScreenshotManager.LevelWidths[level] && n.Position.z > previousWidth)
                .Where(n => n.PositionOnScreen != null))
        );
        
    }
    
}