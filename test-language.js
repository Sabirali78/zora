const mongoose = require('mongoose');
const Article = require('./models/Article');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bbc_news', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testLanguageFiltering() {
  try {
    console.log('Testing language filtering...\n');
    
    // Get all articles
    const allArticles = await Article.find({});
    console.log(`Total articles in database: ${allArticles.length}\n`);
    
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
    console.log(`Articles with Urdu content: ${urduArticles.length}`);
    
    // Check articles with any content (for Urdu language mode)
    const anyContentArticles = await Article.find({
      $or: [
        { title: { $exists: true, $ne: null, $ne: '' } },
        { summary: { $exists: true, $ne: null, $ne: '' } },
        { content: { $exists: true, $ne: null, $ne: '' } },
        { titleUrdu: { $exists: true, $ne: null, $ne: '' } },
        { summaryUrdu: { $exists: true, $ne: null, $ne: '' } },
        { contentUrdu: { $exists: true, $ne: null, $ne: '' } }
      ]
    });
    console.log(`Articles with any content: ${anyContentArticles.length}\n`);
    
    // Show sample articles
    console.log('Sample articles:');
    allArticles.slice(0, 3).forEach((article, index) => {
      console.log(`\nArticle ${index + 1}:`);
      console.log(`- Title: ${article.title}`);
      console.log(`- Title Urdu: ${article.titleUrdu || 'N/A'}`);
      console.log(`- Summary: ${article.summary || 'N/A'}`);
      console.log(`- Summary Urdu: ${article.summaryUrdu || 'N/A'}`);
      console.log(`- Is Multi-Language: ${article.isMultiLanguage}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testLanguageFiltering(); 