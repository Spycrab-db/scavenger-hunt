FROM node:18.17.1
WORKDIR /scavenger-hunt

COPY package*.json ./
RUN npm i

COPY . .

EXPOSE 8080

CMD [ "npm", "start"]