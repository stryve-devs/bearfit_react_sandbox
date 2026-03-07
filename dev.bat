@echo off
setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════════════════════╗
echo ║   Bearfit Development Launcher (Universal LAN Fix)      ║
echo ╚════════════════════════════════════════════════════════╝

:: ==========================================================
:: --- STEP 0: DETECT WI-FI / WIRELESS LAN IP (IPv4) ---
:: ==========================================================

set IP_ADDR=

:: Primary method: netsh wlan (works on most Windows versions)
for /f "tokens=2 delims=:" %%A in ('netsh wlan show interfaces ^| findstr /R /C:"IPv4"') do (
    set IP_ADDR=%%A
)
if defined IP_ADDR set IP_ADDR=!IP_ADDR: =!

:: Fallback: parse ipconfig looking for wireless adapter
if not defined IP_ADDR (
    for /f "tokens=*" %%A in ('ipconfig') do (
        set "LINE=%%A"

        :: detect start of adapter section
        echo !LINE! | findstr /I "adapter" >nul
        if !errorlevel! == 0 (
            set "IN_ADAPTER="
            echo !LINE! | findstr /I "wireless" >nul && set "IN_ADAPTER=1"
            echo !LINE! | findstr /I "wifi" >nul && set "IN_ADAPTER=1"
            echo !LINE! | findstr /I "wlan" >nul && set "IN_ADAPTER=1"
        )

        :: skip disconnected adapters
        if defined IN_ADAPTER (
            echo !LINE! | findstr /I "Media disconnected" >nul && set "IN_ADAPTER="
        )

        :: extract IPv4
        if defined IN_ADAPTER (
            echo !LINE! | findstr /I "IPv4" >nul
            if !errorlevel! == 0 (
                for /f "tokens=2 delims=:" %%B in ("!LINE!") do (
                    set IP_ADDR=%%B
                    set IP_ADDR=!IP_ADDR: =!
                )
                set "IN_ADAPTER="
            )
        )
    )
)

:: final fallback to localhost
if "%IP_ADDR%"=="" (
    echo Could not detect Wi-Fi/ wireless IPv4 address. Falling back to localhost.
    set IP_ADDR=localhost
) else (
    echo Detected Wi-Fi/ wireless IPv4: %IP_ADDR%
)

:: ==========================================================
:: --- STEP 1: AUTO-CREATE BACKEND .ENV IF MISSING ---
:: ==========================================================
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

:: ==========================================================
:: --- STEP 2: SET ENVIRONMENT VARIABLES FOR EXPO ---
:: ==========================================================
set EXPO_PUBLIC_API_URL=http://%IP_ADDR%:3001/api
set REACT_NATIVE_PACKAGER_HOSTNAME=%IP_ADDR%
set EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

echo Injecting API URL: %EXPO_PUBLIC_API_URL%
echo Forcing Expo Host: %REACT_NATIVE_PACKAGER_HOSTNAME%

:: ==========================================================
:: --- STEP 3: START CORE SERVICES (DATABASE + REDIS) ---
:: ==========================================================
echo Starting Database and Redis...
docker-compose up -d redis backend

echo Waiting for Database to breathe...
timeout /t 5 >nul

:: ==========================================================
:: --- STEP 4: DATA LAYER SETUP (PRISMA) ---
:: ==========================================================
echo Syncing Prisma schema...
docker-compose exec -T backend npx prisma db pull

echo Generating Prisma client...
docker-compose exec -T backend npx prisma generate

echo Restarting backend to apply changes...
docker-compose restart backend

:: ==========================================================
:: --- STEP 5: START FRONTEND ---
:: ==========================================================
echo Backend ready! Starting Frontend...
echo ----------------------------------------------------------
echo Backend:  http://localhost:3001
echo Frontend: http://%IP_ADDR%:8081
echo ----------------------------------------------------------

docker-compose up --build -d frontend

echo Attaching to Frontend (Press Ctrl+P then Ctrl+Q to detach)
echo ----------------------------------------------------------

docker attach frontend-container