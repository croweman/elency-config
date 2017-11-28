using ElencyConfig.Validation;
using NUnit.Framework;

namespace elencyConfig.Tests.Validation
{
    [TestFixture]
    public class VersionNumberTests
    {
        [TestCase("1", false)]
        [TestCase("1.", false)]
        [TestCase("1.1", false)]
        [TestCase("12.12", false)]
        [TestCase("1.1.1", true)]
        [TestCase("12.12.12", true)]
        [TestCase("1.1.1.1", false)]
        [TestCase("12.12.12.12", false)]
        [TestCase("1.1.1.1.", false)]
        [TestCase("12.12.12.12.", false)]
        [TestCase("1.1.1.1.1", false)]
        [TestCase("12.12.12.12.12", false)]
        [TestCase("a", false)]
        [TestCase("a.a", false)]
        [TestCase("a.a.a", false)]
        [TestCase("a.a.a.a", false)]
        [TestCaseAttribute(null, false)]
        [TestCase("", false)]
        [TestCase("1 1.1", false)]
        [Test]
        public void ValidateVersionNumber(string versionNumber, bool valid)
        {
            Assert.AreEqual(VersionNumber.IsValid(versionNumber), valid);
        }

    }
}
