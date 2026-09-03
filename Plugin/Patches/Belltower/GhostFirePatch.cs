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
        DataManager.LevelInfo.Belltowers.Remove(DataManager.LevelInfo.Belltowers.Where(n => n.InstanceID == __instance.GetInstanceID())?.First());
    }
    
}