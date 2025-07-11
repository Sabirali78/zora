const mongoose = require('mongoose');
const Article = require('./models/Article');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bbc_news', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkDatabase() {
  try {
    console.log('Checking database...\n');
    
    // Get all articles
    const allArticles = await Article.find({});
    console.log(`Total articles in database: ${allArticles.length}\n`);
    
    if (allArticles.length === 0) {
      console.log('No articles found in database!');
      return;
    }
    
    // Check articles with English content
    const englishArticles = await Article.find({
      $or: [
        { title: { $exists: true, $ne: null, $ne: '' } },
        { summary: { $exists: true, $ne: null, $ne: '' } },
        { content: { $exists: true, $ne: null, $ne: '' } }
      ]
    });
    console.log(`Articles with English content: ${englishArticles.length}`);
    
    // Check articles with Urdu content
    const urduArticles = await Article.find({
      $or: [
        { titleUrdu: { $exists: true, $ne: null, $ne: '' } },
        { summaryUrdu: { $exists: true, $ne: null, $ne: '' } },
        { contentUrdu: { $exists: true, $ne: null, $ne: '' } }
      ]
    });
    console.log(`Articles with Urdu content: ${urduArticles.length}\n`);
    
    // Show sample articles
    console.log('Sample articles:');
    allArticles.slice(0, 3).forEach((article, index) => {
      console.log(`\nArticle ${index + 1}:`);
      console.log(`- ID: ${article._id}`);
      console.log(`- Title: ${article.title}`);
      console.log(`- Title Urdu: ${article.titleUrdu || 'N/A'}`);
      console.log(`- Summary: ${article.summary || 'N/A'}`);
      console.log(`- Summary Urdu: ${article.summaryUrdu || 'N/A'}`);
      console.log(`- Is Multi-Language: ${article.isMultiLanguage}`);
      console.log(`- Category: ${article.category}`);
    });
    
    // Test the language filtering queries
    console.log('\n=== Testing Language Filtering Queries ===');
    
    // Test English query
    const englishQuery = {
      $or: [
        { title: { $exists: true, $ne: null, $ne: '' } },
        { summary: { $exists: true, $ne: null, $ne: '' } },
        { content: { $exists: true, $ne: null, $ne: '' } }
      ]
    };
    const englishResults = await Article.find(englishQuery);
    console.log(`English query results: ${englishResults.length}`);
    
    // Test Urdu query
    const urduQuery = {
      $or: [
        { titleUrdu: { $exists: true, $ne: null, $ne: '' } },
        { summaryUrdu: { $exists: true, $ne: null, $ne: '' } },
        { contentUrdu: { $exists: true, $ne: null, $ne: '' } }
      ]
    };
    const urduResults = await Article.find(urduQuery);
    console.log(`Urdu query results: ${urduResults.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkDatabase(); 