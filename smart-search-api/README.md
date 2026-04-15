# Smart Search API 🔍

A Rails 8 REST API that powers the Smart Search product discovery platform. Features full-text search with advanced query parsing, JWT authentication, Redis-backed analytics, and AI-style relevance scoring.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Ruby on Rails 8.0.5 (API-only) |
| Language | Ruby 3.x |
| Database | PostgreSQL 14+ |
| Cache / Analytics | Redis 5+ |
| Auth | JWT (json web tokens) + bcrypt |
| Web Server | Puma |
| CORS | rack-cors |

---

## Prerequisites

- Ruby `>= 3.2` (see `.ruby-version`)
- PostgreSQL `>= 14`
- Redis `>= 6`
- Bundler `>= 2.4`

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/prateekpj97/smart-search-app.git
cd smart-search-app/smart-search-api

# 2. Install dependencies
bundle install

# 3. Copy the environment template and fill in your values
cp .env.example .env

# 4. Create and migrate the database
rails db:create db:migrate

# 5. (Optional) Seed sample products
rails db:seed

# 6. Start the server
rails server -p 3000
```

The API will be available at `http://localhost:3000`.

---

## Environment Variables

> ⚠️ **Never commit `.env` or `config/master.key` to version control.**

Create a `.env` file from the template below (also saved as `.env.example` in the repo):

```dotenv
# Database
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/smart_search_api_development

# Redis
REDIS_URL=redis://localhost:6379/0

# Rails
RAILS_ENV=development
SECRET_KEY_BASE=generate_with_rails_secret

# JWT
JWT_SECRET=your_long_random_jwt_secret_here
JWT_EXPIRY_HOURS=24

# Production DB password (used by config/database.yml in production)
SMART_SEARCH_API_DATABASE_PASSWORD=your_production_db_password
```

Generate a secure `SECRET_KEY_BASE`:
```bash
rails secret
```

---

## API Endpoints

### 🔎 Search

#### `GET /api/search`

Search and filter products. No authentication required.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `q` | string | No | Search query |
| `category` | string | No | Filter by category |
| `min_price` | number | No | Minimum price filter |
| `max_price` | number | No | Maximum price filter |
| `sort` | string | No | `relevance` \| `price_asc` \| `price_desc` \| `popularity` \| `newest` |
| `page` | integer | No | Page number (default: 1) |
| `per_page` | integer | No | Results per page (default: 20) |

**Advanced query syntax:**

| Syntax | Example | Effect |
|---|---|---|
| Quoted phrase | `"wireless headphones"` | Exact phrase match |
| Field search | `title:iphone category:electronics` | Match specific field |
| Boolean AND | `laptop AND gaming` | Both terms required |
| Exclude term | `-refurbished` | Exclude matching results |

**Example request:**
```
GET /api/search?q=wireless+headphones&category=electronics&max_price=200&sort=relevance
```

**Example response:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Wireless Headphones Pro",
      "description": "Premium noise-cancelling headphones",
      "category": "electronics",
      "price": 149.99,
      "popularity_score": 87,
      "match_score": 100,
      "highlighted_title": "<mark>Wireless</mark> <mark>Headphones</mark> Pro",
      "highlighted_description": "Premium noise-cancelling <mark>headphones</mark>"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 3,
    "total_results": 52
  },
  "suggestions": ["wireless earbuds", "wireless speaker"],
  "filters_available": {
    "categories": ["electronics", "clothing", "home"],
    "price_ranges": ["0-100", "100-500", "500-1000", "1000+"]
  }
}
```

---

### 🔐 Authentication

All auth endpoints are under `/api/auth`.

#### `POST /api/auth/register`

```json
// Request body
{ "name": "Prateek Jain", "email": "user@example.com", "password": "securepassword" }

// Response 201
{ "token": "<jwt>", "user": { "id": 1, "name": "Prateek Jain", "email": "user@example.com" } }
```

#### `POST /api/auth/login`

```json
// Request body
{ "email": "user@example.com", "password": "securepassword" }

// Response 200
{ "token": "<jwt>", "user": { "id": 1, "name": "Prateek Jain", "email": "user@example.com" } }
```

#### `GET /api/auth/me` 🔒

```
Authorization: Bearer <jwt>
```
Returns the authenticated user's profile.

---

### 📊 Analytics *(requires authentication)*

Include `Authorization: Bearer <jwt>` header on all analytics requests.

| Endpoint | Description |
|---|---|
| `GET /api/analytics/trending` | Top trending search queries (Redis sorted set) |
| `GET /api/analytics/stats` | Search counts, unique users, popular categories |
| `GET /api/analytics/user_history` | Last 50 searches for the authenticated user |

---

## Security

| Topic | Guidance |
|---|---|
| `config/master.key` | **Never commit.** Listed in `.gitignore`. Share via a secret manager (e.g. Vault, AWS Secrets Manager). |
| Database credentials | Use `DATABASE_URL` env var or `SMART_SEARCH_API_DATABASE_PASSWORD` in production. Never hardcode. |
| JWT secret | Set `JWT_SECRET` in `.env`. Use a minimum 64-character random string. Rotate periodically. |
| CORS origins | Update `config/initializers/cors.rb` to whitelist only your frontend domain(s) in production. |
| SQL injection | All user input is passed through parameterized queries (`ILIKE ?`) and `sanitize_sql_like`. |
| Passwords | Stored as bcrypt hashes via `has_secure_password`. Plain-text passwords are never persisted. |

---

## Running Tests

```bash
rails test
```

---

## Docker

```bash
docker build -t smart-search-api .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://... \
  -e REDIS_URL=redis://... \
  -e JWT_SECRET=... \
  smart-search-api
```

---

## Health Check

```
GET /up   → 200 OK  (used by load balancers / uptime monitors)
```
