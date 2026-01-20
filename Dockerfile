# Use Node.js LTS image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/
COPY public/ ./public/

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app

# Switch to non-root user (node user already exists in node images)
USER node

# Expose web port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${WEB_PORT:-3000}/api/events || exit 1

# Run the bot
CMD ["node", "src/index.js"]
