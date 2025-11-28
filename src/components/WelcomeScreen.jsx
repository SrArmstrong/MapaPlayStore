import { useState, useEffect } from 'react';
import EventsList from '../components/commons/eventsList.jsx';
import logoReal from '../assets/logo.png';
import bus from '../bus.js';
import eventService from '../services/eventService.js';
import './WelcomeScreen.css';

function WelcomeScreen({ onStartClick }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection/*, setActiveSection*/] = useState('main');
  const [activeList, setActiveList] = useState(null);
  const [eventosData, setEventosData] = useState([]);
  const [showEventsList, setShowEventsList] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const handleEventosCargados = (evento) => {
      setEventosData(evento.datos.map(e => ({
        name: e.title,
        location: e.description,
        coords: [e.latitude, e.longitude],
        icon: '📍',
        color: '#a78bfa',
        codigo: e.codigo
      })));
    };

    const handleEventoActualizado = (evento) => {
      setEventosData(prev =>
        prev.map(e => e.codigo === evento.codigo ? {
          ...e,
          name: evento.title,
          location: evento.description,
          coords: [evento.latitude, evento.longitude]
        } : e)
      );
    };

    const handleEventoEliminado = (codigo) => {
      setEventosData(prev => prev.filter(e => e.codigo !== codigo));
    };

    bus.on('eventos.cargados', handleEventosCargados);
    bus.on('evento.actualizado', handleEventoActualizado);
    bus.on('evento.eliminado', handleEventoEliminado);

    eventService.cargarEventos();

    return () => {
      bus.off('eventos.cargados', handleEventosCargados);
      bus.off('evento.actualizado', handleEventoActualizado);
      bus.off('evento.eliminado', handleEventoEliminado);
    };
  }, []);

  // Función simplificada al quitar Firestore
  const handleMapClick = () => {
    onStartClick();
  };

  const sections = {
    main: {
      title: "Eventos",
      icon: "📅",
      content: "Explora los próximos eventos y actividades en la UTEQ",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
    }
  };

  const handleEventClick = (coords, locationName) => {
    onStartClick();
    setTimeout(() => {
      window.showRouteToLocation && window.showRouteToLocation(coords, locationName);
    }, 1000);
  };

  return (
    <div className={`welcome-container ${isLoaded ? 'loaded' : ''}`}>

      <div className="header-section">
        <img 
          src={logoReal}
          alt="LogoTrue" 
          className="logo-image"
        />
        
        <h1 className="main-title">
          Mapa True
        </h1>
        
        <p className="subtitle">
          Explora una sección de forma interactiva en una zona
        </p>

        <button 
          onClick={handleMapClick}
          className="explore-button"
        >
          🗺️ Explorar Mapa
        </button>
      </div>
{/*
      <div className="nav-tabs">
        {Object.keys(sections).map(section => (
          <button
            key={section}
            onClick={() => {
              setActiveSection(section);
              if (section === 'eventos') {
                setShowEventsList(false);
              }
            }}
            className={`nav-button ${activeSection === section ? 'active' : ''}`}
          >
            <span className="nav-button-icon">{sections[section].icon}</span>
            {sections[section].title}
          </button>
        ))}
      </div>
*/}
      {/* Content Section */}
      <div className="content-section">
        <div 
          className="section-card"
          style={{ background: sections[activeSection].gradient }}
        >
          <div className="section-pulse" />
          
          <h2 className="section-title">
            <span className="section-icon">{sections[activeSection].icon}</span>
            {sections[activeSection].title}
          </h2>

          {activeSection === 'main' && (
            <div>
              <div className="view-buttons">
                <button
                  onClick={() => setShowEventsList(false)}
                  className={`view-button ${!showEventsList ? 'active' : ''}`}
                >
                  🗂️ Vista de Tarjetas
                </button>
                <button
                  onClick={() => setShowEventsList(true)}
                  className={`view-button ${showEventsList ? 'active' : ''}`}
                >
                  📋 Buscar con lista
                </button>
              </div>

              {!showEventsList && (
                <div className="events-grid">
                  {eventosData.map((event, index) => (
                    <div
                      key={index}
                      onClick={() => handleEventClick(event.coords, event.location)}
                      className="event-card"
                    >
                      <div 
                        className="event-icon"
                        style={{ backgroundColor: event.color }}
                      >
                        {event.icon}
                      </div>
                      
                      <h3 className="event-title">
                        {event.name}
                      </h3>
                      <p className="event-location">
                        <span>📍</span> {event.location}
                      </p>
                      <p className="event-code">
                        Código: {event.codigo}
                      </p>
                      <div className="event-action">
                        👆 Click para ubicar en el mapa
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showEventsList && (
                <div className="events-list-container">
                  <EventsList 
                    integrated={true}
                    activeList={activeList}
                    setActiveList={setActiveList}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;