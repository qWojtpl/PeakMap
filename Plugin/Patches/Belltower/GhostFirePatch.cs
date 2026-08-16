using System.Linq;
using HarmonyLib;
using PeakMap.Managers;

namespace PeakMap.Patches.Belltower;

[HarmonyPatch(typeof(GhostFire))]
public class GhostFirePatch
{

    [HarmonyPatch("Start")]
    [HarmonyPostfix]
    public static void StartPostfix(GhostFire __instance)
    {
        BelltowersDataManager.BelltowerList.Remove(BelltowersDataManager.BelltowerList.Where(n => n.InstanceID == __instance.GetInstanceID())?.First());
    }
    
}