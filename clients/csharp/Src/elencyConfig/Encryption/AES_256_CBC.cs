using System;
using System.Security.Cryptography;
using System.Text;

namespace ElencyConfig.Encryption
{
    internal static class AES_256_CBC
    {

        private static RijndaelManaged CreateRijndael()
        {
            var cipher = new RijndaelManaged();
            cipher.Mode = CipherMode.CBC;
            cipher.Padding = PaddingMode.PKCS7;
            cipher.KeySize = 256;
            cipher.BlockSize = 128;
            return cipher;
        }

        public static string[] Encrypt(string value, string password, string iv)
        {
            using (var cipher = CreateRijndael())
            {
                var encoding = new UTF8Encoding();
                var passwordBytes = Encoding.UTF8.GetBytes(password);
                var ivBytes = Encoding.UTF8.GetBytes(iv);
                cipher.Key = passwordBytes;
                cipher.IV = ivBytes;
                byte[] plainText = cipher.CreateEncryptor().TransformFinalBlock(encoding.GetBytes(value), 0, value.Length);
                var hex = BitConverter.ToString(plainText);
                return new string[] { hex.Replace("-", "").ToLower(), iv };
            }
        }

        public static string Decrypt(string[] encrypted, string password)
        {
            using (var cipher = CreateRijndael())
            {
                var encoding = new UTF8Encoding();
                var passwordBytes = Encoding.UTF8.GetBytes(password);
                var ivBytes = Encoding.UTF8.GetBytes(encrypted[1]);
                cipher.Key = passwordBytes;
                cipher.IV = ivBytes;

                var hex = encrypted[0].ToUpper();
                var raw = new byte[hex.Length / 2];
                for (var i = 0; i < raw.Length; i++)
                {
                    raw[i] = Convert.ToByte(hex.Substring(i * 2, 2), 16);
                }

                byte[] plainText = cipher.CreateDecryptor().TransformFinalBlock(raw, 0, raw.Length);
                return encoding.GetString(plainText);
            }
        }
    }
}
