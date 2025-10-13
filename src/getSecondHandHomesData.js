const https = require('https');
const { addTotalStatistics } = require('./dataProcessor');

/**
 * Fetches the previous day's second-hand home transaction data by district
 * @returns {Promise<Object>} The API response containing the data
 */
async function getSecondHandHomesData() {
  return new Promise((resolve, reject) => {
    const url = 'https://zjj.sz.gov.cn:8004/api/marketInfoShow/getEsfCjxxGsDataNew';
    
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
          // Add total statistics before resolving
          const responseWithTotals = addTotalStatistics(response);
          resolve(responseWithTotals);
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

module.exports = { getSecondHandHomesData };