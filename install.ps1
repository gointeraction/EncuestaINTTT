<#
.SYNOPSIS
    Instalador y Asistente de Configuración Local para Windows — Encuesta INTT
.DESCRIPTION
    Verifica dependencias, base de datos PostgreSQL, sincroniza Prisma e inicializa la app.
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Instalador Local — Encuesta Visión Cero INTT"

Clear-Host
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "    INSTITUTO NACIONAL DE TRANSPORTE TERRESTRE (INTT) — VISIÓN CERO" -ForegroundColor Cyan
Write-Host "         ASISTENTE DE INSTALACIÓN Y CONFIGURACIÓN LOCAL (WINDOWS)" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificación de Node.js y npm
Write-Host "[1/5] Verificando entorno Node.js y npm..." -ForegroundColor Blue
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js no está instalado en este equipo." -ForegroundColor Red
    Write-Host "Por favor instala Node.js (v20 o v22 LTS) desde https://nodejs.org/" -ForegroundColor Yellow
    Exit 1
}

$nodeVer = node -v
$npmVer = npm -v
Write-Host "  -> Node.js detectado: $nodeVer" -ForegroundColor Green
Write-Host "  -> npm detectado:     $npmVer" -ForegroundColor Green

# 2. Instalación de dependencias
Write-Host ""
Write-Host "[2/5] Instalando / verificando dependencias de Node.js..." -ForegroundColor Blue
npm install

# 3. Verificación de archivo .env
Write-Host ""
Write-Host "[3/5] Verificando archivo de configuración .env..." -ForegroundColor Blue
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  -> Se creó el archivo .env a partir de .env.example" -ForegroundColor Yellow
    } else {
        Write-Host "[ERROR] No se encontró el archivo .env ni .env.example" -ForegroundColor Red
        Exit 1
    }
} else {
    Write-Host "  -> Archivo .env verificado." -ForegroundColor Green
}

# 4. Sincronización de Base de Datos (Prisma)
Write-Host ""
Write-Host "[4/5] Sincronizando modelo de Base de Datos con PostgreSQL..." -ForegroundColor Blue
npx prisma generate
npx prisma db push

# 5. Importar respaldo si existe
if (Test-Path "db/sqlite_backup.json") {
    Write-Host ""
    Write-Host "Restaurando datos del respaldo si es necesario..." -ForegroundColor Blue
    npm run db:import-backup
}

# 6. Resumen y Ejecución
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "    ¡CONFIGURACIÓN LOCAL COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar la aplicación:" -ForegroundColor Yellow
Write-Host "  Modo Desarrollo:   npm run dev" -ForegroundColor Cyan
Write-Host "  Modo Producción:   npm run build  seguido de  npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "Accesos:" -ForegroundColor Yellow
Write-Host "  * Encuesta Pública:    http://localhost:3000" -ForegroundColor White
Write-Host "  * Panel Administrativo: http://localhost:3000/?admin=1 (Clave: VisionCero2026!)" -ForegroundColor White
Write-Host ""

$resp = Read-Host "¿Deseas iniciar la aplicación ahora en modo desarrollo? (S/n)"
if ($resp -eq "" -or $resp -match "^[sSyY]") {
    Write-Host "Iniciando servidor Next.js..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
    npm run dev
}
