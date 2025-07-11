const axios = require('axios');

async function testApiLanguage() {
  try {
    console.log('Testing API language filtering...');
    
    // Test English articles
    console.log('\n1. Testing English articles (lang=en):');
    const englishResponse = await axios.get('http://localhost:5001/api/articles?lang=en');
    console.log(`Status: ${englishResponse.status}`);
    console.log(`Articles found: ${englishResponse.data.length}`);
    englishResponse.data.forEach((article, index) => {
      const title = article.title || article.titleUrdu || 'No title';
      console.log(`  ${index + 1}. ${title} (${article.language})`);
    });
    
    // Test Urdu articles
    console.log('\n2. Testing Urdu articles (lang=ur):');
    const urduResponse = await axios.get('http://localhost:5001/api/articles?lang=ur');
    console.log(`Status: ${urduResponse.status}`);
    console.log(`Articles found: ${urduResponse.data.length}`);
    urduResponse.data.forEach((article, index) => {
      const title = article.title || article.titleUrdu || 'No title';
      console.log(`  ${index + 1}. ${title} (${article.language})`);
    });
    
    // Test all articles without language filter
    console.log('\n3. Testing all articles (no lang filter):');
    const allResponse = await axios.get('http://localhost:5001/api/articles');
    console.log(`Status: ${allResponse.status}`);
    console.log(`Articles found: ${allResponse.data.length}`);
    allResponse.data.forEach((article, index) => {
      const title = article.title || article.titleUrdu || 'No title';
      console.log(`  ${index + 1}. ${title} (${article.language})`);
    });
    
  } catch (error) {
    console.error('Error testing API:', error.response?.data || error.message);
  }
}

testApiLanguage(); 