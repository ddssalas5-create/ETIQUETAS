/* Panel de administrador */
let sb=null, user=null;
function $(id){ return document.getElementById(id); }
function esc(t){ return (t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function showLogin(){ $('login').style.display='flex'; $('admin').style.display='none'; }
function showAdmin(){ $('login').style.display='none'; $('admin').style.display='block'; $('adminEmail').textContent=user.email; loadUsers(); }

async function esAdmin(){
  const r = await sb.from('profiles').select('is_admin').eq('id', user.id).single();
  return !r.error && r.data && r.data.is_admin === true;
}

async function loadUsers(){
  const r = await sb.from('profiles').select('id,email,brand_name,social_handle').order('email',{ascending:true});
  const tb = $('rows'); tb.innerHTML='';
  if(r.error){ tb.innerHTML='<tr><td colspan="4">Error: '+esc(r.error.message)+'</td></tr>'; return; }
  (r.data||[]).forEach(function(u){
    const tr=document.createElement('tr');
    tr.innerHTML =
      '<td>'+esc(u.email||'(sin correo)')+'</td>'+
      '<td><input type="text" id="b_'+u.id+'" value="'+esc(u.brand_name||'')+'" placeholder="Nombre de la marca"></td>'+
      '<td><input type="text" id="h_'+u.id+'" value="'+esc(u.social_handle||'')+'" placeholder="@usuario"></td>'+
      '<td><button class="save" onclick="guardarPerfil(\''+u.id+'\')">Guardar</button><span class="rowmsg" id="m_'+u.id+'"></span></td>';
    tb.appendChild(tr);
  });
  if((r.data||[]).length===0) tb.innerHTML='<tr><td colspan="4">Aún no hay usuarios. Créalos en Supabase → Authentication → Users.</td></tr>';
}

async function crearUsuario(){
  const email=$('nu_email').value.trim();
  const pass=$('nu_pass').value;
  const brand=$('nu_brand').value.trim();
  const handle=$('nu_handle').value.trim();
  const msg=$('nu_msg');
  if(!email || !pass){ msg.textContent='Correo y contraseña son obligatorios.'; msg.style.color='#a33'; return; }
  if(pass.length < 6){ msg.textContent='La contraseña debe tener al menos 6 caracteres.'; msg.style.color='#a33'; return; }
  msg.textContent='Creando…'; msg.style.color='#888';
  try{
    const sess = await sb.auth.getSession();
    const token = sess.data.session.access_token;
    const resp = await fetch(window.CFG.url + '/functions/v1/create-user', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+token },
      body: JSON.stringify({ email:email, password:pass, brand_name:brand, social_handle:handle })
    });
    const out = await resp.json();
    if(!resp.ok){ msg.textContent='Error: '+(out.error||resp.statusText); msg.style.color='#a33'; return; }
    msg.textContent='Cliente creado ✓'; msg.style.color='#2a7';
    $('nu_email').value=''; $('nu_pass').value=''; $('nu_brand').value=''; $('nu_handle').value='';
    loadUsers();
  }catch(e){ msg.textContent='Error: '+e; msg.style.color='#a33'; }
}

async function guardarPerfil(id){
  const brand = $('b_'+id).value.trim();
  const handle = $('h_'+id).value.trim();
  const msg = $('m_'+id); msg.textContent='Guardando…'; msg.style.color='#888';
  const r = await sb.from('profiles').update({ brand_name: brand, social_handle: handle }).eq('id', id);
  if(r.error){ msg.textContent='Error'; msg.style.color='#a33'; }
  else { msg.textContent='✓'; msg.style.color='#2a7'; setTimeout(function(){msg.textContent='';},2000); }
}

async function entrar(){
  const email=$('email').value.trim(), pass=$('password').value, err=$('loginErr'); err.textContent='';
  if(!sb){ err.textContent='Falta configurar config.js.'; return; }
  const b=$('loginBtn'); b.disabled=true; b.textContent='Entrando…';
  const res=await sb.auth.signInWithPassword({email:email,password:pass});
  b.disabled=false; b.textContent='Entrar';
  if(res.error){ err.textContent='Correo o contraseña incorrectos.'; return; }
  user=res.data.user;
  if(!(await esAdmin())){ err.textContent='Esta cuenta no es administrador.'; await sb.auth.signOut(); user=null; return; }
  showAdmin();
}
async function salir(){ if(sb) await sb.auth.signOut(); user=null; showLogin(); }

async function init(){
  try{
    if(window.supabase && window.CFG && !/TU-PROYECTO/.test(window.CFG.url)){
      sb=window.supabase.createClient(window.CFG.url, window.CFG.key);
      const s=await sb.auth.getSession();
      if(s.data && s.data.session){ user=s.data.session.user; if(await esAdmin()){ showAdmin(); return; } await sb.auth.signOut(); user=null; }
    }
  }catch(e){ console.warn(e); }
  showLogin();
}
window.addEventListener('DOMContentLoaded', init);
