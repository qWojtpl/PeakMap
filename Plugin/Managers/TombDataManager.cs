using System.Collections.Generic;
using System.Linq;
using PeakMap.Objects;
using UnityEngine;
using Object = UnityEngine.Object;

namespace PeakMap.Managers;

public abstract class TombDataManager : BaseManager
{
    
    public static void CreateTombData(int level)
    {
        TombTrigger tomb = Object.FindFirstObjectByType<TombTrigger>(FindObjectsInactive.Include);

        if (tomb == null)
        {
            return;
        }
        
        Transform entrance = Object.FindObjectsByType<Transform>(FindObjectsInactive.Include, FindObjectsSortMode.None).FirstOrDefault(n => n.name.Equals("SpecialDay Mesa Tomb"));
        
        if (entrance == null)
        {
            return;
        }
            
        Vector3 entrancePosition = new Vector3(entrance.position.x, entrance.position.y + 150, entrance.position.z);
        
        CreateData(level, new List<ObjectInfo>
        {
            new()
            {
                Name = "Tomb",
                Position = entrancePosition,
            }
        }, "tomb");
    }
    
}