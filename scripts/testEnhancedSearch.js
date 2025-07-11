const mongoose = require('mongoose');
const Article = require('../models/Article');

// Use the same environment variable as the server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bbc_news';

async function testEnhancedSearch() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test cases
    const testCases = [
      { query: 'pak', description: 'Testing "pak" to find "Pakistan"' },
      { query: 'pakis', description: 'Testing "pakis" to find "Pakistan"' },
      { query: 'pakistn', description: 'Testing typo "pakistn" to find "Pakistan"' },
      { query: 'news', description: 'Testing "news" to find news articles' },
      { query: 'tech', description: 'Testing "tech" to find technology articles' },
      { query: 'sport', description: 'Testing "sport" to find sports articles' }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 ${testCase.description}`);
      console.log(`Query: "${testCase.query}"`);
      
      const searchTerm = testCase.query.trim();
      const useEnhancedSearch = searchTerm.length >= 3;
      
      let query = {};
      
      if (useEnhancedSearch) {
        // Enhanced regex search for better partial matching
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        query.$or = [
          // Title matches (highest weight) - multiple patterns
          { title: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } }, // Exact word match
          { title: { $regex: `\\b${escapedTerm}`, $options: 'i' } }, // Word starts with
          { title: { $regex: escapedTerm, $options: 'i' } }, // Contains anywhere
          { title: { $regex: searchTerm.split('').join('.*?'), $options: 'i' } }, // Fuzzy match
          
          // Summary matches
          { summary: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } },
          { summary: { $regex: `\\b${escapedTerm}`, $options: 'i' } },
          { summary: { $regex: escapedTerm, $options: 'i' } },
          { summary: { $regex: searchTerm.split('').join('.*?'), $options: 'i' } },
          
          // Content matches
          { content: { $regex: `\\b${escapedTerm}\\b`, $options: 'i' } },
          { content: { $regex: `\\b${escapedTerm}`, $options: 'i' } },
          { content: { $regex: escapedTerm, $options: 'i' } },
          { content: { $regex: searchTerm.split('').join('.*?'), $options: 'i' } },
          
          // Tags exact match
          { tags: { $regex: `^${escapedTerm}$`, $options: 'i' } },
          // Tags partial match
          { tags: { $regex: escapedTerm, $options: 'i' } },
          
          // Category exact match
          { category: { $regex: `^${escapedTerm}$`, $options: 'i' } },
          // Category partial match
          { category: { $regex: escapedTerm, $options: 'i' } }
        ];
      } else {
        // For short terms, try text search first
        try {
          query.$text = { $search: searchTerm };
        } catch (textSearchError) {
          console.warn('Text search failed, using regex fallback');
          const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.$or = [
            { title: { $regex: escapedTerm, $options: 'i' } },
            { summary: { $regex: escapedTerm, $options: 'i' } },
            { content: { $regex: escapedTerm, $options: 'i' } },
            { tags: { $regex: escapedTerm, $options: 'i' } },
            { category: { $regex: escapedTerm, $options: 'i' } }
          ];
        }
      }

      const results = await Article.find(query).limit(5).select('title summary category tags');
      
      console.log(`Found ${results.length} results:`);
      results.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title}`);
        console.log(`     Category: ${article.category}, Tags: ${article.tags.join(', ')}`);
      });
      
      if (results.length === 0) {
        console.log('  ❌ No results found');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testEnhancedSearch(); 