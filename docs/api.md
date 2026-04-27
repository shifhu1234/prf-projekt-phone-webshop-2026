# REST API Summary

Base URL: /api

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
