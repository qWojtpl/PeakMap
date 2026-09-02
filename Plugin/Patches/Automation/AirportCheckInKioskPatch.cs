using HarmonyLib;

namespace PeakMap.Patches.Automation;

[HarmonyPatch(typeof(AirportCheckInKiosk), nameof(AirportCheckInKiosk.BeginIslandLoadRPC))]
public class AirportCheckInKioskPatch
{

    public static void Prefix(ref string sceneName)
    {
        // sceneName = "Level_4";
    }
    
}