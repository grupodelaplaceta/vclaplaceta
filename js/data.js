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

const players = [];

// ========================================
// 4. TORNEOS Y LIGAS
// ========================================

const tournaments = [];

// ========================================
// 5. PARTIDOS HISTÓRICOS (RESULTADOS)
// ========================================

const matches = [];

// ========================================
// 6. NOTICIAS DEL CLUB
// ========================================

let news = [];

// ========================================
// 7. PRÓXIMOS PARTIDOS
// ========================================

const upcomingMatches = [];

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
