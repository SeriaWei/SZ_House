import React, { useState, useMemo } from 'react';
import './App.css';
import TrendChart from './TrendChart';
import DailyTrendChart from './DailyTrendChart';
import trendingData from './trendingData.json';

// Prepare the data for the monthly chart
const allMonths = Object.keys(trendingData).sort();
// descending order (newest first) for UI selects
const allMonthsDesc = [...allMonths].reverse();
const monthlyChartData = allMonths.map(month => ({
  month,
  ...trendingData[month]
}));

function App() {
  // State for active tab
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly' or 'daily'

  // == State and handlers for Monthly Chart ==
  const [monthlyVisibleDatasets, setMonthlyVisibleDatasets] = useState({
    ysfTotalTs: true,
    esfTotalTs: true,
    ysfDealArea: false,
    esfDealArea: false,
    ysfAverageArea: false,
    esfAverageArea: false,
  });
  const [monthlyDateRange, setMonthlyDateRange] = useState({
    start: allMonths[Math.max(0, allMonths.length - 12)],
    end: allMonths[allMonths.length - 1]
  });
  const handleMonthlyVisibilityChange = (e) => {
    const { name, checked } = e.target;
    setMonthlyVisibleDatasets(prev => ({ ...prev, [name]: checked }));
  };
  const handleMonthlyDateChange = (e) => {
    const { name, value } = e.target;
    setMonthlyDateRange(prev => ({ ...prev, [name]: value }));
  };
  const filteredMonthlyData = useMemo(() => {
    const startIndex = allMonths.indexOf(monthlyDateRange.start);
    const endIndex = allMonths.indexOf(monthlyDateRange.end);
    return monthlyChartData.slice(startIndex, endIndex + 1);
  }, [monthlyDateRange]);
  const monthlyDatasetConfig = {
    ysfTotalTs: { label: '新房成交套数', borderColor: '#36A2EB' },
    esfTotalTs: { label: '二手成交套数', borderColor: '#FF6384' },
    ysfDealArea: { label: '新房成交面积', borderColor: '#4BC0C0' },
    esfDealArea: { label: '二手成交面积', borderColor: '#FF9F40' },
    ysfAverageArea: { label: '新房平均成交面积', borderColor: '#9966FF' },
    esfAverageArea: { label: '二手平均成交面积', borderColor: '#FFCD56' },
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>深圳房产成交趋势</h1>
      </header>
      <main>
        <div className="tabs">
          <button className={activeTab === 'monthly' ? 'active' : ''} onClick={() => setActiveTab('monthly')}>月度成交趋势</button>
          <button className={activeTab === 'daily' ? 'active' : ''} onClick={() => setActiveTab('daily')}>每日成交趋势</button>
        </div>

        {activeTab === 'monthly' && (
          <div className="tab-content">
            <div className="controls">
              <fieldset>
                <legend>选择显示的数据</legend>
                {Object.keys(monthlyDatasetConfig).map(key => (
                  <label key={key}>
                    <input type="checkbox" name={key} checked={monthlyVisibleDatasets[key]} onChange={handleMonthlyVisibilityChange} />
                    {monthlyDatasetConfig[key].label}
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>选择日期范围</legend>
                <label>开始月份: <select name="start" value={monthlyDateRange.start} onChange={handleMonthlyDateChange}>{allMonthsDesc.map(month => <option key={month} value={month}>{month}</option>)}</select></label>
                <label>结束月份: <select name="end" value={monthlyDateRange.end} onChange={handleMonthlyDateChange}>{allMonthsDesc.map(month => <option key={month} value={month}>{month}</option>)}</select></label>
              </fieldset>
            </div>
            <div className="chart-container">
              <TrendChart data={filteredMonthlyData} visibleDatasets={monthlyVisibleDatasets} datasetConfig={monthlyDatasetConfig} />
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="tab-content">
            <DailyTrendChart />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;