using System;
using System.IO;
using Newtonsoft.Json;
using PeakMap.Objects;
using Zorro.Core;

namespace PeakMap.Managers;

public class DataGatheringManager
{
    
    private static bool initialized = false;
    
    public static void GatherData()
    {
        if (Singleton<MapHandler>.Instance?.segments?[0]?.segmentParent == null)
        {
            return;
        }
        
        if (initialized)
        {
            return;
        }
        
        initialized = true;
        
        for (int i = 0; i < 4; i++)
        {
            ScreenshotManager.SetupLevelDimensions(i);
        }

        for (int i = 0; i < 4; i++)
        {
            LuggageDataManager.CreateLuggageData(i);
            BelltowersDataManager.CreateBelltowersData(i);
        }

        for (int i = 0; i < 4; i++)
        {
            ScreenshotManager.TakeScreenshot(i);
        }
        
        File.WriteAllText(Path.Combine(PeakMapPlugin.ModFolder, "info.json"), JsonConvert.SerializeObject(new GatherInfo
        {
            DataTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        }));
        
    }
    
}