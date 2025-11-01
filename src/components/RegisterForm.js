import React, { useState } from "react";
import '../App.css';


export default function RegisterForm() {
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

      alert(`✅ Usuario registrado correctamente: ${data.user.first_name}`);
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
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "12px",
        backgroundColor: "#f9f9f9",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Registro de Usuario
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: "12px" }}>
          <input name="first_name" placeholder="Primer nombre" value={form.first_name} onChange={handleChange} required />
          <input name="second_name" placeholder="Segundo nombre" value={form.second_name} onChange={handleChange} />
          <input name="last_name" placeholder="Primer apellido" value={form.last_name} onChange={handleChange} required />
          <input name="second_last_name" placeholder="Segundo apellido" value={form.second_last_name} onChange={handleChange} />
          <input name="document_number" placeholder="Número de documento" value={form.document_number} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
          <input name="address" placeholder="Dirección" value={form.address} onChange={handleChange} />
          <input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">Usuario</option>
            <option value="operario">Operario</option>
            <option value="mensajero">Mensajero</option>
          </select>
          <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
        </div>
        <button
          type="submit"
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Registrar Usuario
        </button>
      </form>
    </div>
  );
}
