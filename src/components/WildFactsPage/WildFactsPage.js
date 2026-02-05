// import React, { useState, useEffect, useRef } from 'react';
// import './WildFactsPage.css';

// const WildFactsPage = () => {
//   const [globalData, setGlobalData] = useState({
//     population: { count: 8300245000, countries: [], birthRate: 0, deathRate: 0 },
//     aqi: { cities: [], worstAQI: 0, avgAQI: 0, hazardousCities: 0 },
//     emissions: { co2: 51.7, methane: 376, no2: 89 },
//     energy: { consumption: 600000, renewable: 180000, renewablePercentage: 30 },
//     internet: { users: 5300000000, penetration: 66.2, social: 4950000000 },
//     climate: { temp: 1.2, seaLevel: 3.4, arctic: 3.1, record: 54.4 },
//     biodiversity: { species: 37400, forests: 10000000, oceans: 171000000000000000 },
//     disasters: { earthquakes: 150, floods: 1500, wildfires: 50000, hurricanes: 90 },
//     environment: { forestLoss: 10000000, waterScarcity: 2300000000, foodWaste: 1300000000, plastic: 250000000 },
//     airQuality: { pm25: 35, pm10: 45, no2: 25, so2: 15 },
//     urbanization: { urban: 4200000000, rural: 3400000000, megacities: 33 },
//     waste: { municipal: 2010000000, industrial: 1800000000, electronic: 53600000 },
//     temperature: { global: 1.2, arctic: 3.1, record: 54.4 },
//     extremeWeather: { heatwaves: 120, droughts: 80, storms: 90 }
//     waterScarcity: { affected: 0, percentage: 0 },
//     foodWaste: { tons: 0, percentage: 0 },
//     plasticInOceans: { particles: 0, weight: 0 },
//     speciesAtRisk: { count: 0, percentage: 0 },
//     earthquakes: { today: 0, thisYear: 0, magnitude: 0 },
//     volcanicActivity: { active: 0, eruptions: 0 },
//     seaLevel: { current: 0, rise: 0, rate: 0 },
//     iceMelt: { arctic: 0, antarctic: 0 },
//     renewableEnergy: { solar: 0, wind: 0, hydro: 0 },
//     naturalDisasters: { floods: 0, hurricanes: 0, wildfires: 0 },
//     urbanization: { urban: 0, rural: 0, megacities: 0 },
//     biodiversityLoss: { species: 0, habitats: 0 },
//     oceanAcidification: { ph: 0, decrease: 0 },
//     desertification: { area: 0, affected: 0 },
//     freshwater: { available: 0, usage: 0, scarcity: 0 },
//     wasteGeneration: { municipal: 0, industrial: 0, electronic: 0 },
//     airQuality: { pm25: 0, pm10: 0, no2: 0, so2: 0 },
//     temperature: { global: 0, arctic: 0, record: 0 },
//     extremeWeather: { heatwaves: 0, droughts: 0, storms: 0 }
//   });
  
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState('population');
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const animationRef = useRef(null);

//   // Fetch real-time data from Worldometers and AQI.in
//   useEffect(() => {
//     const fetchRealTimeData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch World Population
//         const populationResponse = await fetch('https://worldometers.info/world-population/');
//         if (!populationResponse.ok) {
//           throw new Error('Failed to fetch population data');
//         }
//         const populationText = await populationResponse.text();
        
//         // Extract population count using regex - look for the main population counter
//         let populationCount = 8100000000; // fallback
//         const populationPatterns = [
//           /<span[^>]*class="rtsCounter">([\d,]+)<\/span>/g,
//           /(\d{1,3}(?:,\d{3})*(?:,\d{3})*)\s*currently/g,
//           /world-population[^>]*>([\d,]+)</g
//         ];
        
//         for (const pattern of populationPatterns) {
//           const matches = populationText.match(pattern);
//           if (matches && matches.length > 0) {
//             const numbers = matches.map(match => match.replace(/[^\d,]/g, ''));
//             populationCount = parseInt(numbers[0].replace(/,/g, '')) || populationCount;
//             break;
//           }
//         }
        
//         // Fetch AQI data for top polluted cities
//         const aqiResponse = await fetch('https://www.aqi.in/real-time-most-polluted-city-ranking');
//         if (!aqiResponse.ok) {
//           throw new Error('Failed to fetch AQI data');
//         }
//         const aqiText = await aqiResponse.text();
        
//         // Parse AQI data from the actual website
//         const pollutedCities = [];
//         const aqiPatterns = [
//           /<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>(\d+)<\/td>/g,
//           /city[^>]*>([^<]+)<\/td>.*?aqi[^>]*>(\d+)<\/td>/gi
//         ];
        
//         // Extract city names and AQI values
//         const cityMatches = aqiText.match(/<tr[^>]*>.*?<\/tr>/gs) || [];
//         cityMatches.forEach(row => {
//           const cityMatch = row.match(/<td[^>]*>([^<]+(?:\s*[^<]*)?)<\/td>/g);
//           const aqiMatch = row.match(/(\d{2,3})<\/td>/g);
          
//           if (cityMatch && aqiMatch && cityMatch.length >= 2) {
//             const cityName = cityMatch[0].replace(/<[^>]*>/g, '').trim();
//             const countryMatch = row.match(/India|China|USA|Pakistan|Bangladesh|Indonesia|Thailand|Vietnam|Egypt|Iran|Iraq/gi);
//             const country = countryMatch ? countryMatch[0] : "Unknown";
//             const aqi = parseInt(aqiMatch[0]) || 0;
            
//             if (cityName && aqi > 0 && aqi < 1000) {
//               pollutedCities.push({
//                 city: cityName,
//                 aqi: aqi,
//                 country: country,
//                 lat: 28.6139 + Math.random() * 10, // Approximate coordinates
//                 lng: 77.2090 + Math.random() * 10
//               });
//             }
//           }
//         });
        
//         // If parsing fails, use fallback data
//         if (pollutedCities.length === 0) {
//           pollutedCities.push(
//             { city: "Aligarh, India", aqi: 596, country: "India", lat: 27.8974, lng: 78.0880 },
//             { city: "Saharanpur, India", aqi: 553, country: "India", lat: 29.9646, lng: 77.5506 },
//             { city: "Greater Noida, India", aqi: 454, country: "India", lat: 28.5355, lng: 77.3910 },
//             { city: "Raebareli, India", aqi: 453, country: "India", lat: 26.2384, lng: 81.2426 },
//             { city: "Noida, India", aqi: 410, country: "India", lat: 28.5355, lng: 77.3910 },
//             { city: "Hisar, India", aqi: 406, country: "India", lat: 29.1492, lng: 75.7219 },
//             { city: "Jhargram, India", aqi: 400, country: "India", lat: 22.8958, lng: 87.0349 },
//             { city: "Faridabad, India", aqi: 389, country: "India", lat: 28.4089, lng: 77.3178 },
//             { city: "Ghaziabad, India", aqi: 383, country: "India", lat: 28.6692, lng: 77.4538 },
//             { city: "Ludhiana, India", aqi: 367, country: "India", lat: 30.9010, lng: 75.8573 }
//           );
//         }
        
//         // Sort by AQI (highest first) and take top 10
//         pollutedCities.sort((a, b) => b.aqi - a.aqi);
//         const topPollutedCities = pollutedCities.slice(0, 10);
        
//         // Fetch additional data from Worldometers
//         const internetResponse = await fetch('https://worldometers.info/internet-users/');
//         const internetText = await internetResponse.text();
        
//         // Extract internet users count
//         let internetUsersCount = 5300000000;
//         const internetMatch = internetText.match(/(\d{1,3}(?:,\d{3})*(?:,\d{3})*)\s*currently/gi);
//         if (internetMatch) {
//           internetUsersCount = parseInt(internetMatch[0].replace(/[^\d,]/g, '').replace(/,/g, '')) || internetUsersCount;
//         }
        
//         // Calculate dynamic statistics based on real data
//         const currentYear = new Date().getFullYear();
//         const daysPassed = Math.floor((new Date() - new Date(currentYear, 0, 1)) / (1000 * 60 * 60 * 24));
        
//         setFacts({
//           worldPopulation: {
//             count: populationCount,
//             today: Math.floor(populationCount * 0.0000001), // ~0.01% daily increase
//             thisYear: Math.floor(populationCount * 0.01), // ~1% yearly increase
//             lastUpdated: new Date().toISOString()
//           },
//           topCountries: [
//             { country: "China", population: 1425671352, flag: "🇨🇳", capital: "Beijing", area: 9596961 },
//             { country: "India", population: 1428627663, flag: "🇮🇳", capital: "New Delhi", area: 3287263 },
//             { country: "United States", population: 339996563, flag: "🇺🇸", capital: "Washington D.C.", area: 9833517 },
//             { country: "Indonesia", population: 275501339, flag: "🇮🇩", capital: "Jakarta", area: 1904569 },
//             { country: "Pakistan", population: 240485658, flag: "🇵🇰", capital: "Islamabad", area: 881913 },
//             { country: "Brazil", population: 215313498, flag: "🇧🇷", capital: "Brasília", area: 8515767 },
//             { country: "Nigeria", population: 223804632, flag: "🇳🇬", capital: "Abuja", area: 923768 },
//             { country: "Bangladesh", population: 171186372, flag: "🇧🇩", capital: "Dhaka", area: 147570 },
//             { country: "Russia", population: 144444359, flag: "🇷🇺", capital: "Moscow", area: 17098242 },
//             { country: "Mexico", population: 128455567, flag: "🇲🇽", capital: "Mexico City", area: 1964375 }
//           ],
//           topCities: topPollutedCities,
//           worstPollutedCities: topPollutedCities,
//           worstPollutedCountries: [
//             { country: "India", avgAQI: 156, cities: 12, flag: "🇮🇳" },
//             { country: "Pakistan", avgAQI: 138, cities: 8, flag: "🇵🇰" },
//             { country: "Bangladesh", avgAQI: 125, cities: 6, flag: "🇧🇩" },
//             { country: "China", avgAQI: 98, cities: 10, flag: "🇨🇳" },
//             { country: "Indonesia", avgAQI: 87, cities: 5, flag: "🇮🇩" },
//             { country: "Thailand", avgAQI: 76, cities: 4, flag: "🇹🇭" },
//             { country: "Vietnam", avgAQI: 72, cities: 4, flag: "🇻🇳" },
//             { country: "Egypt", avgAQI: 68, cities: 3, flag: "🇪🇬" },
//             { country: "Iran", avgAQI: 65, cities: 3, flag: "🇮🇷" },
//             { country: "Iraq", avgAQI: 62, cities: 2, flag: "🇮🇶" }
//           ],
//           internetUsers: { 
//             count: internetUsersCount, 
//             today: Math.floor(internetUsersCount * 0.0000001),
//             percentage: ((internetUsersCount / populationCount) * 100).toFixed(1)
//           },
//           socialMedia: { 
//             count: Math.floor(internetUsersCount * 0.93), // 93% of internet users
//             today: Math.floor(internetUsersCount * 0.93 * 0.0000001),
//             percentage: ((internetUsersCount * 0.93 / populationCount) * 100).toFixed(1)
//           },
//           energy: { 
//             consumption: 600000 + Math.floor(Math.random() * 50000), 
//             renewable: Math.floor(600000 * 0.30),
//             renewablePercentage: 30
//           },
//           co2Levels: { 
//             current: 421 + Math.floor(Math.random() * 5), 
//             increase: 2.4,
//             preIndustrial: 280
//           },
//           forestLoss: { 
//             area: 10000000 + (daysPassed * 28), 
//             rate: 28,
//             percentage: 7.5
//           },
//           waterScarcity: { 
//             affected: 2300000000 + (daysPassed * 10000), 
//             percentage: 29
//           },
//           foodWaste: { 
//             tons: 1300000000 + (daysPassed * 100000), 
//             percentage: 33
//           },
//           plasticInOceans: { 
//             particles: 171000000000000000 + (daysPassed * 1000000000000), 
//             weight: 250000000 + (daysPassed * 100000)
//           },
//           speciesAtRisk: { 
//             count: 37400 + (daysPassed * 10), 
//             percentage: 28
//           },
//           earthquakes: {
//             today: 150 + Math.floor(Math.random() * 50),
//             thisYear: 45000 + (daysPassed * 120),
//             magnitude: 6.2
//           },
//           volcanicActivity: {
//             active: 1500,
//             eruptions: 60 + Math.floor(Math.random() * 10),
//             lastEruption: "2023"
//           },
//           seaLevel: {
//             current: 3.4 + (daysPassed * 0.009),
//             rise: 21 + (daysPassed * 0.009),
//             rate: 3.4
//           },
//           iceMelt: {
//             arctic: 13000000 - (daysPassed * 10000),
//             antarctic: 150000000 - (daysPassed * 50000),
//             rate: 280
//           },
//           renewableEnergy: {
//             solar: 850000 + (daysPassed * 1000),
//             wind: 650000 + (daysPassed * 800),
//             hydro: 1300000
//           },
//           naturalDisasters: {
//             floods: 1500 + Math.floor(daysPassed * 4),
//             hurricanes: 90 + Math.floor(Math.random() * 5),
//             wildfires: 50000 + (daysPassed * 100)
//           },
//           urbanization: {
//             urban: Math.floor(populationCount * 0.56),
//             rural: Math.floor(populationCount * 0.44),
//             megacities: 33
//           },
//           biodiversityLoss: {
//             species: 1000000 + (daysPassed * 100),
//             habitats: 75000000 + (daysPassed * 10000),
//             rate: 1000
//           },
//           oceanAcidification: {
//             ph: 8.1 - (daysPassed * 0.00001),
//             decrease: 0.1,
//             rate: 0.02
//           },
//           desertification: {
//             area: 12000000 + (daysPassed * 120),
//             affected: 2000000000 + (daysPassed * 5000),
//             rate: 120000
//           },
//           freshwater: {
//             available: 11000000 - (daysPassed * 100),
//             usage: 4000000 + (daysPassed * 50),
//             scarcity: 2000000000 + (daysPassed * 1000)
//           },
//           wasteGeneration: {
//             municipal: 2010000000 + (daysPassed * 100000),
//             industrial: 1800000000 + (daysPassed * 80000),
//             electronic: 53600000 + (daysPassed * 5000)
//           },
//           airQuality: {
//             pm25: 35 + Math.floor(Math.random() * 10),
//             pm10: 45 + Math.floor(Math.random() * 15),
//             no2: 25 + Math.floor(Math.random() * 8),
//             so2: 15 + Math.floor(Math.random() * 5)
//           },
//           temperature: {
//             global: 1.2 + (daysPassed * 0.0001),
//             arctic: 3.1 + (daysPassed * 0.0003),
//             record: 54.4
//           },
//           extremeWeather: {
//             heatwaves: 120 + Math.floor(daysPassed * 0.3),
//             droughts: 80 + Math.floor(daysPassed * 0.2),
//             storms: 90 + Math.floor(Math.random() * 2)
//           }
//         });
        
//       } catch (error) {
//         console.error('Error fetching real-time data:', error);
//         // Use fallback data with dynamic calculations
//         const currentYear = new Date().getFullYear();
//         const daysPassed = Math.floor((new Date() - new Date(currentYear, 0, 1)) / (1000 * 60 * 60 * 24));
//         const basePopulation = 8100000000;
        
//         const pollutedCities = [
//           { city: "Aligarh, India", aqi: 596, country: "India", lat: 27.8974, lng: 78.0880 },
//           { city: "Saharanpur, India", aqi: 553, country: "India", lat: 29.9646, lng: 77.5506 },
//           { city: "Greater Noida, India", aqi: 454, country: "India", lat: 28.5355, lng: 77.3910 }
//         ];
        
//         setFacts({
//           worldPopulation: {
//             count: basePopulation + (daysPassed * 200000),
//             today: 810000 + (daysPassed * 200),
//             thisYear: 81000000 + (daysPassed * 200000),
//             lastUpdated: new Date().toISOString()
//           },
//           topCountries: [
//             { country: "China", population: 1425671352, flag: "🇨🇳", capital: "Beijing", area: 9596961 },
//             { country: "India", population: 1428627663, flag: "🇮🇳", capital: "New Delhi", area: 3287263 },
//             { country: "United States", population: 339996563, flag: "🇺🇸", capital: "Washington D.C.", area: 9833517 }
//           ],
//           topCities: pollutedCities,
//           worstPollutedCities: pollutedCities,
//           worstPollutedCountries: [
//             { country: "India", avgAQI: 156, cities: 12, flag: "🇮🇳" },
//             { country: "Pakistan", avgAQI: 138, cities: 8, flag: "🇵🇰" },
//             { country: "Bangladesh", avgAQI: 125, cities: 6, flag: "🇧🇩" }
//           ],
//           internetUsers: { count: 5300000000, today: 500000, percentage: 66.2 },
//           socialMedia: { count: 4950000000, today: 300000, percentage: 61.9 },
//           energy: { consumption: 600000, renewable: 180000, renewablePercentage: 30 },
//           co2Levels: { current: 421, increase: 2.4, preIndustrial: 280 },
//           forestLoss: { area: 10000000, rate: 28, percentage: 7.5 },
//           waterScarcity: { affected: 2300000000, percentage: 29 },
//           foodWaste: { tons: 1300000000, percentage: 33 },
//           plasticInOceans: { particles: 171000000000000000, weight: 250000000 },
//           speciesAtRisk: { count: 37400, percentage: 28 },
//           earthquakes: { today: 150, thisYear: 45000, magnitude: 6.2 },
//           volcanicActivity: { active: 1500, eruptions: 60, lastEruption: "2023" },
//           seaLevel: { current: 3.4, rise: 21, rate: 3.4 },
//           iceMelt: { arctic: 13000000, antarctic: 150000000, rate: 280 },
//           renewableEnergy: { solar: 850000, wind: 650000, hydro: 1300000 },
//           naturalDisasters: { floods: 1500, hurricanes: 90, wildfires: 50000 },
//           urbanization: { urban: 4200000000, rural: 3400000000, megacities: 33 },
//           biodiversityLoss: { species: 1000000, habitats: 75000000, rate: 1000 },
//           oceanAcidification: { ph: 8.1, decrease: 0.1, rate: 0.02 },
//           desertification: { area: 12000000, affected: 2000000000, rate: 120000 },
//           freshwater: { available: 11000000, usage: 4000000, scarcity: 2000000000 },
//           wasteGeneration: { municipal: 2010000000, industrial: 1800000000, electronic: 53600000 },
//           airQuality: { pm25: 35, pm10: 45, no2: 25, so2: 15 },
//           temperature: { global: 1.2, arctic: 3.1, record: 54.4 },
//           extremeWeather: { heatwaves: 120, droughts: 80, storms: 90 }
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRealTimeData();
    
//     // Auto-refresh every 30 seconds
//     const interval = setInterval(fetchRealTimeData, 30000);
    
//     return () => clearInterval(interval);
//   }, []); // Empty dependency array since we're fetching fresh data each time

//   // Update time every second
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);
    
//     return () => clearInterval(timer);
//   }, []);

//   // Animate counter
//   useEffect(() => {
//     if (animationRef.current) {
//       const animateValue = (start, end, duration, callback) => {
//         const startTime = Date.now();
//         const endTime = startTime + duration;
        
//         const animate = () => {
//           const currentTime = Date.now();
//           const progress = Math.min((currentTime - startTime) / duration, 1);
//           const currentValue = Math.floor(start + (end - start) * progress);
          
//           callback(currentValue);
          
//           if (currentTime < endTime) {
//             requestAnimationFrame(animate);
//           }
//         };
        
//         requestAnimationFrame(animate);
//       };
      
//       // Animate population count
//       animateValue(facts.worldPopulation.count - 1000000, facts.worldPopulation.count, 2000, (value) => {
//         setFacts(prev => ({
//           ...prev,
//           worldPopulation: { ...prev.worldPopulation, count: value }
//         }));
//       });
//     }
//   }, [facts.worldPopulation.count]);

//   const formatNumber = (num) => {
//     if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
//     if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
//     if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
//     return num.toString();
//   };

//   const getAQIColor = (aqi) => {
//     if (aqi >= 400) return '#dc2626'; // Hazardous
//     if (aqi >= 300) return '#ea580c'; // Very Unhealthy
//     if (aqi >= 200) return '#f59e0b'; // Unhealthy
//     if (aqi >= 100) return '#eab308'; // Unhealthy for Sensitive
//     return '#10b981'; // Good
//   };

//   const getCategoryBackground = (category) => {
//     const backgrounds = {
//       population: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       countries: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
//       cities: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
//       pollution: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
//       environment: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
//       technology: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
//       social: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
//       disasters: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
//       climate: 'linear-gradient(135deg, #ff8a80 0%, #ffab91 100%)',
//       energy: 'linear-gradient(135deg, #fff176 0%, #ffeb3b 100%)',
//       urban: 'linear-gradient(135deg, #b39ddb 0%, #8e24aa 100%)',
//       biodiversity: 'linear-gradient(135deg, #81c784 0%, #4caf50 100%)',
//       ocean: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
//       earth: 'linear-gradient(135deg, #8d6e63 0%, #5d4037 100%)'
//     };
//     return backgrounds[category] || backgrounds.population;
//   };

//   const getCategoryIcon = (category) => {
//     const icons = {
//       population: '👥',
//       countries: '🌍',
//       cities: '🏙️',
//       pollution: '😷',
//       environment: '🌿',
//       technology: '💻',
//       social: '📱',
//       disasters: '🌪',
//       climate: '🌡️',
//       energy: '⚡',
//       urban: '🏘️',
//       biodiversity: '🦋',
//       ocean: '🌊',
//       earth: '🌎'
//     };
//     return icons[category] || '🌍';
//   };

//   return (
//     <div className={`wild-facts-page ${isDarkMode ? 'dark' : 'light'}`}>
//       {/* Header */}
//       <header className="facts-header">
//         <div className="header-content">
//           <div className="header-text">
//             <h1 className="main-title">
//               <span className="title-icon">🌍</span>
//               Wild World Facts
//             </h1>
//             <p className="subtitle">Real-time global statistics and environmental insights</p>
//           </div>
//           <div className="header-controls">
//             <div className="current-time">
//               <span className="time-label">Live Time:</span>
//               <span className="time-value">{currentTime.toLocaleTimeString()}</span>
//             </div>
//             <button 
//               className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
//               onClick={() => setIsDarkMode(!isDarkMode)}
//             >
//               {isDarkMode ? '☀️' : '🌙'}
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Category Navigation */}
//       <nav className="category-nav">
//         <div className="category-nav-content">
//           {Object.keys({
//             population: 'Population',
//             countries: 'Countries',
//             cities: 'Cities',
//             pollution: 'Pollution',
//             environment: 'Environment',
//             technology: 'Technology',
//             social: 'Social Media',
//             disasters: 'Disasters',
//             climate: 'Climate',
//             energy: 'Energy',
//             urban: 'Urbanization',
//             biodiversity: 'Biodiversity',
//             ocean: 'Ocean',
//             earth: 'Earth Science'
//           }).map((key) => (
//             <button
//               key={key}
//               className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
//               onClick={() => setSelectedCategory(key)}
//               style={{ background: getCategoryBackground(key) }}
//             >
//               <span className="category-icon">{getCategoryIcon(key)}</span>
//               <span className="category-label">{key}</span>
//             </button>
//           ))}
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className="facts-content">
//         {loading ? (
//           <div className="loading-container">
//             <div className="loading-spinner"></div>
//             <p>Fetching real-time world data...</p>
//           </div>
//         ) : (
//           <>
//             {/* Population Section */}
//             {selectedCategory === 'population' && (
//               <div className="facts-grid">
//                 <div className="fact-card main-fact">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌍</span>
//                     <h2>World Population</h2>
//                     <span className="live-badge">LIVE</span>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.worldPopulation.count)}</span>
//                       <span className="counter-label">People</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">+{formatNumber(facts.worldPopulation.today)}</span>
//                         <span className="stat-label">Today</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">+{formatNumber(facts.worldPopulation.thisYear)}</span>
//                         <span className="stat-label">This Year</span>
//                       </div>
//                     </div>
//                     <div className="fact-footer">
//                       <span>Source: Worldometers.info</span>
//                       <span>Updated: {new Date(facts.worldPopulation.lastUpdated).toLocaleTimeString()}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">📱</span>
//                     <h2>Internet Users</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.internetUsers.count)}</span>
//                       <span className="counter-label">Users</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">+{formatNumber(facts.internetUsers.today)}</span>
//                         <span className="stat-label">Today</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.internetUsers.percentage}%</span>
//                         <span className="stat-label">Global Penetration</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">📱</span>
//                     <h2>Social Media Users</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.socialMedia.count)}</span>
//                       <span className="counter-label">Users</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">+{formatNumber(facts.socialMedia.today)}</span>
//                         <span className="stat-label">Today</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.socialMedia.percentage}%</span>
//                         <span className="stat-label">Global Penetration</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Countries Section */}
//             {selectedCategory === 'countries' && (
//               <div className="facts-grid">
//                 <div className="fact-card full-width">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌍</span>
//                     <h2>Top 10 Most Populated Countries</h2>
//                     <span className="live-badge">LIVE</span>
//                   </div>
//                   <div className="countries-list">
//                     {facts.topCountries.map((country, index) => (
//                       <div key={index} className="country-item">
//                         <div className="country-rank">#{index + 1}</div>
//                         <div className="country-flag">{country.flag}</div>
//                         <div className="country-info">
//                           <div className="country-name">{country.country}</div>
//                           <div className="country-population">{formatNumber(country.population)}</div>
//                           <div className="country-capital">Capital: {country.capital}</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">😷</span>
//                     <h2>Worst Polluted Countries</h2>
//                   </div>
//                   <div className="countries-list">
//                     {facts.worstPollutedCountries.map((country, index) => (
//                       <div key={index} className="country-item polluted">
//                         <div className="country-rank">#{index + 1}</div>
//                         <div className="country-flag">{country.flag}</div>
//                         <div className="country-info">
//                           <div className="country-name">{country.country}</div>
//                           <div className="country-aqi" style={{ color: getAQIColor(country.avgAQI) }}>
//                             Avg AQI: {country.avgAQI}
//                           </div>
//                           <div className="country-stats">
//                             <span>{country.cities} major cities</span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Cities Section */}
//             {selectedCategory === 'cities' && (
//               <div className="facts-grid">
//                 <div className="fact-card full-width">
//                   <div className="fact-header">
//                     <span className="fact-icon">🏙️</span>
//                     <h2>Top 10 Most Polluted Cities</h2>
//                     <span className="live-badge">LIVE</span>
//                   </div>
//                   <div className="cities-list">
//                     {facts.topCities.map((city, index) => (
//                       <div key={index} className="city-item">
//                         <div className="city-rank">#{index + 1}</div>
//                         <div className="city-info">
//                           <div className="city-name">{city.city}</div>
//                           <div className="city-country">{city.country}</div>
//                           <div className="city-aqi" style={{ color: getAQIColor(city.aqi) }}>
//                             AQI: {city.aqi}
//                           </div>
//                           <div className="city-status">
//                             Status: <span style={{ color: getAQIColor(city.aqi) }}>
//                               {city.aqi >= 400 ? 'Hazardous' : 
//                                city.aqi >= 300 ? 'Very Unhealthy' :
//                                city.aqi >= 200 ? 'Unhealthy' :
//                                city.aqi >= 100 ? 'Unhealthy for Sensitive' : 'Moderate'}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Pollution Section */}
//             {selectedCategory === 'pollution' && (
//               <div className="facts-grid">
//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🏭</span>
//                     <h2>CO2 Levels</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{facts.co2Levels.current} ppm</span>
//                       <span className="counter-label">Current Level</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">+{facts.co2Levels.increase} ppm</span>
//                         <span className="stat-label">Above Pre-Industrial</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.co2Levels.preIndustrial} ppm</span>
//                         <span className="stat-label">Pre-Industrial</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌊</span>
//                     <h2>Plastic in Oceans</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.plasticInOceans.particles)}</span>
//                       <span className="counter-label">Particles</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.plasticInOceans.weight)}</span>
//                         <span className="stat-label">Metric Tons</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌳</span>
//                     <h2>Forest Loss</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.forestLoss.area)}</span>
//                       <span className="counter-label">Hectares Lost</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.forestLoss.rate} ha/hr</span>
//                         <span className="stat-label">Loss Rate</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.forestLoss.percentage}%</span>
//                         <span className="stat-label">Total Loss</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Environment Section */}
//             {selectedCategory === 'environment' && (
//               <div className="facts-grid">
//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">💧</span>
//                     <h2>Water Scarcity</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.waterScarcity.affected)}</span>
//                       <span className="counter-label">People Affected</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.waterScarcity.percentage}%</span>
//                         <span className="stat-label">Global Population</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌾</span>
//                     <h2>Food Waste</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.foodWaste.tons)}</span>
//                       <span className="counter-label">Tons/Year</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.foodWaste.percentage}%</span>
//                         <span className="stat-label">Global Production</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🦕</span>
//                     <h2>Species at Risk</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.speciesAtRisk.count)}</span>
//                       <span className="counter-label">Threatened Species</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.speciesAtRisk.percentage}%</span>
//                         <span className="stat-label">Assessed Species</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Technology Section */}
//             {selectedCategory === 'technology' && (
//               <div className="facts-grid">
//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">⚡</span>
//                     <h2>Global Energy</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.energy.consumption)}</span>
//                       <span className="counter-label">TWh/Year</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.energy.renewable)}</span>
//                         <span className="stat-label">Renewable TWh</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.energy.renewablePercentage}%</span>
//                         <span className="stat-label">Renewable Share</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Disasters Section */}
//             {selectedCategory === 'disasters' && (
//               <div className="facts-grid">
//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌪</span>
//                     <h2>Natural Disasters</h2>
//                     <span className="live-badge">LIVE</span>
//                   </div>
//                   <div className="fact-content">
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.naturalDisasters.floods}</span>
//                         <span className="stat-label">Floods (Year)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.naturalDisasters.hurricanes}</span>
//                         <span className="stat-label">Hurricanes (Year)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.naturalDisasters.wildfires)}</span>
//                         <span className="stat-label">Wildfires (Year)</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌍</span>
//                     <h2>Earthquakes</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.earthquakes.today}</span>
//                         <span className="stat-label">Today</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.earthquakes.thisYear)}</span>
//                         <span className="stat-label">This Year</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.earthquakes.magnitude}</span>
//                         <span className="stat-label">Avg Magnitude</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌋</span>
//                     <h2>Volcanic Activity</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.volcanicActivity.active}</span>
//                         <span className="stat-label">Active Volcanoes</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.volcanicActivity.eruptions}</span>
//                         <span className="stat-label">Eruptions (Year)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.volcanicActivity.lastEruption}</span>
//                         <span className="stat-label">Last Major</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Climate Section */}
//             {selectedCategory === 'climate' && (
//               <div className="facts-grid">
//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌡️</span>
//                     <h2>Global Temperature</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">+{facts.temperature.global}°C</span>
//                       <span className="counter-label">Above Pre-Industrial</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">+{facts.temperature.arctic}°C</span>
//                         <span className="stat-label">Arctic Warming</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.temperature.record}°C</span>
//                         <span className="stat-label">Record High</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌊</span>
//                     <h2>Sea Level Rise</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{facts.seaLevel.current}mm</span>
//                       <span className="counter-label">Current Rise</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.seaLevel.rise}cm</span>
//                         <span className="stat-label">Since 1900</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.seaLevel.rate}mm/year</span>
//                         <span className="stat-label">Annual Rate</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌪</span>
//                     <h2>Extreme Weather</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.extremeWeather.heatwaves}</span>
//                         <span className="stat-label">Heatwaves (Year)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.extremeWeather.droughts}</span>
//                         <span className="stat-label">Droughts (Year)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.extremeWeather.storms}</span>
//                         <span className="stat-label">Major Storms</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Urbanization Section */}
//             {selectedCategory === 'urban' && (
//               <div className="facts-grid">
//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🏘️</span>
//                     <h2>Urban Population</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.urbanization.urban)}</span>
//                       <span className="counter-label">Urban Residents</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.urbanization.rural)}</span>
//                         <span className="stat-label">Rural Residents</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.urbanization.megacities}</span>
//                         <span className="stat-label">Megacities</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Biodiversity Section */}
//             {selectedCategory === 'biodiversity' && (
//               <div className="facts-grid">
//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🦋</span>
//                     <h2>Biodiversity Loss</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.biodiversityLoss.species)}</span>
//                       <span className="counter-label">Species at Risk</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.biodiversityLoss.habitats)}</span>
//                         <span className="stat-label">Hectares Lost</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.biodiversityLoss.rate}</span>
//                         <span className="stat-label">Species/Year Lost</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Ocean Section */}
//             {selectedCategory === 'ocean' && (
//               <div className="facts-grid">
//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🌊</span>
//                     <h2>Ocean Acidification</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{facts.oceanAcidification.ph}</span>
//                       <span className="counter-label">Current pH</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">-{facts.oceanAcidification.decrease}</span>
//                         <span className="stat-label">pH Decrease</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.oceanAcidification.rate}</span>
//                         <span className="stat-label">Annual Change</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🧊</span>
//                     <h2>Ice Melt</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.iceMelt.arctic)}</span>
//                         <span className="stat-label">Arctic (km²)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.iceMelt.antarctic)}</span>
//                         <span className="stat-label">Antarctic (km²)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{facts.iceMelt.rate}</span>
//                         <span className="stat-label">Gt/Year Lost</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Earth Science Section */}
//             {selectedCategory === 'earth' && (
//               <div className="facts-grid">
//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🏜️</span>
//                     <h2>Desertification</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="counter">
//                       <span className="counter-value">{formatNumber(facts.desertification.area)}</span>
//                       <span className="counter-label">Hectares Affected</span>
//                     </div>
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.desertification.affected)}</span>
//                         <span className="stat-label">People Affected</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.desertification.rate)}</span>
//                         <span className="stat-label">Hectares/Year</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">💧</span>
//                     <h2>Freshwater</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.freshwater.available)}</span>
//                         <span className="stat-label">Available (km³)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.freshwater.usage)}</span>
//                         <span className="stat-label">Usage (km³)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.freshwater.scarcity)}</span>
//                         <span className="stat-label">People in Scarcity</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="fact-card">
//                   <div className="fact-header">
//                     <span className="fact-icon">🗑️</span>
//                     <h2>Waste Generation</h2>
//                   </div>
//                   <div className="fact-content">
//                     <div className="fact-stats">
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.wasteGeneration.municipal)}</span>
//                         <span className="stat-label">Municipal (tons/year)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.wasteGeneration.industrial)}</span>
//                         <span className="stat-label">Industrial (tons/year)</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-value">{formatNumber(facts.wasteGeneration.electronic)}</span>
//                         <span className="stat-label">E-Waste (tons/year)</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="facts-footer">
//         <div className="footer-content">
//           <div className="footer-info">
//             <h3>🌍 Wild World Facts</h3>
//             <p>Real-time global statistics and environmental insights</p>
//           </div>
//           <div className="footer-sources">
//             <h4>Data Sources:</h4>
//             <ul>
//               <li>Worldometers.info - Real-time world statistics</li>
//               <li>AQI.in - Air quality index monitoring</li>
//               <li>NASA - Climate and environmental data</li>
//               <li>UNEP - United Nations Environment Programme</li>
//               <li>UN - United Nations statistics</li>
//               <li>NOAA - National Oceanic and Atmospheric Administration</li>
//               <li>FAO - Food and Agriculture Organization</li>
//               <li>IUCN - International Union for Conservation of Nature</li>
//               <li>IEA - International Energy Agency</li>
//             </ul>
//           </div>
//         </div>
//         <div className="footer-meta">
//           <p>Auto-refreshes every 30 seconds | Data accuracy may vary</p>
//           <p>Last updated: {currentTime.toLocaleString()}</p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default WildFactsPage;



import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WildFactsPage.css';

const WildFactsPage = () => {
  const [index, setIndex] = useState(0);
  const [livePop, setLivePop] = useState(8300245000); // Live base for Feb 2026
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 1. LIVE DATA ENGINE: Population Ticker (Feb 2026 growth constants)
  useEffect(() => {
    const ticker = setInterval(() => {
      // Global growth is roughly 2.5 people per second
      setLivePop(prev => prev + 0.251); 
    }, 100);
    return () => clearInterval(ticker);
  }, []);

  // 2. LIVE DATA ENGINE: Clock & UI Sync
  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const slides = [
    {
      id: 'population',
      title: "Human Footprint",
      subtitle: "REAL-TIME GLOBAL PRESENCE",
      mainValue: Math.floor(livePop).toLocaleString(),
      label: "TOTAL POPULATION",
      color: "#3b82f6",
      liveStats: [
        { key: "India", val: "1.47B+", status: "RANK 1" },
        { key: "China", val: "1.41B+", status: "RANK 2" },
        { key: "USA", val: "349M+", status: "RANK 3" }
      ],
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920",
      quote: "Growth rate: ~2.5 lives per second. Tracking planetary expansion in real-time."
    },
    {
      id: 'aqi',
      title: "Toxic Horizon",
      subtitle: "ATMOSPHERIC SENSOR NETWORK",
      mainValue: "483",
      label: "GLOBAL PEAK AQI",
      color: "#f59e0b",
      liveStats: [
        { key: "Ghaziabad", val: "483 AQI", status: "HAZARDOUS" },
        { key: "New Delhi", val: "451 AQI", status: "SEVERE" },
        { key: "Noida", val: "443 AQI", status: "SEVERE" }
      ],
      image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=1920",
      quote: "Asia recorded the highest hazardous AQI levels globally in early 2026."
    },
    {
      id: 'emissions',
      title: "Carbon Intensity",
      subtitle: "CARBON INTENSITY MONITORING",
      mainValue: "51.7B",
      label: "ANNUAL t CO2eq",
      color: "#ef4444",
      liveStats: [
        { key: "CO2", val: "51.7B tons", status: "CRITICAL" },
        { key: "Methane", val: "376M tons", status: "RISING" },
        { key: "N2O", val: "89M tons", status: "STABLE" }
      ],
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920",
      quote: "CO2 accounts for the vast majority of global greenhouse gas emissions."
    },
    {
      id: 'energy',
      title: "Energy Transition",
      subtitle: "GLOBAL RENEWABLE TRACKING",
      mainValue: "30%",
      label: "RENEWABLE SHARE",
      color: "#10b981",
      liveStats: [
        { key: "Total Energy", val: "600 TWh", status: "GLOBAL" },
        { key: "Renewable", val: "180 TWh", status: "GROWING" },
        { key: "Fossil", val: "420 TWh", status: "DECLINING" }
      ],
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1920",
      quote: "Renewable energy capacity is accelerating globally as costs decline."
    },
    {
      id: 'internet',
      title: "Digital Revolution",
      subtitle: "GLOBAL CONNECTIVITY",
      mainValue: "5.3B",
      label: "INTERNET USERS",
      color: "#06b6d4",
      liveStats: [
        { key: "Penetration", val: "66.2%", status: "GROWING" },
        { key: "Social Media", val: "4.95B", status: "EXPANDING" },
        { key: "Non-users", val: "3.0B", status: "TARGET" }
      ],
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920",
      quote: "The internet continues to connect humanity at unprecedented scales."
    },
    {
      id: 'climate',
      title: "Climate Change",
      subtitle: "GLOBAL TEMPERATURE TRACKING",
      mainValue: "+1.2°C",
      label: "ABOVE PRE-INDUSTRIAL",
      color: "#dc2626",
      liveStats: [
        { key: "Global", val: "+1.2°C", status: "CRITICAL" },
        { key: "Arctic", val: "+3.1°C", status: "EXTREME" },
        { key: "Record", val: "54.4°C", status: "HISTORIC" }
      ],
      image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1920",
      quote: "Climate change represents the greatest challenge of our generation."
    },
    {
      id: 'disasters',
      title: "Natural Disasters",
      subtitle: "GLOBAL DISASTER MONITORING",
      mainValue: "150",
      label: "EARTHQUAKES TODAY",
      color: "#8b5cf6",
      liveStats: [
        { key: "Earthquakes", val: "150/day", status: "ACTIVE" },
        { key: "Floods", val: "1500/year", status: "INCREASING" },
        { key: "Wildfires", val: "50K/year", status: "CRITICAL" }
      ],
      image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?q=80&w=1920",
      quote: "Climate change is intensifying the frequency and severity of natural disasters."
    },
    {
      id: 'environment',
      title: "Environmental Crisis",
      subtitle: "ECOSYSTEM HEALTH MONITORING",
      mainValue: "10.0M",
      label: "FOREST LOSS (HA/yr)",
      color: "#059669",
      liveStats: [
        { key: "Forest Loss", val: "10.0M ha", status: "CRITICAL" },
        { key: "Water Scarcity", val: "2.3B people", status: "GROWING" },
        { key: "Food Waste", val: "1.3B tons", status: "UNSUSTAINABLE" }
      ],
      image: "https://images.unsplash.com/photo-1540206395-68808572332f?q=80&w=1920",
      quote: "Environmental degradation threatens ecosystem stability and human survival."
    },
    {
      id: 'biodiversity',
      title: "Biodiversity Loss",
      subtitle: "SPECIES & HABITAT MONITORING",
      mainValue: "37,400",
      label: "THREATENED SPECIES",
      color: "#10b981",
      liveStats: [
        { key: "Species at Risk", val: "37,400", status: "CRITICAL" },
        { key: "Forest Cover", val: "10.0M ha", status: "DECLINING" },
        { key: "Ocean Plastic", val: "171T particles", status: "ACCUMULATING" }
      ],
      image: "https://images.unsplash.com/photo-1540206395-68808572332f?q=80&w=1920",
      quote: "Biodiversity loss threatens ecosystem stability and human survival."
    },
    {
      id: 'urbanization',
      title: "Urban Expansion",
      subtitle: "CITY POPULATION DYNAMICS",
      mainValue: "4.2B",
      label: "URBAN POPULATION",
      color: "#f59e0b",
      liveStats: [
        { key: "Urban", val: "4.2B", status: "GROWING" },
        { key: "Rural", val: "3.4B", status: "DECLINING" },
        { key: "Megacities", val: "33", status: "EXPANDING" }
      ],
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920",
      quote: "Urbanization is reshaping human settlement patterns globally."
    },
    {
      id: 'waste',
      title: "Waste Generation",
      subtitle: "GLOBAL WASTE TRACKING",
      mainValue: "2.0B",
      label: "MUNICIPAL WASTE (tons/yr)",
      color: "#6b7280",
      liveStats: [
        { key: "Municipal", val: "2.0B tons", status: "GROWING" },
        { key: "Industrial", val: "1.8B tons", status: "INCREASING" },
        { key: "E-Waste", val: "53M tons", status: "EXPLODING" }
      ],
      image: "https://images.unsplash.com/photo-1585839326423-7a8295c8c2fc?q=80&w=1920",
      quote: "Waste generation is accelerating with consumption patterns globally."
    },
    {
      id: 'airquality',
      title: "Air Quality",
      subtitle: "ATMOSPHERIC POLLUTANTS",
      mainValue: "35 µg/m³",
      label: "PM2.5 LEVEL",
      color: "#ef4444",
      liveStats: [
        { key: "PM2.5", val: "35 µg/m³", status: "UNHEALTHY" },
        { key: "PM10", val: "45 µg/m³", status: "MODERATE" },
        { key: "NO2", val: "25 µg/m³", status: "ACCEPTABLE" }
      ],
      image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=1920",
      quote: "Air pollution remains a major environmental health concern worldwide."
    }
  ];

  const paginate = useCallback((dir) => {
    setIndex((prev) => (prev + dir + slides.length) % slides.length);
  }, [slides.length, setIndex]);

  // 3. SIMPLE TOUCHPAD / SWIPE GESTURES (without useGesture)
  const handleSwipe = useCallback((direction) => {
    paginate(direction);
  }, [paginate]);

  // Mouse wheel navigation
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY;
      if (delta > 0) {
        handleSwipe(1); // Swipe down = next slide
      } else {
        handleSwipe(-1); // Swipe up = previous slide
      }
    };

    const element = document.querySelector('.nexus-stage');
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
      return () => element.removeEventListener('wheel', handleWheel);
    }
  }, [handleSwipe]);

  // Touch events for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      setIsAutoPlaying(false);
    };
    
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        const direction = diff > 0 ? -1 : 1;
        handleSwipe(direction);
      }
      
      setTimeout(() => setIsAutoPlaying(true), 3000);
    };
    
    const element = document.querySelector('.nexus-stage');
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [handleSwipe]);

  // 4. AUTO-ROTATION ENGINE
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => paginate(1), 30000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, paginate]);

  const current = slides[index];

  return (
    <div className="nexus-stage">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="nexus-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${current.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="nexus-layout">
            <header className="nexus-top-nav">
              <div className="nexus-branding">
                {/* <span className="n-pill">GEO NEXUS AI</span>
                <h1 className="n-feed-title">Visual Intelligence Feed</h1> */}
              </div>
              <div className="nexus-status-hub">
                <div className="n-live-tag">
                  <span className="n-dot"></span> SATELLITE UPLINK ACTIVE
                </div>
                <div className="n-clock">{currentTime.toLocaleTimeString()}</div>
              </div>
            </header>

            <main className="nexus-main-content">
              <div className="n-text-reveal">
                <motion.span className="n-subtitle" initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.2}}>
                  {current.subtitle}
                </motion.span>
                <motion.h2 className="n-title" initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.3}}>
                  {current.title}
                </motion.h2>

                <motion.div className="n-glass-card" initial={{x:-40, opacity:0}} animate={{x:0, opacity:1}} transition={{delay:0.5}}>
                  <div className="g-header">
                    <span className="g-label">{current.label}</span>
                  </div>
                  <div className="g-value" style={{ color: current.color }}>
                    {current.mainValue}
                  </div>
                  <div className="g-divider" />
                  <div className="g-grid">
                    {current.liveStats.map((stat, i) => (
                      <div key={i} className="g-item">
                        <span className="g-key">{stat.key}</span>
                        <span className="g-val">{stat.val}</span>
                        <span className="g-status" style={{color: current.color}}>{stat.status}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <p className="n-quote">"{current.quote}"</p>
              </div>
            </main>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controller UI */}
      <button className="n-arrow left" onClick={() => paginate(-1)}>‹</button>
      <button className="n-arrow right" onClick={() => paginate(1)}>›</button>

      <footer className="n-progress-bar">
        {slides.map((_, i) => (
          <div key={i} className={`p-segment ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} />
        ))}
      </footer>
    </div>
  );
};

export default WildFactsPage;