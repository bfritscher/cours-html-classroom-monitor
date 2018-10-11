FROM node:10

# chrome dependencies
RUN apt-get update && apt-get install -y unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
# Cleanup
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir -p /app
COPY package.json /app/package.json

WORKDIR /app
RUN npm install --production
COPY jest-setup.js /app/jest-setup.js
COPY jest-puppeteer.config.js /app/jest-puppeteer.config.js
COPY /dist /app/dist
COPY /public /app/public
COPY /assignments_tests /app/assignments_tests
# Define default command.
CMD ["node", "dist/server.js"]