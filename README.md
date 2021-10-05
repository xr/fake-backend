# unity-common-node-fake-backend
Public slack channel: [#services-foundation-pod](https://unity.slack.com/messages/CPB6NAPDY/) <br/>
[View this project in Backstage](https://backstage.corp.unity3d.com/catalog/default/component/unity-common-node-fake-backend) <br/>

This is a common fake backend repo used by Services Foundation Team to load test Unity Game Gateway and Unity Services Gateway. The backend has following endpoints:

```
1. General purpose endpoint:
  [POST, GET, PUT, DELETE] - status/:statusCode/delayed/:ms
  # statusCode - the status code you want it to return: 200, 500, 404, whatever
  # ms - artificial delay for response.

2. To test file uploads
  [POST] - /upload/delayed/:ms/size/:expectedSizeKb
  # ms - artificial delay for response.
  # expectedSizeKb -  size of file in KB, you shoud put it less than the actual content length. It is just here to verify that we recieve a file with expected size.
```
