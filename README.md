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
# Database
MONGODB_URI=mongodb://localhost:27017/arbitrader

# Server
PORT=5001
NODE_ENV=development

# Client URL
CLIENT_URL=http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
SUPPORT_EMAIL=support@yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# API Keys
BLOCKNATIVE_API_KEY=your-blocknative-api-key
ETHERSCAN_API_KEY=your-etherscan-api-key
POLYGONSCAN_API_KEY=your-polygonscan-api-key
BSCSCAN_API_KEY=your-bscscan-api-key

# ML Service
ML_SERVICE_URL=http://localhost:8000
API_BASE_URL=http://localhost:5001/api
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

You'll need **4 separate terminals** to run all services:

#### **Terminal 1: ML Service (FastAPI)**

**First time setup - Train the model:**
```bash
cd llm
# Activate virtual environment (if using one)
source .venv/bin/activate  # Skip if not using venv

# Train the model with data from MongoDB (requires opportunities in database)
python3 train.py
```

**Then start the service:**
```bash
cd llm
python3 -m uvicorn service:app --reload --port 8000
```
The ML service will be available at `http://localhost:8000`

> **Note:** If you get "No opportunities found in database!" when training, run the data pipeline first (Terminal 4) to collect opportunity data.

#### **Terminal 2: Server (Node.js)**
```bash
cd server
npm run dev
```
The backend API will be available at `http://localhost:5001`

#### **Terminal 3: Client (React)**
```bash
cd client
npm run dev
```
The frontend will be available at `http://localhost:5173`

#### **Terminal 4: Data Pipeline (Optional - for running scans)**
```bash
cd server
npm run pipeline
```
This runs the opportunity scanner and data fetching pipeline.

---

## Available Scripts

### **Server Scripts** (`cd server`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run pipeline` | Run the data pipeline (fetch prices & scan opportunities) |
| `npm run rescan` | Rescan all opportunities |
| `npm run reset-db` | Reset database (⚠️ deletes all data) |
| `npm run check-prices` | Check token prices manually |
| `npm test` | Run tests |

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

## Quick Start (All-in-One)

For convenience, you can use terminal multiplexers like `tmux` or create a start script:

### **Option 1: Using tmux**

```bash
# Install tmux first: brew install tmux (macOS) or sudo apt install tmux (Linux)

tmux new-session -d -s arbitrage

# Start ML service
tmux send-keys -t arbitrage "cd llm && python3 -m uvicorn service:app --reload --port 8000" C-m
tmux split-window -h -t arbitrage

# Start server
tmux send-keys -t arbitrage "cd server && npm run dev" C-m
tmux split-window -v -t arbitrage

# Start client
tmux send-keys -t arbitrage "cd client && npm run dev" C-m

# Attach to session
tmux attach -t arbitrage
```

### **Option 2: Create a start script**

Create `start-all.sh`:

```bash
#!/bin/bash

# Start ML service in background
cd llm && python3 -m uvicorn service:app --reload --port 8000 &
ML_PID=$!

# Start server in background
cd ../server && npm run dev &
SERVER_PID=$!

# Start client in foreground
cd ../client && npm run dev

# Cleanup on exit
trap "kill $ML_PID $SERVER_PID" EXIT
```

Make it executable:
```bash
chmod +x start-all.sh
./start-all.sh
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

## Troubleshooting

### **ML Service Errors**

**Error: "Invalid URL"**
- Make sure `ML_SERVICE_URL=http://localhost:8000` is set in `server/.env`
- Ensure the ML service is running on port 8000

**Error: "ModuleNotFoundError: No module named 'pymongo'"**
- Activate virtual environment: `cd llm && source .venv/bin/activate` (or create one: `python3 -m venv .venv`)
- Run `pip install -r requirements.txt` in the `llm` directory

**Error: "Address already in use" (port 8000)**
- Another ML service instance is already running
- Kill it: `lsof -ti:8000 | xargs kill -9`
- Or use a different port: `python3 -m uvicorn service:app --reload --port 8001`

**Error: "No opportunities found in database!" when training**
- Run the data pipeline first to collect opportunity data: `cd server && npm run pipeline`
- Verify MongoDB has data: `mongosh MERN-STACK --eval "db.opportunities.countDocuments()"`
- You need at least 10 opportunities to train the model

**Model Version Warning**
- If you see sklearn version warnings, retrain the model: `cd llm && python3 train.py`

**ML Predictions Not Working**
1. Check that ML_SERVICE_URL is set in `server/.env`
2. Ensure the ML service is running on port 8000
3. Train the model first: `cd llm && python3 train.py`
4. Restart the server after setting ML_SERVICE_URL

### **Server Errors**

**Error: "Cannot find module"**
- Run `npm install` in the server directory

**Error: "MongoDB connection failed"**
- Ensure MongoDB is running: `brew services start mongodb-community`
- Check `MONGODB_URI` in `.env`

### **Client Errors**

**Error: "Failed to fetch"**
- Ensure the server is running on port 5001
- Check `VITE_API_URL` in `client/.env`

### **Port Already in Use**

```bash
# Find and kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

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

## API Documentation

Once the server is running, API endpoints are available at:

- **Health Check**: `GET http://localhost:5001/health`
- **Auth**: `POST http://localhost:5001/api/auth/login`
- **Opportunities**: `GET http://localhost:5001/api/opportunities`
- **Tokens**: `GET http://localhost:5001/api/tokens`

ML Service endpoints:
- **Health Check**: `GET http://localhost:8000/health`
- **Predict**: `POST http://localhost:8000/predict`
- **Arbitrage**: `POST http://localhost:8000/arbitrage`

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