@echo off
title Pawchive
color 0A
cls

echo.
echo  =========================================
echo       PAWCHIVE  -  Media Archive
echo  =========================================
echo.

:: ── Check Docker ────────────────────────────────────────────────
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Docker Desktop is not running.
    echo.
    echo  1. Open Docker Desktop from your Start menu
    echo  2. Wait until the whale icon in the taskbar stops animating
    echo  3. Then double-click start.bat again
    echo.
    pause
    exit /b 1
)

:: ── Create .env on first run ─────────────────────────────────────
if not exist ".env" (
    copy ".env.example" ".env" >nul 2>&1
    echo  Created .env file with default settings.
    echo.
)

:: ── Read PORT from .env ──────────────────────────────────────────
set PORT=7890
for /f "tokens=1,2 delims==" %%A in ('findstr /i "^PORT" .env 2^>nul') do set PORT=%%B

:: ── STEP 1: Build images ─────────────────────────────────────────
echo  [Step 1 of 2] Building Docker images...
echo  (First run takes 3-5 minutes — please wait)
echo.
docker compose build
if %errorlevel% neq 0 (
    echo.
    echo  =========================================
    echo   [ERROR] Build failed — see output above
    echo  =========================================
    echo.
    pause
    exit /b 1
)

:: ── STEP 2: Start services ───────────────────────────────────────
echo.
echo  [Step 2 of 2] Starting Pawchive...
docker compose up -d
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Could not start services.
    echo  Run this command to see details:  docker compose logs
    echo.
    pause
    exit /b 1
)

:: ── Wait for web container to be ready ──────────────────────────
echo.
echo  Waiting for app to be ready...
timeout /t 5 /nobreak >nul

:: ── Done ─────────────────────────────────────────────────────────
echo.
echo  =========================================
echo   Pawchive is running!
echo   http://localhost:%PORT%
echo  =========================================
echo.
echo  To STOP:  run  docker compose down  in this folder
echo            or close Docker Desktop
echo.
echo  Press any key to open the browser...
pause >nul
start http://localhost:%PORT%
