using HarmonyLib;
using PeakMap.Managers;
using PeakMap.Objects;

namespace PeakMap.Patches;

[HarmonyPatch(typeof(ItemComponent))]
public class ItemComponentPatch
{

    [HarmonyPatch("Awake")]
    [HarmonyPostfix]
    public static void AwakePostfix(ItemComponent __instance)
    {
        if (__instance is Beehive)
        {
            DataManager.LevelInfo.Animals.Add(new ObjectInfo
            {
                Name = "Beehive",
                DisplayName = "BEEHIVE",
                Position = __instance.transform.position
            });
        }
    }
    
}