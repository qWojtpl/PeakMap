using System.Collections.Generic;
using PeakMap.Objects;

namespace PeakMap.Managers;

public abstract class CapybaraDataManager : BaseManager
{
    
    public static readonly List<ObjectInfo> CapybaraList = new();
    
    public static void CreateCapybaraData(int level)
    {
        CreateData(level, CapybaraList, "capybara");
    }
    
}