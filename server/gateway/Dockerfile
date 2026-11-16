FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install root dependencies (ioredis, shared)
COPY package*.json ./
RUN npm install --omit=dev

# Install service dependencies
COPY ./gateway/package*.json ./gateway/
RUN cd gateway && npm install --omit=dev

# Copy source code
COPY gateway ./gateway
COPY shared ./shared

WORKDIR /app/gateway

EXPOSE 8000

CMD ["npm", "start"]
