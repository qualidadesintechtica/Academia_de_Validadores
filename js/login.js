
const tabs=document.querySelectorAll('.tab'),forms=document.querySelectorAll('.form');tabs.forEach(t=>t.onclick=()=>{tabs.forEach(x=>x.classList.toggle('active',x===t));forms.forEach(f=>f.classList.toggle('hidden',f.id!==t.dataset.target))});
function validCorporate(email){return /@.+\..+/.test(email)}
document.getElementById('loginForm').onsubmit=e=>{e.preventDefault();const email=e.target.email.value.trim(),pass=e.target.password.value;if(!validCorporate(email)||pass.length<6)return show('loginMessage','Informe um e-mail válido e senha com pelo menos 6 caracteres.',false);Auth.login(email);location.href='index.html'};
document.getElementById('signupForm').onsubmit=e=>{e.preventDefault();const name=e.target.name.value.trim(),email=e.target.email.value.trim(),pass=e.target.password.value;if(!name||!validCorporate(email)||pass.length<6)return show('signupMessage','Preencha todos os campos corretamente.',false);Auth.login(email,name);show('signupMessage','Conta criada. Entrando na Academia...',true);setTimeout(()=>location.href='index.html',700)};
function show(id,text,ok){const el=document.getElementById(id);el.textContent=text;el.style.color=ok?'#087a54':'#b0004f'}
