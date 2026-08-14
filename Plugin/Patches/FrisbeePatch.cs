using HarmonyLib;
using PeakMap.Managers;

namespace PeakMap.Patches;

/**
* Frisbee spawns at the start, so we can gather data after Frisbee enable
 */
[HarmonyPatch(typeof(Frisbee))]
public class FrisbeePatch
{

    [HarmonyPatch("OnEnable")]
    [HarmonyPostfix]
    public static void OnEnablePostfix()
    {
        ScreenshotManager.TakeScreenshot(0);
        LuggageDataManager.CreateLuggageData(0);
    }
    
}