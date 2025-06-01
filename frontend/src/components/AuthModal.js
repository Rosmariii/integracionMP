import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({
    username: '', password: '', email: '', nombre: '', apellido: '', direccion: '', pais: '', ciudad: '', codigoPostal: '', telefono: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        const res = await fetch(`${apiUrl}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error de registro');
        onAuthSuccess(data.user);
        onClose();
      } else {
        const res = await fetch(`${apiUrl}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.username, password: form.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error de login');
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>×</button>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Iniciar sesión</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Crear cuenta</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Usuario
            <input name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label>Contraseña
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>
          {mode === 'register' && <>
            <label>Email
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>Nombre
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </label>
            <label>Apellido
              <input name="apellido" value={form.apellido} onChange={handleChange} required />
            </label>
            <label>Dirección
              <input name="direccion" value={form.direccion} onChange={handleChange} required />
            </label>
            <label>País
              <input name="pais" value={form.pais} onChange={handleChange} required />
            </label>
            <label>Ciudad
              <input name="ciudad" value={form.ciudad} onChange={handleChange} required />
            </label>
            <label>Código Postal
              <input name="codigoPostal" value={form.codigoPostal} onChange={handleChange} required />
            </label>
            <label>Teléfono (opcional)
              <input name="telefono" value={form.telefono} onChange={handleChange} />
            </label>
          </>}
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'register' ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
