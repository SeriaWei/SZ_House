const fs = require('fs');
const path = require('path');
const { addTotalStatistics } = require('./dataProcessor');

/**
 * Process existing JSON files in the data directory to add total statistics
 * @param {boolean} forceUpdate - Force update even if statistics already exist
 */
function processExistingData(forceUpdate = false) {
  const dataDir = path.join(__dirname, '..', 'data');
  const subdirs = ['new_homes', 'new_homes_month', 'second_hand_homes', 'second_hand_homes_month'];
  
  let processedCount = 0;
  let skippedCount = 0;

  subdirs.forEach(subdir => {
    const subdirPath = path.join(dataDir, subdir);
    
    if (!fs.existsSync(subdirPath)) {
      console.log(`Directory ${subdir} does not exist, skipping...`);
      return;
    }

    const files = fs.readdirSync(subdirPath).filter(file => file.endsWith('.json'));
    
    files.forEach(file => {
      const filePath = path.join(subdirPath, file);
      
      try {
        // Read the existing file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Check if totals already exist and forceUpdate is false
        if (!forceUpdate && data.data && (data.data.dataTotalMj !== undefined || data.data.dataTotalTs !== undefined)) {
          console.log(`File ${subdir}/${file} already has total statistics, skipping...`);
          skippedCount++;
          return;
        }
        
        // Store original values for comparison if forcing update
        const originalMj = data.data ? data.data.dataTotalMj : undefined;
        
        // Add total statistics (this will overwrite existing totals if they exist)
        const updatedData = addTotalStatistics(data);
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
        
        if (forceUpdate && originalMj !== undefined) {
          console.log(`🔄 Updated ${subdir}/${file} - Old MJ: ${originalMj}, New MJ: ${updatedData.data.dataTotalMj}, Total TS: ${updatedData.data.dataTotalTs}`);
        } else {
          console.log(`✅ Processed ${subdir}/${file} - Total MJ: ${updatedData.data.dataTotalMj}, Total TS: ${updatedData.data.dataTotalTs}`);
        }
        processedCount++;
        
      } catch (error) {
        console.error(`❌ Error processing ${subdir}/${file}:`, error.message);
      }
    });
  });

  console.log(`\n📊 Processing completed:`);
  console.log(`   Processed: ${processedCount} files`);
  console.log(`   Skipped: ${skippedCount} files`);
}

// Run the processor if this file is executed directly
if (require.main === module) {
  // Check if --force flag is provided
  const forceUpdate = process.argv.includes('--force');
  
  if (forceUpdate) {
    console.log('🚀 Starting to force update existing data files (fixing precision issues)...\n');
  } else {
    console.log('🚀 Starting to process existing data files...\n');
    console.log('💡 Use --force flag to update files that already have statistics\n');
  }
  
  processExistingData(forceUpdate);
}

module.exports = { processExistingData };