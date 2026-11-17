/* Osteo Help MMG · service worker
   Le immagini dei pazienti e le icone si scaricano una volta sola e poi si leggono dal telefono o dal PC:
   dalla seconda apertura compaiono subito. Pagina e script invece si chiedono sempre prima alla rete
   (così gli aggiornamenti arrivano subito) e dalla copia salvata solo se manca la connessione.
   Se si cambiano le immagini, aumentare VER: le vecchie copie vengono cancellate. */
const VER = "v1", IMG = "oh-mmg-img-" + VER, APP = "oh-mmg-app-" + VER;
const FIG = ["donna-anziana", "donna-femore", "donna-giovane", "donna-polso", "donna-vertebre", "uomo-anziano", "uomo-femore", "uomo-giovane", "uomo-polso", "uomo-vertebre"];
const PRE = [...FIG.flatMap(f => ["img/" + f + ".jpg", "img/" + f + "-viso.jpg"]), "icone/favicon.svg", "icone/apple-touch-icon-180.png", "icone/icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(IMG).then(c => c.addAll(PRE)).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("oh-mmg-") && k !== IMG && k !== APP).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if(r.method !== "GET" || u.origin !== location.origin) return;
  if(/\/mmg\/(img|icone)\//.test(u.pathname)){
    /* immagini: prima la copia sul dispositivo, la rete solo la prima volta */
    e.respondWith(caches.open(IMG).then(c => c.match(r, { ignoreSearch:true }).then(hit => hit || fetch(r).then(res => { if(res.ok) c.put(r, res.clone()); return res; }))));
    return;
  }
  if(u.href.startsWith(self.registration.scope)){
    /* pagina e script: prima la rete, la copia salvata se si è offline */
    e.respondWith(fetch(r).then(res => { if(res.ok){ const cp = res.clone(); caches.open(APP).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r, { ignoreSearch:true }).then(hit => hit || caches.match(self.registration.scope))));
  }
});
