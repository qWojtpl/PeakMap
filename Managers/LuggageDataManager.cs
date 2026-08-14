using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using PeakMap.Objects;
using UnityEngine;

namespace PeakMap.Managers;

public class LuggageDataManager
{
    
    public static List<LuggageInfo> LuggageList = new();

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
        
        File.WriteAllText(
            Path.Combine(PeakMapPlugin.ModFolder, "level_" + level + "_luggage.json"), 
            JsonConvert.SerializeObject(LuggageList.Where(n => n.PositionOnScreen != null))
        );
        
    }
    
}