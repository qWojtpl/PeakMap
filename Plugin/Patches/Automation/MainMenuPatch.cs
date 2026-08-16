using System.Collections;
using HarmonyLib;
using Zorro.Core;

namespace PeakMap.Patches.Automation;

[HarmonyPatch(typeof(MainMenu))]
public class MainMenuPatch
{
    
    [HarmonyPatch("Start")]
    [HarmonyPostfix]
    public static void StartPostfix()
    {
        RetrievableResourceSingleton<LoadingScreenHandler>.Instance.Load(LoadingScreen.LoadingScreenType.Basic, null, StartOfflineModeRoutine());
    }
    
    private static IEnumerator StartOfflineModeRoutine()
    {
        yield return MainMenu.DisconnectForOfflineMode();
        yield return RetrievableResourceSingleton<LoadingScreenHandler>.Instance.LoadSceneProcess("Airport", networked: false, yieldForCharacterSpawn: true);
    }
    
}