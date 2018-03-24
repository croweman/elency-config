# elency-config

elency-config is an open-source solution to configuration management for multi-tenant applications hosted on any platform.

elency-config allows you to seperate your configuration from your application code.

## Table of contents

- [Server](#server)
- [Clients](#clients)
- [Examples](#examples)
- [Demo](#demo)
- [Tutorials](#tutorials)
- [License](#license)

---

## Server<a name="server"></a>

Please refer to <a href="./server.md">server.md</a> for more information around setting up an `elency-config-server`.

---

## Clients<a name="clients"></a>

Please refer to <a href="./clients.md">clients.md</a> for more information around using `elency-config` clients.

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

The demo can be setup by firstly downloading <a href="https://raw.githubusercontent.com/croweman/elency-config/master/demo/docker/docker-compose.yml">docker-compose.yml</a>.

Once the `docker-compose.yml` has been downloaded into a directory, execute the following command within the scope of the directory.

```
docker-compose up
```

To view/create/change configuration etc on the `elency-config-server` browse to <a href="http://localhost:3000">http://localhost:3000<a/>.

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

---

## License<a name="license"></a>

(The MIT License)

Copyright (c) 2017 `Lee Crowe` a.k.a. `croweman`

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
