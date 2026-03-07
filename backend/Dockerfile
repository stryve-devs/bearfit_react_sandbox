# Use Debian-based Node instead of Alpine (has OpenSSL built-in)
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy all remaining source code
COPY . .

# Expose port 3001 for the backend
EXPOSE 3001

# Run TypeScript directly with ts-node
CMD ["npx", "ts-node", "src/server.ts"]