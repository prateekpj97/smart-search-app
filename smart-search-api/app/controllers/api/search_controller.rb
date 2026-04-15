class Api::SearchController < ApplicationController
  before_action :validate_search_params, only: [:index]

  # GET /api/search
  def index
    query = params[:q].to_s.strip
    page = params[:page].to_i.positive? ? params[:page].to_i : 1
    per_page = params[:per_page].to_i.positive? ? params[:per_page].to_i : 20

    results = SearchService.search(
      query: query,
      category: params[:category],
      min_price: params[:min_price],
      max_price: params[:max_price],
      tags: params[:tags],
      sort: params[:sort],
      page: page,
      per_page: per_page
    )

    # Calculate match scores for each product if we have a query
    products_with_scores = results[:products].map do |product|
      if query.present?
        match_score = calculate_match_score_for_product(product, query)
        product.define_singleton_method(:match_score) { match_score }
      end
      product
    end

    # Record search for analytics and suggestions improvement
    user_id = current_user&.id
    SuggestionService.record_search(query, user_id: user_id) if query.present?

    render json: {
      results: products_with_scores.map { |product| product_serializer(product) },
      pagination: {
        page: page,
        per_page: per_page,
        total_pages: results[:total_pages],
        total_results: results[:total_count]
      },
      suggestions: generate_suggestions(query),
      filters_available: available_filters
    }
  end

  private

  def validate_search_params
    # Validate price parameters
    if params[:min_price].present? && !valid_price?(params[:min_price])
      render json: { error: "Invalid min_price parameter" }, status: :bad_request
      return
    end

    if params[:max_price].present? && !valid_price?(params[:max_price])
      render json: { error: "Invalid max_price parameter" }, status: :bad_request
      return
    end

    # Validate sort parameter
    valid_sorts = %w[relevance price_asc price_desc popularity newest]
    if params[:sort].present? && !valid_sorts.include?(params[:sort])
      render json: { error: "Invalid sort parameter. Must be one of: #{valid_sorts.join(', ')}" }, status: :bad_request
    end
  end

  def valid_price?(price)
    Float(price) rescue false
  end

  def product_serializer(product)
    {
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price.to_f,
      popularity_score: product.popularity_score,
      match_score: product.respond_to?(:match_score) ? product.match_score : nil,
      highlighted_title: highlight_text(product.title, params[:q]),
      highlighted_description: highlight_text(product.description, params[:q])
    }
  end

  def highlight_text(text, query)
    return text unless query.present? && text.present?

    regex = Regexp.new(Regexp.escape(query), Regexp::IGNORECASE)
    text.gsub(regex, '<mark>\0</mark>')
  end

  def generate_suggestions(query)
    SuggestionService.suggestions_for(query, limit: 3)
  end

  def available_filters
    {
      categories: Product.distinct.pluck(:category).compact,
      price_ranges: [
        "0-100",
        "100-500",
        "500-1000",
        "1000+"
      ]
    }
  end
  
  def calculate_match_score_for_product(product, query)
    # Simple match score calculation
    # 1. Check if query terms appear in title
    # 2. Check if query terms appear in description
    # 3. Add popularity bonus
    
    return 0 if query.blank?
    
    query_terms = query.downcase.split(/\s+/).reject(&:empty?)
    return 0 if query_terms.empty?
    
    score = 40  # Base score
    
    # Check title matches
    title_matches = query_terms.any? do |term|
      product.title.downcase.include?(term)
    end
    
    # Check description matches
    desc_matches = query_terms.any? do |term|
      product.description.downcase.include?(term)
    end
    
    if title_matches && desc_matches
      score = 100
    elsif title_matches
      score = 80
    elsif desc_matches
      score = 60
    end
    
    # Add popularity bonus (0-20 points)
    score + (product.popularity_score * 0.2)
  end
end
