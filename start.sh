#!/bin/bash

# Script de démarrage pour Roomly - Nouveau Frontend + Backend
# Usage: ./start.sh [backend|frontend|all]

set -e

cd "$(dirname "$0")"

RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function start_backend() {
    echo -e "${GREEN}🚀 Démarrage du backend...${NC}"
    cd back
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}⚠️  venv non trouvé, création en cours...${NC}"
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi
    
    echo -e "${GREEN}✅ Backend démarré sur http://localhost:8000${NC}"
    echo -e "${GREEN}📚 Documentation API: http://localhost:8000/docs${NC}"
    uvicorn main:app --reload
}

function start_frontend() {
    echo -e "${GREEN}🎨 Démarrage du frontend...${NC}"
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  node_modules non trouvé, installation en cours...${NC}"
        if command -v yarn &> /dev/null; then
            yarn install
        else
            npm install
        fi
    fi
    
    echo -e "${GREEN}✅ Frontend démarré sur http://localhost:3000${NC}"
    if command -v yarn &> /dev/null; then
        yarn start
    else
        npm start
    fi
}

function start_all() {
    echo -e "${GREEN}🚀 Démarrage de Roomly (Backend + Frontend)...${NC}"
    
    # Démarrer le backend en arrière-plan
    (start_backend) &
    BACKEND_PID=$!
    
    # Attendre que le backend démarre
    sleep 3
    
    # Démarrer le frontend
    start_frontend
    
    # Nettoyer en cas d'interruption
    trap "kill $BACKEND_PID 2>/dev/null" EXIT
}

case "${1:-all}" in
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    all)
        start_all
        ;;
    *)
        echo -e "${RED}Usage: $0 [backend|frontend|all]${NC}"
        exit 1
        ;;
esac
