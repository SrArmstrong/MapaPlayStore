import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import MapComponent from './components/map/MapComponent';
import './index.css';

function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    // Contar visita cuando la ruta es /map

  }, [location.pathname]);

  return null; // Este componente no renderiza nada
}

function App() {
  return (
    <Router>
      
      <div style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/map" element={<MapComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;