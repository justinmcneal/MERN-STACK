# MERN Stack Project

A full-stack web application built with MongoDB, Express.js, React, and Node.js.

## Project Structure

```
MERN-STACK/
├── client/          # React frontend
│   ├── src/         # React source code
│   ├── public/      # Static assets
│   ├── dist/        # Build output
│   └── package.json # Frontend dependencies
├── server/          # Node.js/Express backend
│   ├── server.js    # Main server file
│   └── package.json # Backend dependencies
└── README.md        # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for both client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

### Development

Run the frontend and backend separately in different terminals:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:5173

### Build

To build the frontend for production:
```bash
cd client
npm run build
```

## Environment Variables

Create a `.env` file in the server directory with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-app
NODE_ENV=development
```

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Development**: Separate development servers for frontend and backend