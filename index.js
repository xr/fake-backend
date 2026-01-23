const express = require('express');
const path = require('path');
const fs = require('fs');
const { generateResponsePayload, parseSize } = require('./response-payload-generator');

(async () => {
  const app = express();
  const PORT = 8080;

  app.enable('trust proxy');
  app.use(express.json());

  app.get('/csv', function (req, res) {
    const filePath = path.join(__dirname, 'test_csv_file.csv');
    const stream = fs.createReadStream(filePath);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="test.csv"');

    stream.pipe(res);
  });

  app.get('/file', function (req, res) {
    const filePath = path.join(__dirname, 'test_file');
    const stream = fs.createReadStream(filePath);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="test_file"');

    stream.pipe(res);
  });

  app.all('/v1/status/:status/delayed/:ms', (req, res) => {
    res.status(Number(req.params.status));
    setTimeout(() => {
      res.json({
        name: 'Fake Backend Response',
        statusCode: req.params.status,
        delay: req.params.ms,
      });
    }, req.params.ms);
  });

  app.post(
    '/v1/upload/status/:status/delayed/:ms/size/:expectedContentLength',
    (req, res) => {
      let payloadSize = 0;

      req.on('end', () => {
        const expectedLength = Number.parseInt(
          req.params.expectedContentLength,
          10,
        );
        if (expectedLength && expectedLength !== payloadSize) {
          res.status(400);
          res.setHeader('content-type', 'application/problem+json');
          res.json({
            error: `Expected length ${expectedLength} is not equal to payload size ${payloadSize}`,
          });
          return;
        }

        setTimeout(() => {
          res.status(Number(req.params.status));
          res.json({
            name: 'Fake Backend Response',
            statusCode: req.params.status,
            delay: req.params.ms,
            fileSize: payloadSize,
          });
        }, req.params.ms);
      });

      req.on('data', (chunk) => {
        payloadSize += chunk.length;
      });
    },
  );

  app.post(
    '/v1/upload/failed/status/:status/delayed/:ms/size/:expectedContentLength',
    (req, res) => {
      let payloadSize = 0;
      setTimeout(() => {
        res.status(Number(req.params.status));
        res.json({
          name: 'Fake Backend Response',
          statusCode: req.params.status,
          delay: req.params.ms,
          fileSize: payloadSize,
        });
      }, req.params.ms);
      req.on('data', (chunk) => {
        payloadSize += chunk.length;
      });
    },
  );

  app.post('/test-payload', (req, res) => {
    // Read the response size header (e.g., "1kb", "10mb", "10mb")
    const responseSizeHeader = req.headers['x-test-response-size'] || '1kb';

    try {
      // Parse the size and validate it
      const targetSizeBytes = parseSize(responseSizeHeader);
      const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

      // Validate user input: only allow 10MB or less
      if (targetSizeBytes > MAX_SIZE_BYTES) {
        res.status(400).json({
          error: `Requested size exceeds maximum allowed size of 10MB. Requested: ${responseSizeHeader}`,
          maxSize: '10mb',
          requestedSize: responseSizeHeader
        });
        return;
      }

      // Generate appropriate response
      const responsePayload = generateResponsePayload(targetSizeBytes);
      res.json(responsePayload);
    } catch (error) {
      console.error('Error generating response:', error);
      // Fallback to default response
      res.json({
        offset: 10,
        limit: 5,
        total: 20,
        results: [
          {
            name: "Fake Backend Response",
            fileSize: 23333,
            extra: "extra",
          },
          {
            name: "Fake Backend Response 2",
            fileSize: 23333,
            extra: "extra",
          },
        ],
      });
    }
  });

  app.all('*', (req, res) => {
    let payloadSize = 0;
    let chunkToString = false;

    if (req.headers['chunk-to-string'] || process.env.CHUNK_TO_STRING) {
      chunkToString = true;
    }

    req.on('data', (chunk) => {
      payloadSize += chunk.length;
      console.log(`received chunk length: ${chunk.length}, total: ${payloadSize}`);
      if (chunkToString) {
        console.log(chunk.toString());
      }
    });

    req.on('end', () => {
      console.log(`received total payload size: ${payloadSize}`);
      let resPayload = {
        headers: req.headers,
        query: req.query,
        params: req.params,
        url: req.url,
        body: req.body,
        hostname: req.hostname,
        ip: req.ip,
        ips: req.ips,
        method: req.method,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        protocol: req.protocol,
        cookies: req.cookies,
        payloadSize: payloadSize,
        chunkToString: chunkToString,
      }
      console.log('Response Payload:', resPayload);
      res.send(resPayload);
    });
  });


  app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
  });
})();
