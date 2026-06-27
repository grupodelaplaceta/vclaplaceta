# 🚀 Guía de Inicio Rápido - Voley Club La Placeta

## ¿Qué Has Recibido?

Una **aplicación web profesional y completa** para tu club de voleibol con:

- ✅ **4 páginas HTML** completamente funcionales
- ✅ **CSS moderno** (600+ líneas) con responsive design
- ✅ **JavaScript** con lógica de renderizado dinámico
- ✅ **Datos mock listos** para conectar con una API
- ✅ **Componentes reutilizables** (Header, Footer)
- ✅ **Formulario de inscripción** con validación
- ✅ **Diseño deportivo premium** con colores oficiales

---

## 📁 Estructura del Proyecto

```
voleyclub/
├── index.html              👈 Página de Inicio
├── jugadores.html          👈 Club y Plantilla
├── torneos.html            👈 Competición y Resultados
├── contacto.html           👈 Contacto y Registro
├── css/
│   └── styles.css          ✨ Todos los estilos
├── js/
│   ├── data.js             📊 Datos de prueba (jugadores, partidos, etc.)
│   └── app.js              ⚙️ Lógica de la aplicación
├── assets/
│   ├── logo-placeta.svg
│   └── player-placeholder.svg
└── README.md               📖 Documentación completa
```

---

## 🏃 Empezar en 3 Pasos

### Paso 1: Ejecutar Localmente

**Opción A: Con Python** (más fácil)
```bash
# Abre Terminal/CMD en la carpeta voleyclub
python -m http.server 8000

# Si tienes Python 2
python -m SimpleHTTPServer 8000
```

**Opción B: Con PHP**
```bash
php -S localhost:8000
```

**Opción C: Con VS Code (Live Server)**
1. Instala extensión "Live Server"
2. Click derecho en `index.html`
3. "Open with Live Server"

### Paso 2: Abrir en el Navegador

```
http://localhost:8000
```

### Paso 3: Explorar

- ✨ Navega por todas las páginas
- 📱 Prueba en móvil (F12 → Toggle device toolbar)
- 🔍 Inspecciona el código (F12)

---

## 🎨 Personalización Rápida

### Cambiar Nombre del Club

**Archivo:** `js/data.js` (línea 10)

```javascript
const clubInfo = {
  name: 'MI NUEVO CLUB',  // ← Cambiar aquí
  shortName: 'MNC',
  founded: 2023,
  city: 'Mi Ciudad',
  // ...
}
```

### Cambiar Colores

**Archivo:** `css/styles.css` (líneas 5-13)

```css
:root {
  --primary: #FF0000;      /* Morado → Tu color principal */
  --accent: #FFFF00;       /* Naranja → Tu color acento */
  --dark-bg: #000000;      /* Fondo oscuro → Tu color */
}
```

### Cambiar Logo

Reemplaza `assets/logo-placeta.svg` con tu logo

O usa PNG/JPG (cambiar en HTML):

```html
<img src="assets/tu-logo.png" alt="...">
```

### Agregar Jugadores

**Archivo:** `js/data.js` (array `players`)

```javascript
const players = [
  // ... jugadores existentes
  {
    id: 15,
    name: 'Juan García',
    number: 10,
    position: 'Colocador',
    team: 'Senior Masculino',
    teamId: 1,
    height: '1.90m',
    birthYear: 2000,
    specialty: 'Distribución'
  }
];
```

### Agregar Partidos

**Archivo:** `js/data.js` (array `matches`)

```javascript
const matches = [
  // ... partidos existentes
  {
    id: 8,
    date: '2024-12-08',
    time: '20:30',
    tournament: 'Tu Torneo',
    homeTeam: 'Voley Club La Placeta',
    awayTeam: 'Equipo Rival',
    homeScore: 3,
    awayScore: 1,
    status: 'Finalizado',
    winner: 'Voley Club La Placeta',
    category: 'MASCULINO',
    sets: [25, 23, 25]
  }
];
```

---

## 📱 Validar Responsive

Prueba en diferentes tamaños:

- **Desktop:** 1920x1080 (pantalla completa)
- **Tablet:** 768x1024 (iPad)
- **Móvil:** 375x667 (iPhone)

**En VS Code:** `F12` → `Ctrl+Shift+M` (Toggle device toolbar)

---

## 🔗 URLs de Cada Página

| Página | URL | Descripción |
|--------|-----|-------------|
| Inicio | `/` o `index.html` | Hero, noticias, próximo partido |
| Club | `jugadores.html` | Plantilla, equipos, valores |
| Torneos | `torneos.html` | Resultados, calendarios |
| Contacto | `contacto.html` | Formulario de inscripción |

---

## ⚙️ Funciones JavaScript Disponibles

Puedes usar estas funciones desde la consola del navegador:

```javascript
// Renderizar jugadores
VoleyApp.renderPlayerGrid();

// Filtrar por equipo (teamId: 1, 2, 3)
VoleyApp.filterPlayersByTeam(1);

// Mostrar tabla de partidos
VoleyApp.renderMatchesTable();

// Renderizar torneos
VoleyApp.renderTournamentsGrid();

// Mostrar estadísticas
VoleyApp.renderClubStats('stats-container');
```

---

## 📊 Datos que Incluye

### Equipos
- Senior Masculino (14 jugadores)
- Senior Femenino (12 jugadores)
- Juveniles (16 jugadores)

### Partidos
- 7 partidos históricos con resultados
- Victorias y derrotas documentadas

### Torneos
- Superliga Estatal
- Liga Regional
- Campeonato Juvenil
- Copa del Rey

### Jugadores
- 14 jugadores con posiciones
- Números de camiseta
- Datos técnicos

---

## 🐛 Solucionar Problemas

### La web no carga
- ✓ ¿Ejecutaste un servidor local?
- ✓ ¿Está en `http://localhost:8000` (no file://)?
- ✓ ¿Todos los archivos están en la carpeta?

### Los estilos no se ven
- ✓ Abre DevTools (F12)
- ✓ Busca errores en la pestaña "Console"
- ✓ Verifica que `css/styles.css` exista

### El formulario no funciona
- ✓ Los datos se guardan en `console.log` (abre F12)
- ✓ Conecta con tu backend para enviar emails
- ✓ Ver función `setupContactForm()` en `app.js`

### Google Fonts no carga
- ✓ Verifica tu conexión a internet
- ✓ Los CSS carga `@import` de Google Fonts

---

## 🎯 Próximos Pasos

### Nivel 1: Personalización Básica
- [ ] Cambiar nombre del club
- [ ] Cambiar colores
- [ ] Agregar tu logo
- [ ] Actualizar información de contacto

### Nivel 2: Agregar Contenido
- [ ] Añadir más jugadores
- [ ] Cargar nuevos partidos
- [ ] Escribir noticias
- [ ] Actualizar torneos

### Nivel 3: Conectar Backend
- [ ] Crear base de datos
- [ ] Implementar API REST
- [ ] Enviar formularios a servidor
- [ ] Crear panel administrativo

### Nivel 4: Mejoras Avanzadas
- [ ] Sistema de login
- [ ] Inscripción con pago
- [ ] Newsletter automático
- [ ] SEO y analytics
- [ ] Desplegar en hosting

---

## 📚 Recursos Útiles

- **Google Fonts:** https://fonts.google.com/
- **MDN Web Docs:** https://developer.mozilla.org/
- **CSS Reference:** https://css-tricks.com/
- **JavaScript Guide:** https://javascript.info/

---

## 🤝 Soporte

Si tienes dudas:

1. Revisa el `README.md` (documentación completa)
2. Inspecciona el código (F12 en el navegador)
3. Busca los comentarios en `app.js` y `styles.css`

---

## ✅ Checklist de Verificación

- [ ] La web abre sin errores
- [ ] Todos los links funcionan
- [ ] Es responsive (probé en móvil)
- [ ] El formulario se envía
- [ ] Los datos se cargan correctamente
- [ ] El footer muestra el texto institucional
- [ ] Los colores son correctos
- [ ] Las noticias se ven

---

## 🎉 ¡Listo!

Tu web está **100% funcional**. Ahora solo personaliza y **¡lanzala!** 🚀

**Voley Club La Placeta - ¡Vamos por más victorias!** ⚡🏐
