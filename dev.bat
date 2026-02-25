@echo off
setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════════════════════╗
echo ║   Bearfit Development Launcher (Universal LAN Fix)      ║
echo ╚════════════════════════════════════════════════════════╝

:: --- Detect REAL Windows LAN IP (any private range 10.x.x.x, 172.16-31.x.x, 192.168.x.x) ---
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4.*192\." /C:"IPv4.*172\." /C:"IPv4.*10\."') do (
    set IP_ADDR=%%a
    set IP_ADDR=!IP_ADDR: =!
    goto :ipfound
)

:ipfound
if "%IP_ADDR%"=="" (
    echo Could not detect LAN IP. Falling back to localhost.
    set IP_ADDR=localhost
) else (
    echo Detected LAN IP: %IP_ADDR%
)

:: --- Auto-create backend .env if missing ---
if not exist backend\.env (
    echo backend\.env not found. Creating...

    (
        echo DATABASE_URL=postgres://517ad6be03b766c898c174078fd5fc40df4e1837529c3d4ab17ff25da8d23425:sk_ToL0a-qeuyPoD2eKGywxJ@db.prisma.io:5432/postgres?sslmode=require
        echo REDIS_URL=redis://redis:6379
        echo JWT_ACCESS_SECRET=8793625873f1018710215325b6b85e208b847b0cfdb08b5798ebca5bc8e01d3ccfa9c0193ec2fc9812dcbea79e06a07cddb611c386b6365eecd7e06b8b2e993f
        echo JWT_REFRESH_SECRET=2d83a47e85ab010bd46a2345d5775c32a81da30379379f5978e83eec79769463d2afcbbc7d4e66b4e5d14af7d823386754ee40e074492e5cbd5fd72c195ba157
        echo JWT_ACCESS_EXPIRES_IN=15m
        echo JWT_REFRESH_EXPIRES_IN=7d
        echo PORT=3001
        echo NODE_ENV=development
    ) > backend\.env

    echo backend\.env created
)

:: --- Set environment variables for Expo ---
set EXPO_PUBLIC_API_URL=http://%IP_ADDR%:3001/api
set REACT_NATIVE_PACKAGER_HOSTNAME=%IP_ADDR%
set EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

echo Injecting API URL: %EXPO_PUBLIC_API_URL%
echo Forcing Expo Host: %REACT_NATIVE_PACKAGER_HOSTNAME%

:: --- STEP 1: START CORE SERVICES ---
echo Starting Database and Redis...
docker-compose up -d redis backend

echo Waiting for Database to breathe...
timeout /t 5 >nul

:: --- STEP 2: DATA LAYER SETUP ---
echo Syncing Prisma schema...
docker-compose exec -T backend npx prisma db pull

echo Generating Prisma client...
docker-compose exec -T backend npx prisma generate

echo Restarting backend to apply changes...
docker-compose restart backend

:: --- STEP 3: START FRONTEND ---
echo Backend ready! Starting Frontend...
echo ----------------------------------------------------------
echo Backend:  http://localhost:3001
echo Frontend: http://%IP_ADDR%:8081
echo ----------------------------------------------------------

docker-compose up --build -d frontend

echo Attaching to Frontend (Press Ctrl+P then Ctrl+Q to detach)
echo ----------------------------------------------------------

docker attach frontend-container