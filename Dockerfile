FROM node:16.13.0 as runtime

WORKDIR /unity-common-node-fake-backend

COPY package*.json ./

RUN npm install --production

COPY index.js index.js

CMD [ "node", "index.js"]
