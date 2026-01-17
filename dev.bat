@echo off
REM Script Batch para rodar backend e frontend simultaneamente
REM Uso: dev.bat

echo 🚀 Iniciando ROC Passaporte (Backend + Frontend)...

REM Verificar se as dependências estão instaladas
if not exist "backend\node_modules" (
    echo 📦 Instalando dependências do backend...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📦 Instalando dependências do frontend...
    cd frontend
    call npm install
    cd ..
)

REM Verificar se concurrently está instalado na raiz
if not exist "node_modules" (
    echo 📦 Instalando dependências da raiz (concurrently)...
    call npm install
)

REM Rodar backend e frontend simultaneamente
echo.
echo ✅ Backend: http://localhost:3001
echo ✅ Frontend: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar ambos os servidores
echo.

call npm run dev

