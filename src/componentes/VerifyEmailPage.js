import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EmailVerification.css';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true);
        setMessage('Verificando tu email...');

        const response = await fetch(`http://localhost:3001/api/verify-email/${token}`);
        const data = await response.json();

        if (data.success) {
          // ✅ Guardar token y usuario en localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setSuccess(true);
          setMessage(`✅ ${data.message} Bienvenido/a ${data.user.first_name}!`);
          
          // Redirigir al dashboard después de 3 segundos
          setTimeout(() => {
            window.location.href = 'http://localhost:3000';
          }, 3000);
        } else {
          setMessage(`❌ ${data.error}`);
          setSuccess(false);
        }
      } catch (error) {
        console.error('Error verificando email:', error);
        setMessage('❌ Error de conexión con el servidor');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setMessage('❌ Token de verificación no válido');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="verification-container">
        <div className="verification-card">
          <h2>Verificando Email</h2>
          <div className="loading-spinner"></div>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h2>{success ? '✅ Email Verificado' : '❌ Error de Verificación'}</h2>
        
        <div className="verification-info">
          <p>{message}</p>
          {success && (
            <p>Serás redirigido automáticamente al dashboard en unos segundos...</p>
          )}
        </div>

        {!success && (
          <div className="action-buttons">
            <button 
              onClick={() => navigate('/login')}
              className="primary-button"
            >
              Ir al Login
            </button>
            <button 
              onClick={() => navigate('/resend-verification')}
              className="secondary-button"
            >
              Reenviar Correo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;