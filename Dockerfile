FROM node:20.0.0 as runtime

WORKDIR /fake-backend

COPY package*.json ./

RUN npm install --production

COPY index.js index.js
COPY test_csv_file.csv test_csv_file.csv
COPY test_file test_file

CMD [ "node", "index.js"]
