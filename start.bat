@echo off
start "be" cmd /k "cd be && npm run dev"
start "fe" cmd /k "cd fe && npm run dev"