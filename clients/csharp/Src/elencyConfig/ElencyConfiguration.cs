using ElencyConfig.Validation;
using System;
using System.Text.RegularExpressions;
// ReSharper disable IdentifierTypo

namespace ElencyConfig
{
    public class ElencyConfiguration
    {
        public int RefreshInterval { get; set; }
        public string Uri { get; set; }
        public string AppId { get; set; }
        public string Environment { get; set; }
        public string AppVersion { get; set; }
        public string HMACAuthorizationKey { get; set; }
        public string ConfigEncryptionKey { get; set; }
        public Action Retrieved { get; set; }
        public Action<Exception> RefreshFailure { get; set; }

        public int? RequestTimeout { get; set; }

        public LocalConfiguration LocalConfiguration { get; set; }
    
        internal void Validate()
        {
            if (string.IsNullOrWhiteSpace(Uri))
            {
                throw new Exception("Uri has not been defined");
            }

            if (string.IsNullOrWhiteSpace(AppId))
            {
                throw new Exception("AppId has not been defined");
            }

            if (string.IsNullOrWhiteSpace(Environment))
            {
                throw new Exception("Environment has not been defined");
            }

            if (string.IsNullOrWhiteSpace(AppVersion) || !VersionNumber.IsValid(AppVersion))
            {
                throw new Exception("valid AppVersion has not been defined");
            }

            if (string.IsNullOrWhiteSpace(HMACAuthorizationKey) || HMACAuthorizationKey.Trim().Length == 0)
            {
                throw new Exception("HMACAuthorizationKey has not been defined");        
            }

            if (HMACAuthorizationKey.Trim().Length != 32)
            {
                throw new Exception("HMACAuthorizationKey length should be 32");
            }

            if (!new Regex("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$").IsMatch(HMACAuthorizationKey))
            { 
                throw new Exception("HMACAuthorizationKey must be a Base64 encoded string");
            }

            if (string.IsNullOrWhiteSpace(ConfigEncryptionKey) || ConfigEncryptionKey.Trim().Length == 0)
            {
                throw new Exception("ConfigEncryptionKey has not been defined");
            }

            if (ConfigEncryptionKey.Trim().Length != 32)
            {
                throw new Exception("ConfigEncryptionKey length should be 32");
            }

            if (!new Regex("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$").IsMatch(ConfigEncryptionKey))
            {
                throw new Exception("ConfigEncryptionKey must be a Base64 encoded string");
            }

            LocalConfiguration?.Validate();
        }
    }
}
