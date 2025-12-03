export default function PrivacyPolicy() {
  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "auto" }}>
      <h1>Política de Privacidad - MapaTrue</h1>

      <p>
        MapaTrue es una aplicación que permite visualizar ubicaciones, trazar rutas y navegar dentro de un área.
        Esta Política de Privacidad explica cómo tratamos la información relacionada con tu uso de la aplicación.
      </p>

      <p>
        Al instalar o utilizar MapaTrue, aceptas esta Política de Privacidad. Si no estás de acuerdo, por favor
        desinstala la aplicación o deja de usar el servicio.
      </p>

      <h2>1. Responsable del Tratamiento de Datos</h2>
      <p><strong>Responsable:</strong> Luis Antonio Sánchez García</p>
      <p><strong>Correo de contacto:</strong> <a href="mailto:luiszenzo2@gmail.com">luiszenzo2@gmail.com</a></p>

      <h2>2. Información que recopilamos</h2>
      <p>MapaTrue no solicita información personal como nombre, teléfono, dirección o correo electrónico.</p>

      <h3>2.1 Permisos del dispositivo utilizados</h3>
      <ul>
        <li>ACCESS_FINE_LOCATION: Permite la ubicación precisa para navegación.</li>
        <li>ACCESS_COARSE_LOCATION: Permite la ubicación aproximada cuando no se requiere precisión alta.</li>
        <li>INTERNET: Permite cargar mapas y rutas.</li>
      </ul>

      <p><strong>Nota:</strong> La aplicación <strong>no</strong> utiliza ubicación en segundo plano. La ubicación solo se usa mientras la aplicación está visible y activa.</p>

      <h3>2.2 Información técnica</h3>
      <ul>
        <li>Modelo del dispositivo</li>
        <li>Versión del sistema operativo</li>
        <li>Idioma del sistema</li>
        <li>Datos de rendimiento y caché</li>
      </ul>

      <h3>2.3 Uso de Leaflet y proveedor de mapas</h3>
      <p>
        MapaTrue utiliza la librería <strong>Leaflet</strong> para mostrar mapas. Leaflet no recopila información personal del usuario.
        Sin embargo, el proveedor del mapa (por ejemplo, OpenStreetMap) puede recibir datos técnicos como:
      </p>
      <ul>
        <li>Dirección IP</li>
        <li>Tipo de navegador</li>
        <li>Zona aproximada derivada de conexión</li>
      </ul>

      <p>Política de privacidad de OpenStreetMap: <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy">https://wiki.osmfoundation.org/wiki/Privacy_Policy</a></p>

      <h2>3. Finalidad del Tratamiento</h2>
      <ul>
        <li>Mostrar la ubicación en el mapa.</li>
        <li>Calcular rutas y navegación.</li>
        <li>Mejorar la precisión del posicionamiento.</li>
        <li>Optimizar el funcionamiento de la aplicación.</li>
      </ul>

      <p>No utilizamos información para publicidad, marketing ni perfiles.</p>

      <h2>4. Seguridad</h2>
      <p>La ubicación no se almacena. La transferencia de datos del mapa se realiza mediante cifrado HTTPS.</p>

      <h2>5. Derechos del Usuario</h2>
      <p>Puedes desactivar permisos desde Ajustes → Aplicaciones → MapaTrue → Permisos.</p>
      <p>Para solicitar eliminación de datos temporales, escribe a: <a href="mailto:luiszenzo2@gmail.com">luiszenzo2@gmail.com</a></p>

      <h2>6. Menores de Edad</h2>
      <p>MapaTrue no está destinada a menores de 18 años.</p>

      <h2>7. Cambios en la Política</h2>
      <p>Podemos actualizar esta política y los cambios se publicarán aquí.</p>

      <h2>8. Contacto</h2>
      <p>Correo: <a href="mailto:luiszenzo2@gmail.com">luiszenzo2@gmail.com</a></p>
    </div>
  );
}
