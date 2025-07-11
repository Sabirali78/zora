const mongoose = require('mongoose');
const Article = require('./models/Article');

mongoose.connect('mongodb://localhost:27017/bbc_news', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkDatabase() {
  try {
    console.log('Checking database...');
    
    const articles = await Article.find({});
    console.log(`Total articles: ${articles.length}`);
    
    articles.forEach((article, index) => {
      console.log(`\nArticle ${index + 1}:`);
      console.log(`- Title: ${article.title}`);
      console.log(`- Language: ${article.language || 'NOT SET'}`);
      console.log(`- Category: ${article.category}`);
      console.log(`- Has Urdu fields: ${!!(article.titleUrdu || article.summaryUrdu || article.contentUrdu)}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkDatabase(); 