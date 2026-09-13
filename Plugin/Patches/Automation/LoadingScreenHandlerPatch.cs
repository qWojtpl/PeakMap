using System.Collections;
using System.Linq;
using HarmonyLib;
using PeakMap.Managers;
using PeakMap.Objects;
using UnityEngine;

namespace PeakMap.Patches.Automation;

[HarmonyPatch(typeof(LoadingScreenHandler))]
public class LoadingScreenHandlerPatch
{

    [HarmonyPatch("LoadingRoutine")]
    [HarmonyPostfix]
    public static void LoadingRoutinePostfix(ref IEnumerator __result)
    {
        __result = WrapLoadingRoutine(__result);
    }
    
    private static IEnumerator WrapLoadingRoutine(IEnumerator original)
    {
        while (original.MoveNext())
        {
            yield return original.Current;
        }
        
        Item passportItem = Object.FindObjectsByType<Item>(FindObjectsInactive.Include, FindObjectsSortMode.None)
            .FirstOrDefault(n => n.name.Equals("Passport(Clone)"));

        if (passportItem != null)
        {
            PeakMapPlugin.Log.LogWarning("Found passport, loading scene...");
            Object.FindFirstObjectByType<AirportCheckInKiosk>(FindObjectsInactive.Include).StartGame(0);
        }
        else
        {
            PeakMapPlugin.Log.LogWarning("Passport not found, loading next scene...");
            GameHandler.GetService<ConnectionService>().StateMachine.SwitchState<DisconnectingState>();
            NetworkConnector.LeaveRoom();
            DataManager.LevelInfo.Clear();
            DataGatheringManager.Available = true;
        }
    }
    
}