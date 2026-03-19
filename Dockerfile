# Dockerfile — GerminaPedia Backend
# Multi-stage build para imagem de produção enxuta

# ─── Stage 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências (cache layer separado)
COPY package*.json ./
RUN npm ci --only=production=false

# Copia código e compila TypeScript
COPY . .
RUN npx prisma generate
RUN npm run build

# ─── Stage 2: Production ───────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

# Roda migrations e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
