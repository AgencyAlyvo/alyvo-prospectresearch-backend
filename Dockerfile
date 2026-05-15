# Set version for latest LTS version of Node.js
FROM node:24.15.0

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

ENV CHOKIDAR_USEPOLLING=true

# Delete database, Run migrations, Run seed data, and start the app
CMD npm run db:fresh && \
    npm run dev
