# Script PowerShell para rodar backend e frontend simultaneamente
# Uso: .\dev.ps1

Write-Host "🚀 Iniciando ROC Passaporte (Backend + Frontend)..." -ForegroundColor Cyan

# Verificar se as dependências estão instaladas
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Verificar se concurrently está instalado na raiz
if (-not (Test-Path "node_modules/concurrently")) {
    Write-Host "📦 Instalando concurrently..." -ForegroundColor Yellow
    npm install
}

# Rodar backend e frontend simultaneamente
Write-Host "`n✅ Backend: http://localhost:3001" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "`nPressione Ctrl+C para parar ambos os servidores`n" -ForegroundColor Yellow

npm run dev

