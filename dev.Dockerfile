# base image
FROM node:10-slim

# set working directory
WORKDIR /opt/app

# install and cache app dependencies
COPY package.json ./
RUN npm install --silent

COPY . .

# start app
CMD ["npm", "run", "dev"]