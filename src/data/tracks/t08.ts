import type { TrackContent } from '../../types/atlas';

const t08: TrackContent = {
  trackId: 'T08',
  chapters: [
    {
      id: 'T08-C01',
      code: 'D02 · T08 · C01',
      domainId: 'D02',
      trackId: 'T08',
      title: 'تفاوت AuthN (کیستی؟) و AuthZ (چه اجازه‌ای داری؟) و مدل‌های دسترسی RBAC در برابر ABAC',
      subtitle: 'جداسازی هویت از مجوز و طراحی لایه کنترل دسترسی که در مقیاس بزرگ دچار نشت نشود.',
      readMinutes: 5,
      difficulty: 'مبانی عمیق',
      originStory: [
        'در فهرست سالانه `OWASP Top 10`، آسیب‌پذیری «کنترل دسترسی شکسته» (`Broken Access Control`) سال‌هاست رتبه شماره یک جهان را دارد! عجیب اینکه بیشتر سیستم‌های هک‌شده، صفحه لاگین بسیار خوبی (`AuthN`) داشته‌اند، اما پس از لاگین فراموش کرده‌اند چک کنند آیا این کاربر واقعاً حق دیدن این سند خاص (`AuthZ`) را دارد یا نه.',
        'درک دقیق مرز بین احراز هویت و مجوزدهی، پایه تمام معماری‌های امنیتی از یک بلاگ ساده تا سیستم‌های چندمستاجره (`Multi-Tenant SaaS`) است.'
      ],
      mentalModel: {
        paragraphs: [
          '`Authentication (AuthN)` یعنی «ثابت کن کیستی» (با رمز، `Passkey` یا `OAuth` -> در صورت شکست کد `401 Unauthorized`). `Authorization (AuthZ)` یعنی «حالا که می‌دانم کیستی، آیا اجازه انجام این عمل روی این منبع خاص را داری؟» (در صورت شکست کد `403 Forbidden`).',
          'دو مدل اصلی مجوزدهی داریم: `RBAC` (مبتنی بر نقش مثل `admin`, `editor`, `viewer` — ساده و عالی برای شروع) و `ABAC` (مبتنی بر ویژگی مثل «کاربر عضو همان سازمان باشد + سند قفل نشده باشد + مالک سند باشد»). در سیستم‌های واقعی معمولاً ترکیبی از این دو همراه با قاعده «انکار پیش‌فرض» (`Deny by Default`) استفاده می‌شود.'
        ],
        rulesOfThumb: [
          'مخفی کردن یک دکمه در React امنیت نیست! تمام قواعد `AuthZ` باید در لایه `Service` سمت سرور اجرا شوند.',
          'در سیستم‌های چندمستاجره (`Multi-Tenant`)، شرط `AND tenant_id = :currentTenantId` باید در تمام کوئری‌های خواندن و نوشتن حضور داشته باشد.',
          'کد `401` یعنی «نمی‌شناسمت، لاگین کن»؛ کد `403` یعنی «می‌شناسمت ولی اجازه نداری».'
        ],
        diagram: {
          kind: 'flow',
          caption: 'گیت دو مرحله‌ای احراز هویت (AuthN) و مجوزدهی (AuthZ)',
          nodes: [
            { label: 'Incoming Request', sublabel: 'Cookie / Bearer Token' },
            { label: '1. AuthN (401)', sublabel: 'تایید هویت -> userId + tenantId' },
            { label: '2. AuthZ (403)', sublabel: 'بررسی نقش (RBAC) + مالکیت منبع (ABAC)', accent: true },
            { label: 'Protected Action', sublabel: 'اجرای امن روی منبع مجاز' }
          ]
        }
      },
      lab: [
        {
          title: 'سیاست مجوزدهی متمرکز و قابل تست در لایه Service (Deny-by-Default)',
          language: 'ts',
          code: `interface Actor { id: string; orgId: string; role: 'owner' | 'member'; }
interface Invoice { id: string; orgId: string; createdBy: string; locked: boolean; }

export function canEditInvoice(actor: Actor, invoice: Invoice): boolean {
  if (actor.orgId !== invoice.orgId) return false; // ایزولاسیون سازمان
  if (invoice.locked) return false;                // قانون دامنه (ABAC)
  if (actor.role === 'owner') return true;
  return invoice.createdBy === actor.id;           // مالکیت رکورد
}`,
          explanations: [
            { token: 'actor.orgId !== invoice.orgId', meaning: 'اولین و مهم‌ترین چک در `SaaS` برای جلوگیری از نشت داده بین دو شرکت مشتری.' },
            { token: 'Deny by Default', meaning: 'اگر هیچ شرط صریحی `true` نشد، به صورت پیش‌فرض دسترسی رد می‌شود.' }
          ]
        }
      ],
      warStory: {
        title: 'ویرایش تنظیمات شرکت رقیب توسط یک کاربر عادی',
        symptom: 'مشتری سازمانی در `saas.example.com` گزارش داد نام و لوگوی سازمانش ناگهان عوض شده است.',
        rootCause: 'مسیر `PUT /api/orgs/:orgId/settings` فقط چک کرده بود کاربر لاگین است (`AuthN`) و نقش `admin` دارد، ولی چک نکرده بود که کاربر ادمین **همین** `:orgId` باشد نه سازمان خودش!',
        preventionRule: 'نقش کاربر همیشه «نسبت به یک سازمان/منبع» معنا دارد؛ سیاست‌های `AuthZ` را متمرکز بنویسید و برای هر endpoint یک تست منفی (`403`) از کاربر سازمان دیگر اضافه کنید.'
      },
      deepDive: {
        title: 'مدل `ReBAC` (کنترل دسترسی مبتنی بر گراف روابط — الگوی Google Zanzibar)',
        content: [
          'در سیستم‌هایی شبیه `Google Docs` که یک فایل می‌تواند با یک فرد، یک تیم یا کل یک پوشه به اشتراک گذاشته شود، `RBAC` ساده کم می‌آورد.',
          'معماری `ReBAC` (`Relationship-Based Access Control`) مجوزها را به شکل یال‌های گراف (`user:ali -> viewer -> folder:7 -> parent -> doc:42`) ذخیره و استنتاج می‌کند.'
        ],
        takeAway: 'هرچه ساختار مالکیت داده پیچیده‌تر شود، متمرکز نگه داشتن منطق `AuthZ` حیاتی‌تر است.'
      },
      check: {
        type: 'triage',
        prompt: 'کاربری با توکن معتبر لاگین کرده و تلاش می‌کند فاکتور متعلق به سازمان دیگری را حذف کند. سرور چه کد وضعیت HTTPای باید برگرداند؟',
        options: [
          { id: 'a', label: '`403 Forbidden` (یا `404 Not Found` برای پنهان کردن وجود شناسه از کاربر غیرمجاز)', isCorrect: true, feedback: 'دقیقاً! هر دو `403` و `404` معتبرند (`404` وقتی نمی‌خواهید حتی وجود داشتن آن شناسه فاش شود)، اما `401` اشتباه است چون کاربر قبلاً احراز هویت شده است.' },
          { id: 'b', label: '`401 Unauthorized` تا کاربر دوباره لاگین کند', isCorrect: false, feedback: 'لاگین مجدد تغییری در مجوز کاربر روی سازمان دیگر نمی‌دهد.' },
          { id: 'c', label: '`500 Internal Server Error`', isCorrect: false, feedback: 'رد دسترسی غیرمجاز یک رفتار عادی امنیتی است نه خطای سرور.' }
        ]
      },
      crossLinks: [
        { targetId: 'T08-C05', reason: 'کالبدشکافی حمله `IDOR` که نتیجه مستقیم همین شکست در `AuthZ` است.' },
        { targetId: 'T13-C06', reason: 'معماری `Fail-Closed` در صورت خطا در لایه بررسی دسترسی.' }
      ]
    },
    {
      id: 'T08-C02',
      code: 'D02 · T08 · C02',
      domainId: 'D02',
      trackId: 'T08',
      title: 'Session Cookie در برابر JWT: ساختار دقیق JWT، تله‌های Refresh Token، Revocation و چرا نباید JWT را بی‌گدار در `localStorage` گذاشت',
      subtitle: 'مصالحه واقعی بین Stateful و Stateless بودن نشست و معماری امن چرخش توکن.',
      readMinutes: 7,
      difficulty: 'چالشی',
      originStory: [
        'با محبوب شدن `SPA`ها و میکروسرویس‌ها در دهه ۲۰۱۰، موجی به راه افتاد که می‌گفت «Sessionها قدیمی‌اند، همه‌چیز را `JWT` کنید و در `localStorage` بگذارید!». سال‌ها بعد صنعت متوجه بهای پنهان آن شد: وقتی حساب کاربری هک می‌شود یا کارمند اخراج می‌گردد، چطور یک `JWT` یک‌ماهه Stateless را باطل (`Revoke`) کنید؟',
        'مهندسان باتجربه امروز می‌دانند `Session Cookie` مبتنی بر `Redis` برای ۹۰٪ اپلیکیشن‌های وب هم ساده‌تر، هم امن‌تر و هم با قابلیت ابطال فوری در ۱ میلی‌ثانیه است.'
      ],
      mentalModel: {
        paragraphs: [
          'یک `JWT` سه بخش جداشده با نقطه دارد: `Header.Payload.Signature`. بخش وسط (`Payload`) رمزنگاری نشده و فقط `Base64URL` است؛ یعنی هر کسی می‌تواند محتوای آن را بخواند (پس هرگز رمز یا داده محرمانه در آن نگذارید). امضا فقط ثابت می‌کند کسی آن را دستکاری نکرده است.',
          'اگر به هر دلیل (`API` چندسرویسی یا اپلیکیشن موبایل) از `JWT` استفاده می‌کنید، استاندارد امن این است: `Access Token` کوتاه‌عمر (`5–15` دقیقه) + `Refresh Token` چرخشی (`Rotation`) ذخیره‌شده در دیتابیس/ردیس تا قابل ابطال باشد و در وب، نگهداری آن درون کوکی `HttpOnly; Secure; SameSite=Lax` نه در `localStorage` که با یک خط `XSS` سرقت می‌شود.'
        ],
        rulesOfThumb: [
          'اگر فقط یک وب‌اپ با بک‌اند واحد می‌سازید، `Opaque Session ID` در `Redis` + کوکی `HttpOnly` امن‌ترین و تمیزترین انتخاب است.',
          'در `JWT` هرگز به هدر `alg` ارسالی کلاینت اعتماد نکنید (`alg: none` حمله تاریخی است)؛ الگوریتم مجاز (`HS256` یا `EdDSA`) را در کد سرور صریح ثابت کنید.',
          'اگر `Refresh Token` یک بار مصرف دوباره ارسال شد (`Reuse Detection`)، یعنی توکن سرقت شده: کل خانواده نشست‌های آن کاربر را فوراً باطل کنید!'
        ],
        diagram: {
          kind: 'split',
          caption: 'مقایسه صادقانه Stateful Session Cookie در برابر Stateless JWT',
          nodes: [
            { label: 'Session Cookie + Redis', sublabel: 'ابطال آنی (Logout فوری) · ایمن در HttpOnly · کوچک', accent: true },
            { label: 'Short JWT + Refresh Rotation', sublabel: 'مناسب موبایل و میکروسرویس · ابطال روی لایه Refresh' }
          ]
        }
      },
      lab: [
        {
          title: 'تنظیم کوکی نشست سخت‌سازی‌شده در پاسخ HTTP',
          language: 'http',
          code: `Set-Cookie: __Host-sid=9f8a7c6b5d4e3f2a1b0c9d8e7f6a5b4c; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
          explanations: [
            { token: '__Host-', meaning: 'پیشوند امنیتی مرورگر که اجبار می‌کند کوکی حتماً `Secure`، روی `Path=/` و بدون `Domain` مشترک با زیردامنه‌های آسیب‌پذیر باشد.' },
            { token: 'HttpOnly', meaning: 'دسترسی `document.cookie` جاوااسکریپت به این کوکی را کاملاً قطع می‌کند (دفاع کلیدی برابر سرقت سشن توسط `XSS`).' },
            { token: 'SameSite=Lax', meaning: 'جلوی ارسال خودکار کوکی در درخواست‌های `POST` میان‌سایتی (`CSRF`) را می‌گیرد.' }
          ]
        }
      ],
      warStory: {
        title: 'ناتوانی در بیرون انداختن هکر حتی پس از تغییر رمز عبور کاربر',
        symptom: 'کاربر سرویس `cloud.example.com` متوجه نفوذ شد، سریعاً رمزش را عوض کرد و دکمه «خروج از همه دستگاه‌ها» را زد، اما مهاجم تا ۶ روز بعد همچنان به API دسترسی داشت!',
        rootCause: 'بک‌اند `JWT`هایی با انقضای ۷ روزه صادر می‌کرد و هیچ چک ابطالی روی سرور نداشت؛ دکمه خروج فقط توکن را از `localStorage` مرورگر خود کاربر پاک می‌کرد.',
        preventionRule: 'یا از `Session` قابل ابطال در `Redis` استفاده کنید یا `Access Token` را زیر ۱۵ دقیقه و `Refresh Token` را روی سرور قابل ابطال نگه دارید.'
      },
      deepDive: {
        title: 'الگوی `BFF` (Backend for Frontend) برای امنیت SPAها',
        content: [
          'در معماری `BFF`، حتی اگر سرویس‌های پشتی شما با `OAuth/JWT` کار کنند، یک لایه سبک سمت سرور روی همان دامنه فرانت‌اند توکن‌ها را نگه می‌دارد و به مرورگر صرفاً یک کوکی `HttpOnly` می‌دهد.',
          'این الگو عملاً توکن‌های `Bearer` را به طور کامل از دسترس کدهای جاوااسکریپت مرورگر و افزونه‌های مخرب خارج می‌کند.'
        ],
        takeAway: 'هرگز صرفاً به خاطر مد روز بودن `JWT`، قابلیت حیاتی ابطال فوری نشست را قربانی نکنید.'
      },
      check: {
        type: 'triage',
        prompt: 'یک همکار می‌خواهد `JWT` را در `localStorage` ذخیره کند و استدلال می‌کند: «چون سایت ما HTTPS دارد، پس `localStorage` کاملاً امن است». ایراد فنی این استدلال چیست؟',
        options: [
          { id: 'a', label: '`HTTPS` فقط داده را در مسیر شبکه رمز می‌کند؛ اگر یک باگ `XSS` یا پکیج npm آلوده در مرورگر اجرا شود، به راحتی `localStorage.getItem("token")` را می‌خواند و می‌دزدد، در حالی که کوکی `HttpOnly` برای جاوااسکریپت نامرئی است', isCorrect: true, feedback: 'دقیقاً! `HTTPS` هیچ محافظتی در برابر کدهای اجرایی درون مرورگر ایجاد نمی‌کند.' },
          { id: 'b', label: '`localStorage` در پروتکل `HTTPS` کار نمی‌کند', isCorrect: false, feedback: '`localStorage` در `HTTPS` کاملاً کار می‌کند؛ مشکل آن قابل‌خواندن بودن توسط جاوااسکریپت است.' },
          { id: 'c', label: '`JWT` به صورت خودکار رمزنگاری‌شده است پس لو رفتنش مهم نیست', isCorrect: false, feedback: 'هم اینکه `JWT` معمولی رمزنگاری‌شده نیست و هم اینکه مهاجم برای استفاده از توکن دزدیده‌شده اصلاً نیازی به رمزگشایی آن ندارد (Bearer Token است).' }
        ]
      },
      crossLinks: [
        { targetId: 'T08-C04', reason: 'چطور `XSS` به `localStorage` حمله می‌کند و چطور `SameSite` از کوکی برابر `CSRF` محافظت می‌نماید.' },
        { targetId: 'T05-C06', reason: 'مقایسه کلی `Cookies`، `localStorage` و `IndexedDB`.' }
      ]
    },
    {
      id: 'T08-C03',
      code: 'D02 · T08 · C03',
      domainId: 'D02',
      trackId: 'T08',
      title: 'OAuth 2.0، OpenID Connect (ورود با گوگل/گیت‌هاب) و Passkeys (WebAuthn) به زبان ساده و دقیق',
      subtitle: 'جریان Authorization Code با PKCE و آینده بدون رمز عبور با کلیدهای سخت‌افزاری.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در اواسط دهه ۲۰۰۰ سایت‌های جدید برای پیدا کردن دوستانتان از شما می‌خواستند رمز عبور `Gmail` خود را مستقیم در سایت آن‌ها تایپ کنید! برای پایان دادن به این دیوانگی امنیتی، `OAuth 2.0` (تفویض مجوز محدود) و سپس `OpenID Connect (OIDC)` روی آن (لایه هویت استاندارد) ساخته شدند.',
        'امروز گام بعدی یعنی `Passkeys (WebAuthn / FIDO2)` در حال بازنشسته کردن رمزهای عبور و پیامک‌های آسیب‌پذیر در برابر فیشینگ است.'
      ],
      mentalModel: {
        paragraphs: [
          'تفاوت مهم: `OAuth 2.0` درباره **مجوز** است («به این اپ اجازه بده تقویم گوگل من را بخواند»)؛ `OIDC` یک `ID Token` امضاشده (`JWT`) به آن اضافه می‌کند تا به **احراز هویت** تبدیل شود («ورود با گوگل»). استاندارد مدرن جریان ورود، `Authorization Code + PKCE` است: مرورگر فقط یک `code` یک‌بارمصرف می‌گیرد، و سپس در پس‌زمینه همراه با `code_verifier` (اثبات `PKCE`) به توکن تبدیل می‌شود تا حتی رهگیری لینک برگشت بی‌اثر شود.',
          'در `Passkeys (WebAuthn)` هر سایت یک جفت کلید نامتقارن اختصاصی روی تراشه امن گوشی/لپ‌تاپ شما می‌سازد. کلید خصوصی هرگز از دستگاه خارج نمی‌شود و مرورگر نام دامنه (`Origin`) را به امضا گره می‌زند؛ بنابراین حتی اگر کاربر فریب یک سایت فیشینگ (`g00gle.com`) را بخورد، مرورگر امضا تولید نمی‌کند!'
        ],
        rulesOfThumb: [
          'در `OAuth 2.0` جریان قدیمی `Implicit Flow` (برگشت توکن در `#access_token` آدرس) منسوخ و ناامن است؛ همیشه از `Authorization Code + PKCE` استفاده کنید.',
          'همیشه پارامتر تصادفی `state` را قبل از ریدایرکت به گوگل/گیت‌هاب در سشن ذخیره و در Callback تایید کنید تا حمله `Login CSRF` مسدود شود.',
          'در `OIDC` برای اتصال حساب کاربر به رکورد دیتابیس خود، کلید اصلی را `sub` (شناسه پایدار کاربر نزد Provider) بگیرید نه صرفاً `email` (چون ایمیل می‌تواند تغییر کند یا تاییدنشده باشد!).'
        ],
        diagram: {
          kind: 'flow',
          caption: 'جریان استاندارد OAuth 2.0 / OIDC با PKCE',
          nodes: [
            { label: '1. Redirect + state + PKCE', sublabel: 'ارسال کاربر به صفحه تایید گوگل/گیت‌هاب' },
            { label: '2. Callback with ?code=', sublabel: 'برگشت کد یک‌بارمصرف کوتاه‌عمر' },
            { label: '3. Backchannel Exchange', sublabel: 'مبادله code + verifier روی سرور -> ID/Access Token', accent: true },
            { label: '4. Local Session', sublabel: 'صدور کوکی امن HttpOnly در اپ شما' }
          ]
        }
      },
      lab: [
        {
          title: 'ساخت جفت code_verifier و code_challenge در PKCE (S256)',
          language: 'ts',
          code: `import { createHash, randomBytes } from 'node:crypto';

export function createPkcePair() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge, method: 'S256' as const };
}`,
          explanations: [
            { token: 'challenge', meaning: 'هش `SHA-256` است که در مرحله اول داخل URL فرستاده می‌شود.' },
            { token: 'verifier', meaning: 'مقدار مخفی که فقط در مرحله تبادل نهایی ارسال می‌شود تا ثابت شود همان کلاینت اولیه است.' }
          ]
        }
      ],
      warStory: {
        title: 'تصرف حساب کاربران در ورود با OAuth به دلیل اعتماد به ایمیل تاییدنشده',
        symptom: 'مهاجم در یک ارائه‌دهنده ثالث حسابی با ایمیل مدیر `admin@example.com` (بدون تایید ایمیل) ساخت و با زدن «ورود با سرویس X» مستقیم وارد پنل ادمین سایت هدف شد!',
        rootCause: 'کد Callback فقط فیلد `email` را چک می‌کرد و حساب موجود را خودکار به آن وصل می‌نمود بدون اینکه بررسی کند `email_verified === true` باشد.',
        preventionRule: 'هرگز حساب‌ها را صرفاً روی ایمیل تاییدنشده ادغام نکنید؛ هم `email_verified === true` را بررسی کنید و هم شناسه پایدار `(provider, sub)` را ذخیره نمایید.'
      },
      deepDive: {
        title: 'چرا `Passkeys` حتی در برابر حملات پیشرفته `AiTM Phishing` مقاوم‌اند؟',
        content: [
          'پروکسی‌های فیشینگ مدرن (`Adversary-in-the-Middle`) می‌توانند حتی کد ۶ رقمی `SMS` و `Authenticator App` را در لحظه از قربانی بگیرند و وارد حساب واقعی شوند.',
          'اما در `WebAuthn`، مرورگر دامنه واقعی داخل نوار آدرس (`rpId`) را درون داده‌ای که با کلید خصوصی امضا می‌شود گنجانده است؛ سرور واقعی امضای صادرشده برای دامنه جعلی را بلافاصله رد می‌کند.'
        ],
        takeAway: '`Passkeys` اولین فناوری احراز هویت تاریخ وب است که هم از رمز عبور راحت‌تر است و هم ذاتاً ضد فیشینگ.'
      },
      check: {
        type: 'recall',
        question: 'در پیاده‌سازی «ورود با گوگل» (`OIDC`)، چرا باید هم پارامتر `state` را بررسی کنیم و هم برای شناسایی کاربر در دیتابیس از `(provider, sub)` به جای `email` استفاده کنیم؟',
        modelAnswer: 'بررسی `state` جلوی حمله `OAuth Login CSRF` را می‌گیرد (جلوگیری از اینکه مهاجم لینک Callback حساب خودش را به قربانی بدهد). استفاده از `(provider, sub)` نیز به این دلیل است که `sub` شناسه یکتا و تغییرناپذیر کاربر نزد ارائه‌دهنده است، در حالی که ایمیل ممکن است تغییر کند یا در برخی سرویس‌ها قابل واگذاری مجدد باشد.'
      },
      crossLinks: [
        { targetId: 'T04-C01', reason: 'پایه رمزنگاری نامتقارن که امضای سخت‌افزاری `Passkeys` روی آن کار می‌کند.' },
        { targetId: 'T08-C02', reason: 'تبدیل ورود موفق `OAuth` به نشست امن سمت سرور.' }
      ]
    },
    {
      id: 'T08-C04',
      code: 'D02 · T08 · C04',
      domainId: 'D02',
      trackId: 'T08',
      title: 'کالبدشکافی حملات سمت کلاینت: XSS (Stored/Reflected/DOM)، CSP، CSRF و هدرهای `SameSite`/`HttpOnly`',
      subtitle: 'مدل دفاع لایه‌ای در مرورگر برای خنثی‌سازی تزریق اسکریپت و درخواست‌های جعلی.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در اکتبر ۲۰۰۵ کرم مشهور `Samy` ظرف کمتر از ۲۰ ساعت بیش از یک میلیون حساب `MySpace` را آلوده کرد و کل سایت را خواباند؛ فقط به خاطر یک باگ `Stored XSS` که اجازه می‌داد کد جاوااسکریپت درون پروفایل یک کاربر در مرورگر هر بازدیدکننده‌ای اجرا شود.',
        'در سوی دیگر `CSRF` از یک رفتار قدیمی مرورگر سوءاستفاده می‌کرد: مرورگر هر زمان فرمی به `bank.example.com` ارسال می‌شد، کوکی نشست شما را خودکار ضمیمه می‌کرد حتی اگر فرم روی یک سایت تبلیغاتی مخرب بود!'
      ],
      mentalModel: {
        paragraphs: [
          '`XSS` (تزریق اسکریپت) سه شکل دارد: `Stored` (ذخیره‌شده در دیتابیس مثل کامنت)، `Reflected` (بازتاب‌شده از پارامتر URL) و `DOM-based` (ساخته شده در کد JS کلاینت با `innerHTML`). ری‌اکت به صورت پیش‌فرض متن داخل `{text}` را `Escape` می‌کند، اما دو درِ پشتی خطرناک هنوز بازند: `dangerouslySetInnerHTML` و لینک‌های کاربر با پروتکل `javascript:alert(1)` در `href`!',
          'دفاع لایه‌ای در برابر `XSS` هدر `Content-Security-Policy (CSP)` است که به مرورگر می‌گوید فقط اسکریپت‌های دامنه خودی یا دارای `nonce` را اجرا کن. برای `CSRF` نیز ترکیب `SameSite=Lax` روی کوکی، اجتناب از تغییر وضعیت در متد `GET`، و در صورت نیاز توکن ضد-CSRF یا هدر سفارشی AJAX حمله را کاملاً می‌بندد.'
        ],
        rulesOfThumb: [
          'هرگز از `innerHTML` یا `dangerouslySetInnerHTML` روی محتوای کاربر بدون پاک‌سازی با `DOMPurify` استفاده نکنید.',
          'پروتکل هر لینک ارسالی کاربر (`href`) را چک کنید که فقط با `https://` یا `http://` شروع شود تا تزریق `javascript:` مسدود گردد.',
          'کوکی نشست را همیشه با `HttpOnly; Secure; SameSite=Lax` تنظیم کنید تا یکجا هم آسیب `XSS` را محدود و هم `CSRF` را خنثی نمایید.'
        ],
        diagram: {
          kind: 'split',
          caption: 'تفاوت جهت حمله و خط دفاعی در XSS در برابر CSRF',
          nodes: [
            { label: 'XSS (اعتماد مرورگر به سایت)', sublabel: 'اجرای JS مهاجم در دامنه شما -> دفاع: Escape + CSP + HttpOnly', accent: true },
            { label: 'CSRF (اعتماد سایت به مرورگر)', sublabel: 'ارسال درخواست با کوکی کاربر از سایت دیگر -> دفاع: SameSite + CSRF Token' }
          ]
        }
      },
      lab: [
        {
          title: 'هدرهای امنیتی استاندارد مرورگر در پاسخ سرور (CSP و ضد Sniffing)',
          language: 'http',
          code: `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin`,
          explanations: [
            { token: "script-src 'self'", meaning: 'اجرای تمام اسکریپت‌های inline تزریق‌شده و دامنه‌های خارجی را در مرورگر مسدود می‌کند.' },
            { token: "frame-ancestors 'none'", meaning: 'جلوگیری مدرن از حمله `Clickjacking` (گذاشتن سایت شما درون یک `iframe` نامرئی).' },
            { token: 'X-Content-Type-Options: nosniff', meaning: 'مرورگر را از حدس زدن و اجرای یک فایل متنی/عکس به عنوان اسکریپت منع می‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'سرقت داده در پنل مارکتینگ از طریق فیلد «آدرس وب‌سایت»',
        symptom: 'در پنل ادمین `crm.example.com` با کلیک روی لینک وب‌سایت یک مشتری تازه‌ثبت‌نام‌شده، کد مخربی اجرا شد و لیست مشتریان را به سرور مهاجم فرستاد.',
        rootCause: 'کامپوننت React با خیال راحت نوشته بود `<a href={lead.website}>مشاهده</a>` و مهاجم به عنوان آدرس وب‌سایت رشته `javascript:fetch(...)` ثبت کرده بود.',
        preventionRule: 'تابع کمکی `safeExternalUrl(url)` بنویسید که با `new URL(url)` صرفاً پروتکل‌های `http:` و `https:` را بپذیرد و سایر پروتکل‌ها را رد کند.'
      },
      deepDive: {
        title: 'چرا `SameSite=Strict` گاهی تجربه کاربری را می‌شکند ولی `SameSite=Lax` استاندارد طلایی است؟',
        content: [
          'اگر کوکی نشست را روی `SameSite=Strict` بگذارید و کاربری روی لینک سایت شما داخل ایمیل، تلگرام یا گوگل کلیک کند، مرورگر در آن ورود اول کوکی را نمی‌فرستد و کاربر لاگین‌شده فکر می‌کند از حسابش بیرون افتاده است!',
          'در حالت `SameSite=Lax`، کوکی در ناوبری‌های سطح بالای `GET` ارسال می‌شود تا تجربه ورود از لینک‌ها سالم بماند، اما در تمام درخواست‌های `POST/PUT/DELETE` از سایت‌های دیگر ارسال نمی‌شود.'
        ],
        takeAway: 'امنیت خوب مثل پیاز چند لایه دارد؛ حتی اگر یک لایه (مثل Escape) سهواً خطا رفت، `CSP` و `HttpOnly` جلوی فاجعه را می‌گیرند.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطی را در این کامپوننت React پیدا کنید که با وجود فرار خودکار متن در React، همچنان در معرض حمله `XSS` است:',
        lines: [
          { lineNumber: 1, code: 'export function ProfileCard({ name, website }: { name: string; website: string }) {' },
          { lineNumber: 2, code: '  return (' },
          { lineNumber: 3, code: '    <div>' },
          { lineNumber: 4, code: '      <h3>{name}</h3>' },
          { lineNumber: 5, code: '      <a href={website}>وب‌سایت کاربر</a>', isBug: true },
          { lineNumber: 6, code: '    </div>' },
          { lineNumber: 7, code: '  );' },
          { lineNumber: 8, code: '}' }
        ],
        explanation: 'خط ۵ مقدار کنترل‌شده توسط کاربر (`website`) را بدون بررسی پروتکل (`https:` / `http:`) در صفت `href` قرار داده است؛ اگر مهاجم `javascript:...` وارد کند، با کلیک روی لینک اسکریپت اجرا می‌شود.'
      },
      crossLinks: [
        { targetId: 'T07-C06', reason: 'جلوگیری از `Stored XSS` در فایل‌های آپلودی مثل `SVG`.' },
        { targetId: 'T08-C02', reason: 'حفاظت کوکی نشست در برابر `XSS` و `CSRF`.' }
      ]
    },
    {
      id: 'T08-C05',
      code: 'D02 · T08 · C05',
      domainId: 'D02',
      trackId: 'T08',
      title: 'حملات سمت سرور: SQL Injection، SSRF، IDOR (دسترسی به دیتای کاربر دیگر) و CORS (چرا CORS یک ویژگی امنیتی سرور نیست!)',
      subtitle: 'چهار آسیب‌پذیری پرتکرار بک‌اند و بزرگ‌ترین سوءتفاهم مهندسان درباره CORS.',
      readMinutes: 7,
      difficulty: 'چالشی',
      originStory: [
        'یکی از بزرگ‌ترین نفوذهای بانکی تاریخ (نشت اطلاعات ۱۰۰ میلیون مشتری `Capital One` در سال ۲۰۱۹) نه با شکستن رمزنگاری، بلکه با یک باگ کلاسیک `SSRF` رخ داد: مهاجم سرور وب را وادار کرد به آدرس داخلی `http://169.254.169.254/latest/meta-data/` درخواست بزند و کلیدهای موقت کلود را بخواند!',
        'در کنار آن، هیچ مفهومی در وب به اندازه `CORS` مورد سوءتفاهم قرار نگرفته است: بسیاری تصور می‌کنند تنظیم `CORS` از `API` در برابر `curl` یا اسکریپت مهاجم محافظت می‌کند، در حالی که `CORS` فقط برای مرورگر معنا دارد!'
      ],
      mentalModel: {
        paragraphs: [
          '۱) `SQL Injection`: هرگز ورودی کاربر را با چسباندن رشته وارد SQL نکنید؛ همیشه از `Parameterized Queries` (`$1`, `?`) استفاده کنید تا دیتابیس کد و داده را کاملاً جدا نگه دارد. ۲) `IDOR`: هر زمان در مسیر شناسه منبع می‌آید (`/invoices/42`)، مالکیت آن را نسبت به `req.auth.userId` در سرور چک کنید (تصادفی کردن شناسه به `UUID` کمک می‌کند اما جایگزین چک مالکیت نیست!).',
          '۳) `SSRF`: هر زمان سرور شما به URL ارسالی کاربر درخواست می‌زند (مثل پیش‌نمایش لینک یا Webhook تست)، پس از حل DNS باید مطمئن شوید `IP` مقصد در رنج‌های خصوصی (`127.0.0.0/8`, `10.0.0.0/8`, `169.254.169.254`, `::1`) نیست! ۴) `CORS`: سیاست مرورگر برای «آرام کردن» محدودیت `Same-Origin Policy` است. `curl` و `Python` اصلاً به هدر `CORS` نگاه نمی‌کنند؛ پس هرگز روی `CORS` به عنوان دیوار امنیتی سرور حساب نکنید و هرگز `Access-Control-Allow-Origin: *` را با `Allow-Credentials: true` (یا بازتاب کورکورانه هدر `Origin`) ترکیب نکنید.'
        ],
        rulesOfThumb: [
          '`SQL Injection` یک مسئله کاملاً حل‌شده است: فقط `Prepared Statements / Parameterized Queries`، بدون هیچ استثنایی.',
          '`CORS` از کاربر مرورگر محافظت می‌کند، نه از API سرور شما! امنیت API فقط با `AuthN + AuthZ` تامین می‌شود.',
          'برای مهار `SSRF` در سرورهای کلود، `IMDSv2` را فعال کنید و درخواست‌های خروجی به URLهای کاربر را از یک پروکسی خروجی بدون دسترسی به شبکه داخلی بفرستید.'
        ],
        diagram: {
          kind: 'split',
          caption: 'چهار آسیب‌پذیری حیاتی سمت سرور و پادزهر قطعی هر یک',
          nodes: [
            { label: 'SQL Injection', sublabel: 'پادزهر: Parameterized Query ($1 / ?)' },
            { label: 'IDOR', sublabel: 'پادزهر: چک مالکیت + tenant_id در سرور' },
            { label: 'SSRF', sublabel: 'پادزهر: مسدود کردن IPهای خصوصی/169.254 + Egress Proxy', accent: true },
            { label: 'CORS Misconfig', sublabel: 'پادزهر: Allowlist صریح Origin، هرگز بازتاب کورکورانه' }
          ]
        }
      },
      lab: [
        {
          title: 'تفاوت کوئری آسیب‌پذیر با Parameterized Query امن در PostgreSQL',
          language: 'ts',
          code: `// فاجعه (SQL Injection): ورودی "' OR '1'='1" کل جدول را برمی‌گرداند
// await db.query(\`SELECT * FROM orders WHERE code = '\${userInput}'\`);

// امن: موتور SQL ساختار کوئری را جدا از پارامتر کامپایل می‌کند
const result = await db.query(
  'SELECT id, total_cents FROM orders WHERE code = $1 AND user_id = $2',
  [orderCode, req.auth.userId] // هم‌زمان ضد SQLi و ضد IDOR!
);`,
          explanations: [
            { token: '$1, $2', meaning: 'مقدارها صرفاً به عنوان داده خام ارسال می‌شوند و هرگز به عنوان دستور SQL تفسیر نمی‌شوند.' },
            { token: 'AND user_id = $2', meaning: 'تضمین می‌کند حتی اگر کاربر کد سفارش شخص دیگری را بداند، ردیفی برنگردد (دفاع برابر `IDOR`).' }
          ]
        }
      ],
      warStory: {
        title: 'نشت اطلاعات کل کاربران به دلیل بازتاب خودکار هدر Origin در CORS',
        symptom: 'سرویس `app.example.com` برای رفع ارورهای CORS در محیط توسعه، یک میدل‌ور نوشت که هر `Origin` ارسالی مرورگر را مستقیم در `Access-Control-Allow-Origin` کپی می‌کرد همراه با `Allow-Credentials: true`.',
        rootCause: 'این پیکربندی عملاً `Same-Origin Policy` مرورگر را نابود کرد: هر سایت مخربی که قربانی باز می‌کرد می‌توانست با `fetch("https://api.example.com/me", { credentials: "include" })` داده‌های خصوصی کاربر را بخواند!',
        preventionRule: 'در تنظیمات `CORS` همیشه یک لیست صریح (`Allowlist`) از دامنه‌های مجاز خودتان تعریف کنید.'
      },
      deepDive: {
        title: 'حمله `DNS Rebinding` علیه فیلترهای ساده `SSRF`',
        content: [
          'اگر برای جلوگیری از `SSRF` ابتدا یک بار `dns.lookup(host)` بزنید و ببینید `IP` عمومی است، و بعد به `fetch(url)` بگویید وصل شود، مهاجم می‌تواند دامنه خود را با `TTL=0` تنظیم کند تا در پرس‌وجوی اول `IP` عمومی و در پرس‌وجوی دوم `127.0.0.1` برگرداند!',
          'دفاع واقعی اعتبارسنجی `IP` در همان لایه اتصال سوکت (یا اتصال مستقیم به `IP` حل‌شده و تاییدشده همراه با هدر `Host`) است.'
        ],
        takeAway: 'مرز شبکه داخلی سرور را هرگز در اختیار URLهای ارسالی کاربر قرار ندهید.'
      },
      check: {
        type: 'triage',
        prompt: 'یک برنامه‌نویس روی یک endpoint حذف کاربر هیچ توکن احراز هویتی نمی‌گذارد و می‌گوید: «نگران نباش، `CORS` را فقط برای `https://admin.example.com` باز گذاشته‌ام پس کسی دیگر نمی‌تواند آن را صدا بزند». چه اتفاقی می‌افتد؟',
        options: [
          { id: 'a', label: 'هر مهاجمی می‌تواند با یک دستور ساده `curl -X DELETE` از ترمینال خودش تمام کاربران را پاک کند، چون `CORS` فقط توسط مرورگرها اعمال می‌شود نه توسط سرور یا کلاینت‌های غیروب', isCorrect: true, feedback: 'دقیقاً! `CORS` هرگز جایگزین احراز هویت و مجوزدهی در سرور نیست.' },
          { id: 'b', label: 'سرور درخواست‌های `curl` را به دلیل نداشتن هدر `Origin` مسدود می‌کند', isCorrect: false, feedback: 'در استاندارد HTTP، کلاینت می‌تواند هر هدر `Origin` دلخواهی را در `curl` جعل کند یا اصلاً نفرستد.' },
          { id: 'c', label: 'این روش فقط برای متد `GET` ناامن است ولی برای `DELETE` امن است', isCorrect: false, feedback: 'برای هر متدی از خارج مرورگر به سادگی قابل فراخوانی مستقیم است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T08-C01', reason: 'طراحی متمرکز لایه `AuthZ` برای ریشه‌کن کردن `IDOR`.' },
        { targetId: 'T03-C02', reason: 'شناخت رنج‌های خصوصی `RFC 1918` و آدرس متادیتا `169.254.169.254`.' }
      ]
    },
    {
      id: 'T08-C06',
      code: 'D02 · T08 · C06',
      domainId: 'D02',
      trackId: 'T08',
      title: 'Rate Limiting (Token Bucket / Sliding Window)، محافظت در برابر Brute-Force، Bot Mitigation و Audit Logging امن',
      subtitle: 'مهار ترافیک مخرب و ثبت ردپای تغییرناپذیر رویدادهای حساس بدون افشای اسرار.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'یک صفحه ورود بدون محدودیت نرخ یعنی دعوت‌نامه رسمی برای حملات `Credential Stuffing`: مهاجمان با فهرست میلیاردها ایمیل و پسورد لو رفته از سایت‌های دیگر، ثانیه‌ای هزاران ترکیب را روی سرویس شما تست می‌کنند تا وارد حساب کاربران شوند (یا با رگبار درخواست پیامک OTP، صورتحساب چند ده میلیونی روی دستتان بگذارند!).',
        'الگوریتم‌های `Rate Limiting` که اصلشان از شبکه‌های مخابراتی دهه ۸۰ می‌آید، امروز اولین سپر محافظتی هم در برابر مهاجمان و هم در برابر کلاینت‌های باگ‌دار خودمان هستند.'
      ],
      mentalModel: {
        paragraphs: [
          'دو الگوریتم پرکاربرد داریم: `Token Bucket` (یک سطل که به نرخ ثابت توکن پر می‌شود و اجازه جهش کوتاه `Burst` را می‌دهد — عالی برای UX طبیعی) و `Sliding Window` (پنجره لغزان دقیق روی `Redis` که مشکل جهش ۲ برابری در مرز دقیقه‌ها در `Fixed Window` را ندارد).',
          'تله کلیدی: محدودیت نرخ فقط بر اساس `IP` کافی نیست! در موبایل‌های پشت `CGNAT` ممکن است صدها کاربر سالم یک `IP` مشترک داشته باشند، و در سمت دیگر یک مهاجم با `Botnet` هزار `IP` دارد. بنابراین برای لاگین و `OTP` باید روی **کلید ترکیبی** (`IP` + `account/phone` + سقف سراسری) محدودیت بگذارید. همچنین تمام رویدادهای حساس (تغییر نقش، خروج، حذف کلید، ورود ناموفق) باید در یک `Audit Log` ساخت‌یافته بدون ثبت رمز عبور یا توکن ذخیره شوند.'
        ],
        rulesOfThumb: [
          'هنگام اعمال محدودیت نرخ، کد دقیق `429 Too Many Requests` همراه با هدر `Retry-After` برگردانید.',
          'روی مسیرهای پرهزینه (ارسال `SMS/OTP`، تماس با `LLM`، تولید گزارش، لاگین) محدودیت سخت‌گیرانه جداگانه بگذارید.',
          'در `Audit Log` حتماً ۵ چیز را ثبت کنید: چه کسی (`actor`)، چه کاری (`action`)، روی کدام منبع (`target`)، چه زمانی (`timestamp`) و با چه نتیجه‌ای (`outcome`) — اما هرگز پسورد یا توکن را لاگ نکنید.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'الگوی چندلایه Rate Limiting و Audit Logging امن',
          nodes: [
            { label: 'Edge / Nginx Limit', sublabel: 'دفع رگبار خام بر اساس IP واقعی' },
            { label: 'Redis Token Bucket', sublabel: 'محدودیت دقیق per-user / per-phone / per-API-key', accent: true },
            { label: '429 + Retry-After', sublabel: 'رد مودبانه و سریع پیش از درگیر کردن DB' },
            { label: 'Immutable Audit Log', sublabel: 'ثبت رویدادهای حساس با Redaction اسرار' }
          ]
        }
      },
      lab: [
        {
          title: 'قانون Rate Limit دو لایه در Nginx و ساختار استاندارد Audit Log',
          language: 'nginx',
          code: `# تعریف ناحیه حافظه ۱۰ مگابایتی: حداکثر ۵ درخواست در دقیقه برای صفحه لاگین
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

location = /api/v1/auth/login {
  limit_req zone=login_limit burst=3 nodelay;
  limit_req_status 429;
  proxy_pass http://127.0.0.1:8000;
}`,
          explanations: [
            { token: 'rate=5r/m', meaning: 'نرخ پایدار ۵ تلاش در دقیقه برای هر آدرس IP واقعی (به شرط تنظیم صحیح `set_real_ip_from` پشت CDN).' },
            { token: 'burst=3 nodelay', meaning: 'اجازه جهش کوتاه ۳ تایی بدون معطلی مصنوعی، و رد فوری تلاش‌های مازاد با کد `429`.' }
          ]
        }
      ],
      warStory: {
        title: 'خالی شدن کامل اعتبار پنل پیامک در ۲۰ دقیقه با حمله SMS Pumping',
        symptom: 'ساعت ۲ بامداد پنل پیامک `auth.example.com` پیام اتمام شارژ داد؛ ۱۵۰٬۰۰۰ پیامک تایید به شماره‌های بین‌المللی ارسال شده بود.',
        rootCause: 'اندپوینت `POST /auth/send-otp` هیچ `Rate Limit` روی IP و شماره موبایل نداشت و بات‌ها با یک اسکریپت ساده آن را بمباران کرده بودند.',
        preventionRule: 'روی `OTP` سه قفل هم‌زمان بگذارید: محدودیت روی شماره (مثلاً هر ۲ دقیقه ۱ بار)، محدودیت روی IP/Subnet، و چالش ضدبات (`Turnstile/CAPTCHA`) هنگام افزایش غیرعادی نرخ.'
      },
      deepDive: {
        title: 'حمله «شمارش کاربران» (`User Enumeration`) در صفحه ورود و بازیابی رمز',
        content: [
          'اگر در فرم ورود برای ایمیل ناموجود بنویسید «این ایمیل ثبت نشده» و برای رمز اشتباه بنویسید «رمز نادرست است»، مهاجم می‌تواند فهرست کامل مشتریان شما را استخراج کند.',
          'پاسخ استاندارد واحد «ایمیل یا رمز عبور نادرست است» همراه با زمان پردازش یکسان (اجرای یک هش ساختگی در صورت نبود کاربر برای جلوگیری از `Timing Attack`) این نشت را می‌بندد.'
        ],
        takeAway: 'ترافیک کنترل‌نشده حتی بدون نفوذ امنیتی می‌تواند از نظر مالی یا پایداری سرویس را نابود کند.'
      },
      check: {
        type: 'triage',
        prompt: 'سرویس شما پشت `Cloudflare` است و در `Nginx` از `limit_req_zone $binary_remote_addr` استفاده کرده‌اید؛ ناگهان در یک ساعت شلوغ، هزاران کاربر عادی هم‌زمان خطای `429` می‌گیرند. محتمل‌ترین علت چیست؟',
        options: [
          { id: 'a', label: '`Nginx` با `real_ip` تنظیم نشده و همه کاربران را با چند آدرس `IP` لبه `Cloudflare` می‌بیند، پس سهمیه کل کاربران در یک سطل مشترک تمام شده است', isCorrect: true, feedback: 'دقیقاً! پشت Reverse Proxy یا CDN حتماً باید `real_ip_header CF-Connecting-IP` و `set_real_ip_from` برای رنج IPهای کلودفلر تنظیم شود.' },
          { id: 'b', label: 'الگوریتم `Token Bucket` فقط با `HTTP/1.1` کار می‌کند', isCorrect: false, feedback: 'الگوریتم محدودیت نرخ هیچ محدودیتی نسبت به نسخه HTTP ندارد.' },
          { id: 'c', label: 'اندازه حافظه `10m` برای ۱۰۰ کاربر کم است', isCorrect: false, feedback: 'یک مگابایت در Nginx حدود ۱۶٬۰۰۰ آدرس IP را نگه می‌دارد؛ ۱۰ مگابایت برای ۱۶۰٬۰۰۰ IP کافی است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T12-C02', reason: 'تنظیم دقیق هدرهای `X-Forwarded-For` و بازیابی IP واقعی پشت پروکسی.' },
        { targetId: 'T13-C04', reason: 'جلوگیری از نشت اسرار و توکن‌ها درون لاگ‌ها و Audit Log.' }
      ]
    }
  ]
};

export default t08;
