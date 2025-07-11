const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test English language
    console.log('=== Testing English Language (lang=en) ===');
    const englishResponse = await axios.get('http://localhost:5001/api/articles', {
      params: { lang: 'en' }
    });
    console.log(`English articles returned: ${englishResponse.data.length}`);
    if (englishResponse.data.length > 0) {
      console.log('Sample English article:');
      console.log(`- Title: ${englishResponse.data[0].title}`);
      console.log(`- Summary: ${englishResponse.data[0].summary?.substring(0, 50)}...`);
    }
    
    // Test Urdu language
    console.log('\n=== Testing Urdu Language (lang=ur) ===');
    const urduResponse = await axios.get('http://localhost:5001/api/articles', {
      params: { lang: 'ur' }
    });
    console.log(`Urdu articles returned: ${urduResponse.data.length}`);
    if (urduResponse.data.length > 0) {
      console.log('Sample Urdu article:');
      console.log(`- Title: ${urduResponse.data[0].title}`);
      console.log(`- Summary: ${urduResponse.data[0].summary?.substring(0, 50)}...`);
    }
    
    // Test default language (no lang parameter)
    console.log('\n=== Testing Default Language (no lang parameter) ===');
    const defaultResponse = await axios.get('http://localhost:5001/api/articles');
    console.log(`Default articles returned: ${defaultResponse.data.length}`);
    if (defaultResponse.data.length > 0) {
      console.log('Sample default article:');
      console.log(`- Title: ${defaultResponse.data[0].title}`);
      console.log(`- Summary: ${defaultResponse.data[0].summary?.substring(0, 50)}...`);
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI(); 