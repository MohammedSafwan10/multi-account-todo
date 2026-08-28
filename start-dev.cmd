@echo off
setlocal
cd /d "%~dp0"

if not exist .env (
  echo Missing .env file.
  echo Copy .env.example to .env and add your Auth0 values first.
  exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
  echo Docker is not running. Start Docker Desktop and try again.
  exit /b 1
)

docker compose --env-file .env -f docker-compose.yml -f docker-compose.local.yml up --build

