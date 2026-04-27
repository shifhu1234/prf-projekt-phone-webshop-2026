# Requirements Mapping

## Functional Requirements

- Roles: guest, customer, admin
- Guests can browse the catalog and prices
- Customers can register, login, build a cart, and place orders
- Admin can create, update, and delete products and categories
- CRUD operations are protected with authenticated sessions
- REST API supports product, category, cart, order, and review flows

## Non-Functional Requirements

- REST API uses JSON and clear HTTP status codes
- Session cookies are httpOnly and stored in MongoDB
- Demo data is seeded on startup
- Docker images exist for frontend, backend, and database

## Data Model

- Users
- Categories
- Products
- Carts
- Orders
- Reviews
