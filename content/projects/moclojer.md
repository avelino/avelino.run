+++
date = "2022-02-22"
title = "moclojer"
tags = ["mock", "api-mock", "mock-server", "openapi", "openapi-mock", "clojure", "open source"]
link = "https://github.com/avelino/moclojer"
img = "https://github.com/avelino/moclojer/raw/main/doc/assets/logo.png"
comment = false
+++

Simple and efficient HTTP **mock server** _open source_, [project repository](https://github.com/avelino/moclojer).

The [**`(-> moclojer)`**](https://github.com/avelino/moclojer) supports API-first development with the API Builder. You can design your API directly with **`(-> moclojer)`** using the `yaml`, `edn`, and **`OpenAPI`** specification. Your specification can then act as the only source of truth for your API design.

<!-- more -->

![mock server - moclojer](https://github.com/avelino/moclojer/raw/main/doc/assets/logo.png)

You can make requests that return mock data defined within **`(-> moclojer)`** if you do not have a production API ready, or you do not want to run your requests against real data yet. By adding a mock server to your collection and adding examples to your requests, you can simulate the behavior of a real API.

When you send a request to a mock server, **`(-> moclojer)`** will match the request configuration to the examples you have saved for the request and respond with the data you added in the configuration (written in [`yaml`](https://yaml.org/spec/), [`edn`](https://github.com/edn-format/edn) or [`OpenAPI`](https://swagger.io/specification/)).

> **Hot Reload** support, when updating the configuration file (yaml or edn) the new settings are reloaded automatically, accelerating the development process of your mock server.

## Creating mock server

**`(-> moclojer)`** uses the specifications written in the configuration file to declare the endpoints, uri parameters, and its return (which can be dynamic with the data received in the request).

Create a file named `moclojer.yml` (we will use yaml because it is a more familiar format to most people, k8s did a great job diseminating this format), inside the yaml file created put the following content:

```yaml
- endpoint:
    method: GET
    path: /hello/:username
    response:
      status: 200
      headers:
        Content-Type: application/json
      body: >
        {
          "hello": "{{path-params.username}}!"
        }

- endpoint:
    method: GET
    path: /hello-world
    response:
      status: 200
      headers:
        Content-Type: application/json
      body: >
        {
          "hello": "Hello, World!"
        }
- endpoint:
    method: GET
    path: /with-params/:param1
    response:
      status: 200
      headers:
        Content-Type: application/json
      body: >
        {
          "path-params": "{{path-params.param1}}",
          "query-params": "{{query-params.param1}}"
        }
- endpoint:
    method: POST
    path: /first-post-route
    response:
      status: 200
      headers:
        Content-Type: application/json
      body: >
        {
          "project": "{{json-params.project}}"
        }
```

Describing all endpoints declared in the configuration file, you can see the following:

| path | method | descrition |
| --- | --- | --- |
| `/hello/:username` | GET | Will take a parameter from the url called username and return the username dynamically from the response body. |
| `/hello-world` | GET | Static endpoint that returns content that is not dynamic. |
| `/with-params/:param1` | GET | It will take a parameter from the url called param1 and the query string called param1, and return both parameters dynamically in the response body. Exemplifying how to consume the two types of parameters in the return from the endpoint. |
| `/first-post-route` | POST | It will take a parameter from the body called project, and return the project name dynamically from the response body. |

### Run it mocker server

You don't have the binary file yet? [Download it here](https://github.com/avelino/moclojer/releases/latest). The moclojer is distributed as follows:

- Binary format: `moclojer_<OS>` - _in binary format (you don't need anything additional on your operating system to run it)_
  - Linux `moclojer_Linux`
  - macOS `moclojer_macOS`
- `moclojer.jar` - _in java format (you need to install java to run it)_
- Docker image - _in docker format (you need to install docker to run it)_

After creating the file you must run moclojer passing the configuration file by the `CONFIG` environment variable:

```sh
CONFIG=moclojer.yml moclojer # binary filename
```

**`moclojer.jar`:**

```sh
CONFIG=moclojer.yml java -jar moclojer.jar
```

**Docker:**

```sh
docker pull ghcr.io/avelino/moclojer:latest
docker run -it \
  -v $(pwd)/moclojer.yml:/app/moclojer.yml \
  ghcr.io/avelino/moclojer:latest
```

to use the `edn` format, you must pass the following parameters to docker:
`-e CONFIG=moclojer.edn -v $(pwd)/moclojer.edn:/app/moclojer.edn`

## Return template

**`(-> moclojer)`** uses a template engine with [**jinja** `{{var}}`](https://github.com/yogthos/Selmer#built-in-tags-1) syntax to make it possible to make the API return dynamic content. Opening the possibility to use operators (`if`, `ifequal`, `ifunequal`, `for`, `firstof` and etc) and programming logic to validate received parameters.

```yaml
- endpoint:
    method: GET
    path: /condition/:param1
    response:
      status: 200
      headers:
        Content-Type: application/json
      body: >
        {
          "unique-param": "{% ifequal path-params.param1 "moclojer" %}{{path-params.param1}}{% else %}{{query-params.param1}}{% endifequal %}"
        }
```

**Variables:**

- `path-params`: the parameters passed to the endpoint `/hello/:username`
- `query-params`: the parameters passed in _query string_ to the endpoint `?param1=value1&param2=value2`
- `json-params`: the parameters passed in _data request_ to the endpoint `{"param1": "value1"}`

**Example**

```json
{
  "path-params": "{{path-params.param1}}",
  "query-params": "{{query-params.param1}}",
  "json-params": "{{json-params.param1}}"
}
```

### `.edn` exemple

```
{:endpoint {:method :get
            :path "/pets"
            :response {:status 200
                       :headers {:content-type  "applicantion/json"}
                       :body {:pets [{:name "Uber" :type "dog"}
                                     {:name "Pinpolho" :type "cat"}]}}
            :router-name :get-all-pets}}

{:endpoint {:method :get
            :path "/pet/:id"
            :response {:status 200
                       :headers {:content-type  "applicantion/json"}
                       :body {:id 1 :name "uber" :type "dog"}}
            :router-name :get-pet-by-id}}
```

## OpenAPI Integration

You can easily mock all routes routes from a OpenAPI v3 specification.
For this, you will need to define one response for each operation.

> Example `mocks.yaml`

```yaml
listPets:
  status: 200
  headers:
    Content-Type: application/json
  body: >
    []
```

Then call `moclojer` passing both OpenAPI spec and mocks as paramters:

```shell
CONFIG="petstore.yaml" MOCKS="mocks.yaml" clojure -X:run
```

you can config a mock server with edn file as well

```shell
CONFIG="moclojer.edn" clojure -X:run
```

## How to contribute?

We are open to new ideas to keep **`(-> moclojer)`** better, for that we need your contribution (**not only writing code**, contributing with what you do best), so from this moment on I welcome you to the **`(-> moclojer)` team**.

If you have a requirement that doesn't already exist in moclojer ask for it via **issue** on the project's github, [here](https://github.com/avelino/moclojer/issues).

> We have a lot to evolve and we need you to make new ideas to make **`(-> moclojer)`** even better.
