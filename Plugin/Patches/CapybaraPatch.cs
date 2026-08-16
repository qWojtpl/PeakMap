using HarmonyLib;
using PeakMap.Managers;
using PeakMap.Objects;

namespace PeakMap.Patches;

[HarmonyPatch(typeof(Capybara))]
public class CapybaraPatch
{

    [HarmonyPatch("OnEnable")]
    [HarmonyPostfix]
    public static void OnEnablePostfix(Capybara __instance)
    {
        CapybaraDataManager.CapybaraList.Add(new ObjectInfo
        {
            Name = "Capybara",
            Position = __instance.transform.position
        });
    }
    
    
}