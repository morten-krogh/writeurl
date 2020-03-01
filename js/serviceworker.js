const CACHE_NAME = 'writeurl-cache-v1';

const urlstocache = [
    '/',
    '/embed/index.html',
    '/index.html',
    '/favicon.ico',
    '/publish/faq',
    '/css/style.css',
    '/css/embed.css',
    '/css/publish.css',
    '/js/first.js',
    '/js/config.js',
    '/js/lib.js',
    '/js/doc.js',
    '/js/state.js',
    '/js/location.js',
    '/js/ops.js',
    '/js/event_listeners.js',
    '/js/trigger.js',
    '/js/editor.js',
    '/js/notify.js',
    '/js/paste.js',
    '/js/browser.js',
    '/js/inputs.js',
    '/js/title.js',
    '/js/publish.js',
    '/js/css/publish.js',
    '/js/last.js',
    '/img/ampersand.svg',
    '/img/bolt.svg',
    '/img/denied.svg',
    '/img/fork.svg',	
    '/img/home.svg',
    '/img/nyckelpiga.jpg',
    '/img/redo.svg',
    '/img/undo.svg',
    '/img/bg_button.png',
    '/img/cloud.svg',
    '/img/down.svg',
    '/img/furley_bg.png',
    '/img/image.svg',
    '/img/pen_alt2.svg',
    '/img/secure.svg',
    '/img/bg_frontpage.png',
    '/img/collaborative.svg',
    '/img/export.svg',
    '/img/history.svg',
    '/img/link.svg',
    '/img/plus.svg',
    '/img/text_editor.svg',
];

//const version = 9;

self.addEventListener('install', event => {
    //console.log('service worker install', version);
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlstocache);
        })
    );
});

self.addEventListener('activate', event => {
    //console.log('activate ', version);
    event.waitUntil(
        caches.keys().then(keys => { return Promise.all(
            keys.map(key => {
                if (key != CACHE_NAME) {
                    //console.log('delete cache', key);
                    return caches.delete(key);
                }
            }));}
    ).then(() => {
      //console.log('V2 now ready to handle fetches!');
    }));
});

self.addEventListener('fetch', event => {
    //console.log('service worker fetch event', version);
    event.respondWith(caches.match(event.request).then(response => {
        if (response) {
            return  response;
        }
        //console.log('No cache for ', event.request.url);
        return caches.match('/');
    }));
});
