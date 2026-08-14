using System.Threading.Tasks;
using HarmonyLib;
using PeakMap.Managers;

namespace PeakMap.Patches;

[HarmonyPatch(typeof(Character))]
public class CharacterPatch
{

    [HarmonyPatch("Start")]
    [HarmonyPostfix]
    public static void StartPostfix()
    {
        for (int i = 0; i < 2; i++)
        {
            ScreenshotManager.TakeScreenshot(i);
            LuggageDataManager.CreateLuggageData(i);
        }
    }
    
}