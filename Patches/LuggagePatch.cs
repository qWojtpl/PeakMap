using HarmonyLib;
using PeakMap.Managers;
using PeakMap.Objects;

namespace PeakMap.Patches;

/**
* Used to save all luggage locations
 */
[HarmonyPatch(typeof(Luggage))]
public class LuggagePatch
{
    
    [HarmonyPatch("Awake")]
    [HarmonyPostfix]
    public static void AwakePostfix(Luggage __instance)
    {
        LuggageDataManager.LuggageList.Add(new LuggageInfo
        {
            Name = __instance.GetName(),
            Position = __instance.transform.position
        });
    }
    
}