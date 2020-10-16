using ElencyConfig;
using System;
using System.Threading.Tasks;

namespace Example
{
    class Program
    {
        const string AppId = "awesome-micro-service";
        const string Environment = "production";
        const string HMACAuthorizationKey = "YWJlZjYwNzQwYzk4NDY4Zjg3ZTg5MWU0";
        const string ConfigEncryptionKey = "ZTk0YTU5YjNhMjk4NGI3NmIxNWExNzdi";//"NTY4dUppMWEyQDM0NThqaGhGYSFhYQ==";

        static ElencyConfigClient Client;

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
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            Console.ReadKey();
        }

        private static async Task GetConfiguration()
        {
            var configuration = new ElencyConfiguration()
            {
                Uri = "https://localhost:3000",
                AppId = AppId,
                AppVersion = "2.0.0",
                Environment = Environment,
                RefreshInterval = 1000,
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = ConfigEncryptionKey,
            };

            configuration.Retrieved = Retrieved;
            configuration.RefreshFailure = RefreshFailure;

            Client = new ElencyConfigClient();
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

            Console.WriteLine("__________________________________________");
        }

        private static void RefreshFailure(Exception exception)
        {
            Console.WriteLine(exception.Message);
            Console.WriteLine("** REFRESH FAILURE **");
        }
    }
}
