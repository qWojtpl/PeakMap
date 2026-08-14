using System.Collections.Generic;
using Newtonsoft.Json;
using UnityEngine;

namespace PeakMap.Objects;

public class LuggageInfo
{
    
    public string Name { get; set; }
    
    [JsonIgnore]
    public Vector3 Position { get; set; }
    
    [JsonIgnore]
    public Vector2? PositionOnScreen { get; set; }
    
    [JsonProperty("Position")]
    public float[] PositionArray => new[] {Position.x, Position.y, Position.z };
    
    [JsonProperty("PositionOnScreen")]
    public float[] PositionOnScreenArray => PositionOnScreen.HasValue ? new[] { PositionOnScreen.Value.x, PositionOnScreen.Value.y } : null;

}