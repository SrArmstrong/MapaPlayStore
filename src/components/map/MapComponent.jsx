import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import locations from '../../locations';
import intersectionPoints from '../../intersectionPoints';
import pathPairs from '../../pathPairs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BuildingList from '../commons/BuildingList';
import EventsList from "../commons/eventsList";
import bus from "../../bus";
import './mapstyle.css';

function MapComponent() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const currentLocationRef = useRef(null);
  const [myInstructions, setMyInstructions] = useState([]);

  const DEBUG_MODE = false; // Cambiar entre true/false para mostrar o no los nodos al igual que las coordenadas

  const [activeList, setActiveList] = useState(null); 

  const positionWatcher = useRef(null);
  let lastRoute = null;
  let currentUserMarker = null;
  let currentAccuracyCircle = null;
  let lastDestinationMarker = null;

  function limpiarRutaYDestino() {
    if (lastRoute) {
      mapRef.current.removeLayer(lastRoute);
      lastRoute = null;
    }
    if (lastDestinationMarker) {
      mapRef.current.removeLayer(lastDestinationMarker);
      lastDestinationMarker = null;
    }
    if (window.destinationLine) {
      mapRef.current.removeLayer(window.destinationLine);
      window.destinationLine = null;
    }
    window.currentDestination = null;
    window.currentPathNodes = null;
    window.arrivalNotified = false;
  }

  function generateInstructions(userLocation, pathNodes) {
    const instructions = [];

    // Paso inicial: desde la ubicación actual al primer nodo
    if (userLocation && pathNodes.length > 0) {
      const firstNode = pathNodes[0];
      const dist = getDistance(userLocation, firstNode);
      const dir = getDirection(userLocation, firstNode);
      instructions.push(`Desde tu ubicación actual, camina ${dist.toFixed(1)} metros hacia el ${dir}.`);
    }

    // Recorre todos los nodos intermedios
    for (let i = 1; i < pathNodes.length; i++) {
      const prev = pathNodes[i - 1];
      const curr = pathNodes[i];
      const dist = getDistance(prev, curr);
      const dir = getDirection(prev, curr);

      instructions.push(`Luego, continúa ${dist.toFixed(1)} metros hacia el ${dir}.`);
    }

    return instructions;
  }

  function getDirection(from, to) {
    const latDiff = to[0] - from[0];
    const lngDiff = to[1] - from[1];

    const angle = Math.atan2(latDiff, lngDiff) * (180 / Math.PI);

    if (angle >= -22.5 && angle < 22.5) return "este";
    if (angle >= 22.5 && angle < 67.5) return "sureste";
    if (angle >= 67.5 && angle < 112.5) return "sur";
    if (angle >= 112.5 && angle < 157.5) return "suroeste";
    if (angle >= 157.5 || angle < -157.5) return "oeste";
    if (angle >= -157.5 && angle < -112.5) return "noroeste";
    if (angle >= -112.5 && angle < -67.5) return "norte";
    if (angle >= -67.5 && angle < -22.5) return "noreste";

    return "desconocido";
  }

  const showCurrentPosition = (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    const userLocation = [latitude, longitude];

    // Evitar recalcular ruta si el movimiento es muy pequeño (< 10m)
    if (currentLocationRef.current) {
      const movedDistance = getDistance(currentLocationRef.current, userLocation);
      if (movedDistance < 5) return;
    }

    setCurrentLocation(userLocation);

    // Verificar si llegaste al destino
    if (window.currentDestination) {
        const distanceToDestination = getDistance(userLocation, window.currentDestination);
        
        if (distanceToDestination < 20 && !window.arrivalNotified) {
            window.arrivalNotified = true;
            toast.success('🎉 ¡Has llegado a tu destino!');
            limpiarRutaYDestino();
        } else if (distanceToDestination > 30) {
            window.arrivalNotified = false;
            if (!window.currentPathNodes) {
                console.log("Te alejaste del destino, recalculando ruta...");
                createRoute(userLocation, window.currentDestination);
            }
        }
    }


    currentLocationRef.current = userLocation;

    // Eliminar marcador y círculo previos si existen
    if (currentUserMarker) mapRef.current.removeLayer(currentUserMarker);
    if (currentAccuracyCircle) mapRef.current.removeLayer(currentAccuracyCircle);

    // Opcional: limpiar solo la ruta previa
    //if (lastRoute) mapRef.current.removeLayer(lastRoute);

    // Recentrar mapa según preferencia
    const shouldRecenter = true;
    if (shouldRecenter && window.currentDestination) {
      const bounds = L.latLngBounds([
        [latitude, longitude],
        window.currentDestination
      ]);
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50] // Margen visual para no estar pegado al borde
      });
    } else {
      mapRef.current.setView(userLocation, 18); // Zoom fijo si no hay destino
    }


    // Mostrar círculo de precisión
    currentAccuracyCircle = L.circle(userLocation, {
      radius: accuracy,
      color: '#3388ff',
      fillColor: '#3388ff',
      fillOpacity: 0.2
    }).addTo(mapRef.current);

    // Mostrar marcador de ubicación actual
    currentUserMarker = L.marker(userLocation, {
      icon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [20, 32],
        iconAnchor: [10, 32],
        popupAnchor: [1, -15],
        shadowSize: [32, 32]
      })
    }).addTo(mapRef.current)
      .bindPopup(`
        <b>Tu ubicación actual</b><br>
        Lat: ${latitude.toFixed(6)}<br>
        Lng: ${longitude.toFixed(6)}<br>
        Precisión: ${Math.round(accuracy)} metros
      `)
      {/*.openPopup()*/};

    // Recalcular y recortar ruta conforme el usuario avanza
    if (lastRoute && window.currentPathNodes && window.currentPathNodes.length > 0) {
      // Remover segmentos ya recorridos
      window.currentPathNodes = removePassedSegments(userLocation, window.currentPathNodes);

      // Actualizar instrucciones y ETA
      if (window.currentPathNodes.length > 0 && window.currentDestination) {
        const newInstructions = generateInstructions(userLocation, window.currentPathNodes);
        const remainingDistance = window.currentPathNodes.reduce((acc, val, idx, arr) =>
          idx ? acc + getDistance(arr[idx - 1], val) : acc + getDistance(userLocation, val), 0
        ) + getDistance(window.currentPathNodes[window.currentPathNodes.length - 1], window.currentDestination);

        const ETA = formatETA(remainingDistance / 1.4); // velocidad de caminata promedio
        newInstructions.push(`🕒 Tiempo estimado restante: ${ETA}`);
        setMyInstructions(newInstructions);
      }

      
      // Si aún quedan nodos en la ruta, actualizar
      if (window.currentPathNodes.length > 0) {
        mapRef.current.removeLayer(lastRoute);
        
        // Crear nueva ruta con los nodos restantes
        const remainingPath = [userLocation, ...window.currentPathNodes];
        lastRoute = L.polyline(remainingPath, {
          color: '#FF5733',
          weight: 6,
          opacity: 1
        }).addTo(mapRef.current);
        
        // Actualizar línea al destino final
        const finalDestination = window.currentDestination;
        if (finalDestination) {
          // Remover línea anterior al destino
          if (window.destinationLine) {
            mapRef.current.removeLayer(window.destinationLine);
          }
          
          // Crear nueva línea al destino desde el último nodo
          window.destinationLine = L.polyline([window.currentPathNodes[window.currentPathNodes.length - 1], finalDestination], {
            color: '#FF5733',
            weight: 6,
            opacity: 1,
            dashArray: '5, 10'
          }).addTo(mapRef.current);
        }
      } else {
        // Si no quedan nodos, verificar distancia al destino
        if (window.currentDestination) {
          const distanceToDestination = getDistance(userLocation, window.currentDestination);
          
          // Si está lejos del destino (>50m), recalcular ruta completa
          if (distanceToDestination > 50) {
            console.log("Usuario se alejó del destino, recalculando ruta completa");
            mapRef.current.removeLayer(lastRoute);
            if (window.destinationLine) {
              mapRef.current.removeLayer(window.destinationLine);
            }
            
            // Recalcular ruta completa
            lastRoute = createRoute(userLocation, window.currentDestination);
            return; // Salir para evitar crear línea directa
          } else {
            // Si está cerca, mantener línea directa
            mapRef.current.removeLayer(lastRoute);
            lastRoute = L.polyline([userLocation, window.currentDestination], {
              color: '#FF5733',
              weight: 6,
              opacity: 1,
              dashArray: '5, 10'
            }).addTo(mapRef.current);
          }
        }
      }
    } else if (window.currentDestination) {
      // Si no hay ruta activa pero hay destino, verificar distancia
      const distanceToDestination = getDistance(userLocation, window.currentDestination);
      
      // Si está lejos, recalcular ruta completa
      if (distanceToDestination > 50) {
        console.log("Recalculando ruta completa desde posición alejada");
        if (lastRoute) mapRef.current.removeLayer(lastRoute);
        if (window.destinationLine) mapRef.current.removeLayer(window.destinationLine);
        lastRoute = createRoute(userLocation, window.currentDestination);
      } else {
        // Si está cerca, línea directa
        if (lastRoute) mapRef.current.removeLayer(lastRoute);
        lastRoute = L.polyline([userLocation, window.currentDestination], {
          color: '#FF5733',
          weight: 6,
          opacity: 1,
          dashArray: '5, 10'
        }).addTo(mapRef.current);
      }
    }

  };

  const startTracking = () => {
    if (positionWatcher.current) {
      navigator.geolocation.clearWatch(positionWatcher.current);
    }

    positionWatcher.current = navigator.geolocation.watchPosition(
      showCurrentPosition,
      (err) => console.error("Error obteniendo posición:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };

  let createRoute; 

  useEffect(() => {

    bus.on('evento.seleccionado', (evento) => {
      const eventData = evento.datos;
      const destination = [eventData.latitude, eventData.longitude];
      
      // Usar función existente del mapa
      if (window.showRouteToLocation) {
        window.showRouteToLocation(destination, eventData.title);
      }
    });

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map("map", {
      minZoom: 2,
      maxZoom: 20,
      zoomControl: false,
      dragging: true,
      scrollWheelZoom: true
    });
    mapRef.current = map;

    startTracking();

    map.on('load', () => {
      const loadingElement = document.getElementById('map-loading');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
    });

    setTimeout(() => {
      map.invalidateSize(true);
    }, 100);

    //L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: 'Google Maps',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20
    }).addTo(map);

    // DEBUG para mostrar nodos
    if (DEBUG_MODE) {
      pathPairs.forEach(pair => {
        L.polyline(pair, {
          color: '#2980b9',
          weight: 3,
          opacity: 0.8
        }).addTo(map);
      });

      const uniquePoints = [...new Set(pathPairs.flat().map(JSON.stringify))].map(JSON.parse);
      uniquePoints.forEach((point) => {
        L.circleMarker(point, {
          radius: 4,
          fillColor: '#e74c3c',
          color: '#c0392b',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7
        }).addTo(map);
      });
    }

    const showRoute = (destination, destinationName) => {
      // Clear any existing routes first
      map.eachLayer(layer => {
        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
          map.removeLayer(layer);
        }
      });
      
      const userLocation = currentLocationRef.current;
      if (!userLocation) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const newUserLocation = [latitude, longitude];
              currentLocationRef.current = newUserLocation;
              setCurrentLocation(newUserLocation);
              createRoute(newUserLocation, destination);
            }
          );
        }
        return;
      }
      createRoute(userLocation, destination);
    };


    function buildGraph() {
      const graph = {};
      
      // Initialize all intersection points in the graph
      intersectionPoints.forEach(ip => {
        const key = JSON.stringify(ip);
        if (!graph[key]) {
          graph[key] = [];
        }
      });
      
      // Add all path connections to the graph
      pathPairs.forEach(pair => {
        const [a, b] = pair;
        const keyA = JSON.stringify(a);
        const keyB = JSON.stringify(b);
        
        // Make sure both points exist in the graph
        if (!graph[keyA]) graph[keyA] = [];
        if (!graph[keyB]) graph[keyB] = [];
        
        const dist = getDistance(a, b);
        
        // Check if this connection already exists
        const existsAtoB = graph[keyA].some(n => n.node === keyB);
        const existsBtoA = graph[keyB].some(n => n.node === keyA);
        
        if (!existsAtoB) {
          graph[keyA].push({ node: keyB, weight: dist });
        }
        
        if (!existsBtoA) {
          graph[keyB].push({ node: keyA, weight: dist });
        }
      });
      
      // Add connections to nearby nodes to improve connectivity
      const maxDistance = 25; // Maximum distance in meters to consider nodes as connected (increased from 20)
      
      intersectionPoints.forEach(pointA => {
        const keyA = JSON.stringify(pointA);
        
        intersectionPoints.forEach(pointB => {
          if (pointA === pointB) return;
          
          const keyB = JSON.stringify(pointB);
          const dist = getDistance(pointA, pointB);
          
          // If points are very close but not connected, add a connection
          if (dist < maxDistance) {
            const existsAtoB = graph[keyA].some(n => n.node === keyB);
            
            if (!existsAtoB) {
              graph[keyA].push({ node: keyB, weight: dist });
              graph[keyB].push({ node: keyA, weight: dist });
            }
          }
        });
      });
      
      // Add connections for all pathPairs to ensure they're in the graph
      pathPairs.forEach(pair => {
        // Find the nearest intersection points for each point in the pair
        const [a, b] = pair;
        const nearestToA = findNearestIntersection(a);
        const nearestToB = findNearestIntersection(b);
        
        if (nearestToA && nearestToB) {
          const keyA = JSON.stringify(nearestToA);
          const keyB = JSON.stringify(nearestToB);
          
          if (keyA !== keyB) {
            const dist = getDistance(nearestToA, nearestToB);
            
            // Check if this connection already exists
            const existsAtoB = graph[keyA].some(n => n.node === keyB);
            
            if (!existsAtoB) {
              graph[keyA].push({ node: keyB, weight: dist });
              graph[keyB].push({ node: keyA, weight: dist });
            }
          }
        }
      });
      
      return graph;
    }

    // Improved findNearestIntersection function
    function findNearestIntersection(point) {
      let minDist = Infinity, nearest = null;
      intersectionPoints.forEach(ip => {
        const dist = getDistance(point, ip);
        if (dist < minDist) {
          minDist = dist;
          nearest = ip;
        }
      });
      return nearest;
    }

    const createRoute = (userLocation, destination, destinationName = "") => {

      // Limpiar rutas y popups anteriores
      if (routingControl) {
        map.removeControl(routingControl);
        setRoutingControl(null);
      }
      map.closePopup();

      // Remover rutas previas
      if (lastRoute) {
        mapRef.current.removeLayer(lastRoute);
        lastRoute = null;
      }

      // Remover polylines antiguas
      map.eachLayer(layer => {
        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
          map.removeLayer(layer);
        }
      });

      // Remover marcador previo del destino
      if (lastDestinationMarker) {
        mapRef.current.removeLayer(lastDestinationMarker);
        lastDestinationMarker = null;
      }

      // Encontrar nodo más cercano de inicio y fin
      const startNode = findNearestIntersection(userLocation);
      const endNode = findNearestIntersection(destination);

      const graph = buildGraph();
      let pathNodes = dijkstra(graph, JSON.stringify(startNode), JSON.stringify(endNode));

      // Intentar rutas alternativas si es necesario
      if (pathNodes.length <= 1) {
        const allPaths = [];
        const connectedNodes = Object.keys(graph)
          .map(key => ({ key, connections: graph[key].length }))
          .sort((a, b) => b.connections - a.connections)
          .slice(0, 10)
          .map(item => JSON.parse(item.key));

        for (const midNode of connectedNodes) {
          const midNodeKey = JSON.stringify(midNode);
          const pathToMid = dijkstra(graph, JSON.stringify(startNode), midNodeKey);
          const pathFromMid = dijkstra(graph, midNodeKey, JSON.stringify(endNode));

          if (pathToMid.length > 1 && pathFromMid.length > 1) {
            pathFromMid.shift();
            const fullPath = [...pathToMid, ...pathFromMid];

            const totalDist = fullPath.reduce((acc, val, idx, arr) =>
              idx ? acc + getDistance(arr[idx - 1], val) : acc, 0
            );
            allPaths.push({ path: fullPath, distance: totalDist });
          }
        }

        if (allPaths.length > 0) {
          allPaths.sort((a, b) => a.distance - b.distance);
          pathNodes = allPaths[0].path;
        }

        // Eliminar puntos ya recorridos
        while (pathNodes.length && getDistance(userLocation, pathNodes[0]) < 10) {
          pathNodes.shift();
        }
      }

      // Agresivo: usar nodos centrales
      if (pathNodes.length <= 1) {
        const centralNodes = [
          [20.654214, -100.405725],
          [20.655093, -100.404981],
          [20.654126, -100.404952],
          [20.655531, -100.405378],
          [20.654872, -100.406180],
          [20.653815, -100.404486],
          [20.656291, -100.405180]
        ].map(n => JSON.stringify(n));

        for (const mid1 of centralNodes) {
          for (const mid2 of centralNodes) {
            if (mid1 === mid2) continue;
            const path1 = dijkstra(graph, JSON.stringify(startNode), mid1);
            const path2 = dijkstra(graph, mid1, mid2);
            const path3 = dijkstra(graph, mid2, JSON.stringify(endNode));
            if (path1.length > 1 && path2.length > 1 && path3.length > 1) {
              path2.shift();
              path3.shift();
              pathNodes = [...path1, ...path2, ...path3];
              break;
            }
          }
          if (pathNodes.length > 1) break;
        }
      }

      // Si sigue sin ruta, línea directa
      if (pathNodes.length <= 1) {
        console.log("No path found, using direct line");

        lastRoute = L.polyline([startNode, endNode], {
          color: '#FF5733',
          weight: 6,
          opacity: 0.9,
          dashArray: '10, 10'
        }).addTo(map);

        lastDestinationMarker = L.marker(destination, {
          icon: new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [20, 32],
            iconAnchor: [10, 32],
            popupAnchor: [1, -28],
            shadowSize: [32, 32]
          })
        }).addTo(map).bindPopup(destinationName);

        map.fitBounds(L.latLngBounds([userLocation, startNode, endNode, destination]), { padding: [50, 50] });
        return;
      }

      // Ruta peatonal encontrada
      console.log("Found path with nodes:", pathNodes.length);

      lastRoute = L.polyline(pathNodes, {
        color: '#FF5733',
        weight: 6,
        opacity: 1
      }).addTo(map);

      // Marcador destino único
      lastDestinationMarker = L.marker(destination, {
        icon: new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [20, 32],
          iconAnchor: [10, 32],
          popupAnchor: [1, -28],
          shadowSize: [32, 32]
        })
      }).addTo(map).bindPopup(destinationName);

      // Líneas hasta destino
      L.polyline([userLocation, pathNodes[0]], {
        color: '#FF5733',
        weight: 6,
        opacity: 1,
        dashArray: '5, 10'
      }).addTo(map);

      L.polyline([pathNodes[pathNodes.length - 1], destination], {
        color: '#FF5733',
        weight: 6,
        opacity: 1,
        dashArray: '5, 10'
      }).addTo(map);

      map.fitBounds(L.latLngBounds([userLocation, ...pathNodes, destination]), { padding: [50, 50] });

      // Guardar información de la ruta actual para el seguimiento
      window.currentPathNodes = [...pathNodes];
      window.currentDestination = destination;
      window.destinationLine = null;
      
      const instrucciones = generateInstructions(userLocation, pathNodes);
      const remainingDistance = pathNodes.reduce((acc, val, idx, arr) =>
        idx ? acc + getDistance(arr[idx - 1], val) : acc + getDistance(userLocation, val), 0
      ) + getDistance(pathNodes[pathNodes.length - 1], destination);

      const ETA = formatETA(remainingDistance / 1.4);
      instrucciones.push(`🕒 Tiempo estimado total: ${ETA}`);
      setMyInstructions(instrucciones);
    };

    window.clearRoute = () => {
      if (routingControl) {
        map.removeControl(routingControl);
        setRoutingControl(null);
        map.closePopup();
      }
      
      // Limpiar variables de seguimiento
      window.currentPathNodes = null;
      window.currentDestination = null;
      if (window.destinationLine) {
        mapRef.current.removeLayer(window.destinationLine);
        window.destinationLine = null;
      }
    };

    const handleError = (error) => {
      console.error("Error de geolocalización:", error);

      const defaultLocation = [20.656338, -100.405114];
      map.setView(defaultLocation, 17);
      L.marker(defaultLocation)
        .addTo(map)
        .bindPopup("Campus UTQ")
        .openPopup();
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showCurrentPosition, handleError);
    } else {
      handleError({ message: "Geolocation not supported" });
    }

    const center = [20.656338, -100.405114];
    const zoom = 17;
    map.setView(center, zoom);

    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: 'Google Maps',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20
    }).addTo(map);

    const createCustomPopup = (loc) => {
      return `
        <div style="width: 280px; font-family: Arial, sans-serif;">
          <div style="position: relative;">
            <img src="${loc.image}" alt="${loc.title}" 
                 style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px 8px 0 0;" 
                 onerror="this.src='https://via.placeholder.com/300x180?text=Imagen+No+Disponible'">
            <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">
              📍 ${loc.title}
            </div>
          </div>
          <div style="padding: 10px; background: white; border-radius: 0 0 8px 8px;">
            <h3 style="margin: 0 0 6px 0; color: #2c3e50; font-size: 14px; font-weight: bold;">
              ${loc.title}
            </h3>
            <p style="margin: 0 0 6px 0; color: #7f8c8d; font-size: 12px; line-height: 1.3;">
              ${loc.description}
            </p>
            <div style="border-top: 1px solid #ecf0f1; padding-top: 6px; margin-top: 6px;">
              <div style="margin-bottom: 4px;">
                <span style="color: #3498db; font-weight: bold; font-size: 11px;">ℹ️ Info:</span>
                <span style="color: #2c3e50; font-size: 11px;">${loc.details}</span>
              </div>
              <div>
                <span style="color: #e74c3c; font-weight: bold; font-size: 11px;">📞 Contacto:</span>
                <span style="color: #2c3e50; font-size: 11px;">${loc.contact}</span>
              </div>
            </div>
            <div style="margin-top: 8px; display: flex; justify-content: space-between; gap: 4px;">
              <button onclick="showRouteToLocation([${loc.latitude}, ${loc.longitude}], '${loc.title}')" 
                      style="flex: 1; background: #3498db; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                🗺️ Ruta
              </button>
              <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}', '_blank')" 
                      style="flex: 1; background: #9b59b6; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                🌐 Maps
              </button>
              <button onclick="navigator.share ? navigator.share({title: '${loc.title}', text: '${loc.description}', url: window.location.href}) : alert('Compartir no disponible')" 
                      style="flex: 1; background: #2ecc71; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                📤 Share
              </button>
            </div>
          </div>
        </div>
      `;
    };

    window.showRouteToLocation = (destination, destinationName) => {
      // If user location is available, use it as starting point
      if (currentLocationRef.current) {
        //startTracking();
        const userLocation = currentLocationRef.current;
        
        // Open Google Maps with directions
        const startStr = `${userLocation[0]},${userLocation[1]}`;
        const endStr = `${destination[0]},${destination[1]}`;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${startStr}&destination=${endStr}&travelmode=walking`;
        
        // Create a popup with options
        L.popup()
          .setLatLng(destination)
          .setContent(`
            <div style="max-width: 300px; font-family: Arial, sans-serif;">
              <h4 style="margin: 0 0 8px 0;">Ruta hacia ${destinationName}</h4>
              <p style="margin: 0 0 12px 0;">Selecciona cómo quieres ver la ruta:</p>
              <div style="display: flex; gap: 8px; flex-direction: column;">
                <button onclick="window.open('${url}', '_blank')" 
                        style="background: #3498db; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 13px; width: 100%;">
                  🗺️ Abrir en Google Maps
                </button>
                <button onclick="showPathOnMap([${userLocation}], [${destination}], '${destinationName}')" 
                        style="background: #2ecc71; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 13px; width: 100%;">
                  📍 Mostrar línea directa en el mapa
                </button>
                <button onclick="showRoute([${destination}], '${destinationName}')" 
                        style="background: #e67e22; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 13px; width: 100%;">
                  🚶 Mostrar ruta por caminos peatonales
                </button>
              </div>
            </div>
          `)
          .openOn(map);
      } else {
        // If user location is not available, request it
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const userLocation = [latitude, longitude];
              currentLocationRef.current = userLocation;
              setCurrentLocation(userLocation);
              
              // Recursively call this function now that we have the location
              window.showRouteToLocation(destination, destinationName);
            },
            (error) => {
              console.error("Error getting location:", error);
              alert("No se pudo obtener tu ubicación. Verifica los permisos de ubicación en tu navegador.");
            }
          );
        } else {
          alert("Tu navegador no soporta geolocalización.");
        }
      }
    };
    
    // Make showRoute available globally
    window.showRoute = showRoute;
    
    // Function to show a simple path on the map
    window.showPathOnMap = (start, end, destinationName) => {
      if (routingControl) {
        map.removeControl(routingControl);
        setRoutingControl(null);
        map.closePopup();
        const existingContainers = document.querySelectorAll('.leaflet-routing-container');
        existingContainers.forEach(container => container.remove());
      }
      
      // Draw a direct line between points
      /*const pathLine = L.polyline([start, end], {
        color: '#2980b9',
        weight: 6,
        opacity: 0.9
      }).addTo(map);*/
      
      // Add markers for start and end points
      L.marker(start, {
        icon: new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [20, 32],
          iconAnchor: [10, 32],
          popupAnchor: [1, -28],
          shadowSize: [32, 32]
        })
      }).addTo(map).bindPopup("Punto de inicio");
      
      L.marker(end, {
        icon: new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [20, 32],
          iconAnchor: [10, 32],
          popupAnchor: [1, -28],
          shadowSize: [32, 32]
        })
      }).addTo(map).bindPopup(destinationName);
      
      // Fit the map to show the entire route
      map.fitBounds(L.latLngBounds([start, end]), { padding: [50, 50] });
      
      // Calculate approximate distance
      const distance = getDistance(start, end);
      
      // Show route information in a popup
      L.popup()
        .setLatLng([(start[0] + end[0])/2, (start[1] + end[1])/2])
        .setContent(`
          <div style="max-width: 300px">
            <h4 style="margin: 0 0 8px 0;">Ruta directa hacia ${destinationName}</h4>
            <p style="margin: 0 0 8px 0;">Distancia aproximada: ${(distance / 1000).toFixed(2)} km</p>
            <p style="margin: 0;">Esta es una línea directa. Para rutas más precisas, usa Google Maps.</p>
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&travelmode=walking', '_blank')" 
                    style="margin-top: 10px; background: #3498db; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">
              🗺️ Ver ruta detallada en Google Maps
            </button>
          </div>
        `)
        .openOn(map);
    };

    map.on('click', function(e) {
      if (!DEBUG_MODE) return;

      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      const coordsString = `[${lat}, ${lng}]`;

      L.popup()
        .setLatLng(e.latlng)
        .setContent(`
          <div style="font-family: Arial, sans-serif;">
            <b>Coordenadas del punto:</b><br>
            Latitud: ${lat}<br>
            Longitud: ${lng}<br>
            <div style="margin-top: 8px;">
              <input type="text" value="${coordsString}" 
                    readonly 
                    style="width: 200px; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
              <button onclick="navigator.clipboard.writeText('${coordsString}'); this.innerHTML='✓ Copiado'; setTimeout(() => this.innerHTML='📋 Copiar', 1000);" 
                      style="margin-left: 4px; padding: 4px 8px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                📋 Copiar
              </button>
            </div>
          </div>
        `)
        .openOn(map);
    });

    const campusBoundary = L.polygon([
      [20.653705, -100.407463],
      [20.659572, -100.406165],
      [20.659045, -100.402758],
      [20.653130, -100.403805]
    ], {
      color: '#3498db',
      weight: 2,
      fillOpacity: 0.1
    }).addTo(map);

    const outerBounds = [
      [[90, -180], [90, 180], [-90, 180], [-90, -180]],
      [[20.653705, -100.407463],
       [20.653130, -100.403805],
       [20.659045, -100.402758],
       [20.659572, -100.406165]]
    ];

    L.polygon(outerBounds, {
      color: 'transparent',
      fillColor: '#000',
      fillOpacity: 0.2
    }).addTo(map);

    map.fitBounds(campusBoundary.getBounds());

    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: 'Google Maps',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20,
      bounds: campusBoundary.getBounds()
    }).addTo(map);

    const campusLocations = locations.filter(loc => {
      const point = L.latLng(loc.latitude, loc.longitude);
      return campusBoundary.getBounds().contains(point);
    });

    campusLocations.forEach(loc => {
      L.marker([loc.latitude, loc.longitude], {
        icon: new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [20, 32],
          iconAnchor: [10, 32],
          popupAnchor: [1, -28],
          shadowSize: [32, 32]
        })
      })
        .addTo(map)
        .bindPopup(createCustomPopup(loc), {
          maxWidth: 340,
          className: 'custom-popup'
        });
    });

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(document.getElementById("map"));

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      resizeObserver.disconnect();
      if (routingControl) {
        map.removeControl(routingControl);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Función para remover segmentos ya recorridos
  function removePassedSegments(userLocation, pathNodes) {
    const PROXIMITY_THRESHOLD = 15; // 15 metros de tolerancia
    
    // Encontrar el punto más cercano en la ruta
    let closestIndex = 0;
    let minDistance = Infinity;
    
    pathNodes.forEach((node, index) => {
      const distance = getDistance(userLocation, node);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    // Si el usuario está muy cerca de un nodo, remover todos los nodos anteriores
    if (minDistance < PROXIMITY_THRESHOLD) {
      return pathNodes.slice(closestIndex + 1);
    }
    
    // Si el usuario está entre dos nodos, remover los nodos anteriores
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const distanceToSegment = getDistanceToLineSegment(userLocation, pathNodes[i], pathNodes[i + 1]);
      if (distanceToSegment < PROXIMITY_THRESHOLD) {
        return pathNodes.slice(i + 1);
      }
    }
    
    return pathNodes;
  }

  // Función para calcular distancia de un punto a un segmento de línea
  function getDistanceToLineSegment(point, lineStart, lineEnd) {
    const A = point[0] - lineStart[0];
    const B = point[1] - lineStart[1];
    const C = lineEnd[0] - lineStart[0];
    const D = lineEnd[1] - lineStart[1];
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = lineStart[0];
      yy = lineStart[1];
    } else if (param > 1) {
      xx = lineEnd[0];
      yy = lineEnd[1];
    } else {
      xx = lineStart[0] + param * C;
      yy = lineStart[1] + param * D;
    }
    
    return getDistance(point, [xx, yy]);
  }

return (
    <>
      {/* Estilos globales del componente */}
      <style>
        {`
          /* Estilos del popup personalizado */
          .custom-popup .leaflet-popup-content-wrapper {
            padding: 0;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            max-width: min(350px, 90vw);
            backdrop-filter: blur(10px);
          }
          .custom-popup .leaflet-popup-content {
            margin: 0;
            line-height: 1.4;
            width: auto !important;
            font-size: clamp(12px, 2.5vw, 14px);
          }
          .custom-popup .leaflet-popup-tip {
            background: white;
          }

          /* Estilos del contenedor de rutas */
          .leaflet-routing-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            max-width: min(400px, 90vw);
            font-size: clamp(11px, 2vw, 13px);
            color: #333 !important;
            backdrop-filter: blur(10px);
          }
          .leaflet-routing-container h2 {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            margin: 0;
            padding: clamp(8px, 2vw, 12px);
            border-radius: 12px 12px 0 0;
            font-size: clamp(12px, 2.5vw, 14px);
            font-weight: 600;
          }
          .leaflet-routing-alt {
            color: #333 !important;
          }
          .leaflet-routing-alt table {
            color: #333 !important;
          }
          .leaflet-routing-alt tr:hover {
            background-color: rgba(59, 130, 246, 0.1) !important;
            color: #333 !important;
          }
          .leaflet-routing-icon {
            filter: brightness(0.3) !important;
          }

          /* Controles del mapa */
          .leaflet-touch .leaflet-control-layers,
          .leaflet-touch .leaflet-bar {
            border: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            border-radius: 8px;
          }
          .leaflet-control-zoom a {
            width: clamp(28px, 5vw, 34px) !important;
            height: clamp(28px, 5vw, 34px) !important;
            line-height: clamp(28px, 5vw, 34px) !important;
            font-size: clamp(14px, 3vw, 18px);
            border-radius: 6px;
          }

          /* Responsividad para dispositivos móviles */
          @media (max-width: 768px) {
            .leaflet-control-zoom {
              margin-bottom: 80px !important;
              margin-right: 10px !important;
            }
            .leaflet-control-scale {
              margin-bottom: 25px !important;
              margin-left: 10px !important;
            }
          }

          /* Responsividad para tablets */
          @media (min-width: 769px) and (max-width: 1024px) {
            .leaflet-control-zoom {
              margin-bottom: 60px !important;
            }
          }

          /* Responsividad para pantallas grandes */
          @media (min-width: 1920px) {
            .leaflet-control-zoom a {
              width: 40px !important;
              height: 40px !important;
              line-height: 40px !important;
              font-size: 20px;
            }
          }
        `}
      </style>

      {/* Contenedor principal del mapa */}
      <div className="map-container">
        {/* Header con título y botón de regreso */}
        <header className="map-header">
          <h1 className="map-title">Mapa</h1>
          <button
            onClick={() => navigate('/')}
            className="back-button"
            aria-label="Volver al inicio"
          >
            <span className="back-icon">⬅</span>
            <span className="back-text">Volver</span>
          </button>
        </header>

        {/* Sistema de notificaciones */}
        <ToastContainer
          position="top-center"
          className="toast-container"
          toastClassName="toast"
          progressClassName="toast-progress"
          closeButton={({ closeToast }) => (
            <button 
              className="toast-close-button" 
              onClick={closeToast}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          )}
        />

        {/* Ventana flotante de instrucciones */}
        {myInstructions.length > 0 && (
          <aside className="floating-instructions">
            <div className="floating-content">
              {/* ETA destacado */}
              {myInstructions.length > 0 && myInstructions[myInstructions.length - 1].includes('🕒') && (
                <div className="floating-eta">
                  <div className="eta-content">
                    {myInstructions[myInstructions.length - 1]}
                  </div>
                </div>
              )}
              
              {/* Header de instrucciones */}
              <header className="floating-header">
                <h3 className="floating-title">
                  <span className="floating-icon">📍</span>
                  Navegación
                </h3>
              </header>
              
              {/* Lista de instrucciones */}
              <div className="floating-body">
                <ol className="floating-list">
                  {myInstructions.slice(0, -1).map((step, idx) => (
                    <li key={idx} className="floating-item">
                      <span className="floating-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>
        )}

        {/* Área principal del mapa */}
        <main className="map-main">
          <div id="map" className="map-element" />
          <div id="map-loading" className="map-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando mapa...</p>
          </div>
        </main>

        <EventsList 
          activeList={activeList}
          setActiveList={setActiveList}
        />
        <BuildingList 
          activeList={activeList} 
          setActiveList={setActiveList} 
        />

        <button 
          className="floating-button"
          onClick={() => setActiveList(activeList === 'events' ? null : 'events')}
          aria-label="Mostrar u ocultar eventos"
        >
        📅
        </button>
        
      </div>
    </>
  );

}

export default MapComponent;


// Utility: Calculate distance between two points (Haversine formula)
function getDistance(a, b) {
  const toRad = x => x * Math.PI / 180;
  const R = 6371e3;
  const lat1 = toRad(a[0]), lat2 = toRad(b[0]);
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const A = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
  const C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1-A));
  return R * C;
}

function dijkstra(graph, start, end) {
  const queue = new Set(Object.keys(graph));
  const distances = {};
  const prev = {};
  
  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
    prev[node] = null;
  });
  distances[start] = 0;

  while (queue.size > 0) {
    let minNode = null;
    queue.forEach(node => {
      if (minNode === null || distances[node] < distances[minNode]) {
        minNode = node;
      }
    });
    
    if (minNode === end) break;
    if (minNode === null) break; // No path found
    
    queue.delete(minNode);

    if (distances[minNode] === Infinity) break; // Unreachable node

    if (graph[minNode]) {
      graph[minNode].forEach(neighbor => {
        const alt = distances[minNode] + neighbor.weight;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          prev[neighbor.node] = minNode;
        }
      });
    }
  }

  const path = [];
  let curr = end;
  
  // Check if end is reachable
  if (prev[curr] === null && curr !== start) {
    console.log("No path found between", start, "and", end);
    return [];
  }
  
  while (curr) {
    try {
      path.unshift(JSON.parse(curr));
      curr = prev[curr];
    } catch (e) {
      console.error("Error parsing node:", curr, e);
      break;
    }
  }
  
  return path;
}

function formatETA(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min} min ${sec < 10 ? '0' : ''}${sec} s`;
}
