const mongoose = require('mongoose');
const Article = require('./models/Article');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bbc_news', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testNewModel() {
  try {
    console.log('Testing new article model...');
    
    // Get all articles
    const allArticles = await Article.find({});
    console.log(`\nTotal articles in database: ${allArticles.length}`);
    
    // Check articles by language
    const englishArticles = await Article.find({ language: 'en' });
    const urduArticles = await Article.find({ language: 'ur' });
    
    console.log(`\nEnglish articles: ${englishArticles.length}`);
    console.log(`Urdu articles: ${urduArticles.length}`);
    
    // Show sample articles
    if (englishArticles.length > 0) {
      console.log('\nSample English article:');
      const sampleEn = englishArticles[0];
      console.log(`- Title: ${sampleEn.title}`);
      console.log(`- Language: ${sampleEn.language}`);
      console.log(`- Category: ${sampleEn.category}`);
    }
    
    if (urduArticles.length > 0) {
      console.log('\nSample Urdu article:');
      const sampleUr = urduArticles[0];
      console.log(`- Title: ${sampleUr.title}`);
      console.log(`- Language: ${sampleUr.language}`);
      console.log(`- Category: ${sampleUr.category}`);
    }
    
    // Test API endpoints
    console.log('\nTesting API endpoints...');
    
    // Test English articles endpoint
    const enResponse = await fetch('http://localhost:5000/api/articles?lang=en');
    const enArticles = await enResponse.json();
    console.log(`API English articles: ${enArticles.length}`);
    
    // Test Urdu articles endpoint
    const urResponse = await fetch('http://localhost:5000/api/articles?lang=ur');
    const urArticles = await urResponse.json();
    console.log(`API Urdu articles: ${urArticles.length}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run test
testNewModel(); 