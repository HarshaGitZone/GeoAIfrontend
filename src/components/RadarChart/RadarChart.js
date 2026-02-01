import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// 15 factors in order of 5 categories (same as bar view)
const FACTOR_ORDER = [
  'slope', 'elevation',                           // Physical Terrain
  'vegetation', 'soil', 'pollution',              // Environmental
  'flood', 'water', 'drainage',                   // Hydrology
  'rainfall', 'thermal', 'intensity',              // Climatic
  'landuse', 'infrastructure', 'population'        // Socio-Economic
];
const FACTOR_LABELS = {
  slope: 'Slope', elevation: 'Elevation',
  vegetation: 'Vegetation', soil: 'Soil', pollution: 'Pollution',
  flood: 'Flood', water: 'Water', drainage: 'Drainage',
  rainfall: 'Rainfall', thermal: 'Thermal', intensity: 'Intensity',
  landuse: 'Landuse', infrastructure: 'Infra', population: 'Population'
};
const CATEGORY_LABELS = {
  physical_terrain: 'Physical',
  environmental: 'Environmental',
  hydrology: 'Hydrology',
  climatic: 'Climatic',
  socio_econ: 'Socio-Economic'
};

/** Use 0-100 suitability score for display (same as bar view). Prefer scaled_score when present (e.g. slope, elevation). */
function getValue(data, key) {
  if (!data || !key) return 0;
  const v = data[key];
  if (v == null) return 0;
  let num = 0;
  if (typeof v === 'object') {
    num = v.scaled_score != null ? Number(v.scaled_score) : (v.value != null ? Number(v.value) : 0);
  } else {
    num = Number(v) || 0;
  }
  return Math.min(100, Math.max(0, num));
}

const RadarChart = ({ data, isDarkMode, categoryScores }) => {
  if (!data) return null;

  const labels = FACTOR_ORDER.map(k => FACTOR_LABELS[k] || k);
  const values = FACTOR_ORDER.map(k => getValue(data, k));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Suitability Profile',
        data: values,
        backgroundColor: 'rgba(45, 138, 138, 0.25)',
        borderColor: '#2d8a8a',
        borderWidth: 2,
        pointBackgroundColor: '#2d8a8a',
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        pointLabels: {
          color: isDarkMode ? '#f8fafc' : '#0f172a',
          font: { size: 9, weight: 'bold' }
        },
        ticks: { display: false, max: 100, min: 0 }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw?.toFixed(1) ?? 0}/100` } }
    },
    maintainAspectRatio: false,
    responsive: true
  };

  return (
    <div className="radar-chart-wrapper">
      {categoryScores && typeof categoryScores === 'object' && Object.keys(categoryScores).length > 0 && (
        <div className="radar-five-categories">
          {Object.entries(categoryScores).map(([catKey, score]) => (
            <span key={catKey} className="radar-cat-badge">
              {CATEGORY_LABELS[catKey] || catKey}: {(score ?? 0).toFixed(0)}%
            </span>
          ))}
        </div>
      )}
      <div className="radar-chart-inner" style={{ height: '280px', width: '100%', position: 'relative' }}>
        <Radar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default React.memo(RadarChart);
