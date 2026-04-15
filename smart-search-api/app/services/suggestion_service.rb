class SuggestionService
  class << self
    # Generate search suggestions for a query with Redis caching
    def suggestions_for(query, limit: 5)
      return [] if query.blank?

      # Try to get from cache first
      cache_key = "suggestions:#{query.downcase}"
      cached = redis.get(cache_key)
      
      if cached
        JSON.parse(cached).first(limit)
      else
        # Generate fresh suggestions
        suggestions = generate_suggestions(query)
        
        # Cache for 1 hour
        redis.setex(cache_key, 1.hour, suggestions.to_json)
        
        suggestions.first(limit)
      end
    end

    # Record a search query for analytics (used to improve suggestions)
    def record_search(query, user_id: nil)
      return if query.blank?
      
      # Increment query frequency in Redis
      query_key = query.downcase.strip
      redis.zincrby("search_frequencies", 1, query_key)
      
      # Store user-specific search history if user_id provided
      if user_id
        redis.lpush("user_searches:#{user_id}", query_key)
        redis.ltrim("user_searches:#{user_id}", 0, 99) # Keep last 100 searches
      end
      
      # Store query for trending analysis
      timestamp = Time.current.to_i
      redis.zadd("search_trends:#{Date.today}", timestamp, query_key)
    end

    # Get trending searches (most frequent in last 24 hours)
    def trending_searches(limit: 10)
      # Get searches from last 24 hours
      yesterday_key = "search_trends:#{Date.yesterday}"
      today_key = "search_trends:#{Date.today}"
      
      # Combine yesterday and today's searches
      redis.zunionstore("trending_24h", [yesterday_key, today_key])
      
      # Get top searches by score (frequency)
      redis.zrevrange("trending_24h", 0, limit - 1, with_scores: true)
    end

    private

    def redis
      @redis ||= begin
        # Try to use the global constant first, fall back to new connection
        if defined?(::REDIS_SUGGESTIONS)
          ::REDIS_SUGGESTIONS
        else
          Redis.new(
            host: ENV.fetch('REDIS_HOST', 'localhost'),
            port: ENV.fetch('REDIS_PORT', 6379),
            db: ENV.fetch('REDIS_SUGGESTIONS_DB', 0),
            timeout: 5
          )
        end
      end
    end

    private

    def generate_suggestions(query)
      # Simple suggestion algorithm - in production this would be more sophisticated
      # using search history, product titles, etc.
      
      query = query.downcase.strip
      suggestions = []
      
      # 1. Add common suffixes
      common_suffixes = ['pro', 'max', '2024', '2023', 'plus', 'lite', 'premium', 'standard']
      common_suffixes.each do |suffix|
        suggestions << "#{query} #{suffix}"
      end
      
      # 2. Add related categories from products
      related_categories = Product.where(
        "title ILIKE ? OR description ILIKE ?", 
        "%#{query}%", "%#{query}%"
      ).distinct.pluck(:category).compact
      
      related_categories.each do |category|
        suggestions << "#{query} #{category}"
        suggestions << "#{category} #{query}"
      end
      
      # 3. Add price range suggestions
      price_ranges = ['under $100', 'under $500', 'under $1000']
      price_ranges.each do |range|
        suggestions << "#{query} #{range}"
      end
      
      # 4. Remove duplicates and limit
      suggestions.uniq.first(20)
    end
  end
end