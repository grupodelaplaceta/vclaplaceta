/**
 * ========================================
 * ÁREA DEL JUGADOR - VOLEY CLUB LA PLACETA
 * ========================================
 * Login con PlacetaID (PLID26) y portal personal:
 * cartera, cuotas personalizadas, gastos, calendario,
 * confirmación de torneos y cierre de año con reparto.
 * ========================================
 */

// ── CONFIGURACIÓN PLACETAID ──────────────────────────────────────────────────
const PLACETAID_BASE = 'https://id.laplaceta.org'; // URL de la pasarela PlacetaID
const PLACETAID_CLIENT_ID = 'voley-club'; // apiKey de "Voley Club La Placeta" registrada en PlacetaID

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';


// ── UTILIDADES ───────────────────────────────────────────────────────────────
function eur(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
}
function fechaLarga(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function show(el) { if (el) el.style.display = 'block'; }
function hide(el) { if (el) el.style.display = 'none'; }
function errorMsg(msg) {
  const b = document.getElementById('errorBanner');
  if (!msg) { hide(b); return; }
  b.textContent = msg;
  show(b);
}

// ── SESIÓN ───────────────────────────────────────────────────────────────────
function getSession() {
  const dip = sessionStorage.getItem('vcpl_jugador_dip');
  const nombre = sessionStorage.getItem('vcpl_jugador_nombre');
  if (!dip) return null;
  return { dip, nombre };
}
function logout() {
  ['vcpl_jugador_dip', 'vcpl_jugador_nombre', 'vcpl_jugador_user', 'vcpl_jugador_token'].forEach(k => sessionStorage.removeItem(k));
  location.reload();
}

// ── LOGIN PLACETAID ──────────────────────────────────────────────────────────
function loginWithPlacetaid() {
  const callback = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}auth/callback.html`;
  const url = `${PLACETAID_BASE}/?client_id=${encodeURIComponent(PLACETAID_CLIENT_ID)}&redirect_uri=${encodeURIComponent(callback)}&platform=web&state=vcpl-${Date.now()}`;
  window.location.href = url;
}

// ── API ──────────────────────────────────────────────────────────────────────
async function fetchJugador(dip) {
  const res = await fetch(`${API_BASE}/jugador/${encodeURIComponent(dip)}`);
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    let msg = `Error ${res.status}`;
    try { msg = JSON.parse(t).error || msg; } catch (e) {}
    throw new Error(msg);
  }
  return await res.json();
}

async function confirmarTorneo(dip, torneoId, confirmacion) {
  const res = await fetch(`${API_BASE}/jugador/${encodeURIComponent(dip)}/torneos/${torneoId}/confirmar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmacion })
  });
  if (!res.ok) throw new Error('No se pudo confirmar el torneo');
  return await res.json();
}

async function aplicarCierre(dip, payload) {
  const res = await fetch(`${API_BASE}/jugador/${encodeURIComponent(dip)}/cierre`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'No se pudo aplicar el cierre');
  return data;
}

// ── RENDER ───────────────────────────────────────────────────────────────────
function renderJugador(d) {
  document.getElementById('jugadorNombre').textContent = d.miembro.nombre;
  document.getElementById('jugadorMeta').textContent = `${d.miembro.posicion || 'Jugador'} · DIP ${d.miembro.dip || '—'}${d.miembro.planId === 'suplente' ? ' · Suplente' : ''}`;
  document.getElementById('carteraSaldo').textContent = eur(d.cartera.saldo);
  document.getElementById('cuotasPagadas').textContent = eur(d.cuotas.totalPagadas);
  document.getElementById('cuotasPendientes').textContent = eur(d.cuotas.totalPendientes);
  document.getElementById('creditoCuotas').textContent = eur(d.creditoCuotas);

  renderMovimientos(d.cartera.movimientos);
  renderCuotas(d.cuotas.items);
  renderGastos(d.gastos);
  renderAportaciones(d.aportaciones);
  renderCalendario(d.calendario);
  renderTorneos(d);
  renderCierre(d);
}

function renderMovimientos(movs) {
  const c = document.getElementById('carteraMovimientos');
  if (!movs || !movs.length) { c.innerHTML = '<div class="loading-note">Sin movimientos.</div>'; return; }
  c.innerHTML = movs.map(m => `
    <div class="mov-line">
      <span>${esc(m.concepto)} <span class="fecha">· ${esc(m.fecha)}</span></span>
      <span class="${m.tipo === 'ingreso' ? 'ingreso' : 'gasto'}">${m.tipo === 'ingreso' ? '+' : '−'}${eur(m.cantidad)}</span>
    </div>`).join('');
}

function renderCuotas(items) {
  const tb = document.getElementById('cuotasTabla');
  if (!items || !items.length) { tb.innerHTML = '<tr><td colspan="4" style="color:#999;">Sin cuotas registradas.</td></tr>'; return; }
  tb.innerHTML = items.map(c => `
    <tr>
      <td>${esc(c.mes)}</td>
      <td>${eur(c.importe)}</td>
      <td><span class="chip chip-${c.estado}">${esc(c.label)}</span></td>
      <td>${c.fechaPago ? fechaLarga(c.fechaPago) : '—'}</td>
    </tr>`).join('');
}

function renderGastos(gastos) {
  const c = document.getElementById('gastosLista');
  if (!gastos || !gastos.length) { c.innerHTML = '<div class="loading-note">Sin gastos personales.</div>'; return; }
  c.innerHTML = gastos.map(g => `
    <div class="mov-line">
      <span>${esc(g.concepto)} <span class="fecha">· ${esc(g.fecha)}</span></span>
      <span class="gasto">−${eur(g.cantidad)}</span>
    </div>`).join('');
}

function renderAportaciones(aps) {
  const c = document.getElementById('aportacionesLista');
  if (!aps || !aps.length) { c.innerHTML = '<div class="loading-note">Sin aportaciones todavía.</div>'; return; }
  c.innerHTML = aps.map(a => `
    <div class="mov-line">
      <span>${esc(a.proyecto)} <span class="fecha">· ${esc(a.fecha)}</span></span>
      <span class="ingreso">${eur(a.cantidad)} <small style="color:#666;">(${a.porcentajeGanancia}% si se vende)</small></span>
    </div>`).join('');
}

function renderCalendario(cal) {
  document.getElementById('proximosPartidos').innerHTML = (cal.proximos || []).map(p => partidoLine(p)).join('') || '<div class="loading-note">Sin próximos partidos.</div>';
  document.getElementById('ultimosPartidos').innerHTML = (cal.ultimos || []).slice(0, 6).map(p => partidoLine(p, true)).join('') || '<div class="loading-note">Sin resultados.</div>';
}
function partidoLine(p, conResultado) {
  const res = conResultado && p.setsLocal != null
    ? `<strong>${p.setsLocal} - ${p.setsVisitante}</strong> ${esc(p.resultado || '')}`
    : `vs ${esc(p.visitante === 'Voley Club La Placeta' ? p.local : p.visitante)}`;
  return `<div class="mov-line">
    <span><strong>${esc(p.fecha)}</strong> ${esc(p.hora || '')}<br><small style="color:#888;">${esc(p.torneo || 'Amistoso')} · ${esc(p.local)} vs ${esc(p.visitante)}</small></span>
    <span class="chip chip-info">${res}</span>
  </div>`;
}

function renderTorneos(d) {
  const c = document.getElementById('torneosLista');
  if (!d.torneos || !d.torneos.length) { c.innerHTML = '<div class="loading-note">Sin torneos asignados.</div>'; return; }
  c.innerHTML = d.torneos.map(t => `
    <div class="torneo-row" data-id="${t.id}">
      <div>
        <strong>${esc(t.nombre)}</strong> <span class="chip chip-info">${esc(t.estado)}</span><br>
        <small style="color:#888;">${fechaLarga(t.fecha)} · ${eur(t.precioPorJugador)}/jugador</small>
      </div>
      <div style="display:flex; gap:.4rem;">
        <button class="btn-mini btn-confirmar" data-c="confirmado">✓ Voy</button>
        <button class="btn-mini btn-rechazar" data-c="rechazado">✗ No voy</button>
        <span class="chip chip-${t.confirmacion}" style="align-self:center;">${esc(t.confirmacion)}</span>
      </div>
    </div>`).join('');

  c.querySelectorAll('button[data-c]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const torneoId = Number(btn.closest('.torneo-row').dataset.id);
      try {
        await confirmarTorneo(d.miembro.dip, torneoId, btn.dataset.c);
        reloadArea();
      } catch (e) { errorMsg(e.message); }
    });
  });
}

// ── CIERRE DE AÑO ────────────────────────────────────────────────────────────
let _cierreData = null;

function renderCierre(d) {
  _cierreData = d;
  const año = d.cierre.año;
  document.getElementById('cierreAño').textContent = año;
  const c = document.getElementById('cierreContenido');
  const s = d.cierre;

  c.innerHTML = `
    <div style="display:flex; gap:1.2rem; flex-wrap:wrap; margin-bottom:1rem;">
      <div class="cierre-box" style="flex:1; min-width:220px;">
        <h3>💶 Dinero sobrante (sin gastar)</h3>
        <div class="big-number">${eur(s.sobrante)}</div>
        <small style="color:#888;">Ingresado este año: ${eur(s.ingresosAño)} · Cuotas año próximo (referencia): ${eur(s.cuotasProximoAño)}</small>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1rem;">
      <div class="cierre-box">
        <h3>🔁 Si renuevo</h3>
        <p style="font-size:.85rem; margin:.2rem 0;">Comisión <strong>20%</strong> → Grupo de La Placeta</p>
        <div class="big-number" style="font-size:1.4rem;">${eur(s.escenarios.renovando.comision)}</div>
        <p style="font-size:.85rem; margin:.2rem 0;">Neto a repartir: <strong>${eur(s.escenarios.renovando.neto)}</strong></p>
      </div>
      <div class="cierre-box">
        <h3>🚪 Si NO renuevo</h3>
        <p style="font-size:.85rem; margin:.2rem 0;">Comisión <strong>30%</strong> → Grupo de La Placeta</p>
        <div class="big-number" style="font-size:1.4rem;">${eur(s.escenarios.sinRenovar.comision)}</div>
        <p style="font-size:.85rem; margin:.2rem 0;">Neto a repartir: <strong>${eur(s.escenarios.sinRenovar.neto)}</strong></p>
      </div>
    </div>

    <div style="margin-top:1.2rem;">
      <h3 style="font-size:.95rem; color:#1a0040;">Reparte tu neto personalizadamente</h3>
      <label style="font-size:.85rem;"><input type="checkbox" id="renuevaChk" checked> Renuevo para la temporada ${año + 1}</label>

      <div class="form-row">
        <label style="font-size:.85rem;">Cuotas del año que viene:</label>
        <input type="number" id="repCuotas" min="0" step="0.01" value="0" style="width:110px;"> €
        <small style="color:#888;">se restará de tus cuotas de ${año + 1}</small>
      </div>

      <div id="repartoProyectos" style="margin:.6rem 0;"></div>

      <div style="margin-top:.6rem; font-size:.85rem;">
        Neto disponible: <strong id="netoDisponible">—</strong> · Repartido: <strong id="repartidoTotal">—</strong> ·
        Restante: <strong id="restanteNeto">—</strong>
      </div>
      <button class="btn-primary-j" id="btnAplicarCierre" style="margin-top:.8rem;">Aplicar cierre de año</button>
    </div>`;

  // Proyectos
  const pc = document.getElementById('repartoProyectos');
  pc.innerHTML = (d.proyectos || []).map(p => `
    <div class="form-row">
      <span style="font-size:.85rem; flex:1;">${esc(p.nombre)} <small style="color:#888;">(+${p.porcentajeGanancia}% si se vende)</small></span>
      <input type="number" min="0" step="0.01" value="0" data-proyecto="${p.id}" data-ganancia="${p.porcentajeGanancia || 0}" style="width:110px;"> €
    </div>`).join('') || '<small style="color:#888;">No hay proyectos activos.</small>';

  function updateNeto() {
    const renueva = document.getElementById('renuevaChk').checked;
    const neto = renueva ? s.escenarios.renovando.neto : s.escenarios.sinRenovar.neto;
    const cuotas = Number(document.getElementById('repCuotas').value || 0);
    let proyectos = 0;
    document.querySelectorAll('#repartoProyectos input').forEach(i => proyectos += Number(i.value || 0));
    const total = cuotas + proyectos;
    document.getElementById('netoDisponible').textContent = eur(neto);
    document.getElementById('repartidoTotal').textContent = eur(total);
    const rest = neto - total;
    document.getElementById('restanteNeto').textContent = eur(Math.max(0, rest));
    document.getElementById('restanteNeto').style.color = rest < 0 ? '#c0392b' : '#1e8449';
  }
  document.getElementById('renuevaChk').addEventListener('change', updateNeto);
  document.getElementById('repCuotas').addEventListener('input', updateNeto);
  pc.querySelectorAll('input').forEach(i => i.addEventListener('input', updateNeto));
  updateNeto();

  document.getElementById('btnAplicarCierre').addEventListener('click', async () => {
    const renueva = document.getElementById('renuevaChk').checked;
    const reparto = [];
    const cuotas = Number(document.getElementById('repCuotas').value || 0);
    if (cuotas > 0) reparto.push({ destino: 'cuotas', cantidad: cuotas });
    pc.querySelectorAll('input').forEach(i => {
      const cant = Number(i.value || 0);
      if (cant > 0) reparto.push({ destino: 'proyecto', proyectoId: Number(i.dataset.proyecto), cantidad: cant });
    });
    try {
      const r = await aplicarCierre(d.miembro.dip, { año: s.año, renueva, reparto });
      alert('Cierre aplicado. Comisión para gestión: ' + eur(r.cierre.comision) + ' (' + r.cierre.comisionPct + '%) → ' + r.cierre.destinoComision);
      reloadArea();
    } catch (e) { errorMsg(e.message); }
  });
}

// ── INICIALIZACIÓN ────────────────────────────────────────────────────────────
async function reloadArea() {
  errorMsg(null);
  const ses = getSession();
  const loginSection = document.getElementById('loginSection');
  const areaSection = document.getElementById('areaSection');

  if (!ses) {
    show(loginSection); hide(areaSection);
    return;
  }

  show(areaSection); hide(loginSection);
  try {
    const d = await fetchJugador(ses.dip);
    renderJugador(d);
  } catch (e) {
    errorMsg(e.message);
    // Mostrar el área vacía con el error y permitir re-login
    document.getElementById('jugadorNombre').textContent = ses.nombre || ses.dip;
    document.getElementById('jugadorMeta').textContent = 'DIP ' + ses.dip;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ses = getSession();
  const loginSection = document.getElementById('loginSection');
  const areaSection = document.getElementById('areaSection');

  document.getElementById('btnPlacetaid').addEventListener('click', loginWithPlacetaid);
  document.getElementById('btnLogout').addEventListener('click', logout);

  // Si venimos del callback ya hay sesión
  if (!ses) { show(loginSection); hide(areaSection); }
  reloadArea();
});
