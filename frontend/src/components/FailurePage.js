import React from 'react';
import './FailurePage.css';

const FailurePage = () => (
  <div className="fail-container">
    <div className="fail-card">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="40" fill="#FFCDD2"/>
        <path d="M28 28L52 52M52 28L28 52" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
      </svg>
      <h1 className="fail-title">¡Pago rechazado!</h1>
      <p className="fail-message">
        Ocurrió un error o tu pago fue rechazado.<br/>
        Puedes intentar nuevamente o elegir otro método de pago.<br/>
        Si tienes dudas, contacta al <b>celular 3794714106</b>.
      </p>
    </div>
  </div>
);

export default FailurePage;
