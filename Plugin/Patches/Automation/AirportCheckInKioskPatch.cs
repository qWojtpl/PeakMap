using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using HarmonyLib;
using Newtonsoft.Json;
using PeakMap.Objects;
using UnityEngine;

namespace PeakMap.Patches.Automation;

[HarmonyPatch(typeof(AirportCheckInKiosk), nameof(AirportCheckInKiosk.BeginIslandLoadRPC))]
public class AirportCheckInKioskPatch
{

    private static List<string> AllLevels { get; } = new();
    private static string TodayLevel { get; set; }
    private static int _levelCounter = 0;
    public static string CurrentLevel { get; private set; }
    public static Dictionary<string, List<string>> LevelBiomes { get; } = new();

    public static void Prefix(ref string sceneName)
    {
        if (TodayLevel == null)
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
                    AllLevels.Add(Path.GetFileNameWithoutExtension(scenePath));
                }

                if (!alreadyLoaded)
                {
                    bundle.Unload(false);
                }
            }

            TodayLevel = sceneName;
            PeakMapPlugin.Log.LogInfo($"Loaded {AllLevels.Count} scenes, today scene: {TodayLevel}");
        }

        if (_levelCounter == AllLevels.Count)
        {
            DateTime date = DateTime.UtcNow;
            if (date.Hour < 17)
            {
                date = date.AddDays(-1);
            }
            File.WriteAllText(Path.Combine(PeakMapPlugin.ModFolder, "info.json"), JsonConvert.SerializeObject(new GatherInfo
            {
                StartLevel = TodayLevel,
                StartDate = date.Day + "-" + date.Month + "-" + date.Year,
                LevelBiomes = LevelBiomes,
            }));
            Application.Quit();
            return;
        }
        
        sceneName = AllLevels[_levelCounter];
        CurrentLevel = sceneName;
        _levelCounter++;
    }
    
}