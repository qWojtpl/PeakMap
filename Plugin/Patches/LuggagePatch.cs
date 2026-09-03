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

    private static bool _languageSet = false;
    
    [HarmonyPatch("Awake")]
    [HarmonyPostfix]
    public static void AwakePostfix(Luggage __instance)
    {
        if (!_languageSet)
        {
            LocalizedText.SetLanguage((int) LanguageSetting.Language.English);
            _languageSet = true;
        }
        DataManager.LevelInfo.Luggage.Add(new ObjectInfo
        {
            ReferenceComponent = __instance,
            Name = __instance.name,
            DisplayName = __instance.GetName(),
            Position = __instance.transform.position
        });
    }
    
}