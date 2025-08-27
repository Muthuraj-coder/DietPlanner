import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Calendar, Clock, Search, RefreshCw, AlertCircle } from 'lucide-react';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('health');

  const NEWS_API_KEY = 'be643d753fa54c259fceeb6f556d2bc7';
  const NEWS_API_URL = 'https://newsapi.org/v2/everything';

  const healthCategories = [
    { value: 'health', label: 'General Health', query: 'health nutrition wellness' },
    { value: 'nutrition', label: 'Nutrition', query: 'nutrition diet food healthy eating' },
    { value: 'fitness', label: 'Fitness', query: 'fitness exercise workout gym' },
    { value: 'mental-health', label: 'Mental Health', query: 'mental health wellness mindfulness stress' },
    { value: 'medical', label: 'Medical News', query: 'medical research healthcare medicine' }
  ];

  useEffect(() => {
    fetchHealthNews();
  }, [category]);

  const fetchHealthNews = async (customQuery = '') => {
    try {
      setLoading(true);
      setError('');

      const selectedCategory = healthCategories.find(cat => cat.value === category);
      const query = customQuery || selectedCategory?.query || 'health nutrition wellness';
      
      const response = await fetch(
        `${NEWS_API_URL}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Failed to fetch news');
      }

      // Filter out articles with missing essential data
      const validArticles = data.articles.filter(article => 
        article.title && 
        article.description && 
        article.url &&
        !article.title.includes('[Removed]') &&
        !article.description.includes('[Removed]')
      );

      setArticles(validArticles);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message || 'Failed to load health news');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchHealthNews(searchQuery.trim());
    }
  };

  const handleRefresh = () => {
    fetchHealthNews();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const articleDate = new Date(dateString);
    const diffInHours = Math.floor((now - articleDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Newspaper className="w-8 h-8 text-emerald-600" />
          Health News
        </h1>
        <p className="text-gray-600">Stay updated with the latest health, nutrition, and wellness news</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Category Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {healthCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search health topics..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Refresh */}
          <div className="flex items-end">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Error loading news</p>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <article key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Calendar className="w-3 h-3" />
                  <span>{getTimeAgo(article.publishedAt)}</span>
                  {article.source?.name && (
                    <>
                      <span>•</span>
                      <span className="font-medium">{article.source.name}</span>
                    </>
                  )}
                </div>
                
                <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                  {article.title}
                </h2>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {article.description}
                </p>
                
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                >
                  Read Full Article
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h3>
          <p className="text-gray-500 mb-6">Try a different search term or category</p>
          <button
            onClick={handleRefresh}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Refresh News
          </button>
        </div>
      )}
    </div>
  );
};

export default News;
