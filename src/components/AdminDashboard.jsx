import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Eventos from './crud/Eventos';
import CubiculosProfesores from './crud/CubiculosProfesores';
import './AdminDashboard.css';

function AdminDashboard({ onBack }) {
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [activeSection, setActiveSection] = useState('eventos'); // 'eventos' o 'cubiculos'

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        localStorage.removeItem("authToken");
        navigate("/");
      }
    } catch (err) {
      console.error("Error al decodificar token:", err);
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="admin-container">
      {/* Header Principal */}
      <div className="admin-header">
        <div className="admin-header-top">
          <button onClick={onBack} className="admin-back-button">
            <span className="admin-back-icon">←</span>
            Volver al Sistema
          </button>
          
          <div className="admin-institution-badge">
            <span className="admin-institution-icon">🎓</span>
          </div>
        </div>
        
        <div className="admin-title-section">
          <h1 className="admin-main-title">
            {activeSection === 'eventos' ? 'Panel de Eventos' : 'Panel de Cubículos'}
          </h1>
        </div>
      </div>

      {/* Navegación entre secciones */}
      <div className="admin-navigation">
        <button 
          onClick={() => setActiveSection('eventos')}
          className={`admin-nav-button ${activeSection === 'eventos' ? 'active' : ''}`}
        >
          📅 Eventos
        </button>
        <button 
          onClick={() => setActiveSection('cubiculos')}
          className={`admin-nav-button ${activeSection === 'cubiculos' ? 'active' : ''}`}
        >
          🏫 Cubículos de Profesores
        </button>
      </div>

      {/* Sección de Contenido - Dinámico según selección */}
      <div className="admin-content-container">
        <div className="admin-content-header">
          <div className="admin-content-title-section">
            <span className="admin-content-icon">
              {activeSection === 'eventos' ? '📅' : '🏫'}
            </span>
            <div>
              <h2 className="admin-content-title">
                {activeSection === 'eventos' ? 'Eventos' : 'Cubículos de Profesores'}
              </h2>
              <p className="admin-content-description">
                {activeSection === 'eventos' 
                  ? 'Administración de eventos institucionales' 
                  : 'Gestión de cubículos asignados a profesores'}
              </p>
            </div>
          </div>
          
          {loading && (
            <div className="admin-loading-indicator">
              <div className="admin-loading-spinner"></div>
              <span className="admin-loading-text">Cargando datos...</span>
            </div>
          )}
        </div>
        
        <div className="admin-content-body">
          {activeSection === 'eventos' ? (
            <Eventos loading={loading} />
          ) : (
            <CubiculosProfesores loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;