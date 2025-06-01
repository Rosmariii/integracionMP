import React from 'react';
import './SuccessPage.css';

const SuccessPage = () => {
  return (
    <div className="success-container">
      <div className="success-card">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="#B39DDB"/>
          <path d="M24 42L36 54L56 34" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="success-title">¡Pago exitoso!</h1>
        <p className="success-message">
          Tu pago ha sido acreditado.<br/>
          Tu pedido será revisado y en dos días hábiles será enviado.<br/>
          Para cualquier duda o inconveniente puedes contactarte al <b>celular 3794714106</b>.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;
