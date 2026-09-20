const fetchDirect = require('./httpClient');
const browserClient = require('./zjjBrowserClient');
const { addTotalStatistics } = require('./dataProcessor');

const API_URL = 'https://fdc.zjj.sz.gov.cn/api/marketInfoShow/getYsfCjxxGsMonthDataNew';

// Direct HTTPS call (blocked by the JSL anti-bot challenge -> 412/400).
async function fetchNewHomesMonthDirect() {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SZ_House_Data_Fetcher/1.0'
    }
  };
  const response = await fetchDirect(API_URL, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetches the previous month's new home transaction data by district
 * @returns {Promise<Object>} The API response containing the data
 */
async function getNewHomesMonthData() {
  let data;
  try {
    data = await fetchNewHomesMonthDirect();
  } catch (error) {
    console.log(`Direct HTTPS fetch failed (${error.message}), falling back to real-browser fetch...`);
    data = await browserClient.fetchApi(API_URL, { _t: Date.now() });
  }
  // Add total statistics before returning
  return addTotalStatistics(data);
}

module.exports = { getNewHomesMonthData };