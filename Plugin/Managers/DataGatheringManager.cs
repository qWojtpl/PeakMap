using System.Collections.Generic;
using System.IO;
using PeakMap.Patches.Automation;
using Zorro.Core;

namespace PeakMap.Managers;

public class DataGatheringManager
{

    private static readonly int NUM_LEVELS = 5;
    public static bool Available { get; set; } = true;
    
    public static void GatherData()
    {
        if (Singleton<MapHandler>.Instance?.segments?[0]?.segmentParent == null)
        {
            return;
        }
        
        if (!Available)
        {
            return;
        }

        Available = false;
        
        Directory.CreateDirectory(Path.Combine(PeakMapPlugin.ModFolder, AirportCheckInKioskPatch.CurrentLevel));
        
        List<string> biomes = new();
        AirportCheckInKioskPatch.LevelBiomes[AirportCheckInKioskPatch.CurrentLevel] = biomes;
        
        for (int i = 0; i < NUM_LEVELS; i++)
        {
            ScreenshotManager.SetupLevelDimensions(i);
        }
        
        ScreenshotManager.FillBiomeNames(biomes);
        
        AmuletDataManager.CreateAmuletData();
        AntlionDataManager.CreateAntlionData();
        TombDataManager.CreateTombData();
        
        for (int i = 0; i < NUM_LEVELS; i++)
        {
            ScreenshotManager.CreateFor(i, i < 3);
            DataManager.CreateData(i, DataManager.LevelInfo, i < 3);
            ScreenshotManager.Flush();
        }

        ScreenshotManager.ResetValues();

    }
    
}