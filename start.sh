#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}     ${CYAN}AI Visual QA Inspector - Manufacturing Suite${NC}        ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}     ${GREEN}Full-Stack Application with Hot Reload${NC}               ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to kill process on a port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}⚡ Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    fi
    return 0
}

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi

# Set default ports (avoiding port 5000)
BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 1: Cleaning up ports${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Kill processes on ports we need
kill_port $FRONTEND_PORT
kill_port $BACKEND_PORT
kill_port 5432 2>/dev/null # PostgreSQL if needed

echo -e "${GREEN}✓ Ports cleaned${NC}"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 2: Checking prerequisites${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check for Node.js
if ! command_exists node; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"

# Check for npm
if ! command_exists npm; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm version: $(npm -v)${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 3: Starting PostgreSQL${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Try to connect to PostgreSQL
if command_exists pg_isready; then
    if pg_isready -q; then
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
    else
        echo -e "${YELLOW}⚡ Starting PostgreSQL...${NC}"
        if command_exists brew; then
            brew services start postgresql@14 2>/dev/null || \
            brew services start postgresql@15 2>/dev/null || \
            brew services start postgresql 2>/dev/null
        elif command_exists pg_ctl; then
            pg_ctl start -D /usr/local/var/postgres 2>/dev/null || \
            pg_ctl start -D /opt/homebrew/var/postgres 2>/dev/null
        fi
        sleep 3
        if pg_isready -q; then
            echo -e "${GREEN}✓ PostgreSQL started${NC}"
        else
            echo -e "${YELLOW}⚠ Please start PostgreSQL manually${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# Create database if not exists
echo -e "${CYAN}Creating database if not exists...${NC}"
createdb ${DB_NAME:-visual_qa_inspector} 2>/dev/null && echo -e "${GREEN}✓ Database created${NC}" || echo -e "${CYAN}Database already exists${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 4: Installing dependencies${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Install backend dependencies
echo -e "${CYAN}Installing backend dependencies...${NC}"
cd "$SCRIPT_DIR/backend"
npm install --silent
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Install frontend dependencies
echo -e "${CYAN}Installing frontend dependencies...${NC}"
cd "$SCRIPT_DIR/frontend"
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 5: Seeding database${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$SCRIPT_DIR/backend"
echo -e "${CYAN}Running database seed...${NC}"
node seed/seedData.js 2>&1 | tail -20
echo -e "${GREEN}✓ Database seeded${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 6: Starting servers with hot reload${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Start backend server with nodemon (hot reload)
echo -e "${GREEN}⚡ Starting backend server on port $BACKEND_PORT (with hot reload)...${NC}"
cd "$SCRIPT_DIR/backend"
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server with Vite (has built-in hot reload)
echo -e "${GREEN}⚡ Starting frontend server on port $FRONTEND_PORT (with hot reload)...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}          ${GREEN}✓ Application Started Successfully!${NC}             ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}┌──────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│${NC}  ${GREEN}Frontend:${NC}  http://localhost:$FRONTEND_PORT                       ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  ${GREEN}Backend:${NC}   http://localhost:$BACKEND_PORT                       ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  ${GREEN}API Docs:${NC}  http://localhost:$BACKEND_PORT/api/health            ${CYAN}│${NC}"
echo -e "${CYAN}└──────────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "${YELLOW}┌──────────────────────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}│${NC}  ${CYAN}Demo Credentials:${NC}                                        ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC}    Email:    ${GREEN}demo@example.com${NC}                             ${YELLOW}│${NC}"
echo -e "${YELLOW}│${NC}    Password: ${GREEN}password123${NC}                                  ${YELLOW}│${NC}"
echo -e "${YELLOW}└──────────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "${CYAN}┌──────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│${NC}  ${GREEN}Features Available:${NC}                                       ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}    • AI Defect Classifier                                  ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}    • AI Severity Scorer                                    ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}    • AI Root Cause Analyzer                                ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}    • AI Trend Tracker                                      ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}    • AI Report Generator                                   ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}    • AI Quality Inspector                                  ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}    • AI Packaging Optimizer                                ${CYAN}│${NC}"
echo -e "${CYAN}└──────────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "${YELLOW}💡 Hot reload is enabled - changes auto-refresh!${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Trap Ctrl+C to kill both processes
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    # Clean up ports
    kill_port $FRONTEND_PORT
    kill_port $BACKEND_PORT
    echo -e "${GREEN}✓ Servers stopped${NC}"
    exit 0
}

trap cleanup INT TERM

# Wait for both processes
wait
