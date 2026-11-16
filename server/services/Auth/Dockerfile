FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install root dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Install service dependencies
COPY ./services/Auth/package*.json ./services/Auth/
RUN cd services/Auth && npm install --omit=dev

# Copy source code
COPY services/Auth ./services/Auth
COPY shared ./shared

WORKDIR /app/services/Auth

EXPOSE 8001

CMD ["npm", "start"]
