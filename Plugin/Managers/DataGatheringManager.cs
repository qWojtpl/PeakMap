using System;
using System.IO;
using Newtonsoft.Json;
using PeakMap.Objects;
using UnityEngine;
using Zorro.Core;

namespace PeakMap.Managers;

public class DataGatheringManager
{

    private static readonly int NUM_LEVELS = 5;
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
        
        for (int i = 0; i < NUM_LEVELS; i++)
        {
            ScreenshotManager.SetupLevelDimensions(i);
        }
        
        AmuletDataManager.CreateAmuletData();
        AntlionDataManager.CreateAntlionData();
        TombDataManager.CreateTombData();
        
        for (int i = 0; i < NUM_LEVELS; i++)
        {
            ScreenshotManager.CreateFor(i, i < 3);
            DataManager.CreateData(i, DataManager.LevelInfo, i < 3);
            ScreenshotManager.Flush();
        }
        
        File.WriteAllText(Path.Combine(PeakMapPlugin.ModFolder, "info.json"), JsonConvert.SerializeObject(new GatherInfo
        {
            DataTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        }));
        
        Application.Quit();
        
    }
    
}