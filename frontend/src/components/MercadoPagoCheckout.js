import React, { useEffect } from 'react';

let sdkLoaded = false;

const MercadoPagoCheckout = ({ preferenceId, publicKey }) => {
    console.log('[MercadoPagoCheckout] Props received - Preference ID:', preferenceId, 'Public Key:', publicKey);
    const containerId = "mp-checkout-container";

    useEffect(() => {
        if (!preferenceId || !publicKey) return;

        // Cargar el SDK solo una vez y de forma más robusta
        const SDK_SCRIPT_ID = 'mercadopago-sdk-script';

        if (sdkLoaded && window.MercadoPago) {
            // SDK ya está cargado y listo
            console.log('[MercadoPagoCheckout] SDK already loaded and ready (sdkLoaded=true, window.MercadoPago exists). Calling renderCheckout.');
            renderCheckout();
        } else {
            // SDK no está cargado (sdkLoaded=false) o window.MercadoPago no está listo todavía
            let script = document.getElementById(SDK_SCRIPT_ID);

            if (!script) {
                // El script no existe en el DOM, hay que crearlo
                console.log('[MercadoPagoCheckout] SDK script tag not found. Creating and appending new script.');
                script = document.createElement('script');
                script.id = SDK_SCRIPT_ID;
                script.src = 'https://sdk.mercadopago.com/js/v2';
                script.async = true;
                
                script.onload = () => {
                    console.log('[MercadoPagoCheckout] Mercado Pago SDK script.onload triggered.');
                    if (window.MercadoPago) {
                        sdkLoaded = true; // Marcar como cargado SOLO después de que esté realmente disponible
                        console.log('[MercadoPagoCheckout] window.MercadoPago is available. sdkLoaded set to true. Calling renderCheckout.');
                        renderCheckout();
                    } else {
                        console.error('[MercadoPagoCheckout] SDK script loaded but window.MercadoPago is still not defined.');
                        // Opcional: limpiar script y permitir reintento si es necesario
                        // document.getElementById(SDK_SCRIPT_ID)?.remove();
                    }
                };
                
                script.onerror = () => {
                    console.error('[MercadoPagoCheckout] Error loading Mercado Pago SDK script.');
                    const errorDiv = document.getElementById('checkout-error');
                    if (errorDiv) {
                        errorDiv.textContent = 'Error crítico: No se pudo cargar el script de Mercado Pago.';
                        errorDiv.style.display = 'block';
                    }
                    // Limpiar el script fallido para permitir un nuevo intento si el componente se remonta
                    document.getElementById(SDK_SCRIPT_ID)?.remove();
                    sdkLoaded = false; // Asegurarse de que sdkLoaded esté en false para permitir reintentos
                };
                
                document.body.appendChild(script);
            } else if (window.MercadoPago) {
                // El script ya existe y window.MercadoPago está disponible
                // Esto puede ocurrir si otro componente ya cargó el SDK
                console.log('[MercadoPagoCheckout] SDK script tag found and window.MercadoPago is available. Setting sdkLoaded=true and calling renderCheckout.');
                sdkLoaded = true;
                renderCheckout();
            } else {
                // El script ya existe pero window.MercadoPago aún no está disponible (está cargando)
                // Se confía en que el 'onload' de ese script existente maneje la situación.
                console.log('[MercadoPagoCheckout] SDK script tag found, but window.MercadoPago not yet available. Assuming existing script.onload will handle it.');
            }
        }

        function renderCheckout() {
            const errorDisplay = document.getElementById('checkout-error');
            const loadingMessage = document.querySelector(`#${containerId} .loading-message`);

            if (!window.MercadoPago) {
                console.error('[MercadoPagoCheckout] SDK not loaded (window.MercadoPago is undefined).');
                if (errorDisplay) {
                    errorDisplay.textContent = 'El SDK de Mercado Pago no está disponible. Intenta recargar la página.';
                    errorDisplay.style.display = 'block';
                }
                if (loadingMessage) loadingMessage.style.display = 'none';
                return;
            }

            if (!preferenceId) {
                console.error('[MercadoPagoCheckout] Preference ID is missing.');
                if (errorDisplay) {
                    errorDisplay.textContent = 'Falta el ID de preferencia para el pago. Intenta de nuevo.';
                    errorDisplay.style.display = 'block';
                }
                if (loadingMessage) loadingMessage.style.display = 'none';
                return;
            }

            console.log('[MercadoPagoCheckout] SDK available and Preference ID present. Attempting to render checkout.');
            
            try {
                const mp = new window.MercadoPago(publicKey, { locale: 'es-AR' });
                console.log('[MercadoPagoCheckout] MercadoPago instance created.');

                // Limpiar el contenedor antes de renderizar para evitar duplicados o estados viejos
                const container = document.getElementById(containerId);
                if (container) container.innerHTML = ''; 

                mp.checkout({
                    preference: { id: preferenceId },
                    render: {
                        container: `#${containerId}`,
                        label: 'Pagar'
                    },
                    callbacks: {
                        onReady: () => {
                            console.log('[MercadoPagoCheckout] Checkout is ready and rendered.');
                            if (errorDisplay) errorDisplay.style.display = 'none';
                            if (loadingMessage) loadingMessage.style.display = 'none';
                        },
                        onError: (sdkError) => {
                            console.error('[MercadoPagoCheckout] SDK Checkout Error:', sdkError);
                            if (errorDisplay) {
                                let message = 'Error del SDK al cargar el checkout.';
                                if (sdkError && sdkError.message) {
                                    message += ` Detalle: ${sdkError.message}`;
                                } else if (typeof sdkError === 'string') {
                                    message += ` Detalle: ${sdkError}`;
                                } else if (sdkError && sdkError.cause) {
                                     try {
                                        const causeDetails = JSON.stringify(sdkError.cause);
                                        message += ` Causa: ${causeDetails}`;
                                     } catch (e) {
                                        message += ' Causa: (no se pudo serializar)';
                                     }
                                }
                                errorDisplay.innerHTML = `${message}<br/>Por favor, revisa la consola para más detalles.`;
                                errorDisplay.style.display = 'block';
                            }
                            if (loadingMessage) loadingMessage.style.display = 'none';
                        }
                    }
                });
                console.log('[MercadoPagoCheckout] mp.checkout() called.');

            } catch (e) {
                console.error('[MercadoPagoCheckout] Error initializing MercadoPago or calling checkout:', e);
                if (errorDisplay) {
                    errorDisplay.textContent = 'Error al inicializar el proceso de pago: ' + e.message;
                    errorDisplay.style.display = 'block';
                }
                if (loadingMessage) loadingMessage.style.display = 'none';
            }
        } // Cierre de la función renderCheckout
    }, [preferenceId, publicKey]);

    return (
        <div id={containerId} className="checkout-container">
            {!preferenceId && <div className="loading-message">Cargando...</div>}
            <div className="error-message" style={{ display: 'none' }} id="checkout-error">
                Error al cargar el checkout. Por favor, intenta nuevamente.
            </div>
        </div>
    );
};

export default MercadoPagoCheckout;