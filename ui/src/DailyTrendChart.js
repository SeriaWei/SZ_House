import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import trendingDailyData from './trendingDailyData.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const allDistricts = Object.keys(trendingDailyData.districts);

const DISTRICT_COLORS = [
  '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC',
  '#36A2EB', '#FF6384', '#4BC0C0', '#FF9F40', '#9966FF', '#FFCD56'
];

const DailyTrendChart = () => {
  const [dateRange, setDateRange] = useState({ 
    start: trendingDailyData.dates[Math.max(0, trendingDailyData.dates.length - 7)],
    end: trendingDailyData.dates[trendingDailyData.dates.length - 1]
  });
  const [selectedDistricts, setSelectedDistricts] = useState(allDistricts);
  const [homeType, setHomeType] = useState('total');
  const [metric, setMetric] = useState('ts');
  const [merge, setMerge] = useState(false);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const { start, end } = dateRange;
    const filteredDates = trendingDailyData.dates.filter(date => date >= start && date <= end);
    const dateIndices = filteredDates.map(date => trendingDailyData.dates.indexOf(date));

    let datasets = [];

    if (merge) {
      const totalData = dateIndices.map(i => {
        return selectedDistricts.reduce((sum, district) => {
          const districtData = trendingDailyData.districts[district];
          let value = 0;
          if (homeType === 'total') {
            value = (districtData.new_homes[metric][i] || 0) + (districtData.second_hand_homes[metric][i] || 0);
          } else {
            value = districtData[homeType][metric][i] || 0;
          }
          return sum + value;
        }, 0);
      });
      datasets = [{
        label: '选中区域总和',
        data: totalData,
        borderColor: '#36A2EB',
        backgroundColor: `${'#36A2EB'}80`,
        fill: false,
      }];
    } else {
      datasets = selectedDistricts.map(district => {
        const districtData = trendingDailyData.districts[district];
        let data = [];
  
        if (homeType === 'total') {
          data = dateIndices.map(i => 
            (districtData.new_homes[metric][i] || 0) + (districtData.second_hand_homes[metric][i] || 0)
          );
        } else {
          data = dateIndices.map(i => districtData[homeType][metric][i] || 0);
        }
  
        const districtIndex = allDistricts.indexOf(district);
        const color = DISTRICT_COLORS[districtIndex % DISTRICT_COLORS.length];
  
        return {
          label: district,
          data: data,
          borderColor: color,
          backgroundColor: `${color}80`,
          fill: false,
        };
      });
    }

    setChartData({
      labels: filteredDates,
      datasets: datasets,
    });

  }, [dateRange, selectedDistricts, homeType, metric, merge]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleDistrictChange = (e) => {
    const district = e.target.name;
    if (e.target.checked) {
      setSelectedDistricts([...selectedDistricts, district]);
    } else {
      setSelectedDistricts(selectedDistricts.filter(d => d !== district));
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `深圳各区${homeType === 'new_homes' ? '一手房' : homeType === 'second_hand_homes' ? '二手房' : '总'}成交${metric === 'ts' ? '套数' : '面积'}趋势`
      }
    }
  };

  return (
    <>
      <div className="controls">
          <fieldset>
              <legend>日期范围</legend>
              <label>开始: <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} /></label>
              <label>结束: <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} /></label>
          </fieldset>
          <fieldset>
              <legend>房源类型</legend>
              <label><input type="radio" name="homeType" value="total" checked={homeType === 'total'} onChange={e => setHomeType(e.target.value)} /> 总成交</label>
              <label><input type="radio" name="homeType" value="new_homes" checked={homeType === 'new_homes'} onChange={e => setHomeType(e.target.value)} /> 一手房</label>
              <label><input type="radio" name="homeType" value="second_hand_homes" checked={homeType === 'second_hand_homes'} onChange={e => setHomeType(e.target.value)} /> 二手房</label>
          </fieldset>
          <fieldset>
              <legend>数据指标</legend>
              <label><input type="radio" name="metric" value="ts" checked={metric === 'ts'} onChange={e => setMetric(e.target.value)} /> 成交套数</label>
              <label><input type="radio" name="metric" value="mj" checked={metric === 'mj'} onChange={e => setMetric(e.target.value)} /> 成交面积 (㎡)</label>
          </fieldset>
      </div>
      <div className="controls">
          <fieldset>
              <legend>选择区域</legend>
              <label style={{fontWeight: 'bold'}}>
                  <input type="checkbox" checked={merge} onChange={e => setMerge(e.target.checked)} />
                  合并显示
              </label>
              {!merge && allDistricts.map(district => (
                  <label key={district}>
                  <input type="checkbox" name={district} checked={selectedDistricts.includes(district)} onChange={handleDistrictChange} />
                  {district}
                  </label>
              ))}
          </fieldset>
      </div>
      <div className="chart-container">
        {chartData.labels && <Line options={options} data={chartData} />}
      </div>
    </>
  );
};

export default DailyTrendChart;