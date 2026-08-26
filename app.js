/* ================================================================
   Etiquetas DDS · App de clientes
   ================================================================ */

const PALETTE = [
  ["#111111","Negro"],["#ffffff","Blanco"],["#f3ead8","Marfil / crema"],
  ["#6e1f2a","Vino / Burdeos"],["#1c2b4a","Azul noche"],["#5b8bd0","Azul claro"],
  ["#1f5c46","Verde esmeralda"],["#3a3f45","Grafito"],["#7a5c86","Ciruela suave"],
  ["#c2a24d","Dorado elegante"]
];
const BG = [["#ffffff","Blanco"],["#000000","Negro"],["#f7f3ea","Crema"]];
const PAGE_SIZES = { A4:{w:210,h:297}, Carta:{w:216,h:279} };
const MIN_MARGIN = 3; // mm mínimo alrededor de la grilla

const FB = '<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>';
const IG = '<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="igg" x1="1" y1="23" x2="23" y2="1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#feda75"/><stop offset=".3" stop-color="#fa7e1e"/><stop offset=".6" stop-color="#d62976"/><stop offset=".85" stop-color="#962fbf"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect x="2.5" y="2.5" width="19" height="19" rx="5.2" stroke="url(#igg)" stroke-width="2"/><circle cx="12" cy="12" r="4.6" stroke="url(#igg)" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.2" fill="url(#igg)"/></svg>';
const TTP='M16.6 3c.29 2.02 1.55 3.53 3.9 3.75v2.63c-1.42.05-2.68-.34-3.9-1.06v6.72c0 3.4-2.7 5.86-5.93 5.5-2.94-.33-4.98-3.02-4.5-5.98.36-2.28 2.32-4.02 4.75-4.05.33 0 .66.02.98.09v2.83c-.31-.1-.63-.16-.98-.16-1.5 0-2.66 1.35-2.35 2.9.2 1 1.05 1.78 2.07 1.9 1.5.16 2.77-1 2.77-2.46V3h3.12z';
function TT(dark){ return '<svg viewBox="0 0 24 24"><path d="'+TTP+'" fill="#25F4EE" transform="translate(-0.8,-0.8)"/><path d="'+TTP+'" fill="#FE2C55" transform="translate(0.8,0.8)"/><path d="'+TTP+'" fill="'+(dark?'#eee':'#111')+'"/></svg>'; }

let sb=null, user=null, brandName="TU MARCA", activeTab="clasico";
let templates=[];
let curCols=5, curRows=10; // se recalculan en computeGrid()

function blank(){ return { nombre:"", casa:"", conc:"Eau de Parfum", img:null, logo:null }; }
function defaultSettings(neg){
  return neg
    ? { bg:"#000000", accent:"#c2a24d", cBrand:"#c2a24d", cName:"#ffffff", cHouse:"#5b8bd0", cHandle:"#ffffff", conn:"", fit:"contain", handle:"@tu.usuario",
        sheetSize:"A4", lw:4.0, lh:2.7, cols:5, rows:10 }
    : { bg:"#ffffff", accent:"#6e1f2a", cBrand:"#6e1f2a", cName:"#111111", cHouse:"#111111", cHandle:"#111111", conn:"Tipo", fit:"cover", handle:"@tu.usuario",
        sheetSize:"A4", lw:4.0, lh:2.7, cols:5, rows:10 };
}
let sheets = { clasico:{ perfumes:[blank()], settings:defaultSettings(false) }, negro:{ perfumes:[blank()], settings:defaultSettings(true) } };
function S(){ return sheets[activeTab]; }
function clone(x){ return JSON.parse(JSON.stringify(x)); }

function esc(t){ return (t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function nameClass(n){ const l=(n||'').length; return l<=14?'s1':l<=22?'s2':'s3'; }
function houseClass(n){ const l=(n||'').length; return l<=12?'h1':l<=18?'h2':'h3'; }
function $(id){ return document.getElementById(id); }
function optionsHTML(list,sel){ return list.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===sel?' selected':'')+'>'+o[1]+'</option>';}).join(''); }
function isDark(hex){ hex=(hex||'#fff').replace('#',''); if(hex.length===3) hex=hex.split('').map(function(c){return c+c;}).join(''); var r=parseInt(hex.substr(0,2),16),g=parseInt(hex.substr(2,2),16),b=parseInt(hex.substr(4,2),16); return (0.299*r+0.587*g+0.114*b)<128; }

function compressImage(file, maxpx, cb){
  const rd=new FileReader();
  rd.onload=function(e){ const img=new Image();
    img.onload=function(){ let w=img.width,h=img.height; const s=Math.min(1,maxpx/Math.max(w,h)); w=Math.round(w*s); h=Math.round(h*s);
      const c=document.createElement('canvas'); c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h); cb(c.toDataURL('image/png')); };
    img.src=e.target.result; }; rd.readAsDataURL(file);
}

// ---------- colores ----------
function applyColors(){
  const s=S().settings, r=document.documentElement.style;
  r.setProperty('--bg', s.bg);
  r.setProperty('--cut', isDark(s.bg)?'rgba(255,255,255,0.18)':'#ececec');
  r.setProperty('--accent', s.accent);
  r.setProperty('--c-brand', s.cBrand);
  r.setProperty('--c-name', s.cName);
  r.setProperty('--c-house', s.cHouse);
  r.setProperty('--c-handle', s.cHandle);
  r.setProperty('--c-conc', isDark(s.bg)?'#b9b9b9':'#777777');
}

// ---------- tamaño de hoja / etiqueta ----------
function computeGrid(){
  const s=S().settings;
  const page = PAGE_SIZES[s.sheetSize] || PAGE_SIZES.A4;
  const lwCm = Math.max(2, Number(s.lw)||4.0);
  const lhCm = Math.max(1.5, Number(s.lh)||2.7);
  const lw = lwCm*10, lh = lhCm*10; // cm -> mm para las medidas de la hoja
  const maxCols = Math.max(1, Math.floor((page.w - 2*MIN_MARGIN) / lw));
  const maxRows = Math.max(1, Math.floor((page.h - 2*MIN_MARGIN) / lh));
  let cols = Math.min(Math.max(1, Math.round(Number(s.cols)||maxCols)), maxCols);
  let rows = Math.min(Math.max(1, Math.round(Number(s.rows)||maxRows)), maxRows);

  const warn = $('sizeWarn');
  if(warn){
    if(Number(s.cols)>maxCols || Number(s.rows)>maxRows){
      warn.textContent = 'Se ajustó a '+cols+' columnas × '+rows+' filas para que quepa en la hoja.';
    } else { warn.textContent=''; }
  }
  s.cols=cols; s.rows=rows; s.lw=lwCm; s.lh=lhCm;
  curCols=cols; curRows=rows;

  const page_el=$('page'); const grid=$('grid');
  page_el.style.width = page.w+'mm'; page_el.style.height = page.h+'mm';
  const padH = Math.max(MIN_MARGIN, (page.w - cols*lw)/2);
  const padV = Math.max(MIN_MARGIN, (page.h - rows*lh)/2);
  page_el.style.padding = padV.toFixed(2)+'mm '+padH.toFixed(2)+'mm';
  grid.style.gridTemplateColumns = 'repeat('+cols+', '+lw+'mm)';
  grid.style.gridTemplateRows = 'repeat('+rows+', '+lh+'mm)';

  const totalLbl=$('totalLbl'); if(totalLbl) totalLbl.textContent = (cols*rows)+' etiquetas';
  return cols*rows;
}
function onSizeChange(){
  const s=S().settings;
  s.sheetSize=$('sheetSize').value; s.lw=parseFloat($('lw').value)||4.0; s.lh=parseFloat($('lh').value)||2.7;
  s.cols=parseInt($('cols').value)||5; s.rows=parseInt($('rows').value)||10;
  renderSheet();
  // refleja valores ya ajustados/clamped en los inputs
  $('sheetSize').value=s.sheetSize; $('lw').value=s.lw; $('lh').value=s.lh; $('cols').value=s.cols; $('rows').value=s.rows;
}

// ---------- editor ----------
function renderEditor(){
  const box=$('cards'); box.innerHTML=''; const negro=activeTab==='negro';
  S().perfumes.forEach(function(p,i){
    const c=document.createElement('div'); c.className='card';
    var html=
      '<div class="grid2">'+
        '<input type="text" placeholder="Nombre del perfume" value="'+esc(p.nombre)+'" oninput="upd('+i+',\'nombre\',this.value)">'+
        '<input type="text" placeholder="Casa / marca" value="'+esc(p.casa)+'" oninput="upd('+i+',\'casa\',this.value)">'+
        '<input class="full" type="text" placeholder="Concentración (opcional)" value="'+esc(p.conc)+'" oninput="upd('+i+',\'conc\',this.value)">'+
      '</div>'+
      '<div class="imgrow">'+
        (p.img?'<img class="thumb" src="'+p.img+'">':'<span class="hint">Sin imagen</span>')+
        '<input type="file" accept="image/*" onchange="onImg(this,'+i+')">'+
        (p.img?'<button class="mini" onclick="quitarImg('+i+')">Quitar imagen</button>':'')+
      '</div>'+
      '<div class="subhint">Foto de la botella (ideal: recortada, fondo transparente).</div>';
    if(negro){
      html+='<div class="imgrow">'+
        (p.logo?'<img class="thumb" src="'+p.logo+'">':'<span class="hint">Sin logo</span>')+
        '<input type="file" accept="image/*" onchange="onLogo(this,'+i+')">'+
        (p.logo?'<button class="mini" onclick="quitarLogo('+i+')">Quitar logo</button>':'')+
      '</div><div class="subhint">Logo de la casa/marca (debajo del nombre). Si pones logo, puedes dejar vacío el texto de casa para no repetir.</div>';
    }
    html+='<div class="actions"><button class="mini del" onclick="delPerfume('+i+')">Eliminar perfume</button></div>';
    c.innerHTML=html; box.appendChild(c);
  });
}
function upd(i,k,v){ S().perfumes[i][k]=v; renderSheet(); }
function addPerfume(){ S().perfumes.push(blank()); renderEditor(); renderSheet(); }
function delPerfume(i){ S().perfumes.splice(i,1); if(S().perfumes.length===0) addPerfume(); else { renderEditor(); renderSheet(); } }
function quitarImg(i){ S().perfumes[i].img=null; renderEditor(); renderSheet(); }
function quitarLogo(i){ S().perfumes[i].logo=null; renderEditor(); renderSheet(); }
function onImg(inp,i){ const f=inp.files[0]; if(!f) return; compressImage(f,700,function(u){ S().perfumes[i].img=u; renderEditor(); renderSheet(); }); }
function onLogo(inp,i){ const f=inp.files[0]; if(!f) return; compressImage(f,400,function(u){ S().perfumes[i].logo=u; renderEditor(); renderSheet(); }); }

// ---------- controles ----------
function readControls(){
  const s=S().settings;
  s.handle=$('handle').value.trim(); s.conn=$('conn').value.trim(); s.fit=$('fit').value; s.bg=$('bg').value;
  s.accent=$('accent').value; s.cBrand=$('cBrand').value; s.cName=$('cName').value; s.cHouse=$('cHouse').value; s.cHandle=$('cHandle').value;
  s.sheetSize=$('sheetSize').value; s.lw=parseFloat($('lw').value)||s.lw; s.lh=parseFloat($('lh').value)||s.lh;
  s.cols=parseInt($('cols').value)||s.cols; s.rows=parseInt($('rows').value)||s.rows;
}
function onControlChange(){ readControls(); applyColors(); renderSheet(); }
function onBgChange(){
  const bg=$('bg').value; const s=S().settings; s.bg=bg;
  if(bg==='#000000'){ Object.assign(s,{accent:'#c2a24d',cBrand:'#c2a24d',cName:'#ffffff',cHouse:'#5b8bd0',cHandle:'#ffffff'}); }
  else if(bg==='#f7f3ea'){ Object.assign(s,{accent:'#6e1f2a',cBrand:'#6e1f2a',cName:'#2a1f14',cHouse:'#6e1f2a',cHandle:'#2a1f14'}); }
  else { Object.assign(s,{accent:'#6e1f2a',cBrand:'#6e1f2a',cName:'#111111',cHouse:'#111111',cHandle:'#111111'}); }
  fillControls(); applyColors(); renderSheet();
}

// ---------- etiquetas ----------
function labelClasico(it,s,social){
  const conn=s.conn;
  return '<div class="content">'+
      '<div class="brand">'+esc(brandName)+'</div>'+
      '<div class="name '+nameClass(it.nombre)+'">'+esc(it.nombre)+'</div>'+
      '<div class="sep"></div>'+
      (it.casa?(conn?'<div class="insplbl">'+esc(conn)+'</div>':'')+'<div class="house '+houseClass(it.casa)+'">'+esc(it.casa)+'</div>':'')+
      (it.conc?'<div class="conc">'+esc(it.conc)+'</div>':'')+
      (s.handle?social:'')+
    '</div>'+
    (it.img?'<div class="imgbox '+(s.fit==='contain'?'fit-contain':'')+'"><img src="'+it.img+'"></div>':'');
}
function labelNegro(it,s,social){
  return (it.img?'<div class="imgbox left fit-contain"><img src="'+it.img+'"></div>':'')+
    '<div class="content">'+
      '<div class="brand">'+esc(brandName)+'</div>'+
      '<div class="name '+nameClass(it.nombre)+'">'+esc(it.nombre)+'</div>'+
      (it.casa?'<div class="casa '+houseClass(it.casa)+'">'+esc(it.casa)+'</div>':'')+
      (it.logo?'<div class="logowrap"><img class="logoimg" src="'+it.logo+'"></div>':'')+
      (it.conc?'<div class="conc">'+esc(it.conc)+'</div>':'')+
      (s.handle?social:'')+
    '</div>';
}
function renderSheet(){
  const s=S().settings;
  const total = computeGrid();
  const list=S().perfumes.filter(function(p){return (p.nombre||'').trim()!=='';});
  const grid=$('grid'); grid.innerHTML='';
  if(list.length===0) return;
  const modo=document.querySelector('input[name=modo]:checked').value;
  const social='<div class="handle">'+esc(s.handle)+'</div><div class="icons">'+FB+IG+TT(isDark(s.bg))+'</div>';
  for(let k=0;k<total;k++){
    const it=modo==='uno'?list[0]:list[k%list.length];
    const el=document.createElement('div'); el.className='label '+activeTab+(it.img?' has-img':'');
    el.innerHTML = activeTab==='negro' ? labelNegro(it,s,social) : labelClasico(it,s,social);
    grid.appendChild(el);
  }
  requestAnimationFrame(fitContents);
  setTimeout(fitContents, 120); // segunda pasada por si alguna imagen tarda en decodificar
}

// Encoge el contenido de cada etiqueta si no entra, para que nunca se tape texto
function fitContents(){
  document.querySelectorAll('#grid .label .content').forEach(function(c){
    c.style.transform='none';
    const avail=c.clientHeight, need=c.scrollHeight;
    if(avail>0 && need>avail){
      const scale=Math.max(0.5,(avail/need)*0.96);
      c.style.transform='scale('+scale.toFixed(3)+')';
      c.style.transformOrigin='center center';
    }
  });
}

// ---------- plantillas ----------
function renderTemplates(){
  const box=$('tplList'); if(!box) return; box.innerHTML='';
  if(templates.length===0){ box.innerHTML='<div class="hint" style="margin-top:6px;">Aún no tienes plantillas guardadas.</div>'; return; }
  templates.forEach(function(t){
    const d=document.createElement('div'); d.className='tplrow';
    const tipo = t.tab==='negro' ? 'Fondo negro' : 'Texto clásico';
    d.innerHTML='<span class="tplname">'+esc(t.name)+' <em>· '+tipo+'</em></span>'+
      '<span><button class="mini" onclick="cargarPlantilla(\''+t.id+'\')">Cargar</button> '+
      '<button class="mini" onclick="descargarPDF(\''+t.id+'\')">⬇ PDF</button> '+
      '<button class="mini del" onclick="eliminarPlantilla(\''+t.id+'\')">Eliminar</button></span>';
    box.appendChild(d);
  });
}
function snapshot(nombre){
  return { id:String(Date.now())+Math.floor(Math.random()*999), name:nombre, tab:activeTab,
           perfumes:clone(S().perfumes), settings:clone(S().settings) };
}
function guardarPlantilla(){
  readControls();
  var nombre=$('tplName').value.trim();
  if(!nombre) nombre=prompt('Ponle un nombre a esta plantilla:','Mi plantilla');
  if(!nombre) return;
  templates.push(snapshot(nombre)); $('tplName').value=''; renderTemplates(); guardar();
}
function cargarPlantilla(id){
  const t=templates.find(function(x){return x.id===id;}); if(!t) return;
  activeTab=t.tab; sheets[t.tab].perfumes=clone(t.perfumes); sheets[t.tab].settings=Object.assign(defaultSettings(t.tab==='negro'), clone(t.settings));
  fillControls(); applyColors(); renderEditor(); renderSheet();
  window.scrollTo({top:0,behavior:'smooth'});
}
function eliminarPlantilla(id){
  if(!confirm('¿Eliminar esta plantilla?')) return;
  templates=templates.filter(function(x){return x.id!==id;}); renderTemplates(); guardar();
}

// Descarga en PDF una plantilla puntual usando el diálogo de impresión del navegador
// (los navegadores no permiten guardar archivos en silencio; esto abre "Guardar como PDF"
// con el nombre ya sugerido, para que quede organizado en tu carpeta de Descargas).
function descargarPDF(id){
  const t=templates.find(function(x){return x.id===id;}); if(!t) return;
  const prevTab=activeTab, prevClasico=clone(sheets.clasico), prevNegro=clone(sheets.negro), prevTitle=document.title;
  activeTab=t.tab; sheets[t.tab].perfumes=clone(t.perfumes); sheets[t.tab].settings=Object.assign(defaultSettings(t.tab==='negro'), clone(t.settings));
  fillControls(); applyColors(); renderEditor(); renderSheet();
  document.title = (brandName||'Etiquetas').replace(/[\\/:*?"<>|]/g,'') + ' - ' + t.name.replace(/[\\/:*?"<>|]/g,'');
  setTimeout(function(){
    window.print();
    document.title=prevTitle;
    activeTab=prevTab; sheets.clasico=prevClasico; sheets.negro=prevNegro;
    fillControls(); applyColors(); renderEditor(); renderSheet();
  }, 200);
}

// ---------- imprimir (ofrece guardar como plantilla) ----------
function imprimir(){
  readControls();
  if(confirm('¿Quieres guardar esta hoja como plantilla para reimprimirla después?')){
    var nombre=$('tplName').value.trim() || prompt('Nombre de la plantilla:','Mi plantilla');
    if(nombre){ templates.push(snapshot(nombre)); $('tplName').value=''; renderTemplates(); guardar(); }
  }
  document.title = (brandName||'Etiquetas')+' - Etiquetas';
  window.print();
}

// ---------- controles + pestañas ----------
function fillControls(){
  const s=S().settings;
  $('handle').value=s.handle; $('conn').value=s.conn; $('fit').value=s.fit;
  $('bg').innerHTML=optionsHTML(BG,s.bg);
  $('accent').innerHTML=optionsHTML(PALETTE,s.accent);
  $('cBrand').innerHTML=optionsHTML(PALETTE,s.cBrand);
  $('cName').innerHTML=optionsHTML(PALETTE,s.cName);
  $('cHouse').innerHTML=optionsHTML(PALETTE,s.cHouse);
  $('cHandle').innerHTML=optionsHTML(PALETTE,s.cHandle);
  $('sheetSize').value=s.sheetSize; $('lw').value=s.lw; $('lh').value=s.lh; $('cols').value=s.cols; $('rows').value=s.rows;
  $('tiendaLabel').textContent=brandName;
  $('connField').style.display = activeTab==='negro' ? 'none' : 'block';
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.toggle('active', t.dataset.tab===activeTab); });
}
function setTab(t){ readControls(); activeTab=t; fillControls(); applyColors(); renderEditor(); renderSheet(); }

// ---------- supabase ----------
async function loadData(){
  const res=await sb.from('profiles').select('brand_name,data').eq('id',user.id).single();
  if(res.error) console.warn(res.error.message);
  const d=res.data;
  if(d){
    brandName = d.brand_name && d.brand_name.trim() ? d.brand_name : brandName;
    if(d.data){
      if(Array.isArray(d.data.templates)) templates=d.data.templates;
      if(d.data.sheets){
        ['clasico','negro'].forEach(function(t){
          if(d.data.sheets[t]){
            sheets[t].settings=Object.assign(defaultSettings(t==='negro'), d.data.sheets[t].settings||{});
            if(Array.isArray(d.data.sheets[t].perfumes)&&d.data.sheets[t].perfumes.length) sheets[t].perfumes=d.data.sheets[t].perfumes;
          }
        });
      } else if(d.data.settings){
        sheets.clasico.settings=Object.assign(defaultSettings(false), d.data.settings);
        if(Array.isArray(d.data.perfumes)&&d.data.perfumes.length) sheets.clasico.perfumes=d.data.perfumes;
      }
    }
  }
}
async function guardar(){
  readControls();
  const btn=$('saveBtn'), prev=btn?btn.textContent:''; if(btn){ btn.textContent='Guardando…'; btn.disabled=true; }
  const res=await sb.from('profiles').upsert({id:user.id, data:{sheets:sheets, templates:templates}, updated_at:new Date().toISOString()});
  if(btn){ btn.disabled=false; btn.textContent=prev; }
  const m=$('saveMsg');
  if(m){ if(res.error){ m.textContent='Error: '+res.error.message; m.style.color='#a33'; } else { m.textContent='Guardado ✓'; m.style.color='#2a7'; setTimeout(function(){m.textContent='';},2500); } }
}

// ---------- sesión ----------
function showLogin(){ $('login').style.display='flex'; $('app').style.display='none'; }
function showApp(){ $('login').style.display='none'; $('app').style.display='block'; fillControls(); applyColors(); renderEditor(); renderSheet(); renderTemplates(); }
async function entrar(){
  const email=$('email').value.trim(), pass=$('password').value, err=$('loginErr'); err.textContent='';
  if(!sb){ err.textContent='Falta configurar config.js.'; return; }
  const b=$('loginBtn'); b.disabled=true; b.textContent='Entrando…';
  const res=await sb.auth.signInWithPassword({email:email,password:pass});
  b.disabled=false; b.textContent='Entrar';
  if(res.error){ err.textContent='Correo o contraseña incorrectos.'; return; }
  user=res.data.user; await loadData(); showApp();
}
async function salir(){ if(sb) await sb.auth.signOut(); user=null; showLogin(); }
async function init(){
  try{
    if(window.supabase && window.CFG && !/TU-PROYECTO/.test(window.CFG.url)){
      sb=window.supabase.createClient(window.CFG.url, window.CFG.key);
      const s=await sb.auth.getSession();
      if(s.data && s.data.session){ user=s.data.session.user; await loadData(); showApp(); return; }
    }
  }catch(e){ console.warn(e); }
  showLogin();
}
window.addEventListener('DOMContentLoaded', init);
