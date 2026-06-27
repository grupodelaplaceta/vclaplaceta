/**
 * ========================================
 * VOLEY CLUB LA PLACETA - MOCK DATA
 * ========================================
 * Datos simulados para la aplicación
 * Estructura lista para conectar con base de datos
 * ======================================== 
 */

// ========================================
// 1. CONFIGURACIÓN GLOBAL DEL CLUB
// ========================================

const clubInfo = {
  name: 'Voley Club La Placeta',
  shortName: 'VCPL',
  founded: 2026,
  city: 'Tarragona',
  country: 'España',
  description: 'Proyecto que impulsa el deporte y da visibilidad a la Asociación Grupo de La Placeta con un equipo oficial de voleibol',
  values: ['Comunidad', 'Inclusión', 'Desarrollo Deportivo', 'Excelencia'],
  contact: {
    email: 'voleyclub@laplaceta.org',
    phone: '',
    address: 'Tarragona, España'
  }
};

// ========================================
// 2. EQUIPO PRINCIPAL
// ========================================

const team = {
  id: 1,
  name: 'Voley Club La Placeta',
  level: 'Único',
  coach: 'Carlos Martínez',
  assistantCoach: 'Pedro García',
  description: 'Equipo oficial del club en competiciones',
  playerCount: 14
};

// ========================================
// 3. JUGADORES
// ========================================

const players = [
  // Senior Masculino
  {
    id: 1,
    name: 'David Hernández',
    nickName: 'El Muro',
    number: 1,
    position: 'Líbero',
    height: '1.85m',
    birthYear: 1995,
    specialty: 'Recepción y defensa'
  },
  {
    id: 2,
    name: 'Javier Robles',
    nickName: 'Maestro',
    number: 2,
    position: 'Colocador',
    height: '1.92m',
    birthYear: 1993,
    specialty: 'Distribución de juego'
  },
  {
    id: 3,
    name: 'Miguel Torres',
    nickName: 'Rayo',
    number: 3,
    position: 'Central',
    height: '2.05m',
    birthYear: 1998,
    specialty: 'Bloqueo'
  },
  {
    id: 4,
    name: 'Andrés Giménez',
    nickName: 'Bala',
    number: 4,
    position: 'Opuesto',
    height: '2.00m',
    birthYear: 1996,
    specialty: 'Ataque y remate'
  },
  {
    id: 5,
    name: 'Roberto Vidal',
    nickName: 'Titán',
    number: 5,
    position: 'Receptor',
    height: '1.95m',
    birthYear: 1994,
    specialty: 'Recepción ofensiva'
  },
  {
    id: 6,
    name: 'Fernando Navarro',
    nickName: 'Fortaleza',
    number: 6,
    position: 'Central',
    height: '2.03m',
    birthYear: 1997,
    specialty: 'Defensa en red'
  },
  {
    id: 7,
    name: 'Lucas Medina',
    nickName: 'Fuego',
    number: 7,
    position: 'Receptor',
    height: '1.88m',
    birthYear: 1999,
    specialty: 'Ataque en banda'
  },
  {
    id: 8,
    name: 'Sofía García',
    nickName: 'Acero',
    number: 8,
    position: 'Colocadora',
    height: '1.78m',
    birthYear: 1996,
    specialty: 'Dirección de juego'
  },
  {
    id: 9,
    name: 'Alejandra López',
    nickName: 'Pared',
    number: 9,
    position: 'Central',
    height: '1.90m',
    birthYear: 1998,
    specialty: 'Bloqueo defensivo'
  },
  {
    id: 10,
    name: 'Valentina Moreno',
    nickName: 'Relámpago',
    number: 10,
    position: 'Opuesta',
    height: '1.88m',
    birthYear: 1995,
    specialty: 'Ataque potente'
  },
  {
    id: 11,
    name: 'Marta Sáez',
    nickName: 'Escudo',
    number: 11,
    position: 'Receptora',
    height: '1.80m',
    birthYear: 1997,
    specialty: 'Recepción consistente'
  },
  {
    id: 12,
    name: 'Raúl Jiménez',
    nickName: 'Remo',
    number: 12,
    position: 'Receptor',
    height: '1.85m',
    birthYear: 2003,
    specialty: 'Proyección ofensiva'
  },
  {
    id: 13,
    name: 'Claudia Rivas',
    nickName: 'Velocidad',
    number: 13,
    position: 'Central',
    height: '1.88m',
    birthYear: 2004,
    specialty: 'Bloqueo moderno'
  },
  {
    id: 14,
    name: 'Gabriela Rodríguez',
    nickName: 'Reina',
    number: 14,
    position: 'Líbero',
    height: '1.72m',
    birthYear: 1996,
    specialty: 'Defensa y movilidad'
  }
];

// ========================================
// 4. TORNEOS Y LIGAS
// ========================================

const tournaments = [
  {
    id: 1,
    name: 'Superliga Estatal',
    level: 'Nacional',
    season: '2025-2026',
    status: 'En curso',
    startDate: '2025-09-15',
    endDate: '2026-05-30',
    division: 'Primera División'
  },
  {
    id: 2,
    name: 'Liga Regional de Voleibol',
    level: 'Regional',
    season: '2025-2026',
    status: 'En curso',
    startDate: '2025-09-20',
    endDate: '2026-04-30',
    division: 'Primera Regional'
  },
  {
    id: 3,
    name: 'Copa del Rey',
    level: 'Nacional',
    season: '2025-2026',
    status: 'Próxima fase',
    startDate: '2026-01-15',
    endDate: '2026-02-28',
    division: 'Nacional'
  }
];

// ========================================
// 5. PARTIDOS HISTÓRICOS (RESULTADOS)
// ========================================

const matches = [
  {
    id: 1,
    date: '2026-05-15',
    time: '20:30',
    tournament: 'Superliga Estatal',
    homeTeam: 'Voley Club La Placeta',
    awayTeam: 'Voleibol Barcelona',
    homeScore: 3,
    awayScore: 1,
    status: 'Finalizado',
    winner: 'Voley Club La Placeta',
    sets: [25, 23, 28, 25]
  },
  {
    id: 2,
    date: '2026-05-08',
    time: '19:00',
    tournament: 'Liga Regional',
    homeTeam: 'CV Tarragona',
    awayTeam: 'Voley Club La Placeta',
    homeScore: 2,
    awayScore: 3,
    status: 'Finalizado',
    winner: 'Voley Club La Placeta',
    sets: [22, 25, 20, 26, 15]
  },
  {
    id: 3,
    date: '2026-04-28',
    time: '18:00',
    tournament: 'Liga Regional',
    homeTeam: 'Voley Club La Placeta',
    awayTeam: 'Reus Voleibol',
    homeScore: 3,
    awayScore: 0,
    status: 'Finalizado',
    winner: 'Voley Club La Placeta',
    sets: [25, 24, 26]
  },
  {
    id: 4,
    date: '2026-04-15',
    time: '20:30',
    tournament: 'Superliga Estatal',
    homeTeam: 'Gigantes del Voleibol',
    awayTeam: 'Voley Club La Placeta',
    homeScore: 3,
    awayScore: 2,
    status: 'Finalizado',
    winner: 'Gigantes del Voleibol',
    sets: [25, 22, 24, 23, 15]
  },
  {
    id: 5,
    date: '2026-04-05',
    time: '19:00',
    tournament: 'Superliga Estatal',
    homeTeam: 'Voley Club La Placeta',
    awayTeam: 'Deportivo Terrassa',
    homeScore: 3,
    awayScore: 1,
    status: 'Finalizado',
    winner: 'Voley Club La Placeta',
    sets: [25, 27, 23, 25]
  },
  {
    id: 6,
    date: '2026-03-22',
    time: '18:00',
    tournament: 'Liga Regional',
    homeTeam: 'CV Tarragona',
    awayTeam: 'Voley Club La Placeta',
    homeScore: 0,
    awayScore: 3,
    status: 'Finalizado',
    winner: 'Voley Club La Placeta',
    sets: [20, 25, 22, 26]
  },
  {
    id: 7,
    date: '2026-03-10',
    time: '20:30',
    tournament: 'Superliga Estatal',
    homeTeam: 'Voley Club La Placeta',
    awayTeam: 'Potencia Voleibol Valencia',
    homeScore: 2,
    awayScore: 3,
    status: 'Finalizado',
    winner: 'Potencia Voleibol Valencia',
    sets: [23, 25, 26, 20, 12]
  }
];

// ========================================
// 6. NOTICIAS DEL CLUB
// ========================================

const news = [
  {
    id: 1,
    date: '2026-06-15',
    title: '¡Victoria en casa! VCPL vence al CV Tarragona',
    excerpt: 'Nuestro equipo se impuso por 3-0 en un partido intenso ante el CV Tarragona en el pabellón municipal.',
    content: 'Gran actuación del equipo que dominó de principio a fin ante un rival siempre complicado.',
    category: 'Partidos',
    featured: true
  },
  {
    id: 2,
    date: '2026-06-10',
    title: 'Abiertas inscripciones para la temporada 2026-2027',
    excerpt: 'Ya puedes apuntarte para formar parte del Voley Club La Placeta. Buscamos jugadores comprometidos.',
    content: 'Ampliamos la plantilla para la próxima temporada. Si te gusta el voleibol, este es tu sitio.',
    category: 'Convocatoria',
    featured: true
  },
  {
    id: 3,
    date: '2026-06-05',
    title: 'Nueva equipación presentada para la temporada',
    excerpt: 'Estrenamos imagen con la nueva equipación oficial del club para la temporada 2026-2027.',
    content: 'Diseño renovado manteniendo nuestros colores señas de identidad.',
    category: 'Club',
    featured: true
  },
  {
    id: 4,
    date: '2026-05-28',
    title: 'Entrenamientos de verano: horarios especiales',
    excerpt: 'Consulta los horarios especiales de entrenamiento para los meses de julio y agosto.',
    content: 'Mantenemos la preparación física durante el verano con sesiones adaptadas.',
    category: 'Entrenamiento',
    featured: false
  },
  {
    id: 5,
    date: '2026-05-20',
    title: 'Torneo amistoso en Tarragona este julio',
    excerpt: 'Preparamos un torneo amistoso con equipos de la provincia para seguir compitiendo.',
    content: 'Una oportunidad para seguir sumando minutos de juego y preparar la próxima temporada.',
    category: 'Eventos',
    featured: true
  }
];

// ========================================
// 7. PRÓXIMOS PARTIDOS
// ========================================

const upcomingMatches = [
  {
    id: 100,
    date: '2026-07-10',
    time: '20:30',
    tournament: 'Amistoso',
    homeTeam: 'Voley Club La Placeta',
    awayTeam: 'CV Tarragona',
    venue: 'Pabellón Municipal, Tarragona',
    tickets: 'Disponibles',
    capacity: 300,
    ticketPrice: 0
  },
  {
    id: 101,
    date: '2026-07-18',
    time: '19:00',
    tournament: 'Superliga Estatal',
    homeTeam: 'Voley Club La Placeta',
    awayTeam: 'Potencia Voleibol Valencia',
    venue: 'Pabellón Municipal, Tarragona',
    tickets: 'Disponibles',
    capacity: 300,
    ticketPrice: 10
  },
  {
    id: 102,
    date: '2026-07-25',
    time: '18:00',
    tournament: 'Liga Regional',
    homeTeam: 'Voleibol Reus',
    awayTeam: 'Voley Club La Placeta',
    venue: 'Polideportivo Municipal Reus',
    tickets: 'Por confirmar',
    capacity: 400,
    ticketPrice: 5
  }
];

// ========================================
// 8. PATROCINADORES
// ========================================

const sponsors = [
  {
    id: 1,
    name: 'Grupo de La Placeta',
    type: 'Oficial',
    logo: 'assets/logogdlp.png',
    website: '',
    description: 'Respaldo institucional del club'
  }
];

const RRSS = {
  instagram: 'https://instagram.com/vclaplaceta',
  instagramUser: '@vclaplaceta',
  youtube: 'https://youtube.com/@grupodelaplaceta',
  youtubeUser: '@grupodelaplaceta'
};

// ========================================
// 9. FUNCIONES AUXILIARES DE DATOS
// ========================================

/**
 * Obtiene los próximos partidos ordenados por fecha
 * @param {number} limit - Cantidad de partidos a obtener
 * @returns {array} Próximos partidos ordenados
 */
function getUpcomingMatches(limit = 3) {
  return upcomingMatches.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, limit);
}

/**
 * Obtiene todos los jugadores
 * @returns {array} Array de todos los jugadores
 */
function getPlayersByTeam() {
  return players;
}

/**
 * Obtiene un jugador por su ID
 * @param {number} playerId - ID del jugador
 * @returns {object} Datos del jugador
 */
function getPlayerById(playerId) {
  return players.find(player => player.id === playerId);
}

/**
 * Obtiene los datos del equipo
 * @returns {object} Datos del equipo
 */
function getTeamById() {
  return team;
}

/**
 * Obtiene los últimos N partidos
 * @param {number} limit - Cantidad de partidos a obtener
 * @returns {array} Últimos partidos
 */
function getRecentMatches(limit = 5) {
  return matches.slice(0, limit);
}

/**
 * Filtra partidos por categoría
 * @param {string} category - Categoría (MASCULINO, FEMENINO, JUVENIL, MIXTO)
 * @returns {array} Partidos filtrados
 */
function getMatchesByCategory(category) {
  return matches.filter(match => match.category === category);
}

/**
 * Calcula estadísticas del club
 * @returns {object} Estadísticas
 */
function getClubStatistics() {
  const totalPlayers = players.length;
  const totalMatches = matches.length;
  const totalVictories = matches.filter(m => m.winner === 'Voley Club La Placeta').length;
  const totalDefeats = matches.filter(m => m.winner !== 'Voley Club La Placeta').length;
  const winRate = totalMatches > 0 ? ((totalVictories / totalMatches) * 100).toFixed(1) : 0;

  return {
    totalPlayers,
    totalMatches,
    totalVictories,
    totalDefeats,
    winRate: `${winRate}%`,
    founded: clubInfo.founded
  };
}

/**
 * Obtiene las noticias destacadas
 * @returns {array} Noticias destacadas
 */
function getFeaturedNews() {
  return news.filter(item => item.featured);
}

/**
 * Obtiene noticias ordenadas por fecha descendente
 * @param {number} limit - Cantidad de noticias
 * @returns {array} Noticias ordenadas
 */
function getLatestNews(limit = 3) {
  return news.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}
