# Use Debian-based Node instead of Alpine (has OpenSSL built-in)
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies for ts-node/types)
RUN npm ci --no-audit --no-fund

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy all remaining source code
COPY . .

# Expose port 3001 for the backend
EXPOSE 3001

# Run nodemon directly (avoid npm wrapper to prevent interleaved npm SIGTERM logs)
CMD ["npx", "nodemon", "src/server.ts"]
