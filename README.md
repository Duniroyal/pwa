# مستودع PWA لموقع صوت الحدث

هذا المستودع يحتوي على ملفات PWA (Progressive Web App) اللازمة لتحويل موقع "صوت الحدث" الإخباري إلى تطبيق ويب تدريجي.

## المحتويات

- `manifest.json` - ملف يصف التطبيق وكيفية عرضه على أجهزة المستخدمين
- `sw.js` - Service Worker للسماح بالعمل دون اتصال بالإنترنت وتحسين الأداء
- `index.html` - صفحة توجيه إلى الموقع الأصلي
- `pwa-connector.js` - سكريبت لربط الـ PWA بموقع الأخبار
- `statics/` - مجلد يحتوي على أيقونات التطبيق بمختلف المقاسات

## كيفية الاستخدام

### الخطوة 1: استضافة ملفات PWA على GitHub Pages

تم بالفعل استضافة هذه الملفات على GitHub Pages على الرابط:
https://duniroyal.github.io/pwa/

### الخطوة 2: ربط موقع الأخبار الأصلي بالـ PWA

أضف الكود التالي في الـ `<head>` لموقعك الأصلي (https://alhadth.ct.ws/):

```html
<!-- ربط PWA من GitHub -->
<script>
    // المسار إلى مستودع GitHub الخاص بك
    const GITHUB_PAGES_URL = 'https://duniroyal.github.io/pwa';
    
    // إضافة رابط المانيفست
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = GITHUB_PAGES_URL + '/manifest.json';
    document.head.appendChild(manifestLink);
    
    // تسجيل Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register(GITHUB_PAGES_URL + '/sw.js', {
                    scope: '/'
                });
                console.log('تم تسجيل Service Worker بنجاح:', registration.scope);
            } catch (error) {
                console.error('فشل في تسجيل Service Worker:', error);
            }
        });
    }
</script>
```

أو بدلاً من ذلك، يمكنك إضافة هذا السكريبت مباشرة:

```html
<script src="https://duniroyal.github.io/pwa/pwa-connector.js"></script>
```

### الخطوة 3: إضافة زر تثبيت التطبيق (اختياري)

أضف هذا الكود في أي مكان تريد ظهور زر تثبيت التطبيق فيه:

```html
<button id="pwa-install-btn" style="display: none;">تثبيت التطبيق</button>
```

## ملاحظات هامة

- تم تكوين هذه الملفات خصيصًا لموقع صوت الحدث على الرابط https://alhadth.ct.ws/
- قد تواجه بعض القيود بسبب سياسات الأمان CORS. تأكد من تكوين خوادمك لتسمح بالاتصالات عبر النطاقات المختلفة.
- يجب أن يتم تقديم الموقع عبر HTTPS حتى يعمل Service Worker بشكل صحيح.

## التخصيص

- يمكنك تعديل ملف `manifest.json` لتغيير شكل وسلوك التطبيق.
- يمكنك تعديل `sw.js` لتخصيص استراتيجية التخزين المؤقت.

## مشاكل شائعة وحلولها

- **Service Worker لا يعمل**: تأكد من أن موقعك يعمل على HTTPS.
- **لا يمكن تثبيت التطبيق**: تحقق من أن جميع الأيقونات في `manifest.json` متاحة وصالحة.
- **لا تظهر أيقونة التطبيق**: تأكد من تكوين الأيقونات بشكل صحيح في `manifest.json`.

## تواصل معنا

إذا واجهت أي مشاكل أو كانت لديك استفسارات، يرجى فتح مشكلة (issue) في هذا المستودع. 