const fs = require('fs');
const path = require('path');

/**
 * Saves the API response data to the appropriate directory
 * @param {Object} data - The API response data to save
 * @param {string} type - The type of data ('new_homes' or 'second_hand_homes')
 * @param {string} date - The date string for the filename (format: YYYY-MM-DD)
 */
function saveDataToFile(data, type, date) {
  // Create a filename based on the date
  const fileName = `${date}.json`;
  
  // Determine the directory based on the type
  let directory;
  if (type === 'new_homes') {
    directory = path.join('data', 'new_homes');
  } else if (type === 'second_hand_homes') {
    directory = path.join('data', 'second_hand_homes');
  } else {
    throw new Error('Invalid type. Must be "new_homes" or "second_hand_homes"');
  }
  
  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  
  // Save the data to the file
  const filePath = path.join(directory, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log(`Data saved to ${filePath}`);
}

module.exports = { saveDataToFile };