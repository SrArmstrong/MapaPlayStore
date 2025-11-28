import bus from '../bus';
import socket from '../socket';

class EventService {

  constructor() {
    this.inicializarSocket();
  }

  inicializarSocket() {
    //console.log("🟣 Escuchando WebSockets...");

    socket.on("event.created", () => {
      //console.log("🔵 Evento creado");
      this.cargarEventos(); // refresca lista completa
    });

    socket.on("event.updated", () => {
      //console.log("🟡 Evento actualizado");
      this.cargarEventos();
    });

    socket.on("event.deleted", () => {
      //console.log("🔴 Evento eliminado");
      this.cargarEventos();
    });
  }


  async cargarEventos() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("https://mapaback.onrender.com/events/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener eventos");

      const eventos = await response.json();

      const evento = {
        id: this.generarId(),
        tipo: "eventos.cargados",
        datos: eventos,
        timestamp: new Date()
      };

      bus.emit(evento.tipo, evento);
      return evento;

    } catch (e) {
      console.error("Error cargando eventos:", e);
      return null;
    }
  }

  seleccionarEvento(evento) {
    const eventoMsg = {
      id: this.generarId(),
      tipo: 'evento.seleccionado',
      datos: evento,
      timestamp: new Date()
    };

    bus.emit(eventoMsg.tipo, eventoMsg);
    return eventoMsg;
  }

  generarId() {
    return `evt_${Date.now()}`;
  }
}

export default new EventService();