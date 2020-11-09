FROM node:alpine

EXPOSE 3001

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD ["node", "app.js"]
