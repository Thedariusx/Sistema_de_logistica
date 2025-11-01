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

  // Obtener usuarios existentes
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Registrar nuevo usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { first_name, last_name, email, role } = formData;

    if (!first_name || !email || !role) {
      setMessage("❌ Faltan campos obligatorios (nombre, correo, rol)");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error registrando usuario");

      setMessage("✅ Usuario creado con éxito");
      setFormData({ first_name: "", last_name: "", email: "", role: "" });
      fetchUsers();
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className="user-container">
      <h3>Registrar Nuevo Usuario</h3>

      {message && (
        <div
          className={`message ${
            message.includes("✅") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}

      <form className="user-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={formData.first_name}
          onChange={(e) =>
            setFormData({ ...formData, first_name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Apellido"
          value={formData.last_name}
          onChange={(e) =>
            setFormData({ ...formData, last_name: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="">Seleccionar Rol</option>
          <option value="client">Cliente</option>
          <option value="operator">Operario</option>
          <option value="messenger">Mensajero</option>
        </select>

        <button type="submit">Registrar Usuario</button>
      </form>

      <h3>Usuarios Registrados</h3>
      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.first_name} {u.last_name}
                </td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No hay usuarios registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
