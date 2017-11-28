using ElencyConfig.Hashers;
using NUnit.Framework;

namespace ElencyConfig.Tests.Hashers
{
    [TestFixture]
    public class HMACSHA256Tests
    {
        [Test]
        public void Hash()
        {
            var hash = HMACSHA256.Hash("TheValueToEncrypt", "aGVsbG93b3JsZA==");
            Assert.AreEqual(hash, "j8l2ru3YrVfmCsfF51eIDw4RZ9gCh9Mm0KbSm5JfeJ0=");
        }
    }
}
