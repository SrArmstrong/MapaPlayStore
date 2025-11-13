import AMBIENTAL from './assets/AMBIENTAL.jpeg';
import AUDITORIO from './assets/AUDITORIO.jpeg';
import BIBLIOTECA from './assets/BIBLIOTECA.jpeg';
import CAFETERIA from './assets/CAFETERIA.jpeg';
import EDIFICIOC from './assets/EDIFICIOC.jpeg';
import EDIFICIOD from './assets/EDIFICIOD.jpeg';
import EDIFICIOE from './assets/EDIFICIOE.jpeg';
import EDIFICIOF from './assets/EDIFICIOF.jpeg';
import EDIFICIOG from './assets/EDIFICIOG.jpeg';
import EDIFICIOK from './assets/EDIFICIOK.jpeg';
import HUB from './assets/HUB.jpeg';
import IDIOMAS from './assets/IDIOMAS.jpeg';
import LABORATORIOI from './assets/LABORATORIOI.jpeg';
import LABORATORIOJ from './assets/LABORATORIOJ.jpeg';
import NANOTECNOLOGIA from './assets/NANOTECNOLOGIA.jpeg';
import RECTORIA from './assets/RECTORIA.jpeg';


// location.js
const locations = [
    { 
      latitude: 20.6532215, 
      longitude: -100.4040249, 
      title: 'Entrada principal', 
      description: 'Acceso principal',
      image: '',
      details: 'Acceso principal para estudiantes y visitantes',
      contact: 'Vigilancia: ext. 1001',
      codigo: ''
    },
    { 
      latitude: 20.653641, 
      longitude: -100.403734, 
      title: 'Entrada Norte', 
      description: 'Acceso peatonal norte',
      image: '',
      details: 'Acceso peatonal. Horario: 6:00 AM - 10:00 PM',
      contact: 'Vigilancia: ext. 1001',
      codigo: 'Entrada Pie de la Cuesta'
    },
    {
      latitude: 20.654754,
      longitude: -100.405005,
      title: 'Cafetería',
      description: 'Zona de alimentos',
      image: CAFETERIA,
      details: 'Cafetería estudiantil. Horario: 7:00 AM - 8:00 PM',
      contact: 'Administración campus: ext. 1010',
      codigo: 'Edificio N'
    },
    { 
      latitude: 20.653340, 
      longitude: -100.405064, 
      title: 'Entrada Este', 
      description: 'Acceso peatonal este',
      image: '',
      details: 'Acceso peatonal. Horario: 6:00 AM - 10:00 PM',
      contact: 'Vigilancia: ext. 1001',
      codigo: ''
    },
    { 
      latitude: 20.653506, 
      longitude: -100.406118, 
      title: 'Entrada Sureste', 
      description: 'Acceso peatonal sureste',
      image: '',
      details: 'Acceso peatonal. Horario: 6:00 AM - 10:00 PM',
      contact: 'Vigilancia: ext. 1001',
      codigo: ''
    },
    { 
      latitude: 20.653676, 
      longitude: -100.407223, 
      title: 'Entrada Sur', 
      description: 'Acceso peatonal sur',
      image: '',
      details: 'Acceso peatonal. Horario: 6:00 AM - 10:00 PM',
      contact: 'Vigilancia: ext. 1001',
      codigo: ''
    },
    { 
      latitude: 20.655536, 
      longitude: -100.406992, 
      title: 'Entrada Central', 
      description: 'Acceso central',
      image: '',
      details: 'Acceso vehicular y peatonal. Horario: 24 horas',
      contact: 'Vigilancia: ext. 1001',
      codigo: ''
    },
    { 
      latitude: 20.656298, 
      longitude: -100.403203, 
      title: 'Entrada Noreste', 
      description: 'Acceso noreste',
      image: '',
      details: 'Acceso peatonal. Horario: 6:00 AM - 10:00 PM',
      contact: 'Vigilancia: ext. 1001',
      codigo: ''
    },
    { 
      latitude: 20.656935, 
      longitude: -100.403092, 
      title: 'Entrada Norte Superior', 
      description: 'Acceso norte superior',
      image: '',
      details: 'Acceso peatonal. Horario: 6:00 AM - 10:00 PM',
      contact: 'Vigilancia: ext. 1001',
      codigo: ''
    },
    { 
      latitude: 20.653954,
      longitude: -100.404525,
      title: 'Laboratorio de procesos industriales',
      description: 'Laboratorio especializado',
      image: EDIFICIOD,
      details: 'Prácticas y desarrollo de procesos industriales',
      contact: 'Tel: ext. 4003',
      codigo: 'Edificio D'
    },
    { 
      latitude: 20.6538499, 
      longitude: -100.4039148, 
      title: 'Laboratorio de mantenimiento industrial', 
      description: 'Laboratorio especializado',
      image: EDIFICIOE,
      details: 'Prácticas de mantenimiento industrial',
      contact: 'Tel: ext. 2002',
      codigo: 'Edificio E'
    },
    { 
      latitude: 20.6543228, 
      longitude: -100.4046271, 
      title: 'División de Tecnologías de Automatización e Información', 
      description: 'División de Tecnologías de Automatización e Información',
      image: EDIFICIOK,
      details: 'Carreras: Ing. en Sistemas, Mecatrónica, TIC',
      contact: 'Tel: (442) 274-9000 ext. 2001',
      codigo: 'Edificio K'
    },
    {
      latitude: 20.654917,
      longitude: -100.404439,
      title: "Laboratorio de Sistemas Informáticos",
      description: "Espacio académico especializado en tecnologías de la información",
      image: LABORATORIOI,
      details: "Áreas: Desarrollo de software, redes, bases de datos",
      contact: "Tel: (442) 274-9000 ext. 2002",
      codigo: 'Edificio I'
    },
    { 
      latitude: 20.6541214, 
      longitude: -100.4041198, 
      title: 'Módulo Sanitario 1', 
      description: 'Servicios sanitarios',
      image: '',
      details: 'Disponible 24/7',
      contact: 'Mantenimiento: ext. 1050',
      codigo: 'Edificio O'
    },
    { 
      latitude: 20.6543096, 
      longitude: -100.4054418, 
      title: 'Rectoría', 
      description: 'Tramites institucionales',
      image: RECTORIA,
      details: 'Horario: Lunes a Viernes 8:00 AM - 4:00 PM',
      contact: 'Tel: (442) 274-9000 ext. 1000',
      codigo: 'Edificio A'
    },
    { 
      latitude: 20.6540485, 
      longitude: -100.4060981, 
      title: 'Vinculación escolar', 
      description: 'Student Talent HUB',
      image: HUB,
      details: 'Servicios: Inscripciones, Becas, Titulación',
      contact: 'Tel: (442) 274-9000 ext. 1200',
      codigo: 'Edificio B'
    },
    { 
      latitude: 20.6549875, 
      longitude: -100.4062969, 
      title: 'Edificio De Medios', 
      description: 'División Idiomas',
      image: IDIOMAS,
      details: 'Idiomas: Inglés, Francés, Alemán',
      contact: 'Tel: (442) 274-9000 ext. 3001',
      codigo: 'Edificio L'
    },
    { 
      latitude: 20.6544725, 
      longitude: -100.4041274, 
      title: 'División Industrial', 
      description: 'Edificio F',
      image: EDIFICIOF,
      details: 'Carreras: Ing. Industrial, Procesos Industriales',
      contact: 'Tel: (442) 274-9000 ext. 4001',
      codigo: 'Edificio F'
    },
    {
      latitude: 20.655357,
      longitude: -100.404595,
      title: 'División de Tecnología Ambiental',
      description: 'Área académica dedicada a tecnologías sustentables',
      image: AMBIENTAL,
      details: 'Instalaciones académicas. Horario: 8:00 AM - 7:00 PM',
      contact: 'Coordinación académica: ext. 1025',
      codigo: 'Edificio H'
    },
    { 
      latitude: 20.653774,
      longitude: -100.405160,
      title: 'División Económica-Administrativa',
      description: 'División de carreras administrativas y económicas',
      image: EDIFICIOC,
      details: 'Carreras: Administración, Contabilidad, Negocios',
      contact: 'Tel: ext. 5000',
      codigo: 'Edificio C'
    },
    { 
      latitude: 20.654914,
      longitude: -100.403825,
      title: 'Biblioteca',
      description: 'Biblioteca central',
      image: BIBLIOTECA,
      details: 'Horario: Lunes a Viernes 8:00 AM - 8:00 PM',
      contact: 'Tel: ext. 6000',
      codigo: 'Edificio M'
    },
    { 
      latitude: 20.655227,
      longitude: -100.405485,
      title: 'Laboratorios de mecatrónica y TICs',
      description: 'Laboratorios especializados',
      image: LABORATORIOJ,
      details: 'Prácticas de mecatrónica y tecnologías de información',
      contact: 'Tel: ext. 2003',
      codigo: 'Edificio J'
    },
    { 
      latitude: 20.655563,
      longitude: -100.403884,
      title: 'Desarrollo de Negocios',
      description: '',
      image: EDIFICIOG,
      details: 'Aulas y oficinas administrativas',
      contact: 'Tel: ext. 5001',
      codigo: 'Edificio G'
    },
    { 
      latitude: 20.656080,
      longitude: -100.403857,
      title: 'Área de mantenimiento y almacenamiento',
      description: 'Almacen general y taller de mantenimiento',
      image: '',
      details: 'Horario: Lunes a Viernes 7:00 AM - 3:00 PM',
      contact: 'Tel: ext. 1100',
      codigo: 'Edificio R'
    },
    { 
      latitude: 20.656449,
      longitude: -100.405512,
      title: 'Cancha de Basquetbol',
      description: 'Área deportiva',
      image: '',
      details: 'Horario: 7:00 AM - 8:00 PM',
      contact: 'Deportes: ext. 8001',
      codigo: ''
    },
    { 
      latitude: 20.657298,
      longitude: -100.403444,
      title: 'Centro de Productividad e Innovación para la Industria 4.0',
      description: 'Centro de Productividad e Innovación para la Industria 4.0',
      image: '',
      details: 'Centro especializado en tecnologías de Industria 4.0',
      contact: 'Tel: ext. 7000',
      codigo: 'CIC 4.0'
    },
    { 
      latitude: 20.657857,
      longitude: -100.403495,
      title: 'Edificio PIDET',
      description: 'Posgrado, Innovación, Desarrollo y Emprendimiento Tecnológico',
      image: '',
      details: 'Posgrados y desarrollo tecnológico',
      contact: 'Tel: ext. 7100',
      codigo: 'PIDET'
    },
    { 
      latitude: 20.6549875, 
      longitude: -100.4062969, 
      title: 'División Idiomas',
      description: 'Espacio académico dedicado a lenguas extranjeras y medios digitales',
      image: IDIOMAS, 
      details: 'Aulas multimedia e idiomas. Horario: 7:30 AM - 7:00 PM',
      contact: 'Coordinación de idiomas: ext. 1030',
      codigo: 'Edificio L'
    },
    { 
      latitude: 20.656181,
      longitude: -100.404196,
      title: 'Módulo Sanitario 2',
      description: 'Baños disponibles para uso estudiantil y docente',
      image: '', 
      details: 'Instalación sanitaria. Horario: 6:30 AM - 9:00 PM',
      contact: 'Servicios generales: ext. 1045',
      codigo: 'Edificio U'
    },
    { 
      latitude: 20.6557433, 
      longitude: -100.4048658, 
      title: 'Edificio de Nanotecnología', 
      description: 'Nanotecnología y Laboratorios',
      image: NANOTECNOLOGIA,
      details: 'Laboratorios especializados en nanotecnología',
      contact: 'Tel: (442) 274-9000 ext. 6001',
      codigo: 'Edificio H-1'
    },
    { 
      latitude: 20.6560881, 
      longitude: -100.4060255, 
      title: 'Auditorio',
      description: 'Eventos y conferencias',
      image: AUDITORIO,
      details: 'Capacidad: 500 personas. Eventos académicos y culturales',
      contact: 'Reservaciones: ext. 7001',
      codigo: 'Edificio S'
    },
    { 
      latitude: 20.656819, 
      longitude: -100.405527, 
      title: 'Cancha de futbol rápido', 
      description: 'Área deportiva',
      image: '',
      details: 'Horario: 7:00 AM - 8:00 PM',
      contact: 'Deportes: ext. 8002',
      codigo: ''
    },
    { 
      latitude: 20.657146, 
      longitude: -100.405382, 
      title: 'Cancha de futbol', 
      description: 'Campo de futbol principal',
      image: '',
      details: 'Campo reglamentario',
      contact: 'Deportes: ext. 8003',
      codigo: ''
    }
  ];
  
  export default locations;