# Project manager (MERN)

Vite + React frontend, Express + MongoDB backend. JWT auth, admin vs member roles.

## What you need

- Node 18+
- MongoDB Atlas URI (or local Mongo if you change the connection string)

## Backend

```bash
cd Backend
npm install
```

Copy `.env.example` to `.env` and fill in:

```
MONGO_URI=mongodb+srv://...
JWT_SECRET=pick-a-long-random-string
PORT=5000
```

Start:

```bash
npm run dev
```

(or `npm start` for plain node without nodemon)

## Frontend

```bash
cd Frontend
npm install
```

`.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Start:

```bash
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). Backend must be running first.

## Quick sanity check

1. Sign up one admin and one member.
2. Admin creates a project; member hits Projects → Join on it.
3. Admin assigns tasks from the project page — member sees them on Dashboard / Tasks.

That’s it.
