using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace ElencyConfig
{
    [DataContract]
    internal class ConfigurationResponse
    {
        [DataMember]
        public string appVersion { get; set; }

        [DataMember]
        public string environment { get; set; }

        [DataMember]
        public string configurationId { get; set; }

        [DataMember]
        public string configurationHash { get; set; }

        [DataMember]
        public ConfigurationItem[] configuration { get; set; }
    }
}
