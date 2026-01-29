import React, { useState, useEffect, useCallback, useRef, memo } from "react";
// import { Marker, useMap, useMapEvents } from "react-leaflet";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import FactorBar from "../FactorBar/FactorBar";
import SideBar from "../SideBar/SideBar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ProMap from '../ProMap/ProMap';
import "./LandSuitabilityChecker.css";
import TopNav from "../TopNav/TopNav";
import RadarChart from "../RadarChart/RadarChart"; 
import HistoryView from "../HistoryView/HistoryView"; 
import TerrainSlope from "../TerrainSlope/TerrainSlope";
import WeatherCard from "../Weather/WeatherCard";
import SnapshotGeo from "../SnapshotGeo/SnapshotGeo";
import { API_BASE } from "../../config/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AudioLandscape from "../AudioLandscape/AudioLandscape";
// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
// const spectralLayers = {
//   standard: null,
//   ndvi: "https://services.sentinel-hub.com/ogc/wms/YOUR_API_KEY?LAYER=NDVI&...",
//   thermal: "https://services.sentinel-hub.com/ogc/wms/YOUR_API_KEY?LAYER=THERMAL&...",
//   hydrology: "https://your-backend-api.com/hydrology/{z}/{x}/{y}.png"
// };
const spectralLayers = {
  standard: null,

  ndvi: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",

  thermal: "https://tiles.maps.eox.at/wmts/1.0.0/terrain-light_3857/default/g/{z}/{y}/{x}.jpg",

  hydrology: "https://tiles.maps.eox.at/wmts/1.0.0/hydrography_3857/default/g/{z}/{y}/{x}.jpg"
};

const varieties = {
  streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
  terrain: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
  roads: "https://mt1.google.com/vt/lyrs=h&x={x}/{y}&z={z}",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  watercolor: "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg"
};

/** * UTILITY: Moved outside to avoid unnecessary dependency warnings 
 */
const isNearbyDevice = (lat1, lng1, deviceLoc) => {
  if (!deviceLoc || !deviceLoc.lat || !deviceLoc.lng) return false;
  return (
    parseFloat(lat1).toFixed(4) === deviceLoc.lat &&
    parseFloat(lng1).toFixed(4) === deviceLoc.lng
  );
};

// --- DYNAMIC INFERENCE ENGINE ---
const getSitePotential = (factors,activeSpectral) => {
  const potentials = [];
  const f = factors;

  const hazards = Object.entries(f)
    .filter(([key, val]) => (key === 'flood' || key === 'landslide' || key === 'pollution') && val < 45)
    .map(([key]) => key.toUpperCase());

  if (hazards.length > 0) {
    potentials.push({
      type: "Risk",
      label: "Environmental Constraints",
      class: "pot-red",
      icon: "⚠️",
      reason: `Warning: This site faces critical risks due to low safety scores in ${hazards.join(" & ")}. Development may require expensive mitigation or be restricted to conservation.`
    });
  }

  if (f.flood > 50 && f.landslide > 50 && f.pollution > 40) {
    const strength = f.pollution > 70 ? "pristine air quality" : "stable terrain";
    potentials.push({
      type: "Residential",
      label: "Residential Potential",
      class: "pot-green",
      icon: "🏠",
      reason: `Recommended for housing due to ${strength}. The site provides a safe foundation with manageable environmental risks.`
    });
  }

  if (f.soil > 60 || f.rainfall > 60) {
    const leadFactor = f.soil > f.rainfall ? "High Soil Nutrient Density" : "Abundant Rainfall Patterns";
    potentials.push({
      type: "Agricultural",
      label: "Agricultural Utility",
      class: "pot-blue",
      icon: "🚜",
      reason: `Viable for farming driven by ${leadFactor}. This land can support sustainable crop cycles if water management is maintained.`
    });
  }

  if (f.proximity > 60 && f.landuse > 40) {
    potentials.push({
      type: "Industrial",
      label: "Logistics & Industry",
      class: "pot-purple",
      icon: "🏭",
      reason: `Strategic for commercial use because it ranks top 20% in Infrastructure Proximity (${f.proximity.toFixed(0)}%). Ideal for warehouses or manufacturing.`
    });
  }
  // 3️⃣ HYDROLOGY INTELLIGENCE: Connect Flow to Flood Risk
  if (activeSpectral === "hydrology" && f.flood < 50) {
    potentials.push({
      type: "Risk",
      label: "Hydrological Trap",
      class: "pot-red",
      icon: "🌊",
      reason: "Overlay reveals physics-based water accumulation at this coordinate. Stormwater will likely pool here due to the terrain slope."
    });
  }

  // 2️⃣ THERMAL INTELLIGENCE: Residential Livability
  if (activeSpectral === "thermal" && f.pollution < 60) {
    potentials.push({
      type: "Climate",
      label: "Urban Heat Island",
      class: "pot-blue",
      icon: "🌡️",
      reason: "Site absorbs high solar radiation. Residential planning should include green roofing to mitigate cooling costs."
    });
  }
  return potentials;
};

const PotentialSection = ({ factors, score }) => {
  const recommendations = getSitePotential(factors);
  const rating = score > 80 ? "A" : score > 60 ? "B" : score > 40 ? "C" : "F";
  
  return (
    <div className="card potential-card glass-morphic" style={{ marginBottom: '16px' }}>
      <div className="potential-header">
        <div className="title-stack">
          <h3>Site Potential Analysis</h3>
          <p className="subtitle">Algorithmic Terrain Synthesis</p>
        </div>
        <div className="rating-badge-container">
            <span className="rating-label">Grade</span>
            <span className={`rating-letter grade-${rating}`}>{rating}</span>
        </div>
      </div>
      <div className="recommendations-list">
        {recommendations.map((rec, idx) => (
          <div key={idx} className={`potential-item ${rec.class}`}>
            <div className="potential-tag-row">
              <span className="potential-icon">{rec.icon}</span>
              <span className="potential-label">{rec.label}</span>
            </div>
            <p className="potential-reason">{rec.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
const MapClickHandler = ({ setLat, setLng, setZoom }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      setLat(e.latlng.lat.toString());
      setLng(e.latlng.lng.toString());
      setZoom(map.getZoom());
    }
  });

  return null;
};

const LocationMarker = ({ lat, lng, setLat, setLng, setZoom, isSelectingB, onSelectB }) => {
  const map = useMap();
  useMapEvents({
    click(e) {
      if (isSelectingB) onSelectB(e.latlng.lat, e.latlng.lng);
      else { 
        setLat(e.latlng.lat.toString()); 
        setLng(e.latlng.lng.toString()); 
      }
    },
    zoomend() { setZoom(map.getZoom()); },
  });

  useEffect(() => {
    const nLat = parseFloat(lat);
    const nLng = parseFloat(lng);
    if (!isNaN(nLat) && !isNaN(nLng)) {
      map.setView([nLat, nLng], map.getZoom());
    }
  }, [lat, lng, map]);

  const markerPos = [parseFloat(lat) || 0, parseFloat(lng) || 0];
  return <Marker position={markerPos} />;
};

// const FactorsSection = memo(({ data, latVal, lngVal, locationName, isDarkMode, viewMode, setViewMode, onOpenHistory, mapVariety, isCompareMode,activeSpectral,mapMode,         // ADD THIS
//   active3DStyle }) => {
  const FactorsSection = memo(({ 
  // data, latVal, lngVal, locationName, isDarkMode, viewMode, setViewMode, 
  // onOpenHistory, mapVariety, isCompareMode, activeSpectral, mapMode, 
  // active3DStyle, setLat, setLng,  isSelectingB, handleCompareSelect,currentZoom, setCurrentZoom, onZoomIn, onZoomOut, toggleFullScreen,zoom,setzoom // ADD THESE
  data, latVal, lngVal, locationName, isDarkMode, viewMode, setViewMode, 
  onOpenHistory, mapVariety, isCompareMode, activeSpectral, mapMode, 
  active3DStyle, setLat, setLng, isSelectingB, handleCompareSelect,
  currentZoom, setCurrentZoom, zoom// ✅ CLEAN NAMES
}) => {
  // console.log("FULL DATA OBJECT RECEIVED:", data);

  const nLat = parseFloat(latVal);
  const nLng = parseFloat(lngVal);
  const isValidCoords = !isNaN(nLat) && !isNaN(nLng);

  const FactorCard = (
    <div className="card factors-card">
      <div className="factors-header">
        <h3>Terrain Factors</h3>
        <button className="view-toggle" onClick={() => setViewMode(viewMode === "bars" ? "radar" : "bars")}>
            {viewMode === "bars" ? "🕸️ Radar View" : "📊 Bar View"}
        </button>
      </div>

      {viewMode === "bars" ? (
        <div className="bars-container">
          {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(f => (
            <FactorBar key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} value={data.factors[f] ?? 0} />
          ))}
        </div>
      ) : (
        <div className="radar-container" style={{ height: '300px', width: '100%', position: 'relative' }}>
            <RadarChart key={`radar-${nLat}-${nLng}`} data={data.factors} isDarkMode={isDarkMode} />
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`card hero-card glass-morphic ${data.suitability_score < 40 ? 'danger-glow' : ''}`}>
  {/* <div className="mini-map-context">
    {isValidCoords ? (
      <>
        <MapContainer 
          center={[nLat, nLng]} 
          zoom={15} 
          zoomControl={false} 
          dragging={false} 
          touchZoom={false} 
          scrollWheelZoom={false} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url={varieties[mapVariety] || varieties.hybrid} />
          
          {activeSpectral !== "standard" && spectralLayers[activeSpectral] && (
            <TileLayer 
              key={activeSpectral} 
              url={spectralLayers[activeSpectral]} 
              opacity={0.7} 
              zIndex={100} 
            />
          )}
          <Marker position={[nLat, nLng]} />
        </MapContainer>

        
      </>
    ) : (
      <div className="empty-results" style={{ fontSize: '11px' }}>
        Awaiting Geospatial Analysis...
      </div>
    )}
    <div className="mini-map-label">Tactical Preview</div>
  </div> */}
  {/* <div className="mini-map-context">
  {isValidCoords ? (
    
    <ProMap 
      lat={nLat} 
      lng={nLng} 
      factors={data.factors} 
      isDarkMode={isDarkMode} 
    />
  ) : (
    <div className="empty-results" style={{ fontSize: '11px' }}>
      Awaiting Geospatial Analysis...
    </div>
  )}
  <div className="mini-map-label">Tactical 3D Preview</div>
</div> */}
<div className="mini-map-context">
  {isValidCoords ? (
    mapMode === "2D" ? (
      /* 2D Minimap */
      <MapContainer 
        center={[nLat, nLng]} 
        // zoom={15} 
        zoom={zoom}               // ✅ REQUIRED: Pass the state
    key={`map-2d-${zoom}`}
        zoomControl={false} 
        dragging={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={varieties[mapVariety] || varieties.hybrid} />
        {/* ✅ RESTORED FOR MINIMAP */}
        {activeSpectral !== "standard" && spectralLayers[activeSpectral] && (
          <TileLayer 
            key={activeSpectral} 
            url={spectralLayers[activeSpectral]} 
            opacity={0.7} 
            zIndex={100} 
          />
        )}
        <Marker position={[nLat, nLng]} />
        <LocationMarker 
       lat={latVal} lng={lngVal} 
       setLat={setLat} setLng={setLng} 
       setZoom={setCurrentZoom} 
       isSelectingB={isSelectingB} 
       onSelectB={handleCompareSelect} 
    />
      </MapContainer>
    ) : (
      /* 3D Minimap */
      <ProMap 
        lat={nLat} 
        lng={nLng} 
        setLat={setLat} // Fixed: Passing setter to 3D
    setLng={setLng}
    zoom={currentZoom}
        factors={data.factors} 
        isDarkMode={isDarkMode} 
        activeStyle={active3DStyle}
        interactive={false}
      />
    )
  ) : (
    <div className="empty-results" style={{ fontSize: '11px' }}>Awaiting Analysis...</div>
  )}
  <div className="mini-map-label">{mapMode} Tactical Preview</div>
</div>



        <div className="card-coordinates">
          <span>LAT: {isValidCoords ? nLat.toFixed(4) : "0.0000"}</span>
          <span>LNG: {isValidCoords ? nLng.toFixed(4) : "0.0000"}</span>
        </div>
        
        <div className="suitability-header-row">
          <h3>Suitability Intelligence</h3>
        </div>

        <div className="score-value" style={{ "--score-color": data.suitability_score < 40 ? "#ef4444" : data.suitability_score < 70 ? "#f59e0b" : "#10b981"}}>
          {data.suitability_score?.toFixed(1)}
        </div>
        <div className={`status-pill ${data.label?.toLowerCase().replace(/\s+/g, '-')}`}>{data.label}</div>
{}
          <div className="history-action-container">
          <button 
            className="history-pro-btn" 
            onClick={() => onOpenHistory(data, locationName, latVal, lngVal)} 
            title="Execute Temporal Analysis"
          >
            <span className="pulse-dot"></span>
            <span className="btn-text">ANALYZE HISTORICAL TRENDS</span>
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>
      {/* 2. Factor Card: Terrain Factors (Charts/Bars) */}
      {FactorCard}

      
    </>
  );
});

export default function LandSuitabilityChecker() {
  // 1. Add new state at the top of your component
  // 1. Ensure zoom is at the top level
// const [zoom, setZoom] = useState(13);

// 2. Wrap zoom in a function that the buttons call
const handleZoomIn = () => {
  setZoom(prev => Math.min(prev + 1, 20)); // Limit to max 20
};

const handleZoomOut = () => {
  setZoom(prev => Math.max(prev - 1, 2)); // Limit to min 2
};
// 3. FULLSCREEN FIX: Add a null check to avoid the error you saw
const toggleFullScreen = () => {
  const mapElement = mapViewportRef.current;
  if (!mapElement) return;

  if (!document.fullscreenElement) {
    mapElement.requestFullscreen().catch(err => {
      console.error("Fullscreen failed:", err);
    });
  } else {
    document.exitFullscreen();
  }
};

const [mapMode, setMapMode] = useState("2D"); // "2D" or "3D"
const [active3DStyle, setActive3DStyle] = useState("satellite");
  const initialAnalysisRef = useRef(false); // Flag to prevent double execution on mount
  const [mobileCompareSite, setMobileCompareSite] = useState("A");
  const [deviceLocation, setDeviceLocation] = useState({ lat: null, lng: null });
  const [analysisHistory, setAnalysisHistory] = useState(() => 
      JSON.parse(localStorage.getItem("analysis_history")) || []
  );
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  const [lat, setLat] = useState(() => localStorage.getItem("geo_lat") || "17.385");
  const [lng, setLng] = useState(() => localStorage.getItem("geo_lng") || "78.4867");
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem("geo_zoom")) || 13);
  const [mapVariety, setMapVariety] = useState(() => localStorage.getItem("geo_map_style") || "streets");
  const [activeTab, setActiveTab] = useState("suitability");
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("geo_theme")) ?? true);
  // const [result, setResult] = useState(() => JSON.parse(localStorage.getItem("geo_last_result")) || null);
  // const [result, setResult] = useState(null);
  const [result, setResult] = useState(() => JSON.parse(localStorage.getItem("geo_last_result")) || null);
  const [compareResult, setCompareResult] = useState(() => JSON.parse(localStorage.getItem("geo_last_compare_result")) || null);
const [isCompareMode, setIsCompareMode] = useState(() => JSON.parse(localStorage.getItem("geo_is_compare")) || false);
const [showLocationB, setShowLocationB] = useState(() => JSON.parse(localStorage.getItem("geo_show_b")) || false);
const [locationAName, setLocationAName] = useState(() => localStorage.getItem("geo_name_a") || "Site A");
const [locationBName, setLocationBName] = useState(() => localStorage.getItem("geo_name_b") || "Site B");
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem("sidebar_width")) || 320);
  const [bottomHeight, setBottomHeight] = useState(() => Number(localStorage.getItem("bottom_height")) || 380);
  // LandSuitabilityChecker.js - At the top of the component

  const isResizingSide = useRef(false);
  const isResizingBottom = useRef(false);

  // const [isCompareMode, setIsCompareMode] = useState(false);
  // const [compareResult, setCompareResult] = useState(null);
  const [compareName, setCompareName] = useState("");
  const [isSelectingB, setIsSelectingB] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [bLatInput, setBLatInput] = useState("");
  const [bLngInput, setBLngInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [debug] = useState(false);
  const [viewMode, setViewMode] = useState("bars"); 

  const [showHistory, setShowHistory] = useState(false); 
  const [historyTargetData, setHistoryTargetData] = useState(null);
  const [historyTargetName, setHistoryTargetName] = useState("");
  const [historyTargetCoords, setHistoryTargetCoords] = useState({ lat: "", lng: "" });
const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [savedPlaces, setSavedPlaces] = useState(() => JSON.parse(localStorage.getItem("savedPlaces")) || []);
  const [analyzedCoords, setAnalyzedCoords] = useState({ lat: null, lng: null });
  const [analyzedCoordsB, setAnalyzedCoordsB] = useState({ lat: null, lng: null });
  // const [locationAName, setLocationAName] = useState("Site A");
  // const [locationBName, setLocationBName] = useState("Site B");
  // const [showLocationB, setShowLocationB] = useState(false);
  const [isBFromSavedPlace] = useState(false);
  
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyData, setNearbyData] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyDataB, setNearbyDataB] = useState(null);
  const [nearbyLoadingB, setNearbyLoadingB] = useState(false);
  const [showNearbyB, setShowNearbyB] = useState(false);

  const [isGptOpen, setIsGptOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([{ role: 'assistant', content: 'Hello! I am GeoGPT.' }]);
  const [userQuery, setUserQuery] = useState("");
  const [gptLoading, setGptLoading] = useState(false);
  const chatEndRef = useRef(null);
  // Snapshot States
const [snapshotData, setSnapshotData] = useState(null);       // Site A
// const [setSnapshotDataB] = useState(null); 
const [snapshotDataB, setSnapshotDataB] = useState(null);   // Site B
const [snapshotLoading, setSnapshotLoading] = useState(false);

// --- UTILITY FUNCTIONS DEFINED FIRST TO AVOID NO-UNDEF ERRORS ---
  
  const fetchSnapshot = useCallback(async (tLat, tLng) => {
    try {
      const res = await fetch(`${API_BASE}/snapshot_identity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: parseFloat(tLat), longitude: parseFloat(tLng) })
      });
      return await res.json();
    } catch (err) { 
      console.error("Snapshot error:", err);
      return null; 
    }
  }, []);

  const performAnalysis = useCallback(async (tLat, tLng) => {
    try {
      const response = await fetch(`${API_BASE}/suitability`, {

        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ latitude: parseFloat(tLat), longitude: parseFloat(tLng), debug }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Analysis Request Failed:", error);
      throw error; 
    }
  }, [debug]);

const resolveLocationName = useCallback((targetLat, targetLng, defaultFallback) => {
    const curLat = parseFloat(targetLat).toFixed(4);
    const curLng = parseFloat(targetLng).toFixed(4);

    // Condition 1: Check Saved Places
    const matchedPlace = savedPlaces.find(p => 
      p.lat.toFixed(4) === curLat && p.lng.toFixed(4) === curLng
    );
    if (matchedPlace) return matchedPlace.name;

    // Condition 2: Check if it's the User's current physical device location
    if (isNearbyDevice(targetLat, targetLng, deviceLocation)) {
      return "My Location";
    }

    // Condition 3: Prompt for new name because coordinates changed
    const userName = prompt(`New location detected at ${curLat}, ${curLng}. Enter a name:`);
    return userName || defaultFallback;
}, [savedPlaces, deviceLocation]);


const handleCompareSelect = useCallback(async (tLat, tLng, existingName = null) => {
    setIsSelectingB(false);
    setBLatInput(tLat.toString());
    setBLngInput(tLng.toString());
    
    let name = existingName || resolveLocationName(tLat, tLng, "Site B");
    
    setCompareName(name);
    setLocationBName(name);
    setCompareLoading(true);
    setIsCompareMode(true);
    setCompareResult(null); 

    try { 
      // FIXED: Parallel fetch for both suitability and snapshot identity for Site B
      const [suitResult, snapData] = await Promise.all([
          performAnalysis(tLat, tLng),
          fetchSnapshot(tLat, tLng)
      ]);

      setCompareResult(suitResult);
      setSnapshotDataB(snapData); // Now snapData is correctly defined from the fetch
      setAnalyzedCoordsB({ lat: tLat.toString(), lng: tLng.toString() });
    } catch (err) { 
      console.error(err); 
    } finally { 
      setCompareLoading(false); 
    }
}, [resolveLocationName, performAnalysis, fetchSnapshot]);

useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      setDeviceLocation({
        lat: pos.coords.latitude.toFixed(4),
        lng: pos.coords.longitude.toFixed(4)
      });
    });
  }
}, []);


const handleSubmit = useCallback(async (e) => {
  // Safe check for automatic calls from useEffect (where 'e' might be undefined)
  if (e && e.preventDefault) e.preventDefault();

  // Check if coordinates have changed since last analysis
  const hasAChanged = analyzedCoords.lat !== lat || analyzedCoords.lng !== lng;

  // 1. Determine Name A: 
  // Use existing state if set, otherwise use resolver (Saved Places > My Loc > Prompt)
  // Logic preserves your requirement to re-prompt if coordinates moved
  let nameA = locationAName;
  if (locationAName === "Site A" || hasAChanged) {
    nameA = resolveLocationName(lat, lng, "Site A");
    setLocationAName(nameA);
  } else {
    setLocationAName(nameA);
  }

  // Reset results and start loading states
  setResult(null);
  setCompareResult(null);
  setSnapshotData(null);
  
  // Ensure snapshotDataB state is cleared correctly
  if (setSnapshotDataB) setSnapshotDataB(null);
  
  setLoading(true);
  setSnapshotLoading(true);

  // Capture current state of comparison for this specific submission
  const activeCompareMode = showLocationB && bLatInput && bLngInput;

  if (activeCompareMode) {
    setIsCompareMode(true);
    setCompareLoading(true);
    
    // Determine Name B for UI consistency
    const nameB = (locationBName && locationBName !== "Site B") 
      ? locationBName 
      : resolveLocationName(bLatInput, bLngInput, "Site B");
      
    setLocationBName(nameB);
    setCompareName(nameB);
  } else {
    setIsCompareMode(false);
  }

  // Build the list of parallel tasks
  const tasks = [
    performAnalysis(lat, lng),
    fetchSnapshot(lat, lng)
  ];

  if (activeCompareMode) {
    tasks.push(performAnalysis(bLatInput, bLngInput));
    tasks.push(fetchSnapshot(bLatInput, bLngInput));
  }

  try {
    const results = await Promise.allSettled(tasks);

    // --- SITE A RESULTS & UNIFIED HISTORY ---
    if (results[0].status === 'fulfilled') {
      const analysisData = results[0].value;
      setResult(analysisData);
      setAnalyzedCoords({ lat, lng });

      // Identify Score B from the task results (index 2) directly to ensure history accuracy
      const scoreBVal = (activeCompareMode && results[2]?.status === 'fulfilled') 
        ? results[2].value.suitability_score 
        : undefined;

      // Final check for nameB to ensure the history entry isn't saved as default "Site B" if a name exists
      const finalNameB = activeCompareMode 
        ? (locationBName !== "Site B" ? locationBName : resolveLocationName(bLatInput, bLngInput, "Site B")) 
        : null;

      // UNIFIED HISTORY ENTRY: Stores both sites in one row if comparing.
      const newHistoryEntry = {
        name: nameA,
        lat,
        lng,
        score: analysisData.suitability_score,
        timestamp: new Date().getTime(),
        // Comparison Data:
        isCompareMode: activeCompareMode,
        nameB: finalNameB,
        bLat: activeCompareMode ? bLatInput : null,
        bLng: activeCompareMode ? bLngInput : null,
        scoreB: scoreBVal 
      };

      setAnalysisHistory(prev => {
        const updated = [newHistoryEntry, ...prev].slice(0, 20);
        localStorage.setItem("analysis_history", JSON.stringify(updated));
        return updated;
      });
    }

    if (results[1].status === 'fulfilled') {
      setSnapshotData(results[1].value);
    }

    // --- SITE B DATA PROCESSING (UI states only) ---
    if (activeCompareMode) {
      if (results[2] && results[2].status === 'fulfilled') {
        const compareData = results[2].value;
        setCompareResult(compareData);
        setAnalyzedCoordsB({ lat: bLatInput.toString(), lng: bLngInput.toString() });
      }

      if (results[3] && results[3].status === 'fulfilled') {
        if (setSnapshotDataB) setSnapshotDataB(results[3].value);
      }
    }

  } catch (err) {
    console.error("Critical Analysis Error:", err);
  } finally {
    setLoading(false);
    setCompareLoading(false);
    setSnapshotLoading(false);
  }
}, [
  lat, 
  lng, 
  locationAName, 
  locationBName, 
  bLatInput, 
  bLngInput, 
  showLocationB, 
  resolveLocationName, 
  performAnalysis, 
  fetchSnapshot, 
  setSnapshotDataB, 
  setAnalysisHistory,
  analyzedCoords.lat, 
  analyzedCoords.lng,
]);


const mapViewportRef = useRef(null); // Reference for Fullscreen targeting

// const toggleFullScreen = () => {
//   // Check if current is not null before calling the API
//   if (mapContainerRef.current) {
//     if (!document.fullscreenElement) {
//       mapContainerRef.current.requestFullscreen().catch(err => {
//         console.warn(`Fullscreen error: ${err.message}`);
//       });
//     } else {
//       document.exitFullscreen();
//     }
//   } else {
//     console.error("Map container reference not found.");
//   }
// };

  // --- NEW: Zoom Logic (shared between 2D and 3D) ---
  // const handleZoom = (delta) => {
  //   setZoom(prev => {
  //     const next = prev + delta;
  //     return Math.min(Math.max(next, 2), 20); // Scale range 2-20
  //   });
  // };
// Monitor Coordinate Changes to Reset Names/Analysis for Site B
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  // 1. Skip logic if currently loading a shared link
  if (params.get("bLat")) return;

  const currentLatB = parseFloat(bLatInput).toFixed(4);
  const currentLngB = parseFloat(bLngInput).toFixed(4);

  // 2. Check if the new coordinates match a Saved Place
  const matchedB = savedPlaces.find(p => 
    parseFloat(p.lat).toFixed(4) === currentLatB && 
    parseFloat(p.lng).toFixed(4) === currentLngB
  );

  if (matchedB) {
    // 3. Adopt saved name
    setLocationBName(matchedB.name);
  } else if (analyzedCoordsB.lat && bLatInput !== analyzedCoordsB.lat.toString()) {
    // 4. Reset to "Site B" and clear old comparison data
    setLocationBName("Site B");
    setCompareResult(null);
  }
}, [bLatInput, bLngInput, analyzedCoordsB.lat, savedPlaces]);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("lat")) return; // Don't interfere with share links

  const currentLat = parseFloat(lat).toFixed(4);
  const currentLng = parseFloat(lng).toFixed(4);

  // 1. Check if the new coordinates match a Saved Place
  const matched = savedPlaces.find(p => 
    p.lat.toFixed(4) === currentLat && p.lng.toFixed(4) === currentLng
  );

  if (matched) {
    // Automatically adopt the saved name
    setLocationAName(matched.name);
  } else if (analyzedCoords.lat && lat !== analyzedCoords.lat.toString()) {
    // 2. Only reset to "Site A" if coordinates moved away from last analysis 
    // AND it's not a saved place
    setLocationAName("Site A");
    setResult(null); 
  }
}, [lat, lng, analyzedCoords, savedPlaces]); // Added savedPlaces to dependencies

useEffect(() => {
  // Check if we already handled the URL analysis to prevent loops
  if (initialAnalysisRef.current) return;
  const params = new URLSearchParams(window.location.search);

  const sharedLat = params.get("lat");
  const sharedLng = params.get("lng");
  const sharedNameA = params.get("nameA");
  const sharedBLat = params.get("bLat");
  const sharedBLng = params.get("bLng");
  const sharedNameB = params.get("nameB");
  const isSharedCompare = params.get("compare") === "1" || params.get("compare") === "true";
  
  let shouldAnalyze = false;

  if (sharedLat && sharedLng) {
    // 1. Set main location state
    setLat(sharedLat);
    setLng(sharedLng);
    // 2. Persist to Local Storage immediately so other 
    // components don't default to 0.0000
    localStorage.setItem("geo_lat", sharedLat);
    localStorage.setItem("geo_lng", sharedLng);
    // if (sharedNameA) {
    //   // Decode name here so handleSubmit sees a set name and skips the prompt
    //   setLocationAName(decodeURIComponent(sharedNameA));
    // }
    if (sharedNameA) {
      const decodedName = decodeURIComponent(sharedNameA);
      setLocationAName(decodedName);
      localStorage.setItem("geo_name_a", decodedName);
    }
    shouldAnalyze = true; 
  }

  if (isSharedCompare && sharedBLat && sharedBLng) {
    // 2. Set comparison inputs
    setBLatInput(sharedBLat);
    setBLngInput(sharedBLng);
    
    // Decode Site B name
    const decodedB = sharedNameB ? decodeURIComponent(sharedNameB) : "Site B";
    setLocationBName(decodedB);
    setCompareName(decodedB);
    
    // 3. Enable comparison UI modes
    setShowLocationB(true);
    setIsCompareMode(true);
    
    // 4. Trigger Site B analysis immediately using the decoded name to bypass prompts
    handleCompareSelect(sharedBLat, sharedBLng, decodedB);
  }

  // 5. Auto-trigger the main analysis for Site A
  if (shouldAnalyze) {

    initialAnalysisRef.current = true;
    const timer = setTimeout(() => {
      handleSubmit(); 
    }, 500);
    return () => clearTimeout(timer);
  }
  
  // handleSubmit is now included to satisfy the ESLint warning
}, [handleCompareSelect, handleSubmit]);

// ✅ FIX: Ensure comparison history is saved after URL-based analysis (DEPLOYED FIX)
useEffect(() => {
  if (!result || !compareResult || !isCompareMode) return;

  setAnalysisHistory(prev => {
    const exists = prev.some(
      h =>
        h.lat === lat &&
        h.lng === lng &&
        h.bLat === bLatInput &&
        h.bLng === bLngInput
    );
    if (exists) return prev;

    const entry = {
      name: locationAName,
      lat,
      lng,
      score: result.suitability_score,
      isCompareMode: true,
      nameB: locationBName,
      bLat: bLatInput,
      bLng: bLngInput,
      scoreB: compareResult.suitability_score,
      timestamp: Date.now()
    };

    const updated = [entry, ...prev].slice(0, 20);
    localStorage.setItem("analysis_history", JSON.stringify(updated));
    return updated;
  });
}, [
  result,
  compareResult,
  isCompareMode,
  lat,
  lng,
  bLatInput,
  bLngInput,
  locationAName,
  locationBName
]);

 


  

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [chatHistory, scrollToBottom]);

  const handleAskGpt = async (e) => {
    if (e) e.preventDefault();
    if (!userQuery.trim()) return;
    const userMessage = { role: 'user', content: userQuery };
    setChatHistory(prev => [...prev, userMessage]);
    setGptLoading(true);
    const queryToSend = userQuery;
    setUserQuery("");

    try {
      const response = await fetch(`${API_BASE}/ask_geogpt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToSend, currentData: result, locationName: locationAName, compareData: compareResult }),
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm currently offline." }]);
    } finally { setGptLoading(false); }
  };

  useEffect(() => {
  // --- Standard UI State ---
  localStorage.setItem("geo_lat", lat);
  localStorage.setItem("geo_lng", lng);
  localStorage.setItem("geo_name_a", locationAName); // Persist Name A
  localStorage.setItem("geo_name_b", locationBName); // Persistence
  localStorage.setItem("geo_is_compare", JSON.stringify(isCompareMode));
  localStorage.setItem("geo_show_b", JSON.stringify(showLocationB));
  localStorage.setItem("geo_zoom", zoom);
  localStorage.setItem("geo_theme", JSON.stringify(isDarkMode));
  localStorage.setItem("geo_map_style", mapVariety);
  localStorage.setItem("sidebar_width", sidebarWidth);
  localStorage.setItem("bottom_height", bottomHeight);
  localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));
  
  // --- Analysis Results Persistence ---
  if (compareResult) localStorage.setItem("geo_last_compare_result", JSON.stringify(compareResult));
  if (result) {
    localStorage.setItem("geo_last_result", JSON.stringify(result));
  } else {
    localStorage.removeItem("geo_last_result");
  }

  // --- Comparison State Persistence ---
  localStorage.setItem("geo_is_compare", JSON.stringify(isCompareMode));
  localStorage.setItem("geo_show_b", JSON.stringify(showLocationB));
  
  if (showLocationB) {
    localStorage.setItem("geo_lat_b", bLatInput);
    localStorage.setItem("geo_lng_b", bLngInput);
    localStorage.setItem("geo_name_b", locationBName); // Persist Name B
    
    if (compareResult) {
      localStorage.setItem("geo_last_compare_result", JSON.stringify(compareResult));
    }
  }

  // --- Theme Application ---
  document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light");

}, [
  lat, lng, locationAName, zoom, isDarkMode, sidebarWidth, bottomHeight, 
  result, savedPlaces, mapVariety, isCompareMode, showLocationB, 
  bLatInput, bLngInput, locationBName, compareResult
]);

 


  const handleMouseMove = useCallback((e) => {
    if (isResizingSide.current) {
      const newWidth = e.clientX;
      if (newWidth > 260 && newWidth < 600) setSidebarWidth(newWidth);
    }
    if (isResizingBottom.current) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 100 && newHeight < window.innerHeight - 100) setBottomHeight(newHeight);
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizingSide.current = false;
    isResizingBottom.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
  }, [handleMouseMove]);

  const startResizingSide = useCallback(() => {
    isResizingSide.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
  }, [handleMouseMove, stopResizing]);

  const startResizingBottom = useCallback(() => {
    isResizingBottom.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "row-resize";
  }, [handleMouseMove, stopResizing]);

  const handleNearbyPlaces = async () => {
    if (!lat || !lng) return;
    setNearbyLoading(true);
    try {
      const res = await fetch(`${API_BASE}/nearby_places`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: parseFloat(lat), longitude: parseFloat(lng) }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setNearbyData(data);
      setShowNearby(true);
    } catch (err) { alert("Backend starting up, please retry in 10s"); } finally { setNearbyLoading(false); }
  };

  const handleNearbyPlacesB = async () => {
    const targetLat = analyzedCoordsB.lat || bLatInput;
    const targetLng = analyzedCoordsB.lng || bLngInput;
    if (!targetLat || !targetLng) return;
    setNearbyLoadingB(true);
    try {
      const res = await fetch(`${API_BASE}/nearby_places`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: parseFloat(targetLat), longitude: parseFloat(targetLng) }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setNearbyDataB(data);
      setShowNearbyB(true);
    } catch (err) { alert("Backend starting up, please retry in 10s"); } finally { setNearbyLoadingB(false); }
  };

  // const handleOpenHistory = (targetData, targetName, targetLat, targetLng) => {
  //   setHistoryTargetData(targetData);
  //   setHistoryTargetName(targetName);
  //   setHistoryTargetCoords({ lat: targetLat, lng: targetLng });
  //   setShowHistory(true);
  // };
  // Replace your existing handleOpenHistory with this
const handleOpenHistory = useCallback(async (targetData, targetName, targetLat, targetLng) => {
    setHistoryTargetName(targetName);
    setHistoryTargetCoords({ lat: targetLat, lng: targetLng });
    
    // We pass the current data to the HistoryView so it can compare
    setHistoryTargetData(targetData); 
    setShowHistory(true);
}, []);

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude.toString());
      setLng(pos.coords.longitude.toString());
    });
  };

  const handleSavePlace = () => {
    const name = prompt("Enter a name for this location:");
    if (!name) return;
    setSavedPlaces([...savedPlaces, { name, lat: parseFloat(lat), lng: parseFloat(lng) }]);
  };
const [activeSpectral, setActiveSpectral] = useState("standard");
  const handleMyLocationB = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setBLatInput(pos.coords.latitude.toString());
      setBLngInput(pos.coords.longitude.toString());
      handleCompareSelect(pos.coords.latitude, pos.coords.longitude);
    });
  };

  const handleSavePlaceB = () => {
    if (!compareName) return;
    setSavedPlaces([...savedPlaces, { name: compareName, lat: parseFloat(bLatInput), lng: parseFloat(bLngInput) }]);
  };

  const handleSearchResult = (searchLat, searchLng, searchName) => {
    setLat(searchLat.toString());
    setLng(searchLng.toString());
    setZoom(16);
  };

  const EvidenceSection = ({ data }) => (
    <div className="card evidence-card" style={{ height: 'auto' }}>
      <h3>Evidence Details</h3>
      <div className="evidence-list">
        {['rainfall', 'flood', 'landslide', 'soil', 'proximity', 'water', 'pollution', 'landuse'].map(id => {
          const val = data.factors[id] ?? 0;
          const meta = data.explanation?.factors_meta?.[id];
          if (!meta) return null;
          return (
            <div key={id} className={`evidence-entry tone-${val < 40 ? "red" : val < 70 ? "yellow" : "green"}`}>
              <strong>{id.toUpperCase()} ({val.toFixed(1)})</strong>
              <p>{meta.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
const renderTabContent = (data, coords, name, isFullWidth) => {
  // If isFullWidth (Single Analysis), use your 'results-grid' class
  // If not (Compare Mode), use 'column-stack' to fit inside the narrow pane
  const containerClass = isFullWidth ? "results-grid" : "column-stack";
  
  const currentSnapshot = name === locationAName ? snapshotData : snapshotDataB;
  if (activeTab === "suitability") {
    return (
      <div className={containerClass}>
        <div className={isFullWidth ? "col-1" : ""}>
          
          <FactorsSection 
            data={data} 
            latVal={coords.lat} 
            lngVal={coords.lng} 
            locationName={name}
            isDarkMode={isDarkMode} 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            onOpenHistory={handleOpenHistory} 
            mapVariety={mapVariety}
            isCompareMode={!isFullWidth}
            activeSpectral={activeSpectral}
            mapMode={mapMode}           // PASS STATE HERE
  active3DStyle={active3DStyle}
  currentZoom={zoom}
  setZoom={setZoom}
  handleZoomIn={handleZoomIn}
  handleZoomOut={handleZoomOut}
  /* NEW PROPS BELOW */
  setLat={setLat}
  setLng={setLng}
  // currentZoom={zoom}           // Local state 'zoom' maps to 'currentZoom'
  setCurrentZoom={setZoom}
  onZoomIn={handleZoomIn}      // Local function maps to 'onZoomIn'
  onZoomOut={handleZoomOut}
  isSelectingB={isSelectingB}
  handleCompareSelect={handleCompareSelect}
          />
        </div>
        <div className={isFullWidth ? "col-2" : ""}>
          {/* <PotentialSection factors={data.factors} score={data.suitability_score} /> */}
          <EvidenceSection data={data} />
        </div>
      </div>
    );
  }

  if (activeTab === "environmental") {

const cnn = data?.cnn_analysis;
const confidence = cnn?.confidence || 0;

// NEW: 3-Tier Tactical Color Logic
const getCnnTheme = (conf) => {
  if (conf >= 70) return { color: "#10b981", label: "VERIFIED", note: "TARGET LOCKED", class: "high-conf", glow: "rgba(16, 185, 129, 0.2)" }; 
  if (conf >= 40) return { color: "#3b82f6", label: "PROBABLE", note: "PATTERN RECOGNIZED", class: "mid-conf", glow: "rgba(59, 130, 246, 0.2)" }; 
  return { color: "#ef4444", label: "UNCERTAIN", note: "SIGNAL INTERFERENCE", class: "low-conf", glow: "rgba(239, 68, 68, 0.2)" }; 
};

const cnnTheme = getCnnTheme(confidence);

return (
  <div className={containerClass}>
    <div className={isFullWidth ? "col-1" : ""}>
      
      
      {/* UPDATED CNN TACTICAL CARD */}
      <div 
        className={`card cnn-tactical-card glass-morphic animate-in ${cnnTheme.class}`} 
        style={{ "--status-color": cnnTheme.color, "--status-glow": cnnTheme.glow }}
      >
        <div className="cnn-tactical-header">
          <div className="cnn-title-group">
            <span className="live-tag">LIVE TELEMETRY</span>
            <h3>Visual Intelligence Scan</h3>
          </div>
          
          <div className="tactical-header-right">
            {/* Dedicated Space for Model Identity */}
            <div className="model-id-badge">
              <span className="model-label">ENGINE</span>
              <span className="model-name">CNN-V2 / MOBILE-NET</span>
            </div>
            {/* Compact Status Badge - Uses dynamic 3-tier color */}
            <div className="status-indicator-pill" style={{ backgroundColor: cnnTheme.color }}>
              {confidence < 40 && <span className="mini-warn">⚠️</span>}
              {cnnTheme.label}
            </div>
          </div>
        </div>

        <div className="cnn-tactical-layout">
          <div className="cnn-visual-container">
            <div className="cnn-frame" style={{ borderColor: cnnTheme.color }}>
               <div className="cnn-image-feed" style={{ 
                 backgroundImage: cnn?.image_sample ? `url(${cnn.image_sample})` : 'none',
                 filter: confidence < 40 ? 'grayscale(0.4) contrast(1.1) brightness(0.9)' : 'none'
               }}>
                 {cnn?.image_sample && <div className="scan-telemetry-overlay"></div>}
               </div>
               {/* Fixed Tactical Corners */}
               <div className="corner-bit tl"></div><div className="corner-bit tr"></div>
               <div className="corner-bit bl"></div><div className="corner-bit br"></div>
            </div>
          </div>

          <div className="cnn-data-grid">
            <div className="cnn-stat-item">
              <label>TERRAIN CLASSIFICATION: </label>
              <strong className="cnn-class-text" style={{ color: cnnTheme.color }}>
                {cnn?.class || "ANALYZING..."}
              </strong>
            </div>

            <div className="cnn-stat-item">
              <div className="label-row">
                <label>SPECTRAL CONFIDENCE: </label>
                <span className="confidence-value" style={{ color: cnnTheme.color }}>{confidence}%</span>
              </div>
              <div className="tactical-progress-bg">
                <div 
                  className="tactical-progress-fill" 
                  style={{ width: `${confidence}%`, backgroundColor: cnnTheme.color }}
                ></div>
              </div>
            </div>

            <div className="cnn-alert-box" style={{ borderLeftColor: cnnTheme.color, background: `${cnnTheme.color}15` }}>
              <div className="alert-content">
                <strong style={{ color: cnnTheme.color }}>{cnnTheme.note}</strong>
                <p>
                  {confidence < 40 
                    ? "Terrain complexity exceeding standard spectral resolution." 
                    : `Visual markers confirm high correlation with ${cnn?.class} signatures.`}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Responsive Footer - Theme specific colors handled via CSS */}
        <div className="cnn-footer-telemetry">
          <span>RES: 10m/px</span>
          <span>SENSOR: SENTINEL-2 L2A</span>
          <span>TS: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
 
        {/* {data.terrain_analysis && <TerrainSlope terrain={data.terrain_analysis} />}
        </div> */}
        {/* If Single View, Terrain shows here in col-1 */}
        {isFullWidth && data.terrain_analysis && <TerrainSlope terrain={data.terrain_analysis} />}
      </div>
        <div className={isFullWidth ? "col-2" : ""}>
          <SnapshotGeo data={currentSnapshot} loading={snapshotLoading} />
          <WeatherCard weather={data?.weather} />
          
        </div>
        {/* If Compare Mode, Terrain is forced to the bottom of the entire stack */}
      {!isFullWidth && data.terrain_analysis && <TerrainSlope terrain={data.terrain_analysis} />}
    </div>
  
    );
  }


if (activeTab === "infrastructure") {
const intel = data.strategic_intelligence || {}; 
  // Carbon Intelligence: Potential based on vegetation biomass
    const carbonIntelligence = (data.factors.landuse * 0.75).toFixed(1); 
    // Carbon Footprint: Estimated based on proximity & infrastructure
    const liveFootprint = ((100 - data.factors.pollution + (100 - data.factors.proximity)) / 15).toFixed(1);
    // ESG Score: Derived from soil, water, and pollution factors
    const esgScore = Math.round((data.factors.soil + data.factors.pollution + data.factors.water) / 3);
  const esgColorClass = esgScore > 75 ? "grade-A" : esgScore > 50 ? "grade-B" : esgScore > 35 ? "grade-C" : "grade-F";
  

  return (
    
    /* Use the dynamic containerClass instead of the hardcoded strategic-intel-grid */
    <div className={containerClass}>
      
      {/* Column 1: Potential and Infrastructure Context */}
      <div className={isFullWidth ? "col-1" : ""}>
        <PotentialSection factors={data.factors} score={data.suitability_score} />
        
  <div className="card glass-morphic intel-card">
    <div className="intel-header">
      <div className="title-group">
        <h3>🌳 Sustainability Intelligence</h3>
        <p className="subtitle">Lithospheric & Biomass Sequestration</p>
      </div>
      
      {/* DYNAMIC COLOR CLASS ADDED HERE */}
      <div className={`esg-score-circle ${esgColorClass}`}>
        <span className="esg-val">{esgScore}</span>
        <span className="esg-lab">ESG</span>
      </div>
    </div>

  <div className="carbon-analysis-zone">
    <div className="analysis-row">
      <div className="analysis-item">
        <label>Carbon Asset</label>
        <span className="val-green">+{carbonIntelligence} <small>tCO2e/yr</small></span>
        <div className="mini-progress-bg">
          <div className="mini-progress-fill green" style={{ width: `${Math.min(carbonIntelligence * 2, 100)}%` }}></div>
        </div>
      </div>
      <div className="analysis-item">
        <label>Live Footprint</label>
        <span className="val-red">-{liveFootprint} <small>tCO2e/yr</small></span>
        <div className="mini-progress-bg">
          <div className="mini-progress-fill red" style={{ width: `${Math.min(liveFootprint * 10, 100)}%` }}></div>
        </div>
      </div>
    </div>

    <div className="net-impact-summary">
      <div className="impact-label">Net Ecosystem Impact</div>
      <div className="impact-value">
        { (carbonIntelligence - liveFootprint) > 0 ? "CARBON NEGATIVE (CLIMATE POSITIVE)" : "CARBON POSITIVE (CLIMATE RISK)" }
      </div>
    </div>
  </div>

  <div className="eligibility-drawer">
    <div className="drawer-item">
      <span>🌿 Conservation Credit Match:</span>
      <strong className={esgScore > 65 ? "status-ok" : "status-no"}>
        {esgScore > 65 ? "HIGHLY ELIGIBLE" : "INELIGIBLE"}
      </strong>
    </div>
    <div className="drawer-item">
      <span>🛡️ Biodiversity Buffer:</span>
      <strong>{data.factors.landuse > 60 ? "PREMIUM" : "STANDARD"}</strong>
    </div>
  </div>
  
  <p className="legal-disclaimer">Estimates based on biomass density and emission intensity.</p>
</div>
      </div>
      {/* Column 2: Roadmap, Interventions, and Projections */}
      <div className={isFullWidth ? "col-2" : "intel-col"}>
        {/* Roadmap Card */}
        <div className="card glass-morphic intel-card roadmap-card">
          <div className="intel-header"><h3>🚧 Improvement Roadmap</h3></div>
          <div className="roadmap-list">
            {intel.roadmap?.length > 0 ? intel.roadmap.map((item, i) => (
              <div key={i} className="roadmap-item">
                <div className="roadmap-task-info">
                  <span className="task-name">{item.task}</span>
                  <p className="tiny-note">{item.note}</p>
                </div>
                <span className="impact-tag">{item.impact} Boost</span>
              </div>
            )) : <div className="nearby-empty">Site maintains Grade A stability.</div>}
          </div>
        </div>

        {/* Interventions Card */}
        <div className="card glass-morphic intel-card prevention-card">
          <div className="intel-header"><h3>💡 Suggestible Interventions</h3></div>
          <p className="subtitle">AI-driven preventative strategy</p>
          <ul className="prevention-list">
            {intel.interventions?.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>

        {/* Future Projection Card */}
        <div className="card glass-morphic intel-card prediction-card">
          <div className="intel-header">
            <h3>🚀 AI Future Projection (2036)</h3>
            <div className="future-score-wrap">
              <span className="current-mini">{data.suitability_score?.toFixed(1)}</span>
              <span className="drift-arrow">→</span>
              <span className="future-score">{intel.expected_score}%</span>
            </div>
          </div>
          <div className="drift-metrics">
            <div className="drift-row">
              <span>Urbanization Risk:</span> 
              <span className="val-red">{intel.metrics?.urban_sprawl}</span>
            </div>
            <div className="drift-row">
              <span>Vegetation Loss:</span> 
              <span className="val-red">{intel.metrics?.veg_loss}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  // Fallback return to avoid "undefined" errors
  return null;
};
  return (
    <div className="app-shell">
      {/* <AudioLandscape 
        factors={result?.factors} 
        isEnabled={isAudioEnabled} 
      /> */}

      {/* <AudioLandscape 
        factors={isCompareMode 
          ? (mobileCompareSite === "A" ? result?.factors : compareResult?.factors) 
          : result?.factors
        } 
        isEnabled={isAudioEnabled}
        isLoading={loading || compareLoading}
      /> */}
      <AudioLandscape 
  // Select factors based on which site is active in compare mode
  activeFactors={isCompareMode 
    ? (mobileCompareSite === "A" ? result?.factors : compareResult?.factors) 
    : result?.factors
  } 
  // NEW: Pass the label (e.g. "Not Suitable (Waterbody)")
  resultLabel={isCompareMode
    ? (mobileCompareSite === "A" ? result?.label : compareResult?.label)
    : result?.label
  }
  isEnabled={isAudioEnabled}
  isLoading={loading || compareLoading}
/>
      <TopNav isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} isAudioEnabled={isAudioEnabled} setIsAudioEnabled={setIsAudioEnabled} analysisHistory={analysisHistory} onSearchResult={handleSearchResult} />
      
      <SideBar
        onSearchResult={handleSearchResult}
        lat={lat} setLat={setLat} lng={lng} setLng={setLng}
        locationAName={locationAName} setLocationAName={setLocationAName}
        loading={loading} handleSubmit={handleSubmit}
        handleMyLocation={handleMyLocation} handleSavePlace={handleSavePlace}
        handleNearbyPlaces={handleNearbyPlaces}
        nearbyLoading={nearbyLoading}
        nearbyData={nearbyData}
        result={result} showLocationB={showLocationB}
        setShowLocationB={setShowLocationB} locationBName={locationBName}
        isSelectingB={isSelectingB} setIsSelectingB={setIsSelectingB}
        bLatInput={bLatInput} setBLatInput={setBLatInput}
        bLngInput={bLngInput} setBLngInput={setBLngInput}
        savedPlaces={savedPlaces} handleCompareSelect={handleCompareSelect}
        compareLoading={compareLoading} isCompareMode={isCompareMode}
        setCompareResult={setCompareResult}       // <--- Add this
        setSnapshotDataB={setSnapshotDataB}       // <--- Add this
        setLocationBName={setLocationBName}
        setIsCompareMode={setIsCompareMode}
        handleMyLocationB={handleMyLocationB}
        handleSavePlaceB={handleSavePlaceB}
        isBFromSavedPlace={isBFromSavedPlace}
        setSavedPlaces={setSavedPlaces}
        sidebarWidth={sidebarWidth} startResizingSide={startResizingSide}
        analyzedCoordsB={analyzedCoordsB}
        nearbyLoadingB={nearbyLoadingB}
        handleNearbyPlacesB={handleNearbyPlacesB}
        showNearby={showNearby}
        setShowNearby={setShowNearby}
        compareResult={compareResult}
        editingIndex={editingIndex}
        setEditingIndex={setEditingIndex}
        editingName={editingName}
        setEditingName={setEditingName}
      />

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <section className="map-container" style={{ flex: 1, position: 'relative' }}>
        {/* TACTICAL ZOOM CONTROLS (Left side of map) */}
          <div className="tactical-zoom-hud">
            <button onClick={() => handleZoomIn(1)}>+</button>
            <div className="zoom-divider" />
            <button onClick={() => handleZoomOut(-1)}>−</button>
          </div>
        {/* TACTICAL ENGINE TOGGLE */}
        <div className="engine-switch-container">
  <button 
    className={`switch-btn ${mapMode === "2D" ? "active" : ""}`}
    onClick={() => setMapMode("2D")}
    title="Standard 2D"
  >
    2D
  </button>
  <button 
    className={`switch-btn ${mapMode === "3D" ? "active" : ""}`}
    onClick={() => setMapMode("3D")}
    title="Tactical 3D"
  >
    3D
  </button>
  <div className="vertical-divider" />
            <button className="fullscreen-btn" onClick={toggleFullScreen} title="Map Focus Mode">⛶</button>
</div>
    
    <div className="map-variety-picker">
      <label className="picker-header">🗺️ Engine style</label>
      {mapMode === "2D" ? (
        <>
          <select value={mapVariety} onChange={(e) => setMapVariety(e.target.value)} className="variety-select">
            <optgroup label="Google Maps">
          <option value="hybrid">Satellite Hybrid</option>
          <option value="satellite">Pure Satellite</option>
          <option value="terrain">Physical Terrain</option>
        </optgroup>
        <optgroup label="Analysis Themes">
          <option value="dark">Dark Matter (Pro)</option>
          <option value="topo">Topographic (Technical)</option>
          <option value="streets">Standard Streets</option>
          <option value="light">Minimalist Light</option>
        </optgroup>
          </select>

          <div className="spectral-toggle-bar">
            <button className={activeSpectral === "ndvi" ? "active" : ""} onClick={() => setActiveSpectral(activeSpectral === "ndvi" ? "standard" : "ndvi")}>🌿 NDVI</button>
            <button className={activeSpectral === "thermal" ? "active" : ""} onClick={() => setActiveSpectral("thermal")}>🔥 Heat</button>
            <button className={activeSpectral === "hydrology" ? "active" : ""} onClick={() => setActiveSpectral("hydrology")}>💧 Flow</button>
          </div>
        </>
      ) : (
        <select value={active3DStyle} onChange={(e) => setActive3DStyle(e.target.value)} className="variety-select">
          <option value="satellite">🛰️ 3D Satellite</option>
          <option value="topo">🏔️ 3D Topographic</option>
          <option value="dark">🕶️ 3D Stealth</option>
          <option value="nature">🌱 3D Nature</option>
          <option value="streets">🏙️ 3D Urban (Buildings)</option> {/* New */}
    <option value="outdoor">⛅ 3D Atmospheric</option>
        </select>
      )}
    </div>
  <div
  ref={mapViewportRef}
  className="map-viewport"
  style={{ height: "100%", width: "100%" }}
>
    {mapMode === "2D" ? (
      <MapContainer 
        center={[parseFloat(lat), parseFloat(lng)]} 
        zoom={zoom} 
        key={`minimap-${zoom}`}
        zoomControl={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={varieties[mapVariety]} />
        {/* ✅ RESTORED SPECTRAL LAYERS (NDVI, Heat, Flow) */}
    {activeSpectral !== "standard" && spectralLayers[activeSpectral] && (
      <TileLayer 
        key={activeSpectral} 
        url={spectralLayers[activeSpectral]} 
        opacity={0.6} 
        zIndex={300} 
      />
    )}
        <Marker position={[parseFloat(lat), parseFloat(lng)]} />
         {/* ✅ THIS RESTORES CLICK SELECTION */}
    <MapClickHandler
      setLat={setLat}
      setLng={setLng}
      setZoom={setZoom}
    />
      </MapContainer>
    ) : (
      <ProMap 
        lat={lat} 
        lng={lng} 
         zoom={zoom} 
         setLat={setLat}      // ✅ REQUIRED
  setLng={setLng} 
        factors={result?.factors} 
        isDarkMode={isDarkMode} 
        activeStyle={active3DStyle} 
        interactive={true}
      />
    )}
    </div>
  </section>
        <div className="horizontal-resizer" onMouseDown={startResizingBottom} />

            <section className="results-container" style={{ height: `${bottomHeight}px`, flex: `0 0 ${bottomHeight}px`, overflowY: 'auto' }}>
            
            {/* The result check wraps everything below */}
            {/* {result ? ( */}
            {result || loading || compareLoading ? (
              <>
                {/* 1. Tab Bar Navigation (Visible only when result exists) */}
                <div className="results-tab-bar glass-morphic">
                  <button className={activeTab === "suitability" ? "active" : ""} onClick={() => setActiveTab("suitability")}>🎯 Suitability</button>
                  <button className={activeTab === "environmental" ? "active" : ""} onClick={() => setActiveTab("environmental")}>🌐 Locational Intelligence</button>
                  <button className={activeTab === "infrastructure" ? "active" : ""} onClick={() => setActiveTab("infrastructure")}>🏗️ Strategic Utility</button>
                </div>

               {/* 2. Loading Overlay: This will now appear OVER the placeholder space immediately */}
                {(loading || compareLoading) && (
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Analyzing Terrain Data...</p>
                  </div>
                )}
                {/* 3. Data Viewport */}
                <div className="tab-viewport">
                  {/* SINGLE ANALYSIS VIEW */}
                  {!isCompareMode && result &&(
                    <div className="single-analysis-view">
                      <h4 className="pane-header">{locationAName.toUpperCase()} - FULL TERRAIN REPORT</h4>
                      {renderTabContent(result, analyzedCoords, locationAName, true)}
                    </div>
                  )}

                  {/* COMPARE MODE */}
                  {/* {isCompareMode && (
                    <div className="compare-layout-ditto" style={{ display: 'flex', height: '100%', width: '100%' }}>
                      <div className="compare-pane-ditto">
                        <h4 className="pane-header">{locationAName.toUpperCase()}</h4>
                        {renderTabContent(result, analyzedCoords, locationAName, false)}
                      </div>
                      <div className="compare-pane-ditto">
                        <h4 className="pane-header">{locationBName.toUpperCase() || "SITE B"}</h4>
                        {compareResult ? (
                          renderTabContent(compareResult, analyzedCoordsB, locationBName, false)
                        ) : (
                          <div className="empty-results">Waiting for Site B selection...</div>
                        )}
                      </div>
                    </div>
                  )} */}
                  {/* Sub-Tabs for Mobile Comparison: Placed below the 3-tab bar */}
                  {/* This UI element only appears during Comparison Mode on Mobile */}
                  {isCompareMode && (
                    <div className="mobile-location-tabs glass-morphic only-mobile">
                      <button 
                        className={mobileCompareSite === "A" ? "active" : ""} 
                        onClick={() => setMobileCompareSite("A")}
                      >
                        📍 {locationAName}
                      </button>
                      <button 
                        className={mobileCompareSite === "B" ? "active" : ""} 
                        onClick={() => setMobileCompareSite("B")}
                      >
                        📍 {locationBName || "Site B"}
                      </button>
                    </div>
                  )}
                  {isCompareMode && (
                    <div className="compare-layout-ditto">
                      {/* Site A Pane */}
                      <div className={`compare-pane-ditto ${mobileCompareSite === "A" ? "show-mobile" : "hide-mobile"}`}>
                        <h4 className="pane-header only-desktop">{locationAName.toUpperCase()}</h4>
                        {result ? renderTabContent(result, analyzedCoords, locationAName, false) : <div className="empty-results">Analyzing Site A...</div>}
                      </div>

                      {/* Site B Pane */}
                      <div className={`compare-pane-ditto ${mobileCompareSite === "B" ? "show-mobile" : "hide-mobile"}`}>
                        <h4 className="pane-header only-desktop">{locationBName.toUpperCase() || "SITE B"}</h4>
                        {compareResult ? renderTabContent(compareResult, analyzedCoordsB, locationBName, false) : <div className="empty-results">Waiting for selection...</div>}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* This displays when the page is freshly opened and no analysis has run */
              <div className="welcome-placeholder">
                <div className="placeholder-content">
                    <span className="placeholder-icon">🌍</span>
                    <h3>Ready for Analysis</h3>
                    <p>Select a location on the map or search above to begin geospatial synthesis.</p>
                </div>
              </div>
            )}
          </section>

        <div className={`geogpt-fixed-container ${isGptOpen ? 'expanded' : ''}`}>
            {isGptOpen ? (
              <div className="geogpt-polished-box">
                <div className="geogpt-chat-header" onClick={() => setIsGptOpen(false)}>
                  <div className="gpt-status"><span className="gpt-dot"></span><strong>GeoGPT Intelligence</strong></div>
                  <button className="close-gpt">×</button>
                </div>
                <div className="geogpt-messages">
                  {chatHistory.map((msg, i) => <div key={i} className={`chat-msg ${msg.role}`}><div className="msg-bubble"><ReactMarkdown remarkPlugins={[remarkGfm]}>
          {msg.content}
        </ReactMarkdown></div></div>)}
                  {gptLoading && <div className="chat-msg assistant"><div className="msg-bubble thinking-bubble">Thinking...</div></div>}
                  <div ref={chatEndRef} />
                </div>
                <form className="geogpt-input-area" onSubmit={handleAskGpt}>
                  <input type="text" placeholder="Ask GeoGPT..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
                  <button type="submit" disabled={!userQuery.trim() || gptLoading}>🚀</button>
                </form>
              </div>
            ) : <button className="geogpt-pill-btn" onClick={() => setIsGptOpen(true)}><div className="gpt-icon-glow">✨</div></button>}
        </div>
      </main>

      {(showNearby || showNearbyB) && (
          <div className="modal-overlay" onClick={() => { setShowNearby(false); setShowNearbyB(false); }}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Nearby Amenities ({showNearbyB ? locationBName : locationAName})</h3>
                <button className="modal-close" onClick={() => { setShowNearby(false); setShowNearbyB(false); }}>✖</button>
              </div>
              <div className="modal-body">
                {(() => {
                  const data = showNearbyB ? nearbyDataB : nearbyData;
                  if (!data?.places?.length) return <div className="nearby-empty">No mapped amenities within 1.5 km.</div>;
                  
                  const schools = data.places.filter(p => p.type === "school");
                  const hospitals = data.places.filter(p => p.type === "hospital");
                  const colleges = data.places.filter(p => p.type === "college" || p.type === "university");

                  const Section = ({ title, items }) => (
                    <div className="nearby-section">
                      <h4>{title} ({items.length})</h4>
                      {items.length ? (
                        items.map((p, i) => (
                          <div key={i} className="nearby-item">
                            <span className="nearby-name">{p.name}</span>
                            <span className="nearby-distance">{p.distance_km} km</span>
                          </div>
                        ))
                      ) : (
                        <div className="nearby-empty">No nearby {title.toLowerCase()} found.</div>
                      )}
                    </div>
                  );

                  return (
                    <>
                      <Section title="🏫 Schools" items={schools} />
                      <Section title="🏥 Hospitals" items={hospitals} />
                      <Section title="🎓 Colleges & Universities" items={colleges} />
                    </>
                  );
                })()
                }
              </div>
            </div>
          </div>
        )}
      
      {showHistory && historyTargetData && (
        <HistoryView 
          data={historyTargetData} locationName={historyTargetName} onClose={() => setShowHistory(false)} 
          lat={historyTargetCoords.lat} lng={historyTargetCoords.lng} isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
