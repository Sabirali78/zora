const mongoose = require('mongoose');
const Article = require('./models/Article');

mongoose.connect('mongodb://localhost:27017/bbc_news', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixArticleLanguage() {
  try {
    console.log('Fixing article language fields...');
    
    // Get all articles
    const articles = await Article.find({});
    console.log(`Found ${articles.length} articles to check`);
    
    let updatedCount = 0;
    
    for (const article of articles) {
      let needsUpdate = false;
      let newLanguage = article.language;
      
      // Check if article has Urdu content
      const hasUrduContent = (article.titleUrdu && article.titleUrdu !== 'none' && article.titleUrdu.trim() !== '') ||
                            (article.summaryUrdu && article.summaryUrdu !== 'none' && article.summaryUrdu.trim() !== '') ||
                            (article.contentUrdu && article.contentUrdu !== 'none' && article.contentUrdu.trim() !== '');
      
      // Check if article has English content
      const hasEnglishContent = (article.title && article.title !== 'none' && article.title.trim() !== '') ||
                               (article.summary && article.summary !== 'none' && article.summary.trim() !== '') ||
                               (article.content && article.content !== 'none' && article.content.trim() !== '');
      
      // Determine the correct language
      if (hasUrduContent && !hasEnglishContent) {
        if (article.language !== 'ur') {
          newLanguage = 'ur';
          needsUpdate = true;
        }
      } else if (hasEnglishContent && !hasUrduContent) {
        if (article.language !== 'en') {
          newLanguage = 'en';
          needsUpdate = true;
        }
      } else if (hasUrduContent && hasEnglishContent) {
        // If both languages exist, keep the current language but log it
        console.log(`Article "${article.title || article.titleUrdu}" has content in both languages`);
      }
      
      // Update if needed
      if (needsUpdate) {
        await Article.findByIdAndUpdate(article._id, { language: newLanguage });
        console.log(`Updated article "${article.title || article.titleUrdu}" language from ${article.language} to ${newLanguage}`);
        updatedCount++;
      }
    }
    
    console.log(`\nFixed ${updatedCount} articles`);
    
    // Show summary of articles by language
    const urduArticles = await Article.find({ language: 'ur' });
    const englishArticles = await Article.find({ language: 'en' });
    
    console.log(`\nSummary:`);
    console.log(`- Urdu articles: ${urduArticles.length}`);
    console.log(`- English articles: ${englishArticles.length}`);
    
    // Show articles with Urdu content regardless of language field
    const articlesWithUrduContent = await Article.find({
      $or: [
        { titleUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
        { summaryUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } },
        { contentUrdu: { $exists: true, $ne: null, $ne: '', $ne: 'none' } }
      ]
    });
    
    console.log(`- Articles with Urdu content: ${articlesWithUrduContent.length}`);
    
  } catch (error) {
    console.error('Error fixing article language:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

fixArticleLanguage(); 