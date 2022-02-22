FROM node:16.13

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN apt update
RUN apt upgrade -y
RUN apt install docker -y
RUN apt install docker-compose -y

COPY . ./Docker-md5-force
WORKDIR /usr/src/app/Docker-md5-force

EXPOSE 3000
EXPOSE 8000

CMD [ "npm", "run", "oui" ]
