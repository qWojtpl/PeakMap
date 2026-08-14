using System.Collections.Generic;
using PeakMap.Objects;

namespace PeakMap.Managers;

public abstract class LuggageDataManager : BaseManager
{
    
    public static readonly List<ObjectInfo> LuggageList = new();

    public static void CreateLuggageData(int level)
    {
        CreateData(level, LuggageList, "luggage");
    }
    
}