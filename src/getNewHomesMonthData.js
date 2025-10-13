const https = require('https');
const { addTotalStatistics } = require('./dataProcessor');

/**
 * Fetches the previous month's new home transaction data by district
 * @returns {Promise<Object>} The API response containing the data
 */
async function getNewHomesMonthData() {
  return new Promise((resolve, reject) => {
    const url = 'https://zjj.sz.gov.cn:8004/api/marketInfoShow/getYsfCjxxGsMonthDataNew';
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SZ_House_Data_Fetcher/1.0'
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

module.exports = { getNewHomesMonthData };