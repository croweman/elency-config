using System.Runtime.Serialization;

namespace ElencyConfig
{
    [DataContract]
    internal class ConfigurationItem
    {
        [DataMember]
        public string key { get; set; }

        [DataMember]
        public string[] value { get; set; }

        [DataMember]
        public bool encrypted { get; set; }
    }
}
