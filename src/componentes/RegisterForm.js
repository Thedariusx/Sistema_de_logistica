import React, { useState } from "react";
import '../App.css';
import logoIcon from '../assets/logo_icon.png';

export default function RegisterForm(props) { // ✅ AGREGAR props como parámetro
  const [form, setForm] = useState({
    first_name: "",
    second_name: "",
    last_name: "",
    second_last_name: "",
    document_number: "",
    email: "",
    address: "",
    phone: "",
    role: "user",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(`❌ Error: ${data.error || "No se pudo registrar el usuario"}`);
        return;
      }

      // ✅ REGISTRO EXITOSO - LLAMAR A LA FUNCIÓN DE VERIFICACIÓN
      if (props.onRegistrationSuccess) {
        props.onRegistrationSuccess(form.email); // ✅ CAMBIAR formData.email por form.email
      }

      alert(`✅ Usuario registrado correctamente: ${data.user?.first_name || form.first_name}`);
      
      // Limpiar formulario
      setForm({
        first_name: "",
        second_name: "",
        last_name: "",
        second_last_name: "",
        document_number: "",
        email: "",
        address: "",
        phone: "",
        role: "user",
        password: "",
      });
      
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        {/* Logo y Branding - Mismo formato que el login */}
        <div className="register-logo">
          <img
            src={logoIcon}
            alt="Logística Segura de Urabá"
            className="app-logo"
          />
          <h1>Logística Segura de Urabá</h1>
          <p>Entregamos confianza</p>
        </div>

        <div className="register-card">
          <div className="register-header">
            <h2>Crear Cuenta</h2>
            <p>Complete sus datos para registrarse</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {/* Primera fila - Nombres */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Primer Nombre</label>
                <input 
                  name="first_name" 
                  placeholder="Ingrese su primer nombre" 
                  value={form.first_name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Segundo Nombre</label>
                <input 
                  name="second_name" 
                  placeholder="Ingrese su segundo nombre" 
                  value={form.second_name} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* Segunda fila - Apellidos */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Primer Apellido</label>
                <input 
                  name="last_name" 
                  placeholder="Ingrese su primer apellido" 
                  value={form.last_name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Segundo Apellido</label>
                <input 
                  name="second_last_name" 
                  placeholder="Ingrese su segundo apellido" 
                  value={form.second_last_name} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* Tercera fila - Documento y Email */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Número de Documento</label>
                <input 
                  name="document_number" 
                  placeholder="Ingrese su documento" 
                  value={form.document_number} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="required">Correo Electrónico</label>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="ejemplo@correo.com" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Cuarta fila - Dirección y Teléfono */}
            <div className="form-row">
              <div className="form-group">
                <label>Dirección</label>
                <input 
                  name="address" 
                  placeholder="Ingrese su dirección" 
                  value={form.address} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  name="phone" 
                  placeholder="Ingrese su teléfono" 
                  value={form.phone} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* Quinta fila - Rol y Contraseña */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Rol</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="user">Usuario</option>
                  <option value="operario">Operario</option>
                  <option value="mensajero">Mensajero</option>
                </select>
              </div>
              <div className="form-group">
                <label className="required">Contraseña</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Cree una contraseña segura" 
                  value={form.password} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn-register-submit">
              Registrar Usuario
            </button>
          </form>

          <div className="login-link">
            <p>¿Ya tienes una cuenta?</p>
            <button 
              className="btn-login-back"
              onClick={() => window.location.href = '/login'}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}