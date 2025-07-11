const mongoose = require('mongoose');
const Article = require('../models/Article');

// Load environment variables
require('dotenv').config();

// Use the same MongoDB connection string as the main server
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI environment variable is required');
  console.log('Please check your .env file and ensure MONGO_URI is set');
  process.exit(1);
}

async function testSearch() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Using connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Test 1: Check if indexes exist
    console.log('\n🔍 Checking indexes...');
    const indexes = await Article.collection.getIndexes();
    const textIndexes = Object.keys(indexes).filter(name => 
      indexes[name].key && Object.values(indexes[name].key).includes('text')
    );
    
    if (textIndexes.length > 0) {
      console.log('✅ Text indexes found:', textIndexes);
    } else {
      console.log('❌ No text indexes found. Run "npm run build-indexes" first.');
      return;
    }

    // Test 2: Check if we have articles
    console.log('\n📰 Checking articles...');
    const totalArticles = await Article.countDocuments();
    console.log(`Total articles in database: ${totalArticles}`);

    if (totalArticles === 0) {
      console.log('❌ No articles found. Add some articles first.');
      return;
    }

    // Test 3: Test basic search
    console.log('\n🔎 Testing basic search...');
    const searchResults = await Article.aggregate([
      { $text: { $search: 'technology' } },
      { $limit: 3 },
      {
        $project: {
          title: 1,
          category: 1,
          relevanceScore: { $meta: 'textScore' }
        }
      }
    ]);

    console.log(`Found ${searchResults.length} results for "technology":`);
    searchResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.title} (${result.category}) - Score: ${result.relevanceScore}`);
    });

    // Test 4: Test search with filters
    console.log('\n🔎 Testing search with filters...');
    const filteredResults = await Article.aggregate([
      { $text: { $search: 'news' } },
      { $match: { category: { $regex: /tech/i } } },
      { $limit: 3 },
      {
        $project: {
          title: 1,
          category: 1,
          relevanceScore: { $meta: 'textScore' }
        }
      }
    ]);

    console.log(`Found ${filteredResults.length} tech articles with "news":`);
    filteredResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.title} - Score: ${result.relevanceScore}`);
    });

    // Test 5: Test fallback search (without text search)
    console.log('\n🔎 Testing fallback search...');
    const fallbackResults = await Article.find({
      $or: [
        { title: { $regex: /test/i } },
        { summary: { $regex: /test/i } },
        { content: { $regex: /test/i } }
      ]
    }).limit(3).lean();

    console.log(`Found ${fallbackResults.length} results for "test" (fallback):`);
    fallbackResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.title} (${result.category})`);
    });

    console.log('\n✅ All search tests completed successfully!');
    console.log('\n🎉 Your search functionality is working correctly!');

  } catch (error) {
    console.error('❌ Error during search testing:', error);
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure MongoDB is running');
      console.log('2. Check your MONGO_URI in .env file');
      console.log('3. Verify the connection string format');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test
testSearch(); 