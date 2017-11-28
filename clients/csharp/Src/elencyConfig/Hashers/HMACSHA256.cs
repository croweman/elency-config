using System;
using System.Text;

namespace ElencyConfig.Hashers
{
    internal static class HMACSHA256
    {
        public static string Hash(string value, string password)
        {
            var shaKeyBytes = Convert.FromBase64String(password);

            using (var shaAlgorithm = new System.Security.Cryptography.HMACSHA256(shaKeyBytes))
            {
                var signatureBytes = Encoding.UTF8.GetBytes(value);
                var signatureHashBytes = shaAlgorithm.ComputeHash(signatureBytes);
                return Convert.ToBase64String(signatureHashBytes);
            }
        }
    }
}
