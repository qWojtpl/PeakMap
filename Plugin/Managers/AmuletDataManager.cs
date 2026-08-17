using System.Linq;
using PeakMap.Objects;
using UnityEngine;

namespace PeakMap.Managers;

public abstract class AmuletDataManager
{

    public static void CreateAmuletData()
    {
        LocalizedText.SetLanguage((int) LanguageSetting.Language.English);
        foreach (var item in Object.FindObjectsByType<FakeItem>(
                     FindObjectsInactive.Include,
                     FindObjectsSortMode.None).Where(n => n.name.ToLower().Contains("amulet")))
        {
            DataManager.AmuletList.Add(new ObjectInfo
            {
                Name = item.itemName,
                DisplayName = item.GetName(),
                Position = item.transform.position
            });
        }
    }
    
}