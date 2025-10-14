const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'trending.json');

// Promisified function to make HTTPS POST requests
function fetchApiData(startDate, endDate) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            startDate,
            endDate,
            dateType: ''
        });

        const options = {
            hostname: 'zjj.sz.gov.cn',
            port: 8004,
            path: '/api/marketInfoShow/getFjzsInfoData',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0'
            }
        };

        const req = https.request(options, (res) => {
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    if (parsedData.status === 1) {
                        resolve(parsedData.data);
                    } else {
                        reject(new Error(`API returned an error: ${parsedData.msg}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
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
            console.error('Error parsing existing data file. Starting fresh.', e);
            return {};
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
                // Round the float numbers to 2 decimal places
                monthlyAggregates[yearMonthKey].ysfDealArea = parseFloat(monthlyAggregates[yearMonthKey].ysfDealArea.toFixed(2));
                monthlyAggregates[yearMonthKey].esfDealArea = parseFloat(monthlyAggregates[yearMonthKey].esfDealArea.toFixed(2));

                existingData[yearMonthKey] = monthlyAggregates[yearMonthKey];
                console.log(`Successfully processed data for ${yearMonthKey}`);
            }

            writeData(existingData);
        } else {
            console.log(`No data returned for the specified range.`);
        }
    } catch (error) {
        console.error(`Failed to fetch or process data:`, error.message);
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
        console.error('Invalid date format. Please use YYYY-MM.');
        return;
    }

    getTrendingData(startYear, startMonth, endYear, endMonth);
}

main();
