import React, { useState, useEffect } from 'react';
import './ProductList.css';
import MercadoPagoCheckout from './MercadoPagoCheckout';
import Modal from './Modal';
import './Modal.css';
import TransferForm from './TransferForm';
import './TransferForm.css';

const ProductList = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001'; // Default for local dev
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState('metodo'); // 'metodo' | 'mp' | 'transfer'
    const [preferenceId, setPreferenceId] = useState(null);
    const [transferDone, setTransferDone] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001'; // Default for local dev
            const response = await fetch(`${apiUrl}/api/products`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Nuevo flujo: cuando se hace click en comprar, abre el modal para elegir método
    const handleBuy = (product) => {
        setSelectedProduct(product);
        setModalStep('metodo');
        setShowModal(true);
        setTransferDone(false);
    };

    // Cuando elige Mercado Pago
    const handleMercadoPago = async () => {
        try {
            setLoading(true);
            // Crea preferencia solo si aún no la creamos para este producto
            const response = await fetch(`${apiUrl}/api/create-preference`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: [selectedProduct] })
            });
            const preference = await response.json();
            if (preference.id) {
                setPreferenceId(preference.id);
                setModalStep('mp');
            } else {
                throw new Error('No se pudo crear la preferencia de pago. Respuesta del servidor: ' + JSON.stringify(preference));
            }
        } catch (error) {
            alert('Error al procesar el pago: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Cuando elige Transferencia
    const handleTransferencia = () => {
        setModalStep('transfer');
    };

    // Cuando sube comprobante
    const handleComprobanteUpload = (file) => {
        setTransferDone(true);
        // Aquí podrías hacer un fetch para guardar el comprobante en el backend
    };

    // Cierra el modal y resetea estados
    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep('metodo');
        setPreferenceId(null);
        setSelectedProduct(null);
        setTransferDone(false);
    };


    return (
        <div className="product-list">
            <h1 className="aesthetic-title">Nuestros Productos</h1>
            <div className="products-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <img 
                            src={`/images/${product.id}.jpg`} 
                            alt={product.name} 
                            className="product-image"
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 fill=%27%23f0f0f0%27/%3E%3Ctext x=%2750%27 y=%2750%27 font-family=%27Arial%27 font-size=%2712%27 fill=%27%23666%27 text-anchor=%27middle%27 alignment-baseline=%27middle%27%3EProducto%3C/text%3E%3C/svg%3E';
                            }} 
                            onLoad={(e) => { e.target.onerror = null; }}
                        />
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p className="price">${product.price}</p>
                        <button 
                            onClick={() => handleBuy(product)}
                            className="buy-button"
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : 'Comprar'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal aesthetic para elegir método de pago */}
            <Modal isOpen={showModal} onClose={handleCloseModal}>
                {modalStep === 'metodo' && (
                    <div className="metodo-pago-modal">
                        <h2>¿Cómo quieres pagar?</h2>
                        <div className="metodo-opciones">
                            <button className="metodo-btn mp-btn" onClick={handleMercadoPago} disabled={loading}>
  {/* SVG Mercado Pago moderno */}
  <span style={{display:'flex',justifyContent:'center',alignItems:'center', marginRight: '10px'}}>
    <svg width="38" height="26" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.9999 0.461426C19.963 0.461426 16.1004 1.99084 13.1109 4.71387C10.1223 7.43689 8.57129 11.1361 8.57129 15.0639C8.57129 18.9908 10.1223 22.6909 13.1109 25.4139C16.1004 28.1369 19.963 29.6663 23.9999 29.6663C28.0368 29.6663 31.8993 28.1369 34.8888 25.4139C37.8783 22.6909 39.4284 18.9908 39.4284 15.0639C39.4284 11.1361 37.8783 7.43689 34.8888 4.71387C31.8993 1.99084 28.0368 0.461426 23.9999 0.461426ZM23.9999 5.07571C29.9249 5.07571 34.857 9.61887 34.857 15.0639C34.857 20.5089 29.9249 25.052 23.9999 25.052C18.0749 25.052 13.1427 20.5089 13.1427 15.0639C13.1427 9.61887 18.0749 5.07571 23.9999 5.07571Z" fill="#00AEEF"/>
      <path d="M24.0003 9.68994C20.0146 9.68994 16.6816 12.2042 15.418 15.6025L19.5038 15.6025C19.5038 13.9161 20.9967 12.5714 22.8574 12.5714C23.8021 12.5714 24.6003 12.9428 25.1898 13.5428L27.0495 11.7321C26.1003 10.5134 25.0003 9.68994 24.0003 9.68994Z" fill="#00AEEF"/>
      <path d="M24.0003 20.31C28.0003 20.31 31.3381 17.7957 32.5878 14.3974L28.4967 14.3974C28.4967 16.0838 27.0038 17.4285 25.1431 17.4285C24.1974 17.4285 23.4003 17.0571 22.8108 16.4571L20.9501 18.2678C21.9003 19.4865 23.0003 20.31 24.0003 20.31Z" fill="#00AEEF"/>
    </svg>
  </span>
  Mercado Pago
</button>
                            <button className="metodo-btn trans-btn" onClick={handleTransferencia}>
  {/* SVG Transferencia moderno */}
  <span style={{display:'flex',justifyContent:'center',alignItems:'center', marginRight: '10px'}}>
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4.75" y="9.5" width="28.5" height="19" rx="3" fill="#B39DDB"/>
      <rect x="7.125" y="12.6667" width="23.75" height="3.16667" rx="1.58333" fill="white"/>
      <rect x="7.125" y="17.4167" width="19" height="3.16667" rx="1.58333" fill="white"/>
      <path d="M15.8333 23.75H22.1666" stroke="#E57399" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 6.33331V9.49998" stroke="#B39DDB" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14.25 6.33331H23.75" stroke="#B39DDB" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </span>
  Transferencia
</button>
                        </div>
                    </div>
                )}
                {modalStep === 'mp' && (
                    <div className="checkout-modal">
                        <MercadoPagoCheckout 
                            key={preferenceId} // Asegura que el componente se remonte si preferenceId cambia
                            preferenceId={preferenceId} 
                            publicKey={process.env.REACT_APP_MP_PUBLIC_KEY}
                        />
                    </div>
                )}
                {modalStep === 'transfer' && (
                    <TransferForm 
                        onClose={handleCloseModal} 
                        onComprobanteUpload={handleComprobanteUpload}
                    />
                )}
                {transferDone && (
                    <div className="mensaje-enviado-modal">
                        ¡Comprobante enviado! Pronto confirmaremos tu compra.
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProductList;
