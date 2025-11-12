import React, { useState, useEffect, useRef } from "react";
import '../App.css';
import logoIcon from '../assets/logo_icon.png';

export default function RegisterForm(props) {
  const [form, setForm] = useState({
    first_name: "",
    second_name: "",
    last_name: "",
    second_last_name: "",
    document_number: "",
    email: "",
    address: "",
    phone: "",
    role: "client", // Cambiado a "client" por defecto
    password: "",
  });

  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  // Expresiones regulares para validación
  const nameRegex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/;
  const documentRegex = /^\d{10}$/;
  const phoneRegex = /^\d{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Efecto para posicionar los tooltips dinámicamente
  useEffect(() => {
    const repositionTooltips = () => {
      const tooltips = document.querySelectorAll('.alert-error');
      tooltips.forEach(tooltip => {
        const inputId = tooltip.getAttribute('data-for');
        const input = document.getElementById(inputId);
        
        if (input) {
          const inputRect = input.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          // Posicionar el tooltip arriba del campo
          tooltip.style.top = `${inputRect.top + scrollTop - tooltip.offsetHeight - 8}px`;
          tooltip.style.left = `${inputRect.left}px`;
          tooltip.style.width = `${inputRect.width}px`;
        }
      });
    };

    if (Object.keys(errors).length > 0) {
      // Esperar a que el DOM se actualice
      setTimeout(repositionTooltips, 10);
      
      // Reposicionar cuando se redimensiona la ventana
      window.addEventListener('resize', repositionTooltips);
      window.addEventListener('scroll', repositionTooltips);
      
      return () => {
        window.removeEventListener('resize', repositionTooltips);
        window.removeEventListener('scroll', repositionTooltips);
      };
    }
  }, [errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
        if (!nameRegex.test(value.trim())) {
          return 'El primer nombre solo puede contener letras y espacios';
        }
        break;
        
      case 'second_name':
        if (value.trim() !== '' && !nameRegex.test(value.trim())) {
          return 'El segundo nombre solo puede contener letras y espacios';
        }
        break;
        
      case 'last_name':
        if (!nameRegex.test(value.trim())) {
          return 'El primer apellido solo puede contener letras y espacios';
        }
        break;
        
      case 'second_last_name':
        if (value.trim() !== '' && !nameRegex.test(value.trim())) {
          return 'El segundo apellido solo puede contener letras y espacios';
        }
        break;
        
      case 'document_number':
        if (!documentRegex.test(value.trim())) {
          return 'El número de documento debe tener exactamente 10 dígitos numéricos';
        }
        break;
        
      case 'phone':
        if (value.trim() !== '' && !phoneRegex.test(value.trim())) {
          return 'El número de teléfono debe tener exactamente 10 dígitos numéricos';
        }
        break;
        
      case 'email':
        if (!emailRegex.test(value.trim())) {
          return 'Incluye un signo "@" en la dirección de correo electrónico.';
        }
        break;
        
      case 'password':
        if (value.trim().length < 4) {
          return 'La contraseña debe tener al menos 4 caracteres';
        }
        break;
        
      default:
        return '';
    }
    return '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      // Limpiar error si se corrigió
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obligatorios
    if (!form.first_name.trim()) {
      newErrors.first_name = 'El primer nombre es obligatorio';
    } else if (!nameRegex.test(form.first_name.trim())) {
      newErrors.first_name = 'El primer nombre solo puede contener letras y espacios';
    }
    
    if (!form.last_name.trim()) {
      newErrors.last_name = 'El primer apellido es obligatorio';
    } else if (!nameRegex.test(form.last_name.trim())) {
      newErrors.last_name = 'El primer apellido solo puede contener letras y espacios';
    }
    
    if (!form.document_number.trim()) {
      newErrors.document_number = 'El número de documento es obligatorio';
    } else if (!documentRegex.test(form.document_number.trim())) {
      newErrors.document_number = 'El número de documento debe tener exactamente 10 dígitos numéricos';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = 'Incluye un signo "@" en la dirección de correo electrónico.';
    }
    
    if (!form.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (form.password.trim().length < 4) {
      newErrors.password = 'La contraseña debe tener al menos 4 caracteres';
    }
    
    // Validar rol
    if (!form.role.trim()) {
      newErrors.role = 'El rol es obligatorio';
    } else if (!["client", "operario", "mensajero"].includes(form.role)) {
      newErrors.role = 'Seleccione un rol válido';
    }
    
    // Validar campos opcionales si tienen valor
    if (form.second_name.trim() !== '' && !nameRegex.test(form.second_name.trim())) {
      newErrors.second_name = 'El segundo nombre solo puede contener letras y espacios';
    }
    
    if (form.second_last_name.trim() !== '' && !nameRegex.test(form.second_last_name.trim())) {
      newErrors.second_last_name = 'El segundo apellido solo puede contener letras y espacios';
    }
    
    if (form.phone.trim() !== '' && !phoneRegex.test(form.phone.trim())) {
      newErrors.phone = 'El número de teléfono debe tener exactamente 10 dígitos numéricos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar el formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    try {
      // Asegurar que siempre se envíe el rol correcto
      const formData = {
        ...form,
        role: form.role || "client" // Por si acaso, asegurar que siempre tenga valor
      };

      const response = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(`❌ Error: ${data.error || "No se pudo registrar el usuario"}`);
        return;
      }

      // ✅ REGISTRO EXITOSO - LLAMAR A LA FUNCIÓN DE VERIFICACIÓN
      if (props.onRegistrationSuccess) {
        props.onRegistrationSuccess(form.email);
      }

      alert(`✅ Usuario registrado correctamente: ${data.user?.first_name || form.first_name}`);
      
      // Limpiar formulario (mantener "client" como valor por defecto)
      setForm({
        first_name: "",
        second_name: "",
        last_name: "",
        second_last_name: "",
        document_number: "",
        email: "",
        address: "",
        phone: "",
        role: "client",
        password: "",
      });
      
      // Limpiar errores
      setErrors({});
      
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="register-container" ref={formRef}>
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
                  id="first_name"
                  name="first_name" 
                  placeholder="Ingrese su primer nombre" 
                  value={form.first_name} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.first_name ? 'error' : ''}
                  required 
                />
                {errors.first_name && (
                  <div className="alert-error" data-for="first_name">
                    {errors.first_name}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Segundo Nombre</label>
                <input 
                  id="second_name"
                  name="second_name" 
                  placeholder="Ingrese su segundo nombre" 
                  value={form.second_name} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.second_name ? 'error' : ''}
                />
                {errors.second_name && (
                  <div className="alert-error" data-for="second_name">
                    {errors.second_name}
                  </div>
                )}
              </div>
            </div>

            {/* Segunda fila - Apellidos */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Primer Apellido</label>
                <input 
                  id="last_name"
                  name="last_name" 
                  placeholder="Ingrese su primer apellido" 
                  value={form.last_name} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.last_name ? 'error' : ''}
                  required 
                />
                {errors.last_name && (
                  <div className="alert-error" data-for="last_name">
                    {errors.last_name}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Segundo Apellido</label>
                <input 
                  id="second_last_name"
                  name="second_last_name" 
                  placeholder="Ingrese su segundo apellido" 
                  value={form.second_last_name} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.second_last_name ? 'error' : ''}
                />
                {errors.second_last_name && (
                  <div className="alert-error" data-for="second_last_name">
                    {errors.second_last_name}
                  </div>
                )}
              </div>
            </div>

            {/* Tercera fila - Documento y Email */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Número de Documento</label>
                <input 
                  id="document_number"
                  name="document_number" 
                  placeholder="Ingrese su documento (10 dígitos)" 
                  value={form.document_number} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.document_number ? 'error' : ''}
                  required 
                />
                {errors.document_number && (
                  <div className="alert-error" data-for="document_number">
                    {errors.document_number}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="required">Correo Electrónico</label>
                <input 
                  id="email"
                  name="email" 
                  type="email" 
                  placeholder="ejemplo@correo.com" 
                  value={form.email} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.email ? 'error' : ''}
                  required 
                />
                {errors.email && (
                  <div className="alert-error" data-for="email">
                    {errors.email}
                  </div>
                )}
              </div>
            </div>

            {/* Cuarta fila - Dirección y Teléfono */}
            <div className="form-row">
              <div className="form-group">
                <label>Dirección</label>
                <input 
                  id="address"
                  name="address" 
                  placeholder="Ingrese su dirección" 
                  value={form.address} 
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  id="phone"
                  name="phone" 
                  placeholder="Ingrese su teléfono (10 dígitos)" 
                  value={form.phone} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && (
                  <div className="alert-error" data-for="phone">
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Quinta fila - Rol y Contraseña */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Rol</label>
                <select 
                  id="role"
                  name="role" 
                  value={form.role} 
                  onChange={handleChange}
                  className={errors.role ? 'error' : ''}
                  required
                >
                  <option value="client">Usuario</option>
                  <option value="operario">Operario</option>
                  <option value="mensajero">Mensajero</option>
                </select>
                {errors.role && (
                  <div className="alert-error" data-for="role">
                    {errors.role}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="required">Contraseña</label>
                <input 
                  id="password"
                  name="password" 
                  type="password" 
                  placeholder="Mínimo 4 caracteres" 
                  value={form.password} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.password ? 'error' : ''}
                  required 
                />
                {errors.password && (
                  <div className="alert-error" data-for="password">
                    {errors.password}
                  </div>
                )}
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