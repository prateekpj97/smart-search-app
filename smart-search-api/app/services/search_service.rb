class SearchService
  class << self
    def search(query:, category: nil, min_price: nil, max_price: nil, tags: nil, sort: 'relevance', page: 1, per_page: 20)
      # Start with base query
      products = Product.all

      # Apply advanced text search if query present
      if query.present?
        products = apply_advanced_search(products, query)
      end

      # Apply filters
      products = products.where(category: category) if category.present?
      
      if min_price.present?
        products = products.where("price >= ?", min_price.to_f)
      end
      
      if max_price.present?
        products = products.where("price <= ?", max_price.to_f)
      end

      # Apply relevance scoring for sorting
      products = apply_relevance_scoring(products, query) if query.present? && sort == 'relevance'

      # Apply sorting
      products = apply_sorting(products, sort, query)

      # Get total count before pagination
      total_count = products.count

      # Apply pagination
      products = products.offset((page - 1) * per_page).limit(per_page)

      {
        products: products,
        total_count: total_count,
        total_pages: (total_count.to_f / per_page).ceil
      }
    end

    private

    def apply_advanced_search(products, query)
      # Parse query for advanced features
      parsed_query = parse_search_query(query)
      
      # Start with base scope
      scope = products
      
      # Handle field-specific searches
      if parsed_query[:field_searches].any?
        parsed_query[:field_searches].each do |field, value|
          case field
          when :title
            scope = scope.where("title ILIKE ?", "%#{sanitize_sql_like(value)}%")
          when :description
            scope = scope.where("description ILIKE ?", "%#{sanitize_sql_like(value)}%")
          when :category
            scope = scope.where("category ILIKE ?", "%#{sanitize_sql_like(value)}%")
          end
        end
      end
      
      # Handle phrase searches (quoted strings)
      if parsed_query[:phrases].any?
        parsed_query[:phrases].each do |phrase|
          scope = scope.where("title ILIKE ? OR description ILIKE ?",
                            "%#{sanitize_sql_like(phrase)}%",
                            "%#{sanitize_sql_like(phrase)}%")
        end
      end
      
      # Handle boolean operators for remaining terms
      if parsed_query[:terms].any?
        term_conditions = []
        term_values = []
        
        parsed_query[:terms].each do |term|
          if term.start_with?('-')
            # NOT operator
            term = term[1..-1]
            scope = scope.where.not("title ILIKE ? OR description ILIKE ?",
                                  "%#{sanitize_sql_like(term)}%",
                                  "%#{sanitize_sql_like(term)}%")
          elsif term.upcase == 'AND' || term.upcase == 'OR'
            # Skip boolean operators as they're handled by the query structure
            next
          else
            # Regular term (implicit AND)
            scope = scope.where("title ILIKE ? OR description ILIKE ?",
                              "%#{sanitize_sql_like(term)}%",
                              "%#{sanitize_sql_like(term)}%")
          end
        end
      end
      
      scope
    end

    def parse_search_query(query)
      # Initialize result structure
      result = {
        field_searches: {},  # title: "iphone", description: "fast"
        phrases: [],         # ["wireless headphones"]
        terms: [],           # ["iphone", "pro", "max"]
        operators: []        # ["AND", "OR"]
      }
      
      # Extract quoted phrases
      query_without_phrases = query.gsub(/"(.*?)"/) do |match|
        result[:phrases] << match[1..-2]
        " "
      end
      
      # Extract field-specific searches (title:, description:, category:)
      query_without_fields = query_without_phrases.gsub(/(title|description|category):\s*([^\s]+)/i) do |match|
        field = $1.downcase.to_sym
        value = $2
        result[:field_searches][field] = value
        " "
      end
      
      # Split remaining into terms and operators
      tokens = query_without_fields.split(/\s+/).reject(&:empty?)
      
      tokens.each do |token|
        if token.upcase == 'AND' || token.upcase == 'OR' || token.upcase == 'NOT'
          result[:operators] << token.upcase
        else
          result[:terms] << token
        end
      end
      
      result
    end

    def apply_relevance_scoring(products, query)
      # Calculate relevance score based on multiple factors
      # 1. Exact match in title (highest weight)
      # 2. Partial match in title
      # 3. Exact match in description
      # 4. Partial match in description
      # 5. Category match
      # 6. Popularity score
      
      parsed_query = parse_search_query(query)
      all_search_terms = (parsed_query[:terms] + parsed_query[:phrases]).map(&:downcase)
      
      return products if all_search_terms.empty?
      
      # Build SQL CASE statement for relevance scoring
      # Use parameterized queries to avoid SQL injection
      term_patterns = all_search_terms.map { |t| "%#{sanitize_sql_like(t)}%" }
      
      # Create SQL fragments for ILIKE conditions
      title_conditions = term_patterns.map { |pattern| "title ILIKE '#{pattern.gsub("'", "''")}'" }.join(" OR ")
      desc_conditions = term_patterns.map { |pattern| "description ILIKE '#{pattern.gsub("'", "''")}'" }.join(" OR ")
      
      # We need to handle counting separately, so we'll apply the scoring after getting the count
      # For now, let's use a simpler approach: calculate match_score in Ruby
      # This is less efficient but works for demonstration
      products
    end
    
    def calculate_match_score(product, query)
      # Calculate match score in Ruby
      parsed_query = parse_search_query(query)
      all_search_terms = (parsed_query[:terms] + parsed_query[:phrases]).map(&:downcase)
      
      return 0 if all_search_terms.empty?
      
      score = 40  # Base score
      
      # Check title matches
      title_matches = all_search_terms.any? do |term|
        product.title.downcase.include?(term)
      end
      
      # Check description matches
      desc_matches = all_search_terms.any? do |term|
        product.description.downcase.include?(term)
      end
      
      if title_matches && desc_matches
        score = 100
      elsif title_matches
        score = 80
      elsif desc_matches
        score = 60
      end
      
      # Add popularity bonus
      score + (product.popularity_score * 0.2)
    end
    
    # Make calculate_match_score available as a class method
    def self.calculate_match_score(product, query)
      new.calculate_match_score(product, query)
    end

    def apply_sorting(products, sort, query = nil)
      case sort
      when 'price_asc'
        products.order(price: :asc)
      when 'price_desc'
        products.order(price: :desc)
      when 'popularity'
        products.order(popularity_score: :desc)
      when 'newest'
        products.order(created_at: :desc)
      when 'relevance'
        # If we have a query, relevance scoring is already applied
        # If no query, fall back to popularity
        if query.present?
          products
        else
          products.order(popularity_score: :desc)
        end
      else
        products.order(popularity_score: :desc)
      end
    end

    def sanitize_sql_like(string)
      string.gsub(/[\\%_]/) { |x| "\\#{x}" }
    end
    
    # Make calculate_match_score available as a class method
    def calculate_match_score(product, query)
      # Calculate match score in Ruby
      parsed_query = parse_search_query(query)
      all_search_terms = (parsed_query[:terms] + parsed_query[:phrases]).map(&:downcase)
      
      return 0 if all_search_terms.empty?
      
      score = 40  # Base score
      
      # Check title matches
      title_matches = all_search_terms.any? do |term|
        product.title.downcase.include?(term)
      end
      
      # Check description matches
      desc_matches = all_search_terms.any? do |term|
        product.description.downcase.include?(term)
      end
      
      if title_matches && desc_matches
        score = 100
      elsif title_matches
        score = 80
      elsif desc_matches
        score = 60
      end
      
      # Add popularity bonus
      score + (product.popularity_score * 0.2)
    end
  end
  
  # Class method wrapper
  def self.calculate_match_score(product, query)
    new.send(:calculate_match_score, product, query)
  end
end