# elency-config-server

elency-config is a `http application` built on the `node.js` platform to provide configuration management for multi-tenant applications hosted on any platform.

## Table of contents

- [Prerequisites](#prerequisites)
- [Install](#install)
  - [Linux based system](#linux)
  - [Docker](#docker)
- [Configuration](#configuration)
- [How does it work?](#how-does-it-work)
- [Security](#security)
- [Ping endpoint](#ping)
- [Health endpoint](#health)
- [Users/Roles](#users)
- [LDAP](#ldap)
- [Keys](#keys)
- [License](#license)

---

## Prerequisites<a name="prerequisites"></a>

This document assumes you will be installing `elency-config` on a `linux` based system.

elency-config is built with <a href="https://nodejs.org/en/">nodejs</a> and has the following dependencies.

- <a href="https://nodejs.org/en/">nodejs</a>, the minimum supported `LTS` version is `8.9.0`.
- <a href="https://www.mongodb.com/">mongoDB</a>, the minimum supported version is `3.0`.  It is `highly` recommended that the mongo server being connected to is locked down and requires credentials.

---

## Install<a name="install"></a>

This document assumes you will be installing `elency-config` on a `linux` based system.

Ideally in a `non` local/dev environment you should be setting the server up with a `reverse proxy` in front of it over `https` and using valid `SSL certificates`.

### Linux based system<a name="linux"></a>

1. Download <a href="../../raw/master/releases/server/package/elency-config-server-0.0.9-beta.tar.gz">elency-config-server</a>.

2. Extract the above `tar.gz` file into a desired location on your machine.

    ```
    tar xzf ./elency-config-server-0.0.9-beta.tar.gz
    ```

3. Create and add the relevant config and security files to the `config` and `sec` directories.  Refer to the <a href="#configuration">Configuration</a> section.

4. Run the application

    Execute the `start` script this will expose a node/express app on port `3000`. The port can be overriden by executing with a `PORT` environment variable.

    The start script installs `PM2` and also sets up a `service`.

    ```
    ./start
    ```

5. Stopping the application

    Execute the `stop script`

    ```
    ./stop
    ```

### Docker<a name="docker"></a>

If you would like to run the server in a docker containerised environment you can make use of docker images.

Docker images exist for the server but as it is dependent on configuration data. Refer to the <a href="#configuration">Configuration</a> section.

Retrieval of configuration data to be injected into containers should be carried out following your company guidelines.  Please refer to the <a href="#security">security</a> section about storage of secure information.

Firstly within a directory you will need a `docker-compose.yml` which contains some of the following:

```yml
version: '3'

services:
  app:
    container_name: elency-config-server
    image: croweman/elency-config-server:0.0.9-beta
    restart: "on-failure:10"
    volumes:
      - ./configuration_files:/app/configuration_files
    ports:
      - "3000:3000"
    environment:
      CONFIG_JSON_VALUE:
      KEYS_JSON_VALUE:
      PRIVATE_PEM_VALUE:
      PUBLIC_PEM_VALUE:
```

Configuration could be injected into the container in either of the following ways.

#### File injection

In a directory create a local `configuration_files` could be created with the 4 configuration files copied into it at the root.

To bring up the container execute.

```
docker-compose up
```

#### Environment variable injection

You would need to read the relevant configuration values into environment variables and inject them into the container when bringing it up

```
CONFIG_JSON_VALUE=`cat ./config.json`
KEYS_JSON_VALUE=`cat ./keys.json`
PRIVATE_PEM_VALUE=`cat ./elency-config.private.pem`
PUBLIC_PEM_VALUE=`cat ./elency-config.public.pem`

rm ./config.json
rm ./keys.json
rm ./elency-config.private.pem
rm ./elency-config.public.pem

CONFIG_JSON_VALUE=$CONFIG_JSON_VALUE KEYS_JSON_VALUE=$KEYS_JSON_VALUE PRIVATE_PEM_VALUE=$PRIVATE_PEM_VALUE PUBLIC_PEM_VALUE=$PUBLIC_PEM_VALUE docker-compose up
```

---

## Configuration<a name="configuration"></a>

The server is dependent on 4 configuration files. These files and content (encrypted/decrypted) should be stored securely following your company guidelines.  Please refer to the <a href="#security">security</a> section about storage of secure information.

1. You will need to generate a `public` and `private` key pair.

    This key pair will be used to encrypt/decrypt configuration files and some mongo data.

    These files should live within the `sec` folder.

    ```
    cd ./elency-config-server
    openssl genrsa -out ./sec/elency-config.private.pem 2048
    openssl rsa -in ./sec/elency-config.private.pem -outform PEM -pubout -out ./sec/elency-config.public.pem
    ```

2. Create `config.json` configuration file.

    Create a `config.json` file within the `config` folder and update its settings!

    If running `locally` (over `http`, not `https`) the UI routes will not work if `runOverHttp` has a value of `false`, you will need to change this to `true`!

    ```json
    {
      "mongoUrl": "mongodb://localhost:27017/elency-config",
      "HMACAuthorizationKey": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "exposeUIRoutes": true,
      "maxJsonPostSize": "1mb",
      "runOverHttp": false,
      "sessionLifeTimeInMinutes": 20160,
      "validateAuthorizationTokenWindow": true,
      "authorizationTokenValidationWindowInSeconds": 300
    }
    ```

    ### settings
     - `mongoUrl`: Defines the mongo url, it is recommended you use credentials and lock down the mongo db.
     - `HMACAuthorizationKey`: This is the key used for creating authorization headers.  It should be a `32` character `base64` encoding string.
     - `exposeUIRoutes`: (default: false) Defines whether the admin interface should be exposed.
     - `maxJsonPostSize`: (default: `1mb`) Defines the max payload size that can be posted.
     - `runOverHttp`: (default: false) Defines whether the web application is running over http (not https) and should create non secure cookies.
     - `sessionLifeTimeInMinutes`: (default: 20160 (14 days)) Defines the life time of a session cookie.
     - `validateAuthorizationTokenWindow`: (default: false) Defines whether the authorization token timestamp should be validated.
     - `authorizationTokenValidationWindowInSeconds`: (default: 300) Defines the authorization token validation window in seconds.

3. Create `keys.json` configuration file.

    Create a `keys.jon` file within the `config folder` and update its settings!

    ```json
    {
      "configEncryptionKey": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    }
    ```

    ### settings
     - `configEncryptionKey`: This is the key used for some encryption.  It should be a `32` character `base64` encoding string.

4. run the `encrypt-configuration-files` tool

    Execute the `encrypt-configuration-files` tool to encrypt the configuration files (`config.json` and `keys.json).

    ```
    node ./encrypt-configuration-files.js
    ```

    The file can be found <a href="https://raw.githubusercontent.com/croweman/elency-config/master/server/encrypt-configuration-files.js">here</a>.

---

## How does it work?<a name="how-does-it-work"></a>

The `server` provides a `REST API` for retrieving configuration data for a team/application.  It also `optionally ` provides a Web UI for administering various data.

Essentially `clients` are used and configured to connect to the `REST API` and utilise `access tokens` and `decryption keys`.  These clients will request configuration data from a server based on an `appId`, `environment` and `version` e.g. `1.0.0`.

The `server` will process the following rules to determine what configuration (if any) should be returned:

- The configuration is `published`.
- the `configuration version` is `less than or equal to` the given `version`.
- the `configuration version` returned is the highest of all matches of the above criteria.
- the `configuration` returned is the most recent revision of the above criteria.

The `server` allows you to configure many things, some of which are the following:

- Teams
- Applications
- Environments
- Users (Optionally LDAP)
- Permissions
- Configuration Data
- Keys

The best way to see `how it works` is to have a `play`.

---

## Security<a name="security"></a>

The `server` stores all of its data with in a mongo database, some of which is `hashed` or `encrypted`.

When installing the `server`, setting up the `admin` user or creating any `keys`, it is recommended you store `sensitive` data and the `.pem key files`, `keys` and `configuration files` securely following your company guidelines.  As you may need to recover them following a failure.

The following recommendations are advised:

1. The `mongoDB` server being connected to should be locked down to require credentials in the connection string.  These would be configured in the `config.json` file which will be encrypted.

2. The `server` should be exposed over `https` for secure communication of sensitive data.  Valid `SSL certificates` should be used.

3. All types of `keys` should `not` be stored in `code bases` or `source control` providers.

4. When creating `configuration` entries any `entries` that potentially contain `secure` data should be marked as `Secure`.  These are encrypted and will need to be decrypted by clients.

5. Clients that consume the server `REST API` and make use of `HMAC Authorization` and `Configuration Encryption` keys should retrieve the `keys` following best practises and `not` be stored in code bases.

---

## Ping endpoint<a name="ping"></a>

A ping endpoint is provided so that you can determine whether the application is up and exposing routes e.g. http://address/private/ping.

The endpoint will return a `200` status code and a `pong` in the response.

---

## Health endpoint<a name="ping"></a>

A health endpoint is provided so that you can determine whether the application is up and exposing routes but also `healthy` e.g. http://address/private/health.

The endpoint will return a `200` status code if the application is healthy.

---

## Users/Roles<a name="users"></a>

On the initial first run of the `server` you will have to setup a password for the `admin` user.  This user has permissions to:

- Create users
- Edit users
- Change passwords.

The following roles are available for a user:

- `administrator`: Can create/edit users, change settings, create teams, create keys.
- `team-writer`: Can create teams and apps.
- `key-writer`: Can create keys.

Additional roles can be created.

Setting permissions to be able to create `applications`, `environments` and `configuration` is configured `per user/role`.

These permissions may be set `per team` or `per app` and will be to:

- Read
- Write
- Publish

---

## LDAP<a name="ldap"></a>

LDAP security can be configured by an `administrator` by configuring `Settings`.

---

## Keys<a name="keys"></a>

When creating `environments` they will need a `key` associated with them.

Keys can be created through the admin ui.

When editing a `key`.  Its value can be decrypted by having access to the `elency-config.private.pem` file.

Keys should be `32` character `base64` encoded strings.

These can be generated through the `ui` or by using <a href="./tools/key-generator.js">key-generator.js</a>.

---

## License<a name="license"></a>

(The MIT License)

Copyright (c) 2017 `Lee Crowe` a.k.a. `croweman`

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

