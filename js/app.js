/**
 * ========================================
 * VOLEY CLUB LA PLACETA - LÓGICA PRINCIPAL
 * ========================================
 * Gestión de componentes, interactividad y
 * renderizado dinámico de contenido
 * ======================================== 
 */

// ========================================
// 1. INICIALIZACIÓN Y CONFIGURACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupNavigationListeners();
  updateActiveLink();
});

function initializeApp() {
  // Renderizar componentes globales
  renderHeader();
  renderFooter();
}

// ========================================
// 2. COMPONENTE: HEADER
// ========================================

function renderHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  const nav = header.querySelector('nav ul');
  const hamburger = header.querySelector('.hamburger');

  // Toggle menú hamburguesa
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      if (nav) {
        nav.classList.toggle('active');
      }
    });
  }

  // Cerrar menú al hacer click en un enlace
  if (nav) {
    const links = nav.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (hamburger) {
          hamburger.classList.remove('active');
        }
        nav.classList.remove('active');
      });
    });
  }
}

// ========================================
// 3. NAVEGACIÓN ACTIVA
// ========================================

function updateActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function setupNavigationListeners() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', updateActiveLink);
  });
}

// ========================================
// 4. COMPONENTE: FOOTER
// ========================================

function renderFooter() {
  // El footer se renderiza desde HTML
}

// ========================================
// 5. RENDERIZADO DE JUGADORES
// ========================================

function renderPlayerGrid(teamId = null, containerId = 'players-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const playersToRender = getPlayersByTeam();

  container.innerHTML = '';
  
  playersToRender.forEach(player => {
    const playerCard = createPlayerCard(player);
    container.appendChild(playerCard);
  });
}

function createPlayerCard(player) {
  const card = document.createElement('div');
  card.className = 'card player-card';
  
  card.innerHTML = `
    <div class="card-image">
      <div class="player-number">${player.number}</div>
      <span style="font-size: 3rem; position: relative; z-index: 1;">🏐</span>
    </div>
    <div class="card-body">
      <h3 class="player-name">${player.name}</h3>
      <p class="player-nickname">${player.nickName}</p>
      <p class="player-position">${player.position}</p>
      <div style="margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid var(--border-color);">
        <span style="font-size: 0.8rem; color: var(--text-muted);">Altura: ${player.height}</span>
      </div>
    </div>
  `;
  
  return card;
}

// ========================================
// 6. RENDERIZADO DE PARTIDOS/RESULTADOS
// ========================================

function renderMatchesTable(matchesData = matches, containerId = 'matches-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (matchesData.length === 0) {
    container.innerHTML = '<p class="text-center">No hay partidos registrados.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'results-table';
  
  table.innerHTML = `
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Tipo</th>
        <th>Local</th>
        <th>Resultado</th>
        <th>Visitante</th>
      </tr>
    </thead>
    <tbody>
      ${matchesData.map(match => `
        <tr>
          <td style="font-size:0.8rem;">${formatDate(match.date)}</td>
          <td><span style="font-size:0.65rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:50px;background:${match.tipo === 'amistoso' ? 'rgba(243,156,18,0.15)' : 'rgba(46,204,113,0.15)'};color:${match.tipo === 'amistoso' ? '#c0392b' : '#27ae60'};">${match.tipo === 'amistoso' ? 'Amistoso' : match.tournament}</span></td>
          <td style="font-weight:600;">${match.homeTeam}</td>
          <td>
            <span class="score-badge">${match.homeScore}</span>
            <span class="score-badge">${match.awayScore}</span>
          </td>
          <td>${match.awayTeam}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  container.innerHTML = '';
  container.appendChild(table);
}

// ========================================
// 7. RENDERIZADO DE TORNEOS
// ========================================

function renderTournamentsGrid(tournamentsData = tournaments, containerId = 'tournaments-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  
  tournamentsData.forEach(tournament => {
    const card = createTournamentCard(tournament);
    container.appendChild(card);
  });
}

function createTournamentCard(tournament) {
  const card = document.createElement('div');
  card.className = 'card tournament-card';
  
  card.innerHTML = `
    <div class="card-image">
      <span>🏆</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${tournament.name}</h3>
      <p class="card-subtitle">Temporada ${tournament.season}</p>
      <p class="card-text">${tournament.division || 'Liga'} · ${tournament.level}</p>
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.8rem; color: var(--text-muted);">${tournament.division || 'Liga'}</span>
        <span class="tournament-status">${tournament.status}</span>
      </div>
    </div>
  `;
  
  return card;
}

// ========================================
// 8. RENDERIZADO DE NOTICIAS
// ========================================

function renderNewsFeed(newsData = getLatestNews(), containerId = 'news-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  
  newsData.forEach((newsItem, index) => {
    const newsElement = createNewsItem(newsItem, index);
    container.appendChild(newsElement);
  });
}

function createNewsItem(newsItem, index = 0) {
  const item = document.createElement('div');
  item.className = 'news-card stagger-card';
  item.style.transitionDelay = `${index * 0.1}s`;
  item.style.cursor = 'pointer';
  
  const imgHtml = newsItem.image
    ? `<div style="width:100%; height:160px; overflow:hidden; border-radius:8px 8px 0 0;"><img src="${newsItem.image}" alt="${newsItem.title}" style="width:100%; height:100%; object-fit:cover;"></div>`
    : '';
  
  item.innerHTML = imgHtml + `
    <div style="padding:1.2rem;">
      <span class="news-category">${newsItem.category || 'Noticia'}</span>
      <p class="news-date">${formatDate(newsItem.date)}</p>
      <h3 class="news-title">${newsItem.title}</h3>
      <p class="news-excerpt">${newsItem.excerpt}</p>
      <div style="margin-top: 1rem;">
        <span style="color: var(--accent); font-weight: 700; font-size: 0.85rem;">Leer más →</span>
      </div>
    </div>
  `;
  
  item.addEventListener('click', () => openNewsModal(newsItem));
  
  return item;
}

function openNewsModal(newsItem) {
  let modal = document.getElementById('newsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'newsModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;opacity:0;transition:opacity 0.3s;';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <button onclick="closeNewsModal()" style="position:absolute;top:1rem;right:1rem;background:rgba(0,0,0,0.1);border:none;border-radius:50%;width:36px;height:36px;font-size:1.2rem;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;">✕</button>
        <div id="newsModalContent"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeNewsModal(); });
  }
  
  const content = document.getElementById('newsModalContent');
  const imgHtml = newsItem.image
    ? `<img src="${newsItem.image}" alt="${newsItem.title}" style="width:100%;max-height:300px;object-fit:cover;border-radius:16px 16px 0 0;">`
    : '';
  
  content.innerHTML = imgHtml + `
    <div style="padding:1.5rem 2rem 2rem;">
      <span style="display:inline-block;background:rgba(255,109,0,0.1);color:#ff6d00;padding:0.2rem 0.8rem;border-radius:50px;font-size:0.75rem;font-weight:700;text-transform:uppercase;margin-bottom:0.5rem;">${newsItem.category || 'Noticia'}</span>
      <p style="font-size:0.8rem;color:#999;margin-bottom:0.8rem;">${formatDate(newsItem.date)}</p>
      <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:1rem;color:#1a1a2e;">${newsItem.title}</h2>
      <p style="font-size:0.95rem;color:#5a5a7a;line-height:1.7;">${newsItem.content || newsItem.excerpt}</p>
    </div>
  `;
  
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.style.opacity = '1');
  document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
  const modal = document.getElementById('newsModal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; document.body.style.overflow = ''; }, 300);
  }
}

// ========================================
// 9. RENDERIZADO DE PRÓXIMOS PARTIDOS
// ========================================

function getLatestNews() {
  // Retorna últimas noticias (hasta 4 para la home)
  return news && news.length > 0 ? news.slice(0, 4) : [];
}

function getClubStatistics() {
  // Calcula estadísticas del club
  const totalPlayers = players ? players.length : 0;
  const totalMatches = matches ? matches.length : 0;
  const totalVictories = matches ? matches.filter(m => m.winner === 'Voley Club La Placeta').length : 0;
  const winRate = totalMatches > 0 ? Math.round((totalVictories / totalMatches) * 100) + '%' : '0%';
  
  return {
    totalPlayers,
    totalMatches,
    totalVictories,
    winRate
  };
}

function getPlayersByTeam(teamId = null) {
  // Retorna todos los jugadores (hay un solo equipo)
  return players || [];
}

function renderNextMatch(containerId = 'next-match-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const upcomingMatches = getUpcomingMatches();
  
  if (!upcomingMatches || upcomingMatches.length === 0) {
    container.innerHTML = '<p class="text-center">No hay próximos partidos programados.</p>';
    return;
  }
  
  const match = upcomingMatches[0];
  const matchElement = createMatchCard(match);
  container.innerHTML = '';
  container.appendChild(matchElement);
}

function renderUpcomingMatches(matchesData = getUpcomingMatches(), containerId = 'upcoming-matches-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  
  if (!matchesData || matchesData.length === 0) {
    container.innerHTML = '<p class="text-center">No hay próximos partidos programados.</p>';
    return;
  }
  
  matchesData.forEach(match => {
    const matchElement = createMatchCard(match);
    container.appendChild(matchElement);
  });
}

function createMatchCard(match) {
  const isHome = match.homeTeam === 'Voley Club La Placeta';
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const venue = match.venue || 'Pabellón La Placeta';
  const tipo = match.tipo || 'torneo';
  const badgeColor = tipo === 'amistoso' ? '#f39c12' : '#2ecc71';
  const badgeLabel = tipo === 'amistoso' ? 'Amistoso' : match.tournament || 'Torneo';
  
  const card = document.createElement('div');
  card.className = 'next-match-card';
  
  card.innerHTML = `
    <div class="next-match-header">
      <span style="display:inline-flex;align-items:center;gap:0.5rem;">
        <i class="fas fa-${tipo === 'amistoso' ? 'handshake' : 'calendar-alt'}"></i>
        ${badgeLabel}
        <span style="font-size:0.6rem;background:${badgeColor};color:#fff;padding:0.1rem 0.5rem;border-radius:50px;font-weight:700;text-transform:uppercase;">${tipo}</span>
      </span>
    </div>
    <div class="next-match-body">
      <div class="match-teams">
        <div class="team-box">
          <p class="team-name">${match.homeTeam}</p>
          <p class="team-label">Local</p>
        </div>
        <div class="vs-badge">VS</div>
        <div class="team-box">
          <p class="team-name">${match.awayTeam}</p>
          <p class="team-label">Visitante</p>
        </div>
      </div>
      <div class="match-details">
        <span class="match-detail"><i class="fas fa-calendar"></i> ${formatDate(match.date)}</span>
        <span class="match-detail"><i class="fas fa-clock"></i> ${match.time}</span>
        <span class="match-detail"><i class="fas fa-map-marker-alt"></i> ${venue}</span>
        <span class="match-detail"><i class="fas fa-ticket-alt"></i> ${match.tickets || 'Entrada libre'}</span>
      </div>
    </div>
  `;
  
  return card;
}

// ========================================
// 10. ESTADÍSTICAS DEL CLUB
// ========================================

function renderClubStats(containerId = 'club-stats') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const stats = getClubStatistics();
  
  const statItems = [
    { number: stats.totalPlayers, label: 'Jugadores', icon: '🏐' },
    { number: stats.totalMatches, label: 'Partidos', icon: '📋' },
    { number: stats.totalVictories, label: 'Victorias', icon: '🏆' },
    { number: stats.winRate, label: 'Rendimiento', icon: '📈' }
  ];
  
  container.innerHTML = '';
  
  statItems.forEach((stat, index) => {
    const box = document.createElement('div');
    box.className = 'stat-card reveal-scale';
    box.style.transitionDelay = `${index * 0.12}s`;
    box.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">${stat.icon}</div>
      <div class="stat-number">${stat.number}</div>
      <div class="stat-label">${stat.label}</div>
    `;
    container.appendChild(box);
  });
}

// ========================================
// 11. FILTRADO DE JUGADORES POR EQUIPO
// ========================================

function setupTeamFilters() {
  const filterButtons = document.querySelectorAll('[data-team-filter]');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'var(--accent)';
        b.style.backgroundColor = 'transparent';
        b.style.color = '';
      });
      this.classList.add('active');
      this.style.backgroundColor = 'var(--accent)';
      this.style.borderColor = 'var(--accent)';
      this.style.color = 'var(--dark-bg)';
      
      const filter = this.getAttribute('data-team-filter');
      if (filter === 'all') {
        renderPlayerGrid(null, 'players-container');
      } else {
        renderPlayerGrid(parseInt(filter), 'players-container');
      }
    });
  });
}

function filterPlayersByTeam(teamId = null) {
  // Retorna todos los jugadores - hay un solo equipo
  return getPlayersByTeam(teamId);
}

// ========================================
// 12. GESTIÓN DE FORMULARIOS - PATROCINADORES Y TORNEOS
// ========================================

function setupContactForm() {
  const form = document.querySelector('.form-section form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      sponsorType: formData.get('sponsor-type') || formData.get('category'),
      message: formData.get('message'),
      timestamp: new Date().toISOString()
    };

    console.log('Solicitud de patrocinio/torneo enviada:', data);
    showFormSuccess();
    form.reset();
  });
}

function showFormSuccess() {
  const successMessage = document.createElement('div');
  successMessage.style.cssText = `
    background-color: var(--success);
    color: #ffffff;
    padding: 1rem;
    border-radius: 12px;
    margin-top: 1rem;
    text-align: center;
    font-weight: 700;
    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
  `;
  successMessage.textContent = '✓ ¡Solicitud recibida! Nos pondremos en contacto en breve.';
  
  const form = document.querySelector('.form-section form');
  form.parentNode.insertBefore(successMessage, form.nextSibling);
  
  setTimeout(() => {
    successMessage.remove();
  }, 5000);
}

// ========================================
// 13. UTILIDADES DE FORMATO
// ========================================

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

function formatTime(timeString) {
  return timeString || '--:--';
}

function toUpperCase(text) {
  return text ? text.toUpperCase() : '';
}

// ========================================
// 14. INICIALIZADORES DE PÁGINA ESPECÍFICA
// ========================================

function initPlayersPage() {
  renderPlayerGrid();
  setupTeamFilters();
}

function initTournamentsPage() {
  renderTournamentsGrid();
  renderMatchesTable();
  renderUpcomingMatches();
}

function initHomePage() {
  renderNextMatch();
  renderNewsFeed();
}

function initSponsors() {
  const container = document.getElementById('sponsors-container');
  if (!container || typeof sponsors === 'undefined') return;
  
  container.innerHTML = '';
  
  sponsors.forEach(sponsor => {
    const card = document.createElement('div');
    card.className = 'sponsor-card';
    card.innerHTML = `
      <div class="sponsor-logo"><img src="${sponsor.logo}" alt="${sponsor.name}" style="max-width:120px; max-height:80px; object-fit:contain;"></div>
      <div class="sponsor-name">${sponsor.name}</div>
      <div class="sponsor-type">${sponsor.type}</div>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">${sponsor.description}</p>
    `;
    container.appendChild(card);
  });
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  revealElements.forEach(el => observer.observe(el));
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initContactPage() {
  setupContactForm();
}

// ========================================
// 15. VALIDACIÓN DE FORMULARIOS
// ========================================

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\d\s\-\+\(\)]{9,}$/;
  return re.test(phone);
}

// ========================================
// 16. EXPORTAR PARA USO GLOBAL
// ========================================

window.VoleyApp = {
  renderPlayerGrid,
  renderMatchesTable,
  renderTournamentsGrid,
  renderNextMatch,
  renderClubStats,
  renderNewsFeed,
  filterPlayersByTeam,
  initPlayersPage,
  initTournamentsPage,
  initHomePage,
  initContactPage,
  initSponsors,
  initScrollReveal,
  initBackToTop,
  formatDate,
  validateEmail,
  validatePhone
};
