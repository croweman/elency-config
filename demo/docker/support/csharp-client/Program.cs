using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using ElencyConfig;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Client
{
    class Program
    {
        const string AppId = "centre";
        const string Environment = "Prod";
        const string HMACAuthorizationKey = "YWJlZjYwNzQwYzk4NDY4Zjg3ZTg5MWU0";
        const string ConfigEncryptionKey = "M2Y0M2E0NTMyZDBjNDNjNDk5YWJjOGEy";

        static ElencyConfigClient<TypedConfiguration> Client;

        static void Main(string[] args)
        {
            try
            {
                Task.Run(async () =>
                {
                    await GetConfiguration();
                })
                .GetAwaiter()
                .GetResult();

                while (true) 
                {
                    Thread.Sleep(1000);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private static void WaitForServerToBecomeAvailable()
        {
            while (!File.Exists("status/server-up.txt"))
                Thread.Sleep(200);
        }

        private static async Task GetConfiguration()
        {
            WaitForServerToBecomeAvailable();

            var configuration = new ElencyConfiguration
            {
                Uri = "http://app:3000",
                AppId = AppId,
                AppVersion = "2.0.0",
                Environment = Environment,
                RefreshInterval = 1000,
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = ConfigEncryptionKey,
                Retrieved = Retrieved,
                RefreshFailure = RefreshFailure,
            };

            Client = new ElencyConfigClient<TypedConfiguration>();

            await Client.Init(configuration);    
        }

        private static void Retrieved()
        {
            Console.WriteLine();
            Console.WriteLine("__________________________________________");
            Console.WriteLine($"Configuration retrieved: {DateTime.Now.ToString()}");
            Console.WriteLine($"Version: {Client.AppVersion}");
            Console.WriteLine($"Environment: {Client.Environment}");
            Console.WriteLine($"Configuration Id: {Client.ConfigurationId}");
            Console.WriteLine("Keys and values:");
            Console.WriteLine();

            Client.GetAllKeys().ForEach(key =>
            {
                Console.WriteLine("{0}: {1}", key, Client.Get(key));
            });

            Console.WriteLine();
            Console.WriteLine("Typed configuration:");
            Console.WriteLine();

            JsonSerializerSettings settings = new JsonSerializerSettings
            {
                Formatting = Formatting.Indented,
                ContractResolver = new LongNameContractResolver()
            };
            
            Console.WriteLine(JsonConvert.SerializeObject(Client.Configuration, settings));

            Console.WriteLine("__________________________________________");
        }

        private static void RefreshFailure(Exception exception)
        {
            Console.WriteLine(exception.Message);
            Console.WriteLine("** REFRESH FAILURE **");
        }
    }

    public class TypedConfiguration
    {
        [JsonProperty("REST_API_URL")]
        public string RestApiUrl { get; set; }
        
        [JsonProperty("ENVIRONMENT")]
        public string Environment { get; set; }
        
        [JsonProperty("LOG_LEVEL")]
        public string LogLevel { get; set; }
        
        [JsonProperty("SECURE_DATA")]
        public string SecureData { get; set; }
    }

    class LongNameContractResolver : DefaultContractResolver
    {
        protected override IList<JsonProperty> CreateProperties(Type type, MemberSerialization memberSerialization)
        {
            IList<JsonProperty> list = base.CreateProperties(type, memberSerialization);

            foreach (JsonProperty prop in list)
            {
                prop.PropertyName = prop.UnderlyingName;
            }

            return list;
        }
    }
}