ROLE:
Act as a Senior Software Engineer

OBJECTIVE:
Define acceptance criteria for a Smart Search system

TECH STACK:
- Frontend: React JS
- Backend: Ruby on Rails 8.1 (API)
- Database: PostgreSQL
- Caching: Redis

OUTPUT FORMAT:
Concise bullet points only

CRITERIA:

1. Search
- React search input triggers API call (/api/search)
- Rails API returns results ≤ 2s
- Supports partial, case-insensitive, fuzzy match (DB/Elastic logic)

2. Relevance
- Backend ranks via relevance, popularity, recency
- Top result = best match

3. Suggestions
- React shows suggestions within 300ms (debounced input)
- Top 5–10 results from Redis cache
- Include recent (user) + popular (global)
- Click → autofill + search

4. Filters
- UI filters (category, date, tags)
- Query params sent to Rails API
- Results update without page reload

5. Advanced Search
- Backend parses "", -, AND, OR
- Multi-column search (Postgres: title, description, tags)

6. Performance
- Postgres indexed search (GIN/trigram)
- Redis caching for frequent queries
- Handle 1M+ records
- Pagination/infinite scroll (cursor/page-based)
- API response < 500KB

7. Errors
- React shows “No results”
- API returns structured error JSON
- Graceful timeout + retry handling

8. UX
- Persistent search bar (React)
- Loading spinner during API call
- Highlight matched keywords

9. Personalization (optional)
- Store user history (Postgres/Redis)
- Show recent searches
- Personalized ranking (future scope)

10. Security
- Rails strong params + sanitization
- Prevent SQL injection
- Rate limiting (Rack::Attack)
- Input validation on API

11. Analytics
- Log queries, CTR, zero-results (DB or analytics service)
- Async tracking (background jobs)

12. Accessibility
- Keyboard navigation (React)
- ARIA support
- Screen reader compatible

13. API
- GET /api/search?q=&filters=&page=
- JSON: {results, total, page, suggestions}
- Stateless REST API (Rails)

14. Edge Cases
- Empty query → Redis trending/recent
- Handle special chars safely
- Long query safe parsing
- Remove duplicates

15. Deployment
- Works on modern browsers
- Responsive React UI
- Load tested (API + DB)
- Scalable via caching (Redis) + DB indexing