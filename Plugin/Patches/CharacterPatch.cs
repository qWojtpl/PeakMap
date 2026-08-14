
using HarmonyLib;
using PeakMap.Managers;
using Zorro.Core;

namespace PeakMap.Patches;

[HarmonyPatch(typeof(Character))]
public class CharacterPatch
{

    private static bool initialized = false;
    
    [HarmonyPatch("Start")]
    [HarmonyPostfix]
    public static void StartPostfix()
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
            ScreenshotManager.SetupWidth(i);
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
    }
    
}