const mongoose = require('mongoose');
const Article = require('./models/Article');

mongoose.connect('mongodb://localhost:27017/bbc_news', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testFiltering() {
  try {
    console.log('Testing article filtering logic...');
    
    // Get all articles
    const allArticles = await Article.find({});
    console.log(`\nTotal articles in database: ${allArticles.length}`);
    
    allArticles.forEach((article, index) => {
      console.log(`\nArticle ${index + 1}:`);
      console.log(`- ID: ${article._id}`);
      console.log(`- Language field: ${article.language}`);
      console.log(`- Title: "${article.title}"`);
      console.log(`- TitleUrdu: "${article.titleUrdu}"`);
      console.log(`- Summary: "${article.summary}"`);
      console.log(`- SummaryUrdu: "${article.summaryUrdu}"`);
      console.log(`- Content: "${article.content}"`);
      console.log(`- ContentUrdu: "${article.contentUrdu}"`);
    });
    
    // Test English filtering
    console.log('\n=== Testing English filtering ===');
    const englishQuery = {
      $or: [
        { title: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
        { summary: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
        { content: { $exists: true, $ne: null, $ne: '', $ne: 'none' } }
      ]
    };
    
    const englishArticles = await Article.find(englishQuery);
    console.log(`English articles found: ${englishArticles.length}`);
    englishArticles.forEach(article => {
      console.log(`- ${article.title || article.titleUrdu || 'No title'}`);
    });
    
    // Test Urdu filtering
    console.log('\n=== Testing Urdu filtering ===');
    const urduQuery = {
      $or: [
        { titleUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
        { summaryUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
        { contentUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } }
      ]
    };
    
    const urduArticles = await Article.find(urduQuery);
    console.log(`Urdu articles found: ${urduArticles.length}`);
    urduArticles.forEach(article => {
      console.log(`- ${article.titleUrdu || article.title || 'No title'}`);
    });
    
  } catch (error) {
    console.error('Error testing filtering:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

testFiltering(); 