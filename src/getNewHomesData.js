const fetchDirect = require('./httpClient');
const browserClient = require('./zjjBrowserClient');
const { addTotalStatistics } = require('./dataProcessor');

const API_URL = 'https://fdc.zjj.sz.gov.cn/api/marketInfoShow/getYsfCjxxGsDataNew';

// Direct HTTPS call (blocked by the JSL anti-bot challenge -> 412/400).
async function fetchNewHomesDirect() {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0'
    }
  };
  const response = await fetchDirect(API_URL, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetches the previous day's new home transaction data by district
 * @returns {Promise<Object>} The API response containing the data
 */
async function getNewHomesData() {
  let data;
  try {
    data = await fetchNewHomesDirect();
  } catch (error) {
    console.log(`Direct HTTPS fetch failed (${error.message}), falling back to real-browser fetch...`);
    data = await browserClient.fetchApi(API_URL, { _t: Date.now() });
  }
  // Add total statistics before returning
  return addTotalStatistics(data);
}

module.exports = { getNewHomesData };