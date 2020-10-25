# ElencyConfig

This is a `c#` client for the `elency-config server`.

## Table of contents

- [Prerequisites](#prerequisites)
- [Install](#install)
- [Use](#use)
  - [Initialising the client](#init)
  - [Initialisation/Retrieved](#updates)
  - [Refresh Failure](#failures)
- [License](#license)

---

## Prerequisites<a name="prerequisites"></a>

`ElencyConfig` is built with `c#` and is dependent on .NET Standard 2.0.

---

## Install<a name="install"></a>

Install from [nuget](https://www.nuget.org/packages/ElencyConfig/).

---

## Initialising the client<a name="init"></a>

Firstly the client needs creating.  It is advised that this would be done as part of your application startup.  If the required configuration could not be retrieved it may be appropriate to kill your application and log a relevant error message.

It is also advised that any `keys` or `secure data` is not stored in your code base and is retrieved and provided to your application following best practises.

When creating a client it is advised that the `HMACAuthorizationKey` and `configEncryptionKey` would need to be read from environment variables injected into your application and not hard coded in your code bases.

To `create` a client execute the following:

```c#

using ElencyConfig;

const string AppId = 'awesome-app';
const string Environment = 'prod';
const string HMACAuthorizationKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const string ConfigEncryptionKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

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
}

private static async Task GetConfiguration()
{
    var configuration = new ElencyConfiguration()
    {
        Uri = "http://192.168.1.15:3000",
        AppId = AppId,
        AppVersion = "2.0.0",
        Environment = Environment,
        RefreshInterval = 0,
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
}

private static void RefreshFailure(Exception exception)
{
}
```

The options provided to the client are below.

### options
 - `Uri`: Defines the `elency-config-server` url.
 - `AppId`: Defines the application id.
 - `AppVersion` Defines the application version.
 - `Environment` Defines the environment.
 - `RefreshInterval` Defines in `milliseconds` whether the configuration should be refreshed on a timered basis.  If the value is `0` the configuration will not be refreshed.
 - `HMACAuthorizationKey` A 32 character (base64 encoded) string used for authorization tokens. This should match the server HMACAuthorizationKey.
 - `ConfigEncryptionKey` A 32 character (base64 encoded) string used to decrypt `secure` configuration variables.  This is the value of the `key` associated with an application environment.
 - `Retrieved` Defines a void fired when the configuration is retrieved.
 - `RefreshFailure` Defines a void fired when a configuration refresh fails.
 - `LocalConfiguration` Defines a local configuration environment.  In development environments you may not want to communicate with a real `elency-config-server`.

An example using `localConfiguration` is below:

```c#
var configuration = new ElencyConfiguration()
    {
        Uri = "http://192.168.1.15:3000",
        AppId = AppId,
        AppVersion = "2.0.0",
        Environment = Environment,
        RefreshInterval = 0,
        HMACAuthorizationKey = HMACAuthorizationKey,
        ConfigEncryptionKey = ConfigEncryptionKey,
		LocalConfiguration = new LocalConfiguration
        {
            AppVersion = "1.1.2",
            Environment = "production",
            ConfigurationId = "9b386d19-fa7a-40ba-b794-f961e56ffe08",
            ConfigurationData = new System.Collections.Generic.Dictionary<string, string>
            {
                { "KeyOne", "Value1" },
                { "KeyTwo", "Value2" }
            }
        }
    };
```

If you would like to make use of a typed configuration object you can create a class with the relevant properties and use a Generic client

```c#
public class TypedConfiguration
{
    public string PropertyOne { get; set; }
    public bool PropertyTwo { get; set; }
}

...
Client = new ElencyConfigClient<TypedConfiguration>();
await Client.Init(configuration);

Console.WriteLine(Client.Configuration.PropertyOne);
Console.WriteLine(Client.Configuration.PropertyTwo);
``` 

---

## Initialisation/Retrieved<a name="retrieved"></a>

When configuration has been successfully retrieved, and assuming you have defined a `Retrieved` void when retrieving configuration, the client will execute the `Retrieved` void when successfully retrieved.

In your `Retrieved` function you may want to perform setup tasks etc.

Once your `Retrieved` function has been called the client will have the following methods and properties available:

### methods and properties
 - `Reset`: A method that stops refreshing if enabled.
 - `AppVersion`: A property that returns the `version` of the retrieved configuration.
 - `Environment`: A property that returns the `environment` of the retrieved configuration.
 - `ConfigurationId`: A property that returns the `configurationId` of the retrieved configuration.
 - `Get`: A method that accepts a `key` argument and returns the value of the key or `null` if the key cannot be found.
 - `GetAllKeys`: A method that returns all of the `keys` within the configuration.
 - `Refresh`: A method that can be called to refresh the configuration.
 - `GetBoolean`: (`key` string, `fallback` <optional>) gets the value of a key as a bool and falls back to fallback value if provided.
 - `GetDateTime`: (`key` string, `fallback` <optional>) gets the value of a key as a DateTime and falls back to fallback value if provided.
 - `GetInteger`: (`key` string, `fallback` <optional>) gets the value of a key as a int and falls back to fallback value if provided.
 - `GetFloat`: (`key` string, `fallback` <optional>) gets the value of a key as a float and falls back to fallback value if provided.
 - `GetDecimal`: (`key` string, `fallback` <optional>) gets the value of a key as a decimal and falls back to fallback value if provided.
 - `GetDouble`: (`key` string, `fallback` <optional>) gets the value of a key as a double and falls back to fallback value if provided.
 - `GetObject`: (`key` string, `fallback` <optional>) gets the value of a key as a specified type of object and falls back to fallback value if provided.

---

## Refresh Failure<a name="failure"></a>

If you have a `RefreshInterval` and a `RefreshFailure` method configured.  When a refresh failure occurs the `RefreshFailure` method will be called with an `Exception` argument.

---

## License<a name="license"></a>

(The MIT License)

Copyright (c) 2020 `Lee Crowe` a.k.a. `croweman`

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.