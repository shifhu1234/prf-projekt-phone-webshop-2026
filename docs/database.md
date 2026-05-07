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