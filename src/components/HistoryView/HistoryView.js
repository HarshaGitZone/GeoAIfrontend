import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FactorBar from '../FactorBar/FactorBar';
import './HistoryView.css';
import { API_BASE } from "../../config/api";

const RANGES = ['1W', '1M', '1Y', '10Y'];

export default function HistoryView({ data, locationName, onClose, lat, lng }) {
  const [rangeIndex, setRangeIndex] = useState(3); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [historyBundle, setHistoryBundle] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const timeRange = RANGES[rangeIndex];
  const snapshots = [
    { label: '10 YEARS AGO', key: '10Y', year: '2016' },
    { label: '1 YEAR AGO', key: '1Y', year: '2025' },
    { label: 'PRESENT DAY', key: 'Today', year: '2026' }
  ];

  // Strategy: Always anchor the Planning Forecast to the 10Y trend for stability
  const stableForecast = historyBundle?.['10Y']?.forecast;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const preFetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/history_analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        });
        
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const text = await response.text();
        const result = JSON.parse(text); 
        setHistoryBundle(result.history_bundle || null);
      } catch (err) {
        console.error("Historical reconstruction failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (lat && lng) preFetchHistory();
  }, [lat, lng]);

  const activeHistory = historyBundle ? historyBundle[timeRange] : null;

  const getPreviousValue = (key, currentVal) => {
    if (!activeHistory || !activeHistory.drifts) return currentVal;
    const drift = activeHistory.drifts[key] || 0;
    return Math.max(0, Math.min(100, currentVal + drift));
  };

  const handleSliderChange = (e) => {
    const newIndex = parseInt(e.target.value);
    setIsSwitching(true);
    setRangeIndex(newIndex);
    setTimeout(() => setIsSwitching(false), 300);
  };

  const trendData = [
    { name: 'Historical', score: activeHistory?.score || (data.suitability_score + 5) },
    { name: 'Midpoint', score: activeHistory ? (activeHistory.score + data.suitability_score) / 2 : data.suitability_score + 2 },
    { name: 'Current', score: data.suitability_score },
  ];

  const totalShift = activeHistory 
    ? ((data.suitability_score - activeHistory.score) / activeHistory.score) * 100 
    : 0;
//   const VisualForensics = ({ forensics }) => {
//   if (!forensics) return null;
    
//   return (
//     <div className="card forensics-card glass-morphic animate-in">
//       <div className="forensics-header">
//         <div className="title-group">
//           <span className="tag-pill">SIAM-CNN ANALYSIS</span>
//           <h4>Temporal Land Drift (2017 - 2026)</h4>
//         </div>
//         <div className={`velocity-tag ${forensics.velocity.toLowerCase()}`}>
//           {forensics.velocity} Dynamics
//         </div>
//       </div>

//       <div className="forensics-visual-grid">
//         <div className="visual-pane">
//           <label>2017 Baseline</label>
//           <div className="forensic-img" style={{ backgroundImage: `url(${forensics.baseline_img})` }}>
//             <div className="timestamp-overlay">T1: BASELINE</div>
//           </div>
//         </div>

//         <div className="visual-separator">
//           <div className="line"></div>
//           <div className="diff-icon">Δ</div>
//           <div className="line"></div>
//         </div>

//         <div className="visual-pane">
//           <label>2026 Prediction</label>
//           <div className="forensic-img" style={{ backgroundImage: `url(${forensics.current_img})` }}>
//             <div className="heatmap-overlay" style={{ opacity: forensics.intensity / 100 }}></div>
//             <div className="timestamp-overlay">T2: CURRENT</div>
//           </div>
//         </div>
//       </div>

//       <div className="forensics-stats">
//         <div className="stat">
//           <span className="label">Transition Intensity</span>
//           <span className="value">{forensics.intensity}%</span>
//         </div>
//         <div className="stat-desc">
//           {forensics.intensity > 15 
//             ? "Deep Learning scan confirms significant lithospheric transition (Urbanization/Deforestation)." 
//             : "Stable spectral signatures. Minimal human encroachment detected over the 9-year cycle."}
//         </div>
//       </div>
//     </div>
//   );
// };
const VisualForensics = ({ forensics }) => {
  if (!forensics) return null;

  // DYNAMIC INSIGHT GENERATOR
  // This ensures the report is unique based on the intensity detected
  const getDynamicInsight = (intensity, year) => {
    if (intensity > 60) {
      return `CRITICAL TRANSITION: High-velocity urbanization detected. Visual delta confirms that approximately ${intensity}% of the original landcover from ${year} has been replaced by high-density infrastructure or industrial footprints.`;
    } else if (intensity > 30) {
      return `SIGNIFICANT GROWTH: Notable land use transition identified. The site has evolved from its ${year} baseline, showing an expansion of human-made structures and a reduction in raw vegetation biomass.`;
    } else if (intensity > 10) {
      return `MODERATE DRIFT: Gradual development detected. The spectral signature shows slight variation from the ${year} state, typical of establishing residential zones or managed landscape changes.`;
    }
    return `STABLE EQUILIBRIUM: Minimal lithospheric drift. The current visual signatures remain highly consistent with the ${year} baseline, suggesting a well-preserved or protected environmental state.`;
  };

  return (
    <div className="card forensics-card glass-morphic animate-in">
      <div className="forensics-header">
        <div className="title-group">
          <span className="tag-pill">SIAM-CNN ANALYSIS</span>
          <h4>Temporal Land Drift ({forensics.baseline_year} - 2026)</h4>
        </div>
        <div className={`velocity-tag ${forensics.velocity.toLowerCase()}`}>
          {forensics.velocity} Dynamics
        </div>
      </div>

      <div className="forensics-visual-grid">
        <div className="visual-pane">
          <label>{forensics.baseline_year} Baseline</label>
          <div className="forensic-img" style={{ backgroundImage: `url(${forensics.baseline_img})` }}>
            <div className="timestamp-overlay">T1: BASELINE</div>
          </div>
        </div>

        <div className="visual-separator">
          <div className="line"></div>
          <div className="diff-icon">Δ</div>
          <div className="line"></div>
        </div>

        <div className="visual-pane">
          <label>2026 Prediction</label>
          <div className="forensic-img" style={{ backgroundImage: `url(${forensics.current_img})` }}>
            {/* Heatmap intensity driven by the actual data */}
            <div className="heatmap-overlay" style={{ 
              opacity: forensics.intensity / 100,
              background: forensics.intensity > 40 
                ? 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 80%)' 
                : 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 80%)'
            }}></div>
            <div className="timestamp-overlay">T2: CURRENT</div>
          </div>
        </div>
      </div>

      <div className="forensics-stats">
        <div className="stat">
          <span className="label">Transition Intensity</span>
          <span className="value" style={{ color: forensics.intensity > 40 ? '#ef4444' : '#10b981' }}>
            {forensics.intensity}%
          </span>
        </div>
        <div className="stat-desc">
          {getDynamicInsight(forensics.intensity, forensics.baseline_year)}
        </div>
      </div>
    </div>
  );
};
  return (
    <div className="history-page-overlay">
      <div className="history-content-wrapper">
        <header className="history-header-responsive">
          <div className="header-top-row">
            <button className="back-link-glass" onClick={onClose}>← EXIT ANALYSIS</button>
            <div className="live-clock-responsive">
              {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
            </div>
          </div>

          <div className="header-main-info">
            <h1 className="location-title">{locationName}</h1>
            <div className="coord-badge-responsive">
              <span>LAT: {parseFloat(lat).toFixed(4)}</span>
              <span className="sep">|</span>
              <span>LNG: {parseFloat(lng).toFixed(4)}</span>
            </div>
          </div>

          <div className="time-slider-container">
            <div className="slider-labels">
              {RANGES.map((r, i) => (
                <span key={r} className={rangeIndex === i ? 'active' : ''}>{r}</span>
              ))}
            </div>
            <input 
              type="range" min="0" max="3" step="1" 
              value={rangeIndex} onChange={handleSliderChange}
              className="temporal-range-slider"
            />
          </div>
        </header>

        <main className="history-main-layout">
          {/* Main Trajectory Chart */}
          {/* NEW: VISUAL FORENSICS CALL (Add this here!) */}
        {/* {activeHistory?.visual_forensics && (
          <div className="forensics-section-wrapper" style={{ gridColumn: "1 / -1", marginBottom: '20px' }}>
             <VisualForensics forensics={activeHistory.visual_forensics} />
          </div>
        )} */}
          <section className="insight-card-new chart-section">
            <div className="card-header-flex">
              <h3>Suitability Trajectory ({timeRange})</h3>
              {(isLoading || isSwitching) && <span className="sync-pulse">Syncing...</span>}
            </div>
            <div className="chart-container-responsive">
              <ResponsiveContainer width="99%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', background: '#111', border: '1px solid #333' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#colorScore)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Triple Terrain Snapshot Archive */}
          <section className="insight-card-new terrain-snapshot-section">
            <h3>Terrain Reconstruction Archive</h3>
            <div className="snapshot-grid">
              {snapshots.map((snap) => {
                const snapData = snap.key === 'Today' 
                  ? { terrain: { nature_density: data.factors.landuse, urban_density: data.factors.proximity } } 
                  : historyBundle?.[snap.key];
                const isSelected = timeRange === snap.key;

                return (
                  <div key={snap.key} className={`snapshot-card ${isSelected ? 'active-range' : ''}`}>
                    <div className="snap-header">
                      <span className="snap-label">{snap.label}</span>
                      <span className="snap-year">{snap.year}</span>
                    </div>
                    <div className="mini-map-container">
                      <div className="map-render" style={{ background: `linear-gradient(135deg, #1a472a ${snapData?.terrain?.nature_density}%, #334155 ${snapData?.terrain?.urban_density}%)` }}>
                        <div className="map-grid-overlay"></div>
                      </div>
                    </div>
                    <div className="snap-stats">
                      <span>Nature: {snapData?.terrain?.nature_density?.toFixed(0)}%</span>
                      <span>Urban: {snapData?.terrain?.urban_density?.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="details-grid-responsive">
            {/* CARD 1: Factor Drifts */}
            <section className="insight-card-new factor-drifts-card">
              <h3>Factor Drift Details</h3>
              <div className="factors-scroll-container">
                {Object.keys(data.factors).map(key => (
                  <FactorBar 
                    key={key} 
                    label={key.replace('_', ' ').toUpperCase()} 
                    value={data.factors[key]} 
                    previousValue={getPreviousValue(key, data.factors[key])} 
                  />
                ))}
              </div>
            </section>

            {/* CARD 2: AI Analysis & Velocity */}
            <section className="insight-card-new ai-analysis-card">
              <h3>GeoGPT {timeRange} Analysis</h3>
              <div className="velocity-gauge-container">
                <h4>Urbanization Velocity</h4>
                <div className="gauge-wrapper">
                  <div className="gauge-body">
                    <div className="gauge-needle" style={{ transform: `rotate(${(activeHistory?.velocity?.score * 18) - 90}deg)` }}></div>
                  </div>
                  <div className="gauge-labels">
                    <span>Stable</span><span>Expanding</span><span>Hyper-Growth</span>
                  </div>
                </div>
                <p className="velocity-status">Current Pace: <span className="highlight-text">{activeHistory?.velocity?.label || "Calculating..."}</span></p>
              </div>
              <div className="gpt-body">
                <p className="summary-text">Temporal analysis indicates a <span className="highlight">{totalShift.toFixed(1)}%</span> net shift.</p>
                <div className="analysis-stats">
                  <div className="stat-row"><span>Baseline Score</span><span>{activeHistory?.score?.toFixed(1) || '---'}</span></div>
                  <div className="stat-row"><span>Climate Variance</span><span>{Math.abs(activeHistory?.drifts?.rainfall || 0).toFixed(1)}%</span></div>
                  <div className="stat-row"><span>Land Use Change</span><span>{Math.abs(activeHistory?.drifts?.landuse || 0).toFixed(1)}%</span></div>
                </div>
              </div>
            </section>

            {/* Locked 2030 Predictive Section with Numerical Risk Bars */}
            <section className="insight-card-new forecast-card glass-glow">
              <div className="card-header-flex">
                <h3><span className="sparkle-icon">✨</span> GeoGPT 2030 Planning Forecast</h3>
                <span className="future-badge">PREDICTIVE</span>
              </div>
              
              <div className="forecast-content">
                <p className="forecast-text">
                  {stableForecast?.text || activeHistory?.forecast || "Analyzing historical momentum to project 2030 viability..."}
                </p>
                
                <div className="risk-indicator-grid">
                  <div className="risk-item">
                    <label>Heat Island Risk</label>
                    <div className="risk-bar">
                        {/* Dynamic Width based on Backend risk score */}
                        <div className="fill high" style={{width: `${stableForecast?.heat_risk || 0}%`, transition: 'width 1s ease-in-out'}}></div>
                    </div>
                  </div>
                  <div className="risk-item">
                    <label>Urban Saturation</label>
                    <div className="risk-bar">
                        <div className="fill mid" style={{width: `${stableForecast?.urban_risk || 0}%`, transition: 'width 1s ease-in-out'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          {/* --- THE FIX: VISUAL FORENSICS AT THE VERY END --- */}
        {/* {activeHistory?.visual_forensics ? (
          <div className="forensics-full-width-wrapper">
             <VisualForensics 
                forensics={activeHistory.visual_forensics} 
             />
          </div>
        ) : (
          <div className="forensics-loading-placeholder">
             <span className="sync-pulse">Generating Siamese visual comparison...</span>
          </div>
        )} */}
        {/* VISUAL FORENSICS AT THE VERY END */}
        {activeHistory?.visual_forensics ? (
          <div className="forensics-full-width-wrapper">
             <VisualForensics forensics={activeHistory.visual_forensics} />
          </div>
        ) : (
          <div className="forensics-loading-placeholder">
             <span className="sync-pulse">Initializing Siam-CNN Visual Comparison...</span>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}