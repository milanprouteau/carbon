import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header/Header';
import Homepage from './pages/homepage/homepage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Homepage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
