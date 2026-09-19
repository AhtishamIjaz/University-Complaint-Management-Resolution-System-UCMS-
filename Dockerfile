# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:20-alpine AS client-builder
WORKDIR /app/client

# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm install

# Copy source code and build production bundle
COPY client/ ./
RUN npm run build

# ==========================================
# Stage 2: Build & Run Unified Production Server
# ==========================================
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install build dependencies for sqlite3 on Alpine if needed
RUN apk add --no-cache python3 make g++

# Copy server package definitions and install production packages
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy backend source code
COPY server/ ./

# Copy built frontend assets from Stage 1 into server's public directory
COPY --from=client-builder /app/client/dist /app/server/public

# Ensure uploads directory exists
RUN mkdir -p /app/server/uploads

# Expose port 5000
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the unified UCMS application
CMD ["npm", "start"]
