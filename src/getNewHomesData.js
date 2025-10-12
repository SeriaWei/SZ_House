const https = require('https');

/**
 * Fetches the previous day's new home transaction data by district
 * @returns {Promise<Object>} The API response containing the data
 */
async function getNewHomesData() {
  return new Promise((resolve, reject) => {
    const url = 'https://zjj.sz.gov.cn:8004/api/marketInfoShow/getYsfCjxxGsDataNew';
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

module.exports = { getNewHomesData };