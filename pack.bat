@echo off
cd /d "%~dp0"

echo Building...
npx vite build

echo Copying extension files...
copy manifest.json dist\ >nul
copy background.js dist\ >nul

echo Done!
dir dist\manifest.json dist\background.js
