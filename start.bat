@echo off
start "be" cmd /k "cd be && node server.js"
start "fe" cmd /k "cd fe && npm run dev"