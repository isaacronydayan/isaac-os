self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function(e){
  var h = new Date(Date.now() - 3*3600*1000).getUTCHours();
  var morning = h >= 4 && h < 15;
  var title = morning ? 'Bom dia, Isaac' : 'Fechamento do dia';
  var body = morning
    ? 'Seu briefing esta pronto: recovery, agenda e prioridades de hoje te esperam no Isaac OS.'
    : 'Ainda faltam habitos hoje - Shema, Invisalign e o que mais estiver aberto. Bora fechar o dia.';
  e.waitUntil(self.registration.showNotification(title, { body: body, data: { url: '/' }, tag: 'isaacos-daily' }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(cs){
    for (var i = 0; i < cs.length; i++) { if ('focus' in cs[i]) return cs[i].focus(); }
    return self.clients.openWindow('/');
  }));
});
