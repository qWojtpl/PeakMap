using System.Linq;
using HarmonyLib;
using PeakMap.Managers;
using PeakMap.Objects;

namespace PeakMap.Patches.Animals;

[HarmonyPatch(typeof(Capybara))]
public class CapybaraPatch
{

    [HarmonyPatch("OnEnable")]
    [HarmonyPostfix]
    public static void OnEnablePostfix(Capybara __instance)
    {
        if (DataManager.LevelInfo.Animals.Any(n => n.InstanceID == __instance.GetInstanceID()))
        {
            return;
        }
        DataManager.LevelInfo.Animals.Add(new ObjectInfo
        {
            InstanceID = __instance.GetInstanceID(),
            Name = "Capybara",
            DisplayName = "CAPYBARA",
            Position = __instance.transform.position
        });
    }
    
    
}