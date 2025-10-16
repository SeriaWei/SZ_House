const fs = require('fs');
const path = require('path');

const rootDataPath = path.resolve(__dirname, '..', 'data');
const srcPath = path.resolve(__dirname, 'src');

const newHomesPath = path.join(rootDataPath, 'new_homes');
const secondHandHomesPath = path.join(rootDataPath, 'second_hand_homes');

const trendingJsonPath = path.join(rootDataPath, 'trending.json');
const destTrendingJsonPath = path.join(srcPath, 'trendingData.json');

const destTrendingDailyDataPath = path.join(srcPath, 'trendingDailyData.json');

// 1. Copy trending.json
try {
    fs.copyFileSync(trendingJsonPath, destTrendingJsonPath);
    console.log('Copied trending.json successfully.');
} catch (error) {
    console.error('Error copying trending.json:', error);
}

// 2. Process daily data
const processDailyData = () => {
    const newHomesFiles = fs.readdirSync(newHomesPath);
    const secondHandHomesFiles = fs.readdirSync(secondHandHomesPath);

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

    const processDataByDate = (files, basePath) => {
        const dataByDate = {};
        for (const date of allDates) {
            const data = readFileData(path.join(basePath, `${date}.json`));
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
    }

    const newHomesDataByDate = processDataByDate(newHomesFiles, newHomesPath);
    const secondHandHomesDataByDate = processDataByDate(secondHandHomesFiles, secondHandHomesPath);

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
        fs.writeFileSync(destTrendingDailyDataPath, JSON.stringify(trendingDailyData, null, 2));
        console.log('Generated trendingDailyData.json successfully.');
    } catch (error) {
        console.error('Error writing trendingDailyData.json:', error);
    }
};

processDailyData();
