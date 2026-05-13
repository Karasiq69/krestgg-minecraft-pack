FROM node:23-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY src ./src
COPY tsconfig.json ./
ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]
