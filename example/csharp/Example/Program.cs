﻿using ElencyConfig;
using System;
using System.Threading.Tasks;

namespace Example
{
    class Program
    {
        const string AppId = "awesome-micro-service";
        const string Environment = "production";
        const string HMACAuthorizationKey = "MzY4dUBKaTFhMjM0ODIxamhoRmEhYWE=";
        const string ConfigEncryptionKey = "NTY4dUppMWEyQDM0NThqaGhGYSFhYQ==";


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
                Uri = "http://192.168.1.15:3000",
                AppId = AppId,
                AppVersion = "2.0.0",
                Environment = Environment,
                RefreshInterval = 1000,
                HMACAuthorizationKey = HMACAuthorizationKey,
                ConfigEncryptionKey = ConfigEncryptionKey,
            };

            configuration.Retrieved = Retrieved;
            configuration.RefreshFailure = RefreshFailure;

            await ElencyConfigClient.Init(configuration);
        }

        private static void Retrieved()
        {
            Console.WriteLine();
            Console.WriteLine("__________________________________________");
            Console.WriteLine(string.Format("Configuration retrieved: {0}", DateTime.Now.ToString()));
            Console.WriteLine(string.Format("Version: {0}", ElencyConfigClient.AppVersion));
            Console.WriteLine(string.Format("Environment: {0}", ElencyConfigClient.Environment));
            Console.WriteLine(string.Format("Configuration Id: {0}", ElencyConfigClient.ConfigurationId));
            Console.WriteLine("Keys and values:");
            Console.WriteLine();

            ElencyConfigClient.GetAllKeys().ForEach(key =>
            {
                Console.WriteLine("{0}: {1}", key, ElencyConfigClient.Get(key));
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
