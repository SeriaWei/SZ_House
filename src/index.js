const { getNewHomesData } = require('./getNewHomesData');
const { getSecondHandHomesData } = require('./getSecondHandHomesData');
const { getNewHomesMonthData } = require('./getNewHomesMonthData');
const { getSecondHandHomesMonthData } = require('./getSecondHandHomesMonthData');
const { saveDataToFile } = require('./saveData');
const { getTrendingData } = require('./getTrendingData');

/**
 * Format date string to ensure month and day are zero-padded
 * @param {string} dateStr - Date string like "2025年9月12日" or "2025年9月"
 * @returns {string} - Formatted date string like "2025-09-12" or "2025-09"
 */
function formatDateString(dateStr) {
  return dateStr
    .replace(/年/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .replace(/-$/, '')
    .replace(/(\d+)-(\d+)(?:-(\d+))?/, (match, year, month, day) => {
      const formattedMonth = month.padStart(2, '0');
      if (day) {
        const formattedDay = day.padStart(2, '0');
        return `${year}-${formattedMonth}-${formattedDay}`;
      }
      return `${year}-${formattedMonth}`;
    });
}

/**
 * Get the previous month in the format YYYY-MM
 * @returns {string} - Previous month in the format YYYY-MM
 */
function getPreviousMonth() {
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(); // If current month is January, use previous year
  const month = now.getMonth() === 0 ? 12 : (now.getMonth()).toString().padStart(2, '0'); // If current month is January, use December of previous year
  return `${year}-${month}`;
}

/**
 * Main function to fetch and save real estate data
 */
async function fetchAndSaveRealEstateData() {
  // Fetch previous day data
  console.log('Fetching previous day second-hand home data...');
  const secondHandHomesResponse = await getSecondHandHomesData();
  
  if (secondHandHomesResponse.status === 1) {
    // Extract the date from the response
    const dateStr = formatDateString(secondHandHomesResponse.data.xmlDateDay);
    saveDataToFile(secondHandHomesResponse, 'second_hand_homes', dateStr);
  } else {
    throw new Error('Error fetching previous day second-hand homes data: ' + secondHandHomesResponse.msg);
  }

  console.log('Fetching previous day new home data...');
  const newHomesResponse = await getNewHomesData();
  
  if (newHomesResponse.status === 1) {
    // Extract the date from the response
    const dateStr = formatDateString(newHomesResponse.data.xmlDateDay);
    saveDataToFile(newHomesResponse, 'new_homes', dateStr);
  } else {
    throw new Error('Error fetching previous day new homes data: ' + newHomesResponse.msg);
  }

  // Fetch previous month data
  console.log('Fetching previous month second-hand home data...');
  const secondHandHomesMonthResponse = await getSecondHandHomesMonthData();
  
  if (secondHandHomesMonthResponse.status === 1) {
    // Extract the month from the response
    const monthStr = formatDateString(secondHandHomesMonthResponse.data.xmlDateMonth);
    saveDataToFile(secondHandHomesMonthResponse, 'second_hand_homes_month', monthStr);
  } else {
    throw new Error('Error fetching previous month second-hand homes data: ' + secondHandHomesMonthResponse.msg);
  }

  console.log('Fetching previous month new home data...');
  const newHomesMonthResponse = await getNewHomesMonthData();
  
  if (newHomesMonthResponse.status === 1) {
    // Extract the month from the response
    const monthStr = formatDateString(newHomesMonthResponse.data.xmlDateMonth);
    saveDataToFile(newHomesMonthResponse, 'new_homes_month', monthStr);
  } else {
    throw new Error('Error fetching previous month new homes data: ' + newHomesMonthResponse.msg);
  }

  // Fetch and update trending data for the previous month
  console.log('Fetching trending data for the previous month...');
  const prevMonth = getPreviousMonth();
  const [year, month] = prevMonth.split('-').map(Number);
  await getTrendingData(year, month, year, month);
  
  console.log('Data fetching and saving completed.');
}

// Run the main function
fetchAndSaveRealEstateData();