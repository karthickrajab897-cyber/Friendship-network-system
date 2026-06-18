@echo off
title Friendship Network — Client Mode
color 0A
cd /d "%~dp0"

echo.
echo  ============================================================
echo    FRIENDSHIP NETWORK — Starting Client Mode
echo  ============================================================
echo.
echo  Opening application in browser...
start index.html

echo  ============================================================
echo   Running locally without a Python server.
echo   Using JavaScript/LocalStorage for data source.
echo  ============================================================
echo.
echo  Keep this window open or close it, it is no longer required.
pause
