# # 1
# FROM node:17-alpine as builder

# WORKDIR /home/api

# COPY package*.json .

# RUN npm install

# COPY . .
# RUN npm run build


# # 2
# FROM node:17-alpine as runner
# WORKDIR /home/api

# COPY package*.json .
# RUN npm install --production

# COPY --from=builder /home/api/build ./build
# COPY .env .

# RUN npm uninstall bcrypt
# RUN npm install bcrypt

# EXPOSE 5000
# CMD npm start

FROM node:17-alpine as builder

WORKDIR /home/api

COPY package*.json .

RUN npm install

COPY . .
COPY .env .

RUN npx prisma generate
EXPOSE 5000
CMD npm start