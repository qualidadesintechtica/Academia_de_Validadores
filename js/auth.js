const Auth = {
  base() {
    return location.pathname.includes('/pages/') || location.pathname.includes('/trilhas/') ? '../' : './';
  },

  localUser() {
    try {
      return JSON.parse(localStorage.getItem('academia_user') || 'null');
    } catch {
      return null;
    }
  },

  async supabaseUser(timeoutMs = 3500) {
    if (!window.academiaSupabase) return null;
    try {
      const request = window.academiaSupabase.auth.getUser();
      const timeout = new Promise((resolve) => setTimeout(() => resolve({ data: { user: null } }), timeoutMs));
      const result = await Promise.race([request, timeout]);
      const user = result?.data?.user;
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Professor(a)',
        source: 'supabase'
      };
    } catch (error) {
      console.warn('Não foi possível consultar a sessão do Supabase.', error);
      return null;
    }
  },

  async getUser() {
    return (await this.supabaseUser()) || this.localUser();
  },

  async require() {
    const user = await this.getUser();
    if (!user) {
      location.replace(this.base() + 'login.html');
      return null;
    }
    return user;
  },

  loginLocal(email, name) {
    const user = {
      id: 'local',
      email,
      name: name || email.split('@')[0] || 'Professor(a)',
      source: 'local'
    };
    localStorage.setItem('academia_user', JSON.stringify(user));
    return user;
  },

  async logout() {
    const button = document.getElementById('logoutButton');
    if (button) {
      button.disabled = true;
      button.textContent = 'Saindo...';
    }
    try {
      if (window.academiaSupabase) {
        await Promise.race([
          window.academiaSupabase.auth.signOut(),
          new Promise((resolve) => setTimeout(resolve, 3000))
        ]);
      }
    } catch (error) {
      console.warn('Falha ao encerrar sessão remota; a sessão local será removida.', error);
    } finally {
      localStorage.removeItem('academia_user');
      sessionStorage.clear();
      location.replace(this.base() + 'login.html?logout=1');
    }
  }
};
