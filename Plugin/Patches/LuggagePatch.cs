using HarmonyLib;
using PeakMap.Managers;
using PeakMap.Objects;

namespace PeakMap.Patches;

/**
* Used to save all luggage locations
 */
[HarmonyPatch(typeof(Luggage))]
public class LuggagePatch
{
    
    [HarmonyPatch("Awake")]
    [HarmonyPostfix]
    public static void AwakePostfix(Luggage __instance)
    {
        LocalizedText.SetLanguage((int) LanguageSetting.Language.English);
        DataManager.LuggageList.Add(new ObjectInfo
        {
            ReferenceComponent = __instance,
            Name = __instance.name,
            DisplayName = __instance.GetName(),
            Position = __instance.transform.position
        });
    }
    
}