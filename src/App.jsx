import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MapComponent from './components/map/MapComponent';
import AdminPanel from './pages/AdminPanel';
import Login from "./pages/Login";
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

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
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={ <ProtectedRoute> <AdminPanel /> </ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;