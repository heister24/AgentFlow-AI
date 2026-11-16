FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install root dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Install service dependencies
COPY ./services/Chat/package*.json ./services/Chat/
RUN cd services/Chat && npm install --omit=dev

# Copy source code
COPY services/Chat ./services/Chat
COPY shared ./shared

WORKDIR /app/services/Chat

EXPOSE 8002

CMD ["npm", "start"]
