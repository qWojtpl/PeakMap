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
        if (DataManager.AnimalList.Any(n => n.InstanceID == __instance.GetInstanceID()))
        {
            return;
        }
        DataManager.AnimalList.Add(new ObjectInfo
        {
            InstanceID = __instance.GetInstanceID(),
            Name = "Capybara",
            DisplayName = "CAPYBARA",
            Position = __instance.transform.position
        });
    }
    
    
}