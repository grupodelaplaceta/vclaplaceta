# 🏐 Voley Club La Placeta - Web Oficial

**Estructura completa de una aplicación web multipágina, moderna, responsive y profesional para un club de voleibol.**

---

## 📋 Índice

- [Descripción General](#descripción-general)
- [Especificaciones de Diseño](#especificaciones-de-diseño)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Páginas Incluidas](#páginas-incluidas)
- [Componentes Globales](#componentes-globales)
- [Datos Mock](#datos-mock)
- [Funcionalidades JavaScript](#funcionalidades-javascript)
- [Instalación y Uso](#instalación-y-uso)
- [Personalización](#personalización)
- [Futuras Mejoras](#futuras-mejoras)

---

## 🎯 Descripción General

**Voley Club La Placeta** es una web oficial para un club de voleibol con enfoque en:

✅ **Diseño Premium** - Estilo deportivo e institucional  
✅ **Responsive** - Adaptado para móvil, tablet y escritorio  
✅ **Multipágina** - Estructura modular y escalable  
✅ **Mock Data** - Datos listos para conectar con API o base de datos  
✅ **Accesibilidad** - HTML semántico y navegación intuitiva  
✅ **Performance** - CSS y JavaScript optimizados  

---

## 🎨 Especificaciones de Diseño

### Paleta de Colores

```
- Color Principal: #3f00d8 (Morado Intenso)
- Color Acento: #ff751f (Naranja Vibrante)
- Fondo Oscuro: #0a0a0a (Negro)
- Fondo Secundario: #1a1a1a (Gris Muy Oscuro)
- Texto Principal: #FFFFFF (Blanco)
- Texto Secundario: #b0b0b0 (Gris Claro)
```

### Tipografía

**Font:** `Outfit` desde Google Fonts

```
- Títulos/Encabezados: Outfit Black (900)
- Texto Cuerpo: Outfit Regular (400)
- Acentos/Énfasis: Outfit Bold (700)
```

### Estilos

- Transiciones suaves y animaciones fluidas
- Botones con efectos hover y active
- Cards con elevación y transformación
- Gradientes sutiles
- Espaciado generoso

---

## 📁 Estructura del Proyecto

```
voleyclub/
├── index.html                 # Página de Inicio
├── jugadores.html             # El Club y Plantilla
├── torneos.html               # Competición y Resultados
├── contacto.html              # Contacto y Registro
├── css/
│   └── styles.css             # Estilos principales (600+ líneas)
├── js/
│   ├── data.js                # Mock data y funciones de datos
│   └── app.js                 # Lógica principal y componentes
├── assets/
│   ├── logo-placeta.svg       # Logo del club
│   └── player-placeholder.svg # Placeholder para jugadores
└── README.md                  # Este archivo
```

---

## 📄 Páginas Incluidas

### 1️⃣ **index.html** - Página de Inicio

**Secciones:**
- Hero section potente con título del club
- Widget "Próximo Partido" con información y visual
- Estadísticas rápidas (Jugadores, Equipos, Victorias, Tasa de Victoria)
- Feed de últimas noticias

**Funciones asociadas:**
- `initHomePage()` - Renderiza todos los elementos
- `renderNextMatch()` - Muestra próximo partido
- `renderClubStats()` - Estadísticas del club
- `renderNewsFeed()` - Últimas noticias

---

### 2️⃣ **jugadores.html** - El Club y Plantilla

**Secciones:**
- Banner institucional destacado
  - Información del club y respaldo de la Asociación
  - Año de fundación, categorías, jugadores
- Filtros por equipo (Todos, Senior M, Senior F, Juveniles)
- Grid de jugadores con:
  - Foto/Avatar
  - Nombre en Outfit Black
  - Número de camiseta en naranja (badge circular)
  - Posición en la cancha
  - Categoría
- Sección de equipos y cuerpo técnico
- Valores del club (Comunidad, Inclusión, Desarrollo, Excelencia)

**Funciones asociadas:**
- `initPlayersPage()` - Inicializa página
- `renderPlayerGrid()` - Renderiza jugadores
- `filterPlayersByTeam()` - Filtra por equipo
- `setupTeamFilters()` - Configura botones de filtro

---

### 3️⃣ **torneos.html** - Competición y Resultados

**Secciones:**
- Listado de torneos y ligas en cards
  - Nombre, temporada, nivel, categoría, estado
- Tabla de historial de partidos
  - Fecha, equipo local, resultado, equipo visitante, estado
  - Badges de Victoria (verde) / Derrota (rojo)
- Estadísticas de la temporada (7 partidos, 5 victorias, 71.4%)
- Próximos eventos
- Calendario de competiciones
  - Superliga Estatal (Masculino)
  - Liga Regional (Femenino)
  - Campeonato Juvenil
  - Copa del Rey

**Funciones asociadas:**
- `initTournamentsPage()` - Inicializa página
- `renderTournamentsGrid()` - Renderiza torneos
- `renderMatchesTable()` - Renderiza tabla de partidos

---

### 4️⃣ **contacto.html** - Contacto y Registro

**Secciones:**
- Información de contacto (Email, Teléfono, Ubicación)
- Formulario de inscripción con campos:
  - Nombre completo
  - Email
  - Teléfono
  - Categoría de interés
  - Experiencia en voleibol
  - Mensaje/Comentarios
  - Checkbox de aceptación de términos
- Razones para unirse al club (6 items)
- Enlaces a redes sociales

**Funciones asociadas:**
- `initContactPage()` - Inicializa página
- `setupContactForm()` - Configura el formulario
- `validateEmail()` - Validación de email
- `validatePhone()` - Validación de teléfono
- `showFormSuccess()` - Muestra confirmación

---

## 🌐 Componentes Globales

### Header

```html
<header>
  - Logo del club
  - Nombre del club (con acento en naranja)
  - Menú de navegación (responsive con hamburguesa)
  - Botón "Inscribirse" en naranja
</header>
```

**Características:**
- Sticky (permanece en top al scroll)
- Border inferior en morado
- Menú hamburguesa en móvil
- Links activos destacados
- Cierre automático del menú al seleccionar un enlace

### Footer

```html
<footer>
  - Secciones de navegación (El Club, Competiciones)
  - Enlaces a redes sociales (Instagram, TikTok, Facebook)
  - Copyright
  - Texto institucional fijo: "Voley Club La Placeta - Equipo respaldado por la 
    Asociación Grupo de La Placeta"
</footer>
```

---

## 💾 Datos Mock

**Archivo:** `js/data.js`

### Estructura de Datos

#### 1. **clubInfo**
```javascript
{
  name, shortName, founded, city, country,
  description, values, contact
}
```

#### 2. **teams**
Array de equipos con:
```javascript
{
  id, name, category, level, coach, assistantCoach, 
  description, playerCount
}
```

**Categorías:**
- Senior Masculino (14 jugadores)
- Senior Femenino (12 jugadores)
- Juveniles Mixto (16 jugadores)

#### 3. **players**
Array de jugadores con:
```javascript
{
  id, name, number, position, team, teamId, 
  height, birthYear, specialty
}
```

**Posiciones:** Líbero, Colocador/a, Central, Opuesto/a, Receptor/a

#### 4. **tournaments**
Array de torneos con:
```javascript
{
  id, name, level, season, category, status, 
  startDate, endDate, division
}
```

**Torneos Incluidos:**
- Superliga Estatal (Masculino)
- Liga Regional de Voleibol (Femenino)
- Campeonato Juvenil Autonómico
- Copa del Rey

#### 5. **matches**
Array de partidos históricos con:
```javascript
{
  id, date, time, tournament, homeTeam, awayTeam,
  homeScore, awayScore, status, winner, category, sets
}
```

#### 6. **news**
Array de noticias con:
```javascript
{
  id, date, title, excerpt, content, category, featured
}
```

#### 7. **nextMatch**
Próximo partido a disputarse:
```javascript
{
  id, date, time, tournament, homeTeam, awayTeam,
  venue, category, tickets, capacity, ticketPrice
}
```

### Funciones Auxiliares

```javascript
// Obtener jugadores por equipo
getPlayersByTeam(teamId)

// Obtener jugador por ID
getPlayerById(playerId)

// Obtener equipo por ID
getTeamById(teamId)

// Últimos N partidos
getRecentMatches(limit)

// Partidos por categoría
getMatchesByCategory(category)

// Estadísticas del club
getClubStatistics()

// Noticias destacadas
getFeaturedNews()

// Últimas noticias
getLatestNews(limit)
```

---

## ⚙️ Funcionalidades JavaScript

**Archivo:** `js/app.js`

### Inicialización

```javascript
initializeApp()         // Renderiza header/footer
setupNavigationListeners()  // Configura navegación
updateActiveLink()      // Marca link activo
```

### Renderizado de Componentes

```javascript
// Jugadores
renderPlayerGrid(teamId, containerId)
createPlayerCard(player)
filterPlayersByTeam(teamId)
setupTeamFilters()

// Partidos
renderMatchesTable(matchesData, containerId)

// Torneos
renderTournamentsGrid(tournamentsData, containerId)
createTournamentCard(tournament)

// Noticias
renderNewsFeed(newsData, containerId)
createNewsItem(newsItem)

// Próximo Partido
renderNextMatch(matchData, containerId)

// Estadísticas
renderClubStats(containerId)
```

### Gestión de Formularios

```javascript
setupContactForm()      // Configura validación y envío
showFormSuccess()       // Muestra confirmación
validateEmail(email)    // Valida email
validatePhone(phone)    // Valida teléfono
```

### Utilidades

```javascript
formatDate(dateString)  // Convierte fecha a formato legible
formatTime(timeString)  // Convierte hora a formato legible
toUpperCase(text)       // Convierte texto a mayúsculas
```

### Almacenamiento Local

```javascript
saveUserPreferences(key, value)   // Guarda en localStorage
getUserPreferences(key)           // Lee de localStorage
```

### API Global

```javascript
// Acceso desde HTML/consola
window.VoleyApp.renderPlayerGrid
window.VoleyApp.renderMatchesTable
window.VoleyApp.formatDate
// ... etc
```

---

## 🚀 Instalación y Uso

### Opción 1: Localmente

1. **Clona o descarga el proyecto:**
   ```bash
   cd voleyclub
   ```

2. **Abre en un servidor local** (recomendado):
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con PHP
   php -S localhost:8000
   
   # Con Node.js (http-server)
   npx http-server
   ```

3. **Accede a:**
   ```
   http://localhost:8000
   ```

### Opción 2: Con Live Server (VS Code)

1. Instala extensión "Live Server" en VS Code
2. Click derecho en `index.html` → "Open with Live Server"

### Opción 3: Hosting Online

1. Sube los archivos a un hosting web
2. Accede a través de tu dominio

---

## 🎨 Personalización

### Cambiar Colores

**Archivo:** `css/styles.css` (líneas 1-13)

```css
:root {
  --primary: #3f00d8;        /* Morado */
  --accent: #ff751f;         /* Naranja */
  --dark-bg: #0a0a0a;        /* Fondo oscuro */
  /* ... más variables */
}
```

### Cambiar Logo

1. Reemplaza `assets/logo-placeta.svg` con tu logo
2. O usa una imagen PNG/JPG (ajusta el `src` en los HTML)

### Cambiar Datos del Club

**Archivo:** `js/data.js`

```javascript
const clubInfo = {
  name: 'Tu Club',
  founded: 2023,
  city: 'Tu Ciudad',
  // ...
}
```

### Agregar Jugadores

```javascript
const players = [
  {
    id: 15,
    name: 'Nuevo Jugador',
    number: 20,
    position: 'Central',
    team: 'Senior Masculino',
    teamId: 1,
    // ...
  },
  // ...
]
```

### Agregar Partidos

```javascript
const matches = [
  {
    id: 8,
    date: '2024-12-05',
    time: '19:30',
    homeTeam: 'Voley Club La Placeta',
    awayTeam: 'Equipo X',
    homeScore: 3,
    awayScore: 0,
    // ...
  },
  // ...
]
```

### Cambiar Tipografía

En `css/styles.css` (línea ~65):

```css
@import url('https://fonts.googleapis.com/css2?family=YOUR_FONT:wght@400;700;900&display=swap');
```

---

## 📱 Responsive Design

El proyecto está completamente optimizado para:

- **Desktop:** 1400px+ (pantalla completa, 4 columnas)
- **Tablet:** 768px - 1399px (3 columnas, menú adaptado)
- **Móvil:** < 768px (1 columna, menú hamburguesa)

Puntos de quiebre en `css/styles.css`:

```css
@media (max-width: 768px) { /* Tablet y móvil */ }
@media (max-width: 480px)  { /* Móvil pequeño */ }
```

---

## 🔗 Conectar con Backend

### Pasos para integrar con API/Base de Datos:

1. **Reemplazar mock data:**
   ```javascript
   // En vez de const players = [...]
   async function getPlayers() {
     const response = await fetch('/api/players');
     return await response.json();
   }
   ```

2. **Enviar formularios:**
   ```javascript
   async function submitContact(formData) {
     await fetch('/api/contact', {
       method: 'POST',
       body: JSON.stringify(formData)
     });
   }
   ```

3. **Autenticación:**
   ```javascript
   // Agregar tokens, sesiones, etc.
   ```

---

## ✨ Futuras Mejoras

- [ ] Integración con CMS (Headless CMS)
- [ ] Sistema de noticias dinánico
- [ ] Galería de fotos/videos
- [ ] Chat en vivo con soporte
- [ ] Panel administrativo
- [ ] Inscripción online con pago
- [ ] Seguimiento de calendarios sincronizados
- [ ] Newsletter automático
- [ ] SEO optimizado
- [ ] Analytics integrado

---

## 📞 Soporte y Documentación

- **HTML Semántico:** Estructura accesible y clara
- **CSS Modular:** Fácil de personalizar y mantener
- **JavaScript Vanilla:** Sin dependencias externas
- **Comentarios:** Código bien documentado

---

## 📜 Licencia

Proyecto creado para **Voley Club La Placeta** - Todos los derechos reservados.

---

## 🏆 Características Destacadas

✅ **Multipágina (4 páginas principales)**  
✅ **Componentes reutilizables (Header, Footer)**  
✅ **Responsive design (Mobile-First)**  
✅ **Paleta de colores deportiva**  
✅ **Tipografía premium (Outfit)**  
✅ **Mock data estructurada**  
✅ **Funcionalidades JavaScript avanzadas**  
✅ **Formularios con validación**  
✅ **Animaciones suaves**  
✅ **Código limpio y comentado**  

---

**¡Disfruta tu nueva web de Voley Club La Placeta!** ⚡🏐
