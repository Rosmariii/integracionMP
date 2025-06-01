import React from 'react';
import { useLocation } from 'react-router-dom';

const PaymentResult = () => {
    const location = useLocation();
    const status = location.state?.status || 'pending';

    const getStatusMessage = () => {
        switch (status) {
            case 'approved':
                return {
                    title: '¡Pago exitoso!',
                    message: 'Tu pago se ha completado con éxito.'
                };
            case 'rejected':
                return {
                    title: 'Pago rechazado',
                    message: 'El pago no pudo ser completado.'
                };
            default:
                return {
                    title: 'Pago pendiente',
                    message: 'Tu pago está en proceso.'
                };
        }
    };

    const { title, message } = getStatusMessage();

    return (
        <div className="payment-result">
            <h2>{title}</h2>
            <p>{message}</p>
            <button onClick={() => window.location.href = '/'}>
                Volver a la tienda
            </button>
        </div>
    );
};

export default PaymentResult;
