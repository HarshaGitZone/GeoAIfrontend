// import React, { useState, useEffect } from 'react';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import FactorBar from '../FactorBar/FactorBar';
// import './HistoryView.css';
// import { API_BASE } from "../../config/api";

// const RANGES = ['1W', '1M', '1Y', '10Y'];

// export default function HistoryView({ data, locationName, onClose, lat, lng }) {
//   const [timeRange, setTimeRange] = useState('10Y'); 
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [historyBundle, setHistoryBundle] = useState(null); 
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const preFetchHistory = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch(`${API_BASE}/history_analysis`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ latitude: lat, longitude: lng }),
//         });
//         if (!response.ok) {
//            throw new Error(`HTTP Error ${response.status}`);
//         }
//         // 👇👇 ADD DEBUG CODE HERE (REPLACE response.json())
//       const text = await response.text();
//       console.log("RAW RESPONSE:", text);

//       const result = JSON.parse(text); 
//         // const result = await response.json();
//         // Stores all timelines for instant manual switching
//         setHistoryBundle(result.history_bundle || null);
//       } catch (err) {
//         console.error("Historical reconstruction failed:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     if (lat && lng) preFetchHistory();
//   }, [lat, lng]);

//   const activeHistory = historyBundle ? historyBundle[timeRange] : null;

//   const getPreviousValue = (key, currentVal) => {
//     if (!activeHistory || !activeHistory.drifts) return currentVal;
//     const drift = activeHistory.drifts[key] || 0;
//     return Math.max(0, Math.min(100, currentVal + drift));
//   };

//   const trendData = [
//     { name: 'Historical', score: activeHistory?.score || (data.suitability_score + 5) },
//     { name: 'Midpoint', score: activeHistory ? (activeHistory.score + data.suitability_score) / 2 : data.suitability_score + 2 },
//     { name: 'Current', score: data.suitability_score },
//   ];

//   const totalShift = activeHistory 
//     ? ((data.suitability_score - activeHistory.score) / activeHistory.score) * 100 
//     : 0;

//   return (
//     <div className="history-page-overlay">
//       <div className="history-content-wrapper">
//         <header className="history-header-responsive">
//           <div className="header-top-row">
//             <button className="back-link-glass" onClick={onClose}>← EXIT ANALYSIS</button>
//             <div className="live-clock-responsive">
//               {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
//             </div>
//           </div>

//           <div className="header-main-info">
//             <h1 className="location-title">{locationName}</h1>
//             <div className="coord-badge-responsive">
//               <span>LAT: {parseFloat(lat).toFixed(4)}</span>
//               <span className="sep">|</span>
//               <span>LNG: {parseFloat(lng).toFixed(4)}</span>
//             </div>
//           </div>

//           <div className="range-picker-responsive">
//             {RANGES.map(range => (
//               <button 
//                 key={range} 
//                 className={`range-btn-new ${timeRange === range ? 'active' : ''}`} 
//                 onClick={() => setTimeRange(range)}
//               >
//                 {range}
//               </button>
//             ))}
//           </div>
//         </header>

//         <main className="history-main-layout">
//           <section className="insight-card-new chart-section">
//             <div className="card-header-flex">
//               <h3>Suitability Trajectory ({timeRange})</h3>
//               {/* RESTORED: Exact Syncing display inside the card header */}
//               {isLoading && <span className="sync-pulse">Syncing...</span>}
//             </div>
//             <div className="chart-container-responsive" style={{ minHeight: '300px', width: '100%' }}>
//               <ResponsiveContainer width="99%" height={300}>
//                 <AreaChart data={trendData}>
//                   <defs>
//                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
//                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
//                   <XAxis dataKey="name" hide />
//                   <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
//                   <Tooltip 
//                     contentStyle={{ borderRadius: '12px', background: '#111', border: '1px solid #333', fontSize: '12px' }}
//                     itemStyle={{ color: '#3b82f6' }}
//                   />
//                   <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#colorScore)" strokeWidth={3} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </section>

//           <div className="details-grid-responsive">
//             <section className="insight-card-new drift-details">
//               <h3>Factor Drift Details</h3>
//               <div className="factors-scroll-container">
//                 {Object.keys(data.factors).map(key => (
//                   <FactorBar 
//                     key={key} 
//                     label={key.replace('_', ' ').toUpperCase()} 
//                     value={data.factors[key]} 
//                     previousValue={getPreviousValue(key, data.factors[key])} 
//                   />
//                 ))}
//               </div>
//             </section>

//             <section className="insight-card-new ai-analysis">
//               <h3>GeoGPT {timeRange} Analysis</h3>
//               <div className="gpt-body">
//                 <p className="summary-text">
//                   Temporal analysis indicates a <span className="highlight">{totalShift.toFixed(1)}%</span> net shift.
//                 </p>
//                 <div className="analysis-stats">
//                   <div className="stat-row">
//                     <span>Baseline Score</span>
//                     <span>{activeHistory?.score?.toFixed(1) || '---'}</span>
//                   </div>
//                   <div className="stat-row">
//                     <span>Climate Variance</span>
//                     <span>{Math.abs(activeHistory?.drifts?.rainfall || 0).toFixed(1)}%</span>
//                   </div>
//                   <div className="stat-row">
//                     <span>Land Use Change</span>
//                     <span>{Math.abs(activeHistory?.drifts?.landuse || 0).toFixed(1)}%</span>
//                   </div>
//                 </div>
//                 {activeHistory?.observation && (
//                   <div className="gpt-observation" style={{marginTop: '15px', fontSize: '12px', opacity: 0.8, borderTop: '1px solid #333', paddingTop: '10px'}}>
//                     {activeHistory.observation}
//                   </div>
//                 )}
//               </div>
//             </section>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FactorBar from '../FactorBar/FactorBar';
import './HistoryView.css';
import { API_BASE } from "../../config/api";

// Static constant for index mapping
const RANGES = ['1W', '1M', '1Y', '10Y'];

export default function HistoryView({ data, locationName, onClose, lat, lng }) {
  // logic change: rangeIndex tracks the slider (0-3), timeRange is derived from it
  const [rangeIndex, setRangeIndex] = useState(3); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [historyBundle, setHistoryBundle] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const timeRange = RANGES[rangeIndex];

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
        
        if (!response.ok) {
           throw new Error(`HTTP Error ${response.status}`);
        }

        const text = await response.text();
        console.log("RAW RESPONSE:", text);
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
    
    // Brief visual pulse to show the UI is recalibrating the bars
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

          {/* New Temporal Slider Implementation */}
          {/* <div className="time-slider-container">
            <div className="slider-labels">
              {RANGES.map((r, i) => (
                <span key={r} className={rangeIndex === i ? 'active' : ''}>{r}</span>
              ))}
            </div>
            <input 
              type="range" 
              min="0" 
              max="3" 
              step="1" 
              value={rangeIndex} 
              onChange={handleSliderChange}
              className="temporal-range-slider"
            />
          </div> */}
          <div className="time-slider-container">
    <div className="slider-labels">
      {RANGES.map((r, i) => (
        <span key={r} className={rangeIndex === i ? 'active' : ''}>
          {r}
        </span>
      ))}
    </div>
    <input 
      type="range" 
      min="0" 
      max="3" 
      step="1" 
      value={rangeIndex} 
      onChange={handleSliderChange}
      className="temporal-range-slider"
    />
  </div>
        </header>

        <main className="history-main-layout">
          <section className="insight-card-new chart-section">
            <div className="card-header-flex">
              <h3>Suitability Trajectory ({timeRange})</h3>
              {(isLoading || isSwitching) && <span className="sync-pulse">Syncing...</span>}
            </div>
            <div className="chart-container-responsive" style={{ minHeight: '300px', width: '100%' }}>
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
                    contentStyle={{ borderRadius: '12px', background: '#111', border: '1px solid #333', fontSize: '12px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#colorScore)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="details-grid-responsive">
            <section className="insight-card-new drift-details">
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

            <section className="insight-card-new ai-analysis">
              <h3>GeoGPT {timeRange} Analysis</h3>
              {/* Urbanization Velocity Gauge */}
<div className="velocity-gauge-container">
  <h4>Urbanization Velocity</h4>
  <div className="gauge-wrapper">
    <div className="gauge-body">
      {/* The needle rotates based on the score (0-10 mapped to -90deg to 90deg) */}
      <div 
        className="gauge-needle" 
        style={{ transform: `rotate(${(activeHistory?.velocity?.score * 18) - 90}deg)` }}
      ></div>
    </div>
    <div className="gauge-labels">
      <span>Stable</span>
      <span>Expanding</span>
      <span>Hyper-Growth</span>
    </div>
  </div>
  <p className="velocity-status">
    Current Pace: <span className="highlight-text">{activeHistory?.velocity?.label || "Calculating..."}</span>
  </p>
</div>
              <div className="gpt-body">
                <p className="summary-text">
                  Temporal analysis indicates a <span className="highlight">{totalShift.toFixed(1)}%</span> net shift.
                </p>
                <div className="analysis-stats">
                  <div className="stat-row">
                    <span>Baseline Score</span>
                    <span>{activeHistory?.score?.toFixed(1) || '---'}</span>
                  </div>
                  <div className="stat-row">
                    <span>Climate Variance</span>
                    <span>{Math.abs(activeHistory?.drifts?.rainfall || 0).toFixed(1)}%</span>
                  </div>
                  <div className="stat-row">
                    <span>Land Use Change</span>
                    <span>{Math.abs(activeHistory?.drifts?.landuse || 0).toFixed(1)}%</span>
                  </div>
                </div>
                {activeHistory?.observation && (
                  <div className="gpt-observation" style={{marginTop: '15px', fontSize: '12px', opacity: 0.8, borderTop: '1px solid #333', paddingTop: '10px'}}>
                    {activeHistory.observation}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}