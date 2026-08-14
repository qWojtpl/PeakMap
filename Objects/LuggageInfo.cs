using System.Collections.Generic;
using UnityEngine;

namespace PeakMap.Objects;

public class LuggageInfo
{
    
    public static List<LuggageInfo> LuggageList = new();
    
    public string Name { get; set; }
    public Vector3 Position { get; set; }
    public Vector2 PositionOnScreen { get; set; }
    
}