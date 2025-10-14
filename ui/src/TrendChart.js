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

const TrendChart = ({ data, visibleDatasets, datasetConfig }) => {
  const chartLabels = data.map(d => d.month);

  const chartDatasets = Object.keys(visibleDatasets)
    .filter(key => visibleDatasets[key])
    .map(key => ({
      label: datasetConfig[key].label,
      data: data.map(d => d[key]),
      borderColor: datasetConfig[key].borderColor,
      backgroundColor: `${datasetConfig[key].borderColor}33`, // Semi-transparent fill
      fill: false,
      tension: 0.1,
    }));

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
