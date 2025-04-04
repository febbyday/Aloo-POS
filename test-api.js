const fetch = require('node-fetch');

async function testApi() {
  try {
    console.log('Testing API...');
    const response = await fetch('http://localhost:5000/api/v1/shops');
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();
