// import React, { useState, useEffect } from 'react';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import FactorBar from '../FactorBar/FactorBar';
// import './HistoryView.css';

// export default function HistoryView({ data, locationName, onClose, lat, lng }) {
//   const [timeRange, setTimeRange] = useState('10Y');
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [historyDrift, setHistoryDrift] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch("/history_analysis", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             latitude: lat,
//             longitude: lng,
//             range: timeRange
//           }),
//         });
//         const result = await response.json();
//         setHistoryDrift(result);
//       } catch (err) {
//         console.error("Failed to fetch historical drift:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     if(lat && lng) fetchHistory();
//   }, [timeRange, lat, lng]);

//   const getPreviousValue = (key, currentVal) => {
//     if (!historyDrift) return currentVal;
//     const driftKey = `${key}_drift`;
//     const drift = historyDrift[driftKey] || 0;
//     return Math.max(0, Math.min(100, currentVal + drift));
//   };

//   const trendData = [
//     { name: 'Historical', score: data.suitability_score + (historyDrift?.total_drift || 10) },
//     { name: 'Midpoint', score: data.suitability_score + ((historyDrift?.total_drift || 10) / 2) },
//     { name: 'Current', score: data.suitability_score },
//   ];

//   return (
//     <div className="history-page-overlay">
//       <div className="history-content-wrapper">
//         <header className="history-header-responsive">
//           <div className="header-top-row">
//             <button className="back-link-glass" onClick={onClose}>← EXIT</button>
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
//             {['1W', '1M', '1Y', '10Y'].map(range => (
//               <button 
//                 key={range} 
//                 className={`range-btn-new ${timeRange === range ? 'active' : ''}`} 
//                 onClick={() => setTimeRange(range)}
//                 disabled={isLoading}
//               >{range}</button>
//             ))}
//           </div>
//         </header>

//         <main className="history-main-layout">
//           {/* Main Chart Section */}
//           <section className="insight-card-new chart-section">
//             <div className="card-header-flex">
//               <h3>Suitability Trend ({timeRange})</h3>
//               {isLoading && <span className="sync-pulse">Syncing...</span>}
//             </div>
//             <div className="chart-container-responsive">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={trendData}>
//                   <defs>
//                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
//                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
//                   <XAxis dataKey="name" hide />
//                   <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
//                   <Tooltip 
//                     contentStyle={{ borderRadius: '12px', background: '#111', border: '1px solid #333', fontSize: '12px' }}
//                     itemStyle={{ color: '#3b82f6' }}
//                   />
//                   <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#colorScore)" strokeWidth={3} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </section>

//           {/* Details Grid - Responsive Stacking */}
//           <div className="details-grid-responsive">
//             <section className="insight-card-new drift-details">
//               <h3>Factor Drift Details</h3>
//               <div className="factors-scroll-container">
//                 {Object.keys(data.factors).map(key => (
//                   <FactorBar 
//                     key={key} 
//                     label={key.replace('_', ' ')} 
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
//                   Temporal analysis indicates a <span className="highlight">{(historyDrift?.total_drift || 0).toFixed(1)}%</span> net shift.
//                 </p>
//                 <div className="analysis-stats">
//                   <div className="stat-row">
//                     <span>Baseline Score</span>
//                     <span>{(data.suitability_score + (historyDrift?.total_drift || 0)).toFixed(1)}</span>
//                   </div>
//                   <div className="stat-row">
//                     <span>Climate Variance</span>
//                     <span>{Math.abs(historyDrift?.rainfall_drift || 0).toFixed(1)}%</span>
//                   </div>
//                   <div className="stat-row">
//                     <span>Land Use Change</span>
//                     <span>{Math.abs(historyDrift?.landuse_drift || 0).toFixed(1)}%</span>
//                   </div>
//                 </div>
//               </div>
//             </section>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import FactorBar from '../FactorBar/FactorBar';
// import './HistoryView.css';
// import { API_BASE } from "../../config/api";
// export default function HistoryView({ data, locationName, onClose, lat, lng }) {
//   const [timeRange, setTimeRange] = useState('10Y');
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [historyDrift, setHistoryDrift] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       setIsLoading(true);
//       try {
//         // const response = await fetch("/history_analysis", {
//         //   method: "POST",
//         //   headers: { "Content-Type": "application/json" },
//         //   body: JSON.stringify({
//         //     latitude: lat,
//         //     longitude: lng,
//         //     range: timeRange
//         //   }),
//         // });
//         // Replace the fetch line with this:
//         const response = await fetch(`${API_BASE}/history_analysis`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 latitude: lat,
//                 longitude: lng,
//                 range: timeRange
//             }),
//         });
//         const result = await response.json();
//         setHistoryDrift(result);
//       } catch (err) {
//         console.error("Failed to fetch historical drift:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     if(lat && lng) fetchHistory();
//   }, [timeRange, lat, lng]);

//   /**
//    * MAPPING LOGIC:
//    * Maps current backend keys to the frontend keys used by FactorBar
//    */
//   // const getPreviousValue = (key, currentVal) => {
//   //   if (!historyDrift || !historyDrift.drift_analysis) return currentVal;
    
//   //   // Mapping backend drift keys to factor keys
//   //   const driftMapping = {
//   //     'rainfall': 'rainfall_change',
//   //     'proximity': 'urban_expansion',
//   //     'landuse': 'vegetation_loss'
//   //   };

//   //   const driftKey = driftMapping[key];
//   //   const drift = historyDrift.drift_analysis[driftKey] || 0;
    
//   //   // Previous = Current - Change (to show the past state)
//   //   return Math.max(0, Math.min(100, currentVal + drift));
//   // };
// // Replace your getPreviousValue with this exact code:
// const getPreviousValue = (key, currentVal) => {
//   // 1. Safety check for the new drift_analysis object
//   if (!historyDrift || !historyDrift.drift_analysis) return currentVal;
  
//   // 2. Direct lookup by key (e.g., 'rainfall', 'landuse')
//   const drift = historyDrift.drift_analysis[key] || 0;
  
//   // 3. Calculation: To show the previous state bar, we add the drift back
//   const prevVal = currentVal + drift;
  
//   // 4. Boundary check
//   return Math.max(0, Math.min(100, prevVal));
// };
//   // Syncing chart with actual backend scores
//   const trendData = [
//     { 
//         name: 'Historical', 
//         score: historyDrift?.historical_score || (data.suitability_score + 5) 
//     },
//     { 
//         name: 'Midpoint', 
//         score: historyDrift ? (historyDrift.historical_score + historyDrift.current_score) / 2 : data.suitability_score + 2 
//     },
//     { 
//         name: 'Current', 
//         score: data.suitability_score 
//     },
//   ];

//   // Calculate total net shift percentage
//   // const totalShift = historyDrift ? (historyDrift.current_score - historyDrift.historical_score) : 0;
//   const totalShift = historyDrift
//   ? ((historyDrift.current_score - historyDrift.historical_score)
//      / historyDrift.historical_score) * 100
//   : 0;


//   return (
//     <div className="history-page-overlay">
//       <div className="history-content-wrapper">
//         <header className="history-header-responsive">
//           <div className="header-top-row">
//             <button className="back-link-glass" onClick={onClose}>← EXIT</button>
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
//             {['1W', '1M', '1Y', '10Y'].map(range => (
//               <button 
//                 key={range} 
//                 className={`range-btn-new ${timeRange === range ? 'active' : ''}`} 
//                 onClick={() => setTimeRange(range)}
//                 disabled={isLoading}
//               >{range}</button>
//             ))}
//           </div>
//         </header>

//         <main className="history-main-layout">
//           {/* Main Chart Section */}
//           <section className="insight-card-new chart-section">
//             <div className="card-header-flex">
//               <h3>Suitability Trend ({timeRange})</h3>
//               {isLoading && <span className="sync-pulse">Syncing...</span>}
//             </div>
//             <div className="chart-container-responsive">
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
//                   <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
//                   <Tooltip 
//                     contentStyle={{ borderRadius: '12px', background: '#111', border: '1px solid #333', fontSize: '12px' }}
//                     itemStyle={{ color: '#3b82f6' }}
//                   />
//                   <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="url(#colorScore)" strokeWidth={3} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </section>

//           {/* Details Grid - Responsive Stacking */}
//           <div className="details-grid-responsive">
//             <section className="insight-card-new drift-details">
//               <h3>Factor Drift Details</h3>
//               <div className="factors-scroll-container">
//                 {Object.keys(data.factors).map(key => (
//                   <FactorBar 
//                     key={key} 
//                     label={key.replace('_', ' ')} 
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
//                     <span>Historical Score</span>
//                     <span>{historyDrift?.historical_score?.toFixed(1) || '---'}</span>
//                   </div>
//                   <div className="stat-row">
//                     <span>Climate Variance</span>
//                     {/* <span>{Math.abs(historyDrift?.drift_analysis?.rainfall_change || 0).toFixed(1)}%</span> */}
//                     <span>{Math.abs(historyDrift?.drift_analysis?.rainfall || 0).toFixed(1)}%</span>
//                   </div>
//                   <div className="stat-row">
//                     <span>Land Use Change</span>
//                     {/* <span>{Math.abs(historyDrift?.drift_analysis?.vegetation_loss || 0).toFixed(1)}%</span> */}
//                     <span>{Math.abs(historyDrift?.drift_analysis?.landuse || 0).toFixed(1)}%</span>
//                   </div>
//                 </div>
//                 {historyDrift?.observation && (
//                     <div className="gpt-observation" style={{marginTop: '15px', fontSize: '12px', opacity: 0.8, borderTop: '1px solid #333', paddingTop: '10px'}}>
//                         {historyDrift.observation}
//                     </div>
//                 )}
//               </div>
//             </section>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import FactorBar from '../FactorBar/FactorBar';
// import './HistoryView.css';
// import { API_BASE } from "../../config/api";

// export default function HistoryView({ data, locationName, onClose, lat, lng }) {
//   const [timeRange, setTimeRange] = useState('10Y');
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [historyBundle, setHistoryBundle] = useState(null); // Stores the 1W-10Y trajectory
//   const [isLoading, setIsLoading] = useState(false);
//   const ranges = ['1W', '1M', '1Y', '10Y'];

//   // Live clock synchronization
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   // Fluctuating Discovery Animation during initial load
//   useEffect(() => {
//     let index = 0;
//     const discoveryTimer = setInterval(() => {
//       if (!historyBundle && isLoading) {
//         setTimeRange(ranges[index % ranges.length]);
//         index++;
//       }
//     }, 400); 
//     return () => clearInterval(discoveryTimer);
//   }, [historyBundle, isLoading]);

//   // Pre-emptive Sync: Fetches the entire temporal trajectory once
//   useEffect(() => {
//     const preFetchHistory = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch(`${API_BASE}/history_analysis`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             latitude: lat,
//             longitude: lng
//           }),
//         });
//         const result = await response.json();
//         // Backend now returns history_bundle containing all timeframes
//         setHistoryBundle(result.history_bundle || null);
//       } catch (err) {
//         console.error("Failed to fetch historical trajectory:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     if (lat && lng) preFetchHistory();
//   }, [lat, lng]);

//   // Extract the specific data for the currently selected UI range
//   const activeHistory = historyBundle ? historyBundle[timeRange] : null;

//   const getPreviousValue = (key, currentVal) => {
//     if (!activeHistory || !activeHistory.drifts) return currentVal;
    
//     // Direct lookup by key (rainfall, proximity, soil, flood, etc.)
//     const drift = activeHistory.drifts[key] || 0;
    
//     // To show the previous state bar, we add the drift back
//     return Math.max(0, Math.min(100, currentVal + drift));
//   };

//   const trendData = [
//     { 
//       name: 'Historical', 
//       score: activeHistory?.score || (data.suitability_score + 5) 
//     },
//     { 
//       name: 'Current', 
//       score: data.suitability_score 
//     },
//   ];

//   // Calculate net shift percentage for the GeoGPT summary
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
//             {isLoading && <div className="syncing-indicator">⌛ RECONSTRUCTING TIMELINES...</div>}
//           </div>

//           <div className="range-picker-responsive">
//             {ranges.map(range => (
//               <button 
//                 key={range} 
//                 className={`range-btn-new ${timeRange === range ? 'active' : ''} ${isLoading ? 'pulse' : ''}`} 
//                 onClick={() => setTimeRange(range)}
//                 disabled={isLoading && !historyBundle}
//               >{range}</button>
//             ))}
//           </div>
//         </header>

//         <main className="history-main-layout">
//           <section className="insight-card-new chart-section">
//             <div className="card-header-flex">
//               <h3>Suitability Trajectory ({timeRange})</h3>
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
//               <h3>Geospatial Factor Reversion</h3>
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
//               <h3>GeoGPT Temporal Analysis</h3>
//               <div className="gpt-body">
//                 <p className="summary-text">
//                   Analysis indicates a <span className="highlight">{totalShift.toFixed(1)}%</span> net shift in suitability.
//                 </p>
//                 <div className="analysis-stats">
//                   <div className="stat-row">
//                     <span>Reconstructed Score</span>
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
//                   <div className="stat-row">
//                     <span>Urban Expansion</span>
//                     <span>{Math.abs(activeHistory?.drifts?.proximity || 0).toFixed(1)}%</span>
//                   </div>
//                 </div>
//                 {activeHistory?.observation && (
//                     <div className="gpt-observation" style={{marginTop: '15px', fontSize: '12px', opacity: 0.8, borderTop: '1px solid #333', paddingTop: '10px'}}>
//                         {activeHistory.observation}
//                     </div>
//                 )}
//               </div>
//             </section>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import FactorBar from '../FactorBar/FactorBar';
// import './HistoryView.css';
// import { API_BASE } from "../../config/api";

// // Static constant for time ranges
// const RANGES = ['1W', '1M', '1Y', '10Y'];

// export default function HistoryView({ data, locationName, onClose, lat, lng }) {
//   const [timeRange, setTimeRange] = useState('10Y'); 
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [historyBundle, setHistoryBundle] = useState(null); 
//   const [isLoading, setIsLoading] = useState(false);

//   // Live clock synchronization
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   /**
//    * HIGH-ACCURACY PRE-EMPTIVE SYNC
//    * Fetches the entire 1W-10Y trajectory in a single request for speed.
//    */
//   useEffect(() => {
//     const preFetchHistory = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch(`${API_BASE}/history_analysis`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ latitude: lat, longitude: lng }),
//         });
//         const result = await response.json();
//         // Stores all timelines (1W, 1M, 1Y, 10Y) pre-calculated by the backend
//         setHistoryBundle(result.history_bundle || null);
//       } catch (err) {
//         console.error("Historical reconstruction failed:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     if (lat && lng) preFetchHistory();
//   }, [lat, lng]);

//   // Extract data for the user's manual selection
//   const activeHistory = historyBundle ? historyBundle[timeRange] : null;

//   /**
//    * DRIFT CALCULATION
//    * Reverts current factors to their historical state based on scientific drift.
//    */
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
//           {/* Main Chart Section with Restored Syncing Display */}
//           <section className="insight-card-new chart-section">
//             <div className="card-header-flex">
//               <h3>Suitability Trajectory ({timeRange})</h3>
//               {/* Restored exact syncing display inside the card header */}
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

const RANGES = ['1W', '1M', '1Y', '10Y'];

export default function HistoryView({ data, locationName, onClose, lat, lng }) {
  const [timeRange, setTimeRange] = useState('10Y'); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [historyBundle, setHistoryBundle] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

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
        // SAFETY CHECK: If server rejects request, don't try to parse JSON
        if (!response.ok) {
           throw new Error(`HTTP Error ${response.status}`);
        }
        const result = await response.json();
        // Stores all timelines for instant manual switching
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

          <div className="range-picker-responsive">
            {RANGES.map(range => (
              <button 
                key={range} 
                className={`range-btn-new ${timeRange === range ? 'active' : ''}`} 
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </header>

        <main className="history-main-layout">
          <section className="insight-card-new chart-section">
            <div className="card-header-flex">
              <h3>Suitability Trajectory ({timeRange})</h3>
              {/* RESTORED: Exact Syncing display inside the card header */}
              {isLoading && <span className="sync-pulse">Syncing...</span>}
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