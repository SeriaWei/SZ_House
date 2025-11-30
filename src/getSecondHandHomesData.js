const { addTotalStatistics } = require('./dataProcessor');

/**
 * Fetches the previous day's second-hand home transaction data by district
 * @returns {Promise<Object>} The API response containing the data
 */
async function getSecondHandHomesData() {
  const url = 'https://fdc.zjj.sz.gov.cn/api/marketInfoShow/getEsfCjxxGsDataNew';
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0'
    }
  };

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Add total statistics before returning
    const responseWithTotals = addTotalStatistics(data);
    return responseWithTotals;
  } catch (error) {
    throw error;
  }
}

module.exports = { getSecondHandHomesData };