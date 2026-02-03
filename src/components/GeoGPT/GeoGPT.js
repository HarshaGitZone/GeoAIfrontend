import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_BASE } from '../../config/api';
import './GeoGPT.css';

const GeoGPT = ({ isOpen, onClose, currentData, locationName, compareData }) => {
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I\'m GeoGPT Intelligence. What would you like to know about our geospatial analysis?' }
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [gptLoading, setGptLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState('');
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [hasFirstPrompt, setHasFirstPrompt] = useState(false);
  const [sidebarExtended, setSidebarExtended] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAskGpt = async (e) => {
    if (e) e.preventDefault();
    if (!userQuery.trim()) return;
    
    const userMessage = { role: 'user', content: userQuery };
    setChatHistory(prev => [...prev, userMessage]);
    setGptLoading(true);
    const queryToSend = userQuery;
    setUserQuery('');
    
    // Hide quick questions after first prompt
    if (showQuickQuestions) {
      setShowQuickQuestions(false);
      setHasFirstPrompt(true);
    }

    try {
      const response = await fetch(`${API_BASE}/ask_geogpt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: queryToSend,
          history: chatHistory,
          currentData: currentData || {},
          locationName: locationName || 'Unknown Location',
          compareData: compareData || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        provider: data.provider,
        confidence: data.confidence,
        response_time: data.response_time,
        timestamp: data.timestamp
      }]);
      
      setCurrentProvider(data.provider);
      
    } catch (err) {
      console.error('GeoGPT API Error:', err);
      let errorMessage = "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = "Network connection issue. Please check your internet connection and try again.";
      } else if (err.message.includes('403') || err.message.includes('401')) {
        errorMessage = "API authentication issue. Please check your API keys and try again.";
      } else if (err.message.includes('429')) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (err.message.includes('500')) {
        errorMessage = "Server error. The team has been notified. Please try again later.";
      }
      
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        provider: 'Error'
      }]);
    } finally { 
      setGptLoading(false); 
    }
  };

  const handleQuickQuestion = (question) => {
    setUserQuery(question);
    // Auto-submit the question immediately
    setTimeout(() => {
      handleAskGpt();
    }, 50);
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'Grok': return '#1e40af';
      case 'OpenAI': return '#059669';
      case 'Gemini': return '#7c3aed';
      case 'Fallback': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'Grok': return '🚀';
      case 'OpenAI': return '🤖';
      case 'Gemini': return '💎';
      case 'Fallback': return '⚠️';
      default: return '💬';
    }
  };

  const formatResponseTime = (time) => {
    return `${(time * 1000).toFixed(0)}ms`;
  };

  const renderSources = (sources) => {
    if (!sources || sources.length === 0) return null;

    return (
      <div className="sources">
        <span className="sources-label">Sources:</span>
        {sources.map((source, index) => (
          <span key={index} className="source-tag">{source}</span>
        ))}
      </div>
    );
  };

  const quickQuestions = [
    "What is GeoAI and how does it work?",
    "Who are the team members and project guide?",
    "What machine learning models are used in this project?",
    "How does the 3D terrain visualization work?",
    "What are the 14 factors for land suitability analysis?",
    "How accurate are the ML models and what's their training data?",
    "What technologies are used in the frontend and backend?",
    "How does the scoring system work and what do the grades mean?",
    "What APIs are used for data collection?",
    "How does the CNN model classify satellite imagery?",
    "What is the development methodology used in this project?",
    "How are the ML models trained and what's their accuracy?"
  ];

  const siteAnalysisQuestions = [
    { text: "Analyze Site A completely", action: "Analyze Site A completely - provide detailed analysis of all factors, scores, risks, and recommendations" },
    { text: "Analyze Site B completely", action: "Analyze Site B completely - provide detailed analysis of all factors, scores, risks, and recommendations" },
    { text: "Compare Site A vs Site B", action: "Compare Site A versus Site B in detail - analyze all factors, scores, and recommend the best option" },
    { text: "Which site is better?", action: "Which site has the highest suitability score and why? Provide detailed comparison and recommendation" }
  ];

  if (!isOpen) {
    return (
      <button className="geogpt-pill-btn" onClick={() => onClose(true)}>
        <div className="gpt-icon-glow">
          <div className="gpt-logo">
            <div className="gpt-circle">
              <span className="gpt-g">Geo</span>
            </div>
            <span className="gpt-pt">GPT</span>
          </div>
        </div>
    
      </button>
    );
  }

  return (
    <div className="geogpt-polished-box">
      <div className="geogpt-chat-header">
        <div className="gpt-status">
          <strong>GeoGPT Intelligence</strong>
          {currentProvider && (
            <span 
              className="current-provider"
              style={{ color: getProviderColor(currentProvider) }}
            >
              {getProviderIcon(currentProvider)} {currentProvider}
            </span>
          )}
        </div>
        <div className="chat-controls">
          <button 
            className={`sidebar-toggle-btn ${sidebarExtended ? 'extended' : ''}`}
            onClick={() => setSidebarExtended(!sidebarExtended)}
            title="Toggle Sidebar"
          >
            ☰
          </button>
          <button className="close-gpt" onClick={() => onClose(false)}>×</button>
        </div>
      </div>

      <div className={`geogpt-content ${sidebarExtended ? 'sidebar-extended' : ''}`}>
        {/* Extensible Sidebar */}
        <div className={`geogpt-sidebar ${sidebarExtended ? 'extended' : 'collapsed'}`}>
          <div className="sidebar-header">
            <h4>🚀 Quick Actions</h4>
            {sidebarExtended && (
              <button 
                className="sidebar-collapse-btn"
                onClick={() => setSidebarExtended(false)}
              >
                ◀
              </button>
            )}
          </div>
          
          {sidebarExtended && (
            <div className="sidebar-content">
              <div className="sidebar-section">
                <h5>📊 Site Analysis</h5>
                <div className="sidebar-actions">
                  {siteAnalysisQuestions.map((item, index) => (
                <button
                  key={index}
                  className="sidebar-action-btn site-analysis"
                  onClick={() => handleQuickQuestion(item.action)}
                >
                  {item.text}
                </button>
              ))}
                </div>
              </div>
              
              <div className="sidebar-section">
                <h5>🤖 AI Models</h5>
                <div className="sidebar-actions">
                  <button 
                    className="sidebar-action-btn"
                    onClick={() => handleQuickQuestion("What models does GeoAI use and why were they chosen?")}
                  >
                    🤖 Model Overview
                  </button>
                  <button 
                    className="sidebar-action-btn"
                    onClick={() => handleQuickQuestion("How accurate are the ML models and what's their training data?")}
                  >
                    📊 Model Accuracy
                  </button>
                  <button 
                    className="sidebar-action-btn"
                    onClick={() => handleQuickQuestion("What is the CNN model used for satellite imagery classification?")}
                  >
                    🧠 CNN Details
                  </button>
                  <button 
                    className="sidebar-action-btn"
                    onClick={() => handleQuickQuestion("How does the ensemble system work with Random Forest and XGBoost?")}
                  >
                    🌳 Ensemble Models
                  </button>
                </div>
              </div>
              
              <div className="sidebar-section">
                <h5>🚀 Features</h5>
                <div className="sidebar-actions">
                  <button 
                    className="sidebar-action-btn"
                    onClick={() => handleQuickQuestion("What features and capabilities does GeoAI have?")}
                  >
                    Features
                  </button>
                  <button 
                    className="sidebar-action-btn"
                    onClick={() => handleQuickQuestion("Explain the scoring system and how grades are calculated")}
                  >
                    Scoring System
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="geogpt-main">
          <div className="geogpt-messages">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className="msg-bubble">
                  {msg.role === 'assistant' && msg.provider && (
                    <div className="msg-header">
                      <div className="msg-provider-info">
                        <span className="provider-icon">{getProviderIcon(msg.provider)}</span>
                        <span 
                          className="provider-name" 
                          style={{ color: getProviderColor(msg.provider) }}
                        >
                          {msg.provider}
                        </span>
                        {msg.confidence && (
                          <span className="confidence">
                            {Math.round(msg.confidence * 100)}%
                          </span>
                        )}
                        {msg.responseTime && (
                          <span className="response-time">
                            {formatResponseTime(msg.responseTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="msg-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {renderSources(msg.sources)}
                </div>
              </div>
            ))}
            
            {gptLoading && (
              <div className="chat-msg assistant">
                <div className="msg-bubble thinking-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions - Show initially, hide after first prompt */}
          {showQuickQuestions && (
            <div className="quick-questions-expanded">
              <div className="quick-questions-header">
                <h5>💡 Quick Questions</h5>
                <button 
                  className="close-quick-questions-btn"
                  onClick={() => setShowQuickQuestions(false)}
                >
                  ×
                </button>
              </div>
              <div className="quick-questions-grid">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="quick-question-btn-expanded"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Questions Toggle Button - Show after first prompt */}
          {hasFirstPrompt && !showQuickQuestions && (
            <div className="quick-questions-toggle">
              <button 
                className="show-quick-questions-btn"
                onClick={() => setShowQuickQuestions(true)}
              >
                💡 Quick Questions
              </button>
            </div>
          )}

          <form className="geogpt-input-area" onSubmit={handleAskGpt}>
            <div className="input-wrapper-inline">
              <input 
                type="text" 
                placeholder="Ask GeoGPT about geospatial intelligence..." 
                value={userQuery} 
                onChange={(e) => setUserQuery(e.target.value)}
                disabled={gptLoading}
              />
              <button 
                type="submit" 
                disabled={!userQuery.trim() || gptLoading}
                className="send-button"
              >
                {gptLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  '🚀'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeoGPT;
