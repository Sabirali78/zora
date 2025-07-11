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

async function buildIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Using connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    console.log('Building text indexes...');
    
    // Drop existing text indexes if they exist
    try {
      await Article.collection.dropIndex('search_index');
      console.log('Dropped existing search index');
    } catch (error) {
      console.log('No existing search index to drop');
    }

    // Create text index
    await Article.collection.createIndex({
      title: 'text',
      summary: 'text',
      content: 'text',
      tags: 'text',
      category: 'text'
    }, {
      weights: {
        title: 10,
        summary: 6,
        content: 3,
        tags: 2,
        category: 1
      },
      name: 'search_index'
    });
    console.log('Created text search index');

    // Create compound indexes for filtering
    await Article.collection.createIndex({ category: 1, createdAt: -1 });
    await Article.collection.createIndex({ type: 1, createdAt: -1 });
    await Article.collection.createIndex({ region: 1, createdAt: -1 });
    await Article.collection.createIndex({ isFeatured: 1, isTrending: 1, createdAt: -1 });
    console.log('Created compound indexes for filtering');

    // List all indexes
    const indexes = await Article.collection.getIndexes();
    console.log('\nAll indexes created:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`- ${indexName}:`, indexes[indexName]);
    });

    console.log('\n✅ Indexes built successfully!');
    console.log('Your search functionality is now optimized with MongoDB text search.');

  } catch (error) {
    console.error('Error building indexes:', error);
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure MongoDB is running');
      console.log('2. Check your MONGO_URI in .env file');
      console.log('3. Verify the connection string format');
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
buildIndexes(); 