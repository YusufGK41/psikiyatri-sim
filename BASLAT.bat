@echo off
chcp 65001 >nul 2>&1
title Psikiyatri Acil Servisi - Karar Destek Sistemi

echo.
echo  ========================================================
echo    Psikiyatri Acil Servisi Simulasyon Sistemi
echo  ========================================================
echo.

set "PROJE=%~dp0"
if "%PROJE:~-1%"=="\" set "PROJE=%PROJE:~0,-1%"

cd /d "%PROJE%"

:: Python kontrolu
echo  [1/4] Python kontrol ediliyor...
where python >nul 2>&1
if errorlevel 1 (
    echo  [HATA] Python bulunamadi!
    echo         https://www.python.org/downloads/ adresinden Python yukleyin.
    pause
    exit /b 1
)

:: Venv kontrolu - bozuksa yeniden olustur
if exist "%PROJE%\backend\venv\Scripts\python.exe" (
    "%PROJE%\backend\venv\Scripts\python.exe" --version >nul 2>&1
    if errorlevel 1 (
        echo  [!] venv bozuk, yeniden olusturuluyor...
        rmdir /s /q "%PROJE%\backend\venv"
    )
)

if not exist "%PROJE%\backend\venv\Scripts\python.exe" (
    echo  [!] Python venv olusturuluyor...
    python -m venv "%PROJE%\backend\venv"
    if errorlevel 1 (
        echo  [HATA] venv olusturulamadi.
        pause
        exit /b 1
    )
    echo  [+] venv olusturuldu.
)

echo  [2/4] Python bagimliliklari yukleniyor...
"%PROJE%\backend\venv\Scripts\pip.exe" install -q -r "%PROJE%\backend\requirements.txt"
if errorlevel 1 (
    echo  [HATA] Python bagimliliklari yuklenemedi.
    pause
    exit /b 1
)
echo  [+] Backend hazir.

:: Node kontrolu
echo  [3/4] Frontend kontrol ediliyor...
where npm >nul 2>&1
if errorlevel 1 (
    echo  [HATA] Node.js bulunamadi!
    echo         https://nodejs.org/ adresinden Node.js yukleyin.
    pause
    exit /b 1
)

if not exist "%PROJE%\frontend\node_modules" (
    echo  [!] node_modules bulunamadi. npm install calistiriliyor...
    cd /d "%PROJE%\frontend"
    call npm install
    if errorlevel 1 (
        echo  [HATA] npm install basarisiz.
        pause
        exit /b 1
    )
    cd /d "%PROJE%"
)
echo  [+] Frontend hazir.

echo.
echo  [4/4] Sunucular baslatiliyor...
echo.
echo  -------------------------------------------------
echo    Backend  : http://localhost:8000
echo    Frontend : http://localhost:3000
echo  -------------------------------------------------
echo.

start "Backend - FastAPI" /min cmd /k "cd /d "%PROJE%\backend" && "%PROJE%\backend\venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

start "Frontend - Next.js" /min cmd /k "cd /d "%PROJE%\frontend" && npm run dev"

timeout /t 5 /nobreak >nul

start "" http://localhost:3000

echo  [OK] Sistem calisiyor!
echo.
echo  Tarayicida http://localhost:3000 acildi.
echo  Kapatmak icin bu pencereyi kapatin.
echo.
pause
