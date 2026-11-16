FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install root dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Install service dependencies
COPY ./services/Payment/package*.json ./services/Payment/
RUN cd services/Payment && npm install --omit=dev

# Copy source code
COPY services/Payment ./services/Payment
COPY shared ./shared

WORKDIR /app/services/Payment

EXPOSE 8004

CMD ["npm", "start"]
