import React, { useState, useEffect } from "react";
import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtener usuarios existentes
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/users", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setMessage("❌ Error cargando usuarios");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Registrar nuevo usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { first_name, last_name, email, role } = formData;

    if (!first_name || !email || !role) {
      setMessage("❌ Faltan campos obligatorios (nombre, correo, rol)");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error registrando usuario");

      setMessage("✅ Usuario creado con éxito");
      setFormData({ first_name: "", last_name: "", email: "", role: "" });
      fetchUsers();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const traducirRol = (rol) => {
    const roles = {
      'client': 'Cliente',
      'operator': 'Operario',
      'messenger': 'Mensajero',
      'admin': 'Administrador'
    };
    return roles[rol] || rol;
  };

  return (
    <div className="user-management-container">
      <div className="management-header">
        <h2>👥 Gestión de Usuarios</h2>
        <p>Administra los usuarios del sistema de logística</p>
      </div>

      {/* Formulario de registro */}
      <div className="register-section card">
        <h3>➕ Registrar Nuevo Usuario</h3>

        {message && (
          <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form className="user-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                placeholder="Ej: María"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                required
              />
            </div>
            
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                placeholder="Ej: González"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Correo electrónico *</label>
            <input
              type="email"
              placeholder="Ej: maria@ejemplo.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Rol *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="">Seleccionar Rol</option>
              <option value="client">Cliente</option>
              <option value="operator">Operario</option>
              <option value="messenger">Mensajero</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-register">
            {loading ? "Registrando..." : "🚀 Registrar Usuario"}
          </button>
        </form>
      </div>

      {/* Lista de usuarios */}
      <div className="users-section">
        <div className="section-header">
          <h3>📋 Usuarios Registrados</h3>
          <span className="user-count">{users.length} usuarios</span>
        </div>

        {users.length > 0 ? (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Verificado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-name">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {traducirRol(user.role)}
                      </span>
                    </td>
                    <td>
                      {user.is_email_verified ? (
                        <span className="verified-badge">✅ Verificado</span>
                      ) : (
                        <span className="not-verified-badge">❌ No verificado</span>
                      )}
                    </td>
                    <td>
                      <span className="status-badge active">Activo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No hay usuarios registrados</h3>
            <p>Comienza registrando el primer usuario del sistema</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;