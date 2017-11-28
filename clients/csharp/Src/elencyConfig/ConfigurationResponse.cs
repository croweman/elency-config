using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
