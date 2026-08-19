// AlertaAí PWA service worker — network-first p/ o app, fallback offline.
// ⚠️ TROCAR ESTA VERSÃO A CADA MUDANÇA DO APP (16/08): o `activate` apaga todo cache que não seja
// esta chave, então bumpar aqui é o que garante que o navegador largue a versão velha. Sem isso o
// Pages já servia o arquivo novo e o app continuava rodando o antigo — foi o que fez o "Atualizar"
// do Painel do dono parecer quebrado.
const C = 'alertaai-v2-2026-08-18b';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(['./', './index.html', './coruja.png', './manifest.json'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  // só cuida do MESMO domínio (o app). Supabase/CDN passam direto.
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const cp = r.clone();
      caches.open(C).then((c) => c.put(e.request, cp)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request))
  );
});
