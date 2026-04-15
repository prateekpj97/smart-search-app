class Api::AnalyticsController < ApplicationController
  before_action :require_authentication
  # No require_admin for now since we don't have admin functionality

  # GET /api/analytics/trending
  def trending
    limit = params[:limit] || 10
    trending = SuggestionService.trending_searches(limit: limit.to_i)
    
    render json: {
      trending_searches: trending.map do |query, score|
        {
          query: query,
          frequency: score.to_i
        }
      end
    }
  end

  # GET /api/analytics/stats
  def stats
    # Get total searches in last 24 hours
    yesterday_key = "search_trends:#{Date.yesterday}"
    today_key = "search_trends:#{Date.today}"
    
    # Use Redis connection from SuggestionService
    redis = SuggestionService.send(:redis)
    
    yesterday_count = redis.zcard(yesterday_key) || 0
    today_count = redis.zcard(today_key) || 0
    
    # Get unique users who searched (approximate)
    unique_users = redis.keys("user_searches:*").count
    
    # Get most popular categories from recent searches
    popular_categories = Product.joins("INNER JOIN (SELECT DISTINCT unnest(string_to_array(title, ' ')) as term FROM products) terms ON products.title ILIKE '%' || terms.term || '%'")
                               .group('products.category')
                               .order(Arel.sql('COUNT(*) DESC'))
                               .limit(5)
                               .pluck('products.category', Arel.sql('COUNT(*)'))
    
    render json: {
      searches_last_24h: yesterday_count + today_count,
      searches_today: today_count,
      unique_users: unique_users,
      popular_categories: popular_categories.map { |cat, count| { category: cat, count: count } },
      timestamp: Time.current.iso8601
    }
  end

  # GET /api/analytics/user_history
  def user_history
    return render json: { error: 'User not found' }, status: :not_found unless current_user
    
    # Use Redis connection from SuggestionService
    redis = SuggestionService.send(:redis)
    user_key = "user_searches:#{current_user.id}"
    searches = redis.lrange(user_key, 0, 49) || []
    
    render json: {
      recent_searches: searches.map do |query|
        {
          query: query,
          timestamp: nil # We don't store timestamps in list, could use sorted set in future
        }
      end
    }
  end
end