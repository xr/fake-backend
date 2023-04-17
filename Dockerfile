FROM node:16.13.0 as runtime

ARG JFROG_ARTIFACTORY_READ_USER
ARG JFROG_ARTIFACTORY_READ_TOKEN

WORKDIR /unity-common-node-fake-backend

COPY package*.json ./

RUN curl -u ${JFROG_ARTIFACTORY_READ_USER}:${JFROG_ARTIFACTORY_READ_TOKEN} https://unity3d.jfrog.io/artifactory/api/npm/unity-npm-prod-local/auth/unity > ~/.npmrc
RUN curl -u ${JFROG_ARTIFACTORY_READ_USER}:${JFROG_ARTIFACTORY_READ_TOKEN} https://unity3d.jfrog.io/artifactory/api/npm/ads-npm-prod-local/auth/ads >> ~/.npmrc

RUN npm install --production

COPY index.js index.js

CMD [ "node", "index.js"]
