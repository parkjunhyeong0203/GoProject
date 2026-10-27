# 1. 빌드 스테이지
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. 실행 스테이지 (Node.js 런타임)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 빌드에 필요한 최소한의 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]