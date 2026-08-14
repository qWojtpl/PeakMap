using HarmonyLib;
using Peak;
using PeakMap.Managers;
using PeakMap.Objects;

namespace PeakMap.Patches;

[HarmonyPatch(typeof(GhostFire))]
public class GhostFirePatch
{
    [HarmonyPatch("Start")]
    [HarmonyPostfix]
    public static void StartPostfix(GhostFire __instance)
    {
        if (__instance.startLit)
        {
            return;
        }
        BelltowersDataManager.BelltowerList.Add(new ObjectInfo
        {
            Name = __instance.name,
            Position = __instance.transform.position
        });
    }
    
}