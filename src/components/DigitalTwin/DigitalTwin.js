import React, { useState } from 'react';
import { API_BASE } from '../../config/api';
import './DigitalTwin.css';

const DigitalTwin = ({ location, onImpactUpdate }) => {
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [selectedDevelopment, setSelectedDevelopment] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [placedDevelopments, setPlacedDevelopments] = useState([]);

  const developmentTypes = [
    {
      id: 'residential',
      name: 'Residential Complex',
      icon: '🏘️',
      description: 'Multi-family housing development',
      impacts: { pollution: 3, traffic: 8, infrastructure: 12, population: 15 },
      color: '#3b82f6'
    },
    {
      id: 'commercial',
      name: 'Commercial Center',
      icon: '🏢',
      description: 'Office and retail complex',
      impacts: { pollution: 5, traffic: 12, infrastructure: 8, population: 10 },
      color: '#8b5cf6'
    },
    {
      id: 'industrial',
      name: 'Industrial Facility',
      icon: '🏭',
      description: 'Manufacturing or processing plant',
      impacts: { pollution: 15, traffic: 6, infrastructure: 5, population: 5 },
      color: '#ef4444'
    },
    {
      id: 'hospital',
      name: 'Medical Center',
      icon: '🏥',
      description: 'Hospital or healthcare facility',
      impacts: { pollution: 2, traffic: 10, infrastructure: 15, population: 8 },
      color: '#10b981'
    },
    {
      id: 'school',
      name: 'Educational Campus',
      icon: '🎓',
      description: 'School or university complex',
      impacts: { pollution: 1, traffic: 8, infrastructure: 10, population: 12 },
      color: '#f59e0b'
    },
    {
      id: 'park',
      name: 'Recreational Park',
      icon: '🌳',
      description: 'Public green space and recreation',
      impacts: { pollution: -8, traffic: 2, infrastructure: 5, population: 3 },
      color: '#22c55e'
    }
  ];

  const calculateImpact = async (developmentType, position) => {
    setIsCalculating(true);
    try {
      const response = await fetch(`${API_BASE}/simulate-development`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          development_type: developmentType.id,
          existing_factors: location.factors || {},
          placed_developments: placedDevelopments
        })
      });

      if (response.ok) {
        const results = await response.json();
        setSimulationResults(results);
        
        // Notify parent component of impact
        if (onImpactUpdate) {
          onImpactUpdate({
            development: developmentType,
            impact: results.impact_analysis,
            new_scores: results.updated_scores
          });
        }
      }
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDevelopmentDrop = (developmentType) => {
    setSelectedDevelopment(developmentType);
    calculateImpact(developmentType, { x: 50, y: 50 }); // Center position for demo
  };

  const addDevelopmentToMap = () => {
    if (selectedDevelopment && simulationResults) {
      const newDevelopment = {
        ...selectedDevelopment,
        id: Date.now(),
        position: { x: 50, y: 50 },
        impact: simulationResults.impact_analysis,
        timestamp: new Date().toISOString()
      };
      
      setPlacedDevelopments([...placedDevelopments, newDevelopment]);
      setSelectedDevelopment(null);
      setSimulationResults(null);
    }
  };

  const removeDevelopment = (id) => {
    setPlacedDevelopments(placedDevelopments.filter(d => d.id !== id));
  };

  const getImpactColor = (value) => {
    if (value > 10) return '#ef4444'; // High impact - red
    if (value > 5) return '#f59e0b';  // Medium impact - orange
    if (value > 0) return '#3b82f6';  // Low impact - blue
    return '#22c55e'; // Positive impact - green
  };

  const getImpactLabel = (value) => {
    if (value > 10) return 'High Impact';
    if (value > 5) return 'Medium Impact';
    if (value > 0) return 'Low Impact';
    return 'Positive Impact';
  };

  return (
    <div className="digital-twin-container">
      <div className="digital-twin-header">
        <h3>🏗️ Digital Twin Infrastructure Simulation</h3>
        <button 
          className={`simulation-toggle ${isSimulationMode ? 'active' : ''}`}
          onClick={() => setIsSimulationMode(!isSimulationMode)}
        >
          {isSimulationMode ? '🛑 Exit Simulation' : '🚀 Start Simulation'}
        </button>
      </div>

      {isSimulationMode && (
        <div className="simulation-workspace">
          <div className="development-palette">
            <h4>📍 Drop Development Types</h4>
            <div className="development-grid">
              {developmentTypes.map(type => (
                <div
                  key={type.id}
                  className="development-card"
                  onClick={() => handleDevelopmentDrop(type)}
                  style={{ borderColor: type.color }}
                >
                  <div className="card-header">
                    <span className="development-icon">{type.icon}</span>
                    <span className="development-name">{type.name}</span>
                  </div>
                  <p className="development-description">{type.description}</p>
                  <div className="impact-preview">
                    {Object.entries(type.impacts).map(([factor, impact]) => (
                      <div key={factor} className="impact-indicator">
                        <span className="factor-name">{factor}</span>
                        <span 
                          className="impact-value"
                          style={{ color: getImpactColor(impact) }}
                        >
                          {impact > 0 ? '+' : ''}{impact}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="simulation-canvas">
            <div className="canvas-header">
              <h4>🗺️ Impact Simulation</h4>
              {selectedDevelopment && (
                <div className="selected-development">
                  <span>{selectedDevelopment.icon} {selectedDevelopment.name}</span>
                  <button onClick={addDevelopmentToMap} disabled={isCalculating}>
                    {isCalculating ? '⚡ Calculating...' : '✅ Place Development'}
                  </button>
                </div>
              )}
            </div>

            {simulationResults && (
              <div className="impact-results">
                <h5>📊 Regional Impact Analysis</h5>
                <div className="impact-grid">
                  {Object.entries(simulationResults.impact_analysis).map(([factor, impact]) => (
                    <div key={factor} className="impact-card">
                      <div className="impact-header">
                        <span className="factor-name">{factor}</span>
                        <span 
                          className="impact-badge"
                          style={{ 
                            backgroundColor: getImpactColor(impact),
                            color: 'white'
                          }}
                        >
                          {getImpactLabel(impact)}
                        </span>
                      </div>
                      <div className="impact-details">
                        <div className="impact-change">
                          <span className="change-value" style={{ color: getImpactColor(impact) }}>
                            {impact > 0 ? '+' : ''}{impact.toFixed(1)}%
                          </span>
                          <span className="change-arrow">
                            {impact > 0 ? '↗️' : impact < 0 ? '↘️' : '➡️'}
                          </span>
                        </div>
                        <div className="impact-description">
                          {impact > 10 ? 'Significant increase in regional load' :
                           impact > 5 ? 'Moderate increase expected' :
                           impact > 0 ? 'Minor increase anticipated' :
                           'Positive environmental impact'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overall-assessment">
                  <h5>🎯 Overall Assessment</h5>
                  <div className="assessment-content">
                    <div className="suitability-impact">
                      <span className="label">Suitability Score Change:</span>
                      <span 
                        className="score-change"
                        style={{ color: getImpactColor(simulationResults.overall_suitability_change) }}
                      >
                        {simulationResults.overall_suitability_change > 0 ? '+' : ''}{simulationResults.overall_suitability_change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="recommendations">
                      <h6>💡 Recommendations:</h6>
                      <ul>
                        {simulationResults.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {placedDevelopments.length > 0 && (
              <div className="placed-developments">
                <h5>🏗️ Placed Developments</h5>
                <div className="developments-list">
                  {placedDevelopments.map(dev => (
                    <div key={dev.id} className="placed-development-item">
                      <div className="dev-info">
                        <span>{dev.icon} {dev.name}</span>
                        <span className="dev-time">
                          {new Date(dev.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeDevelopment(dev.id)}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalTwin;
