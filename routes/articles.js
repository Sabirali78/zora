const express = require('express');
const router = express.Router();
const cloudinary = require('../utils/cloudinary'); // Modified import
const Article = require('../models/Article');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const { authenticateToken, requireAdminOrModerator } = require('../middleware/auth');

// Helper function to process tags
const processTags = (tags) => {
  return typeof tags === 'string' 
    ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    : tags || [];
};

// Update the GET endpoint to properly filter by category and support language
router.get('/', async (req, res) => {
  try {
    const { category, lang = 'en' } = req.query;
    const query = {};
    
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') }; // Exact match, case insensitive
    }

    // Add language filtering based on content availability
    if (lang === 'ur') {
      // For Urdu: only show articles that have ALL Urdu fields and language is 'ur'
      Object.assign(query, {
        language: 'ur',
        $and: [
          { titleUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
          { summaryUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
          { contentUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } }
        ]
      });
    } else {
      // For English: only show articles that have English content
      query.$or = [
        { title: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
        { summary: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
        { content: { $exists: true, $ne: null, $ne: '', $ne: 'none' } }
      ];
    }

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .exec();
      
    res.json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ message: 'Server error while fetching articles' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.status(200).json({ message: "Articles API is working!" });
});

// Advanced Search using MongoDB $text search with enhanced fallback
// IMPORTANT: This route must come BEFORE /:id route to avoid conflicts
router.get('/search', async (req, res) => {
  try {
    const { q, category, type, region, country, limit = 20, page = 1, mode, lang = 'en' } = req.query;
    const query = {};
    const searchTerm = q ? q.trim() : '';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const useStrictMode = mode === 'strict';

    // Build search query
    if (searchTerm) {
      if (useStrictMode) {
        // Strict mode: Only search in title and summary with exact word matching
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        if (lang === 'ur') {
          // Search in Urdu content
          query.$or = [
            { titleUrdu: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } },
            { summaryUrdu: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } }
          ];
        } else {
          // Search in English content
          query.$or = [
            { title: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } },
            { summary: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } }
          ];
        }
      } else {
        // Enhanced regex search for better partial matching
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        if (lang === 'ur') {
          // Enhanced search in Urdu content
          query.$or = [
            { titleUrdu: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } },
            { titleUrdu: { $regex: `\\b${escapedTerm}`, $options: 'i' } },
            { titleUrdu: { $regex: escapedTerm, $options: 'i' } },
            { summaryUrdu: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } },
            { summaryUrdu: { $regex: `\\b${escapedTerm}`, $options: 'i' } },
            { summaryUrdu: { $regex: escapedTerm, $options: 'i' } },
            { contentUrdu: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } },
            { contentUrdu: { $regex: `\\b${escapedTerm}`, $options: 'i' } },
            { contentUrdu: { $regex: escapedTerm, $options: 'i' } }
          ];
        } else {
          // Enhanced search in English content
          query.$or = [
            { title: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } },
            { title: { $regex: `\\b${escapedTerm}`, $options: 'i' } },
            { title: { $regex: escapedTerm, $options: 'i' } },
            { summary: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } },
            { summary: { $regex: `\\b${escapedTerm}`, $options: 'i' } },
            { summary: { $regex: escapedTerm, $options: 'i' } },
            { content: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } },
            { content: { $regex: `\\b${escapedTerm}`, $options: 'i' } },
            { content: { $regex: escapedTerm, $options: 'i' } }
          ];
        }
        
        // Add tags and category search for both languages
        query.$or.push(
          { tags: { $regex: `^${escapedTerm}$`, $options: 'i' } },
          { tags: { $regex: escapedTerm, $options: 'i' } },
          { category: { $regex: `^${escapedTerm}$`, $options: 'i' } },
          { category: { $regex: escapedTerm, $options: 'i' } }
        );
      }
    }
    
    // Add filters
    if (category) query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    if (type) query.type = { $regex: new RegExp(`^${type}$`, 'i') };
    if (region) query.region = { $regex: new RegExp(region, 'i') };
    if (country) query.country = { $regex: new RegExp(country, 'i') };

    // Add language filtering based on content availability
    if (lang === 'ur') {
      // For Urdu: only show articles that have ALL Urdu fields and language is 'ur'
      const urduContentQuery = {
        language: 'ur',
        $and: [
          { titleUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
          { summaryUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
          { contentUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } }
        ]
      };
      // Combine with existing query
      if (Object.keys(query).length > 0) {
        const existingQuery = { ...query };
        query = {
          $and: [urduContentQuery, existingQuery]
        };
      } else {
        Object.assign(query, urduContentQuery);
      }
    } else {
      // For English: only show articles that have English content
      const englishContentQuery = {
        $or: [
          { title: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
          { summary: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
          { content: { $exists: true, $ne: null, $ne: '', $ne: 'none' } }
        ]
      };
      // Combine with existing query
      if (Object.keys(query).length > 0) {
        const existingQuery = { ...query };
        query = {
          $and: [englishContentQuery, existingQuery]
        };
      } else {
        Object.assign(query, englishContentQuery);
      }
    }

    let articles, total;

    if (searchTerm && query.$text) {
      // Use aggregation pipeline for text search
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            // Calculate relevance score
            relevanceScore: {
              $add: [
                { $ifNull: [{ $meta: 'textScore' }, 0] },
                { $cond: [{ $eq: ['$isFeatured', true] }, 2, 0] },
                { $cond: [{ $eq: ['$isTrending', true] }, 1, 0] },
                // Boost recent articles slightly
                { $multiply: [{ $divide: [{ $subtract: [new Date(), '$createdAt'] }, 86400000] }, -0.01] }
              ]
            },
            // Highlight matches for frontend
            matches: searchTerm ? {
              $cond: {
                if: { $gt: [{ $meta: 'textScore' }, 0] },
                then: ['text_match'],
                else: []
              }
            } : []
          }
        },
        { $sort: { relevanceScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $project: {
            _id: 1,
            title: 1,
            summary: 1,
            content: 1,
            category: 1,
            region: 1,
            slug: 1,
            country: 1,
            type: 1,
            tags: 1,
            image: 1,
            author: 1,
            isFeatured: 1,
            isTrending: 1,
            createdAt: 1,
            updatedAt: 1,
            relevanceScore: 1,
            matches: 1
          }
        }
      ];

      // Get total count for pagination
      const countPipeline = [
        { $match: query },
        { $count: 'total' }
      ];

      const [articlesResult, countResult] = await Promise.all([
        Article.aggregate(pipeline),
        Article.aggregate(countPipeline)
      ]);

      articles = articlesResult;
      total = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      // Enhanced fallback search with better scoring
      const [articlesResult, totalResult] = await Promise.all([
        Article.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Article.countDocuments(query)
      ]);

      // Enhanced scoring for fallback search
      articles = articlesResult.map(article => {
        let score = 0;
        let matches = [];
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        if (searchTerm) {
          if (useStrictMode) {
            // Strict mode: Only score title and summary exact matches
            if (article.title && new RegExp(`\\b${escapedTerm}\\b`, 'i').test(article.title)) {
              score += 10;
              matches.push('title_exact');
            }
            
            if (article.summary && new RegExp(`\\b${escapedTerm}\\b`, 'i').test(article.summary)) {
              score += 8;
              matches.push('summary_exact');
            }
          } else {
            // Enhanced scoring for non-strict mode
            // Title scoring
            if (article.title) {
              if (new RegExp(`\\b${escapedTerm}\\b`, 'i').test(article.title)) {
                score += 10;
                matches.push('title_exact');
              } else if (new RegExp(`\\b${escapedTerm}`, 'i').test(article.title)) {
                score += 8;
                matches.push('title_starts');
              } else if (new RegExp(escapedTerm, 'i').test(article.title)) {
                score += 6;
                matches.push('title_contains');
              }
            }
            
            // Summary scoring
            if (article.summary) {
              if (new RegExp(`\\b${escapedTerm}\\b`, 'i').test(article.summary)) {
                score += 6;
                matches.push('summary_exact');
              } else if (new RegExp(`\\b${escapedTerm}`, 'i').test(article.summary)) {
                score += 4;
                matches.push('summary_starts');
              } else if (new RegExp(escapedTerm, 'i').test(article.summary)) {
                score += 3;
                matches.push('summary_contains');
              }
            }
            
            // Content scoring
            if (article.content) {
              if (new RegExp(`\\b${escapedTerm}\\b`, 'i').test(article.content)) {
                score += 3;
                matches.push('content_exact');
              } else if (new RegExp(`\\b${escapedTerm}`, 'i').test(article.content)) {
                score += 2;
                matches.push('content_starts');
              } else if (new RegExp(escapedTerm, 'i').test(article.content)) {
                score += 1;
                matches.push('content_contains');
              }
            }
            
            // Tags scoring
            if (article.tags && article.tags.length > 0) {
              const tagMatch = article.tags.some(tag => 
                new RegExp(`^${escapedTerm}$`, 'i').test(tag) ||
                new RegExp(escapedTerm, 'i').test(tag)
              );
              if (tagMatch) {
                score += 2;
                matches.push('tags');
              }
            }
            
            // Category scoring
            if (article.category) {
              if (new RegExp(`^${escapedTerm}$`, 'i').test(article.category)) {
                score += 1;
                matches.push('category_exact');
              } else if (new RegExp(escapedTerm, 'i').test(article.category)) {
                score += 0.5;
                matches.push('category_contains');
              }
            }
          }
        }
        
        // Boost for featured/trending
        if (article.isFeatured) score += 2;
        if (article.isTrending) score += 1;
        
        return {
          ...article,
          relevanceScore: score,
          matches: matches.length > 0 ? matches : ['fallback_match']
        };
      });
      
      // Sort by relevance score
      articles.sort((a, b) => b.relevanceScore - a.relevanceScore || new Date(b.createdAt) - new Date(a.createdAt));
      total = totalResult;
    }

    // Transform articles based on language
    const transformedArticles = articles.map(article => {
      const transformed = { ...article };
      
      if (lang === 'ur') {
        // Use Urdu content if available, otherwise fallback to English
        transformed.title = article.titleUrdu || article.title;
        transformed.summary = article.summaryUrdu || article.summary;
        transformed.content = article.contentUrdu || article.content;
      }
      // For English (lang === 'en'), keep the original English content
      
      // Remove Urdu fields from response to keep it clean
      delete transformed.titleUrdu;
      delete transformed.summaryUrdu;
      delete transformed.contentUrdu;
      
      return transformed;
    });

    res.json({
      articles: transformedArticles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + articles.length < total,
        hasPrev: parseInt(page) > 1,
        totalResults: total
      }
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error while searching articles' });
  }
});

// Get articles by category
router.get('/category/:category', async (req, res) => {
  try {
    const articles = await Article.find({ 
      category: req.params.category 
    }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single article by ID (default)
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    console.error('Error fetching article:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.status(500).json({ message: 'Server error while fetching article' });
  }
});

// Get single article by slug (for sharing)
router.get('/slug/:slug', async (req, res) => {
  try {
    // Try exact match first
    let article = await Article.findOne({ slug: req.params.slug });
    // If not found, try case-insensitive match
    if (!article) {
      article = await Article.findOne({ slug: { $regex: `^${req.params.slug}$`, $options: 'i' } });
    }
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    console.error('Error fetching article by slug:', err);
    res.status(500).json({ message: 'Server error while fetching article by slug' });
  }
});

// Create article with image upload
router.post('/', [authenticateToken, requireAdminOrModerator], async (req, res) => {
  try {
    const { title, content, titleUrdu, contentUrdu, language } = req.body;

    // Validate required fields based on language
    if (language === 'ur') {
      if (!titleUrdu || !contentUrdu) {
        return res.status(400).json({ message: 'Urdu title and content are required' });
      }
    } else {
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }
    }

    const articleData = {
      title: req.body.title,
      summary: req.body.summary,
      content: req.body.content,
      titleUrdu: req.body.titleUrdu,
      summaryUrdu: req.body.summaryUrdu,
      contentUrdu: req.body.contentUrdu,
      language: req.body.language || 'en',
      category: req.body.category || 'news',
      region: req.body.region,
     slug: req.body.slug,
      country: req.body.country,
      type: req.body.type || 'news',
      tags: processTags(req.body.tags),
      author: req.body.author || 'Admin',
      isFeatured: req.body.isFeatured === 'true',
      isTrending: req.body.isTrending === 'true'
    };

    // Handle file upload if exists
    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'bbc-articles'
      });
      articleData.image = {
        url: result.secure_url,
        public_id: result.public_id
      };
      await unlinkFile(req.files.image.tempFilePath); // Clean up temp file
    }

    const newArticle = new Article(articleData);
    await newArticle.save();
    
    res.status(201).json(newArticle);
  } catch (err) {
    console.error('Error creating article:', err);
    
    // Clean up uploaded image if there was an error
    if (req.files?.image) {
      try {
        await unlinkFile(req.files.image.tempFilePath);
      } catch (cleanupErr) {
        console.error('Error cleaning up temp file:', cleanupErr);
      }
    }
    
    res.status(400).json({ 
      message: err.message.includes('validation failed') 
        ? 'Validation error: ' + err.message 
        : 'Error creating article'
    });
  }
});

// Update article with optional image update
router.put('/:id', [authenticateToken, requireAdminOrModerator], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Store old image data for cleanup if needed
    const oldImage = article.image;

    // Update article data
    article.title = req.body.title || article.title;
    article.summary = req.body.summary || article.summary;
    article.content = req.body.content || article.content;
    article.titleUrdu = req.body.titleUrdu || article.titleUrdu;
    article.summaryUrdu = req.body.summaryUrdu || article.summaryUrdu;
    article.contentUrdu = req.body.contentUrdu || article.contentUrdu;
    article.language = req.body.language || article.language;
    article.category = req.body.category || article.category;
    article.region = req.body.region || article.region;
    article.slug = req.body.slug || article.slug;
    article.country = req.body.country || article.country;
    article.type = req.body.type || article.type;
    article.tags = req.body.tags ? processTags(req.body.tags) : article.tags;
    article.isFeatured = req.body.isFeatured !== undefined 
      ? req.body.isFeatured === 'true' 
      : article.isFeatured;
    article.isTrending = req.body.isTrending !== undefined 
      ? req.body.isTrending === 'true' 
      : article.isTrending;

    // Handle image update
    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'bbc-articles'
      });
      
      // Delete old image if it exists
      if (oldImage && oldImage.public_id) {
        try {
          await cloudinary.uploader.destroy(oldImage.public_id);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      
      // Set new image
      article.image = {
        url: result.secure_url,
        public_id: result.public_id
      };
      await unlinkFile(req.files.image.tempFilePath); // Clean up temp file
    }

    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (err) {
    console.error('Error updating article:', err);
    
    // Clean up new image if there was an error
    if (req.files?.image) {
      try {
        await unlinkFile(req.files.image.tempFilePath);
      } catch (cleanupErr) {
        console.error('Error cleaning up temp file:', cleanupErr);
      }
    }
    
    res.status(400).json({ 
      message: err.message.includes('validation failed') 
        ? 'Validation error: ' + err.message 
        : 'Error updating article'
    });
  }
});

// Delete article
router.delete('/:id', [authenticateToken, requireAdminOrModerator], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Delete associated image if it exists
    if (article.image && article.image.public_id) {
      try {
        await cloudinary.uploader.destroy(article.image.public_id);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }

    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err);
    res.status(500).json({ message: 'Server error while deleting article' });
  }
});

// GET /type/:type - Get articles by type (for trending type pages)
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { lang = 'en' } = req.query;
    const query = { type: { $regex: new RegExp(`^${type}$`, 'i') } };

    if (lang === 'ur') {
      Object.assign(query, {
        language: 'ur',
        $and: [
          { titleUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
          { summaryUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
          { contentUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } }
        ]
      });
    } else {
      query.$or = [
        { title: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
        { summary: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
        { content: { $exists: true, $ne: null, $ne: '', $ne: 'none' } }
      ];
    }

    const articles = await Article.find(query).sort({ createdAt: -1 }).exec();
    res.json(articles);
  } catch (err) {
    console.error('Error fetching articles by type:', err);
    res.status(500).json({ message: 'Server error while fetching articles by type' });
  }
});

module.exports = router;