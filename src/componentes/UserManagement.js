import React, { useState, useEffect } from "react";
import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    document_number: "",
    email: "",
    address: "",
    phone: "",
    role: "",
    password: "",
  });
  const [formMessage, setFormMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/users", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      setDeleteMessage("Error al cargar usuarios");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = () => {
    const { first_name, last_name, document_number, email, role, password } = formData;

    if (!first_name?.trim() || !last_name?.trim() || !document_number?.trim() || !email?.trim() || !role?.trim()) {
      return "⚠️ Complete todos los campos obligatorios (*).";
    }

    if (!editUser && (!password || password.length < 8)) {
      return "❌ La contraseña debe tener al menos 8 caracteres.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage("");
    setLoading(true);

    const error = validateForm();
    if (error) {
      setFormMessage(error);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const endpoint = editUser
        ? `http://localhost:3001/api/users/${editUser.id}`
        : "http://localhost:3001/api/users/register";
      const method = editUser ? "PUT" : "POST";

      const requestBody = editUser 
        ? {
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            document_number: formData.document_number.trim(),
            email: formData.email.trim(),
            address: formData.address?.trim() || "",
            phone: formData.phone?.trim() || "",
            role: formData.role,
            ...(formData.password?.trim() && { password: formData.password.trim() })
          }
        : {
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            document_number: formData.document_number.trim(),
            email: formData.email.trim(),
            address: formData.address?.trim() || "",
            phone: formData.phone?.trim() || "",
            role: formData.role,
            password: formData.password,
          };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || data.message || "Error en la operación");

      setFormMessage(
        editUser
          ? "✅ Usuario actualizado correctamente."
          : "✅ Usuario registrado exitosamente."
      );
      
      setTimeout(() => {
        fetchUsers();
      }, 500);
      
      resetForm();
      setShowForm(false);
      
    } catch (error) {
      setFormMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      document_number: "",
      email: "",
      address: "",
      phone: "",
      role: "",
      password: "",
    });
    setEditUser(null);
    setFormMessage("");
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setShowForm(true);

    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      document_number: user.document_number || "",
      email: user.email || "",
      address: user.address || "",
      phone: user.phone || "",
      role: user.role || "",
      password: "",
    });

    setFormMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
    setDeleteMessage("");
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3001/api/users/${userToDelete.id}`,
        {
          method: "DELETE",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "No se pudo eliminar el usuario.");
      }

      setDeleteMessage("✅ Usuario eliminado correctamente.");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();

      setTimeout(() => setDeleteMessage(""), 5000);
    } catch (error) {
      setDeleteMessage(`❌ ${error.message}`);
      setShowDeleteModal(false);
    }
  };

  const traducirRol = (rol) => {
    const roles = {
      client: "Cliente",
      operator: "Operario",
      messenger: "Mensajero",
      admin: "Administrador",
    };
    return roles[rol] || rol;
  };

  return (
    <div className="user-management-container">
      <div className="management-header">
        <h2>Gestión de Usuarios</h2>
        <p>Administración y control de usuarios del sistema</p>
      </div>

      {deleteMessage && (
        <div className={`message-box ${deleteMessage.includes("❌") ? "error-message" : "success-message"}`}>
          {deleteMessage}
        </div>
      )}

      <div className="form-toggle">
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) resetForm();
          }}
        >
          {showForm ? "Ocultar Formulario" : "Registrar Usuario"}
        </button>
      </div>

      {showForm && (
        <div className="register-section card slide-in">
          <h3>{editUser ? "Editar Usuario" : "Registrar Nuevo Usuario"}</h3>
          {formMessage && (
            <div className={`message-box ${formMessage.startsWith("❌") || formMessage.startsWith("⚠️") ? "error-message" : "success-message"}`}>
              {formMessage}
            </div>
          )}

          <form className="user-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  placeholder="Ejemplo: Juan"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido *</label>
                <input
                  type="text"
                  placeholder="Ejemplo: Pérez"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Documento *</label>
                <input
                  type="text"
                  placeholder="Ejemplo: 123456789"
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="text"
                  placeholder="Ejemplo: 3001234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Dirección *</label>
              <input
                type="text"
                placeholder="Ejemplo: Calle 123 #45-67"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico *</label>
              <input
                type="email"
                placeholder="usuario@correo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editUser}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña {editUser ? "(solo si desea cambiarla)" : "*"}</label>
              <input
                type="password"
                placeholder={editUser ? "Dejar vacío para mantener contraseña" : "Mínimo 8 caracteres"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editUser}
              />
            </div>

            <div className="form-group">
              <label>Rol *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="">Seleccionar rol</option>
                <option value="client">Cliente</option>
                <option value="operator">Operario</option>
                <option value="messenger">Mensajero</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Guardando..." : editUser ? "Actualizar Usuario" : "Registrar Usuario"}
              </button>
              {editUser && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="users-section">
        <div className="section-header">
          <h3>Usuarios Registrados</h3>
          <span className="user-count">{users.length}</span>
        </div>

        {users.length > 0 ? (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Verificado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{traducirRol(user.role)}</td>
                    <td>{user.is_email_verified ? "Sí" : "No"}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(user)}>
                          Editar
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => confirmDelete(user)}
                          disabled={user.role === "admin"}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay usuarios registrados.</p>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar eliminación</h3>
            <p>¿Está seguro de eliminar a <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong>?</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={handleDelete}>Eliminar</button>
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;