FROM node:20-alpine3.16

WORKDIR /srv/app

COPY package*.json tsconfig.json .env  ./

RUN yarn install

COPY . .

EXPOSE 2305

# Start the application
CMD [ "yarn", "start" ]
