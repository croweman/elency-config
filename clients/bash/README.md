# elency-config-node-client

This is a `bash/linux` client for the `elency-config-server`.

## Table of contents

- [Prerequisites](#prerequisites)
- [Install](#install)
- [Use](#use)
  - [Using the script](#using)
  - [Initialisation/Retrieved](#retrieved)
  - [Refresh Failure](#failure)
- [License](#license)

---

## Prerequisites<a name="prerequisites"></a>

This is a `bash` shell script to be executed on linux based systems.

It is dependent on the following cmd line tools:

- curl
- openssl
- printf
- base64
- tr
- jq
- xxd
- uuidgen

---

## Install<a name="install"></a>

1. Download <a href="../../../../raw/master/clients/node/bash/elency-config.sh.zip">elency-config.sh.zip</a>.

2. Extract the above `zip` file into a desired location on your machine.

3. Grant execute permissions to the script.

```
chmod +x ./elency-config.sh
```

---

## Using the script<a name="using"></a>

The script is dependent on a number of environment variables when being executed, these are detailed below:

- `URI`: The url of the elency config server.
- `APP_ID`: The application id within elency config.
- `ENVIRONMENT`: The environment associated with the application with elency config in which we would like to retrieve configuration from.
- `APP_VERSION`: The version of the running application that required configuration.
- `HMAC_AUTHORIZATION_KEY` A 32 character (base64 encoded) string used for authorization tokens. This should match the server HMACAuthorizationKey.
- `CONFIG_ENCRYPTION_KEY` A 32 character (base64 encoded) string used to decrypt `secure` configuration variables.  This is the value of the `key` associated with an application environment.

It is advised that when executing the script, you capture the exist code and fail your process gracefully if the exit code is not successful.

```
#!/bin/bash

URI=http://localhost:3000 \
APP_ID=awesome-micro-service \
ENVIRONMENT=production \
APP_VERSION=2.0.0 \
HMAC_AUTHORIZATION_KEY=YWJlZjYwNzQwYzk4NDY4Zjg3ZTg5MWU0 \
CONFIG_ENCRYPTION_KEY=ZTk0YTU5YjNhMjk4NGI3NmIxNWExNzdi \
./elency-config.sh

rc=$?

if [[ $rc != 0 ]]; then
    echo "Something went wrong while trying to retrieve application configuration"
    exit 1
fi
```

Once the configuration has been pulled down successfully a file named `app_configuration.json` will be created.  Example below:

```json
{
  "configurationId": "2e89d522-6558-4631-ad8c-4d5f2a891203",
  "configurationHash": "5mjYdZBJIw/DV4ruPbF+IA==",
  "appVersion": "1.1.1",
  "environment": "production",
  "entries": [
    {
      "LOG_LEVEL": "warn"
    }
  ]
}
```

---

## License<a name="license"></a>

(The MIT License)

Copyright (c) 2018 `Lee Crowe` a.k.a. `croweman`

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.