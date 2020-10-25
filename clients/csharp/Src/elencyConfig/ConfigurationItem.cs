// ReSharper disable IdentifierTypo
// ReSharper disable InconsistentNaming
namespace ElencyConfig
{
    internal class ConfigurationItem
    {
        public string key { get; set; }
        
        public string[] value { get; set; }
        
        public bool encrypted { get; set; }
    }
}
