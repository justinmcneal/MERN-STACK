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
└── package.json     # Root package.json for scripts
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install-all
   ```

### Development

To run both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:5173

### Individual Commands

- Start only the backend: `npm run server`
- Start only the frontend: `npm run client`
- Build the frontend: `npm run build`

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
- **Development**: Concurrently for running both servers