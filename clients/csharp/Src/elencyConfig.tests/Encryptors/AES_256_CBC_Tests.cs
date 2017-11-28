using ElencyConfig.Encryption;
using NUnit.Framework;
using System;
using System.Text;

namespace ElencyConfig.Tests.Encryptors
{
    [TestFixture]
    public class AES_256_CBC_Tests
    {
       
        const string _password = "th15154p455w0rd!th15154p455w0rd!";
        string _iv = "42d1e9706b63140c";
        
        [Test]
        public void CorrectlyEncryptsAString()
        {
            var value = AES_256_CBC.Encrypt("TheValueToEncrypt", _password, _iv);
            Assert.AreEqual(value.Length, 2);
            Assert.AreEqual(value[0], "5cc4051bc64227f25ca14836005156fc8afa0b3be93115fe2fb6cb3a3a3dd217");
            Assert.AreEqual(value[1], "42d1e9706b63140c");
        }

        [Test]
        public void CorrectlyDecryptsAString()
        {
            var encrypted = AES_256_CBC.Encrypt("TheValueToEncrypt", _password, _iv);
            var decryptedValue = AES_256_CBC.Decrypt(encrypted, _password);
            Assert.AreEqual(decryptedValue, "TheValueToEncrypt");
        }

    }
}
