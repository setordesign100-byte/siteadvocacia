@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Instale o Node.js 24 LTS pelo site https://nodejs.org/
  echo Depois feche esta janela e abra este arquivo novamente.
  echo.
  pause
  exit /b 1
)
node scripts\start-local.mjs
set "rtm_exit=%errorlevel%"
if not "%rtm_exit%"=="0" pause
exit /b %rtm_exit%
