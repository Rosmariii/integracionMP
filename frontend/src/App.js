import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import SuccessPage from './components/SuccessPage';
import FailurePage from './components/FailurePage';
import PendingPage from './components/PendingPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/failure" element={<FailurePage />} />
          <Route path="/pending" element={<PendingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
