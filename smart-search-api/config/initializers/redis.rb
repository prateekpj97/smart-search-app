# Redis configuration for caching
REDIS_SUGGESTIONS = Redis.new(
  host: ENV.fetch('REDIS_HOST', 'localhost'),
  port: ENV.fetch('REDIS_PORT', 6379),
  db: ENV.fetch('REDIS_SUGGESTIONS_DB', 0),
  timeout: 5
)

# Configure Rails cache store to use Redis for development
if Rails.env.development?
  Rails.application.config.cache_store = :redis_cache_store, {
    url: "redis://localhost:6379/1",
    expires_in: 1.day,
    namespace: 'smart_search_cache'
  }
end