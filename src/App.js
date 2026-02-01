import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import LandSuitabilityChecker from './components/LandSuitabilityChecker/LandSuitabilityChecker';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandSuitabilityChecker />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </div>
  );
}

export default App;

