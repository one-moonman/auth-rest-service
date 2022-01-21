FROM node:17-alpine as builder

WORKDIR /home/api

COPY package*.json .

RUN npm install

COPY . .
COPY .env .

RUN npx prisma generate
EXPOSE 5000
CMD npm start