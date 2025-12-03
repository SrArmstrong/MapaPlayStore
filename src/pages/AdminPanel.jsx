// src/pages/AdminPanel.jsx
import AdminDashboard from "../components/AdminDashboard";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  const navigate = useNavigate();
  const goToHome = () => navigate("/");

  return <AdminDashboard onBack={goToHome} />;
}

export default AdminPanel;
