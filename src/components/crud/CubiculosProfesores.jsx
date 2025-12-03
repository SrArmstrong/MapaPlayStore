import React, { useState, useEffect } from 'react';
import Card from '../commons/Card';
import './CubiculosProfesores.css';

const CubiculosProfesores = () => {
  const [cubiculos, setCubiculos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    edificio: '',
    numeroCubiculo: '',
    planta: 'Planta Baja',
    profesorId: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState('');

  // Obtener token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Configurar headers para las requests
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 🔄 OBTENER CUBÍCULOS DESDE EL BACKEND
  const fetchCubiculos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://mapaback.onrender.com/cubiculos/', {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido');
        }
        throw new Error('Error al cargar cubículos');
      }

      const data = await response.json();
      setCubiculos(data);
    } catch (err) {
      console.error('Error fetching cubículos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 OBTENER PROFESORES DESDE EL BACKEND
  const fetchProfesores = async () => {
    try {
      const response = await fetch('https://mapaback.onrender.com/profesores/', {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al cargar profesores');
      }

      const data = await response.json();
      setProfesores(data);
    } catch (err) {
      console.error('Error fetching profesores:', err);
    }
  };

  useEffect(() => {
    fetchCubiculos();
    fetchProfesores();
  }, []);

  const handleAdd = () => {
    setFormData({
      codigo: '',
      edificio: '',
      numeroCubiculo: '',
      planta: 'Planta Baja',
      profesorId: ''
    });
    setIsEditing(false);
    setShowForm(true);
    setError('');
  };

  const handleEdit = (cubiculo) => {
    setFormData({
      codigo: cubiculo.codigo,
      edificio: cubiculo.edificio,
      numeroCubiculo: cubiculo.numeroCubiculo,
      planta: cubiculo.planta,
      profesorId: cubiculo.profesorId || ''
    });
    setIsEditing(true);
    setShowForm(true);
    setError('');
  };

  // Guardar y actualizar cubículo
  const handleSubmitCubiculo = async () => {
    try {
      setError('');
      
      if (!formData.edificio) {
        setError('El edificio es requerido');
        setShowForm(false);
        return;
      }
      if (!formData.numeroCubiculo) {
        setError('El número de cubículo es requerido');
        setShowForm(false);
        return;
      }

      const cubiculoData = {
        codigo: formData.codigo || `${formData.edificio}-${formData.numeroCubiculo}-${formData.planta}`,
        edificio: formData.edificio,
        numeroCubiculo: formData.numeroCubiculo,
        planta: formData.planta,
        profesorId: formData.profesorId || null
      };

      let response;
      
      if (isEditing) {
        response = await fetch(`https://mapaback.onrender.com/cubiculos/${formData.codigo}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(cubiculoData)
        });
      } else {
        response = await fetch('https://mapaback.onrender.com/cubiculos/', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(cubiculoData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar cubículo');
      }

      await fetchCubiculos();
      setShowForm(false);
      setError('');
    } catch (err) {
      console.error('Error al guardar cubículo:', err);
      setError(err.message);
      setShowForm(false);
    }
  };
  // Eliminar cubículo
  const handleDeleteCubiculo = async () => {
    try {
      setError('');
      
      const response = await fetch(`https://mapaback.onrender.com/cubiculos/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar cubículo');
      }

      // Actualizar estado local
      setCubiculos(prev => prev.filter(cubiculo => cubiculo.codigo !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error al eliminar cubículo:', err);
      setError(err.message);
    }
  };

  const getProfesorNombre = (profesorId) => {
    const profesor = profesores.find(p => p.codigo === profesorId);
    return profesor ? profesor.nombre : 'No asignado';
  };

  const getTurnoColor = (turno) => {
    switch (turno) {
      case 'Matutino': return '#10b981';
      case 'Vespertino': return '#f59e0b';
      case 'Ambos': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="cubiculos-loading-container">
        <div className="cubiculos-loading-spinner"></div>
        <p className="cubiculos-loading-text">Cargando cubículos...</p>
      </div>
    );
  }

  return (
    <div className="cubiculos-container">
      {error && (
        <div className="cubiculos-error-message">
          ⚠️ {error}
          <button onClick={() => setError('')} className="cubiculos-error-close">×</button>
        </div>
      )}
      
      <div className="cubiculos-header">
        <div className="cubiculos-stats-container">
          <div className="cubiculos-stat-item">
            <span className="cubiculos-stat-number">{cubiculos.length}</span>
            <span className="cubiculos-stat-label">Cubículos registrados</span>
          </div>
          <div className="cubiculos-stat-item">
            <span className="cubiculos-stat-number">
              {cubiculos.filter(c => c.profesorId).length}
            </span>
            <span className="cubiculos-stat-label">Cubículos asignados</span>
          </div>
          <div className="cubiculos-stat-item">
            <span className="cubiculos-stat-number">{profesores.length}</span>
            <span className="cubiculos-stat-label">Profesores registrados</span>
          </div>
        </div>
        
        <div className="cubiculos-actions">
          <button onClick={fetchCubiculos} className="cubiculos-secondary-button">
            🔄 Actualizar
          </button>
          <button onClick={handleAdd} className="cubiculos-primary-button">
            <span className="cubiculos-button-icon">+</span>
            Agregar Cubículo
          </button>
        </div>
      </div>

      {cubiculos.length === 0 ? (
        <div className="cubiculos-empty-state-container">
          <div className="cubiculos-empty-state-icon">🏫</div>
          <h3 className="cubiculos-empty-state-title">No hay cubículos registrados</h3>
          <p className="cubiculos-empty-state-description">
            Comience agregando el primer cubículo de profesor
          </p>
          <button onClick={handleAdd} className="cubiculos-primary-button">
            <span className="cubiculos-button-icon">+</span>
            Registrar Primer Cubículo
          </button>
        </div>
      ) : (
        <div className="cubiculos-grid">
          {cubiculos.map((cubiculo) => (
            <Card key={cubiculo.codigo}>
              <div className="cubiculos-card-content">
                <div className="cubiculos-card-header">
                  <div className="cubiculos-cubiculo-icon">🏫</div>
                  <div className="cubiculos-card-title-section">
                    <h3 className="cubiculos-card-title">Cubículo {cubiculo.numeroCubiculo}</h3>
                    <p className="cubiculos-card-subtitle">Código: {cubiculo.codigo}</p>
                  </div>
                  <div 
                    className="cubiculos-status-badge" 
                    style={{
                      backgroundColor: cubiculo.profesorId ? '#10b981' : '#6b7280'
                    }}
                  >
                    {cubiculo.profesorId ? 'Asignado' : 'Disponible'}
                  </div>
                </div>
                
                <div className="cubiculos-card-body">
                  <div className="cubiculos-info-row">
                    <span className="cubiculos-label">🏢 Edificio:</span>
                    <span className="cubiculos-value">{cubiculo.edificio}</span>
                  </div>
                  
                  <div className="cubiculos-info-row">
                    <span className="cubiculos-label">🔢 Número:</span>
                    <span className="cubiculos-value">{cubiculo.numeroCubiculo}</span>
                  </div>
                  
                  <div className="cubiculos-info-row">
                    <span className="cubiculos-label">📐 Planta:</span>
                    <span className="cubiculos-value">{cubiculo.planta}</span>
                  </div>

                  <div className="cubiculos-info-row">
                    <span className="cubiculos-label">👨‍🏫 Profesor:</span>
                    <span className="cubiculos-value">
                      {getProfesorNombre(cubiculo.profesorId)}
                    </span>
                  </div>
                  
                  {cubiculo.profesorId && (
                    <div className="cubiculos-info-row">
                      <span className="cubiculos-label">⏰ Turno:</span>
                      <span 
                        className="cubiculos-value"
                        style={{
                          color: getTurnoColor(profesores.find(p => p.codigo === cubiculo.profesorId)?.turno)
                        }}
                      >
                        {profesores.find(p => p.codigo === cubiculo.profesorId)?.turno}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="cubiculos-card-footer">
                  <button onClick={() => handleEdit(cubiculo)} className="cubiculos-secondary-button">
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(cubiculo.codigo)} 
                    className="cubiculos-danger-button"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="cubiculos-modal-overlay">
          <div className="cubiculos-modal-content">
            <div className="cubiculos-modal-header">
              <h2 className="cubiculos-modal-title">
                {isEditing ? '✏️ Editar Cubículo' : '➕ Registrar Nuevo Cubículo'}
              </h2>
              <button 
                onClick={() => setShowForm(false)} 
                className="cubiculos-close-button"
              >
                ✕
              </button>
            </div>
            
            <div className="cubiculos-form-container">
              <div className="cubiculos-field-group">
                <label className="cubiculos-field-label">Edificio *</label>
                <input
                  placeholder="Ej: Edificio A, Edificio Principal"
                  value={formData.edificio}
                  onChange={(e) => setFormData({ ...formData, edificio: e.target.value })}
                  className="cubiculos-input"
                />
              </div>
              
              <div className="cubiculos-field-group">
                <label className="cubiculos-field-label">Número de Cubículo *</label>
                <input
                  placeholder="Ej: 101, 205, 310"
                  value={formData.numeroCubiculo}
                  onChange={(e) => setFormData({ ...formData, numeroCubiculo: e.target.value })}
                  className="cubiculos-input"
                />
              </div>

              <div className="cubiculos-field-group">
                <label className="cubiculos-field-label">Planta *</label>
                <select
                  value={formData.planta}
                  onChange={(e) => setFormData({ ...formData, planta: e.target.value })}
                  className="cubiculos-input"
                >
                  <option value="Planta Baja">Planta Baja</option>
                  <option value="Planta Alta">Planta Alta</option>
                </select>
              </div>
              
              <div className="cubiculos-field-group">
                <label className="cubiculos-field-label">Profesor Asignado</label>
                <select
                  value={formData.profesorId}
                  onChange={(e) => setFormData({ ...formData, profesorId: e.target.value })}
                  className="cubiculos-input"
                >
                  <option value="">Sin asignar</option>
                  {profesores.map(profesor => (
                    <option key={profesor.codigo} value={profesor.codigo}>
                      {profesor.nombre} ({profesor.turno})
                    </option>
                  ))}
                </select>
                <div className="cubiculos-field-hint">
                  {profesores.length === 0 && (
                    <span className="cubiculos-hint-text">
                      No hay profesores registrados en el sistema
                    </span>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="cubiculos-field-group">
                  <label className="cubiculos-field-label">Código único (opcional)</label>
                  <input
                    placeholder="Dejar en blanco para generar automáticamente"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="cubiculos-input"
                  />
                </div>
              )}
            </div>

            <div className="cubiculos-modal-footer">
              <button onClick={() => setShowForm(false)} className="cubiculos-cancel-button">
                Cancelar
              </button>
              <button onClick={handleSubmitCubiculo} className="cubiculos-primary-button">
                {isEditing ? '💾 Actualizar' : '💾 Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="cubiculos-modal-overlay">
          <div className="cubiculos-confirm-modal">
            <div className="cubiculos-confirm-icon">⚠️</div>
            <h3 className="cubiculos-confirm-title">Confirmar Eliminación</h3>
            <p className="cubiculos-confirm-message">
              ¿Está seguro de que desea eliminar este cubículo? Esta acción no se puede deshacer.
            </p>
            <div className="cubiculos-confirm-buttons">
              <button onClick={() => setConfirmDeleteId(null)} className="cubiculos-cancel-button">
                Cancelar
              </button>
              <button onClick={handleDeleteCubiculo} className="cubiculos-danger-button">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CubiculosProfesores;