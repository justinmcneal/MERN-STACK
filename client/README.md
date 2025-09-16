# MERN Stack Authentication App (Client)

This is the React frontend for a MERN stack authentication project.

## Tech Stack
- React (Vite)
- TypeScript
- Context API
- Axios

## Features
- User registration and login
- Protected routes
- Auth context for global state

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Configure environment variables in `.env` (see `.env.example`).

## Usage
- Register a new user or log in.
- Access protected pages when authenticated.

## Folder Structure
- `src/pages`: Home, Login, Register
- `src/components`: ProtectedRoute
- `src/context`: AuthContext
- `src/services`: API calls

## License
MIT
