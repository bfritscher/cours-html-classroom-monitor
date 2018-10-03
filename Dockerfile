FROM node:10
RUN mkdir -p /app
COPY package.json /app/package.json

WORKDIR /app
RUN npm install --production
COPY /dist /app/dist
COPY /public /app/public
# Define default command.
CMD ["node", "dist/server.js"]