# elency-config

elency-config, an open-source solution to application/microservice configuration management.

## Table of contents

- [But, what is it?](#whatisit)
  - [But, why?](#butwhy)
- [Server](#server)
- [Clients](#clients)
- [Examples](#examples)
- [Demo](#demo)
- [Tutorials](#tutorials)
- [License](#license)

---

## But, what is it?<a name="whatisit"></a>

elency-config is an open-source solution to application/microservice configuration management for multi-tenant applications hosted on any platform.

It allows you to seperate your configuration from your application code.

At a basic level it provides:

- Admin Web UI
  - Http administration UI for administrating application/microservice configuration.
  - Optional JSON Schema enforcement on configuration
  - Secure configuration data storage
  - Configuration versioning
  - Configuration version comparison
  - User/Role/Permission management
  - Auditing on configuration changes

- Client Http REST API
  - Retrieving configuration per application/environment.
  - Configuration versioning
  - Secure encrypted configuration over HTTP transport

### But why?<a name="butwhy"></a>

There are many other alternatives to application configuration on the open-source shelf.

I fancied building one of my own just initially for something to do :p

The alternative solutions to configuration management did not offer a solution that worked in the way I wanted it to work.

I have worked in many teams that have accidentally or incorrectly placed secure configuration in source control repositories.

I wanted a simple service to allow a developer to abstract all of there configuration away into a seperate data store securely.

Have a nice UI on top it with user/role management, allowing teams to manage and version configuration per environment.

A simple REST API that would allow any application to consume the required configuration.

Hence elency-config. Try it out!

---

## Server<a name="server"></a>

Please refer to <a href="./documentation/server.md">server.md</a> for more information around setting up an `elency-config-server`.

---

## Clients<a name="clients"></a>

Please refer to <a href="./documentation/clients.md">clients.md</a> for more information around using `elency-config` clients.

---

## Examples<a name="examples"></a>

Basic client usage examples can be found in the following places:

- `c#`: See <a href="./example/csharp/Example">here<a/>.
- `node`: See <a href="./example/node">here<a/>.

---

## Demo<a name="demo"></a>

### Video demo

A video can be found below demonstrating basic usage of the admin ui.

[![elency-config server](https://img.youtube.com/vi/MO5aSvd_GjY/0.jpg)](https://www.youtube.com/watch?v=MO5aSvd_GjY)

### Real demo

* The demo has a dependency on `Docker Compose`.

The demo spins up in a docker containerised environment a mongo instance populated with sample data, an `elency-config-server` (with ui) and a `node client` that consumes configuration from the `Centre` app under team `Atlanta Falcons` with real time refreshing every `1000ms`.

The demo can be setup by firstly downloading <a href="https://raw.githubusercontent.com/croweman/elency-config/master/demo/docker/docker-compose.yml">docker-compose.yml</a> and placing it into an `elency-config` directory.

Once the above has been completed execute the following command within the scope of the `elency-config` directory.

```
docker-compose up
```

To view/create/change configuration etc on the `elency-config-server` browse to <a href="https://elency-config.vcap.me">https://elency-config.vcap.me<a/>.  You will need to `trust` the `insecure` certifacte!

Useful logins are `admin` and `joe.bloggs`

Passwords are `aA1!aaaa`

The demo is configured to use `LDAP` security which can be turned on and off via `Settings`.

Available users and passwords can be found <a href="https://raw.githubusercontent.com/croweman/elency-config/master/server/specs/support/ldap-mock-server/lib/configuration.js">here</a>.

`Prod - Atlanta Falcons` key value for decrypting secure keys on `Prod` configurations for the `Atlanta Falcons - Centre` app.

```
M2Y0M2E0NTMyZDBjNDNjNDk5YWJjOGEy
```

A `JSON Schema` has been setup for the `Atlanta Falcons - Wide receiver` app to demonstrate enforcing a schema.

The docker-compose real-time console logging will show you any updates that occur for the `Centre` app under team `Atlanta Falcons`.  You can also execute the following to tail the logs

```
docker logs -t -f --tail 100 elency-config-client-demo
```

If you would like to bring down the containers execute

```
docker-compose down
```

---

## Tutorials<a name="tutorials"></a>

Some tutorials are available on youtube.com:

- <a href="https://www.youtube.com/watch?v=gNH7-EZnV2M">elency-config server setup tutorial</a>
- <a href="https://www.youtube.com/watch?v=MdhCpUmYyF0">elency-config server administration ui tutorial</a>
- <a href="https://www.youtube.com/watch?v=xgOfQGkAbPI">elency-config - node.js client - configuration retrieval tutorial</a>

---

## License<a name="license"></a>

(The MIT License)

Copyright (c) 2020 `Lee Crowe` a.k.a. `croweman`

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
