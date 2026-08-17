using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using Peak;
using PeakMap.Objects;
using UnityEngine;
using Zorro.Core;
using Object = UnityEngine.Object;

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
        
        for (int i = 0; i < NUM_LEVELS; i++)
        {
            ScreenshotManager.TakeScreenshot(i);
        }
        
        AmuletDataManager.CreateAmuletData();

        PeakMapPlugin.Log.LogWarning("Writing data...");
        for (int i = 0; i < NUM_LEVELS; i++)
        {
            DataManager.CreateData(i, DataManager.LuggageList, "luggage");
            DataManager.CreateData(i, DataManager.BelltowerList, "belltowers");
            DataManager.CreateData(i, DataManager.AnimalList, "animals");
            DataManager.CreateData(i, DataManager.AmuletList, "amulets");
            TombDataManager.CreateTombData(i);
        }
        
        File.WriteAllText(Path.Combine(PeakMapPlugin.ModFolder, "info.json"), JsonConvert.SerializeObject(new GatherInfo
        {
            DataTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        }));
        
        Application.Quit();
        
    }
    
}