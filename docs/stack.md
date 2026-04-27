# Technology Stack

## Overview

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (containerized)
- Auth: Session-based auth with express-session and MongoDB session store

## Rationale

- React gives a fast UI for catalog browsing and admin CRUD controls.
- Express keeps REST endpoints simple and easy to document.
- MongoDB fits product catalog data and flexible specs.
- Session auth matches the requirement for authenticated CRUD and session handling.
- Docker isolates the frontend, backend, and database into clear deployable units.
