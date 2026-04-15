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
          <Star key={i}
            className={`w-3.5 h-3.5 ${i < normalizedScore ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
          />
        ))}
        <span className="ml-1 text-xs font-semibold text-slate-400">{score}%</span>
      </div>
    )
  }

  // Dark-theme category badge colours
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      electronics: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      clothing:    'bg-purple-500/20 text-purple-300 border-purple-500/30',
      home:        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      books:       'bg-amber-500/20 text-amber-300 border-amber-500/30',
      beauty:      'bg-pink-500/20 text-pink-300 border-pink-500/30',
      sports:      'bg-red-500/20 text-red-300 border-red-500/30',
      toys:        'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      default:     'bg-slate-500/20 text-slate-300 border-slate-500/30',
    }
    return colors[category.toLowerCase()] || colors.default
  }

  // Gradient for card banner area
  const getCategoryGradient = (category: string) => {
    const g: Record<string, string> = {
      electronics: 'from-blue-600/40 to-cyan-600/30',
      clothing:    'from-purple-600/40 to-pink-600/30',
      home:        'from-emerald-600/40 to-teal-600/30',
      books:       'from-amber-600/40 to-orange-600/30',
      beauty:      'from-pink-600/40 to-rose-600/30',
      sports:      'from-red-600/40 to-orange-600/30',
      toys:        'from-indigo-600/40 to-violet-600/30',
      default:     'from-slate-600/40 to-gray-600/30',
    }
    return g[category.toLowerCase()] || g.default
  }

  // Thin top-strip accent colour per category
  const getCategoryAccent = (category: string) => {
    const a: Record<string, string> = {
      electronics: 'from-blue-500 to-cyan-400',
      clothing:    'from-purple-500 to-pink-400',
      home:        'from-emerald-500 to-teal-400',
      books:       'from-amber-500 to-orange-400',
      beauty:      'from-pink-500 to-rose-400',
      sports:      'from-red-500 to-orange-400',
      toys:        'from-indigo-500 to-violet-400',
      default:     'from-slate-500 to-gray-400',
    }
    return a[category.toLowerCase()] || a.default
  }

  const quickFilters = [
    { label: '💰 Under $100',   query: 'price:<100' },
    { label: '⭐ Top Rated',    query: 'popularity:>80' },
    { label: '📱 Electronics',  query: 'category:electronics' },
    { label: '🏷️ On Sale',     query: 'sale:true' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* ── Animated background ─────────────────────── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#07071a] via-[#110a2e] to-[#07071a]" />
        {/* Blob orbs */}
        <div className="animate-blob        absolute -top-32 -left-32  w-[550px] h-[550px] rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="animate-blob-d2     absolute top-2/3  -right-32  w-[450px] h-[450px] rounded-full bg-cyan-500/15   blur-[90px]" />
        <div className="animate-blob-d4     absolute top-1/3  left-1/2   w-[400px] h-[400px] rounded-full bg-pink-500/12   blur-[90px]" />
        <div className="animate-pulse-slow  absolute bottom-0  left-1/4   w-[320px] h-[320px] rounded-full bg-blue-600/12  blur-[70px]" />
        {/* Dot-grid overlay */}
        <div className="dot-grid absolute inset-0 opacity-100" />
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width:  `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left:   `${5 + i * 8}%`,
              bottom: `${-10 + (i % 4) * 5}%`,
              animationDuration: `${8 + i * 1.5}s`,
              animationDelay:    `${i * 0.7}s`,
              opacity: 0.4 + (i % 3) * 0.15,
            }}
          />
        ))}
      </div>

      {/* ── Header ──────────────────────────────────── */}
      <header className="header-accent glass border-b border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-3.5">
              <div className="animate-glow relative p-2.5 rounded-xl bg-gradient-to-br from-violet-600/40 to-cyan-600/25 border border-violet-500/40 flex-shrink-0">
                <Search className="w-6 h-6 text-violet-200" />
              </div>
              <div>
                <h1 className="gradient-text text-2xl md:text-3xl font-extrabold tracking-tight leading-none">
                  Smart Search
                </h1>
                <p className="text-slate-500 mt-1 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  AI-powered product discovery
                </p>
              </div>
            </div>

            {/* Badges + CTA */}
            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex items-center gap-2">
                {[
                  { icon: Shield,     label: 'Secure', color: 'text-emerald-400' },
                  { icon: Zap,        label: 'Fast',   color: 'text-yellow-400'  },
                  { icon: TrendingUp, label: 'Smart',  color: 'text-cyan-400'    },
                ].map(({ icon: Icon, label, color }) => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                    <Icon className={`w-3 h-3 ${color}`} />
                    {label}
                  </span>
                ))}
              </div>
              <button className="btn-glow px-5 py-2 text-white font-semibold rounded-xl text-sm whitespace-nowrap">
                Get Started
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="glass rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">

          {/* ── Panel hero banner ───────────────────── */}
          <div className="px-8 pt-8 pb-6 border-b border-white/8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Find Products</h2>
                <p className="text-slate-400 text-sm mt-1">Search across thousands of products with AI-powered relevance</p>
              </div>
              <button onClick={() => setShowTips(!showTips)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-violet-300 transition-colors rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                {showTips ? 'Hide Tips' : 'Tips'}
              </button>
            </div>

            {/* Tips */}
            {showTips && (
              <div className="mt-5 p-4 bg-blue-500/8 rounded-xl border border-blue-500/15 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">Power search syntax</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { tip: 'Exact phrase', example: '"wireless headphones"' },
                    { tip: 'Field target', example: 'title:iphone' },
                    { tip: 'Boolean',      example: 'laptop AND gaming' },
                    { tip: 'Exclude',      example: '-refurbished' },
                  ].map(({ tip, example }) => (
                    <div key={tip} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-slate-400">
                        <span className="text-slate-300 font-medium">{tip}:</span>{' '}
                        <code className="bg-black/40 text-cyan-300 px-1.5 py-0.5 rounded font-mono">{example}</code>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Search area ─────────────────────────── */}
          <div className="px-8 py-6">

            {/* Quick Filters */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Quick Filters</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter, index) => (
                  <button key={index}
                    onClick={() => { setQuery(filter.query); fetchResults(filter.query) }}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-violet-200 rounded-full text-xs font-semibold transition-all duration-200">
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch}>
              {/* Label */}
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                What are you looking for?
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. wireless headphones, gaming laptop, running shoes…"
                  className="glass-input w-full pl-12 pr-12 py-4 text-base rounded-2xl"
                />
                {query && (
                  <button type="button" onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-200 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/10 animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-slate-300">Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button key={index} onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 bg-white/5 border border-white/15 hover:border-violet-400/50 hover:bg-violet-500/15 rounded-xl text-sm text-slate-300 hover:text-violet-200 transition-all">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Filters */}
              <div className="mt-5">
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 px-4 py-2 text-violet-400 hover:text-violet-300 font-medium text-sm transition-colors rounded-xl hover:bg-white/5">
                  <Filter className="w-4 h-4" />
                  {showAdvanced ? 'Hide Filters' : 'Advanced Filters'}
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} />
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-5 bg-white/5 rounded-2xl border border-white/10 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                          className="glass-input w-full px-4 py-2.5 rounded-xl appearance-none">
                          <option value="" className="bg-[#12123a]">All Categories</option>
                          {categories.map((c) => <option key={c} value={c} className="bg-[#12123a]">{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Min Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0"
                            className="glass-input w-full pl-8 pr-4 py-2.5 rounded-xl" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Max Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="1000"
                            className="glass-input w-full pl-8 pr-4 py-2.5 rounded-xl" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sort By</label>
                      <div className="flex flex-wrap gap-2">
                        {['relevance','price_asc','price_desc','popularity'].map((opt) => (
                          <button key={opt} type="button" onClick={() => setSortBy(opt)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                              sortBy === opt
                                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/25'
                                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                            }`}>
                            {opt.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit row */}
              <div className="mt-6 flex justify-between items-center">
                <button type="submit" disabled={loading}
                  className="btn-glow px-8 py-3 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Searching…</span>
                  ) : (
                    <span className="flex items-center gap-2"><Search className="w-5 h-5" />Search</span>
                  )}
                </button>
                {(query || selectedCategory || minPrice || maxPrice) && (
                  <button type="button" onClick={clearSearch}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 font-medium transition-colors rounded-xl hover:bg-white/5">
                    <X className="w-4 h-4" />Clear All
                  </button>
                )}
              </div>
            </form>

            {/* ── Error ─────────────────────────────────── */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 animate-fade-in-up">
                <X className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Loading skeletons ─────────────────────── */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl h-56 overflow-hidden border border-white/8">
                    <div className="h-full animate-shimmer-move bg-white/5" />
                  </div>
                ))}
              </div>
            )}

            {/* ── Results ───────────────────────────────── */}
            {!loading && results.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5 text-violet-400" />
                    <span className="font-semibold">{results.length} result{results.length !== 1 ? 's' : ''} found</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <TrendingUp className="w-4 h-4" />
                    {sortBy.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.map((product, idx) => (
                    <div key={product.id}
                      className={`glass-card rounded-2xl p-5 flex flex-col card-enter-${Math.min(idx + 1, 6)}`}>

                      {/* Top row */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(product.category)}`}>
                          <ShoppingBag className="w-3 h-3" />
                          {product.category}
                        </span>
                        {product.match_score !== null && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                            <Zap className="w-3 h-3" />
                            {Math.round(product.match_score)}% match
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-violet-300 transition-colors line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: product.highlighted_title || product.title }} />

                      {/* Description */}
                      <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-1"
                        dangerouslySetInnerHTML={{ __html: product.highlighted_description || product.description }} />

                      {/* Stars */}
                      <div className="mb-4">{renderStars(product.popularity_score)}</div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button aria-label="Save product"
                            className="p-2 text-slate-500 hover:text-pink-400 transition-colors">
                            <Heart className="w-5 h-5" />
                          </button>
                          <button aria-label="View product"
                            className="flex items-center gap-1 px-3 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 rounded-xl text-sm font-medium transition-all">
                            View <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Empty state ───────────────────────────── */}
            {!loading && !error && results.length === 0 && (query || selectedCategory || minPrice || maxPrice) && (
              <div className="text-center py-20 animate-fade-in-up">
                <Globe className="w-14 h-14 mx-auto mb-4 text-slate-600 animate-float" />
                <p className="text-lg font-semibold text-white">No products found</p>
                <p className="text-sm mt-1 text-slate-400">Try adjusting your search terms or filters.</p>
              </div>
            )}

            {/* ── Welcome state ─────────────────────────── */}
            {!loading && !error && results.length === 0 && !query && !selectedCategory && !minPrice && !maxPrice && (
              <div className="text-center py-20 animate-fade-in-up">
                <div className="flex justify-center gap-6 mb-8">
                  {[
                    { icon: Users,    label: '10k+ Users',  bg: 'bg-blue-500/15',   border: 'border-blue-500/25',   color: 'text-blue-400'   },
                    { icon: Award,    label: 'Top Rated',   bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', color: 'text-emerald-400' },
                    { icon: Sparkles, label: 'AI Powered',  bg: 'bg-violet-500/15',  border: 'border-violet-500/25',  color: 'text-violet-400'  },
                  ].map(({ icon: Icon, label, bg, border, color }, i) => (
                    <div key={label} className="flex flex-col items-center gap-2" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className={`p-4 ${bg} border ${border} rounded-2xl animate-float`} style={{ animationDelay: `${i * 0.5}s` }}>
                        <Icon className={`w-7 h-7 ${color}`} />
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="gradient-text text-lg font-semibold">Start typing to discover products instantly</p>
                <p className="text-slate-500 text-sm mt-1">Powered by AI relevance scoring</p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="relative z-10 mt-8 py-6 text-center text-sm text-slate-600 border-t border-white/5">
        <p>© {new Date().getFullYear()} <span className="gradient-text font-semibold">Smart Search</span> — AI-powered product discovery</p>
      </footer>

    </div>
  )
}

export default App
