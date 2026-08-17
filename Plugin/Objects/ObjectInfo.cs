using System.Collections.Generic;
using Newtonsoft.Json;
using UnityEngine;

namespace PeakMap.Objects;

public class ObjectInfo
{
    
    [JsonIgnore]
    public int? InstanceID { get; set; }
    
    public string Name { get; set; }
    
    public string DisplayName { get; set; }
    
    [JsonIgnore]
    public Vector3 Position { get; set; }
    
    [JsonIgnore]
    public Vector2? PositionOnScreen { get; set; }
    
    [JsonProperty("PositionOnScreen")]
    public float[] PositionOnScreenArray => PositionOnScreen.HasValue ? new[] { PositionOnScreen.Value.x, PositionOnScreen.Value.y } : null;

}