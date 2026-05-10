# Mobile Webshop

A full stack mobile phone webshop with session-based auth, CRUD management, and a seeded demo catalog.

## Monorepo Layout

This project uses a single monorepo so the frontend, backend, database container, docs, and prompts stay together and are easy to run with Docker.

- frontend/ - React + Vite app
- backend/ - Node.js + Express API
- db/ - MongoDB container image
- docs/ - project documentation
- prompts/ - AI usage and workflow notes

## Install and Run

You can run everything with Docker Compose:

```bash
docker compose up --build
```

If you want to run the components separately, build and start them in this order:

1. MongoDB container from `db/`
2. Backend API from `backend/`
3. Frontend app from `frontend/`

The backend expects MongoDB and the frontend expects the backend API to be available.

## Features

- Roles: guest, customer, admin
- Session auth with protected CRUD endpoints
- Product, category, cart, order, and review flows
- Seeded demo data on first startup

## Demo Accounts

- Admin: admin@phone-shop.test / Admin123!
- Customer: demo@phone-shop.test / Demo123!

## Run with Docker compose (recommended) 

```
docker compose up --build
```

## Run with Dockerfiles (Required)

1. Create a network

```
docker network create phone-shop-net
```

2. Database

```
docker build -t phone-shop-db ./db

docker run -d --name phone-shop-db --network phone-shop-net -p 27017:27017 phone-shop-db
```

3. Backend

```
docker build -t phone-shop-backend ./backend

docker run -d --name phone-shop-backend --network phone-shop-net -p 4000:4000 \
  -e MONGO_URL=mongodb://phone-shop-db:27017/phone_shop \
  -e SESSION_SECRET=dev_secret \
  -e CORS_ORIGIN=http://localhost:5173 \
  -e SEED_DEMO=true \
  phone-shop-backend
```

4. Frontend

```
docker build -t phone-shop-frontend ./frontend

docker run -d --name phone-shop-frontend --network phone-shop-net -p 5173:5173 \
  -e VITE_API_BASE=http://localhost:4000/api \
  phone-shop-frontend
```

Open: http://localhost:5173

## Documentation and Prompts

- docs/software-documentation.md
- prompts/ai-usage.md
- prompts/copilot-chat.md
