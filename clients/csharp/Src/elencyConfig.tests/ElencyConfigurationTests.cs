using NUnit.Framework;
using System;

namespace ElencyConfig.Tests
{
    [TestFixture]
    public class ElencyConfigurationTests
    {
        const string EncryptionKey = "NTY4dUppMWEyQDM0NThqaGhGYSFhYQ==";
        const string HMACAuthorizationKey = "MzY4dUBKaTFhMjM0ODIxamhoRmEhYWE=";

        [Test]
        public void ValidateDoesNotThrowAnExceptionIfRequiredPropertiesArePopulated()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };
            configuration.Validate();
        }

        [Test]
        public void ValidateThrowsAnExceptionIfUriIsNotProvided()
        {
            var configuration = new ElencyConfiguration()
            {
                AppId = "proj",
                AppVersion = "1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("Uri has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfUriIsEmpty()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "",
                AppId = "proj",
                AppVersion = "1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("Uri has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfAppIdIsNotProvided()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppVersion = "1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("AppId has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfAppIdIsEmpty()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "",
                AppVersion = "1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("AppId has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfEnvironmentIsNotProvided()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("Environment has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfEnvironmentIsEmpty()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1",
                Environment = "",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("Environment has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfAppVersionIsNotProvided()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("valid AppVersion has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfAppVersionIsNotValid()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("valid AppVersion has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfAppVersionIsAOnePartVersionNumber()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("valid AppVersion has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfAppVersionIsATwoPartVersionNumber()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("valid AppVersion has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfAppVersionIsAFourPartVersionNumber()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("valid AppVersion has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfAppVersionIsAFivePartVersionNumber()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("valid AppVersion has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfHMACAuthorizationKeyIsNotProvided()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1",
                Environment = "prod",
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("HMACAuthorizationKey has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfHMACAuthorizationKeyIsEmpty()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = "",
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("HMACAuthorizationKey has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfHMACAuthorizationKeyIsNot32Characters()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = "a",
                ConfigEncryptionKey = EncryptionKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("HMACAuthorizationKey length should be 32"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfConfigEncryptionKeyIsNotProvided()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("ConfigEncryptionKey has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfConfigEncryptionKeyIsEmpty()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = ""
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("ConfigEncryptionKey has not been defined"));
        }

        [Test]
        public void ValidateThrowsAnExceptionIfConfigEncryptionKeyIsNot32Characters()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "http://localhost:8080",
                AppId = "proj",
                AppVersion = "1.1.1",
                Environment = "prod",
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = "a"
            };

            var ex = Assert.Throws<Exception>(() => configuration.Validate());
            Assert.That(ex.Message, Is.EqualTo("ConfigEncryptionKey length should be 32"));
        }
    }
}
