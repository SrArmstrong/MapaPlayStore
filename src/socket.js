// socket.js
import { io } from "socket.io-client";

// URL del backend con WebSockets
const SOCKET_URL = "https://mapaback.onrender.com"; 
// O: const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

//console.log("🔌 Conectando a WebSocket:", SOCKET_URL);

// Conexión con opciones recomendadas para producción
const socket = io(SOCKET_URL, {
  transports: ["websocket"], 
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  //console.log("🟢 WebSocket conectado:", socket.id);
});

socket.on("disconnect", () => {
  //console.log("🔴 WebSocket desconectado");
});

socket.on("connect_error", (err) => {
  console.error("⚠️ Error de conexión WebSocket:", err.message);
});

export default socket;
