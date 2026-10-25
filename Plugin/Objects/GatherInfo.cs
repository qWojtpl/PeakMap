using System.Collections.Generic;

namespace PeakMap.Objects;

public class GatherInfo
{

    public string StartDate;
    public string StartLevel;
    public Dictionary<string, List<string>> LevelBiomes = new();

}