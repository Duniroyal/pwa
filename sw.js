// Service Worker للموقع - تحسين الأداء مع الحفاظ على تحديث البيانات
const CACHE_NAME = 'alhadth-cache-v4'; // تحديث رقم الإصدار
const NEWS_WEBSITE = 'https://alhadth.ct.ws/';
const urlsToCache = [
  NEWS_WEBSITE,
  NEWS_WEBSITE + 'index.php',
  'manifest.json',
  'statics/icons8-news-96.png',
  'statics/icons8-news-144.png',
  'statics/icons8-news-192.png',
  'statics/icons8-news-512.png'
];

// تثبيت الـ Service Worker
self.addEventListener('install', event => {
    self.skipWaiting(); // تخطي الانتظار للتفعيل الفوري
    console.log('تثبيت Service Worker للموقع الإخباري');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('فتح الكاش');
                return cache.addAll(urlsToCache);
            })
    );
    
    // التحقق إذا كان المستخدم على صفحة GitHub وليس موقع الأخبار
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            // إذا كان المستخدم على GitHub، قم بتوجيهه إلى موقع الأخبار
            if (client.url.indexOf('github.io') !== -1 || client.url.indexOf('github.com') !== -1) {
                console.log('توجيه المستخدم من GitHub إلى موقع الأخبار');
                client.postMessage({ action: 'REDIRECT', url: NEWS_WEBSITE });
            }
        });
    });
});

// تنشيط الـ Service Worker الجديد
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // تفعيل السيطرة على العملاء مباشرة
    );
    
    // إرسال رسالة إلى الصفحات لإخبارها بتنشيط service worker جديد
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ action: 'SW_ACTIVATED' });
        });
    });
});

// دالة للتحقق من اتصال الإنترنت
async function isOnline() {
    try {
        const response = await fetch(NEWS_WEBSITE + 'ping.txt?_=' + Date.now());
        return response.ok;
    } catch (error) {
        return false;
    }
}

// معالجة الطلبات
self.addEventListener('fetch', event => {
    // تجاهل طلبات POST
    if (event.request.method !== 'GET') {
        return;
    }

    // إذا تم فتح الصفحة داخل GitHub، إعادة توجيه إلى موقع الأخبار
    const url = new URL(event.request.url);
    if (url.hostname.includes('github.io') || url.hostname.includes('github.com')) {
        if (url.pathname === '/' || url.pathname === '/index.html') {
            event.respondWith(
                fetch(event.request).then(response => {
                    return response;
                }).catch(() => {
                    return new Response(`
                        <html>
                        <head>
                            <meta http-equiv="refresh" content="0;url=${NEWS_WEBSITE}">
                            <title>جاري التوجيه...</title>
                        </head>
                        <body>
                            <p>جاري توجيهك إلى موقع الأخبار...</p>
                            <script>window.location.href = "${NEWS_WEBSITE}";</script>
                        </body>
                        </html>
                    `, { headers: { 'Content-Type': 'text/html' } });
                })
            );
            return;
        }
    }

    // استراتيجية الشبكة أولاً للمحتوى الديناميكي
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // تخزين نسخة في الكاش
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // استخدام الكاش عند فشل الاتصال بالإنترنت
                return caches.match(event.request);
            })
    );
});

// استماع للرسائل من الصفحة
self.addEventListener('message', event => {
    console.log('رسالة مستلمة في service worker:', event.data);
    
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    } else if (event.data === 'checkForUpdate') {
        // إعادة التحميل من الشبكة عند طلب التحديث
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ action: 'updateFound' }));
        });
    } else if (event.data === 'NAVIGATE_TO_NEWS') {
        // توجيه المستخدم إلى موقع الأخبار
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({ action: 'REDIRECT', url: NEWS_WEBSITE });
            });
        });
    }
}); 