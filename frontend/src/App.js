import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import PaymentResult from './components/PaymentResult';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/success" element={<PaymentResult />} />
          <Route path="/failure" element={<PaymentResult />} />
          <Route path="/pending" element={<PaymentResult />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
