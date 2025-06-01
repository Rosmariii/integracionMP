import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000); // 10 segundos antes de redirigir

    return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
  }, [navigate]);

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <div className="payment-success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="64px" height="64px">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
        <h1>¡Operación creada con éxito!</h1>
        <p>Gracias por tu compra.</p>
        <p>Si tenés algún inconveniente, no dudes en contactar al número: <strong>3794714106</strong>.</p>
        <p>Tu pedido se estará enviando el segundo día hábil después de la compra.</p>
        <p className="redirect-message">Serás redirigido a la página principal en unos segundos...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
