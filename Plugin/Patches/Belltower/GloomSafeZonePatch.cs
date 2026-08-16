using HarmonyLib;
using Peak;
using PeakMap.Managers;
using PeakMap.Objects;

namespace PeakMap.Patches.Belltower;

[HarmonyPatch(typeof(GloomSafeZone))]
public class GloomSafeZonePatch
{
    [HarmonyPatch("OnEnable")]
    [HarmonyPostfix]
    public static void OnEnablePostfix(GloomSafeZone __instance)
    {
        if (__instance is not GhostFire)
        {
            return;
        }
        BelltowersDataManager.BelltowerList.Add(new ObjectInfo
        {
            InstanceID = __instance.GetInstanceID(),
            Name = __instance.name,
            Position = __instance.transform.position
        });
    }
    
}