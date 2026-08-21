using System.Collections.Generic;
using System.Linq;
using BepInEx.Logging;
using PeakMap.Objects;
using UnityEngine;
using Zorro.Core;
using Object = UnityEngine.Object;

namespace PeakMap.Managers;

public abstract class TombDataManager
{
    
    public static void CreateTombData()
    {

        MapHandler.MapSegment segment = Singleton<MapHandler>.Instance.segments[2];

        if (segment.biome != Biome.BiomeType.Mesa)
        {
            return;
        }
        
        Transform segmentParent = segment.segmentParent.transform;
        
        Transform entrance = segmentParent
            .GetComponentsInChildren<Transform>(true)
                .FirstOrDefault(n => n.name.Equals("Desert_Segment"))?
            .GetComponentsInChildren<Transform>(true)
                .FirstOrDefault(n => n.name.Equals("Platteau"))?
            .GetComponentsInChildren<Transform>(true)
                .FirstOrDefault(n => n.name.Equals("Rocks"))?
            .GetComponentsInChildren<Transform>(true)
                .FirstOrDefault(n => n.name.Equals("Timple"))?
            .GetComponentsInChildren<Transform>(true)
                .FirstOrDefault(n => n.name.Equals("Enterences"))?
            .GetComponentsInChildren<Transform>(true)
                .FirstOrDefault(n => n.name.Equals("2"));

        if (entrance == null)
        {
            PeakMapPlugin.Log.LogError("Failed to find tomb entrance!");
            return;
        }
        
        if (entrance.childCount == 0)
        {
            PeakMapPlugin.Log.LogError("Tomb seems to be closed!");
            return;
        }
        
        DataManager.TombList.Add(new ObjectInfo
        {
            Name = "Tomb",
            DisplayName = "TOMB",
            Position = entrance.position,
        });
    }
    
}