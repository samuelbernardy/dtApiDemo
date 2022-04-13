# Dynatrace API worker
##### _Example nodeJS-express app for API workflow automation_
Using the [Dynatrace ESA Api-client](https://www.npmjs.com/package/@dt-esa/dynatrace-api-client), this app solves for workflows requiring the Dynatrace V1/V2 environment, and V1 Configuration APIs.
### Getting Started
---
Start listening for requests on port specified inside _app.js_
```sh
npm start 
```
Test server at _/_
Following message indicates server is receiving requests at specified ports
```sh
"Your server is up and running. Try using /testAPI to check your DT REST API client connection" 
```
Test API client at _/testclient_
Following message indidicates successful client configuration and provides details about active token
```sh
API CONNECTION SUCCESSFUL: {details}
```
If the active token is expired or is not valid, the appropriate message from DT API will be returned. For example:
```sh
TOKEN INVALID: Token does not exist
```
In this case, ensure the DT API CLIENT is [configured as required](https://github.com/Dynatrace-ESA/dynatrace-api-client#readme)
### Included Examples
---
##### exportMonitorsDetail
 _/exportMonitorDetails_ is provided as an example use case, exporting Synthetic Monitor Details to CSV based on query parameters passed in the request. Each parameter can be used to designate a desired value from the synthetic details payload. 
 [_HOST_]:[_PORT_]/exportMonitorsDetail?[_COLUMN\_NAME_]=[_DATA\_SOURCE_]&[_COLUMN\_NAME_]=[_DATA\_SOURCE_]
For example...
```sh
localhost:3000/exportMonitorsDetail?Monitor=entityId&Source=createdFrom&App=tags.appName
```
...returns a CSV with the following columns...
Monitor|Source|App
| ------ | ------ |------ |
HTTP_CHECK-ABCDEFG12345|API|public service 
SYNTHETIC_TEST-GFEDCBA5|GUI|auth website 

### Forthcoming Updates
---
Additional route examples will be provided over time.
### Dependencies
---
[Dynatrace API Client](https://www.npmjs.com/package/@dt-esa/dynatrace-api-client). Special thanks to [Andrew Knackstedt](https://github.com/knackstedt)

[json2csv](https://www.npmjs.com/package/json2csv) for CSV attachments

[Express](http://expressjs.com/) for handling routes

### Authors
---
##### [Samuel Bernardy](https://github.com/samuelbernardy)

[linkedin](https://www.linkedin.com/in/samuelbernardy/)

[Dynatrace One](https://www.dynatrace.com/services-support/dynatrace-one/)

##### [Andrew Knackstedt](https://github.com/knackstedt)
