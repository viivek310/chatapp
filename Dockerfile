# ===================================================
# Stage 1: Build Frontend Assets
# ===================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

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
RUN npm install --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from Stage 1 into server static directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
# Ensure uploads directory exists and is owned by non-root node user
RUN mkdir -p /app/backend/uploads && chown -R node:node /app/backend/uploads

EXPOSE 5000

USER node

CMD ["node", "backend/server.js"]

