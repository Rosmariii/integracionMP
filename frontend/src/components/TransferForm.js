import React, { useRef, useState } from 'react';
import './TransferForm.css';

const datos = {
  banco: "Mercado Pago",
  titular: "Rosmari Fernandez",
  cbu: "0000003100107177499308", // Corresponde al CVU proporcionado
  alias: "tren.afirma.aorta.mp",
  cuenta: "Cuenta de Pago",
  cuit: "27-36971728-1"
};

const TransferForm = ({ onClose, onComprobanteUpload }) => {
  const [file, setFile] = useState(null);
  const [enviado, setEnviado] = useState(false);

  const fileInput = useRef();

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (file) {
      setEnviado(true);
      if (onComprobanteUpload) onComprobanteUpload(file);
    }
  };

  return (
    <div className="transfer-form">
      <h2>Transferencia Bancaria</h2>
      <div className="datos-banco">
        <div><b>Banco:</b> {datos.banco}</div>
        <div><b>Titular:</b> {datos.titular}</div>
        <div><b>CBU:</b> {datos.cbu}</div>
        <div><b>Alias:</b> {datos.alias}</div>
        <div><b>Cuenta:</b> {datos.cuenta}</div>
        <div><b>CUIT:</b> {datos.cuit}</div>
      </div>
      <form onSubmit={handleSubmit} className="form-comprobante">

        <label>Subí el comprobante de pago (JPG, PNG o PDF):
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} ref={fileInput} required />
        </label>

        <button type="submit" className="enviar-btn">Enviar comprobante</button>
      </form>
      {enviado && <div className="mensaje-enviado">¡Comprobante enviado! Pronto confirmaremos tu compra.</div>}
      <button className="volver-btn" onClick={onClose}>Volver</button>
    </div>
  );
};

export default TransferForm;
