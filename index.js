const { getNewHomesData } = require('./getNewHomesData');
const { getSecondHandHomesData } = require('./getSecondHandHomesData');
const { getNewHomesMonthData } = require('./getNewHomesMonthData');
const { getSecondHandHomesMonthData } = require('./getSecondHandHomesMonthData');
const { saveDataToFile } = require('./saveData');

/**
 * Main function to fetch and save real estate data
 */
async function fetchAndSaveRealEstateData() {
  try {
    // Fetch previous day data
    console.log('Fetching previous day second-hand home data...');
    const secondHandHomesResponse = await getSecondHandHomesData();
    
    if (secondHandHomesResponse.status === 1) {
      // Extract the date from the response
      const dateStr = secondHandHomesResponse.data.xmlDateDay.replace(/[年月日]/g, '-').replace(/-$/, '');
      saveDataToFile(secondHandHomesResponse, 'second_hand_homes', dateStr);
    } else {
      console.error('Error fetching previous day second-hand homes data:', secondHandHomesResponse.msg);
    }

    console.log('Fetching previous day new home data...');
    const newHomesResponse = await getNewHomesData();
    
    if (newHomesResponse.status === 1) {
      // Extract the date from the response
      const dateStr = newHomesResponse.data.xmlDateDay.replace(/[年月日]/g, '-').replace(/-$/, '');
      saveDataToFile(newHomesResponse, 'new_homes', dateStr);
    } else {
      console.error('Error fetching previous day new homes data:', newHomesResponse.msg);
    }

    // Fetch previous month data
    console.log('Fetching previous month second-hand home data...');
    const secondHandHomesMonthResponse = await getSecondHandHomesMonthData();
    
    if (secondHandHomesMonthResponse.status === 1) {
      // Extract the month from the response
      const monthStr = secondHandHomesMonthResponse.data.xmlDateMonth.replace(/[年月]/g, '-').replace(/-$/, '');
      saveDataToFile(secondHandHomesMonthResponse, 'second_hand_homes_month', monthStr);
    } else {
      console.error('Error fetching previous month second-hand homes data:', secondHandHomesMonthResponse.msg);
    }

    console.log('Fetching previous month new home data...');
    const newHomesMonthResponse = await getNewHomesMonthData();
    
    if (newHomesMonthResponse.status === 1) {
      // Extract the month from the response
      const monthStr = newHomesMonthResponse.data.xmlDateMonth.replace(/[年月]/g, '-').replace(/-$/, '');
      saveDataToFile(newHomesMonthResponse, 'new_homes_month', monthStr);
    } else {
      console.error('Error fetching previous month new homes data:', newHomesMonthResponse.msg);
    }

    console.log('Data fetching and saving completed.');
  } catch (error) {
    console.error('Error in fetchAndSaveRealEstateData:', error);
  }
}

// Run the main function
fetchAndSaveRealEstateData();