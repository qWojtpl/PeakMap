using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using BepInEx;
using HarmonyLib;
using Newtonsoft.Json;
using PeakMap.Objects;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace PeakMap.Patches.Automation;

[HarmonyPatch(typeof(AirportCheckInKiosk), nameof(AirportCheckInKiosk.BeginIslandLoadRPC))]
public class AirportCheckInKioskPatch
{

    private static List<string> AllScenes { get; } = new();
    private static string TodayScene { get; set; }
    private static int _sceneCounter = 0;
    public static string CurrentScene { get; private set; }
    public static Dictionary<string, DayInfo> SceneDayInfo { get; } = new();

    public static void Prefix(ref string sceneName)
    {
        if (TodayScene == null)
        {
            foreach (string bundlePath in Directory.GetFiles(Path.Combine(Application.streamingAssetsPath, "maps"), "*.assetbundle"))
            {
                string bundleName = Path.GetFileName(bundlePath);

                AssetBundle bundle = AssetBundle.GetAllLoadedAssetBundles()
                    .FirstOrDefault(b => b.name == bundleName);

                bool alreadyLoaded = bundle != null;

                bundle ??= AssetBundle.LoadFromFile(bundlePath);

                if (bundle == null)
                {
                    continue;
                }

                foreach (string scenePath in bundle.GetAllScenePaths())
                {
                    PeakMapPlugin.Log.LogInfo(scenePath);
                    AllScenes.Add(Path.GetFileNameWithoutExtension(scenePath));
                }

                if (!alreadyLoaded)
                {
                    bundle.Unload(false);
                }
            }

            TodayScene = sceneName;
        }

        if (_sceneCounter == AllScenes.Count)
        {
            Dictionary<string, DayInfo> dayLevels = new();
            
            int start = AllScenes.IndexOf(TodayScene);
            int counter = start;
            DateTime date = DateTime.UtcNow;
            while (true)
            {
                dayLevels.Add(date.Day + "-" + date.Month + "-" + date.Year, SceneDayInfo[AllScenes[counter]]);
                date = date.AddDays(1);
                counter++;
                if (counter == AllScenes.Count)
                {
                    counter = 0;
                }

                if (counter == start)
                {
                    break;
                }
            }
            File.WriteAllText(Path.Combine(PeakMapPlugin.ModFolder, "info.json"), JsonConvert.SerializeObject(new GatherInfo
            {
                DayLevels = dayLevels
            }));
            Application.Quit();
            return;
        }
        
        sceneName = AllScenes[_sceneCounter];
        CurrentScene = sceneName;
        _sceneCounter++;
    }
    
}