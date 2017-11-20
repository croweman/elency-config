using NUnit.Framework;
using System;
using System.Threading.Tasks;
using Nock.net;
using System.Net;
using System.Collections.Specialized;

namespace ElencyConfig.Tests
{
    [TestFixture]
    public class ElencyConfigClientUnhappyPathTests : TestBase
    {

        [Test]
        public async Task InitThrowsAnExceptionIfInstantiatedWithNoConfiguration()
        {
            try
            {
                var client = new ElencyConfigClient();
                await client.Init(null);
                Assert.Fail("Should not have got here");
            }
            catch (Exception ex)
            {
                Assert.AreEqual("You must define a configuration", ex.Message);
            }
        }

        [Test]
        public async Task InitThrowsAnExceptionIfInstantiatedWithInvalidConfiguration()
        {
            try
            {
                var client = new ElencyConfigClient();
                await client.Init(new ElencyConfiguration());
                Assert.Fail("Should not have got here");
            }
            catch (Exception ex)
            {
                Assert.AreEqual("Uri has not been defined", ex.Message);
            }
        }

        [Test]
        public void GetThrowsAnExceptionIfClientIsNotInitialised()
        {
            try
            {
                var client = new ElencyConfigClient();
                client.Get("KeyOne");
                Assert.Fail("An error was not defined");
            }
            catch (Exception ex)
            {
                Assert.AreEqual("The client has not been successfully initialized", ex.Message);
            }
        }

        [Test]
        public void GetAllKeysThrowsAnExceptionIfClientIsNotInitialised()
        {
            try
            {
                var client = new ElencyConfigClient();
                client.GetAllKeys();
                Assert.Fail("An error was not defined");
            }
            catch (Exception ex)
            {
                Assert.AreEqual("The client has not been successfully initialized", ex.Message);
            }
        }


        [Test]
        public async Task RefreshThrowsAnExceptionIfClientIsNotInitialised()
        {
            try
            {
                var client = new ElencyConfigClient();
                await client.Refresh();
                Assert.Fail("An error was not defined");
            }
            catch (Exception ex)
            {
                Assert.AreEqual("The client has not been successfully initialized", ex.Message);
            }
        }


        [Test]
        public async Task InitThrowsAnExceptionWhenItCannotConnectToElencyConfigServer()
        {
            try
            {
                var config = new ElencyConfiguration()
                {
                    Uri = "http://localhost:8080",
                    AppId = "proj",
                    AppVersion = "1.1.1",
                    Environment = "prod",
                    HMACAuthorizationKey = HMACAuthorizationKey,
                    ConfigEncryptionKey = EncryptionKey,
                    RequestTimeout = 500
                };

                var client = new ElencyConfigClient();
                await client.Init(config);
                Assert.Fail("An error was defined");
            }
            catch (Exception ex)
            {
                Assert.AreEqual("An error occurred while trying to retrieve an access token", ex.Message);
            }
        }

        [Test]
        public async Task InitThrowsAnExcpetionWhenANon200StatusCodeIsReturnedFromElencyConfigServer()
        {
            var responseHeaders = new NameValueCollection() { { "x-access-token", "8363999c-bdc2-45a7-afe6-b0af9ad44aca" } };

            var nockOne = new nock("http://localhost:8080")
                .Head("/config")
                .MatchHeaders((headers) =>
                {
                    return MatchAuthorizationHeader(headers["Authorization"], "/config", "head", true);
                })
                .Reply(HttpStatusCode.OK, string.Empty, responseHeaders);

            var nockTwo = new nock("http://localhost:8080")
                .Get("/config/proj/prod/1.1.1")
                .MatchHeaders((headers) =>
                {
                    return headers["x-access-token"] == "8363999c-bdc2-45a7-afe6-b0af9ad44aca";
                })
                .MatchHeader("x-access-token", "8363999c-bdc2-45a7-afe6-b0af9ad44aca")
                .Reply(HttpStatusCode.Unauthorized, string.Empty);

            try
            {
                var config = new ElencyConfiguration()
                {
                    Uri = "http://localhost:8080",
                    AppId = "proj",
                    AppVersion = "1.1.1",
                    Environment = "prod",
                    HMACAuthorizationKey = HMACAuthorizationKey,
                    ConfigEncryptionKey = EncryptionKey,
                    RequestTimeout = 500
                };

                var client = new ElencyConfigClient();
                await client.Init(config);
                Assert.Fail("An error was defined");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }
    }
}
