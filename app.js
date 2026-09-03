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
// Tamaños fijos de etiqueta por mL de decant (cm). El ancho es fijo según la orientación;
// el alto cambia según el tamaño del decant (igual en horizontal y vertical).
const SIZE_PRESETS = {
  horizontal: { '2':{w:4.8,h:1.8}, '3':{w:4.8,h:3.2}, '5':{w:4.8,h:5.0}, '10':{w:4.8,h:9.0} },
  vertical:   { '2':{w:2.0,h:1.8}, '3':{w:2.0,h:3.2}, '5':{w:2.0,h:5.0}, '10':{w:2.0,h:9.0} }
};

const FB = '<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>';
const IG = '<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="igg" x1="1" y1="23" x2="23" y2="1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#feda75"/><stop offset=".3" stop-color="#fa7e1e"/><stop offset=".6" stop-color="#d62976"/><stop offset=".85" stop-color="#962fbf"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect x="2.5" y="2.5" width="19" height="19" rx="5.2" stroke="url(#igg)" stroke-width="2"/><circle cx="12" cy="12" r="4.6" stroke="url(#igg)" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.2" fill="url(#igg)"/></svg>';
const TTP='M16.6 3c.29 2.02 1.55 3.53 3.9 3.75v2.63c-1.42.05-2.68-.34-3.9-1.06v6.72c0 3.4-2.7 5.86-5.93 5.5-2.94-.33-4.98-3.02-4.5-5.98.36-2.28 2.32-4.02 4.75-4.05.33 0 .66.02.98.09v2.83c-.31-.1-.63-.16-.98-.16-1.5 0-2.66 1.35-2.35 2.9.2 1 1.05 1.78 2.07 1.9 1.5.16 2.77-1 2.77-2.46V3h3.12z';
function TT(dark){ return '<svg viewBox="0 0 24 24"><path d="'+TTP+'" fill="#25F4EE" transform="translate(-0.8,-0.8)"/><path d="'+TTP+'" fill="#FE2C55" transform="translate(0.8,0.8)"/><path d="'+TTP+'" fill="'+(dark?'#eee':'#111')+'"/></svg>'; }

let sb=null, user=null, brandName="TU MARCA", socialHandle="@tu.usuario", activeTab="clasico";
let templates=[];
let curCols=5, curRows=10; // se recalculan en computeGrid()

function blank(){ return { nombre:"", casa:"", conc:"Eau de Parfum", img:null, logo:null }; }
function defaultSettings(neg){
  return neg
    ? { bg:"#000000", accent:"#c2a24d", cBrand:"#c2a24d", cName:"#ffffff", cHouse:"#5b8bd0", cHandle:"#ffffff", conn:"", fit:"cover", handle:"@tu.usuario",
        orientation:"horizontal", volume:"3", sheetSize:"A4" }
    : { bg:"#ffffff", accent:"#6e1f2a", cBrand:"#6e1f2a", cName:"#111111", cHouse:"#111111", cHandle:"#111111", conn:"Tipo", fit:"cover", handle:"@tu.usuario",
        orientation:"horizontal", volume:"3", sheetSize:"A4" };
}
function defaultMarcaSettings(){
  return { bg:"#ffffff", accent:"#6e1f2a", cBrand:"#6e1f2a", cName:"#111111", cHouse:"#111111", cHandle:"#111111", conn:"", fit:"cover", handle:"@tu.usuario", sheetSize:"A4" };
}
function blankMarcaItem(){ return { img:null, phrase:"", qrUrl:"" }; }
let sheets = {
  clasico:{ perfumes:[blank()], settings:defaultSettings(false) },
  negro:{ perfumes:[blank()], settings:defaultSettings(true) },
  marca:{ item: blankMarcaItem(), settings: defaultMarcaSettings() }
};
function S(){ return sheets[activeTab]; }
function clone(x){ return JSON.parse(JSON.stringify(x)); }

function esc(t){ return (t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function nameClass(n){ return 's1'; } // el tamaño real lo decide --lscale de forma continua, sin "cubetas" por largo de texto
function houseClass(n){ return 'h1'; } // idem
function $(id){ return document.getElementById(id); }
// Genera el código QR como SVG (vectorial, se imprime nítido a cualquier tamaño).
function makeQrSvg(url){
  if(!url || typeof qrcode==='undefined') return null;
  try{
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount(), cell = 4;
    let rects = '';
    for(let r=0;r<count;r++){
      for(let c=0;c<count;c++){
        if(qr.isDark(r,c)) rects += '<rect x="'+(c*cell)+'" y="'+(r*cell)+'" width="'+cell+'" height="'+cell+'"/>';
      }
    }
    const size = count*cell;
    return '<svg viewBox="0 0 '+size+' '+size+'" xmlns="http://www.w3.org/2000/svg"><rect width="'+size+'" height="'+size+'" fill="#fff"/><g fill="#111">'+rects+'</g></svg>';
  }catch(e){ return null; }
}
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
  const preset = activeTab==='marca'
    ? { w:11, h:8 }
    : (SIZE_PRESETS[s.orientation] || SIZE_PRESETS.horizontal)[s.volume] || SIZE_PRESETS.horizontal['3'];
  const lw = preset.w*10, lh = preset.h*10; // cm -> mm
  const maxCols = Math.max(1, Math.floor((page.w - 2*MIN_MARGIN) / lw));
  const maxRows = Math.max(1, Math.floor((page.h - 2*MIN_MARGIN) / lh));
  curCols=maxCols; curRows=maxRows;

  const page_el=$('page'); const grid=$('grid');
  page_el.style.width = page.w+'mm'; page_el.style.height = page.h+'mm';
  const padH = Math.max(MIN_MARGIN, (page.w - maxCols*lw)/2);
  const padV = Math.max(MIN_MARGIN, (page.h - maxRows*lh)/2);
  page_el.style.padding = padV.toFixed(2)+'mm '+padH.toFixed(2)+'mm';
  grid.style.gridTemplateColumns = 'repeat('+maxCols+', '+lw+'mm)';
  grid.style.gridTemplateRows = 'repeat('+maxRows+', '+lh+'mm)';

  const totalLbl=$('totalLbl'); if(totalLbl) totalLbl.textContent = (maxCols*maxRows)+' etiquetas';
  const totalLblMarca=$('totalLblMarca'); if(totalLblMarca) totalLblMarca.textContent = (maxCols*maxRows)+' tarjetas';
  const sizeLbl=$('sizeLbl'); if(sizeLbl) sizeLbl.textContent = 'Etiqueta: '+preset.w+' × '+preset.h+' cm';
  return maxCols*maxRows;
}
function onOrientationChange(){ S().settings.orientation=$('orientation').value; renderSheet(); }
function onVolumeChange(){ S().settings.volume=$('volume').value; renderSheet(); }
function onSizeChange(){
  const sel = activeTab==='marca' ? $('sheetSizeMarca') : $('sheetSize');
  S().settings.sheetSize = sel.value;
  renderSheet();
}

// ---------- editor ----------
function renderEditor(){
  if(activeTab==='marca'){ renderMarcaEditor(); return; }
  const box=$('cards'); box.innerHTML='';
  S().perfumes.forEach(function(p,i){
    const c=document.createElement('div'); c.className='card';
    var html='<div class="grid2">'+
        '<input type="text" placeholder="Nombre del perfume" value="'+esc(p.nombre)+'" oninput="upd('+i+',\'nombre\',this.value)">'+
        '<input type="text" placeholder="Casa / marca" value="'+esc(p.casa)+'" oninput="upd('+i+',\'casa\',this.value)">'+
        '<input class="full" type="text" placeholder="Concentración (opcional)" value="'+esc(p.conc)+'" oninput="upd('+i+',\'conc\',this.value)">'+
      '</div>'+
      '<div class="imgrow">'+
        (p.img?'<img class="thumb" src="'+p.img+'">':'<span class="hint">Sin imagen</span>')+
        '<input type="file" accept="image/*" onchange="onImg(this,'+i+')">'+
        (p.img?'<button class="mini" onclick="quitarImg('+i+')">Quitar imagen</button>':'')+
      '</div>'+
      '<div class="subhint">Foto de la botella (ideal: recortada, fondo transparente).</div>'+
      '<div class="imgrow">'+
        (p.logo?'<img class="thumb" src="'+p.logo+'">':'<span class="hint">Sin logo</span>')+
        '<input type="file" accept="image/*" onchange="onLogo(this,'+i+')">'+
        (p.logo?'<button class="mini" onclick="quitarLogo('+i+')">Quitar logo</button>':'')+
      '</div><div class="subhint">Logo de la casa/marca (opcional, aparece debajo del nombre).</div>';
    html+='<div class="actions"><button class="mini del" onclick="delPerfume('+i+')">Eliminar perfume</button></div>';
    c.innerHTML=html; box.appendChild(c);
  });
}
function upd(i,k,v){ S().perfumes[i][k]=v; renderSheet(); }
function addPerfume(){ S().perfumes.push(blank()); renderEditor(); renderSheet(); }
function delPerfume(i){ S().perfumes.splice(i,1); if(S().perfumes.length===0) addPerfume(); else { renderEditor(); renderSheet(); } }

// ---------- editor de la tarjeta de marca ----------
function renderMarcaEditor(){
  const it = sheets.marca.item;
  const wrap = $('marcaImgThumbWrap');
  if(wrap) wrap.innerHTML = it.img ? '<img class="thumb" src="'+it.img+'">' : '<span class="hint">Sin imagen</span>';
  $('marcaPhrase').value = it.phrase||'';
  $('marcaQrUrl').value = it.qrUrl||'';
}
function onMarcaImg(input){
  const f=input.files[0]; if(!f) return;
  compressImage(f,900,function(u){ sheets.marca.item.img=u; renderMarcaEditor(); renderSheet(); });
}
function onMarcaChange(){
  sheets.marca.item.phrase = $('marcaPhrase').value;
  sheets.marca.item.qrUrl = $('marcaQrUrl').value.trim();
  renderSheet();
}
function quitarImg(i){ S().perfumes[i].img=null; renderEditor(); renderSheet(); }
function quitarLogo(i){ S().perfumes[i].logo=null; renderEditor(); renderSheet(); }
function onImg(inp,i){ const f=inp.files[0]; if(!f) return; compressImage(f,700,function(u){ S().perfumes[i].img=u; renderEditor(); renderSheet(); }); }
function onLogo(inp,i){ const f=inp.files[0]; if(!f) return; compressImage(f,400,function(u){ S().perfumes[i].logo=u; renderEditor(); renderSheet(); }); }

// ---------- controles ----------
function readControls(){
  const s=S().settings;
  s.handle=socialHandle; s.conn=$('conn').value.trim(); s.fit=$('fit').value; s.bg=$('bg').value;
  s.accent=$('accent').value; s.cBrand=$('cBrand').value; s.cName=$('cName').value; s.cHouse=$('cHouse').value; s.cHandle=$('cHandle').value;
  if(activeTab==='marca'){ s.sheetSize=$('sheetSizeMarca').value; }
  else { s.orientation=$('orientation').value; s.volume=$('volume').value; s.sheetSize=$('sheetSize').value; }
}
function onControlChange(){ readControls(); applyColors(); renderSheet(); }
function onBgChange(){
  const bg=$('bg').value; const s=S().settings; s.bg=bg;
  if(bg==='#000000'){ Object.assign(s,{accent:'#c2a24d',cBrand:'#c2a24d',cName:'#ffffff',cHouse:'#5b8bd0',cHandle:'#ffffff'}); }
  else if(bg==='#f7f3ea'){ Object.assign(s,{accent:'#6e1f2a',cBrand:'#6e1f2a',cName:'#2a1f14',cHouse:'#6e1f2a',cHandle:'#2a1f14'}); }
  else { Object.assign(s,{accent:'#6e1f2a',cBrand:'#6e1f2a',cName:'#111111',cHouse:'#111111',cHandle:'#111111'}); }
  fillControls(); applyColors(); renderSheet();
}

// ---------- etiquetas: solo 2 formatos, compartidos por ambas pestañas ----------
// Horizontal: botella a ambos lados, texto al centro — llena mejor las proporciones muy anchas o muy altas.
// Horizontal: por defecto una sola botella a la izquierda (como siempre). Casos puntuales que SÍ
// cambian: 2ml lleva una botella a cada lado; 10ml lleva dos botellas apiladas a la izquierda.
function labelHorizontal(it,s,social){
  const conn=s.conn;
  const fitClass = s.fit==='contain' ? 'fit-contain' : '';
  const contentHtml =
    '<div class="content fitbox">'+
      '<div class="brand">'+esc(brandName)+'</div>'+
      '<div class="name fitbox '+nameClass(it.nombre)+'">'+esc(it.nombre)+'</div>'+
      (it.casa?'<div class="opt-house">'+(conn?'<div class="insplbl">'+esc(conn)+'</div>':'')+'<div class="house casa fitbox '+houseClass(it.casa)+'">'+esc(it.casa)+'</div></div>':'')+
      (it.logo?'<div class="opt-logo logowrap"><img class="logoimg" src="'+it.logo+'"></div>':'')+
      (it.conc?'<div class="opt-conc conc">'+esc(it.conc)+'</div>':'')+
      (s.handle?'<div class="opt-social">'+social+'</div>':'')+
    '</div>';
  if(!it.img) return contentHtml;

  if(s.volume==='2'){ // botella a cada lado
    const imgHtml = '<div class="imgbox side '+fitClass+'"><img src="'+it.img+'"></div>';
    return imgHtml + contentHtml + imgHtml;
  }
  if(s.volume==='10'){ // dos botellas apiladas (una encima de otra) a la izquierda
    const stackHtml = '<div class="imgstack"><div class="imgbox '+fitClass+'"><img src="'+it.img+'"></div><div class="imgbox '+fitClass+'"><img src="'+it.img+'"></div></div>';
    return stackHtml + contentHtml;
  }
  // 3ml, 5ml y cualquier otro: una sola botella a la izquierda
  return '<div class="imgbox left '+fitClass+'"><img src="'+it.img+'"></div>' + contentHtml;
}
// Vertical: casa/nombre arriba, botella grande al centro, logo+concentración+marca+redes abajo.
// Ajustes puntuales SOLO para 2ml, 3ml y 10ml (ver comentarios en cada caso). 5ml y cualquier otro
// tamaño no declarado aquí abajo quedan exactamente como estaban antes de este cambio.
function labelVertical(it,s,social){
  const vol = s.volume;
  const skipLogo = (vol==='2');                       // 2ml: el logo del perfume no se considera (nunca le quita espacio a la botella)
  const skipConc = (vol==='3');                        // 3ml: la concentración no se considera (no solo se oculta, no se calcula)
  const mergeBrandHandle = (vol==='2' || vol==='3');    // 2ml y 3ml: "TU MARCA" y "@usuario" en una sola línea
  const spaced = (vol==='10');                          // 10ml: un poco más de aire entre los datos
  const bigLogo10 = (vol==='10');                       // 10ml: logo un poco más grande (sin opacar la botella)

  const showLogo = it.logo && !skipLogo;
  const showConc = it.conc && !skipConc;

  const brandBlock = mergeBrandHandle
    ? '<div class="brandline"><span class="brand">'+esc(brandName)+'</span>'+(s.handle?'<span class="handle inline">'+esc(s.handle)+'</span>':'')+'</div>'+
      (s.handle?'<div class="opt-social"><div class="icons">'+FB+IG+TT(isDark(s.bg))+'</div></div>':'')
    : '<div class="brand">'+esc(brandName)+'</div>'+(s.handle?'<div class="opt-social">'+social+'</div>':'');

  return '<div class="content fitbox vertical'+(spaced?' spaced':'')+'">'+
      (it.casa?'<div class="opt-house casa fitbox '+houseClass(it.casa)+'">'+esc(it.casa)+'</div>':'')+
      '<div class="name fitbox '+nameClass(it.nombre)+'">'+esc(it.nombre)+'</div>'+
      (it.img?'<div class="imgmid '+(s.fit==='contain'?'fit-contain':'')+'"><img src="'+it.img+'"></div>':'')+
      (showLogo?'<div class="opt-logo logowrap'+(bigLogo10?' big10':'')+'"><img class="logoimg" src="'+it.logo+'"></div>':'')+
      (showConc?'<div class="opt-conc conc">'+esc(it.conc)+'</div>':'')+
      brandBlock+
    '</div>';
}
function renderSheet(){
  if(activeTab==='marca'){ renderSheetMarca(); return; }
  const s=S().settings;
  const total = computeGrid();
  const list=S().perfumes.filter(function(p){return (p.nombre||'').trim()!=='';});
  const grid=$('grid'); grid.innerHTML='';
  if(list.length===0) return;
  const modo=document.querySelector('input[name=modo]:checked').value;
  const social='<div class="handle">'+esc(s.handle)+'</div><div class="icons">'+FB+IG+TT(isDark(s.bg))+'</div>';
  const vertical = s.orientation==='vertical';
  for(let k=0;k<total;k++){
    const idx = modo==='uno'?0:(k%list.length);
    const it=list[idx];
    const el=document.createElement('div'); el.className='label '+activeTab+(vertical?' vertical':'')+(it.img?' has-img':'');
    el.dataset.itemIdx=idx;
    el.innerHTML = vertical ? labelVertical(it,s,social) : labelHorizontal(it,s,social);
    grid.appendChild(el);
  }
  // Espera a que TODAS las imágenes (botellas y logos) terminen de decodificar antes de calcular
  // el tamaño de letra — así una foto real (más pesada que una prueba) nunca deja una etiqueta a
  // medio calcular. Además de esta espera real, se hacen dos pasadas más de refuerzo.
  waitImages(grid, function(){
    autofitLabels();
    requestAnimationFrame(autofitLabels);
    setTimeout(autofitLabels, 300);
  });
}
// Tarjeta de marca: una sola pieza (imagen + frase + redes + QR), repetida para llenar la hoja.
function labelMarca(item,s,social,qrSvg){
  return (item.img?'<div class="imgbox left '+(s.fit==='contain'?'fit-contain':'')+'"><img src="'+item.img+'"></div>':'')+
    '<div class="content fitbox">'+
      (item.phrase?'<div class="phrase fitbox">"'+esc(item.phrase)+'"</div>':'')+
      (s.handle?'<div class="opt-social">'+social+'</div>':'')+
    '</div>'+
    '<div class="qrbox">'+(qrSvg || '<div class="qrplaceholder">Escribe un link para el QR</div>')+'</div>';
}
function renderSheetMarca(){
  const s = sheets.marca.settings;
  const item = sheets.marca.item;
  const total = computeGrid();
  const grid=$('grid'); grid.innerHTML='';
  if(!item.img && !item.phrase) return;
  const social = s.handle ? ('<div class="handle">'+esc(s.handle)+'</div><div class="icons">'+FB+IG+TT(isDark(s.bg))+'</div>') : '';
  const qrSvg = makeQrSvg(item.qrUrl);
  for(let k=0;k<total;k++){
    const el=document.createElement('div'); el.className='label marca'+(item.img?' has-img':'');
    el.dataset.itemIdx='0';
    el.innerHTML = labelMarca(item,s,social,qrSvg);
    grid.appendChild(el);
  }
  waitImages(grid, function(){
    autofitLabels();
    requestAnimationFrame(autofitLabels);
    setTimeout(autofitLabels, 300);
  });
}
function waitImages(root, cb){
  const imgs = Array.from(root.querySelectorAll('img'));
  if(imgs.length===0){ cb(); return; }
  let remaining = imgs.length, done = false;
  function one(){ if(done) return; remaining--; if(remaining<=0){ done=true; cb(); } }
  imgs.forEach(function(img){
    if(img.complete && img.naturalWidth>0){ one(); }
    else { img.addEventListener('load', one, {once:true}); img.addEventListener('error', one, {once:true}); }
  });
  setTimeout(function(){ if(!done){ done=true; cb(); } }, 1500); // salvavidas: nunca esperar para siempre
}

// Prioridad de qué se oculta primero si de plano no entra todo (lo menos esencial primero).
// De más a menos importante: botella, nombre, marca de tienda, red social, logo, marca del
// perfume (casa), concentración — así que se oculta en orden inverso, empezando por lo último.
const DROP_ORDER = ['.opt-conc', '.opt-house', '.opt-logo', '.opt-social'];
const SCALE_MIN = 0.4, SCALE_MAX = 2.6, READABLE_FLOOR = 0.68; // por debajo de este umbral preferimos ocultar campos antes que encoger más
// Ajuste fino SOLO para un tamaño puntual (no afecta a los demás). Ahora mismo: vertical 5ml un poco más grande.
const SIZE_BOOST = { vertical: { '5': 1.15 } };

function labelFits(labelEl, scale){
  labelEl.style.setProperty('--lscale', scale.toFixed(3));
  const boxes = labelEl.querySelectorAll('.fitbox');
  for(let i=0;i<boxes.length;i++){
    const c=boxes[i];
    if(c.scrollHeight > c.clientHeight + 0.5 || c.scrollWidth > c.clientWidth + 0.5) return false;
  }
  return true;
}
function bestScale(labelEl, lo){
  if(!labelFits(labelEl, lo)) return null;
  let a=lo, b=SCALE_MAX;
  for(let i=0;i<9;i++){
    const mid=(a+b)/2;
    if(labelFits(labelEl, mid)) a=mid; else b=mid;
  }
  labelFits(labelEl, a);
  return a;
}
// Ajusta UNA etiqueta representativa: agranda al máximo que quepa manteniéndose legible; si ni al
// tamaño mínimo legible entra, oculta —solo dentro de la columna que realmente se desborda— primero
// lo menos esencial (redes → concentración → logo → casa) hasta que quepa cómodo.
function autofitOne(labelEl){
  DROP_ORDER.forEach(function(sel){ labelEl.querySelectorAll(sel).forEach(function(e){ e.style.display=''; }); });
  let scale = bestScale(labelEl, READABLE_FLOOR);
  const hiddenSet = new Set();
  let guard = 0;
  while(scale===null && guard<8){
    labelFits(labelEl, READABLE_FLOOR);
    const bad = Array.from(labelEl.querySelectorAll('.fitbox')).filter(function(c){
      return c.scrollHeight > c.clientHeight+0.5 || c.scrollWidth > c.clientWidth+0.5;
    });
    if(bad.length===0) break;
    let dropped=false;
    for(let i=0;i<DROP_ORDER.length && !dropped;i++){
      const sel=DROP_ORDER[i];
      for(let j=0;j<bad.length;j++){
        const el = bad[j].querySelector(sel);
        if(el && el.style.display!=='none'){ el.style.display='none'; hiddenSet.add(sel); dropped=true; }
      }
    }
    if(!dropped) break;
    guard++;
    scale = bestScale(labelEl, READABLE_FLOOR);
  }
  if(scale===null){ scale = bestScale(labelEl, SCALE_MIN); if(scale===null){ labelFits(labelEl, SCALE_MIN); scale=SCALE_MIN; } }
  return { scale: scale, hidden: hiddenSet };
}
// Horizontal: cada perfume se ajusta a SU PROPIO tamaño óptimo, de forma independiente (como
// estaba antes). Vertical: se usa una sola escala compartida para toda la hoja (ver más abajo),
// porque ahí sí quieres que todos los perfumes se vean del mismo tamaño entre sí.
function autofitLabels(){
  autofitLabelsShared(); // mismo sistema para horizontal y vertical: todos los perfumes al mismo tamaño
}
function autofitLabelsIndependent(){
  const labels = Array.from(document.querySelectorAll('#grid .label'));
  const byItem = {};
  labels.forEach(function(l){ (byItem[l.dataset.itemIdx] = byItem[l.dataset.itemIdx]||[]).push(l); });
  Object.keys(byItem).forEach(function(idx){
    const group = byItem[idx];
    const result = autofitOne(group[0]); // mide/ajusta solo la primera; el resto son idénticas
    for(let i=1;i<group.length;i++){
      group[i].style.setProperty('--lscale', result.scale.toFixed(3));
      DROP_ORDER.forEach(function(sel){
        group[i].querySelectorAll(sel).forEach(function(e){ e.style.display = result.hidden.has(sel) ? 'none' : ''; });
      });
    }
  });
}
// Calcula UNA sola escala y UN solo conjunto de campos ocultos para TODA la hoja, basándose en el
// perfume más "apretado" de la lista, PERO probando distintos niveles de qué tan dispuesto está a
// ocultar campos opcionales — porque a veces ocultar la concentración (por ejemplo) en TODA la hoja
// permite que el resto se vea bastante más grande, y eso vale la pena aunque técnicamente ya cupiera
// todo a un tamaño más chico. Se elige el nivel que da la letra más grande posible, sin pasarse de
// ocultar más de lo necesario para lograrlo.
const GOOD_SCALE_TARGET = 1.0; // a partir de este tamaño ya se considera "grande y legible"
function autofitLabelsShared(){
  const s=S().settings;
  const labels = Array.from(document.querySelectorAll('#grid .label'));
  const byItem = {};
  labels.forEach(function(l){ (byItem[l.dataset.itemIdx] = byItem[l.dataset.itemIdx]||[]).push(l); });
  const idxs = Object.keys(byItem);
  if(idxs.length===0) return;

  idxs.forEach(function(idx){ byItem[idx][0].querySelectorAll('.imgmid').forEach(function(im){ im.style.height='10px'; }); });

  function scaleAtLevel(level){
    idxs.forEach(function(idx){
      const el = byItem[idx][0];
      DROP_ORDER.forEach(function(sel,i){ el.querySelectorAll(sel).forEach(function(e){ e.style.display = (i<level)?'none':''; }); });
    });
    let sc = SCALE_MAX;
    idxs.forEach(function(idx){
      const el = byItem[idx][0];
      let one = bestScale(el, READABLE_FLOOR);
      if(one===null){ one = bestScale(el, SCALE_MIN); if(one===null) one = SCALE_MIN; }
      sc = Math.min(sc, one);
    });
    return sc;
  }

  // probar de menos a más agresivo, y quedarse con el primer nivel que ya da un tamaño "grande y
  // legible"; si ninguno lo logra, usar el nivel que haya dado el resultado más grande de todos
  let bestLevel = 0, bestScaleFound = scaleAtLevel(0);
  if(bestScaleFound < GOOD_SCALE_TARGET){
    for(let level=1; level<=DROP_ORDER.length; level++){
      const sc = scaleAtLevel(level);
      if(sc > bestScaleFound){ bestScaleFound = sc; bestLevel = level; }
      if(sc >= GOOD_SCALE_TARGET){ break; }
    }
  }
  let sharedScale = scaleAtLevel(bestLevel); // deja el DOM en el estado del nivel elegido

  // ajuste fino opcional para un tamaño de etiqueta puntual (ver SIZE_BOOST), solo si de verdad
  // sigue cabiendo en TODOS los perfumes de la lista
  const boost = (SIZE_BOOST[s.orientation]||{})[s.volume] || 1;
  if(boost>1){
    const boosted = sharedScale*boost;
    let allFit = true;
    idxs.forEach(function(idx){ if(!labelFits(byItem[idx][0], boosted)) allFit=false; });
    if(allFit) sharedScale = boosted; else scaleAtLevel(bestLevel); // restaurar visibilidad si no calzó el boost
  }

  // aplicar la MISMA escala y los MISMOS campos ocultos (según bestLevel) a todas las etiquetas
  idxs.forEach(function(idx){
    byItem[idx].forEach(function(el){
      el.style.setProperty('--lscale', sharedScale.toFixed(3));
      DROP_ORDER.forEach(function(sel,i){
        el.querySelectorAll(sel).forEach(function(e){ e.style.display = (i<bestLevel) ? 'none' : ''; });
      });
      fillImgMid(el);
    });
  });
}
// La imagen central de los modelos verticales debe llenar TODO el espacio sobrante entre los textos
// de arriba y abajo. En vez de predecir el tamaño con matemática (poco fiable por ajustes de línea y
// márgenes), se busca directamente —igual que con el texto— el mayor alto que realmente quepa.
function fillImgMid(labelEl){
  const content = labelEl.querySelector('.content.vertical');
  if(!content) return;
  const imgmid = content.querySelector('.imgmid');
  if(!imgmid) return;
  function fits(h){ imgmid.style.height = h.toFixed(1)+'px'; return content.scrollHeight <= content.clientHeight + 0.5; }
  if(!fits(10)){ imgmid.style.height='10px'; return; }
  let lo=10, hi=Math.max(20, content.clientHeight);
  for(let i=0;i<12;i++){
    const mid=(lo+hi)/2;
    if(fits(mid)) lo=mid; else hi=mid;
  }
  fits(lo);
}

// ---------- plantillas ----------
function renderTemplates(){
  const box=$('tplList'); if(!box) return; box.innerHTML='';
  if(templates.length===0){ box.innerHTML='<div class="hint" style="margin-top:6px;">Aún no tienes plantillas guardadas.</div>'; return; }
  templates.forEach(function(t){
    const d=document.createElement('div'); d.className='tplrow';
    const tipo = t.tab==='negro' ? 'Fondo negro' : t.tab==='marca' ? 'Tarjeta de marca' : 'Texto clásico';
    d.innerHTML='<span class="tplname">'+esc(t.name)+' <em>· '+tipo+'</em></span>'+
      '<span><button class="mini" onclick="cargarPlantilla(\''+t.id+'\')">Cargar</button> '+
      '<button class="mini" onclick="descargarPDF(\''+t.id+'\')">⬇ PDF</button> '+
      '<button class="mini del" onclick="eliminarPlantilla(\''+t.id+'\')">Eliminar</button></span>';
    box.appendChild(d);
  });
}
function snapshot(nombre){
  const isMarca = activeTab==='marca';
  return { id:String(Date.now())+Math.floor(Math.random()*999), name:nombre, tab:activeTab,
           perfumes: isMarca ? undefined : clone(S().perfumes),
           item: isMarca ? clone(sheets.marca.item) : undefined,
           settings:clone(S().settings) };
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
  activeTab=t.tab;
  if(t.tab==='marca'){
    sheets.marca.item = t.item ? Object.assign(blankMarcaItem(), clone(t.item)) : blankMarcaItem();
    sheets.marca.settings = Object.assign(defaultMarcaSettings(), clone(t.settings));
  } else {
    sheets[t.tab].perfumes=clone(t.perfumes); sheets[t.tab].settings=Object.assign(defaultSettings(t.tab==='negro'), clone(t.settings));
  }
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
  const prevTab=activeTab, prevClasico=clone(sheets.clasico), prevNegro=clone(sheets.negro), prevMarca=clone(sheets.marca), prevTitle=document.title;
  activeTab=t.tab;
  if(t.tab==='marca'){
    sheets.marca.item = t.item ? Object.assign(blankMarcaItem(), clone(t.item)) : blankMarcaItem();
    sheets.marca.settings = Object.assign(defaultMarcaSettings(), clone(t.settings));
  } else {
    sheets[t.tab].perfumes=clone(t.perfumes); sheets[t.tab].settings=Object.assign(defaultSettings(t.tab==='negro'), clone(t.settings));
  }
  fillControls(); applyColors(); renderEditor(); renderSheet();
  document.title = (brandName||'Etiquetas').replace(/[\\/:*?"<>|]/g,'') + ' - ' + t.name.replace(/[\\/:*?"<>|]/g,'');
  setTimeout(function(){
    window.print();
    document.title=prevTitle;
    activeTab=prevTab; sheets.clasico=prevClasico; sheets.negro=prevNegro; sheets.marca=prevMarca;
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
  s.handle = socialHandle; // el cliente no lo edita, lo fija el administrador
  $('handleDisplay').textContent = socialHandle || '(sin asignar — pídeselo a tu administrador)';
  $('conn').value=s.conn||''; $('fit').value=s.fit;
  $('bg').innerHTML=optionsHTML(BG,s.bg);
  $('accent').innerHTML=optionsHTML(PALETTE,s.accent);
  $('cBrand').innerHTML=optionsHTML(PALETTE,s.cBrand);
  $('cName').innerHTML=optionsHTML(PALETTE,s.cName);
  $('cHouse').innerHTML=optionsHTML(PALETTE,s.cHouse);
  $('cHandle').innerHTML=optionsHTML(PALETTE,s.cHandle);
  $('tiendaLabel').textContent=brandName;

  const isMarca = activeTab==='marca';
  $('formatoSect').style.display = isMarca ? 'none' : 'block';
  $('marcaFormatoSect').style.display = isMarca ? 'block' : 'none';
  $('cardsSect').style.display = isMarca ? 'none' : 'block';
  $('marcaSect').style.display = isMarca ? 'block' : 'none';
  $('modoRow').style.display = isMarca ? 'none' : 'flex';
  $('connField').style.display = (isMarca || activeTab==='negro') ? 'none' : 'block';

  if(isMarca){ $('sheetSizeMarca').value=s.sheetSize; }
  else { $('orientation').value=s.orientation; $('volume').value=s.volume; $('sheetSize').value=s.sheetSize; }

  document.querySelectorAll('.tab').forEach(function(t){ t.classList.toggle('active', t.dataset.tab===activeTab); });
}
function setTab(t){ readControls(); activeTab=t; fillControls(); applyColors(); renderEditor(); renderSheet(); }

// ---------- supabase ----------
async function loadData(){
  const res=await sb.from('profiles').select('brand_name,social_handle,data').eq('id',user.id).single();
  if(res.error) console.warn(res.error.message);
  const d=res.data;
  if(d){
    brandName = d.brand_name && d.brand_name.trim() ? d.brand_name : brandName;
    socialHandle = (d.social_handle!==null && d.social_handle!==undefined) ? d.social_handle.trim() : socialHandle;
    if(d.data){
      if(Array.isArray(d.data.templates)) templates=d.data.templates;
      if(d.data.sheets){
        ['clasico','negro'].forEach(function(t){
          if(d.data.sheets[t]){
            sheets[t].settings=Object.assign(defaultSettings(t==='negro'), d.data.sheets[t].settings||{});
            if(Array.isArray(d.data.sheets[t].perfumes)&&d.data.sheets[t].perfumes.length) sheets[t].perfumes=d.data.sheets[t].perfumes;
          }
        });
        if(d.data.sheets.marca){
          sheets.marca.settings = Object.assign(defaultMarcaSettings(), d.data.sheets.marca.settings||{});
          if(d.data.sheets.marca.item) sheets.marca.item = Object.assign(blankMarcaItem(), d.data.sheets.marca.item);
        }
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
