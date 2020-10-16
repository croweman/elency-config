https://www.websequencediagrams.com/

title Configuration Retrieval

Client->Server: Access Token request with "authorization" header\n(HEAD http://host/config)
note right of Server: Validates authorization header
Server->Client: Returns "x-access-token" header if "authorization" header is valid
Client->Server: Configuration request with "authorization" and "x-access-token" headers\n(GET http://host/config/${appId}/${environment}/${appVersion})
note right of Server: Validates headers and determines whether Client\nhas permission to retrieve the configuration
Server->Client: Returns encrypted configuration if headers are valid


title Configuration Refresh

Client->Server: Configuration HEAD request with "authorization" and "x-version-hash" header\n(HEAD http://host/config/${appId}/${environment}/${appVersion})
note right of Server: Validates "authorization" and "x-version-hash" headers
Server->Client: Returns either a "200" or "204" http status code indicating whether the\nconfiguration has changed