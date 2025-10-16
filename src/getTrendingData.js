const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'trending.json');

// Function to make HTTPS POST requests using fetch
async function fetchApiData(startDate, endDate) {
    const url = 'https://zjj.sz.gov.cn:8004/api/marketInfoShow/getFjzsInfoData';
    
    const postData = JSON.stringify({
        startDate,
        endDate,
        dateType: ''
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0'
        },
        body: postData
    };

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const parsedData = await response.json();
        if (parsedData.status === 1) {
            return parsedData.data;
        } else {
            throw new Error(`API returned an error: ${parsedData.msg}`);
        }
    } catch (error) {
        throw error;
    }
}

// Aggregate multi-month daily data into monthly summaries
function aggregateMultiMonthData(dailyData) {
    const monthlyAggregates = {};

    for (let i = 0; i < dailyData.date.length; i++) {
        const dateStr = dailyData.date[i]; // "YYYY-MM-DD"
        const yearMonthKey = dateStr.substring(0, 7); // "YYYY-MM"

        if (!monthlyAggregates[yearMonthKey]) {
            monthlyAggregates[yearMonthKey] = {
                ysfDealArea: 0,
                ysfTotalTs: 0,
                esfDealArea: 0,
                esfTotalTs: 0,
            };
        }

        monthlyAggregates[yearMonthKey].ysfDealArea += dailyData.ysfDealArea[i] || 0;
        monthlyAggregates[yearMonthKey].ysfTotalTs += dailyData.ysfTotalTs[i] || 0;
        monthlyAggregates[yearMonthKey].esfDealArea += dailyData.esfDealArea[i] || 0;
        monthlyAggregates[yearMonthKey].esfTotalTs += dailyData.esfTotalTs[i] || 0;
    }

    return monthlyAggregates;
}

// Read existing data from the file
function readExistingData() {
    if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        try {
            return JSON.parse(fileContent);
        } catch (e) {
            throw new Error('Error parsing existing data file: ' + e.message);
        }
    }
    return {};
}

// Write data to the file, with keys sorted
function writeData(data) {
    const sortedData = {};
    // Default string sort is chronological for YYYY-MM format
    const sortedKeys = Object.keys(data).sort();

    for (const key of sortedKeys) {
        sortedData[key] = data[key];
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(sortedData, null, 2), 'utf-8');
    console.log(`Successfully updated ${DATA_FILE}`);
}

// Main function to fetch and process data for a range of months
async function getTrendingData(startYear, startMonth, endYear, endMonth) {
    console.log(`Fetching data from ${startYear}-${startMonth} to ${endYear}-${endMonth}`);

    const startMonthStr = startMonth.toString().padStart(2, '0');
    const endMonthStr = endMonth.toString().padStart(2, '0');

    const startDate = `${startYear}-${startMonthStr}-01`;
    const daysInEndMonth = new Date(endYear, endMonth, 0).getDate();
    const endDate = `${endYear}-${endMonthStr}-${daysInEndMonth}`;

    console.log(`Fetching data for range: ${startDate} to ${endDate}`);

    try {
        const dailyData = await fetchApiData(startDate, endDate);

        if (dailyData && dailyData.date && dailyData.date.length > 0) {
            const monthlyAggregates = aggregateMultiMonthData(dailyData);
            const existingData = readExistingData();

            // Merge new data into existing data
            for (const yearMonthKey in monthlyAggregates) {
                const monthData = monthlyAggregates[yearMonthKey];

                // Calculate average area
                const ysfAverageArea = monthData.ysfTotalTs > 0 ? monthData.ysfDealArea / monthData.ysfTotalTs : 0;
                const esfAverageArea = monthData.esfTotalTs > 0 ? monthData.esfDealArea / monthData.esfTotalTs : 0;

                // Round the float numbers to 2 decimal places
                monthData.ysfDealArea = parseFloat(monthData.ysfDealArea.toFixed(2));
                monthData.esfDealArea = parseFloat(monthData.esfDealArea.toFixed(2));
                monthData.ysfAverageArea = parseFloat(ysfAverageArea.toFixed(2));
                monthData.esfAverageArea = parseFloat(esfAverageArea.toFixed(2));

                existingData[yearMonthKey] = monthData;
                console.log(`Successfully processed data for ${yearMonthKey}`);
            }

            writeData(existingData);
        } else {
            console.log(`No data returned for the specified range.`);
        }
    } catch (error) {
        throw new Error('Failed to fetch or process data: ' + error.message);
    }
}

// Parse command-line arguments
function main() {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.log('Usage: node src/getTrendingData.js <start_YYYY-MM> <end_YYYY-MM>');
        console.log('Example: node src/getTrendingData.js 2024-01 2025-09');
        return;
    }

    const [start, end] = args;
    const [startYear, startMonth] = start.split('-').map(Number);
    const [endYear, endMonth] = end.split('-').map(Number);

    if (isNaN(startYear) || isNaN(startMonth) || isNaN(endYear) || isNaN(endMonth)) {
        throw new Error('Invalid date format. Please use YYYY-MM.');
        return;
    }

    getTrendingData(startYear, startMonth, endYear, endMonth);
}

// Export functions for use in other modules
module.exports = {
    getTrendingData,
    aggregateMultiMonthData,
    readExistingData,
    writeData,
    fetchApiData
};

if (require.main === module) {
    main();
}
