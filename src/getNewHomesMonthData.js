const browserClient = require('./zjjBrowserClient');
const { addTotalStatistics } = require('./dataProcessor');

const API_URL = 'https://fdc.zjj.sz.gov.cn/api/marketInfoShow/getYsfCjxxGsMonthDataNew';

/**
 * Fetches the previous month's new home transaction data by district
 * (via real Chrome — direct HTTPS is 100% blocked by the JSL anti-bot).
 * @returns {Promise<Object>} The API response containing the data
 */
async function getNewHomesMonthData() {
  const data = await browserClient.fetchApi(API_URL, { _t: Date.now() });
  // Add total statistics before returning
  return addTotalStatistics(data);
}

module.exports = { getNewHomesMonthData };