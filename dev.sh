#!/bin/bash
# Script Bash para rodar backend e frontend simultaneamente
# Uso: ./dev.sh

echo "🚀 Iniciando ROC Passaporte (Backend + Frontend)..."

# Verificar se as dependências estão instaladas
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
fi

# Verificar se concurrently está instalado na raiz
if [ ! -d "node_modules/concurrently" ]; then
    echo "📦 Instalando concurrently..."
    npm install
fi

# Rodar backend e frontend simultaneamente
echo ""
echo "✅ Backend: http://localhost:3001"
echo "✅ Frontend: http://localhost:3000"
echo ""
echo "Pressione Ctrl+C para parar ambos os servidores"
echo ""

npm run dev

