const axios = require('axios');

async function testUrduArticles() {
  try {
    console.log('Testing Urdu articles API...');
    
    const response = await axios.get('http://localhost:5001/api/articles?lang=ur');
    console.log(`Status: ${response.status}`);
    console.log(`Articles returned: ${response.data.length}`);
    
    response.data.forEach((article, index) => {
      console.log(`\nArticle ${index + 1}:`);
      console.log(`- ID: ${article._id}`);
      console.log(`- Language: ${article.language}`);
      console.log(`- Title: "${article.title}"`);
      console.log(`- TitleUrdu: "${article.titleUrdu}"`);
      console.log(`- Summary: "${article.summary}"`);
      console.log(`- SummaryUrdu: "${article.summaryUrdu}"`);
      console.log(`- Category: ${article.category}`);
      console.log(`- Type: ${article.type}`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testUrduArticles(); 