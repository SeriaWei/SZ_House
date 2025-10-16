const { addTotalStatistics } = require('./dataProcessor');

/**
 * Fetches the previous month's second-hand home transaction data by district
 * @returns {Promise<Object>} The API response containing the data
 */
async function getSecondHandHomesMonthData() {
  const url = 'https://zjj.sz.gov.cn:8004/api/marketInfoShow/getEsfCjxxGsMonthDataNew';
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SZ_House_Data_Fetcher/1.0'
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

module.exports = { getSecondHandHomesMonthData };