/* ================================================================
   Etiquetas DDS · App de clientes
   - Login con Supabase (correo + contraseña)
   - Cada cliente ve solo SUS datos (fila propia en 'profiles')
   - El nombre de la tienda lo fija el admin (no lo edita el cliente)
   - Marca de agua en la vista previa (no se imprime)
   ================================================================ */

// ---------- Paleta de colores elegante (incluye dorado) ----------
const PALETTE = [
  ["#111111", "Negro clásico"],
  ["#6e1f2a", "Vino / Burdeos"],
  ["#1c2b4a", "Azul noche"],
  ["#1f5c46", "Verde esmeralda"],
  ["#3a3f45", "Grafito"],
  ["#7a5c86", "Ciruela suave"],
  ["#b8964f", "Dorado elegante"],
  ["#9a7b3f", "Champán"]
];

// ---------- Iconos redes (a color) ----------
const FB = '<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>';
const IG = '<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="igg" x1="1" y1="23" x2="23" y2="1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#feda75"/><stop offset=".3" stop-color="#fa7e1e"/><stop offset=".6" stop-color="#d62976"/><stop offset=".85" stop-color="#962fbf"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect x="2.5" y="2.5" width="19" height="19" rx="5.2" stroke="url(#igg)" stroke-width="2"/><circle cx="12" cy="12" r="4.6" stroke="url(#igg)" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.2" fill="url(#igg)"/></svg>';
const TTP = 'M16.6 3c.29 2.02 1.55 3.53 3.9 3.75v2.63c-1.42.05-2.68-.34-3.9-1.06v6.72c0 3.4-2.7 5.86-5.93 5.5-2.94-.33-4.98-3.02-4.5-5.98.36-2.28 2.32-4.02 4.75-4.05.33 0 .66.02.98.09v2.83c-.31-.1-.63-.16-.98-.16-1.5 0-2.66 1.35-2.35 2.9.2 1 1.05 1.78 2.07 1.9 1.5.16 2.77-1 2.77-2.46V3h3.12z';
const TT = '<svg viewBox="0 0 24 24"><path d="'+TTP+'" fill="#25F4EE" transform="translate(-0.8,-0.8)"/><path d="'+TTP+'" fill="#FE2C55" transform="translate(0.8,0.8)"/><path d="'+TTP+'" fill="#111"/></svg>';

const TOTAL = 50; // 5 x 10

// ---------- Estado ----------
let sb = null;
let user = null;
let brandName = "TU MARCA";
let state = {
  perfumes: [ { nombre:"", casa:"", conc:"Eau de Parfum", img:null } ],
  settings: {
    accent:"#6e1f2a", cBrand:"#6e1f2a", cName:"#111111", cHouse:"#111111", cHandle:"#111111",
    conn:"Tipo", fit:"cover", handle:"@tu.usuario"
  }
};

// ---------- Utilidades ----------
function esc(t){ return (t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function nameClass(n){ const l=(n||'').length; return l<=14?'s1':l<=22?'s2':'s3'; }
function houseClass(n){ const l=(n||'').length; return l<=12?'h1':l<=18?'h2':'h3'; }
function $(id){ return document.getElementById(id); }

function optionsHTML(selected){
  return PALETTE.map(([v,n]) => '<option value="'+v+'"'+(v===selected?' selected':'')+'>'+n+'</option>').join('');
}

// Comprime/achica la imagen antes de guardarla (mantiene calidad para impresión pequeña)
function compressImage(file, cb){
  const rd = new FileReader();
  rd.onload = e => {
    const img = new Image();
    img.onload = () => {
      const max = 700; let w = img.width, h = img.height;
      const s = Math.min(1, max/Math.max(w,h)); w = Math.round(w*s); h = Math.round(h*s);
      const c = document.createElement('canvas'); c.width=w; c.height=h;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,w,h);
      ctx.drawImage(img,0,0,w,h);
      cb(c.toDataURL('image/jpeg', 0.85));
    };
    img.src = e.target.result;
  };
  rd.readAsDataURL(file);
}

// ---------- Marca de agua (solo en pantalla) ----------
function renderWatermark(){
  const wm = $('wm');
  const txt = (brandName || 'DDS').toUpperCase();
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='170'>"+
    "<text x='0' y='95' font-family='Arial' font-size='22' fill='rgba(0,0,0,0.10)' "+
    "transform='rotate(-30 160 85)'>"+ txt +"</text></svg>";
  wm.style.backgroundImage = "url(\"data:image/svg+xml;utf8,"+ encodeURIComponent(svg) +"\")";
}

// ---------- Colores ----------
function applyColors(){
  const s = state.settings;
  const r = document.documentElement.style;
  r.setProperty('--accent', s.accent);
  r.setProperty('--c-brand', s.cBrand);
  r.setProperty('--c-name',  s.cName);
  r.setProperty('--c-house', s.cHouse);
  r.setProperty('--c-handle',s.cHandle);
}

// ---------- Editor (tarjetas de perfumes) ----------
function renderEditor(){
  const box = $('cards'); box.innerHTML = '';
  state.perfumes.forEach((p,i)=>{
    const c = document.createElement('div'); c.className='card';
    c.innerHTML =
      '<div class="grid2">'+
        '<input type="text" placeholder="Nombre del perfume" value="'+esc(p.nombre)+'" oninput="upd('+i+',\'nombre\',this.value)">'+
        '<input type="text" placeholder="Casa (ej: Dior)" value="'+esc(p.casa)+'" oninput="upd('+i+',\'casa\',this.value)">'+
        '<input class="full" type="text" placeholder="Concentración" value="'+esc(p.conc)+'" oninput="upd('+i+',\'conc\',this.value)">'+
      '</div>'+
      '<div class="imgrow">'+
        (p.img ? '<img class="thumb" src="'+p.img+'">' : '<span style="font-size:12px;color:#999;">Sin imagen</span>')+
        '<input type="file" accept="image/*" onchange="onImg(this,'+i+')">'+
        (p.img ? '<button class="mini" onclick="quitarImg('+i+')">Quitar imagen</button>' : '')+
      '</div>'+
      '<div class="actions"><button class="mini del" onclick="delPerfume('+i+')">Eliminar perfume</button></div>';
    box.appendChild(c);
  });
}

function upd(i,campo,val){ state.perfumes[i][campo]=val; renderSheet(); }
function addPerfume(){ state.perfumes.push({nombre:'',casa:'',conc:'Eau de Parfum',img:null}); renderEditor(); renderSheet(); }
function delPerfume(i){ state.perfumes.splice(i,1); if(state.perfumes.length===0) addPerfume(); else { renderEditor(); renderSheet(); } }
function quitarImg(i){ state.perfumes[i].img=null; renderEditor(); renderSheet(); }
function onImg(input,i){ const f=input.files[0]; if(!f) return; compressImage(f, url => { state.perfumes[i].img=url; renderEditor(); renderSheet(); }); }

// ---------- Controles globales ----------
function readControls(){
  const s = state.settings;
  s.handle = $('handle').value.trim();
  s.conn   = $('conn').value.trim();
  s.fit    = $('fit').value;
  s.accent = $('accent').value;
  s.cBrand = $('cBrand').value;
  s.cName  = $('cName').value;
  s.cHouse = $('cHouse').value;
  s.cHandle= $('cHandle').value;
}
function onControlChange(){ readControls(); applyColors(); renderSheet(); }

// ---------- Hoja ----------
function renderSheet(){
  const s = state.settings;
  const conn = s.conn, handle = s.handle, fit = s.fit;
  const list = state.perfumes.filter(p => (p.nombre||'').trim() !== '');
  const grid = $('grid'); grid.innerHTML = '';
  renderWatermark();
  if(list.length === 0) return;
  const modo = document.querySelector('input[name=modo]:checked').value;
  const social = '<div class="handle">'+esc(handle)+'</div><div class="icons">'+FB+IG+TT+'</div>';
  const brandUP = esc(brandName);
  for(let k=0;k<TOTAL;k++){
    const it = modo === 'uno' ? list[0] : list[k % list.length];
    const el = document.createElement('div');
    el.className = 'label' + (it.img ? ' has-img' : '');
    el.innerHTML =
      '<div class="content">'+
        '<div class="brand">'+brandUP+'</div>'+
        '<div class="name '+nameClass(it.nombre)+'">'+esc(it.nombre)+'</div>'+
        '<div class="sep"></div>'+
        (it.casa ? (conn ? '<div class="insplbl">'+esc(conn)+'</div>' : '') +
                   '<div class="house '+houseClass(it.casa)+'">'+esc(it.casa)+'</div>' : '')+
        (it.conc ? '<div class="conc">'+esc(it.conc)+'</div>' : '')+
        (handle ? social : '')+
      '</div>'+
      (it.img ? '<div class="imgbox '+(fit==='contain'?'fit-contain':'')+'"><img src="'+it.img+'"></div>' : '');
    grid.appendChild(el);
  }
}

// ---------- Pintar controles desde el estado ----------
function fillControls(){
  const s = state.settings;
  $('handle').value = s.handle;
  $('conn').value   = s.conn;
  $('fit').value    = s.fit;
  $('accent').innerHTML = optionsHTML(s.accent);
  $('cBrand').innerHTML = optionsHTML(s.cBrand);
  $('cName').innerHTML  = optionsHTML(s.cName);
  $('cHouse').innerHTML = optionsHTML(s.cHouse);
  $('cHandle').innerHTML= optionsHTML(s.cHandle);
  $('tiendaLabel').textContent = brandName;
}

// ---------- Supabase: cargar y guardar ----------
async function loadData(){
  const { data, error } = await sb.from('profiles').select('brand_name,data').eq('id', user.id).single();
  if(error){ console.warn('perfil:', error.message); }
  if(data){
    brandName = data.brand_name && data.brand_name.trim() ? data.brand_name : brandName;
    if(data.data && data.data.settings){
      state.settings = Object.assign(state.settings, data.data.settings);
      if(Array.isArray(data.data.perfumes) && data.data.perfumes.length) state.perfumes = data.data.perfumes;
    }
  }
}

async function guardar(){
  readControls();
  const btn = $('saveBtn'); const prev = btn.textContent;
  btn.textContent = 'Guardando…'; btn.disabled = true;
  const { error } = await sb.from('profiles').upsert({ id: user.id, data: state, updated_at: new Date().toISOString() });
  btn.disabled = false; btn.textContent = prev;
  const msg = $('saveMsg');
  if(error){ msg.textContent = 'Error al guardar: '+error.message; msg.style.color='#a33'; }
  else { msg.textContent = 'Guardado ✓'; msg.style.color='#2a7'; setTimeout(()=>msg.textContent='', 2500); }
}

// ---------- Sesión / vistas ----------
function showLogin(){ $('login').style.display='flex'; $('app').style.display='none'; }
function showApp(){
  $('login').style.display='none'; $('app').style.display='block';
  fillControls(); applyColors(); renderEditor(); renderSheet();
}

async function entrar(){
  const email = $('email').value.trim();
  const pass  = $('password').value;
  const err = $('loginErr'); err.textContent='';
  if(!sb){ err.textContent='Falta configurar config.js (URL y llave de Supabase).'; return; }
  const btn=$('loginBtn'); btn.disabled=true; btn.textContent='Entrando…';
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  btn.disabled=false; btn.textContent='Entrar';
  if(error){ err.textContent = 'Correo o contraseña incorrectos.'; return; }
  user = data.user;
  await loadData();
  showApp();
}

async function salir(){ if(sb) await sb.auth.signOut(); user=null; showLogin(); }

async function init(){
  try {
    if(window.supabase && window.CFG && !/TU-PROYECTO/.test(window.CFG.url)){
      sb = window.supabase.createClient(window.CFG.url, window.CFG.key);
      const { data:{ session } } = await sb.auth.getSession();
      if(session){ user = session.user; await loadData(); showApp(); return; }
    }
  } catch(e){ console.warn(e); }
  showLogin();
}

window.addEventListener('DOMContentLoaded', init);
