const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  // English content
  title: {
    type: String,
    required: false,
    default: null
  },
  summary: { type: String },
  content: {
    type: String,
    required: false,
    default: null
  },

  // Urdu content
  titleUrdu: {
    type: String,
    required: false,
    default: null
  },
  summaryUrdu: { type: String },
  contentUrdu: {
    type: String,
    required: false,
    default: null
  },

  // Language indicator (which language this article is primarily in)
  language: { type: String, enum: ['en', 'ur'], default: 'en' },

  // Common fields
  category: { type: String, required: true }, // Topic-based: 'tech', 'health'
  region: { type: String },
  slug: { type: String }, // e.g., 'Asia', 'Europe', 'Global'
  country: { type: String }, // Optional: 'Pakistan', 'USA'
  type: { type: String, default: 'news' }, // e.g., 'opinion', 'Breaking', 'analysis'
  tags: [String],
  image: {
    url: String,
    public_id: String
  },
  author: { type: String, default: 'Admin' },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add text indexes for advanced search (both languages)
articleSchema.index({
  title: 'text',
  summary: 'text', 
  content: 'text',
  titleUrdu: 'text',
  summaryUrdu: 'text',
  contentUrdu: 'text',
  tags: 'text',
  category: 'text'
}, {
  weights: {
    title: 10,
    summary: 6,
    content: 3,
    titleUrdu: 10,
    summaryUrdu: 6,
    contentUrdu: 3,
    tags: 2,
    category: 1
  },
  name: 'search_index',
  default_language: 'none',
  language_override: 'textLanguage' // use a non-existent field so MongoDB never tries to override
});

// Add indexes for better performance
articleSchema.index({ language: 1, createdAt: -1 });
articleSchema.index({ category: 1, language: 1 });
articleSchema.index({ isFeatured: 1, isTrending: 1, createdAt: -1 });

// Update timestamps on save
articleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Article', articleSchema);
