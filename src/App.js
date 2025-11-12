import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import logoFull from "./assets/logo_full.png";
import logoIcon from "./assets/logo_icon.png";

import UserManagement from "./componentes/UserManagement";
import ShipmentManagement from "./componentes/ShipmentManagement";
import RegisterForm from "./componentes/RegisterForm";
import EmailVerification from "./componentes/EmailVerification";
import VerifyEmailPage from "./componentes/VerifyEmailPage";
// Componente de Reportes
const ReportesComponent = ({ packages, messengers }) => {
  const [tipoReporte, setTipoReporte] = useState('envios-por-estado');
  const [reporteData, setReporteData] = useState(null);

  const generarReporte = () => {
    let datos = {};
    
    switch(tipoReporte) {
      case 'envios-por-estado':
        datos = packages.reduce((acc, pkg) => {
          const estado = pkg.status || 'registered';
          const estadoTraducido = {
            'registered': 'Registrado',
            'approved': 'Aprobado',
            'rejected': 'Rechazado',
            'in_transit': 'En Tránsito',
            'out_for_delivery': 'En Entrega',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
          }[estado] || estado;
          
          acc[estadoTraducido] = (acc[estadoTraducido] || 0) + 1;
          return acc;
        }, {});
        break;
      
      case 'envios-por-mensajero':
        datos = packages.reduce((acc, pkg) => {
          const mensajero = pkg.messenger_name || 'No asignado';
          acc[mensajero] = (acc[mensajero] || 0) + 1;
          return acc;
        }, {});
        break;
      
      case 'envios-por-ciudad':
        datos = packages.reduce((acc, pkg) => {
          const ciudad = pkg.tracking_code.split('-')[0] || 'Desconocida';
          acc[ciudad] = (acc[ciudad] || 0) + 1;
          return acc;
        }, {});
        break;
      
      default:
        datos = {};
    }
    
    setReporteData({
      tipo: tipoReporte,
      datos: datos,
      total: packages.length,
      fecha: new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    });
  };

  const exportarReporte = () => {
    if (!reporteData) return;
    
    const contenido = `REPORTE DE ENVÍOS - LOGÍSTICA SEGURA URABÁ\n` +
      `Fecha: ${reporteData.fecha}\n` +
      `Tipo: ${reporteData.tipo.replace(/-/g, ' ').toUpperCase()}\n` +
      `Total de envíos: ${reporteData.total}\n\n` +
      'DETALLES:\n' +
      Object.entries(reporteData.datos).map(([key, value]) => 
        `${key}: ${value} (${((value/reporteData.total)*100).toFixed(1)}%)`
      ).join('\n') +
      `\n\nGenerado automáticamente por el Sistema de Logística Urabá`;
    
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-envios-${reporteData.fecha.replace(/\s/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTituloReporte = () => {
    const titulos = {
      'envios-por-estado': 'Envíos por Estado',
      'envios-por-mensajero': 'Envíos por Mensajero',
      'envios-por-ciudad': 'Envíos por Ciudad'
    };
    return titulos[tipoReporte] || 'Reporte de Envíos';
  };

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h2>📊 Reportes Analíticos</h2>
        <p>Análisis detallado del rendimiento de envíos</p>
      </div>
      
      <div className="reporte-controls">
        <div className="control-group">
          <label>Tipo de Reporte:</label>
          <select 
            value={tipoReporte} 
            onChange={(e) => setTipoReporte(e.target.value)}
            className="reporte-select"
          >
            <option value="envios-por-estado">Envíos por Estado</option>
            <option value="envios-por-mensajero">Envíos por Mensajero</option>
            <option value="envios-por-ciudad">Envíos por Ciudad</option>
          </select>
        </div>
        
        <button onClick={generarReporte} className="btn-generar">
          🚀 Generar Reporte
        </button>
      </div>

      {reporteData && (
        <div className="reporte-resultado">
          <div className="reporte-header">
            <div>
              <h3>{getTituloReporte()}</h3>
              <span className="reporte-fecha">{reporteData.fecha}</span>
            </div>
            <button onClick={exportarReporte} className="btn-exportar">
              📥 Exportar PDF
            </button>
          </div>
          
          <div className="reporte-resumen">
            <div className="resumen-total">
              <span className="total-numero">{reporteData.total}</span>
              <span className="total-label">Total de Envíos</span>
            </div>
          </div>
          
          <div className="reporte-datos">
            {Object.entries(reporteData.datos).map(([key, value]) => (
              <div key={key} className="reporte-item">
                <div className="reporte-info">
                  <span className="reporte-label">{key}</span>
                  <span className="reporte-value">{value} envíos</span>
                </div>
                <div className="reporte-bar">
                  <div 
                    className="reporte-progress" 
                    style={{ width: `${(value/reporteData.total)*100}%` }}
                  ></div>
                </div>
                <span className="reporte-porcentaje">
                  {(value/reporteData.total*100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para crear nuevo envío - SOLO PARA CLIENTES
const CrearEnvioComponent = ({ onSubmit, onCancel, currentUser }) => {
  const [formData, setFormData] = useState({
    sender_name: "",
    recipient_name: "",
    delivery_address: "",
    weight: "",
    recipient_phone: "",
    package_description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="crear-envio-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>📦 Crear Nuevo Envío</h3>
          <button onClick={onCancel} className="btn-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="envio-form">
          <div className="form-group">
            <label>Remitente *</label>
            <input
              type="text"
              value={formData.sender_name}
              onChange={(e) => setFormData({...formData, sender_name: e.target.value})}
              placeholder="Nombre completo del remitente"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Destinatario *</label>
            <input
              type="text"
              value={formData.recipient_name}
              onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
              placeholder="Nombre completo del destinatario"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Dirección de entrega *</label>
            <textarea
              value={formData.delivery_address}
              onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
              placeholder="Dirección completa para la entrega"
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Descripción del paquete *</label>
            <textarea
              value={formData.package_description}
              onChange={(e) => setFormData({...formData, package_description: e.target.value})}
              placeholder="Describe qué contiene el paquete (ej: Documentos importantes, Ropa, Electrónicos, etc.)"
              required
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="0.0"
              />
            </div>
            
            <div className="form-group">
              <label>Teléfono destinatario</label>
              <input
                type="tel"
                value={formData.recipient_phone}
                onChange={(e) => setFormData({...formData, recipient_phone: e.target.value})}
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              🚀 Crear Envío
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal que usa las rutas
function MainApp() {
  const [message, setMessage] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [allPackages, setAllPackages] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [messengers, setMessengers] = useState([]);
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [newPackage, setNewPackage] = useState({
    sender_name: "",
    recipient_name: "",
    delivery_address: "",
    weight: "",
    recipient_phone: "",
    package_description: "",
  });

  // Estados de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    token: "",
  });
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requiresToken, setRequiresToken] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Cuentas de prueba para acceso rápido
  const demoAccounts = [
    {
      role: "Operario",
      email: "laura.operaria@logistica.com",
      password: "password",
      description: "Acceso completo a gestión de envíos",
    },
    {
      role: "Mensajero",
      email: "pedro.mensajero@logistica.com",
      password: "password",
      description: "Gestionar entregas y actualizar estados",
    },
    {
      role: "Cliente",
      email: "juan@example.com",
      password: "password",
      description: "Seguimiento de envíos y historial",
    },
  ];

  // Verificar si hay un token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
      setActiveTab("tracking");
    }

    // Verificar si hay token de verificación en la URL
    const urlParams = new URLSearchParams(location.search);
    const verificationToken = urlParams.get('verification_token');
    
    if (verificationToken && !isLoggedIn) {
      navigate(`/verify-email/${verificationToken}`);
    }
  }, [isLoggedIn, location, navigate]);

  // Cargar datos automáticamente cuando cambia la pestaña
  useEffect(() => {
    if (isLoggedIn) {
      switch(activeTab) {
        case "management":
          getAllPackages();
          getMessengers();
          break;
        case "my-deliveries":
          getMyDeliveries();
          break;
        case "my-packages":
          getMyPackages();
          break;
        case "admin":
          getAllUsers();
          break;
        default:
          break;
      }
    }
  }, [activeTab, isLoggedIn]);

  const generateQR = (packageId) => {
    window.open(`http://localhost:3001/api/packages/${packageId}/qr`, "_blank");
  };

  // ✅ HU3: Inicio de sesión MEJORADO
  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    console.log('🔐 Iniciando proceso de login...');
    setIsLoading(true);
    setLoginError("");
    setMessage("");

    try {
      const loginResponse = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          session_id: sessionId
        }),
      });

      const loginDataResult = await loginResponse.json();
      console.log('📡 Respuesta del login:', loginDataResult);

      if (loginResponse.ok) {
        console.log('✅ Login exitoso');

        localStorage.setItem("token", loginDataResult.token);
        localStorage.setItem("user", JSON.stringify(loginDataResult.user));

        setIsLoggedIn(true);
        setCurrentUser(loginDataResult.user);
        setActiveTab("tracking");
        setMessage(`✅ Bienvenido/a ${loginDataResult.user.first_name}!`);
        setIsLoading(false);
        return;
      }

      if (loginResponse.status === 403 && loginDataResult.requires_token) {
        console.log('⚠️ Usuario no verificado - Requiere token');
        
        if (loginData.token) {
          console.log('🔄 Token ingresado, verificando...');
          await handleTokenVerification();
          return;
        }
        
        setRequiresToken(true);
        setMessage('📧 Email no verificado. Genera un token temporal e ingrésalo para acceder.');
        setIsLoading(false);
        return;
      }

      if (loginResponse.status === 401) {
        throw new Error(loginDataResult.error || 'Credenciales inválidas');
      }

      throw new Error(loginDataResult.error || 'Error en el servidor');

    } catch (error) {
      console.error('💥 Error en login:', error);
      setLoginError(error.message);
      setMessage(`❌ ${error.message}`);
      setIsLoading(false);
    }
  };

  // ✅ FUNCIÓN: Verificar token temporal
  const handleTokenVerification = async () => {
    if (!loginData.token) {
      setMessage('❌ Ingresa el código de verificación');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      console.log('🔐 Verificando token temporal...');

      const verifyRes = await fetch("http://localhost:3001/api/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          token: loginData.token,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Código inválido');
      }

      const newSessionId = verifyData.session_id;
      setSessionId(newSessionId);
      
      setMessage('✅ Código verificado. Iniciando sesión...');

      const loginResponse = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          session_id: newSessionId
        }),
      });

      const loginDataResult = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginDataResult.error || 'Error en el login después de verificación');
      }

      localStorage.setItem("token", loginDataResult.token);
      localStorage.setItem("user", JSON.stringify(loginDataResult.user));

      setIsLoggedIn(true);
      setCurrentUser(loginDataResult.user);
      setActiveTab("tracking");
      setMessage(`✅ Bienvenido/a ${loginDataResult.user.first_name}!`);
      setRequiresToken(false);

    } catch (error) {
      console.error('💥 Error verificando token:', error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FUNCIÓN: Manejar envío del formulario completo
  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (requiresToken && loginData.token) {
      await handleTokenVerification();
    } else {
      await handleLogin(e);
    }
  };

  // Función para cargar cuenta de prueba
  const loadDemoAccount = (account) => {
    setLoginData({
      email: account.email,
      password: account.password,
      token: "",
    });
    setRequiresToken(false);
    setSessionId(null);

    setMessage(
      `✅ Cuenta ${account.role} cargada. Haz clic en "Iniciar Sesión"`
    );
  };

  // Función para copiar al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setMessage("✅ Correo copiado al portapapeles");
        setTimeout(() => setMessage(""), 2000);
      })
      .catch((err) => {
        console.error("Error al copiar:", err);
      });
  };

  // ✅ Cerrar sesión - ACTUALIZADA
  const handleLogout = async () => {
    try {
      if (currentUser?.email) {
        await fetch("http://localhost:3001/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: currentUser.email,
          }),
        });
      }
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setCurrentUser(null);
      setActiveTab("login");
      setLoginData({ email: "", password: "", token: "" });
      setRequiresToken(false);
      setSessionId(null);
      setMessage("✅ Sesión cerrada exitosamente. Para acceder nuevamente necesitarás generar un nuevo token si no estás verificado.");
    }
  };

  // HU5: Consultar estado de envío
  const trackPackage = async () => {
    if (!trackingCode.trim()) {
      setMessage("❌ Ingresa un código de seguimiento");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/packages/tracking/${trackingCode}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error buscando envío");
      }

      setTrackingData(data);
      setMessage(`✅ Envío encontrado: ${data.status}`);
    } catch (error) {
      setMessage(`❌ ${error.message}`);
      setTrackingData(null);
    }
  };

  // Obtener todos los envíos (solo para operarios)
  const getAllPackages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/packages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setAllPackages(data);
    } catch (error) {
      setMessage("❌ Error obteniendo envíos");
    }
  };

  // Obtener todos los usuarios (solo para administradores)
  const getAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
    }
  };

  // ===== NUEVAS FUNCIONES PARA GESTIÓN MEJORADA =====

  // Obtener entregas del mensajero actual
  const getMyDeliveries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/packages/messenger/my-deliveries",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      setAllPackages(data);
    } catch (error) {
      setMessage("❌ Error obteniendo tus entregas");
    }
  };

  // Obtener envíos del cliente actual
  const getMyPackages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/packages/client/my-packages",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      setAllPackages(data);
    } catch (error) {
      setMessage("❌ Error obteniendo tus envíos");
    }
  };

  // Obtener lista de mensajeros
  const getMessengers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/users/role/messenger",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      setMessengers(data);
    } catch (error) {
      console.error("Error obteniendo mensajeros:", error);
    }
  };

  // HU4: Crear nuevo envío - SOLO PARA CLIENTES
  const createPackage = async (packageData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/packages/register",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_name: packageData.sender_name,
            recipient_name: packageData.recipient_name,
            delivery_address: packageData.delivery_address,
            weight: packageData.weight,
            client_id: currentUser.id,
            package_description: packageData.package_description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error creando envío");
      }

      setMessage("✅ Envío creado exitosamente");
      setShowCreatePackage(false);
      setNewPackage({
        sender_name: "",
        recipient_name: "",
        delivery_address: "",
        weight: "",
        recipient_phone: "",
        package_description: "",
      });

      // Recargar la lista correspondiente
      if (activeTab === "my-packages") getMyPackages();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  // Actualizar estado de envío
  const updatePackageStatus = async (packageId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/packages/${packageId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error actualizando estado");
      }

      setMessage(`✅ Estado actualizado a: ${traducirEstado(newStatus)}`);

      // Recargar la lista correspondiente
      if (activeTab === "management") getAllPackages();
      if (activeTab === "my-deliveries") getMyDeliveries();
      if (activeTab === "my-packages") getMyPackages();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  // Eliminar envío
  const deletePackage = async (packageId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este envío? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/packages/${packageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error eliminando envío");
      }

      setMessage("✅ Envío eliminado exitosamente");

      // Recargar la lista correspondiente
      if (activeTab === "management") getAllPackages();
      if (activeTab === "my-packages") getMyPackages();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  // Función para traducir estados
  const traducirEstado = (estado) => {
    const estados = {
      'registered': 'Registrado',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'in_transit': 'En Tránsito',
      'out_for_delivery': 'En Entrega',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return estados[estado] || estado;
  };

  // Función para obtener clase CSS según estado
  const getStatusClass = (status) => {
    const statusClasses = {
      'registered': 'status-registered',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'in_transit': 'status-transit',
      'out_for_delivery': 'status-delivery',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  };

  // Mostrar formulario de registro
  if (activeTab === "register") {
    return (
      <div className="App">
        <header className="App-header">
          <RegisterForm />
          <button onClick={() => setActiveTab("login")} className="btn-back">
            ← Volver al inicio de sesión
          </button>
        </header>
      </div>
    );
  }

  // PÁGINA DE LOGIN MEJORADA
  if (!isLoggedIn) {
    return (
      <div className="App">
        <div className="login-container">
          <div className="login-wrapper">
            <div className="login-logo">
              <img
                src={logoIcon}
                alt="Logística Segura de Urabá"
                className="app-logo"
              />
              <h1>Logística Segura de Urabá</h1>
              <p>Entregamos confianza</p>
            </div>

            <div className="login-card">
              <div className="login-header">
                <h2>🔐 Iniciar Sesión</h2>
                <p>Accede a tu cuenta</p>
              </div>

              {/* Mensajes del sistema */}
              {message && (
                <div
                  className={`message ${
                    message.includes("✅") ? "success" : "error"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* ✅ NOTIFICACIÓN SI REQUIERE TOKEN */}
              {requiresToken && (
                <div className="token-notice">
                  <h3>📧 Email No Verificado</h3>
                  <p>Para acceder, genera un token temporal e ingrésalo abajo:</p>
                  <p><small>⚠️ Este token es temporal y se invalidará al cerrar sesión</small></p>
                </div>
              )}

              {/* ✅ FORMULARIO ÚNICO CON TODOS LOS CAMPOS */}
              <form onSubmit={handleFormSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="pedro.mensajero@logistica.com"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* ✅ BOTÓN PARA GENERAR TOKEN */}
                <button
                  type="button"
                  className="btn-generate-token"
                  onClick={async () => {
                    if (!loginData.email || loginData.email.trim() === "") {
                      setMessage(
                        "❌ Ingresa tu correo electrónico para generar el token"
                      );
                      return;
                    }

                    try {
                      const response = await fetch(
                        "http://localhost:3001/api/send-token",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: loginData.email }),
                        }
                      );

                      const data = await response.json();

                      if (response.ok) {
                        setMessage(
                          `✅ Token generado para ${loginData.email}: ${data.token} (Expira en 2 minutos)`
                        );
                        setRequiresToken(true);
                        
                        setLoginData({ ...loginData, token: data.token });
                      } else {
                        setMessage(`❌ ${data.error}`);
                      }
                    } catch (error) {
                      setMessage("❌ Error generando token. Verifica la conexión al servidor.");
                    }
                  }}
                  disabled={isLoading}
                >
                  🔑 Generar Token Temporal
                </button>

                {/* ✅ CAMPO DE TOKEN (SIEMPRE VISIBLE) */}
                <div className="form-group">
                  <label htmlFor="token">
                    Código de verificación {requiresToken && <span style={{color: 'red'}}>*</span>}
                  </label>
                  <input
                    id="token"
                    type="text"
                    placeholder="Ej: 123456"
                    value={loginData.token}
                    onChange={(e) =>
                      setLoginData({ ...loginData, token: e.target.value })
                    }
                    disabled={isLoading}
                  />
                  {requiresToken && (
                    <small style={{color: '#666', fontSize: '0.8rem'}}>
                      * Requerido para usuarios no verificados
                    </small>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-login"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
                </button>
              </form>

              {/* Enlace para registrar usuario */}
              <div className="register-link">
                <p>¿No tienes una cuenta?</p>
                <button
                  className="btn-register"
                  onClick={() => setActiveTab("register")}
                  type="button"
                >
                  Registrar usuario
                </button>
              </div>

              {/* Cuentas de prueba mejoradas */}
              <div className="test-accounts">
                <h3>💡 Cuentas de prueba:</h3>

                {demoAccounts.map((account, index) => (
                  <div key={index} className="account">
                    <div className="account-role">{account.role}</div>
                    <div className="account-details">
                      <span>{account.email}</span>
                      <div className="account-actions">
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(account.email)}
                          title="Copiar correo"
                        >
                          📋
                        </button>
                        <button
                          className="load-btn"
                          onClick={() => loadDemoAccount(account)}
                          disabled={isLoading}
                        >
                          Cargar
                        </button>
                      </div>
                    </div>
                    <div className="account-description">
                      {account.description}
                    </div>
                  </div>
                ))}

                <div className="universal-password">
                  <p>
                    <strong>Contraseña universal para testing:</strong> password
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // APLICACIÓN PRINCIPAL (cuando está logueado)
  return (
    <div className="App">
      {/* PANEL SUPERIOR ELEGANTE */}
      <div className="app-header-wrapper">
        <div className="user-header">
          <div className="header-left">
           <img
                src={logoIcon}
                alt="Logística Segura de Urabá"
                className="app-logo"
              />
            <div className="brand-section">
              <h1>Logística Segura de Urabá</h1>
              <p className="slogan">Entregamos confianza</p>
            </div>
          </div>

          <div className="user-info">
            <div className="user-details">
              <span className="user-name">
                {currentUser.first_name} {currentUser.last_name}
              </span>
              <span className="user-role">{currentUser.role}</span>
              {!currentUser.is_email_verified && (
                <span className="user-temp-session">🔐 Sesión Temporal</span>
              )}
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={activeTab === "tracking" ? "active" : ""}
            onClick={() => setActiveTab("tracking")}
          >
            📦 Seguimiento
          </button>

          {/* OPERARIO o ADMIN: gestión completa */}
          {["operator", "operario", "admin"].includes(
            currentUser.role?.toLowerCase()
          ) && (
            <button
              className={activeTab === "management" ? "active" : ""}
              onClick={() => setActiveTab("management")}
            >
              ⚙️ Gestión Completa
            </button>
          )}

          {/* MENSAJERO */}
          {["messenger", "mensajero"].includes(
            currentUser.role?.toLowerCase()
          ) && (
            <button
              className={activeTab === "my-deliveries" ? "active" : ""}
              onClick={() => setActiveTab("my-deliveries")}
            >
              🚗 Mis Entregas
            </button>
          )}

          {/* CLIENTE */}
          {["client", "cliente"].includes(currentUser.role?.toLowerCase()) && (
            <button
              className={activeTab === "my-packages" ? "active" : ""}
              onClick={() => setActiveTab("my-packages")}
            >
              📋 Mis Envíos
            </button>
          )}

          {/* ADMIN */}
          {["admin"].includes(currentUser.role?.toLowerCase()) && (
            <button
              className={activeTab === "admin" ? "active" : ""}
              onClick={() => setActiveTab("admin")}
            >
              👥 Usuarios
            </button>
          )}

          {/* REPORTES para operarios y admin */}
          {["operator", "operario", "admin"].includes(
            currentUser.role?.toLowerCase()
          ) && (
            <button
              className={activeTab === "reportes" ? "active" : ""}
              onClick={() => setActiveTab("reportes")}
            >
              📊 Reportes
            </button>
          )}

          <button
            className={activeTab === "info" ? "active" : ""}
            onClick={() => setActiveTab("info")}
          >
            ℹ️ Información
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="App-header">
        {/* Mensajes del sistema */}
        {message && (
          <div
            className={`message ${
              message.includes("✅") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        {/* MODAL PARA CREAR ENVÍO - SOLO PARA CLIENTES */}
        {showCreatePackage && ["client", "cliente"].includes(currentUser.role?.toLowerCase()) && (
          <CrearEnvioComponent
            onSubmit={createPackage}
            onCancel={() => setShowCreatePackage(false)}
            currentUser={currentUser}
          />
        )}

        {/* CONTENIDO SEGÚN ROL Y PESTAÑA */}

        {/* === VISTA PARA TODOS: SEGUIMIENTO === */}
        {activeTab === "tracking" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>🔍 Rastrea tu Envío</h2>
              <p>Consulta el estado actual de cualquier envío con su código de seguimiento</p>
            </div>

            <div className="tracking-card">
              <div className="tracking-form">
                <input
                  type="text"
                  placeholder="Ingresa código de seguimiento (ej: URABA-...)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && trackPackage()}
                />
                <button onClick={trackPackage} className="btn-track">
                  Buscar Envío
                </button>
              </div>

              {trackingData && (
                <div className="tracking-result">
                  <h3>📦 Información del Envío</h3>
                  <div className="tracking-details">
                    <div className="detail-row">
                      <span className="detail-label">Código:</span>
                      <span className="detail-value">{trackingData.tracking_code}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Remitente:</span>
                      <span className="detail-value">{trackingData.sender_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Destinatario:</span>
                      <span className="detail-value">{trackingData.recipient_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Dirección:</span>
                      <span className="detail-value">{trackingData.delivery_address}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Descripción:</span>
                      <span className="detail-value">{trackingData.package_description || "No especificada"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Estado:</span>
                      <span className={`status ${getStatusClass(trackingData.status)}`}>
                        {traducirEstado(trackingData.status)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ubicación:</span>
                      <span className="detail-value">{trackingData.current_location}</span>
                    </div>
                    {trackingData.messenger_name && (
                      <div className="detail-row">
                        <span className="detail-label">Mensajero:</span>
                        <span className="detail-value">{trackingData.messenger_name}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Costo:</span>
                      <span className="detail-value">${parseFloat(trackingData.cost || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === VISTA OPERARIO/ADMIN: GESTIÓN COMPLETA MEJORADA === */}
        {activeTab === "management" &&
          ["operator", "operario", "admin"].includes(
            currentUser.role?.toLowerCase()
          ) && (
            <div className="tab-content">
              <ShipmentManagement 
                currentUser={currentUser} 
                onMessage={setMessage} 
              />
            </div>
          )}

        {/* === VISTA CLIENTE: MIS ENVÍOS === */}
        {activeTab === "my-packages" && ["client", "cliente"].includes(currentUser.role?.toLowerCase()) && (
          <div className="tab-content">
            <div className="section-header">
              <h2>📋 Mis Envíos</h2>
              <p>Gestiona y realiza seguimiento a todos tus envíos registrados</p>
            </div>
            
            {/* CLIENTE PUEDE CREAR ENVÍOS */}
            <div className="action-buttons">
              <button
                onClick={() => setShowCreatePackage(true)}
                className="btn-new-package"
              >
                ➕ Crear Nuevo Envío
              </button>
            </div>

            {allPackages.length > 0 ? (
              <div className="packages-grid">
                {allPackages.map((pkg) => (
                  <div key={pkg.id} className="package-card card">
                    <div className="package-header">
                      <h4>{pkg.tracking_code}</h4>
                      <span className={`status ${getStatusClass(pkg.status)}`}>
                        {traducirEstado(pkg.status)}
                      </span>
                    </div>
                    
                    <div className="package-details">
                      <div className="detail-row">
                        <span className="detail-label">Destinatario:</span>
                        <span className="detail-value">{pkg.recipient_name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Dirección:</span>
                        <span className="detail-value">{pkg.delivery_address}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Descripción:</span>
                        <span className="detail-value">{pkg.package_description || "No especificada"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Estado:</span>
                        <span className={`status ${getStatusClass(pkg.status)}`}>
                          {traducirEstado(pkg.status)}
                        </span>
                      </div>
                      {pkg.messenger_name && (
                        <div className="detail-row">
                          <span className="detail-label">Mensajero:</span>
                          <span className="detail-value">👤 {pkg.messenger_name}</span>
                        </div>
                      )}
                      {pkg.cost && (
                        <div className="detail-row">
                          <span className="detail-label">Costo:</span>
                          <span className="detail-value">${parseFloat(pkg.cost).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="package-actions">
                      <button onClick={() => generateQR(pkg.id)} className="btn-qr">
                        📱 Código QR
                      </button>
                      
                      {/* Cliente puede eliminar sus envíos no asignados */}
                      {(!pkg.assigned_messenger_id || pkg.status === 'registered') && (
                        <button 
                          onClick={() => deletePackage(pkg.id)} 
                          className="btn-delete"
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No tienes envíos registrados</h3>
                <p>Comienza creando tu primer envío</p>
              </div>
            )}
          </div>
        )}

        {/* === VISTA MENSAJERO: MIS ENTREGAS === */}
        {activeTab === "my-deliveries" && ["messenger", "mensajero"].includes(currentUser.role?.toLowerCase()) && (
          <div className="tab-content">
            <div className="section-header">
              <h2>🚗 Mis Entregas</h2>
              <p>Gestiona las entregas asignadas a tu ruta</p>
            </div>
            
            {allPackages.length > 0 ? (
              <div className="packages-grid">
                {allPackages.map((pkg) => (
                  <div key={pkg.id} className="package-card card">
                    <div className="package-header">
                      <h4>{pkg.tracking_code}</h4>
                      <span className={`status ${getStatusClass(pkg.status)}`}>
                        {traducirEstado(pkg.status)}
                      </span>
                    </div>
                    
                    <div className="package-details">
                      <div className="detail-row">
                        <span className="detail-label">Cliente:</span>
                        <span className="detail-value">{pkg.client_name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Dirección:</span>
                        <span className="detail-value">{pkg.delivery_address}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Destinatario:</span>
                        <span className="detail-value">{pkg.recipient_name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Descripción:</span>
                        <span className="detail-value">{pkg.package_description || "No especificada"}</span>
                      </div>
                    </div>
                    
                    <div className="package-actions">
                      <button
                        onClick={() => updatePackageStatus(pkg.id, "in_transit")}
                        className={`state-btn ${pkg.status === 'in_transit' ? 'active' : ''}`}
                      >
                        🚚 En tránsito
                      </button>
                      <button
                        onClick={() => updatePackageStatus(pkg.id, "out_for_delivery")}
                        className={`state-btn ${pkg.status === 'out_for_delivery' ? 'active' : ''}`}
                      >
                        📦 En entrega
                      </button>
                      <button
                        onClick={() => updatePackageStatus(pkg.id, "delivered")}
                        className={`state-btn ${pkg.status === 'delivered' ? 'active' : ''}`}
                      >
                        ✅ Entregado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No tienes entregas asignadas</h3>
                <p>Las entregas aparecerán aquí cuando te sean asignadas</p>
              </div>
            )}
          </div>
        )}

        {/* === VISTA REPORTES === */}
        {activeTab === "reportes" && (
          <div className="tab-content">
            <ReportesComponent packages={allPackages} messengers={messengers} />
          </div>
        )}

        {activeTab === "admin" && currentUser.role === "admin" && (
          <div className="tab-content">
            <h2>👥 Gestión de Usuarios</h2>
            <UserManagement />
          </div>
        )}

        {/* Las otras vistas (info) permanecen igual */}
        {activeTab === "info" && (
          <div className="tab-content">
            <h2>ℹ️ Información del Sistema</h2>
            <div className="card">
              <h3>Logística Segura de Urabá</h3>
              <p>Sistema de gestión de envíos y paquetes.</p>
              <p>Versión 1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal que envuelve todo con Router
function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para verificación de email */}
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        
        {/* Ruta principal - maneja toda la lógica de la app */}
        <Route path="*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;