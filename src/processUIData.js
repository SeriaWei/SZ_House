const fs = require('fs');
const path = require('path');

/**
 * Helper function to get all JSON files recursively from a directory and its subdirectories
 * @param {string} dir - Directory path
 * @returns {string[]} - Array of file paths
 */
const getAllJsonFiles = (dir) => {
    const files = [];
    
    // Check if directory exists
    if (!fs.existsSync(dir)) {
        return files;
    }
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            // Recursively get files from subdirectories
            const subDirFiles = getAllJsonFiles(itemPath);
            files.push(...subDirFiles);
        } else if (path.extname(item) === '.json') {
            // Only include JSON files
            files.push(itemPath);
        }
    }
    
    return files;
};

/**
 * Read file data and extract ts and mj arrays
 * @param {string} filePath - Path to the JSON file
 * @returns {object} - Object with ts and mj arrays
 */
const readFileData = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        return { ts: json.data.dataTs || [], mj: json.data.dataMj || [] };
    } catch (e) {
        // console.error(`Error reading or parsing ${filePath}:`, e);
        return { ts: [], mj: [] };
    }
};

/**
 * Process data by date for given files
 * @param {string[]} files - Array of file paths
 * @param {string[]} allDates - Array of all dates
 * @param {Set} allDistricts - Set to collect all district names
 * @returns {object} - Data organized by date
 */
const processDataByDate = (files, allDates, allDistricts) => {
    const dataByDate = {};
    for (const date of allDates) {
        // Find the file that matches the date
        const matchingFile = files.find(file => path.basename(file, '.json') === date);
        let data = { ts: [], mj: [] };
        
        if (matchingFile) {
            data = readFileData(matchingFile);
        }
        
        dataByDate[date] = { ts: {}, mj: {} };
        for (const item of data.ts) {
            dataByDate[date].ts[item.name] = item.value;
            allDistricts.add(item.name);
        }
        for (const item of data.mj) {
            dataByDate[date].mj[item.name] = item.value;
            allDistricts.add(item.name);
        }
    }
    return dataByDate;
};

/**
 * Copy trending.json file to UI source directory
 */
const copyTrendingData = () => {
    const rootDataPath = path.resolve(__dirname, '..', 'data');
    const uiSrcPath = path.resolve(__dirname, '..', 'ui', 'src');
    
    const trendingJsonPath = path.join(rootDataPath, 'trending.json');
    const destTrendingJsonPath = path.join(uiSrcPath, 'trendingData.json');

    try {
        // Ensure the destination directory exists
        if (!fs.existsSync(uiSrcPath)) {
            fs.mkdirSync(uiSrcPath, { recursive: true });
        }
        
        fs.copyFileSync(trendingJsonPath, destTrendingJsonPath);
        console.log('Copied trending.json successfully.');
    } catch (error) {
        console.error('Error copying trending.json:', error);
    }
};

/**
 * Process daily data and generate trendingDailyData.json
 */
const processDailyData = () => {
    const rootDataPath = path.resolve(__dirname, '..', 'data');
    const uiSrcPath = path.resolve(__dirname, '..', 'ui', 'src');
    
    const newHomesPath = path.join(rootDataPath, 'new_homes');
    const secondHandHomesPath = path.join(rootDataPath, 'second_hand_homes');
    const destTrendingDailyDataPath = path.join(uiSrcPath, 'trendingDailyData.json');

    const newHomesFiles = getAllJsonFiles(newHomesPath);
    const secondHandHomesFiles = getAllJsonFiles(secondHandHomesPath);

    const allDates = [
        ...new Set([
            ...newHomesFiles.map(f => path.basename(f, '.json')),
            ...secondHandHomesFiles.map(f => path.basename(f, '.json'))
        ])
    ].sort();

    const trendingDailyData = {
        dates: allDates,
        districts: {}
    };

    const allDistricts = new Set();

    const newHomesDataByDate = processDataByDate(newHomesFiles, allDates, allDistricts);
    const secondHandHomesDataByDate = processDataByDate(secondHandHomesFiles, allDates, allDistricts);

    for (const district of Array.from(allDistricts).sort()) {
        trendingDailyData.districts[district] = {
            new_homes: { ts: [], mj: [] },
            second_hand_homes: { ts: [], mj: [] }
        };
    }

    for (const date of allDates) {
        for (const district in trendingDailyData.districts) {
            trendingDailyData.districts[district].new_homes.ts.push(newHomesDataByDate[date]?.ts[district] || 0);
            trendingDailyData.districts[district].new_homes.mj.push(newHomesDataByDate[date]?.mj[district] || 0);
            trendingDailyData.districts[district].second_hand_homes.ts.push(secondHandHomesDataByDate[date]?.ts[district] || 0);
            trendingDailyData.districts[district].second_hand_homes.mj.push(secondHandHomesDataByDate[date]?.mj[district] || 0);
        }
    }

    try {
        // Ensure the destination directory exists
        if (!fs.existsSync(uiSrcPath)) {
            fs.mkdirSync(uiSrcPath, { recursive: true });
        }
        
        fs.writeFileSync(destTrendingDailyDataPath, JSON.stringify(trendingDailyData, null, 2));
        console.log('Generated trendingDailyData.json successfully.');
    } catch (error) {
        console.error('Error writing trendingDailyData.json:', error);
    }
};

/**
 * Main function to process UI data after data fetching is complete
 */
const processUIData = () => {
    console.log('Processing UI data...');
    
    // Copy trending.json
    copyTrendingData();
    
    // Process daily data
    processDailyData();
    
    console.log('UI data processing completed.');
};

module.exports = { processUIData };