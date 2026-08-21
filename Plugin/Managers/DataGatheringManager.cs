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
            DataManager.CreateData(i, DataManager.BelltowerList, "belltowers", i < 3);
            ScreenshotManager.CreateFor(i, i < 3);
            DataManager.CreateData(i, DataManager.LuggageList, "luggage", i < 3);
            DataManager.CreateData(i, DataManager.AnimalList, "animals", i < 3);
            DataManager.CreateData(i, DataManager.AmuletList, "amulets", i < 3);
            DataManager.CreateData(i, DataManager.TombList, "tombs", i < 3);
            ScreenshotManager.Flush();
        }
        
        File.WriteAllText(Path.Combine(PeakMapPlugin.ModFolder, "info.json"), JsonConvert.SerializeObject(new GatherInfo
        {
            DataTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        }));
        
        Application.Quit();
        
    }
    
}