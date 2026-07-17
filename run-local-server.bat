@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

set "APP_DIR=%~dp0"
pushd "%APP_DIR%" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Cannot open app directory.
  pause
  exit /b 1
)

if not exist "server\server.js" (
  echo [ERROR] Wrong folder. Put this file in the app root.
  pause
  exit /b 1
)

echo [1/4] Checking .env...
if not exist ".env" (
  if exist ".env.example" (
    copy /Y ".env.example" ".env" >nul
    echo Created .env from .env.example
  ) else (
    echo [ERROR] .env.example not found.
    pause
    exit /b 1
  )
)

echo [2/4] Checking project data...
if not exist "data\site-content.json" (
  if exist "data\site-content.example.json" (
    copy /Y "data\site-content.example.json" "data\site-content.json" >nul
    echo Created local demo content from site-content.example.json
  ) else (
    echo [ERROR] data\site-content.json not found.
    echo Restore the project data or add site-content.example.json.
    pause
    exit /b 1
  )
)

echo [3/4] Checking dependencies...
if not exist "node_modules\express\package.json" (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] Dependency installation failed.
    pause
    popd >nul
    exit /b 1
  )
) else (
  echo Dependencies already installed.
)

echo [4/4] Starting local server...
echo URL: http://localhost:3000
echo Press Ctrl+C to stop.
echo.

echo Running npm.cmd run dev...
call npm.cmd run dev
goto :end

:end
popd >nul
exit /b 0
