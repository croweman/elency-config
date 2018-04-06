using System;
using System.Collections.Generic;

namespace ElencyConfig
{
    public class LocalConfiguration
    {
        public string AppVersion { get; set; }
        public string Environment { get; set; }
        public string ConfigurationId { get; set; }
        public Dictionary<string, string> ConfigurationData { get; set; }

        internal void Validate()
        {
            if (string.IsNullOrWhiteSpace(AppVersion))
            {
                throw new Exception("AppVersion has not been defined on LocalConfiguration");
            }

            if (string.IsNullOrWhiteSpace(Environment))
            {
                throw new Exception("Environment has not been defined on LocalConfiguration");
            }

            if (string.IsNullOrWhiteSpace(ConfigurationId))
            {
                throw new Exception("ConfigurationId has not been defined on LocalConfiguration");
            }

            if (ConfigurationData == null)
            {
                throw new Exception("configurationData has not been defined on LocalConfiguration");
            }
        }
    }
}
