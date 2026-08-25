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
  const r = await sb.from('profiles').select('id,email,brand_name').order('email',{ascending:true});
  const tb = $('rows'); tb.innerHTML='';
  if(r.error){ tb.innerHTML='<tr><td colspan="3">Error: '+esc(r.error.message)+'</td></tr>'; return; }
  (r.data||[]).forEach(function(u){
    const tr=document.createElement('tr');
    tr.innerHTML =
      '<td>'+esc(u.email||'(sin correo)')+'</td>'+
      '<td><input type="text" id="b_'+u.id+'" value="'+esc(u.brand_name||'')+'" placeholder="Nombre de la marca"></td>'+
      '<td><button class="save" onclick="guardarMarca(\''+u.id+'\')">Guardar</button><span class="rowmsg" id="m_'+u.id+'"></span></td>';
    tb.appendChild(tr);
  });
  if((r.data||[]).length===0) tb.innerHTML='<tr><td colspan="3">Aún no hay usuarios. Créalos en Supabase → Authentication → Users.</td></tr>';
}

async function guardarMarca(id){
  const val = $('b_'+id).value.trim();
  const msg = $('m_'+id); msg.textContent='Guardando…'; msg.style.color='#888';
  const r = await sb.from('profiles').update({ brand_name: val }).eq('id', id);
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
