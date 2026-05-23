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

echo [1/6] Checking .env...
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

echo [2/6] Preparing data link...
call :ensure_junction "data" "..\shared\data"
if errorlevel 1 goto :fail

echo [3/6] Preparing uploads link...
if not exist "public" mkdir "public" >nul 2>&1
call :ensure_junction "public\uploads" "..\shared\uploads"
if errorlevel 1 goto :fail

echo [4/6] Checking dependencies...
if not exist "node_modules\express\package.json" (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 goto :fail
) else (
  echo Dependencies already installed.
)

echo [5/6] Starting local server...
echo URL: http://localhost:3000
echo Press Ctrl+C to stop.
echo.

echo [6/6] Running npm.cmd run dev...
call npm.cmd run dev
goto :end

:ensure_junction
set "LINK_PATH=%~1"
set "TARGET_PATH=%~2"

if exist "%LINK_PATH%" (
  for %%A in ("%LINK_PATH%") do set "ATTR=%%~aA"
  if /I not "!ATTR:l=!"=="!ATTR!" (
    echo Link already exists: %LINK_PATH%
    exit /b 0
  )

  echo Replacing existing folder: %LINK_PATH%
  rmdir /S /Q "%LINK_PATH%" >nul 2>&1
  if exist "%LINK_PATH%" (
    echo [ERROR] Cannot remove %LINK_PATH%
    exit /b 1
  )
)

if not exist "%TARGET_PATH%\" (
  echo [ERROR] Target folder not found: %TARGET_PATH%
  exit /b 1
)

cmd /c mklink /J "%LINK_PATH%" "%TARGET_PATH%" >nul
if errorlevel 1 (
  echo [ERROR] Failed to create junction: %LINK_PATH% -> %TARGET_PATH%
  echo Try running this file as Administrator.
  exit /b 1
)

echo Created link: %LINK_PATH% -> %TARGET_PATH%
exit /b 0

:fail
echo.
echo Startup failed.
pause
exit /b 1

:end
popd >nul
exit /b 0
