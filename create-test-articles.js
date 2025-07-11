const mongoose = require('mongoose');
const Article = require('./models/Article');

mongoose.connect('mongodb://localhost:27017/bbc_news', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createTestArticles() {
  try {
    console.log('Creating test articles with new model...');
    
    // Clear existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles');
    
    // Create English articles
    const englishArticles = [
      {
        title: 'New Technology Breakthrough',
        summary: 'Scientists discover revolutionary new technology that could change the world.',
        content: 'A team of researchers has made a groundbreaking discovery in the field of quantum computing. This new technology promises to revolutionize how we process information and solve complex problems.',
        language: 'en',
        category: 'tech',
        type: 'news',
        author: 'Admin',
        isFeatured: true
      },
      {
        title: 'Health Benefits of Exercise',
        summary: 'New study shows the importance of regular physical activity for overall health.',
        content: 'Recent research has confirmed that regular exercise provides numerous health benefits including improved cardiovascular health, better mental well-being, and increased longevity.',
        language: 'en',
        category: 'health',
        type: 'analysis',
        author: 'Admin'
      }
    ];
    
    // Create Urdu articles
    const urduArticles = [
      {
        title: 'ٹیکنالوجی میں نئی پیش رفت',
        summary: 'سائنسدانوں نے دنیا کو تبدیل کرنے والی انقلابی نئی ٹیکنالوجی دریافت کی۔',
        content: 'محققین کی ایک ٹیم نے کوانٹم کمپیوٹنگ کے میدان میں ایک تاریخی دریافت کی ہے۔ یہ نئی ٹیکنالوجی وعدہ کرتی ہے کہ ہم معلومات کو کیسے پروسیس کرتے ہیں اور پیچیدہ مسائل کو حل کرتے ہیں۔',
        language: 'ur',
        category: 'tech',
        type: 'news',
        author: 'Admin',
        isFeatured: true
      },
      {
        title: 'ورزش کے صحت کے فوائد',
        summary: 'نئی تحقیق سے ظاہر ہوتا ہے کہ مجموعی صحت کے لیے باقاعدہ جسمانی سرگرمی کی اہمیت۔',
        content: 'حالیہ تحقیق نے تصدیق کی ہے کہ باقاعدہ ورزش بہت سے صحت کے فوائد فراہم کرتی ہے جن میں بہتر قلبی صحت، بہتر ذہنی تندرستی، اور بڑھتی ہوئی عمر شامل ہیں۔',
        language: 'ur',
        category: 'health',
        type: 'analysis',
        author: 'Admin'
      }
    ];
    
    // Save all articles
    const allArticles = [...englishArticles, ...urduArticles];
    const savedArticles = await Article.insertMany(allArticles);
    
    console.log(`Created ${savedArticles.length} test articles:`);
    savedArticles.forEach(article => {
      console.log(`- ${article.language.toUpperCase()}: ${article.title}`);
    });
    
    console.log('\nTest articles created successfully!');
    console.log('You can now test the website with these articles.');
    
  } catch (error) {
    console.error('Error creating test articles:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createTestArticles(); 