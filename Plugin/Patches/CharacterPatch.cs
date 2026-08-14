
using HarmonyLib;
using PeakMap.Managers;

namespace PeakMap.Patches;

[HarmonyPatch(typeof(Character))]
public class CharacterPatch
{
    
    [HarmonyPatch("Start")]
    [HarmonyPostfix]
    public static void StartPostfix()
    {
        DataGatheringManager.GatherData();
    }
    
}