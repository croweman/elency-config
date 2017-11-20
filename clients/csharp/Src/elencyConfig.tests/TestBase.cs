using ElencyConfig.Hashers;
using Nock.net;
using NUnit.Framework;
using System.IO;
using System.Reflection;

namespace ElencyConfig.Tests
{
    public class TestBase
    {
        protected const string EncryptionKey = "NTY4dUppMWEyQDM0NThqaGhGYSFhYQ==";
        protected const string HMACAuthorizationKey = "MzY4dUBKaTFhMjM0ODIxamhoRmEhYWE=";

        protected string GetEmbeddedResource(string resourceName)
        {
            var assembly = Assembly.GetExecutingAssembly();
            using (var stream = assembly.GetManifestResourceStream(resourceName))
            using (var reader = new StreamReader(stream))
            {
                return reader.ReadToEnd();
            }
        }

        protected string GenerateSignature(string appId, string path, string method, string nonce, string timestamp, string authorizationKey)
        {
            var value = string.Format("{0}{1}{2}{3}{4}",
                appId, path, method, nonce, timestamp);
            return HMACSHA256.Hash(value, authorizationKey);
        }

        protected bool MatchAuthorizationHeader(string authorizationHeader, string path, string method, bool accessToken = false)
        {
            if (string.IsNullOrEmpty(authorizationHeader))
            {
                return false;
            }

            var parts = authorizationHeader.Split(':');

            if (parts.Length != 4)
            {
                return false;
            }

            var appId = parts[0];
            var nonce = parts[2];
            var timestamp = parts[3];

            var authorizationKey = (accessToken == true ? HMACAuthorizationKey : EncryptionKey);
            var signature = GenerateSignature(appId, path, method, nonce, timestamp, authorizationKey);
            return parts[1] == signature;
        }
    }
}
