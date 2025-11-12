import React, { useState, useEffect } from "react";
import "./ShipmentManagement.css";

function ShipmentManagement({ currentUser, onMessage }) {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [messengers, setMessengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [currentFilter, setCurrentFilter] = useState('pending');

  // Cargar envíos y mensajeros
  useEffect(() => {
    fetchPackages();
    fetchMessengers();
  }, []);

  // Filtrar envíos según el filtro actual
  useEffect(() => {
    if (packages.length > 0) {
      let filtered = [];
      switch (currentFilter) {
        case 'pending':
          filtered = packages.filter(pkg => 
            pkg.status === 'registered' || pkg.status === 'approved' || pkg.status === 'rejected'
          );
          break;
        case 'in_progress':
          filtered = packages.filter(pkg => 
            pkg.status === 'in_transit' || pkg.status === 'out_for_delivery'
          );
          break;
        case 'delivered':
          filtered = packages.filter(pkg => pkg.status === 'delivered');
          break;
        default:
          filtered = packages;
      }
      setFilteredPackages(filtered);
    }
  }, [packages, currentFilter]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/packages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error obteniendo envíos");
      
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      onMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessengers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/users/role/messenger", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessengers(data);
      }
    } catch (error) {
      console.error("Error obteniendo mensajeros:", error);
    }
  };

  // Aprobar envío
  const approvePackage = async (packageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/packages/${packageId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error aprobando envío");
      }

      onMessage("✅ Envío aprobado exitosamente");
      fetchPackages();
    } catch (error) {
      onMessage(`❌ ${error.message}`);
    }
  };

  // Rechazar envío
  const rejectPackage = async (packageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/packages/${packageId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error rechazando envío");
      }

      onMessage("❌ Envío rechazado");
      fetchPackages();
    } catch (error) {
      onMessage(`❌ ${error.message}`);
    }
  };

  // Asignar mensajero automáticamente
  const assignMessengerAutomatically = async (packageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/packages/${packageId}/assign-automatic`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error asignando mensajero");
      }

      onMessage("✅ Mensajero asignado automáticamente");
      fetchPackages();
    } catch (error) {
      onMessage(`❌ ${error.message}`);
    }
  };

  // Asignar mensajero manualmente
  const handleAssignMessenger = async (packageId, messengerId) => {
    if (!messengerId) {
      onMessage("❌ Selecciona un mensajero");
      return;
    }

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

      onMessage("✅ Mensajero asignado exitosamente");
      setShowAssignModal(false);
      fetchPackages();
    } catch (error) {
      onMessage(`❌ ${error.message}`);
    }
  };

  // Editar información de envíos
  const handleEditPackage = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/packages/${selectedPackage.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error actualizando envío");
      }

      onMessage("✅ Envío actualizado exitosamente");
      setShowEditModal(false);
      fetchPackages();
    } catch (error) {
      onMessage(`❌ ${error.message}`);
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

      onMessage(`✅ Estado actualizado a: ${traducirEstado(newStatus)}`);
      fetchPackages();
    } catch (error) {
      onMessage(`❌ ${error.message}`);
    }
  };

  // Traducir estados
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

  // Obtener clase CSS según estado
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

  return (
    <div className="shipment-management-container">
      <div className="management-header">
        <h2>📦 Gestión de Envíos - Operario</h2>
        <p>Gestiona, aprueba y asigna mensajeros a los envíos del sistema</p>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filter-buttons">
          <button 
            className={currentFilter === 'pending' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setCurrentFilter('pending')}
          >
            ⏳ Pendientes ({packages.filter(p => p.status === 'registered' || p.status === 'approved' || p.status === 'rejected').length})
          </button>
          <button 
            className={currentFilter === 'in_progress' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setCurrentFilter('in_progress')}
          >
            🚚 En Proceso ({packages.filter(p => p.status === 'in_transit' || p.status === 'out_for_delivery').length})
          </button>
          <button 
            className={currentFilter === 'delivered' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setCurrentFilter('delivered')}
          >
            ✅ Entregados ({packages.filter(p => p.status === 'delivered').length})
          </button>
        </div>
      </div>

      {/* Lista de envíos */}
      <div className="shipments-section">
        <div className="section-header">
          <h3>
            {currentFilter === 'pending' && '⏳ Envíos Pendientes'}
            {currentFilter === 'in_progress' && '🚚 Envíos en Proceso'}
            {currentFilter === 'delivered' && '✅ Envíos Entregados'}
          </h3>
          <span className="package-count">{filteredPackages.length} envíos</span>
        </div>

        {loading ? (
          <div className="loading-state">Cargando envíos...</div>
        ) : filteredPackages.length > 0 ? (
          <div className="packages-grid-management">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="package-management-card card">
                <div className="package-header">
                  <div className="package-title">
                    <h4>{pkg.tracking_code}</h4>
                    <span className={`status ${getStatusClass(pkg.status)}`}>
                      {traducirEstado(pkg.status)}
                    </span>
                  </div>
                  {pkg.created_at && (
                    <span className="package-date">
                      {new Date(pkg.created_at).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
                
                {/* Información del envío */}
                <div className="package-info">
                  <div className="info-row">
                    <span className="info-label">De:</span>
                    <span className="info-value">{pkg.sender_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Para:</span>
                    <span className="info-value">{pkg.recipient_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Dirección:</span>
                    <span className="info-value">{pkg.delivery_address}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Descripción:</span>
                    <span className="info-value">{pkg.package_description || "No especificada"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Cliente:</span>
                    <span className="info-value">{pkg.client_name || "No asignado"}</span>
                  </div>
                  
                  {/* Mensajero asignado o selector */}
                  {pkg.messenger_name ? (
                    <div className="info-row">
                      <span className="info-label">Mensajero:</span>
                      <span className="info-value messenger-assigned">
                        👤 {pkg.messenger_name}
                      </span>
                    </div>
                  ) : (
                    <div className="info-row">
                      <span className="info-label">Mensajero:</span>
                      <span className="info-value no-messenger">No asignado</span>
                    </div>
                  )}
                </div>

                {/* Botones de acción según el estado */}
                <div className="package-actions-management">
                  
                  {/* PARA ENVÍOS REGISTRADOS: Aprobar/Rechazar */}
                  {pkg.status === 'registered' && (
                    <div className="action-group">
                      <button
                        onClick={() => approvePackage(pkg.id)}
                        className="btn-approve"
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => rejectPackage(pkg.id)}
                        className="btn-reject"
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  )}

                  {/* PARA ENVÍOS APROBADOS: Asignar mensajero */}
                  {pkg.status === 'approved' && !pkg.messenger_name && (
                    <div className="action-group">
                      <button
                        onClick={() => assignMessengerAutomatically(pkg.id)}
                        className="btn-assign-auto"
                      >
                        🤖 Asignar Auto
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setShowAssignModal(true);
                        }}
                        className="btn-assign-manual"
                      >
                        👤 Asignar Manual
                      </button>
                    </div>
                  )}

                  {/* PARA ENVÍOS CON MENSAJERO: Cambiar estados */}
                  {pkg.messenger_name && pkg.status !== 'delivered' && pkg.status !== 'rejected' && (
                    <div className="action-group">
                      <select
                        value={pkg.status}
                        onChange={(e) => updatePackageStatus(pkg.id, e.target.value)}
                        className="status-select-management"
                      >
                        <option value="approved">Aprobado</option>
                        <option value="in_transit">En Tránsito</option>
                        <option value="out_for_delivery">En Entrega</option>
                        <option value="delivered">Entregado</option>
                      </select>
                    </div>
                  )}

                  {/* Acciones generales */}
                  <div className="action-group">
                    <button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setEditFormData({
                          sender_name: pkg.sender_name,
                          recipient_name: pkg.recipient_name,
                          delivery_address: pkg.delivery_address,
                          package_description: pkg.package_description
                        });
                        setShowEditModal(true);
                      }}
                      className="btn-edit"
                    >
                      ✏️ Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              {currentFilter === 'pending' && '⏳'}
              {currentFilter === 'in_progress' && '🚚'}
              {currentFilter === 'delivered' && '✅'}
            </div>
            <h3>
              {currentFilter === 'pending' && 'No hay envíos pendientes'}
              {currentFilter === 'in_progress' && 'No hay envíos en proceso'}
              {currentFilter === 'delivered' && 'No hay envíos entregados'}
            </h3>
            <p>
              {currentFilter === 'pending' && 'Los envíos nuevos aparecerán aquí'}
              {currentFilter === 'in_progress' && 'Los envíos en proceso aparecerán aquí'}
              {currentFilter === 'delivered' && 'Los envíos entregados aparecerán aquí'}
            </p>
          </div>
        )}
      </div>

      {/* MODAL: Asignar mensajero manualmente */}
      {showAssignModal && selectedPackage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>👤 Asignar Mensajero Manualmente</h3>
              <button onClick={() => setShowAssignModal(false)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <p>Selecciona un mensajero para el envío: <strong>{selectedPackage.tracking_code}</strong></p>
              
              <div className="form-group">
                <label>Mensajero:</label>
                <select
                  className="messenger-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignMessenger(selectedPackage.id, e.target.value);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Seleccionar mensajero</option>
                  {messengers.map((messenger) => (
                    <option key={messenger.id} value={messenger.id}>
                      {messenger.first_name} {messenger.last_name} - {messenger.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Editar envío */}
      {showEditModal && selectedPackage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>✏️ Editar Envío</h3>
              <button onClick={() => setShowEditModal(false)} className="btn-close">×</button>
            </div>
            <form onSubmit={handleEditPackage} className="modal-body">
              <div className="form-group">
                <label>Remitente:</label>
                <input
                  type="text"
                  value={editFormData.sender_name || ''}
                  onChange={(e) => setEditFormData({...editFormData, sender_name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Destinatario:</label>
                <input
                  type="text"
                  value={editFormData.recipient_name || ''}
                  onChange={(e) => setEditFormData({...editFormData, recipient_name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Dirección:</label>
                <textarea
                  value={editFormData.delivery_address || ''}
                  onChange={(e) => setEditFormData({...editFormData, delivery_address: e.target.value})}
                  required
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={editFormData.package_description || ''}
                  onChange={(e) => setEditFormData({...editFormData, package_description: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  💾 Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



export default ShipmentManagement;