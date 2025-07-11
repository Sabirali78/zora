// Simple test to verify language filtering logic
console.log('Testing language filtering logic...\n');

// Mock article data
const mockArticles = [
  {
    _id: '1',
    title: 'English Article 1',
    summary: 'English summary 1',
    content: 'English content 1',
    titleUrdu: 'اردو مضمون 1',
    summaryUrdu: 'اردو خلاصہ 1',
    contentUrdu: 'اردو مواد 1',
    isMultiLanguage: true
  },
  {
    _id: '2',
    title: 'English Article 2',
    summary: 'English summary 2',
    content: 'English content 2',
    titleUrdu: null,
    summaryUrdu: '',
    contentUrdu: null,
    isMultiLanguage: false
  },
  {
    _id: '3',
    title: 'English Article 3',
    summary: 'English summary 3',
    content: 'English content 3',
    titleUrdu: 'اردو مضمون 3',
    summaryUrdu: 'اردو خلاصہ 3',
    contentUrdu: 'اردو مواد 3',
    isMultiLanguage: true
  }
];

// Test English filtering
console.log('=== Testing English Language Filtering ===');
const englishQuery = {
  $or: [
    { title: { $exists: true, $ne: null, $ne: '' } },
    { summary: { $exists: true, $ne: null, $ne: '' } },
    { content: { $exists: true, $ne: null, $ne: '' } }
  ]
};

const englishArticles = mockArticles.filter(article => {
  return (article.title && article.title !== '') ||
         (article.summary && article.summary !== '') ||
         (article.content && article.content !== '');
});

console.log(`English articles found: ${englishArticles.length}`);
englishArticles.forEach(article => {
  console.log(`- ${article.title}`);
});

// Test Urdu filtering
console.log('\n=== Testing Urdu Language Filtering ===');
const urduArticles = mockArticles.filter(article => {
  return (article.titleUrdu && article.titleUrdu !== '') ||
         (article.summaryUrdu && article.summaryUrdu !== '') ||
         (article.contentUrdu && article.contentUrdu !== '');
});

console.log(`Urdu articles found: ${urduArticles.length}`);
urduArticles.forEach(article => {
  console.log(`- ${article.titleUrdu || article.title}`);
});

// Test transformation logic
console.log('\n=== Testing Transformation Logic ===');

// English transformation
console.log('English transformation:');
englishArticles.forEach(article => {
  const transformed = { ...article };
  // Keep English content
  delete transformed.titleUrdu;
  delete transformed.summaryUrdu;
  delete transformed.contentUrdu;
  console.log(`- ${transformed.title}`);
});

// Urdu transformation
console.log('\nUrdu transformation:');
urduArticles.forEach(article => {
  const transformed = { ...article };
  // Use Urdu content if available, otherwise fallback to English
  transformed.title = article.titleUrdu || article.title;
  transformed.summary = article.summaryUrdu || article.summary;
  transformed.content = article.contentUrdu || article.content;
  delete transformed.titleUrdu;
  delete transformed.summaryUrdu;
  delete transformed.contentUrdu;
  console.log(`- ${transformed.title}`);
});

console.log('\nTest completed!'); 