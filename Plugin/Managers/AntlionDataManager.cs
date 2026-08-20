using System.Linq;
using PeakMap.Objects;
using UnityEngine;

namespace PeakMap.Managers;

public class AntlionDataManager
{
    public static void CreateAntlionData()
    {
        foreach(Transform antlion in Object.FindObjectsByType<Transform>(FindObjectsInactive.Include, FindObjectsSortMode.None)
                    .Where(n => n.name.Equals("AntlionHead")))
        {
            DataManager.AnimalList.Add(new ObjectInfo
            {
                Name = "Antlion",
                DisplayName = "ANTLION",
                Position = antlion.position
            });
        }
    }
}