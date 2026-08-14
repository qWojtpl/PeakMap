using System.Collections.Generic;
using PeakMap.Objects;

namespace PeakMap.Managers;

public abstract class BelltowersDataManager : BaseManager
{
    
    public static readonly List<ObjectInfo> BelltowerList = new();
    
    public static void CreateBelltowersData(int level)
    {
        CreateData(level, BelltowerList, "belltowers");
    }
    
}