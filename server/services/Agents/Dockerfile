FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install root dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Install service dependencies
COPY ./services/Agents/package*.json ./services/Agents/
RUN cd services/Agents && npm install --omit=dev

# Copy source code
COPY services/Agents ./services/Agents
COPY shared ./shared

WORKDIR /app/services/Agents

EXPOSE 8003

CMD ["npm", "start"]
