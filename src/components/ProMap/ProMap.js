// import React, { useEffect, useRef, useState } from 'react';
// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';

// const ProMap = ({ lat, lng, factors, isDarkMode }) => {
//   const mapContainer = useRef(null);
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);
  
//   // High-Level Map Styles
//   const styles = {
//     satellite: 'https://api.maptiler.com/maps/hybrid/style.json',
//     topo: 'https://api.maptiler.com/maps/topo-v2/style.json',
//     dark: 'https://api.maptiler.com/maps/basic-v2-dark/style.json',
//     nature: 'https://api.maptiler.com/maps/voyager/style.json'
//   };

//   const [activeStyle, setActiveStyle] = useState('satellite');
//   const MAPTILER_KEY = 'odjavHm0GMayywLbA9Rq';

//   // 1. ADVANCED 3D ENGINE: Terrain + Extrusions
//   const addAdvanced3D = (map) => {
//     // Only proceed if style and projection are stable to avoid shader errors
//     if (!map || !map.isStyleLoaded() || !map.getProjection()) return;

//     try {
//       // Initialize 3D Topography
//       if (!map.getSource('terrain')) {
//         map.addSource('terrain', {
//           type: 'raster-dem',
//           url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
//           tileSize: 512
//         });
//       }
//       map.setTerrain({ source: 'terrain', exaggeration: 2.0 });

//       // Initialize 3D Building Extrusions
//       if (!map.getLayer('3d-buildings')) {
//         map.addLayer({
//           'id': '3d-buildings',
//           'source': 'openmaptiles',
//           'source-layer': 'building',
//           'type': 'fill-extrusion',
//           'minzoom': 13,
//           'paint': {
//             'fill-extrusion-color': activeStyle === 'satellite' ? '#ffffff' : '#00d4ff',
//             'fill-extrusion-height': ['get', 'render_height'],
//             'fill-extrusion-base': ['get', 'render_min_height'],
//             'fill-extrusion-opacity': 0.6,
//             'fill-extrusion-vertical-gradient': true
//           }
//         });
//       }

//       // Atmospheric Engine: Fog/Sky based on pollution
//       const pollution = factors?.pollution || 0;
//       const atmosphereColor = pollution > 60 ? '#8d8468' : (isDarkMode ? '#010b1a' : '#ffffff');
      
//       map.setSky({
//         'sky-color': atmosphereColor,
//         'sky-type': 'gradient',
//         'horizon-color': activeStyle === 'satellite' ? '#00d4ff' : atmosphereColor,
//         'horizon-fog-density': 0.4,
//         'fog-ground-blend': 0.6
//       });
//     } catch (err) {
//       console.warn("Retrying 3D layer injection...");
//     }
//   };

//   useEffect(() => {
//     if (!mapRef.current) {
//       // 2. INITIALIZE ENGINE
//       const map = new maplibregl.Map({
//         container: mapContainer.current,
//         style: `${styles[activeStyle]}?key=${MAPTILER_KEY}`,
//         center: [parseFloat(lng), parseFloat(lat)],
//         zoom: 15.5,
//         pitch: 65,
//         bearing: -15,
//         antialias: true,
//         interactive: true
//       });

//       mapRef.current = map;

//       // Use 'idle' event to ensure all shaders and projections are ready
//       map.on('idle', () => addAdvanced3D(map));
      
//       // Add Tactical 3D Pulse Marker
//       const el = document.createElement('div');
//       el.className = 'pulse-marker-3d';
//       markerRef.current = new maplibregl.Marker(el)
//         .setLngLat([parseFloat(lng), parseFloat(lat)])
//         .addTo(map);

//     } else {
//       // 3. STYLE & COORDINATE UPDATES
//       mapRef.current.setStyle(`${styles[activeStyle]}?key=${MAPTILER_KEY}`);
      
//       // Re-inject 3D layers once the new style is fully idle
//       mapRef.current.once('idle', () => addAdvanced3D(mapRef.current));
      
//       mapRef.current.flyTo({
//         center: [parseFloat(lng), parseFloat(lat)],
//         essential: true,
//         duration: 3000,
//         pitch: 65
//       });
      
//       if (markerRef.current) {
//         markerRef.current.setLngLat([parseFloat(lng), parseFloat(lat)]);
//       }
//     }

//     return () => {
//       // Cleanup to prevent memory leaks
//       if (mapRef.current && !mapRef.current._removed) {
//         // No-op to avoid crashing on unmount
//       }
//     };
//   }, [lat, lng, activeStyle]);

//   return (
//     <div className="pro-map-container">
//       <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

//       {/* TOP HUD */}
//       <div className="map-hud">3D SPATIAL ENGINE ACTIVE</div>

//       {/* TACTICAL STYLE SWITCHER */}
//       <div className="map-type-hud">
//         <button className={activeStyle === 'satellite' ? 'active' : ''} onClick={() => setActiveStyle('satellite')}>🛰️ SATELLITE</button>
//         <button className={activeStyle === 'topo' ? 'active' : ''} onClick={() => setActiveStyle('topo')}>🏔️ TERRAIN</button>
//         <button className={activeStyle === 'dark' ? 'active' : ''} onClick={() => setActiveStyle('dark')}>🕶️ STEALTH</button>
//         <button className={activeStyle === 'nature' ? 'active' : ''} onClick={() => setActiveStyle('nature')}>🌱 NATURE</button>
//       </div>
//     </div>
//   );
// };

// export default ProMap;
// import React, { useEffect, useRef, useState } from 'react';
// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';

// const ProMap = ({ lat, lng, factors, isDarkMode, activeStyle }) => {
//   const mapContainer = useRef(null);
//   const mapRef = useRef(null);
//   const markerRef = useRef(null);
  
//   const MAPTILER_KEY = 'odjavHm0GMayywLbA9Rq';
//   const styles = {
//     satellite: 'https://api.maptiler.com/maps/hybrid/style.json',
//     topo: 'https://api.maptiler.com/maps/topo-v2/style.json',
//     dark: 'https://api.maptiler.com/maps/basic-v2-dark/style.json',
//     nature: 'https://api.maptiler.com/maps/voyager/style.json'
//   };

//   const add3DLogic = (map) => {
//     // CRITICAL FIX: Shader Prelude Guard
//     if (!map || !map.isStyleLoaded() || !map.getProjection()) return;

//     try {
//       if (!map.getSource('terrain')) {
//         map.addSource('terrain', {
//           type: 'raster-dem',
//           url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
//           tileSize: 512
//         });
//       }
//       map.setTerrain({ source: 'terrain', exaggeration: 2.0 });

//       if (!map.getLayer('3d-buildings')) {
//         map.addLayer({
//           'id': '3d-buildings',
//           'source': 'openmaptiles',
//           'source-layer': 'building',
//           'type': 'fill-extrusion',
//           'minzoom': 13,
//           'paint': {
//             'fill-extrusion-color': activeStyle === 'satellite' ? '#ffffff' : '#00d4ff',
//             'fill-extrusion-height': ['get', 'render_height'],
//             'fill-extrusion-base': ['get', 'render_min_height'],
//             'fill-extrusion-opacity': 0.6,
//             'fill-extrusion-vertical-gradient': true
//           }
//         });
//       }

//       const pollution = factors?.pollution || 0;
//       const atmosphereColor = pollution > 60 ? '#8d8468' : (isDarkMode ? '#010b1a' : '#ffffff');
//       map.setSky({
//         'sky-color': atmosphereColor,
//         'sky-type': 'gradient',
//         'horizon-color': activeStyle === 'satellite' ? '#00d4ff' : atmosphereColor,
//         'horizon-fog-density': 0.4,
//         'fog-ground-blend': 0.6
//       });
//     } catch (e) { console.warn("Syncing 3D..."); }
//   };

//   useEffect(() => {
//     if (!mapRef.current) {
//       const map = new maplibregl.Map({
//         container: mapContainer.current,
//         style: `${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`,
//         center: [parseFloat(lng), parseFloat(lat)],
//         zoom: 15,
//         pitch: 65,
//         bearing: -15,
//         antialias: true
//       });
//       mapRef.current = map;
//       map.on('idle', () => add3DLogic(map)); // Wait for full render

//       const el = document.createElement('div');
//       el.className = 'pulse-marker-3d';
//       markerRef.current = new maplibregl.Marker(el).setLngLat([lng, lat]).addTo(map);
//     } else {
//       mapRef.current.setStyle(`${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`);
//       mapRef.current.once('idle', () => add3DLogic(mapRef.current));
//       mapRef.current.flyTo({ center: [lng, lat], duration: 2000 });
//       if (markerRef.current) markerRef.current.setLngLat([lng, lat]);
//     }
//   }, [lat, lng, activeStyle]);

//   return <div ref={mapContainer} className="pro-map-view" />;
// };

// export default ProMap;

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const ProMap = ({ lat, lng, setLat, setLng, factors, isDarkMode, activeStyle, interactive = true }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  
  const MAPTILER_KEY = 'odjavHm0GMayywLbA9Rq';
  const styles = {
    satellite: 'https://api.maptiler.com/maps/hybrid/style.json',
    topo: 'https://api.maptiler.com/maps/topo-v2/style.json',
    dark: 'https://api.maptiler.com/maps/basic-v2-dark/style.json',
    nature: 'https://api.maptiler.com/maps/voyager/style.json'
  };

  const add3DLogic = (map) => {
    // CRITICAL FIX: Shader Prelude Guard
    if (!map || !map.isStyleLoaded() || !map.getProjection()) return;

    try {
      if (!map.getSource('terrain')) {
        map.addSource('terrain', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
          tileSize: 512
        });
      }
      map.setTerrain({ source: 'terrain', exaggeration: 2.0 });

      if (!map.getLayer('3d-buildings')) {
        map.addLayer({
          'id': '3d-buildings',
          'source': 'openmaptiles',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 13,
          'paint': {
            'fill-extrusion-color': activeStyle === 'satellite' ? '#ffffff' : '#00d4ff',
            'fill-extrusion-height': ['get', 'render_height'],
            'fill-extrusion-base': ['get', 'render_min_height'],
            'fill-extrusion-opacity': 0.6,
            'fill-extrusion-vertical-gradient': true
          }
        });
      }

      const pollution = factors?.pollution || 0;
      const atmosphereColor = pollution > 60 ? '#8d8468' : (isDarkMode ? '#010b1a' : '#ffffff');
      map.setSky({
        'sky-color': atmosphereColor,
        'sky-type': 'gradient',
        'horizon-color': activeStyle === 'satellite' ? '#00d4ff' : atmosphereColor,
        'horizon-fog-density': 0.4,
        'fog-ground-blend': 0.6
      });
    } catch (e) { console.warn("Syncing 3D..."); }
  };
//   const attachClickHandler = (map) => {
//   map.off('click'); // prevent duplicate handlers

//   map.on('click', (e) => {
//     if (!interactive || !setLat || !setLng) return;

//     setLat(e.lngLat.lat.toString());
//     setLng(e.lngLat.lng.toString());
//   });
// };
const attachClickHandler = (map) => {
  if (!interactive || !setLat || !setLng) return;

  let startPoint = null;

  map.off('mousedown');
  map.off('mouseup');

  map.on('mousedown', (e) => {
    startPoint = e.point;
  });

  map.on('mouseup', (e) => {
    if (!startPoint) return;

    const dx = Math.abs(e.point.x - startPoint.x);
    const dy = Math.abs(e.point.y - startPoint.y);

    // movement threshold (important!)
    if (dx < 5 && dy < 5) {
      setLat(e.lngLat.lat.toString());
      setLng(e.lngLat.lng.toString());
    }

    startPoint = null;
  });
};


  useEffect(() => {
  let map;

  if (!mapRef.current) {
    map = new maplibregl.Map({
      container: mapContainer.current,
      style: `${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`,
      center: [parseFloat(lng), parseFloat(lat)],
      zoom: 15,
      pitch: 65,
      bearing: -15,
      antialias: true,
      interactive
    });

    mapRef.current = map;

    attachClickHandler(map);

    map.on('idle', () => add3DLogic(map));

    const el = document.createElement('div');
    el.className = 'pulse-marker-3d';
    markerRef.current = new maplibregl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map);

  } else {
    map = mapRef.current;

    map.setStyle(`${styles[activeStyle] || styles.satellite}?key=${MAPTILER_KEY}`);

    map.once('style.load', () => {
      add3DLogic(map);
      attachClickHandler(map); // ✅ REQUIRED after style change
    });

    map.flyTo({
      center: [parseFloat(lng), parseFloat(lat)],
      duration: 1500,
      essential: true
    });

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }
}, [lat, lng, activeStyle, interactive]);

  return <div ref={mapContainer} className="pro-map-view" style={{ width: '100%', height: '100%' }} />;
};

export default ProMap;