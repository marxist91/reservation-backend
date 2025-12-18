const https = require('https');

const options = {
  hostname: 'web-production-f6e83.up.railway.app',
  path: '/api/stats/overview?startDate=2025-12-01&endDate=2025-12-31',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data.substring(0, 500));
  });
});

req.on('error', e => console.error('Error:', e.message));
req.end();
