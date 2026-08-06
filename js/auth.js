
const Auth={
 base(){return location.pathname.includes('/pages/')||location.pathname.includes('/trilhas/')?'../':'./'},
 localUser(){try{return JSON.parse(localStorage.getItem('academia_user')||'null')}catch{return null}},
 async getUser(){if(window.academiaSupabase){const {data}=await academiaSupabase.auth.getUser();if(data&&data.user)return {id:data.user.id,email:data.user.email,name:data.user.user_metadata?.name||data.user.email?.split('@')[0]||'Professor(a)',source:'supabase'}}return this.localUser()},
 async require(){const u=await this.getUser();if(!u){location.replace(this.base()+'login.html');return null}return u},
 loginLocal(email,name){const u={id:'local',email,name:name||email.split('@')[0]||'Professor(a)',source:'local'};localStorage.setItem('academia_user',JSON.stringify(u));return u},
 async logout(){try{if(window.academiaSupabase)await academiaSupabase.auth.signOut()}finally{localStorage.removeItem('academia_user');location.replace(this.base()+'login.html')}}
};
