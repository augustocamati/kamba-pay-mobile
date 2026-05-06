#!/bin/bash

# Este script instala as dependências e inicia tanto o backend quanto o frontend do Kamba Kid Pay.

echo "==========================================="
echo "🚀 Iniciando configuração do Kamba Kid Pay"
echo "==========================================="

echo ""
echo "📦 [1/4] Instalando dependências do backend..."
cd Kamba_Kid_Pay-backend || { echo "❌ Pasta Kamba_Kid_Pay-backend não encontrada!"; exit 1; }
npm install

echo ""
echo "🌱 [2/4] Preparando e semeando o banco de dados..."
# Executa os scripts de seed disponíveis
if [ -f "seed-admin.js" ]; then node seed-admin.js; fi
if [ -f "seed-conteudo.js" ]; then node seed-conteudo.js; fi
if [ -f "seed-mascotes.js" ]; then node seed-mascotes.js; fi

echo ""
echo "▶️ [3/4] Iniciando o servidor backend..."
# Inicia o backend em background
npm start &
BACKEND_PID=$!

# Volta para a raiz do projeto
cd ..

echo ""
echo "📦 [4/4] Instalando dependências do frontend..."
npm install

echo ""
echo "▶️ Iniciando o aplicativo (Expo)..."
# Inicia o frontend em background
npm start &
FRONTEND_PID=$!

echo ""
echo "✅=========================================✅"
echo "  Tudo pronto! O projeto está rodando."
echo "  Backend (PID: $BACKEND_PID)"
echo "  Frontend (PID: $FRONTEND_PID)"
echo "  Pressione Ctrl+C para encerrar tudo."
echo "✅=========================================✅"

# Função para encerrar os processos filhos ao dar Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Encerrando processos..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Captura os sinais de interrupção
trap cleanup SIGINT SIGTERM

# Mantém o script rodando
wait
