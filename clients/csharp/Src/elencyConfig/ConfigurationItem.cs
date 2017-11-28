using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ElencyConfig
{
    internal class ConfigurationItem
    {
        public string key { get; set; }
        public string[] value { get; set; }
        public bool encrypted { get; set; }
    }
}
