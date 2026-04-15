import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Loader2, X, ChevronRight, Star, TrendingUp, Zap, Shield, Sparkles, ShoppingBag, Tag, CheckCircle, Heart, ExternalLink, BarChart3, Users, Award, Globe } from 'lucide-react'
import './App.css'

interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  popularity_score: number
  match_score: number | null
  highlighted_title: string
  highlighted_description: string
}

interface SearchResponse {
  results: Product[]
  pagination: {
    page: number
    per_page: number
    total_pages: number
    total_results: number
  }
  suggestions: string[]
  filters_available: {
    categories: string[]
    price_ranges: string[]
  }
}

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState('relevance')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showTips, setShowTips] = useState(true)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Fetch results when debounced query or filters change
  useEffect(() => {
    if (debouncedQuery.trim() || selectedCategory || minPrice || maxPrice) {
      fetchResults(debouncedQuery)
    } else {
      setResults([])
      setSuggestions([])
    }
  }, [debouncedQuery, selectedCategory, minPrice, maxPrice, sortBy])

  const fetchResults = useCallback(async (searchQuery: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.append('q', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)
      if (minPrice) params.append('min_price', minPrice)
      if (maxPrice) params.append('max_price', maxPrice)
      if (sortBy) params.append('sort', sortBy)
      
      const response = await fetch(`http://localhost:3000/api/search?${params}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }
      
      const data: SearchResponse = await response.json()
      setResults(data.results)
      setSuggestions(data.suggestions)
      setCategories(data.filters_available.categories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, minPrice, maxPrice, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchResults(query)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    fetchResults(suggestion)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSuggestions([])
    setSelectedCategory('')
    setMinPrice('')
    setMaxPrice('')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const renderStars = (score: number) => {
    const normalizedScore = Math.min(5, Math.max(1, Math.round(score / 20)))
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < normalizedScore ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{score}%</span>
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      electronics: 'bg-blue-100 text-blue-800 border-blue-200',
      clothing: 'bg-purple-100 text-purple-800 border-purple-200',
      home: 'bg-green-100 text-green-800 border-green-200',
      books: 'bg-amber-100 text-amber-800 border-amber-200',
      beauty: 'bg-pink-100 text-pink-800 border-pink-200',
      sports: 'bg-red-100 text-red-800 border-red-200',
      toys: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[category.toLowerCase()] || colors.default
  }

  const quickFilters = [
    { label: 'Under $100', query: 'price:<100' },
    { label: 'Top Rated', query: 'popularity:>80' },
    { label: 'Electronics', query: 'category:electronics' },
    { label: 'On Sale', query: 'sale:true' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Smart Search</h1>
                <p className="text-primary-100 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI-powered product discovery
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Fast</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Smart</span>
                </div>
              </div>
              <button className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Find Products</h2>
              <button
                onClick={() => setShowTips(!showTips)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <Sparkles className="w-4 h-4" />
                {showTips ? 'Hide Tips' : 'Show Tips'}
              </button>
            </div>

            {showTips && (
              <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Search Tips</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Use quotes for exact phrases: <code className="bg-gray-100 px-2 py-1 rounded">"wireless headphones"</code></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Search by field: <code className="bg-gray-100 px-2 py-1 rounded">title:iphone category:electronics</code></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Use AND/OR operators: <code className="bg-gray-100 px-2 py-1 rounded">laptop AND gaming</code></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Price filters: <code className="bg-gray-100 px-2 py-1 rounded">price:{'<'}500 price:{'>'}100</code></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Filters */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Quick Filters</h3>
                <Tag className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex flex-wrap gap-3">
                {quickFilters.map((filter, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(filter.query)
                      fetchResults(filter.query)
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products, brands, categories..."
                  className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Filters Toggle */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Filter className="w-4 h-4" />
                  {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                  <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                </button>

                {showAdvanced && (
                  <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                        >
                          <option value="">All Categories</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="0"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="1000"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                      <div className="flex flex-wrap gap-3">
                        {['relevance', 'price_asc', 'price_desc', 'popularity'].map((sortOption) => (
                          <button
                            key={sortOption}
                            type="button"
                            onClick={() => setSortBy(sortOption)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                              sortBy === sortOption
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {sortOption.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Searching...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Search
                    </span>
                  )}
                </button>

                {(query || selectedCategory || minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </form>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
                <X className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-2xl p-5 h-56" />
                ))}
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <div>
                {/* Results header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-gray-700">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold">{results.length} result{results.length !== 1 ? 's' : ''} found</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                    Sorted by {sortBy.replace('_', ' ')}
                  </div>
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-primary-300 transition-all duration-300 flex flex-col"
                    >
                      {/* Category & match score */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(product.category)}`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          {product.category}
                        </span>
                        {product.match_score !== null && (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                            <Zap className="w-3 h-3" />
                            {Math.round(product.match_score)}% match
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: product.highlighted_title || product.title }}
                      />

                      {/* Description */}
                      <p
                        className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1"
                        dangerouslySetInnerHTML={{ __html: product.highlighted_description || product.description }}
                      />

                      {/* Popularity */}
                      <div className="mb-4">
                        {renderStars(product.popularity_score)}
                      </div>

                      {/* Footer row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xl font-bold text-primary-700">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            aria-label="Save product"
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart className="w-5 h-5" />
                          </button>
                          <button
                            aria-label="View product"
                            className="flex items-center gap-1 px-3 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && results.length === 0 && (query || selectedCategory || minPrice || maxPrice) && (
              <div className="text-center py-16 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold text-gray-700">No products found</p>
                <p className="text-sm mt-1">Try adjusting your search terms or filters.</p>
              </div>
            )}

            {/* Welcome state */}
            {!loading && !error && results.length === 0 && !query && !selectedCategory && !minPrice && !maxPrice && (
              <div className="text-center py-16">
                <div className="flex justify-center gap-6 mb-6 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-4 bg-blue-50 rounded-2xl">
                      <Users className="w-7 h-7 text-blue-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">10k+ Users</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-4 bg-green-50 rounded-2xl">
                      <Award className="w-7 h-7 text-green-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Top Rated</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-4 bg-purple-50 rounded-2xl">
                      <Sparkles className="w-7 h-7 text-purple-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">AI Powered</span>
                  </div>
                </div>
                <p className="text-gray-500 text-base">Start typing to discover products instantly.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Smart Search — AI-powered product discovery</p>
      </footer>
    </div>
  )
}

export default App
