# Software Documentation

## Project Overview

This project is a phone webshop built as a Dockerized monorepo. It contains a React + Vite frontend, a Node.js + Express backend, and a MongoDB database. The system supports browsing products, authentication, cart management, checkout, reviews, and admin CRUD operations.

## Chosen Tech Stack

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

The repository is organized as a monorepo so the frontend, backend, database, and documentation remain in one deployable project.

## Database and Data Model

The backend connects to MongoDB through Mongoose and supports a schema with at least six collections:

- `User`
- `Category`
- `Product`
- `Cart`
- `Order`
- `Review`

### Relationships

- A `User` can have one cart, many orders, and many reviews.
- A `Category` can contain many products.
- A `Product` belongs to one category and can appear in cart items, order items, and reviews.
- A `Cart` belongs to one user and stores many cart items.
- An `Order` belongs to one user and stores many order items.
- A `Review` belongs to one user and one product.

This model supports the webshop domain while staying flexible enough for product specs, cart updates, and order snapshots.

## Requirements Coverage

### Functional Requirements

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

### Non-Functional Requirements

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

## Related Documentation

- [Stack rationale](stack.md)
- [Database schema](database.md)
- [API summary](api.md)
- [Requirements mapping](requirements.md)