// سكريبت ربط PWA من GitHub مع موقع الأخبار
// إضافة هذا الملف إلى موقعك الأصلي https://alhadth.ct.ws/

(function() {
    // المسار إلى مستودع GitHub الخاص بك (قم بتحديثه حسب مستودعك)
    const GITHUB_REPO = 'https://duniroyal.github.io/pwa';
    
    // تسجيل Service Worker من GitHub
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async function() {
            try {
                // تخزين URL موقعك في localStorage
                localStorage.setItem('news_site_url', window.location.href);
                
                // تسجيل Service Worker
                const registration = await navigator.serviceWorker.register(GITHUB_REPO + '/sw.js', {
                    scope: '/'
                });
                console.log('تم تسجيل Service Worker من GitHub بنجاح:', registration);
            } catch (error) {
                console.error('فشل في تسجيل Service Worker من GitHub:', error);
            }
        });
    }
    
    // إضافة رابط المانيفست
    function addManifestLink() {
        // البحث عن رابط المانيفست الحالي وإزالته إذا وجد
        const existingLink = document.querySelector('link[rel="manifest"]');
        if (existingLink) {
            existingLink.remove();
        }
        
        // إضافة رابط المانيفست الجديد
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = GITHUB_REPO + '/manifest.json';
        manifestLink.crossOrigin = 'use-credentials';
        document.head.appendChild(manifestLink);
        console.log('تم إضافة رابط المانيفست من GitHub');
    }
    
    // تنفيذ الوظيفة عند تحميل الصفحة
    window.addEventListener('DOMContentLoaded', addManifestLink);
    
    // الاستماع للرسائل من Service Worker
    if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', function(event) {
            console.log('رسالة من Service Worker:', event.data);
            
            // معالجة الرسائل
            if (event.data && event.data.action === 'updateFound') {
                if (confirm('هناك تحديث جديد للتطبيق. هل ترغب في إعادة التحميل لتطبيق التحديث؟')) {
                    window.location.reload();
                }
            }
        });
    }
    
    // تهيئة معالجة beforeinstallprompt
    let deferredPrompt;
    const pwaInstallBtn = document.getElementById('pwa-install-btn');
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // منع الإظهار التلقائي
        e.preventDefault();
        
        // تخزين الحدث لاستخدامه لاحقًا
        deferredPrompt = e;
        
        // إظهار زر التثبيت
        if (pwaInstallBtn) {
            pwaInstallBtn.style.display = 'block';
        }
    });
    
    // التحقق من وجود زر التثبيت وإضافة حدث النقر
    if (pwaInstallBtn) {
        pwaInstallBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            
            // إظهار نافذة التثبيت
            deferredPrompt.prompt();
            
            // انتظار اختيار المستخدم
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`قرار المستخدم: ${outcome}`);
            
            // تفريغ المرجع
            deferredPrompt = null;
            
            // إخفاء الزر
            pwaInstallBtn.style.display = 'none';
        });
    }
    
    // معالجة حدث التثبيت الناجح
    window.addEventListener('appinstalled', (evt) => {
        console.log('تم تثبيت التطبيق بنجاح!');
        
        // إخفاء زر التثبيت
        if (pwaInstallBtn) {
            pwaInstallBtn.style.display = 'none';
        }
    });
})(); 