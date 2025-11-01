# MERN Stack Crypto Arbitrage Platform

A full-stack cryptocurrency arbitrage trading platform with ML-powered opportunity detection across multiple chains (Ethereum, Polygon, BSC).

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn**

## Project Structure

```
├── client/          # React + TypeScript frontend
├── server/          # Node.js + Express backend
├── llm/            # Python ML service (FastAPI)
└── data/           # Data storage
```

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd MERN-STACK
```

### 2. Environment Variables

Create `.env` files in both `client` and `server` directories.

#### **Server `.env`** (`server/.env`)

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/MERN-STACK

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
ACCESS_TOKEN_EXPIRE=1h
REFRESH_TOKEN_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:5173

# API Keys
ETHERSCAN_API_KEY= lagay mo etherscan api key dito, search mo nlng pano gawin di ko maharap ituro haha
POLYGONSCAN_API_KEY=
BSCSCAN_API_KEY=

# Security (for production)
# SESSION_SECRET=your_session_secret_here
# COOKIE_SECRET=your_cookie_secret_here

# Optional: Google OAuth (if implementing Google login)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email service configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=ryujitakashi24@gmail.com
EMAIL_PASS=ezay edpd symk vrvr
EMAIL_FROM=ryujitakashi24@gmail.com
SUPPORT_EMAIL=ryujitakashi24@gmail.com

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

   # CLOUDINARY_CLOUD_NAME=arbitrage
   # CLOUDINARY_API_KEY=api key mo
   # CLOUDINARY_API_SECRET=secret key mo
# Cloudinary URL (recommended)
CLOUDINARY_URL= url nung cloudinary

# Etherscan API key for gas oracle fallback
ETHERSCAN_API_KEY= etherscan api key v2

# ML Service
ML_SERVICE_URL=http://localhost:8000

HF_API_KEY= no need
```

#### **Client `.env`** (`client/.env`)

```env
VITE_API_URL=http://localhost:5001
VITE_WS_URL=ws://localhost:5001
```

#### **ML Service `.env`** (`llm/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/arbitrader
```

---

## Installation & Running

### **1. Install Dependencies**

#### Server
```bash
cd server
npm install
```

#### Client
```bash
cd client
npm install
```

#### ML Service (Python)
```bash
cd llm
pip3 install -r requirements.txt
# or use a virtual environment:
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

### **2. Start MongoDB**

Make sure MongoDB is running:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Or run manually
mongod --dbpath /path/to/data/db
```

---

### **3. Start All Services**

You'll need **3-4 separate terminals** to run all services:

#### **Terminal 1: ML Service (FastAPI)** 🤖

**First time setup - Train the model:**
```bash
cd llm

# Option A: Using virtual environment (recommended)
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Option B: Global installation
pip3 install -r requirements.txt

# Train the model with data from MongoDB (requires opportunities in database)
python3 train.py
```

**Start the ML service:**
```bash
cd llm
# Activate venv if using: source .venv/bin/activate
python3 -m uvicorn service:app --reload --port 8000
```
✅ ML service available at: `http://localhost:8000`  
📊 API docs: `http://localhost:8000/docs`

> **Note:** If you get "No opportunities found in database!" when training, run the data pipeline first (Terminal 4) to collect opportunity data.

---

#### **Terminal 2: Server (Node.js)** 🚀

```bash
cd server
npm run dev
```
✅ Backend API available at: `http://localhost:5001`  
🔍 Health check: `http://localhost:5001/health`  
📡 API endpoints: `http://localhost:5001/api/*`

**Server Features:**
- RESTful API endpoints
- WebSocket support for real-time updates
- JWT authentication
- Automated cron jobs (runs hourly):
  - Token price updates
  - Opportunity scanning
  - Alert notifications

---

#### **Terminal 3: Client (React)** 🎨

```bash
cd client
npm run dev
```
✅ Frontend available at: `http://localhost:5173`

**Access the app:**
- Open your browser to `http://localhost:5173`
- Login or create an account
- View dashboard with real-time opportunities

---

#### **Terminal 4: Data Pipeline (Optional)** 📊

```bash
cd server
npm run pipeline
```

**What it does:**
1. Fetches latest token prices from DexScreener API
2. Scans for arbitrage opportunities across chains
3. Calculates profitability (including gas costs)
4. Runs ML predictions on opportunities
5. Stores data in MongoDB

**When to run:**
- Initial setup to populate database with opportunities
- Manually trigger scans (automatic hourly scans run with the server)
- Testing and debugging opportunity detection

> **Tip:** The server automatically runs this pipeline every hour via cron jobs. You only need to run this manually for initial setup or immediate data refresh.

---

## Available Scripts

### **Server Scripts** (`cd server`)

#### **Main Commands**
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run tests |

#### **Data Pipeline & Scanning**
| Command | Description |
|---------|-------------|
| `npm run pipeline` | Run the data pipeline (fetch prices & scan opportunities) |
| `npm run rescan` | Rescan all opportunities |
| `npm run check-prices` | Check token prices manually |

#### **Database Management**
| Command | Description |
|---------|-------------|
| `npm run reset-db` | Reset database (⚠️ deletes all data) |
| `npx ts-node scripts/createTestAlerts.ts` | Create test alerts |
| `npx ts-node scripts/testNotifications.ts` | Test notification system |
| `npx ts-node scripts/checkPrices.ts` | Check prices for specific tokens |

#### **Utility Scripts**
Run any script with: `npx ts-node scripts/<script-name>.ts`

Available utility scripts in `server/scripts/`:
- `addNotificationPreferences.ts` - Add notification preferences to users
- `checkAlertThresholds.ts` - Verify alert threshold configurations
- `checkDatabaseStats.ts` - View database statistics
- `checkMonitoring.ts` - Check monitoring status
- `cleanupOpportunities.ts` - Clean up old opportunities
- `createTestAlerts.ts` - Create test alerts for debugging
- `debugOpportunities.ts` - Debug opportunity scanning
- `inspectOpportunity.ts` - Inspect specific opportunity details
- `migrateUserPreferences.ts` - Migrate user preferences schema
- `rescanOpportunities.ts` - Force rescan of opportunities
- `seedDatabase.ts` - Seed database with test data
- `testEmailService.ts` - Test email sending functionality
- `testNotifications.ts` - Test notification delivery
- `updateTokens.ts` - Update token information
- `verifyAlertSystem.ts` - Verify alert system functionality

**Example usage:**
```bash
cd server

# Check database statistics
npx ts-node scripts/checkDatabaseStats.ts

# Test email notifications
npx ts-node scripts/testEmailService.ts

# Create test alerts for a user
npx ts-node scripts/createTestAlerts.ts

# Check monitoring status
npx ts-node scripts/checkMonitoring.ts
```

### **Client Scripts** (`cd client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### **ML Service Scripts** (`cd llm`)

| Command | Description |
|---------|-------------|
| `python3 -m uvicorn service:app --reload --port 8000` | Start ML service in development mode |
| `python3 train.py` | Train the ML model with data from MongoDB |
| `python3 predict.py` | Test predictions |

**ML Training Workflow:**
1. Run data pipeline to collect opportunities: `cd server && npm run pipeline`
2. Verify data exists: `mongosh MERN-STACK --eval "db.opportunities.countDocuments()"`
3. Train model: `cd llm && python3 train.py`
4. Start ML service: `python3 -m uvicorn service:app --reload --port 8000`

---

## Quick Start (All-in-One) 🚀

### **Recommended Startup Order**

For the smoothest experience, start services in this order:

```bash
# 1. Start MongoDB (if not already running)
brew services start mongodb-community  # macOS
# OR
sudo systemctl start mongod            # Linux

# 2. Start ML Service (Terminal 1)
cd llm
source .venv/bin/activate  # if using venv
python3 -m uvicorn service:app --reload --port 8000

# 3. Start Server (Terminal 2)
cd server
npm run dev

# 4. Start Client (Terminal 3)
cd client
npm run dev

# 5. (Optional) Run initial data pipeline (Terminal 4)
cd server
npm run pipeline
```

**First-time setup checklist:**
1. ✅ MongoDB running
2. ✅ ML model trained (`cd llm && python3 train.py`)
3. ✅ Environment variables configured (`.env` files)
4. ✅ Dependencies installed (`npm install` in client & server)
5. ✅ Python packages installed (`pip install -r requirements.txt` in llm)

---

### **Option 1: Using tmux (Recommended for Development)**

```bash
# Install tmux first: brew install tmux (macOS) or sudo apt install tmux (Linux)

# Create new tmux session with all services
tmux new-session -d -s arbitrage -n "ML Service"
tmux send-keys -t arbitrage:ML\ Service "cd llm && source .venv/bin/activate 2>/dev/null; python3 -m uvicorn service:app --reload --port 8000" C-m

# Create window for server
tmux new-window -t arbitrage -n "Server"
tmux send-keys -t arbitrage:Server "cd server && npm run dev" C-m

# Create window for client
tmux new-window -t arbitrage -n "Client"
tmux send-keys -t arbitrage:Client "cd client && npm run dev" C-m

# Create window for pipeline (optional)
tmux new-window -t arbitrage -n "Pipeline"
tmux send-keys -t arbitrage:Pipeline "cd server && echo 'Run: npm run pipeline'" C-m

# Attach to session
tmux attach -t arbitrage
```

**tmux shortcuts:**
- `Ctrl+b` then `n` - Next window
- `Ctrl+b` then `p` - Previous window
- `Ctrl+b` then `0-9` - Switch to window number
- `Ctrl+b` then `d` - Detach (services keep running)
- `tmux attach -t arbitrage` - Re-attach to session
- `tmux kill-session -t arbitrage` - Stop all services

---

### **Option 2: Create a Start Script**

Create `start-all.sh` in the project root:

```bash
#!/bin/bash

echo "🚀 Starting MERN Stack Crypto Arbitrage Platform..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    brew services start mongodb-community 2>/dev/null || sudo systemctl start mongod 2>/dev/null
    sleep 2
fi

# Create logs directory
mkdir -p logs

# Start ML service in background
echo "🤖 Starting ML Service (port 8000)..."
cd llm
source .venv/bin/activate 2>/dev/null
python3 -m uvicorn service:app --reload --port 8000 > ../logs/ml-service.log 2>&1 &
ML_PID=$!
cd ..

# Wait for ML service to start
sleep 3

# Start server in background
echo "🚀 Starting Server (port 5001)..."
cd server
npm run dev > ../logs/server.log 2>&1 &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 3

# Start client in foreground
echo "🎨 Starting Client (port 5173)..."
echo ""
echo "✅ All services started!"
echo "   - ML Service: http://localhost:8000 (PID: $ML_PID)"
echo "   - Server API: http://localhost:5001 (PID: $SERVER_PID)"
echo "   - Client UI: http://localhost:5173"
echo ""
echo "📝 Logs are in ./logs/ directory"
echo "🛑 Press Ctrl+C to stop all services"
echo ""

cd client
npm run dev

# Cleanup on exit
trap "echo '\n🛑 Stopping all services...'; kill $ML_PID $SERVER_PID 2>/dev/null; exit 0" EXIT INT TERM
```

Make it executable and run:
```bash
chmod +x start-all.sh
./start-all.sh
```

---

### **Option 3: Using Docker Compose (Future)**

> Docker support coming soon! This will allow one-command startup of all services.

```bash
# Future feature
docker-compose up
```

---

## Database Management

### **Reset Database**
```bash
cd server
npm run reset-db
```

### **View Database**
Use MongoDB Compass or mongosh:
```bash
mongosh
use arbitrader
db.opportunities.find()
db.users.find()
```

---

## Troubleshooting 🔧

### **Quick Diagnostics**

Run this command to check all services:
```bash
# Check if services are running
echo "MongoDB: $(pgrep mongod > /dev/null && echo '✅ Running' || echo '❌ Not running')"
echo "ML Service (8000): $(lsof -ti:8000 > /dev/null && echo '✅ Running' || echo '❌ Not running')"
echo "Server (5001): $(lsof -ti:5001 > /dev/null && echo '✅ Running' || echo '❌ Not running')"
echo "Client (5173): $(lsof -ti:5173 > /dev/null && echo '✅ Running' || echo '❌ Not running')"
```

---

### **ML Service Errors** 🤖

#### **Error: "Invalid URL" or "ML Service connection failed"**
```bash
# Check if ML service is running
curl http://localhost:8000/health

# Verify environment variable
cd server
grep ML_SERVICE_URL .env
# Should show: ML_SERVICE_URL=http://localhost:8000
```

**Solution:**
1. Ensure `ML_SERVICE_URL=http://localhost:8000` is in `server/.env`
2. Start ML service: `cd llm && python3 -m uvicorn service:app --reload --port 8000`
3. Restart the server after setting environment variable

---

#### **Error: "ModuleNotFoundError: No module named 'pymongo'" or other Python imports**
```bash
cd llm

# Option 1: Use virtual environment (recommended)
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Option 2: Install globally
pip3 install -r requirements.txt

# Verify installation
python3 -c "import pymongo; import fastapi; import sklearn; print('✅ All packages installed')"
```

---

#### **Error: "Address already in use" (port 8000)**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
cd llm
python3 -m uvicorn service:app --reload --port 8001
# Then update server/.env: ML_SERVICE_URL=http://localhost:8001
```

---

#### **Error: "No opportunities found in database!" when training**
```bash
# Step 1: Run data pipeline to collect opportunities
cd server
npm run pipeline

# Step 2: Verify data exists
mongosh arbitrader --eval "db.opportunities.countDocuments()"
# Should show: 10 or more

# Step 3: Train the model
cd ../llm
python3 train.py

# Should see: "Training model with X opportunities..."
```

**Minimum requirements for training:**
- At least 10 opportunities in database
- Opportunities must have valid features (profit, gas cost, ROI, etc.)

---

#### **Model Version Warning**
```bash
# sklearn version mismatch - retrain the model
cd llm
python3 train.py

# This will create a new model file compatible with your sklearn version
```

---

#### **ML Predictions Not Working**
```bash
# Checklist:
# 1. ML service is running
curl http://localhost:8000/health

# 2. Model file exists
ls -lh llm/models/arbitrage_model.pkl

# 3. Environment variable is set
cd server && grep ML_SERVICE_URL .env

# 4. Test prediction manually
cd llm
python3 predict.py

# If any step fails, follow the fix:
# - Step 1 failed: Start ML service
# - Step 2 failed: Run python3 train.py
# - Step 3 failed: Add ML_SERVICE_URL=http://localhost:8000 to server/.env
# - Step 4 failed: Check model file and retrain
```

---

### **Server Errors** 🚀

#### **Error: "Cannot find module" or TypeScript errors**
```bash
cd server

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild TypeScript
npm run build

# Check for errors
npm run dev
```

---

#### **Error: "MongoDB connection failed"**
```bash
# Check if MongoDB is running
pgrep mongod || echo "MongoDB is not running"

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
mongod --dbpath /path/to/data/db       # Manual start

# Test connection
mongosh --eval "db.runCommand({ ping: 1 })"

# Check URI in .env
cd server
grep MONGODB_URI .env
# Should show: MONGODB_URI=mongodb://localhost:27017/arbitrader
```

---

#### **Error: "JWT_SECRET is required"**
```bash
cd server
echo 'JWT_SECRET=your-super-secret-jwt-key-change-in-production' >> .env
echo 'JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production' >> .env
```

---

#### **Error: "Email configuration error" or emails not sending**
```bash
cd server

# For Gmail: Enable 2FA and create App Password
# https://myaccount.google.com/apppasswords

# Add to .env:
cat >> .env << EOF
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
EOF

# Test email service
npx ts-node scripts/testEmailService.ts
```

---

### **Client Errors** 🎨

#### **Error: "Failed to fetch" or API calls failing**
```bash
# Check server is running
curl http://localhost:5001/health

# Verify environment variable
cd client
grep VITE_API_URL .env
# Should show: VITE_API_URL=http://localhost:5001

# Restart dev server
npm run dev
```

---

#### **Error: "Unexpected token" or build errors**
```bash
cd client

# Clear cache and reinstall
rm -rf node_modules .vite package-lock.json
npm install

# Restart dev server
npm run dev
```

---

### **Port Already in Use** 🔌

```bash
# Find what's using the port
lsof -ti:5001  # Server
lsof -ti:8000  # ML Service
lsof -ti:5173  # Client

# Kill specific port
lsof -ti:5001 | xargs kill -9

# Kill all project ports
lsof -ti:5001,8000,5173 | xargs kill -9

# Or manually find and kill
lsof -i :5001
# Then: kill -9 <PID>
```

---

### **Database Issues** 💾

#### **Reset database (⚠️ deletes all data)**
```bash
cd server
npm run reset-db
```

#### **View database contents**
```bash
mongosh arbitrader

# View collections
show collections

# Count documents
db.opportunities.countDocuments()
db.users.countDocuments()
db.tokens.countDocuments()

# View sample data
db.opportunities.findOne()
db.users.findOne()

# Exit
exit
```

#### **Export/backup database**
```bash
# Backup
mongodump --db arbitrader --out backup/

# Restore
mongorestore --db arbitrader backup/arbitrader/
```

---

### **Performance Issues** ⚡

#### **Slow API responses**
```bash
# Check MongoDB indexes
mongosh arbitrader --eval "db.opportunities.getIndexes()"

# Monitor queries
mongosh arbitrader
db.setProfilingLevel(2)
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
```

#### **High memory usage**
```bash
# Check Node.js memory
cd server
node --max-old-space-size=4096 dist/server.js

# Monitor processes
top -pid $(pgrep -f "node.*server")
```

---

### **Getting Help** 📞

If you're still stuck:

1. **Check logs:**
   ```bash
   # Server logs
   cd server && npm run dev

   # ML service logs
   cd llm && python3 -m uvicorn service:app --reload --port 8000

   # Client logs
   cd client && npm run dev
   ```

2. **Run diagnostics:**
   ```bash
   # Check environment
   cd server && cat .env
   cd client && cat .env

   # Check package versions
   node --version  # Should be v18+
   python3 --version  # Should be v3.8+
   mongod --version  # Should be v5.0+
   ```

3. **Open an issue on GitHub** with:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version, Python version)
   - Relevant logs

---

## Production Deployment

### **Build for Production**

```bash
# Build client
cd client
npm run build
# Output: client/dist/

# Build server
cd server
npm run build
# Output: server/dist/
```

### **Environment Variables**

Update all `.env` files with production values:
- Use strong secrets for JWT tokens
- Use production MongoDB URI
- Update `CLIENT_URL` and `API_BASE_URL` to production domains
- Use production email credentials
- Add production API keys

---

## Testing & Verification 🧪

### **Quick System Test**

Run these commands to verify everything is working:

```bash
# 1. Test ML Service
curl http://localhost:8000/health
# Expected: {"status":"ok","service":"ml"}

# 2. Test Server API
curl http://localhost:5001/health
# Expected: {"status":"ok","message":"Server is running"}

# 3. Test Client
curl http://localhost:5173
# Expected: HTML content (React app)

# 4. Check database
mongosh arbitrader --eval "db.stats()"
# Expected: Database statistics
```

---

### **Test Individual Features**

```bash
cd server

# Test notification system
npx ts-node scripts/testNotifications.ts

# Test email service
npx ts-node scripts/testEmailService.ts

# Create test alerts
npx ts-node scripts/createTestAlerts.ts

# Check database stats
npx ts-node scripts/checkDatabaseStats.ts

# Test opportunity scanning
npx ts-node scripts/debugOpportunities.ts

# Verify alert system
npx ts-node scripts/verifyAlertSystem.ts
```

---

### **Run Unit Tests**

```bash
# Server tests
cd server
npm test

# Client tests (if configured)
cd client
npm test
```

---

## API Documentation 📚

### **Server Endpoints** (`http://localhost:5001`)

#### **Health & System**
```bash
GET /health
# Response: { "status": "ok", "message": "Server is running" }

GET /api/system/status
# Response: { "status": "ok", "timestamp": "..." }
```

#### **Authentication**
```bash
# Register
POST /api/auth/register
Body: { "email": "user@example.com", "password": "password", "name": "User" }

# Login
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password" }
# Response: { "token": "...", "refreshToken": "...", "user": {...} }

# Refresh Token
POST /api/auth/refresh
Body: { "refreshToken": "..." }

# Logout
POST /api/auth/logout
Headers: { "Authorization": "Bearer <token>" }

# Google OAuth
GET /api/auth/google
GET /api/auth/google/callback
```

#### **Opportunities**
```bash
# Get all opportunities
GET /api/opportunities
Headers: { "Authorization": "Bearer <token>" }
Query: ?status=active&sortBy=score&sortOrder=desc&limit=25

# Get single opportunity
GET /api/opportunities/:id
Headers: { "Authorization": "Bearer <token>" }

# Rescan opportunities
POST /api/opportunities/rescan
Headers: { "Authorization": "Bearer <token>" }
```

#### **Tokens**
```bash
# Get all tokens
GET /api/tokens
Headers: { "Authorization": "Bearer <token>" }

# Get token prices
GET /api/tokens/prices
Headers: { "Authorization": "Bearer <token>" }
```

#### **User Profile**
```bash
# Get profile
GET /api/profile
Headers: { "Authorization": "Bearer <token>" }

# Update profile
PUT /api/profile
Headers: { "Authorization": "Bearer <token>" }
Body: { "name": "New Name", "bio": "..." }

# Upload avatar
POST /api/profile/avatar
Headers: { "Authorization": "Bearer <token>" }
Content-Type: multipart/form-data
```

#### **Preferences**
```bash
# Get preferences
GET /api/preferences
Headers: { "Authorization": "Bearer <token>" }

# Update preferences
PUT /api/preferences
Headers: { "Authorization": "Bearer <token>" }
Body: { 
  "currency": "USD",
  "dashboardPopup": true,
  "emailNotifications": true,
  "alertThresholds": { "minProfit": 10, "maxGasCost": 50 }
}
```

#### **Alerts**
```bash
# Get alerts
GET /api/alerts
Headers: { "Authorization": "Bearer <token>" }

# Mark as read
PUT /api/alerts/:id/read
Headers: { "Authorization": "Bearer <token>" }

# Delete alert
DELETE /api/alerts/:id
Headers: { "Authorization": "Bearer <token>" }
```

#### **Contact Support**
```bash
POST /api/contact-support
Headers: { "Authorization": "Bearer <token>" }
Body: { "subject": "Issue", "message": "..." }
```

---

### **ML Service Endpoints** (`http://localhost:8000`)

#### **Health Check**
```bash
GET /health
# Response: { "status": "ok", "service": "ml" }
```

#### **Predict Opportunity**
```bash
POST /predict
Content-Type: application/json
Body: {
  "opportunities": [
    {
      "tokenSymbol": "WETH",
      "netProfitUsd": 15.5,
      "gasCostUsd": 8.2,
      "priceDiffPercent": 2.3,
      "volumeUsd": 150000,
      "liquidityUsd": 1000000
    }
  ]
}
# Response: { "predictions": [0.85] }
```

#### **Arbitrage Analysis**
```bash
POST /arbitrage
Content-Type: application/json
Body: {
  "opportunities": [...]
}
# Response: { "analysis": [...] }
```

#### **API Documentation**
```bash
GET /docs
# Interactive Swagger UI

GET /redoc
# ReDoc documentation
```

---

### **Example API Usage**

#### **cURL Examples**

```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get opportunities (replace <token> with actual JWT)
curl http://localhost:5001/api/opportunities \
  -H "Authorization: Bearer <token>"

# Update preferences
curl -X PUT http://localhost:5001/api/preferences \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"currency":"USD","dashboardPopup":true}'
```

#### **JavaScript/TypeScript Example**

```typescript
// Login
const response = await fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'password' 
  })
});
const { token } = await response.json();

// Get opportunities
const opps = await fetch('http://localhost:5001/api/opportunities', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const opportunities = await opps.json();
```

#### **Python Example**

```python
import requests

# Login
response = requests.post(
    'http://localhost:5001/api/auth/login',
    json={'email': 'user@example.com', 'password': 'password'}
)
token = response.json()['token']

# Get opportunities
opportunities = requests.get(
    'http://localhost:5001/api/opportunities',
    headers={'Authorization': f'Bearer {token}'}
).json()
```

---

## Tech Stack

### **Frontend**
- React 18
- TypeScript
- Vite
- TailwindCSS
- Axios

### **Backend**
- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- Socket.io
- JWT Authentication

### **ML Service**
- Python
- FastAPI
- scikit-learn
- pandas
- numpy

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Support

For issues or questions, please open an issue on GitHub or contact support@yourdomain.com.



npx ts-node scripts/script file