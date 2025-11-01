import React, { useState, useEffect } from "react";
import "./App.css";

import UserManagement from "./componentes/UserManagement";
import RegisterForm from './components/RegisterForm';

function App() {
  // === TODOS LOS ESTADOS DEBEN ESTAR DENTRO DE LA FUNCIÓN App ===
  const [message, setMessage] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [allPackages, setAllPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const generateQR = (packageId) => {
    window.open(`http://localhost:3001/api/packages/${packageId}/qr`, "_blank");
  };

  // === NUEVOS ESTADOS PARA FASE 3 ===
  const [messengers, setMessengers] = useState([]);
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [newPackage, setNewPackage] = useState({
    sender_name: "",
    recipient_name: "",
    delivery_address: "",
    weight: "",
    recipient_phone: "",
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
  }, []);

  // HU3: Inicio de sesión mejorado
  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    setIsLoading(true);
    setLoginError("");
    setMessage("");

    try {
      // 1️⃣ Validar el token con el backend temporal
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
        setMessage(`❌ ${verifyData.error}`);
        setIsLoading(false);
        return;
      }

      // ✅ Token válido
      setMessage("✅ Acceso concedido, iniciando sesión...");

      // 2️⃣ Luego de validar el token, procede al login normal
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Error en el servidor. Intenta nuevamente."
        );
      }

      // Guardar token y usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setIsLoggedIn(true);
      setCurrentUser(data.user);
      setActiveTab("tracking");
      setMessage(`✅ Bienvenido/a ${data.user.first_name}!`);
    } catch (error) {
      console.error("Error de login:", error);
      setLoginError(error.message);
      setMessage(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar cuenta de prueba
  const loadDemoAccount = (account) => {
    setLoginData({
      email: account.email,
      password: account.password,
      token: "", // Se limpia el token anterior
    });

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

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab("login");
    setLoginData({ email: "", password: "", token: "" });
    setMessage("✅ Sesión cerrada exitosamente");
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
      setMessage(`✅ ${data.length} envíos cargados`);
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

  // ===== NUEVAS FUNCIONES PARA FASE 3 =====

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
      setMessage(`✅ ${data.length} entregas cargadas`);
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
      setMessage(`✅ ${data.length} envíos cargados`);
    } catch (error) {
      setMessage("❌ Error obteniendo tus envíos");
    }
  };

  // HU7: Asignar mensajero a envío
  const assignMessenger = async (packageId, messengerId) => {
    if (!messengerId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/packages/${packageId}/assign-messenger`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messenger_id: messengerId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error asignando mensajero");
      }

      setMessage("✅ Mensajero asignado exitosamente");
      getAllPackages(); // Refrescar lista
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  // Obtener lista de mensajeros
  const getMessengers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/users?role=messenger",
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

  // HU4: Crear nuevo envío
  const createPackage = async () => {
    try {
      if (
        !newPackage.sender_name ||
        !newPackage.recipient_name ||
        !newPackage.delivery_address
      ) {
        setMessage("❌ Faltan campos obligatorios");
        return;
      }

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
            ...newPackage,
            client_id: currentUser.id,
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
      });

      // Actualizar lista
      if (activeTab === "management") getAllPackages();
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

      setMessage(`✅ Estado actualizado a: ${newStatus}`);

      // Actualizar la lista según la pestaña activa
      if (activeTab === "management") getAllPackages();
      if (activeTab === "my-deliveries") getMyDeliveries();
      if (activeTab === "my-packages") getMyPackages();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  // Mostrar formulario de registro
  if (activeTab === "register") {
    return (
      <div className="App">
        <header className="App-header">
          <RegisterForm />
          <button
            onClick={() => setActiveTab("login")}
            className="btn-back"
          >
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
        <header className="App-header">
          <div className="login-logo">
            <h1>🚚 Logística Segura Urabá</h1>
            <p>Sistema de Gestión Logística</p>
          </div>

          <div className="login-container">
            <div className="login-card">
              <div className="login-header">
                <h2>🔐 Iniciar Sesión</h2>
                <p>Accede a tu cuenta</p>
              </div>

              {/* Mensaje de error del servidor */}
              {loginError && loginError.includes("servidor") && (
                <div className="error-message server-error">
                  <strong>Error interno del servidor</strong>
                  <p>
                    Estamos experimentando problemas técnicos. Por favor,
                    intente nuevamente.
                  </p>
                </div>
              )}

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
              

              <form onSubmit={handleLogin} className="login-form">
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

                <button
                  type="button"
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
                          `✅ Se ha generado un token temporal para ${loginData.email}. 
          Revisa la consola del servidor para obtener el código.`
                        );
                      } else {
                        setMessage(`❌ ${data.error}`);
                      }
                    } catch (error) {
                      setMessage(
                        "❌ Error generando token. Verifica la conexión al servidor."
                      );
                    }
                  }}
                  disabled={isLoading}
                >
                  🔑 Generar Token Temporal
                </button>

                <div className="form-group">
                  <label htmlFor="token">Código de autenticación</label>
                  <input
                    id="token"
                    type="text"
                    placeholder="Ej: 123456"
                    value={loginData.token}
                    onChange={(e) =>
                      setLoginData({ ...loginData, token: e.target.value })
                    }
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className={`btn-login ${isLoading ? "loading" : ""}`}
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
                  onClick={() => setActiveTab('register')}
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

              {/* Información de ayuda */}
              <div className="login-help">
                <p>
                  <strong>¿Problemas para acceder?</strong>
                </p>
                <ul>
                  <li>Verifica tu conexión a internet</li>
                  <li>Asegúrate de que el servidor esté ejecutándose</li>
                  <li>Utiliza una de las cuentas de prueba</li>
                </ul>
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  // APLICACIÓN PRINCIPAL (cuando está logueado) - VISTAS POR ROL
  return (
    <div className="App">
      <header className="App-header">
        <div className="user-header">
          <h1>🚚 Logística Segura Urabá</h1>
          <div className="user-info">
            <span>
              👤 {currentUser.first_name} {currentUser.last_name}
              <span className="user-role">({currentUser.role})</span>
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>

 {/* Pestañas según el rol */}
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
      onClick={() => {
        setActiveTab("management");
        getAllPackages();
        getMessengers();
      }}
    >
      ⚙️ Gestión Completa
    </button>
  )}

  {/* MENSAJERO */}
  {["messenger", "mensajero"].includes(currentUser.role?.toLowerCase()) && (
    <button
      className={activeTab === "my-deliveries" ? "active" : ""}
      onClick={() => {
        setActiveTab("my-deliveries");
        getMyDeliveries();
      }}
    >
      🚗 Mis Entregas
    </button>
  )}

  {/* CLIENTE */}
  {["client", "cliente"].includes(currentUser.role?.toLowerCase()) && (
    <button
      className={activeTab === "my-packages" ? "active" : ""}
      onClick={() => {
        setActiveTab("my-packages");
        getMyPackages();
      }}
    >
      📋 Mis Envíos
    </button>
  )}

  {/* ADMIN */}
  {["admin"].includes(currentUser.role?.toLowerCase()) && (
    <button
      className={activeTab === "admin" ? "active" : ""}
      onClick={() => {
        setActiveTab("admin");
        getAllUsers();
      }}
    >
      👥 Usuarios
    </button>
  )}

  <button
    className={activeTab === "info" ? "active" : ""}
    onClick={() => setActiveTab("info")}
  >
    ℹ️ Información
  </button>
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

        {/* CONTENIDO SEGÚN ROL Y PESTAÑA */}

        {/* === VISTA PARA TODOS: SEGUIMIENTO === */}
        {activeTab === "tracking" && (
          <div className="tab-content">
            <h2>🔍 Rastrea tu Envío</h2>

            <div className="tracking-form">
              <input
                type="text"
                placeholder="Ingresa código de seguimiento (ej: URABA-...)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && trackPackage()}
              />
              <button onClick={trackPackage}>Buscar Envío</button>
            </div>

            {trackingData && (
              <div className="tracking-result">
                <h3>📦 Información del Envío</h3>
                <div className="tracking-details">
                  <p>
                    <strong>Código:</strong> {trackingData.tracking_code}
                  </p>
                  <p>
                    <strong>Remitente:</strong> {trackingData.sender_name}
                  </p>
                  <p>
                    <strong>Destinatario:</strong> {trackingData.recipient_name}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {trackingData.delivery_address}
                  </p>
                  <p>
                    <strong>Estado:</strong>
                    <span
                      className={`status ${trackingData.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {trackingData.status}
                    </span>
                  </p>
                  <p>
                    <strong>Ubicación:</strong> {trackingData.current_location}
                  </p>
                  {trackingData.messenger_name && (
                    <p>
                      <strong>Mensajero:</strong> {trackingData.messenger_name}
                    </p>
                  )}
                  <p>
                    <strong>Costo:</strong> $
                    {parseFloat(trackingData.cost).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

{/* === VISTA OPERARIO/ADMIN: GESTIÓN COMPLETA === */}
{activeTab === "management" &&
  ["operator", "operario", "admin"].includes(currentUser.role?.toLowerCase()) && (
    <div className="tab-content">
      <h2>⚙️ Gestión Completa de Envíos</h2>
      <p>
        <em>
          Vista de {currentUser.role} - Gestión de todos los envíos del sistema
        </em>
      </p>

      <div className="action-buttons">
        <button
          onClick={() => {
            getAllPackages();
            getMessengers();
          }}
        >
          🔄 Actualizar Lista
        </button>
        <button
          onClick={() => {
            setShowCreatePackage(true);
            getMessengers();
          }}
        >
          ➕ Nuevo Envío
        </button>
      </div>

      {/* Mostrar mensaje si no hay envíos */}
      {allPackages.length === 0 ? (
        <div className="card">
          <p>⚠️ No hay envíos registrados en el sistema.</p>
        </div>
      ) : (
        <div className="management-list">
          <h3>📦 Todos los Envíos ({allPackages.length})</h3>
          <div className="packages-grid">
            {allPackages.map((pkg) => (
              <div key={pkg.id} className="package-management-card card">
                <div className="package-header">
                  <h4>{pkg.tracking_code}</h4>
                  <span
                    className={`status ${pkg.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {pkg.status}
                  </span>
                </div>
                <p><strong>De:</strong> {pkg.sender_name}</p>
                <p><strong>Para:</strong> {pkg.recipient_name}</p>
                <p><strong>Dirección:</strong> {pkg.delivery_address}</p>
                <p><strong>Cliente:</strong> {pkg.client_name || "No asignado"}</p>
                {pkg.messenger_name && (
                  <p><strong>Mensajero:</strong> {pkg.messenger_name}</p>
                )}

                {/* Selector para asignar mensajero */}
                <div className="form-group">
                  <label>Asignar mensajero:</label>
                  <select
                    className="messenger-select"
                    onChange={(e) => assignMessenger(pkg.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Seleccionar mensajero</option>
                    {messengers.map((messenger) => (
                      <option key={messenger.id} value={messenger.id}>
                        {messenger.first_name} {messenger.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="package-actions">
                  <button onClick={() => updatePackageStatus(pkg.id, "in_transit")}>🚚 En Tránsito</button>
                  <button onClick={() => updatePackageStatus(pkg.id, "out_for_delivery")}>📦 En Entrega</button>
                  <button onClick={() => updatePackageStatus(pkg.id, "delivered")}>✅ Entregado</button>
                  <button onClick={() => generateQR(pkg.id)}>📱 Generar QR</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )}

          {/* === VISTA MENSAJERO: MIS ENTREGAS === */}
{activeTab === "my-deliveries" && currentUser.role === "messenger" && (
  <div className="tab-content">
    <h2>🚗 Mis Entregas</h2>
    {allPackages.length > 0 ? (
      <div className="packages-grid">
        {allPackages.map((pkg) => (
          <div key={pkg.id} className="package-card card">
            <h4>{pkg.tracking_code}</h4>
            <p><strong>Cliente:</strong> {pkg.client_name}</p>
            <p><strong>Dirección:</strong> {pkg.delivery_address}</p>
            <p><strong>Estado:</strong> {pkg.status}</p>
            <div className="package-actions">
              <button onClick={() => updatePackageStatus(pkg.id, "in_transit")}>🚚 En tránsito</button>
              <button onClick={() => updatePackageStatus(pkg.id, "out_for_delivery")}>📦 En entrega</button>
              <button onClick={() => updatePackageStatus(pkg.id, "delivered")}>✅ Entregado</button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p>No tienes entregas asignadas.</p>
    )}
  </div>
)}

{/* === VISTA CLIENTE: MIS ENVÍOS === */}
{activeTab === "my-packages" && currentUser.role === "client" && (
  <div className="tab-content">
    <h2>📋 Mis Envíos</h2>
    {allPackages.length > 0 ? (
      <div className="packages-grid">
        {allPackages.map((pkg) => (
          <div key={pkg.id} className="package-card card">
            <h4>{pkg.tracking_code}</h4>
            <p><strong>Destinatario:</strong> {pkg.recipient_name}</p>
            <p><strong>Dirección:</strong> {pkg.delivery_address}</p>
            <p><strong>Estado:</strong> {pkg.status}</p>
            <button onClick={() => generateQR(pkg.id)}>📱 Ver QR</button>
          </div>
        ))}
      </div>
    ) : (
      <p>No tienes envíos registrados.</p>
    )}
  </div>
)}

        {activeTab === "admin" && currentUser.role === "admin" && (
  <div className="tab-content">
    <h2>👥 Gestión de Usuarios</h2>
    <UserManagement />
  </div>
)}

        {/* Las otras vistas (my-deliveries, my-packages, admin, info) permanecen igual */}
        {/* ... tu código existente para las otras pestañas ... */}
        
      </header>
    </div>
  );
}


export default App;
