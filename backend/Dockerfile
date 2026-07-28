FROM node:24-slim

WORKDIR /data

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3003

CMD ["node", "server.js"]
