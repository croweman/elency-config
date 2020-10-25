using ElencyConfig.Hashers;
using System;
// ReSharper disable IdentifierTypo

namespace ElencyConfig
{
    internal static class Authorization
    {
        public static string GenerateAuthorizationHeader(ElencyConfiguration config, string path, string method, bool hmac = false)
        {
            var dateTime1970 = new DateTime(1970, 1, 1);
            var span = DateTime.UtcNow - dateTime1970;
            var timestamp = span.TotalMilliseconds.ToString("0"); 
            var nonce = Guid.NewGuid().ToString();
            var value = $"{config.AppId}{path.ToLower()}{method.ToLower()}{nonce}{timestamp}";
            var key = hmac ? config.HMACAuthorizationKey : config.ConfigEncryptionKey;
            var signature = HMACSHA256.Hash(value, key);
            return $"{config.AppId}:{signature}:{nonce}:{timestamp}";
        }
    }
}
