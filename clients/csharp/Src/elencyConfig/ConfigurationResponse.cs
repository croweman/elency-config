// ReSharper disable IdentifierTypo
// ReSharper disable InconsistentNaming
namespace ElencyConfig
{
    internal class ConfigurationResponse
    {
        public string appVersion { get; set; }
        
        public string environment { get; set; }
        
        public string configurationId { get; set; }
        
        public string configurationHash { get; set; }
        
        public ConfigurationItem[] configuration { get; set; }
    }
}
