# 1
FROM node:17-alpine

WORKDIR /home/api

COPY package*.json .

RUN npm install

COPY . .
COPY .env .

RUN npm uninstall bcrypt
RUN npm install bcrypt

EXPOSE 5000
CMD npm start