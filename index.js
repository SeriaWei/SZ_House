const { getNewHomesData } = require('./getNewHomesData');
const { getSecondHandHomesData } = require('./getSecondHandHomesData');
const { saveDataToFile } = require('./saveData');

/**
 * Main function to fetch and save the previous day's real estate data
 */
async function fetchAndSaveRealEstateData() {
  try {
    console.log('Fetching previous day second-hand home data...');
    const secondHandHomesResponse = await getSecondHandHomesData();
    
    if (secondHandHomesResponse.status === 1) {
      // Extract the date from the response
      const dateStr = secondHandHomesResponse.data.xmlDateDay.replace(/[年月日]/g, '-').replace(/-$/, '');
      saveDataToFile(secondHandHomesResponse, 'second_hand_homes', dateStr);
    } else {
      console.error('Error fetching second-hand homes data:', secondHandHomesResponse.msg);
    }

    console.log('Fetching previous day new home data...');
    const newHomesResponse = await getNewHomesData();
    
    if (newHomesResponse.status === 1) {
      // Extract the date from the response
      const dateStr = newHomesResponse.data.xmlDateDay.replace(/[年月日]/g, '-').replace(/-$/, '');
      saveDataToFile(newHomesResponse, 'new_homes', dateStr);
    } else {
      console.error('Error fetching new homes data:', newHomesResponse.msg);
    }

    console.log('Data fetching and saving completed.');
  } catch (error) {
    console.error('Error in fetchAndSaveRealEstateData:', error);
  }
}

// Run the main function
fetchAndSaveRealEstateData();