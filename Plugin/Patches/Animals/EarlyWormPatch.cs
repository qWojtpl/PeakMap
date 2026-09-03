using HarmonyLib;
using Peak;
using PeakMap.Managers;
using PeakMap.Objects;

namespace PeakMap.Patches.Animals;

[HarmonyPatch(typeof(EarlyWorm))]
public class EarlyWormPatch
{

    [HarmonyPatch("OnEnable")]
    [HarmonyPostfix]
    public static void OnEnablePostfix(EarlyWorm __instance)
    {
        DataManager.LevelInfo.Animals.Add(new ObjectInfo
        {
            Name = "EarlyWorm",
            DisplayName = "EARLY WORM",
            Position = __instance.transform.position
        });
    }

}