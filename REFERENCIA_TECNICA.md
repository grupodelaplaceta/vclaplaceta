# 🔧 Referencia Técnica - Voley Club La Placeta

## Estructura de Datos y API

Esta documento describe la estructura de datos y cómo conectar la aplicación con un backend.

---

## 📊 Esquemas de Datos

### 1. Club (clubInfo)

```javascript
{
  "id": 1,
  "name": "Voley Club La Placeta",
  "shortName": "VCPL",
  "founded": 2023,
  "city": "Barcelona",
  "country": "España",
  "description": "Equipo oficial respaldado por la Asociación Grupo de La Placeta",
  "values": ["Comunidad", "Inclusión", "Desarrollo Deportivo", "Excelencia"],
  "contact": {
    "email": "info@voleyplaceta.com",
    "phone": "+34 600 123 456",
    "address": "Calle La Placeta, Barcelona, España"
  }
}
```

### 2. Equipos (Teams)

```javascript
{
  "id": 1,
  "name": "Senior Masculino",
  "category": "MASCULINO",        // MASCULINO | FEMENINO | JUVENIL | MIXTO
  "level": "Senior",              // Senior | Juvenil | Infantil | Cadete
  "coach": "Carlos Martínez",
  "assistantCoach": "Pedro García",
  "description": "Equipo representativo...",
  "playerCount": 14,
  "color": "#3f00d8"              // Opcional: color del equipo
}
```

**IDs existentes:**
- 1 = Senior Masculino
- 2 = Senior Femenino
- 3 = Juveniles Mixto

### 3. Jugadores (Players)

```javascript
{
  "id": 1,
  "name": "David Hernández",
  "number": 1,                    // Número de camiseta
  "position": "Líbero",           // Colocador | Opuesto | Central | Líbero | Receptor
  "team": "Senior Masculino",
  "teamId": 1,                    // FK a Teams
  "height": "1.85m",
  "birthYear": 1995,
  "age": 29,                      // Calculado
  "specialty": "Recepción y defensa",
  "photo": "url/to/photo.jpg",    // Opcional
  "nationality": "España",        // Opcional
  "dorsal": 1,                    // Alias para 'number'
  "dateJoined": "2023-01-15",     // Opcional
  "active": true
}
```

**Posiciones válidas:**
- Colocador / Colocadora
- Opuesto / Opuesta
- Central
- Líbero
- Receptor / Receptora
- Pasador (alternativo para Colocador)
- Armador (alternativo para Colocador)

### 4. Partidos (Matches)

```javascript
{
  "id": 1,
  "date": "2024-11-15",           // ISO 8601 (YYYY-MM-DD)
  "time": "20:30",                // HH:MM formato 24h
  "datetime": "2024-11-15T20:30:00Z",  // ISO 8601 completo
  "tournament": "Superliga Estatal",  // FK a Tournaments
  "tournamentId": 1,              // Opcional: FK numérica
  "homeTeam": "Voley Club La Placeta",
  "homeTeamId": 1,                // Opcional: FK a Teams
  "awayTeam": "Voleibol Barcelona",
  "awayTeamId": 2,                // Opcional: FK a Teams
  "homeScore": 3,                 // Número de sets ganados (0-3)
  "awayScore": 1,                 // Número de sets ganados (0-3)
  "sets": [25, 23, 28, 25],       // Puntos de cada set
  "status": "Finalizado",         // Programado | En Curso | Finalizado | Suspendido
  "winner": "Voley Club La Placeta",
  "winnerId": 1,                  // Opcional: ID del ganador
  "category": "MASCULINO",        // MASCULINO | FEMENINO | JUVENIL | MIXTO
  "venue": "Pabellón La Placeta",
  "venueId": 1,                   // Opcional: FK a Venues
  "attendance": 350,              // Opcional: número de asistentes
  "referee": "Juan Díaz",         // Opcional
  "notes": "Buen partido",        // Opcional
  "broadcasted": false,           // Opcional
  "videoUrl": "https://..."       // Opcional
}
```

### 5. Torneos (Tournaments)

```javascript
{
  "id": 1,
  "name": "Superliga Estatal",
  "level": "Profesional",         // Amateur | Semi-profesional | Profesional
  "season": "2024-2025",
  "category": "MASCULINO",        // MASCULINO | FEMENINO | JUVENIL | MIXTO
  "status": "En curso",           // Próxima | En curso | Finalizado | Suspendido
  "startDate": "2024-09-15",
  "endDate": "2025-05-30",
  "division": "Primera División",
  "description": "Competición regular de élite",
  "matchCount": 15,               // Total de partidos
  "ourMatches": 7,                // Partidos jugados por VCPL
  "teamsCount": 8,                // Número de equipos
  "format": "Liga",               // Liga | Copa | Torneo | Playoff
  "organizer": "Federación Española de Voleibol"
}
```

### 6. Noticias (News)

```javascript
{
  "id": 1,
  "date": "2024-11-20",
  "datetime": "2024-11-20T15:30:00Z",
  "title": "¡Victoria Aplastante! Senior Masculino Vence 3-1 a Barcelona",
  "excerpt": "El equipo masculino demuestra su superioridad...",
  "content": "Contenido largo del artículo con HTML...",
  "category": "Resultados",       // Resultados | Entrenamientos | Noticias | Convocatoria
  "author": "Administrador",
  "featured": true,               // En portada
  "image": "url/to/image.jpg",    // Opcional
  "viewCount": 234,               // Opcional: número de vistas
  "slug": "victoria-bcn-2024"     // Opcional: para URLs amigables
}
```

### 7. Próximo Partido (Next Match)

```javascript
{
  "id": 100,
  "date": "2024-12-01",
  "time": "20:30",
  "tournament": "Superliga Estatal",
  "homeTeam": "Voley Club La Placeta",
  "awayTeam": "Potencia Voleibol Valencia",
  "venue": "Pabellón La Placeta, Barcelona",
  "category": "MASCULINO",
  "tickets": "Disponibles",
  "capacity": 500,
  "ticketPrice": 15,
  "purchaseUrl": "https://tickets.example.com"
}
```

---

## 🔌 Endpoints API (Sugeridos)

### Club

```
GET  /api/club              → Info general del club
GET  /api/club/stats        → Estadísticas del club
```

### Equipos

```
GET  /api/teams             → Todos los equipos
GET  /api/teams/:id         → Equipo específico
POST /api/teams             → Crear equipo (admin)
PUT  /api/teams/:id         → Actualizar equipo (admin)
```

### Jugadores

```
GET  /api/players           → Todos los jugadores
GET  /api/players/:id       → Jugador específico
GET  /api/players?teamId=1  → Jugadores por equipo
GET  /api/players?search=... → Buscar jugador
POST /api/players           → Agregar jugador (admin)
PUT  /api/players/:id       → Actualizar jugador (admin)
DELETE /api/players/:id     → Eliminar jugador (admin)
```

### Partidos

```
GET  /api/matches           → Todos los partidos
GET  /api/matches/:id       → Partido específico
GET  /api/matches?limit=5   → Últimos N partidos
GET  /api/matches?status=finalizado  → Filtrar por estado
GET  /api/matches?category=MASCULINO → Filtrar por categoría
POST /api/matches           → Crear partido (admin)
PUT  /api/matches/:id       → Actualizar resultado (admin)
```

### Torneos

```
GET  /api/tournaments       → Todos los torneos
GET  /api/tournaments/:id   → Torneo específico
GET  /api/tournaments/active → Torneos en curso
POST /api/tournaments       → Crear torneo (admin)
```

### Noticias

```
GET  /api/news              → Todas las noticias
GET  /api/news/:id          → Noticia específica
GET  /api/news?featured=true → Noticias destacadas
GET  /api/news?category=... → Por categoría
POST /api/news              → Crear noticia (admin)
PUT  /api/news/:id          → Actualizar (admin)
DELETE /api/news/:id        → Eliminar (admin)
```

### Próximo Partido

```
GET  /api/next-match        → Info próximo partido
```

### Formulario de Contacto

```
POST /api/contact           → Enviar mensaje
  {
    "name": "string",
    "email": "string",
    "phone": "string",
    "category": "string",
    "message": "string",
    "timestamp": "ISO8601"
  }
```

---

## 🔄 Integración con la Aplicación

### Paso 1: Reemplazar Mock Data

**En `js/data.js`:**

```javascript
// Antes (mock data)
const players = [
  { id: 1, name: 'David Hernández', ... },
  // ...
];

// Después (desde API)
let players = [];

async function loadPlayers() {
  try {
    const response = await fetch('/api/players');
    players = await response.json();
    renderPlayerGrid();  // Renderizar después de cargar
  } catch (error) {
    console.error('Error cargando jugadores:', error);
  }
}

// Ejecutar al iniciar
document.addEventListener('DOMContentLoaded', loadPlayers);
```

### Paso 2: Enviar Formularios

**En `js/app.js`, función `setupContactForm()`:**

```javascript
function setupContactForm() {
  const form = document.querySelector('.form-section form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      category: formData.get('category'),
      message: formData.get('message'),
      timestamp: new Date().toISOString()
    };

    try {
      // Enviar a servidor
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showFormSuccess();
        form.reset();
      } else {
        alert('Error al enviar. Intenta más tarde.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  });
}
```

### Paso 3: Cargar Datos Dinámicamente

```javascript
// En la página de inicio
async function initHomePage() {
  await loadNextMatch();
  await loadNews();
  await loadClubStats();
  renderNextMatch();
  renderNewsFeed();
  renderClubStats();
}

async function loadNextMatch() {
  try {
    const response = await fetch('/api/next-match');
    window.nextMatch = await response.json();
  } catch (error) {
    console.log('Usando nextMatch mock', error);
  }
}
```

---

## 🔐 Autenticación (Opcional para Admin)

```javascript
// Login
POST /api/auth/login
{
  "username": "admin",
  "password": "secure_password"
}

// Respuesta
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "admin" }
}

// Usar token en requests
fetch('/api/players', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
  }
})
```

---

## 📝 Formatos de Respuesta

### Success (200)

```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

### Error (4xx/5xx)

```json
{
  "success": false,
  "error": "Mensaje de error",
  "code": 400
}
```

### Listado

```json
{
  "success": true,
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "perPage": 10,
  "pages": 5
}
```

---

## 🗄️ Sugerencia Base de Datos (SQL)

```sql
-- Tablas principales
CREATE TABLE clubs (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  founded INT,
  city VARCHAR(100),
  country VARCHAR(100)
);

CREATE TABLE teams (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(20),
  club_id INT FOREIGN KEY REFERENCES clubs(id),
  coach VARCHAR(255)
);

CREATE TABLE players (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  number INT,
  position VARCHAR(50),
  team_id INT FOREIGN KEY REFERENCES teams(id),
  birthYear INT
);

CREATE TABLE tournaments (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  season VARCHAR(10),
  category VARCHAR(20),
  status VARCHAR(20)
);

CREATE TABLE matches (
  id INT PRIMARY KEY,
  date DATE,
  time TIME,
  home_team_id INT FOREIGN KEY REFERENCES teams(id),
  away_team_id INT FOREIGN KEY REFERENCES teams(id),
  home_score INT,
  away_score INT,
  tournament_id INT FOREIGN KEY REFERENCES tournaments(id)
);

CREATE TABLE news (
  id INT PRIMARY KEY,
  date DATE,
  title VARCHAR(255),
  content LONGTEXT,
  category VARCHAR(50),
  featured BOOLEAN
);

CREATE TABLE contact_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  category VARCHAR(50),
  message LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Pruebas con Postman

### Ejemplo: GET /api/players

**URL:** `http://localhost:3000/api/players`

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "David Hernández",
      "number": 1,
      "position": "Líbero",
      "teamId": 1
    }
  ],
  "total": 14
}
```

---

## 📋 Checklist de Integración

- [ ] Endpoints API creados
- [ ] Base de datos configurada
- [ ] CORS habilitado (si es en dominio diferente)
- [ ] Autenticación implementada
- [ ] Reemplazar mock data por API calls
- [ ] Formularios enviando al servidor
- [ ] Manejo de errores implementado
- [ ] Validación de datos en backend
- [ ] Pruebas con Postman/Thunder Client
- [ ] Despliegue en producción

---

## 🚀 Framework Backend Sugeridos

- **Node.js + Express** - Rápido, JavaScript
- **Python + Django** - Robusto, escalable
- **PHP + Laravel** - Fácil hosting
- **Java + Spring** - Enterprise
- **.NET + ASP.NET** - Microsoft stack

---

## 📚 Recursos

- REST API Best Practices: https://restfulapi.net/
- HTTP Status Codes: https://httpwg.org/specs/rfc7231.html#status.codes
- JSON Schema: https://json-schema.org/
- API Documentation: https://swagger.io/

---

**¡Listo para conectar con tu backend!** 🔌
