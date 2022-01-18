FROM node:16.13

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 8000

CMD [ "npm", "run", "oui" ]
