#!/bin/bash

set -e

# Function to detect local IP address
get_local_ip(){
    if [[ "$OSTYPE" == "darwin"* ]]; then
        ipconfig getifaddr en0 || ipconfig getifaddr en1
    else
        hostname -I | awk '{print $1}'
    fi
}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Bearfit Development Launcher (Auto-Setup Mode)       ║"
echo "╚════════════════════════════════════════════════════════╝"

# Auto-create backend .env if missing
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found. Creating...${NC}"
    cat > backend/.env << 'EOF'
DATABASE_URL=postgres://517ad6be03b766c898c174078fd5fc40df4e1837529c3d4ab17ff25da8d23425:sk_ToL0a-qeuyPoD2eKGywxJ@db.prisma.io:5432/postgres?sslmode=require
REDIS_URL=redis://redis:6379
JWT_ACCESS_SECRET=8793625873f1018710215325b6b85e208b847b0cfdb08b5798ebca5bc8e01d3ccfa9c0193ec2fc9812dcbea79e06a07cddb611c386b6365eecd7e06b8b2e993f
JWT_REFRESH_SECRET=2d83a47e85ab010bd46a2345d5775c32a81da30379379f5978e83eec79769463d2afcbbc7d4e66b4e5d14af7d823386754ee40e074492e5cbd5fd72c195ba157
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ backend/.env created${NC}"
fi

IP=$(get_local_ip)

if [ -z "$IP" ]; then
    echo "Could not detect local IP. Falling back to localhost."
    export IP_ADDR="localhost"
else
    echo -e "${GREEN}Detected LAN IP: $IP${NC}"
    export IP_ADDR=$IP
fi

# Set the API URL for both the Host and the Container environment
export EXPO_PUBLIC_API_URL="http://$IP_ADDR:3001/api"
export REACT_NATIVE_PACKAGER_HOSTNAME=$IP_ADDR

echo -e "${YELLOW}🚀 Injecting API URL: $EXPO_PUBLIC_API_URL${NC}"

# --- STEP 1: START CORE SERVICES ---
echo "Starting Database and Redis..."
docker-compose up -d redis backend

echo "Waiting for Database to breathe..."
sleep 5

# --- STEP 2: DATA LAYER SETUP ---
echo "Syncing Prisma schema..."
docker-compose exec -T backend npx prisma db pull

echo "Generating Prisma client..."
docker-compose exec -T backend npx prisma generate

echo "Restarting backend to apply changes..."
docker-compose restart backend

# --- STEP 3: START FRONTEND & ATTACH ---
echo -e "${GREEN}✅ Backend ready! Starting Frontend...${NC}"
echo "----------------------------------------------------------"
echo "Backend:  http://localhost:3001"
echo "Frontend: http://$IP_ADDR:8081"
echo "----------------------------------------------------------"

# We start the frontend here. Because it starts NOW, it will see your
# terminal window immediately and render the barcode correctly.
docker-compose up --build -d frontend

echo "Attaching to Frontend (Press 'r' to reload, 'a' for Android)"
echo "To exit without stopping, press Ctrl+P then Ctrl+Q"
echo "----------------------------------------------------------"

# Use the service name to ensure we catch it as it boots
docker attach frontend-container