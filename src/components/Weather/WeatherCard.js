import React from 'react';
import './WeatherCard.css';

const WeatherCard = ({ weather }) => {
  if (!weather || !weather.temp_c) {
    return (
      <div className="card weather-card glass-morphic">
        <div className="weather-header">
          <h3>Live Atmospheric Intelligence</h3>
        </div>
        <div className="loading-weather">
          <span className="weather-spinner"></span>
          <p>Awaiting Satellite Data...</p>
        </div>
      </div>
    );
  }

  const localTimeStr = weather.local_time 
    ? new Date(weather.local_time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    : new Date().toLocaleTimeString();

  // const tempF = ((weather.temp_c * 9/5) + 32).toFixed(1);
  // const feelsLikeF = weather.feels_like_c ? ((weather.feels_like_c * 9/5) + 32).toFixed(1) : tempF;

  // // Format sunrise/sunset times
  // const formatTime = (timeStr) => {
  //   if (!timeStr) return "N/A";
  //   try {
  //     return new Date(timeStr).toLocaleTimeString([], { 
  //       hour: '2-digit', 
  //       minute: '2-digit',
  //       hour12: false 
  //     });
  //   } catch {
  //     return "N/A";
  //   }
  // };

  // UV Index level and color
  const getUVLevel = (uvIndex) => {
    if (!uvIndex) return { level: "Low", color: "#10b981" };
    if (uvIndex <= 2) return { level: "Low", color: "#10b981" };
    if (uvIndex <= 5) return { level: "Moderate", color: "#f59e0b" };
    if (uvIndex <= 7) return { level: "High", color: "#ef4444" };
    if (uvIndex <= 10) return { level: "Very High", color: "#dc2626" };
    return { level: "Extreme", color: "#991b1b" };
  };

  // AQI level and color
  const getAQILevel = (aqi) => {
    if (!aqi) return { level: "N/A", color: "#6b7280" };
    if (aqi <= 50) return { level: "Good", color: "#10b981" };
    if (aqi <= 100) return { level: "Moderate", color: "#f59e0b" };
    if (aqi <= 150) return { level: "Unhealthy for Sensitive", color: "#ef4444" };
    if (aqi <= 200) return { level: "Unhealthy", color: "#dc2626" };
    if (aqi <= 300) return { level: "Very Unhealthy", color: "#991b1b" };
    return { level: "Hazardous", color: "#7f1d1d" };
  };

  // // Comfort score color
  // const getComfortColor = (score) => {
  //   if (!score) return "#6b7280";
  //   if (score >= 80) return "#10b981";
  //   if (score >= 60) return "#f59e0b";
  //   return "#ef4444";
  // };

  const uvInfo = getUVLevel(weather.uv_index);
  const aqiInfo = getAQILevel(weather.air_quality?.aqi);
  // const comfortColor = getComfortColor(weather.comfort_score);

  return (
    <div className="card weather-card glass-morphic compact">
      <div className="weather-header">
        <div className="title-stack">
          <h3>🌍 Atmospheric</h3>
          <p className="subtitle">{weather.timezone || "Tracking"} • {localTimeStr}</p>
        </div>
        <div className="weather-icon-main">{weather.icon || "🌡️"}</div>
      </div>
      
      {/* Compact Primary Conditions */}
      <div className="weather-grid-compact">
        <div className="weather-item-primary">
          <span className="w-label">TEMP</span>
          <span className="w-value-primary">{weather.temp_c.toFixed(1)}°C</span>
          <span className="w-subtitle">Feels {weather.feels_like_c ? `${weather.feels_like_c.toFixed(1)}°C` : "N/A"}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">CONDITIONS</span>
          <span className="w-value">{weather.description || "Localized"}</span>
          <span className="w-subtitle">{weather.weather_severity || "Mild"}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">HUMIDITY</span>
          <span className="w-value">{weather.humidity}%</span>
        </div>
        <div className="weather-item">
          <span className="w-label">WIND</span>
          <span className="w-value">{weather.wind_speed_kmh} km/h</span>
          <span className="w-subtitle">{weather.wind_direction_cardinal || "N/A"}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">PRESSURE</span>
          <span className="w-value">{weather.pressure_hpa} hPa</span>
        </div>
        <div className="weather-item">
          <span className="w-label">UV INDEX</span>
          <span className="w-value" style={{ color: uvInfo.color }}>
            {weather.uv_index || 0}
          </span>
          <span className="w-subtitle">{uvInfo.level}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">AIR QUALITY</span>
          <span className="w-value" style={{ color: aqiInfo.color }}>
            {weather.air_quality?.aqi || "N/A"}
          </span>
          <span className="w-subtitle">{aqiInfo.level}</span>
        </div>
        <div className="weather-item">
          <span className="w-label">PM2.5</span>
          <span className="w-value" style={{ color: aqiInfo.color }}>
            {weather.air_quality?.pm25 || "N/A"}
          </span>
          <span className="w-subtitle">µg/m³</span>
        </div>
        <div className="weather-item">
          <span className="w-label">TOP POLLUTANT</span>
          <span className="w-value">
            {weather.air_quality?.dominant_pollutant || "N/A"}
          </span>
          <span className="w-subtitle">
            {weather.air_quality?.pollutant_level || "Moderate"}
          </span>
        </div>
        <div className="weather-item">
          <span className="w-label">VISIBILITY</span>
          <span className="w-value">{weather.visibility_km} km</span>
        </div>
      </div>

      {/* Compact Footer */}
      <div className="weather-footer compact">
        <span className="live-pulse"></span>
        <span className="live-text">
          LIVE • {weather.is_day ? "DAY" : "NIGHT"} • {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default WeatherCard;