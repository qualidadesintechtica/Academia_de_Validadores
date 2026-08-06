
const Auth={
 getUser(){try{return JSON.parse(localStorage.getItem('academia_user')||'null')}catch{return null}},
 require(){if(!this.getUser())location.href=this.base()+'login.html'},
 base(){return location.pathname.includes('/pages/')?'../':'./'},
 login(email,name){const user={email,name:name||email.split('@')[0]||'Professor(a)'};localStorage.setItem('academia_user',JSON.stringify(user));return user},
 logout(){localStorage.removeItem('academia_user');location.href=this.base()+'login.html'}
};
