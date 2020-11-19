# elency-config-node-client

This is a `node` client for the `elency-config-server`.

## Table of contents

- [Prerequisites](#prerequisites)
- [Install](#install)
- [Use](#use)
  - [Initialising the client](#init)
  - [Initialisation/Retrieved](#retrieved)
  - [Refresh Failure](#failure)
- [License](#license)

---

## Prerequisites<a name="prerequisites"></a>

`elency-config-node-client` is built with <a href="https://nodejs.org/en/">nodejs</a> and has the following dependencies.

- <a href="https://nodejs.org/en/">nodejs</a>, the minimum supported `LTS` version is `8.9.0`.

---

## Install<a name="install"></a>

```
npm install `elency-config` --save
```

or

1. Download <a href="../../../../raw/master/releases/clients/node/package/elency-config-node-client-0.0.10-beta.tar.gz">elency-config-node-client</a>.

2. Extract the above `tar.gz` file into a desired location on your machine.

```
tar xzf ./elency-config-node-client-0.0.6-beta.tar.gz
```

---

## Initialising the client<a name="init"></a>

Firstly the client needs initialising.  It is advised that this would be done as part of your application startup.  If the required configuration could not be retrieved it may be appropriate to kill your application and log a relevant error message.

It is also advised that any `keys` or `secure data` is not stored in your code base and is retrieved and provided to your application following best practises.

When creating a client it is advised that the `HMACAuthorizationKey` and `configEncryptionKey` would need to be read from environment variables injected into your application and not hard coded in your code bases.

To `create` a client execute the following:

```js
const elencyConfig = require('elency-config');

const appId = 'awesome-app';
const environment = 'prod';
const HMACAuthorizationKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const configEncryptionKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

const elencyConfigInstance = elencyConfig({
    uri: 'https://192.155.1.22:3000',
    appId,
    appVersion: '2.0.0',
    environment,
    refreshInterval: 10000,
    HMACAuthorizationKey,
    configEncryptionKey,
    retrieved: () => {},
    refreshFailure: () => {}
  });
```

The options provided to the client are below.

### options
 - `uri`: Defines the `elency-config-server` url.
 - `appId`: Defines the application id.
 - `appVersion` Defines the application version.
 - `environment` Defines the environment.
 - `refreshInterval` Defines in `milliseconds` whether the configuration should be refreshed on a timered basis.  If the value is `0` the configuration will not be refreshed.
 - `HMACAuthorizationKey` A 32 character (base64 encoded) string used for authorization tokens. This should match the server HMACAuthorizationKey.
 - `configEncryptionKey` A 32 character (base64 encoded) string used to decrypt `secure` configuration variables.  This is the value of the `key` associated with an application environment.
 - `retrieved` Defines a function fired when the configuration is retrieved.
 - `refreshFailure` Defines a function fired when a configuration refresh fails.
 - `localConfiguration` Defines a local configuration environment.  In development environments you may not want to communicate with a real `elency-config-server`.
 - `configurationMapping` An optional array that defines mapping for typed configuration.

An example using `localConfiguration` is below:

```js
elencyConfigInstance.localConfiguration = {
    appVersion: "1.1.2",
    environment: "production",
    configurationId: '9b386d19-fa7a-40ba-b794-f961e56ffe08',
    configurationData: {
        LOG_LEVEL: 'INFO'
    }
};
```

Once the client instance has been created with valid options. You can call the `init` function which will attempt to communicate with the `elency-config-server` and pull down a configuration.

```js
try {
  await elencyConfigInstance.init();
}
catch (err) {
  console.log('An error occurred while initialising elencyConfig client', err));
  process.exit(1);
}
```

An example of using `configurationMapping` for typed configuration is below:

```js
const elencyConfig = require('elency-config');

const appId = 'awesome-app';
const environment = 'prod';
const HMACAuthorizationKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const configEncryptionKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

const elencyConfigInstance = elencyConfig({
    uri: 'https://192.155.1.22:3000',
    appId,
    appVersion: '2.0.0',
    environment,
    refreshInterval: 10000,
    HMACAuthorizationKey,
    configEncryptionKey,
    retrieved: () => {},
    refreshFailure: () => {},
    configurationMapping: [
      { configurationPropertyName: 'KeyOne', propertyName: 'KeyOneRenamed' },
      { configurationPropertyName: 'Bool', type: 'Boolean' },
      { configurationPropertyName: 'Date', type: 'Date' },
      { configurationPropertyName: 'Int', propertyName: 'int', type: 'Int' },
      { configurationPropertyName: 'Float', type: 'Float' },
      { configurationPropertyName: 'Object', type: 'Object' },
      { configurationPropertyName: 'NonExistant', type: 'int' },
      { configurationPropertyName: 'NonExistantWithFallback', type: 'int', fallback: 4 }
    ]
  });
```

Objects within the `configurationMapping` array can have the following properties
 - `configurationPropertyName`: (required) Defines the name of the property found in the configuration.
 - `propertyName`: (optional) Defines the target property name on the typed configuration object.
 - `type`: (optional) Defines the target type of the property on typed configuration object.  (Boolean, Date, Int, Float, Object)
 - `fallback`: (optional) Defines a fallback value to use if one was not defined in the configuration or the property did not exist.

---

## Initialisation/Retrieved<a name="retrieved"></a>

When configuration has been successfully retrieved, and assuming you have defined a `retrieved` function when initialising the client and retrieving configuration, the client will `await` the execution of the `retrieved` function.

In your `retrieve` function you may want to perform asynchonous setup tasks etc.

Once your `retrieve` function has been called the client will have the following functions and propertiesavailable:

### functions and properties
 - `dispose`: A function that stops refreshing if enabled.
 - `appVersion`: A property that returns the `version` of the retrieved configuration.
 - `environment`: A property that returns the `environment` of the retrieved configuration.
 - `configurationId`: A property that returns the `configurationId` of the retrieved configuration.
 - `get`: A function that accepts a `key` argument and returns the value of the key or `undefined` if the key cannot be found.
 - `getAllKeys`: A function that returns all of the `keys` within the configuration.
 - `refresh`: A function that can be called to refresh the configuration.
 - `getBoolean`: (`key` string, `fallback` <optional>) gets the value of a key as a boolean and falls back to fallback value if provided.
 - `getDate`: (`key` string, `fallback` <optional>) gets the value of a key as a date and falls back to fallback value if provided.
 - `getInt`: (`key` string, `fallback` <optional>) gets the value of a key as a int and falls back to fallback value if provided.
 - `getFloat`: (`key` string, `fallback` <optional>) gets the value of a key as a float and falls back to fallback value if provided.
 - `getObject`: (`key` string, `fallback` <optional>) gets the value of a key as an object and falls back to fallback value if provided.
 - `typedConfiguration`: A function that can be called to returned typed configuration if `configurationMapping` is defined as options when creating the client.

---

## Refresh Failure<a name="failure"></a>

If you have a `refreshInterval` and a `refreshFailure` function configured.  When a refresh failure occurs the `refreshFailure` function will be called with an `err` argument.

---

## License<a name="license"></a>

(The MIT License)

Copyright (c) 2020 `Lee Crowe` a.k.a. `croweman`

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.