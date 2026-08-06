const SUPABASE_URL =
  "https://xgtzyinfinjehxzojafn.supabase.co";

const SUPABASE_PUBLIC_KEY =
  "sb_publishable_4iYSQaPGuSxaaZUkwdF_lw_IueIdhRw";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLIC_KEY,
);

console.log("Supabase conectado com sucesso:", window.supabaseClient);