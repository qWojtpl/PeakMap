using System.Linq;
using PeakMap.Objects;
using UnityEngine;

namespace PeakMap.Managers;

public abstract class MushroomDataManager
{

    public static void CreateMushroomData()
    {
        foreach (GroundPlaceSpawner spawner in Object.FindObjectsByType<GroundPlaceSpawner>(
                     FindObjectsInactive.Include,
                     FindObjectsSortMode.None))
        {
            if (spawner.spawns?.items == null)
            {
                continue;
            }

            string[] names = spawner.spawns.items
                .Where(n => n.prefab != null)
                .Select(n => n.prefab.name)
                .ToArray();

            if (names.Any(n => n.StartsWith("Shroomberry")) || !names.Any(n => n.StartsWith("Mushroom")))
            {
                continue;
            }

            DataManager.LevelInfo.Mushrooms.Add(new ObjectInfo
            {
                Name = "Mushroom",
                DisplayName = "MUSHROOM SPOT",
                Position = spawner.transform.position
            });
        }
    }

}
