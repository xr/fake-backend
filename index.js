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

  app.get('/', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.all('/v1/status/:status/delayed/:ms', (req, res) => {
    res.status(req.params.status);
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
      res.status(req.params.status);
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
    asymmetricJWSValidator.expressValidate,
    (req, res) => {
      res.status(req.params.status);
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
          res.status(req.params.status);
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
        res.status(req.params.status);
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
