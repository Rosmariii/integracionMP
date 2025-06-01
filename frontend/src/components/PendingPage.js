import React from 'react';
import './PendingPage.css';

const PendingPage = () => (
  <div className="pending-container">
    <div className="pending-card">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="40" fill="#FFF9C4"/>
        <path d="M40 24V40L52 46" stroke="#FFB300" strokeWidth="5" strokeLinecap="round"/>
      </svg>
      <h1 className="pending-title">Pago pendiente</h1>
      <p className="pending-message">
        Tu pago está siendo procesado.<br/>
        Te avisaremos por WhatsApp o email cuando se acredite.<br/>
        Si tienes dudas, contacta al <b>celular 3794714106</b>.
      </p>
    </div>
  </div>
);

export default PendingPage;
