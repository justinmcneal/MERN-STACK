# MERN Stack Authentication App (Server)

This is the Express + TypeScript backend for a MERN stack authentication project.

## Tech Stack
- Node.js
- Express
- TypeScript
- MongoDB
- JWT for authentication

## Features
- User registration and login
- JWT token generation and validation
- Auth middleware
- Error handling

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env` (see `.env.example`).
3. Start the server:
   ```bash
   npm run dev
   ```

## Usage
- API endpoints for authentication (`/api/auth`)
- Connects to MongoDB (see `config/db.ts`)

## Folder Structure
- `controllers`: Auth logic
- `middleware`: Auth and error middleware
- `models`: User schema
- `routes`: Auth routes
- `utils`: Token generation

## License
MIT
