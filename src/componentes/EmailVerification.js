import React, { useState } from 'react';
import './EmailVerification.css';

const EmailVerification = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResendVerification = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Correo de verificación reenviado. Revisa tu bandeja de entrada.');
      } else {
        setMessage(`❌ ${data.error || 'Error reenviando correo'}`);
      }
    } catch (error) {
      setMessage('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h2>Verificación de Email</h2>
        
        <div className="verification-info">
          <p>Hemos enviado un enlace de verificación a tu correo electrónico.</p>
          <p>El enlace expirará en <strong>24 horas</strong>.</p>
        </div>

        <div className="resend-section">
          <h3>¿No recibiste el correo?</h3>
          <input
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="email-input"
          />
          <button 
            onClick={handleResendVerification}
            disabled={loading || !email}
            className="resend-button"
          >
            {loading ? 'Enviando...' : 'Reenviar Correo de Verificación'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="help-text">
          <p>¿Problemas con la verificación?</p>
          <p>Contacta a soporte: soporte@logisticasegura.com</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;