import React, { useState, useMemo } from 'react';
import './App.css';
import TrendChart from './TrendChart';
import trendingData from './trendingData.json';

// Prepare the data by adding a 'month' property to each data point
const allMonths = Object.keys(trendingData).sort();
const chartData = allMonths.map(month => ({
  month,
  ...trendingData[month]
}));

function App() {
  const [visibleDatasets, setVisibleDatasets] = useState({
    ysfTotalTs: true,
    esfTotalTs: true,
    ysfDealArea: false,
    esfDealArea: false,
  });

  const [dateRange, setDateRange] = useState({
    start: allMonths[Math.max(0, allMonths.length - 6)],
    end: allMonths[allMonths.length - 1]
  });

  const handleVisibilityChange = (e) => {
    const { name, checked } = e.target;
    setVisibleDatasets(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const filteredData = useMemo(() => {
    const startIndex = allMonths.indexOf(dateRange.start);
    const endIndex = allMonths.indexOf(dateRange.end);
    return chartData.slice(startIndex, endIndex + 1);
  }, [dateRange]);

  const datasetConfig = {
    ysfTotalTs: { label: '新房成交套数 (套)', borderColor: '#36A2EB' },
    esfTotalTs: { label: '二手房成交套数 (套)', borderColor: '#FF6384' },
    ysfDealArea: { label: '新房成交面积 (㎡)', borderColor: '#4BC0C0' },
    esfDealArea: { label: '二手房成交面积 (㎡)', borderColor: '#FF9F40' },
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>深圳房产成交趋势</h1>
      </header>
      <main>
        <div className="controls">
          <fieldset>
            <legend>选择显示的数据</legend>
            {Object.keys(datasetConfig).map(key => (
              <label key={key}>
                <input
                  type="checkbox"
                  name={key}
                  checked={visibleDatasets[key]}
                  onChange={handleVisibilityChange}
                />
                {datasetConfig[key].label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>选择日期范围</legend>
            <label>
              开始月份:
              <select name="start" value={dateRange.start} onChange={handleDateChange}>
                {allMonths.slice().reverse().map(month => <option key={month} value={month}>{month}</option>)}
              </select>
            </label>
            <label>
              结束月份:
              <select name="end" value={dateRange.end} onChange={handleDateChange}>
                {allMonths.slice().reverse().map(month => <option key={month} value={month}>{month}</option>)}
              </select>
            </label>
          </fieldset>
        </div>
        <div className="chart-container">
          <TrendChart
            data={filteredData}
            visibleDatasets={visibleDatasets}
            datasetConfig={datasetConfig}
          />
        </div>
      </main>
    </div>
  );
}

export default App;