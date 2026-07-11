#!/usr/bin/env bash
set -e

echo ""
echo "  ========================================="
echo "       PAWCHIVE  -  Media Archive"
echo "  ========================================="
echo ""

# ── Check Docker ────────────────────────────────────────────────
if ! docker info > /dev/null 2>&1; then
  echo "  [ERROR] Docker Desktop is not running."
  echo ""
  echo "  Start Docker Desktop, wait for it to finish loading,"
  echo "  then run this script again."
  echo ""
  exit 1
fi

# ── Create .env on first run ─────────────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  Created .env file with default settings."
  echo ""
fi

# ── Read PORT from .env ──────────────────────────────────────────
PORT=$(grep -E '^PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d ' \r')
PORT="${PORT:-7890}"

# ── STEP 1: Build images ─────────────────────────────────────────
echo "  [Step 1 of 2] Building Docker images..."
echo "  (First run takes 3-5 minutes — please wait)"
echo ""
docker compose build

# ── STEP 2: Start services ───────────────────────────────────────
echo ""
echo "  [Step 2 of 2] Starting Pawchive..."
docker compose up -d

# ── Wait for web container to be ready ──────────────────────────
echo ""
echo "  Waiting for app to be ready..."
sleep 5

# ── Done ─────────────────────────────────────────────────────────
echo ""
echo "  ========================================="
echo "   Pawchive is running!"
echo "   http://localhost:$PORT"
echo "  ========================================="
echo ""
echo "  To STOP:  docker compose down"
echo ""

# Open browser
if command -v xdg-open &>/dev/null; then
  xdg-open "http://localhost:$PORT"
elif command -v open &>/dev/null; then
  open "http://localhost:$PORT"
fi
