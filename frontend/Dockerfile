# Use full Node (not alpine) for native module support
FROM node:20

# --- ADDED FOR AUTOMATION ---
# This allows Docker to receive the IP from your dev.sh via docker-compose
ARG EXPO_PUBLIC_API_URL
ARG REACT_NATIVE_PACKAGER_HOSTNAME

# Set them as environment variables so Expo sees them during build/runtime
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV REACT_NATIVE_PACKAGER_HOSTNAME=$REACT_NATIVE_PACKAGER_HOSTNAME
# ----------------------------

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 8081 19000 19001 19002

# Refresh deps at container start so the mounted volume always contains the latest app packages.
CMD ["sh", "-c", "npm install && npx expo start --host lan --clear --port 8081"]
