
(function(){const c=window.ACADEMIA_CONFIG||{};window.academiaSupabase=null;if(window.supabase&&c.supabaseUrl&&c.supabaseAnonKey){try{window.academiaSupabase=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey)}catch(e){console.error('Falha ao iniciar Supabase',e)}}})();
