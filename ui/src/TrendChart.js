import React from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrendChart = ({ data, visibleDatasets, datasetConfig, showLastYear, lastYearDatasetConfig, getLastYearData }) => {
  const chartLabels = data.map(d => d.month);

  const chartDatasets = Object.keys(visibleDatasets)
    .filter(key => visibleDatasets[key])
    .flatMap(key => {
      const currentYearDatasets = [{
        label: datasetConfig[key].label,
        data: data.map(d => d[key]),
        borderColor: datasetConfig[key].borderColor,
        backgroundColor: `${datasetConfig[key].borderColor}33`,
        fill: false,
        tension: 0.1,
      }];

      if (showLastYear) {
        const lastYearData = getLastYearData(data, key);
        currentYearDatasets.push({
          label: lastYearDatasetConfig[key].label,
          data: lastYearData,
          borderColor: lastYearDatasetConfig[key].borderColor,
          backgroundColor: `${lastYearDatasetConfig[key].borderColor}33`,
          borderDash: lastYearDatasetConfig[key].borderDash,
          fill: false,
          tension: 0.1,
        });
      }

      return currentYearDatasets;
    });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '月度成交数据趋势',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label.includes('面积')) {
                label += context.parsed.y.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' 平方米';
              } else if (context.dataset.label.includes('套数')) {
                label += context.parsed.y.toLocaleString('zh-CN') + ' 套';
              } else {
                label += context.parsed.y.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              }
            }
            if (context.raw === null && context.parsed.y === null) {
              label = context.dataset.label + ': 暂无数据';
            }
            return label;
          },
          footer: function(tooltipItems) {
            if (!showLastYear) return '';
            const currentData = tooltipItems.find(t => !t.dataset.label.includes('去年同期'));
            if (!currentData) return '';
            
            const dataIndex = currentData.dataIndex;
            const currentMonth = data[dataIndex].month;
            const lastYearMonth = data[dataIndex].lastYearMonth;
            
            return `\n📊 同比分析 (${lastYearMonth} → ${currentMonth})`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '月份'
        }
      },
      y: {
        title: {
          display: true,
          text: '数值'
        },
        beginAtZero: true
      }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
  };

  const chartDataObject = {
    labels: chartLabels,
    datasets: chartDatasets,
  };

  return <Line options={chartOptions} data={chartDataObject} />;
};

export default TrendChart;
