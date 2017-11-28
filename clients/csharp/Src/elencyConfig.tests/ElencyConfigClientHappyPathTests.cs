using NUnit.Framework;
using System;
using System.Threading.Tasks;
using Nock.net;
using System.Net;
using System.Collections.Specialized;
using System.Threading;

namespace ElencyConfig.Tests
{
    [TestFixture]
    public class ElencyConfigClientHappyPathTests : TestBase
    {  

        [SetUp]
        public void Setup()
        {
            ElencyConfigClient.Reset();
        }

        [Test]
        public async Task InitIsSuccessfulWhenValidDataIsProvided()
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
                    return MatchAuthorizationHeader(headers["Authorization"], "/config/proj/prod/1.1.1", "get") &&
                        headers["x-access-token"] == "8363999c-bdc2-45a7-afe6-b0af9ad44aca";
                })
                .Reply(HttpStatusCode.OK, GetEmbeddedResource("ElencyConfig.Tests.ValidConfigurationBody.json"));

            try
            {
                var config = new ElencyConfiguration()
                {
                    Uri = "http://localhost:8080",
                    AppId = "proj",
                    AppVersion = "1.1.1",
                    Environment = "prod",
                    HMACAuthorizationKey = HMACAuthorizationKey,
                    ConfigEncryptionKey = EncryptionKey
                };

                await ElencyConfigClient.Init(config);

                Assert.IsTrue(nockOne.Done());
                Assert.IsTrue(nockTwo.Done());
                Assert.AreEqual(2, ElencyConfigClient.GetAllKeys().Count);
                Assert.AreEqual("KeyOneValue", ElencyConfigClient.Get("KeyOne"));
                Assert.AreEqual("KeyTwoValue", ElencyConfigClient.Get("KeyTwo"));
                Assert.AreEqual("1.1.1", ElencyConfigClient.AppVersion);
                Assert.AreEqual("prod", ElencyConfigClient.Environment);
                Assert.AreEqual("9b386d19-fa7a-40ba-b794-f961e56ffe07", ElencyConfigClient.ConfigurationId);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Assert.Fail("An error was defined");
            }
        }

        [Test]
        public async Task GetReturnsConfigurationKeyValues()
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
                    return MatchAuthorizationHeader(headers["Authorization"], "/config/proj/prod/1.1.1", "get") &&
                        headers["x-access-token"] == "8363999c-bdc2-45a7-afe6-b0af9ad44aca";
                })
                .Reply(HttpStatusCode.OK, GetEmbeddedResource("ElencyConfig.Tests.ValidConfigurationBody.json"));

            try
            {
                var config = new ElencyConfiguration()
                {
                    Uri = "http://localhost:8080",
                    AppId = "proj",
                    AppVersion = "1.1.1",
                    Environment = "prod",
                    HMACAuthorizationKey = HMACAuthorizationKey,
                    ConfigEncryptionKey = EncryptionKey
                };

                await ElencyConfigClient.Init(config);

                Assert.IsTrue(nockOne.Done());
                Assert.IsTrue(nockTwo.Done());
                Assert.AreEqual("KeyOneValue", ElencyConfigClient.Get("KeyOne"));
                Assert.AreEqual("KeyTwoValue", ElencyConfigClient.Get("KeyTwo"));
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Assert.Fail("An error was defined");
            }
        }

        [Test]
        public async Task GetReturnsNullIfKeyDoesNotExist()
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
                    return MatchAuthorizationHeader(headers["Authorization"], "/config/proj/prod/1.1.1", "get") &&
                        headers["x-access-token"] == "8363999c-bdc2-45a7-afe6-b0af9ad44aca";
                })
                .Reply(HttpStatusCode.OK, GetEmbeddedResource("ElencyConfig.Tests.ValidConfigurationBody.json"));

            try
            {
                var config = new ElencyConfiguration()
                {
                    Uri = "http://localhost:8080",
                    AppId = "proj",
                    AppVersion = "1.1.1",
                    Environment = "prod",
                    HMACAuthorizationKey = HMACAuthorizationKey,
                    ConfigEncryptionKey = EncryptionKey
                };

                await ElencyConfigClient.Init(config);

                Assert.IsTrue(nockOne.Done());
                Assert.IsTrue(nockTwo.Done());
                Assert.AreEqual(null, ElencyConfigClient.Get("Cheese"));
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Assert.Fail("An error was defined");
            }
        }

        [Test]
        public async Task GetAllKeysReturnsAllConfigurationKeys()
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
                    return MatchAuthorizationHeader(headers["Authorization"], "/config/proj/prod/1.1.1", "get") &&
                        headers["x-access-token"] == "8363999c-bdc2-45a7-afe6-b0af9ad44aca";
                })
                .Reply(HttpStatusCode.OK, GetEmbeddedResource("ElencyConfig.Tests.ValidConfigurationBody.json"));

            try
            {
                var config = new ElencyConfiguration()
                {
                    Uri = "http://localhost:8080",
                    AppId = "proj",
                    AppVersion = "1.1.1",
                    Environment = "prod",
                    HMACAuthorizationKey = HMACAuthorizationKey,
                    ConfigEncryptionKey = EncryptionKey
                };

                await ElencyConfigClient.Init(config);

                Assert.IsTrue(nockOne.Done());
                Assert.IsTrue(nockTwo.Done());
                var keys = ElencyConfigClient.GetAllKeys();
                Assert.AreEqual(2, keys.Count);
                Assert.AreEqual("KeyOne", keys[0]);
                Assert.AreEqual("KeyTwo", keys[1]);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Assert.Fail("An error was defined");
            }
        }

        [Test]
        public async Task RefreshCorrectlyUpdatesTheConfiguration()
        {
            var responseHeaders = new NameValueCollection() { { "x-access-token", "8363999c-bdc2-45a7-afe6-b0af9ad44aca" } };

            var nockOne = new nock("http://localhost:8080")
                .Head("/config")
                .MatchHeaders((headers) =>
                {
                    var match = MatchAuthorizationHeader(headers["Authorization"], "/config", "head", true);
                    return match;
                })
                .Reply(HttpStatusCode.OK, string.Empty, responseHeaders);

            var nockTwo = new nock("http://localhost:8080")
                .Get("/config/proj/prod/1.1.1")
                .MatchHeaders((headers) =>
                {
                    var match = MatchAuthorizationHeader(headers["Authorization"], "/config/proj/prod/1.1.1", "get") &&
                        headers["x-access-token"] == "8363999c-bdc2-45a7-afe6-b0af9ad44aca";
                    return match;
                })
                .Reply(HttpStatusCode.OK, GetEmbeddedResource("ElencyConfig.Tests.ValidConfigurationBody.json"));

            var nockThree = new nock("http://localhost:8080")
                .Head("/config/proj/prod/1.1.1")
                .MatchHeaders((headers) =>
                {
                    var match = MatchAuthorizationHeader(headers["Authorization"], "/config/proj/prod/1.1.1", "head") &&
                        headers["x_version_hash"] == "Re10aakOhCrz488W6ws5/A==";
                    return match;
                })
                .Reply(HttpStatusCode.OK, string.Empty);

            var responseHeaders2 = new NameValueCollection() { { "x-access-token", "7363999c-bdc2-45a7-afe6-b0af9ad44acb" } };

            var nockFour = new nock("http://localhost:8080")
                .Head("/config")
                .MatchHeaders((headers) =>
                {
                    var match = MatchAuthorizationHeader(headers["Authorization"], "/config", "head", true);
                    return match;
                })
                .Reply(HttpStatusCode.OK, string.Empty, responseHeaders2);

            var nockFive = new nock("http://localhost:8080")
                .Get("/config/proj/prod/1.1.1")
                .MatchHeaders((headers) =>
                {
                    var match = MatchAuthorizationHeader(headers["Authorization"], "/config/proj/prod/1.1.1", "get") &&
                        headers["x-access-token"] == "7363999c-bdc2-45a7-afe6-b0af9ad44acb";
                    return match;
                })
                .Reply(HttpStatusCode.OK, GetEmbeddedResource("ElencyConfig.Tests.ValidConfigurationBodyTwo.json"));

            try
            {
                var config = new ElencyConfiguration()
                {
                    Uri = "http://localhost:8080",
                    AppId = "proj",
                    AppVersion = "1.1.1",
                    Environment = "prod",
                    HMACAuthorizationKey = HMACAuthorizationKey,
                    ConfigEncryptionKey = EncryptionKey
                };

            
                await ElencyConfigClient.Init(config);

                Assert.IsTrue(nockOne.Done(), "1");
                Assert.IsTrue(nockTwo.Done(), "2");
                Assert.AreEqual(2, ElencyConfigClient.GetAllKeys().Count, "3");
                Assert.AreEqual("KeyOneValue", ElencyConfigClient.Get("KeyOne"), "4");
                Assert.AreEqual("KeyTwoValue", ElencyConfigClient.Get("KeyTwo"), "5");
                Assert.AreEqual("1.1.1", ElencyConfigClient.AppVersion, "6");
                Assert.AreEqual("prod", ElencyConfigClient.Environment, "7");
                Assert.AreEqual("9b386d19-fa7a-40ba-b794-f961e56ffe07", ElencyConfigClient.ConfigurationId, "8");

                try
                {
                    await ElencyConfigClient.Refresh();
                    Assert.IsTrue(nockThree.Done(), "9");
                    Assert.IsTrue(nockFour.Done(), "10");
                    Assert.IsTrue(nockFive.Done(), "11");
                    Assert.AreEqual(3, ElencyConfigClient.GetAllKeys().Count, "12");
                    Assert.AreEqual("KeyOneValue", ElencyConfigClient.Get("KeyOne"), "13");
                    Assert.AreEqual("KeyTwoValueUpdated", ElencyConfigClient.Get("KeyTwo"), "14");
                    Assert.AreEqual("KeyThreeValue", ElencyConfigClient.Get("KeyThree"), "15");
                    Assert.AreEqual("1.1.1", ElencyConfigClient.AppVersion, "16");
                    Assert.AreEqual("prod", ElencyConfigClient.Environment, "17");
                    Assert.AreEqual("9b386d19-fa7a-40ba-b794-f961e56ffe07", ElencyConfigClient.ConfigurationId, "18");
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    Assert.Fail("An error was defined");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Assert.Fail("An error was defined");
            }
        }

        [Test]
        public async Task TimeredRefreshCorrectlyUpdatesTheConfiguration()
        {
            var responseHeaders = new NameValueCollection() { { "x-access-token", "8363999c-bdc2-45a7-afe6-b0af9ad44aca" } };

            var nockOne = new nock("http://localhost:8080")
                .Head("/config")
                .MatchHeaders((headers) =>
                {
                    var match = MatchAuthorizationHeader(headers["Authorization"], "/config", "head", true);
                    return match;
                })
                .Reply(HttpStatusCode.OK, string.Empty, responseHeaders);

            var nockTwo = new nock("http://localhost:8080")
                .Get("/config/proj/prod/1.1.1")
                .MatchHeaders((headers) =>
                {
                    var match = MatchAuthorizationHeader(headers["Authorization"], "/config/proj/prod/1.1.1", "get") &&
                        headers["x-access-token"] == "8363999c-bdc2-45a7-afe6-b0af9ad44aca";
                    return match;
                })
                .Reply(HttpStatusCode.OK, GetEmbeddedResource("ElencyConfig.Tests.ValidConfigurationBody.json"));

            var nockThree = new nock("http://localhost:8080")
                .Head("/config/proj/prod/1.1.1")
                .MatchHeaders((headers) =>
                {
                    var match = MatchAuthorizationHeader(headers["Authorization"], "/config/proj/prod/1.1.1", "head") &&
                        headers["x_version_hash"] == "Re10aakOhCrz488W6ws5/A==";
                    return match;
                })
                .Reply(HttpStatusCode.OK, string.Empty);

            var responseHeaders2 = new NameValueCollection() { { "x-access-token", "7363999c-bdc2-45a7-afe6-b0af9ad44acb" } };

            var nockFour = new nock("http://localhost:8080")
                .Head("/config")
                .MatchHeaders((headers) =>
                {
                    var match = MatchAuthorizationHeader(headers["Authorization"], "/config", "head", true);
                    return match;
                })
                .Reply(HttpStatusCode.OK, string.Empty, responseHeaders2);

            var nockFive = new nock("http://localhost:8080")
                .Get("/config/proj/prod/1.1.1")
                .MatchHeaders((headers) =>
                {
                    var match = MatchAuthorizationHeader(headers["Authorization"], "/config/proj/prod/1.1.1", "get") &&
                        headers["x-access-token"] == "7363999c-bdc2-45a7-afe6-b0af9ad44acb";
                    return match;
                })
                .Reply(HttpStatusCode.OK, GetEmbeddedResource("ElencyConfig.Tests.ValidConfigurationBodyTwo.json"));

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
                    RefreshInterval = 100
                };

                await ElencyConfigClient.Init(config);

                Assert.IsTrue(nockOne.Done(), "1");
                Assert.IsTrue(nockTwo.Done(), "2");
                Assert.AreEqual(2, ElencyConfigClient.GetAllKeys().Count, "3");
                Assert.AreEqual("KeyOneValue", ElencyConfigClient.Get("KeyOne"), "4");
                Assert.AreEqual("KeyTwoValue", ElencyConfigClient.Get("KeyTwo"), "5");
                Assert.AreEqual("1.1.1", ElencyConfigClient.AppVersion, "6");
                Assert.AreEqual("prod", ElencyConfigClient.Environment, "7");
                Assert.AreEqual("9b386d19-fa7a-40ba-b794-f961e56ffe07", ElencyConfigClient.ConfigurationId, "8");

                try
                {

                    while (true)
                    {
                        try
                        {
                            Assert.IsTrue(nockThree.Done(), "9");
                            Assert.IsTrue(nockFour.Done(), "10");
                            Assert.IsTrue(nockFive.Done(), "11");
                            Assert.AreEqual(3, ElencyConfigClient.GetAllKeys().Count, "12");
                            Assert.AreEqual("KeyOneValue", ElencyConfigClient.Get("KeyOne"), "13");
                            Assert.AreEqual("KeyTwoValueUpdated", ElencyConfigClient.Get("KeyTwo"), "14");
                            Assert.AreEqual("KeyThreeValue", ElencyConfigClient.Get("KeyThree"), "15");
                            Assert.AreEqual("1.1.1", ElencyConfigClient.AppVersion, "16");
                            Assert.AreEqual("prod", ElencyConfigClient.Environment, "17");
                            Assert.AreEqual("9b386d19-fa7a-40ba-b794-f961e56ffe07", ElencyConfigClient.ConfigurationId, "18");
                            break;
                        }
                        catch { }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    Assert.Fail("An error was defined");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Assert.Fail("An error was defined");
            }
        }

    }
}
