# ===================================================
# Stage 1: Build Frontend Assets
# ===================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ===================================================
# Stage 2: Production Server
# ===================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from Stage 1 into server static directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

USER node

CMD ["node", "backend/server.js"]
