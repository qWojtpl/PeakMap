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
        DataManager.AnimalList.Add(new ObjectInfo
        {
            Name = "Capybara",
            DisplayName = "CAPYBARA",
            Position = __instance.transform.position
        });
    }
    
    
}