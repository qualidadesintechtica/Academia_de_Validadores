import { createClient } from 'npm:@supabase/supabase-js@2';

// Esta função é executada no Supabase, nunca no GitHub Pages.
function envKey(name: string, legacy: string) {
  const keys = Deno.env.get(name);
  return (keys ? JSON.parse(keys).default : '') || Deno.env.get(legacy) || '';
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin') || '';
  const allowed = (Deno.env.get('ACADEMIA_ORIGINS') || 'https://qualidadesintechtica.github.io')
    .split(',').map(value => value.trim()).filter(Boolean);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  };
  if (allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  const reply = (status: number, message: string, ok = false) =>
    new Response(JSON.stringify({ok, message}), {status, headers});
  if (origin && !allowed.includes(origin)) return reply(403, 'Origem não autorizada.');
  if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers});
  if (req.method !== 'POST') return reply(405, 'Use POST.');
  if (!/^Bearer \S+$/i.test(req.headers.get('Authorization') || ''))
    return reply(401, 'Entre novamente na Academia.');
  if (!req.headers.get('Content-Type')?.includes('application/json'))
    return reply(415, 'Formato inválido.');

  try {
    const text = await req.text();
    if (new TextEncoder().encode(text).length > 4096) return reply(413, 'Solicitação muito grande.');
    let body;
    try { body = JSON.parse(text); } catch { return reply(400, 'Solicitação inválida.'); }
    const {user_id, email, password, confirmation} = body || {};
    if (typeof user_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user_id)
        || typeof email !== 'string' || !email.trim() || email.length > 320
        || typeof password !== 'string' || password.length < 8 || password.length > 128
        || !password.trim() || password !== confirmation)
      return reply(400, 'Informe e confirme uma senha de 8 a 128 caracteres.');

    const url = Deno.env.get('SUPABASE_URL') || '';
    const publicKey = envKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY');
    const serverKey = envKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !publicKey || !serverKey) return reply(503, 'Configuração do servidor incompleta.');
    const authorization = req.headers.get('Authorization')!;
    const client = createClient(url, publicKey, {
      global: {headers: {Authorization: authorization}},
      auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false},
    });
    // Validação remota do JWT; não confia na sessão enviada pelo navegador.
    const {data: identity, error: identityError} = await client.auth.getUser(authorization.replace(/^Bearer /i, ''));
    if (identityError || !identity?.user) return reply(401, 'Sua sessão expirou. Entre novamente.');
    // O SQL é transacional: a presença deste RPC confirma a instalação do fluxo.
    const {data: pending, error: pendingError} = await client.rpc('academia_senha_pendente');
    if (pendingError || typeof pending !== 'boolean') return reply(503, 'Instalação do serviço incompleta. Contate a administração.');
    if (pending) return reply(403, 'Troque sua senha antes de administrar participantes.');
    const {data: admin, error: adminError} = await client.rpc('is_academia_perfil_admin');
    if (adminError || admin !== true) return reply(403, 'Sua conta não tem permissão para definir senhas.');
    if (identity.user.id === user_id) return reply(409, 'Para sua própria conta, use a recuperação por e-mail.');

    const server = createClient(url, serverKey, {
      auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false},
    });
    const {data: target, error: targetError} = await server.auth.admin.getUserById(user_id);
    if (targetError || !target?.user) return reply(404, 'Participante não encontrado. Atualize a lista.');
    if (target.user.email?.toLowerCase() !== email.trim().toLowerCase())
      return reply(409, 'O e-mail do cadastro mudou. Atualize a lista.');

    // Senha e marcador são gravados juntos pelo Auth. O trigger SQL verifica
    // novamente administrador, destinatário e intervalo na mesma transação.
    const {data, error} = await server.auth.admin.updateUserById(user_id, {
      password,
      app_metadata: {academia_senha_temporaria: {
        pedido: crypto.randomUUID(), administrador: identity.user.id, email: target.user.email,
      }},
    });
    if (error || data?.user?.id !== user_id) {
      if (error?.code === 'same_password') return reply(400, 'Escolha uma senha diferente da senha atual.');
      if (error?.code === 'weak_password') return reply(400, 'A senha não atende às regras de segurança. Use uma senha mais forte.');
      if (error?.status === 429) return reply(429, 'Muitas tentativas. Aguarde e tente novamente.');
      return reply(409, 'Não foi possível definir a senha. Confira sua permissão e o cadastro, aguarde um minuto e tente novamente.');
    }
    return reply(200, 'Senha temporária definida. O professor deverá escolher outra no próximo acesso.', true);
  } catch {
    // Não registrar a requisição, a senha, tokens ou erros que possam contê-los.
    return reply(500, 'Não foi possível concluir. Confira a instalação e tente novamente.');
  }
});
