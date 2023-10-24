const express = require('express');
const { expressValidateJWS } = require('@unity/node-jws-validator');
const { AsymmetricJWSValidator } = require('@unity/node-jws-validator');

const secret = 'test-secret';

(async () => {
  const app = express();
  const PORT = 4000;

  const asymmetricJWSValidator = new AsymmetricJWSValidator(
    'https://test.keys.services.unity.com/.well-known/jwks.json',
  );

  await asymmetricJWSValidator.init();

  app.enable('trust proxy');

  app.get('/', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/echo', (req, res) => {

    res.send({
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
    });
  });


  app.get('/csv', function (req, res) {
    // generate random csv files
    const numRows = 1000000;
    const csvData = [];
    csvData.push(['Name', 'Age', 'Email']);
    for (let i = 0; i < numRows; i++) {
      csvData.push([`Person ${i + 1}`, Math.floor(Math.random() * 50) + 20, `person${i + 1}@example.com`]);
    }

    const csvString = csvData.map(row => row.join(',')).join('\n');
  
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="large_dummy.csv"');
  
    res.send(csvString);
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

  app.all(
    '/v1/symmetric/status/:status/delayed/:ms',
    expressValidateJWS(secret),
    (req, res) => {
      res.status(Number(req.params.status));
      setTimeout(() => {
        res.json({
          name: 'Fake Backend Response',
          statusCode: req.params.status,
          delay: req.params.ms,
        });
      }, req.params.ms);
    },
  );

  app.all(
    '/v1/asymmetric/status/:status/delayed/:ms',
    (req, res, next) => {
      console.log(
        'URL:',
        `${req.protocol}://${req.headers.host}${req.originalUrl}`,
      );
      next();
    },
    asymmetricJWSValidator.expressValidate,
    (req, res) => {
      res.status(Number(req.params.status));
      setTimeout(() => {
        res.json({
          name: 'Fake Backend Response',
          statusCode: req.params.status,
          delay: req.params.ms,
        });
      }, req.params.ms);
    },
  );

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
  app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
  });
})();
