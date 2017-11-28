using ElencyConfig.Hashers;
using System;

namespace ElencyConfig
{
    internal class Authorization
    {

        public static string GenerateAuthorizationHeader(ElencyConfiguration config, string path, string method, bool hmac = false)
        {
            var dateTime1970 = new DateTime(1970, 1, 1);
            var span = DateTime.UtcNow - dateTime1970;
            var timestamp = span.TotalMilliseconds.ToString("0"); 
            var nonce = Guid.NewGuid().ToString();
            var value = string.Format("{0}{1}{2}{3}{4}",
                config.AppId,
                path.ToLower(),
                method.ToLower(),
                nonce,
                timestamp);
            var key = (hmac == true ? config.HMACAuthorizationKey : config.ConfigEncryptionKey);
            var signature = HMACSHA256.Hash(value, key);
            return string.Format("{0}:{1}:{2}:{3}",
                config.AppId,
                signature,
                nonce,
                timestamp);
        }
    }
}
