using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

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
