# Install and run

You can run everything with Docker Compose:

```bash
docker compose up --build
```

# Technology Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (containerized)
- Auth: Session-based auth with express-session and MongoDB session store

## Project Overview, why I Chose This Stack

This project is a phone webshop built as a Dockerized monorepo. It contains a React + Vite frontend, a Node.js + Express backend, and a MongoDB database. The system supports browsing products, authentication, cart management, checkout, reviews, and admin CRUD operations.

I chose this stack because it keeps the webshop easy to build, test, and deploy as one Dockerized project. React + Vite gives a responsive frontend with a fast dev workflow, Express provides a lightweight API layer, MongoDB handles flexible product and category data well, and session-based auth with a MongoDB store gives persistent login state without adding JWT complexity.

### Frontend: React + Vite

React was chosen because the webshop needs a dynamic interface for filtering products, managing forms, and rendering multiple live states such as cart, orders, and admin CRUD views. Vite was chosen because it gives a fast development server and a simple build pipeline.

### Backend: Node.js + Express

Node.js and Express fit this project because the backend is primarily a REST API with straightforward CRUD endpoints, session handling, and MongoDB integration. Express keeps the API small, readable, and easy to extend.

### Database: MongoDB

MongoDB was chosen because the domain data is naturally document-shaped. Products contain flexible specifications, carts and orders contain nested item arrays, and relations can be modeled cleanly with ObjectId references.

### Authentication: Session-Based Auth

The project uses `express-session` with `connect-mongo` as the session store. This is a good fit because the app needs persistent login state, secure httpOnly cookies, and simple server-side session invalidation without adding JWT token management complexity.

## Project Structure

- `frontend/` - React + Vite user interface
- `backend/` - Express REST API and MongoDB models
- `db/` - MongoDB Docker image configuration
- `docs/` - project documentation
- `prompts/` - AI usage and workflow notes


# Database Setup and Data Model

## Database Setup

The project uses MongoDB as the main database. It is containerized through Docker Compose and connected from the backend with Mongoose.

- Local or Dockerized MongoDB can be used
- The current project setup uses a Docker MongoDB service in `docker-compose.yml`
- The backend connects through `backend/src/config/db.js`

## Schema Overview

The project currently uses six domain collections and one session store:

1. `User`
2. `Category`
3. `Product`
4. `Cart`
5. `Order`
6. `Review`
7. MongoDB session store collection used by `express-session` and `connect-mongo`

## Entity Relations

### User

- Has one cart
- Has many orders
- Has many reviews
- Stores identity and role information for session-based auth

### Category

- Has many products
- A product belongs to exactly one category

### Product

- Belongs to one category
- Appears in cart items
- Appears in order items
- Can have many reviews

### Cart

- Belongs to one user
- Contains many cart items
- Each cart item references one product

### Order

- Belongs to one user
- Contains many order items
- Each order item references one product and stores the purchased snapshot values

### Review

- Belongs to one user
- Belongs to one product
- Stores a rating and optional comment

## Schema Detail

| Collection | Key Fields | Relations |
| --- | --- | --- |
| `User` | `name`, `email`, `passwordHash`, `role` | One-to-one with `Cart`, one-to-many with `Order`, one-to-many with `Review` |
| `Category` | `name`, `description` | One-to-many with `Product` |
| `Product` | `name`, `brand`, `price`, `stock`, `category`, `specs`, `imageUrl` | Many-to-one with `Category`, one-to-many with `Review` |
| `Cart` | `user`, `items[]` | Many-to-one with `User`, item-level references to `Product` |
| `Order` | `user`, `items[]`, `total`, `status` | Many-to-one with `User`, item-level references to `Product` |
| `Review` | `user`, `product`, `rating`, `comment` | Many-to-one with `User`, many-to-one with `Product` |

## Why This Model Works

This schema is small enough to keep the webshop easy to maintain, but it still supports the required catalog, cart, checkout, and review flows. It also fits MongoDB well because product specs, cart items, and order items can be stored as flexible embedded arrays while core relationships stay normalized through ObjectId references.

# Requirements Mapping

## Functional Requirements

#### Browse Products and Categories

Guests can browse the catalog without logging in. The frontend loads products and categories from the API and displays demo data seeded into the database.

#### Authentication

Users can register and log in through the auth forms in the frontend. The backend creates a server session after successful registration or login.

#### Cart and Checkout

Customers and admins can add products to the cart, update quantities, remove items, and place orders.

#### Admin CRUD

Admins can create, edit, and delete products and categories through the GUI. These actions call the REST API with authenticated requests.

#### Reviews

Users can read, create, and delete reviews, with ownership and role checks enforced on the backend.

## Non-Functional Requirements

#### Security

Session cookies are httpOnly and stored in MongoDB. Protected endpoints require authentication, and admin-only CRUD routes require the admin role.

#### REST Principles

The backend exposes clear REST endpoints for auth, products, categories, cart, orders, and reviews. Responses use JSON and standard HTTP status codes.

#### Database Structure

MongoDB stores the application data as related document collections with ObjectId references. This keeps the model simple and practical for the webshop’s data shape.

#### Deployability

The whole system is containerized, which makes local setup and deployment consistent across frontend, backend, and database components.

## Why This Solution Fits the Assignment

The project matches the assignment well because it combines a modern frontend, a simple and maintainable REST API, a document database that fits the data model, and secure session-based authentication. It also meets the documentation requirement by clearly separating stack rationale, database design, API design, and requirement coverage in one place.

<!-- ## Related Documentation

- [Stack rationale](stack.md)
- [Database schema](database.md)
- [API summary](api.md)
- [Requirements mapping](requirements.md) -->

# REST API Summary

Base URL: /api

## Access Model

- Public read endpoints stay open for guest browsing of the catalog.
- Create, update, and delete endpoints require an authenticated session.
- Admin-only CRUD operations also require the admin role.

## Auth

- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /auth/me

## Products

- GET /products
- GET /products/:id
- POST /products (admin)
- PUT /products/:id (admin)
- DELETE /products/:id (admin)

## Categories

- GET /categories
- POST /categories (admin)
- PUT /categories/:id (admin)
- DELETE /categories/:id (admin)

## Cart

- GET /cart
- POST /cart/items
- PUT /cart/items/:itemId
- DELETE /cart/items/:itemId

## Orders

- POST /orders
- GET /orders
- GET /orders/:id

## Reviews

- GET /reviews?productId=...
- POST /reviews
- DELETE /reviews/:id