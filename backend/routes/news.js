const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const DEFAULT_QUERY = 'health';
const MAX_RESULTS = 10;

function sanitizeQuery(value = '') {
  return String(value).trim();
}

function buildSearchQuery(q, category) {
  const baseQuery = sanitizeQuery(q) || DEFAULT_QUERY;
  const categoryQuery = sanitizeQuery(category);
  if (categoryQuery && !baseQuery.toLowerCase().includes(categoryQuery.toLowerCase())) {
    return `${baseQuery} ${categoryQuery}`.trim();
  }
  return baseQuery;
}

router.get('/', async (req, res) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'GNews API key not configured' });
    }

    const { q, category, limit } = req.query;
    const searchQuery = buildSearchQuery(q, category);
    const maxResults = Math.max(1, Math.min(Number(limit) || MAX_RESULTS, MAX_RESULTS));

    const endpoint = new URL('https://gnews.io/api/v4/search');
    endpoint.searchParams.set('q', searchQuery);
    endpoint.searchParams.set('lang', 'en');
    endpoint.searchParams.set('max', maxResults.toString());
    endpoint.searchParams.set('token', apiKey);

    const gnewsResponse = await fetch(endpoint.toString());

    if (!gnewsResponse.ok) {
      const errorText = await gnewsResponse.text();
      const status = gnewsResponse.status;
      console.error('GNews fetch error:', status, errorText);

      let message = 'Failed to fetch news';
      if (status === 429) {
        message = 'GNews rate limit exceeded. Please try again later.';
      } else if (status >= 500) {
        message = 'GNews service is currently unavailable.';
      }
      return res.status(status).json({ message });
    }

    const data = await gnewsResponse.json();

    const normalizedArticles = (data.articles || []).map((article) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.image,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      source: {
        name: article.source?.name || 'GNews',
      },
    }));

    if (normalizedArticles.length === 0) {
      return res.json({
        status: 'ok',
        totalResults: 0,
        articles: [],
        message: 'No news articles found for the selected query.',
      });
    }

    return res.json({
      status: 'ok',
      totalResults: normalizedArticles.length,
      articles: normalizedArticles,
      query: searchQuery,
    });
  } catch (error) {
    console.error('Backend news error:', error);
    return res.status(500).json({ message: 'Unable to fetch news at this time' });
  }
});

module.exports = router;

