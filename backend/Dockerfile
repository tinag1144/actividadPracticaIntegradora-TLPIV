FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

# The seed is idempotent, so it is safe to run on every start.
CMD ["sh", "-c", "npm run seed && npm start"]
