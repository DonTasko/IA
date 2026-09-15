const CACHE_NOME = "cfp-cache-v1";
const FICHEIROS_ESSENCIAIS = [
  "./index.html",
  "./css/style.css",
  "./js/config.js",
  "./js/storage.js",
  "./js/calculadoras.js",
  "./js/share.js",
  "./js/app.js",
  "./manifest.json",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(FICHEIROS_ESSENCIAIS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((chave) => chave !== CACHE_NOME).map((chave) => caches.delete(chave)))
    )
  );
  self.clients.claim();
});

// Estratégia: network-first para HTML (conteúdo sempre atualizado quando há rede),
// cache-first para o resto (CSS/JS/ícones), com fallback para cache quando offline.
self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;

  const ehHtml = pedido.headers.get("accept") && pedido.headers.get("accept").includes("text/html");

  if (ehHtml) {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE_NOME).then((cache) => cache.put(pedido, copia));
          return resposta;
        })
        .catch(() => caches.match(pedido).then((resp) => resp || caches.match("./index.html")))
    );
    return;
  }

  evento.respondWith(
    caches.match(pedido).then((respostaCache) => {
      if (respostaCache) return respostaCache;
      return fetch(pedido)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE_NOME).then((cache) => cache.put(pedido, copia));
          return resposta;
        })
        .catch(() => respostaCache);
    })
  );
});
