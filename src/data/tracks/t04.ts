import type { TrackContent } from '../../types/atlas';

const t04: TrackContent = {
  trackId: 'T04',
  chapters: [
    {
      id: 'T04-C01',
      code: 'D01 · T04 · C01',
      domainId: 'D01',
      trackId: 'T04',
      title: 'تاریخچه رمزنگاری از انیگما تا Diffie-Hellman و RSA: رمزنگاری متقارن (`AES-GCM`) در برابر نامتقارن (`Ed25519`)',
      subtitle: 'چطور دو غریبه وسط یک اتاق پر از شنودگر، کلید مخفی مشترک می‌سازند.',
      readMinutes: 7,
      difficulty: 'مبانی عمیق',
      originStory: [
        'برای دو هزار سال رمزنگاری یک معضل حل‌نشدنی داشت («مسئله توزیع کلید»): برای رمز کردن پیام باید قبلاً در جلسه‌ای حضوری روی کلید مخفی توافق می‌کردید! در جنگ جهانی دوم شکستن ماشین `Enigma` توسط `Alan Turing` و تیم `Bletchley Park` ثابت کرد تکیه بر مخفی نگه داشتن الگوریتم شکست می‌خورد.',
        'انقلاب واقعی سال ۱۹۷۶ رخ داد: `Whitfield Diffie` و `Martin Hellman` نشان دادند دو نفر که هرگز هم را ندیده‌اند می‌توانند در ملاعام و جلوی چشم شنودگر، روی یک کلید مخفی مشترک به توافق برسند؛ یک سال بعد `RSA` رمزنگاری کلید عمومی را عملی کرد و تجارت الکترونیک مدرن متولد شد.'
      ],
      mentalModel: {
        paragraphs: [
          'سیستم‌های واقعی هر دو دنیا را ترکیب می‌کنند (`Hybrid Cryptography`): رمزنگاری «نامتقارن» (مثل `X25519` برای تبادل کلید و `Ed25519` برای امضا) ریاضی سنگینی دارد اما مشکل اعتماد و تبادل کلید را حل می‌کند؛ سپس کل حجم داده با رمزنگاری «متقارن» فوق‌سریع (`AES-256-GCM` یا `ChaCha20-Poly1305`) رمز می‌شود که شتاب‌دهنده سخت‌افزاری داخل `CPU` دارد.',
          'ویژگی حیاتی الگوریتم‌های مدرن مانند `AES-GCM` حالت `AEAD` (رمزنگاری همراه با اصالت‌سنجی) است: نه تنها متن را مخفی می‌کند، بلکه اگر مهاجم حتی یک بیت از متن رمزشده را تغییر دهد، رمزگشایی فوراً خطا می‌دهد.'
        ],
        rulesOfThumb: [
          'هرگز الگوریتم رمزنگاری اختصاصی اختراع نکنید و از حالت قدیمی `AES-ECB` (که الگوی داده را لو می‌دهد) استفاده نکنید؛ همیشه `AEAD` (`AES-GCM` یا `ChaCha20-Poly1305`).',
          'در `AES-GCM` استفاده مجدد از یک `Nonce/IV` با کلید یکسان فاجعه‌بار است و کلید احراز هویت را فاش می‌کند.',
          'برای امضای کلیدهای جدید (`SSH`, توکن، فایل) `Ed25519` کوچک‌تر، سریع‌تر و ایمن‌تر از `RSA-2048` است.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'رمزنگاری ترکیبی (Hybrid): امن‌سازی تبادل کلید + سرعت بالا در انتقال داده',
          nodes: [
            { label: 'Asymmetric (X25519 / Ed25519)', sublabel: 'احراز هویت و ساخت کلید نشست مشترک' },
            { label: 'HKDF Key Derivation', sublabel: 'استخراج کلید متقارن یک‌بارمصرف' },
            { label: 'Symmetric AEAD (AES-256-GCM)', sublabel: 'رمزنگاری سریع گیگابیت بر ثانیه + تگ یکپارچگی', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'رمزنگاری احراز هویت‌شده AES-256-GCM با Nonce تصادفی در Node.js',
          language: 'ts',
          code: `import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const key = randomBytes(32); // کلید ۲۵۶ بیتی
const iv = randomBytes(12);  // Nonce ۹۶ بیتی یکتا برای هر پیام

const cipher = createCipheriv('aes-256-gcm', key, iv);
const ciphertext = Buffer.concat([cipher.update('secret payload', 'utf8'), cipher.final()]);
const authTag = cipher.getAuthTag(); // تگ ۱۶ بایتی جلوگیری از دستکاری

const decipher = createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(authTag);
const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');`,
          explanations: [
            { token: 'randomBytes(12)', meaning: 'برای `AES-GCM` طول استاندارد `Nonce` دقیقاً ۱۲ بایت (۹۶ بیت) و باید برای هر پیام جدید یکتا باشد.' },
            { token: 'getAuthTag()', meaning: 'تگ `GCM` که باید کنار `iv` و `ciphertext` ذخیره شود تا در زمان رمزگشایی، عدم دستکاری اثبات گردد.' }
          ]
        }
      ],
      warStory: {
        title: 'لو رفتن کامل داده‌های حساس به دلیل ثابت گذاشتن IV در کد',
        symptom: 'در بازبینی امنیتی سرویس `vault.example.com` مشخص شد اگر دو پیام رمزشده یکسان باشند خروجی دقیقاً یکسان است و با XOR کردن دو پیام مختلف، متن خام آن‌ها بازیابی می‌شود.',
        rootCause: 'توسعه‌دهنده برای سادگی `IV` را یک رشته ثابت (`000000000000`) در `.env` قرار داده بود و با یک کلید مشترک میلیون‌ها رکورد را با `AES-GCM` رمز می‌کرد.',
        preventionRule: 'برای هر عملیات رمزنگاری یک `Nonce/IV` تازه با مولد تصادفی امن (`CSPRNG`) بسازید و بدون خجالت کنار `ciphertext` ذخیره کنید (`IV` محرمانه نیست، فقط باید یکتا باشد).'
      },
      deepDive: {
        title: 'محرمانگی پیشرو (`Perfect Forward Secrecy`) چیست؟',
        content: [
          'در گذشته اگر مهاجم ترافیک رمزنگاری‌شده امروز را ضبط می‌کرد و ۵ سال بعد کلید خصوصی `RSA` سرور را می‌دزدید، می‌توانست کل آرشیو گذشته را رمزگشایی کند.',
          'با تبادل کلید موقت (`ECDHE` در `TLS 1.3`) هر نشست کلید یک‌بارمصرف خودش را می‌سازد و پس از پایان اتصال آن را پاک می‌کند؛ پس حتی افشای کلید اصلی سرور در آینده، ارتباطات گذشته را لو نمی‌دهد.'
        ],
        takeAway: 'جداسازی «کلید هویت دائمی» از «کلید نشست موقت» رمز امنیت بلندمدت است.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطی در این تابع رمزنگاری که امنیت `AES-256-GCM` را به کلی نابود می‌کند انتخاب کنید:',
        lines: [
          { lineNumber: 1, code: 'const STATIC_IV = Buffer.alloc(12, 0);', isBug: true },
          { lineNumber: 2, code: 'export function encryptNote(text: string, key: Buffer) {' },
          { lineNumber: 3, code: '  const cipher = createCipheriv("aes-256-gcm", key, STATIC_IV);' },
          { lineNumber: 4, code: '  return Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);' },
          { lineNumber: 5, code: '}' }
        ],
        explanation: 'خط ۱ یک `IV` ثابت برای همه پیام‌ها تعریف کرده است! تکرار `IV` با کلید یکسان در `AES-GCM` هم محرمانگی و هم اصالت‌سنجی را می‌شکند. باید درون تابع `randomBytes(12)` تولید شود و `authTag` نیز ذخیره گردد.'
      },
      crossLinks: [
        { targetId: 'T13-C01', reason: 'کاربرد عملی کلید نامتقارن `Ed25519` در احراز هویت `SSH`.' },
        { targetId: 'T13-C05', reason: 'چرخش کلیدها (`Key Rotation`) و رمزنگاری پاکتی (`Envelope Encryption`) در پروداکشن.' }
      ]
    },
    {
      id: 'T04-C02',
      code: 'D01 · T04 · C02',
      domainId: 'D01',
      trackId: 'T04',
      title: 'توابع درهم‌ساز (`SHA-256`)، HMAC، امضای دیجیتال و رمزنگاری پسورد (`Argon2` / `bcrypt`)',
      subtitle: 'تفاوت حیاتی هش سریع برای یکپارچگی داده با هش عمداً کند و مقاوم در برابر GPU برای پسوردها.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در سال ۲۰۱۲ نشت دیتابیس ۶.۵ میلیون پسورد لینکدین که با `SHA-1` خام و بدون `Salt` ذخیره شده بودند یک زلزله صنعتی بود: مهاجمان با چند کارت گرافیک گیمینگ در عرض چند ساعت میلیون‌ها پسورد را شکستند.',
        'همان بحران یک قانون آهنین را در مهندسی امنیت جا انداخت: توابع هش سریع مثل `SHA-256` برای تایید یکپارچگی فایل و `Git` عالی‌اند، اما برای ذخیره پسورد انسان‌ها فاجعه‌بارند؛ پسوردها به توابع عمداً کند و حافظه‌بر مثل `Argon2id` نیاز دارند.'
      ],
      mentalModel: {
        paragraphs: [
          'یک تابع هش رمزنگاری (`SHA-256`) هر ورودی را به اثر انگشت یک‌طرفه ۲۵۶ بیتی تبدیل می‌کند؛ تغییر یک بیت کل خروجی را زیرورو می‌کند (`Avalanche Effect`). اما چون مهاجم هم می‌تواند `SHA-256` بسازد، برای تایید پیام‌های `Webhook` از `HMAC-SHA256` استفاده می‌کنیم که یک کلید مخفی را با الگوریتم ایمن ترکیب می‌کند.',
          'برای پسورد کاربران، دو دفاع هم‌زمان لازم است: اول `Salt` تصادفی اختصاصی برای هر کاربر (تا دو کاربر با پسورد یکسان هش متفاوت داشته باشند و `Rainbow Table` بی‌اثر شود)، و دوم الگوریتم حافظه‌بر `Argon2id` (برنده رقابت `PHC`) یا `bcrypt` که سرعت تست مهاجم را از میلیاردها حدس در ثانیه به چند ده حدس پایین می‌آورد.'
        ],
        rulesOfThumb: [
          'هرگز پسورد را با `MD5`, `SHA-1` یا حتی `SHA-256` (حتی با Salt!) ذخیره نکنید؛ فقط `Argon2id`، `scrypt` یا `bcrypt`.',
          'هنگام مقایسه دو مقدار `HMAC` یا توکن، هرگز از `===` معمولی استفاده نکنید؛ از `timingSafeEqual` استفاده کنید تا حمله زمان‌سنجی (`Timing Attack`) خنثی شود.',
          'تفاوت `HMAC` با امضای دیجیتال (`Ed25519`): در `HMAC` هر دو طرف کلید مشترک دارند، ولی در امضای دیجیتال فقط صادرکننده کلید خصوصی دارد و همه با کلید عمومی تاییدش می‌کنند.'
        ],
        diagram: {
          kind: 'split',
          caption: 'انتخاب ابزار رمزنگاری درست برای هر کاربرد',
          nodes: [
            { label: 'SHA-256', sublabel: 'اثر انگشت سریع فایل، Git و Image Digest' },
            { label: 'HMAC-SHA256', sublabel: 'تایید اصالت Webhook با کلید مشترک + timingSafeEqual' },
            { label: 'Argon2id / bcrypt', sublabel: 'ذخیره پسورد با Salt یکتا + هزینه RAM/CPU بالا', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'اعتبارسنجی امن Webhook با HMAC-SHA256 و مقایسه زمان‌ثابت',
          language: 'ts',
          code: `import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyWebhookSignature(
  rawBody: Buffer,
  receivedHex: string,
  secret: string
): boolean {
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const received = Buffer.from(receivedHex, 'hex');
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}`,
          explanations: [
            { token: 'rawBody: Buffer', meaning: 'امضای `Webhook` را همیشه روی بایت‌های خام دریافتی بسنجید، نه روی `JSON.stringify(req.body)` که ممکن است فاصله‌هایش عوض شده باشد.' },
            { token: 'timingSafeEqual', meaning: 'مقایسه بایت‌به‌بایت در زمان ثابت انجام می‌دهد تا مهاجم از روی تفاوت چند نانوثانیه‌ای، بایت‌های صحیح امضا را حدس نزند.' }
          ]
        }
      ],
      warStory: {
        title: 'پذیرش فاکتور پرداخت جعلی در Webhook به دلیل باگ مقایسه و JSON',
        symptom: 'سرویس فروش `store.example.com` هنگام مهاجرت سرور به فریم‌ورک جدید، امضای تمام وب‌هوک‌های معتبر درگاه پرداخت را رد می‌کرد و تیم برای «رفع سریع» بررسی امضا را موقتاً خاموش کرد!',
        rootCause: 'میدل‌ور فریم‌ورک جدید بدنه را پارس و دوباره `JSON.stringify` می‌کرد و ترتیب کلیدها عوض شده بود؛ خاموش کردن امضا باعث شد فردی سفارش‌های جعلی «پرداخت‌شده» ارسال کند.',
        preventionRule: 'همیشه `rawBody` را پیش از JSON Parser ذخیره و با `HMAC` + `timingSafeEqual` اعتبارسنجی کنید؛ هرگز در محیط تولید Fail-Open نکنید.'
      },
      deepDive: {
        title: 'حمله `Length Extension` و چرا `SHA256(secret + message)` جایگزین `HMAC` نیست',
        content: [
          'ساختار داخلی `SHA-256` (ساختار `Merkle-Damgård`) خاصیتی دارد که مهاجم بدون دانستن `secret` و صرفاً با داشتن `SHA256(secret || msg)` می‌تواند داده‌ای به انتهای `msg` اضافه کند و هش معتبر جدید را محاسبه نماید!',
          'استاندارد `HMAC` با دو دور هش کردن تودرتو (`H((K ^ opad) || H((K ^ ipad) || msg))`) این ضعف ریاضی را کاملاً مسدود می‌کند.'
        ],
        takeAway: 'هرگز `HMAC` دستی با چسباندن رشته‌ها نسازید؛ همیشه از `createHmac` استاندارد کتابخانه استفاده کنید.'
      },
      check: {
        type: 'triage',
        prompt: 'در کد ریویو یک سرویس احراز هویت می‌بینید پسوردها با `SHA-256(password + randomSalt)` ذخیره شده‌اند. نظر مهندسی دقیق شما چیست؟',
        options: [
          { id: 'a', label: 'کافی نیست؛ اگر دیتابیس نشت کند، `SHA-256` روی `GPU` میلیاردها بار در ثانیه قابل تست است. باید به `Argon2id` یا `bcrypt` مهاجرت شود', isCorrect: true, feedback: 'دقیقاً! `Salt` جلوی جدول آماده را می‌گیرد ولی سرعت وحشتناک `SHA-256` روی سخت‌افزار مدرن همچنان رمزهای کاربران را آسیب‌پذیر می‌گذارد.' },
          { id: 'b', label: 'کاملاً امن است چون `Salt` تصادفی دارد و `SHA-256` شکسته نشده است', isCorrect: false, feedback: 'نشکسته شدن `SHA-256` در برابر برخورد (`Collision`) به معنای مناسب بودن آن برای پسورد نیست؛ سرعت بالای آن اینجا نقطه ضعف است.' },
          { id: 'c', label: 'باید به جای هش، پسورد را با `AES-256` رمزنگاری کنیم تا برگشت‌پذیر باشد', isCorrect: false, feedback: 'پسورد کاربر هرگز نباید قابل رمزگشایی باشد؛ فقط هش یک‌طرفه کند مجاز است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T07-C03', reason: 'الگوی کامل دریافت امن `Webhooks` در بک‌اند.' },
        { targetId: 'T08-C03', reason: 'حرکت به سمت احراز هویت بدون رمز عبور با `Passkeys` و `WebAuthn`.' }
      ]
    },
    {
      id: 'T04-C03',
      code: 'D01 · T04 · C03',
      domainId: 'D01',
      trackId: 'T04',
      title: 'زیر کاپوت TLS 1.3 Handshake، زنجیره اعتماد (CA / PKI) و انقلاب Let\'s Encrypt',
      subtitle: 'از بحران Heartbleed تا دست‌دهی ۱ رفت‌وبرگشت TLS 1.3 و خودکارسازی گواهی‌های HTTPS.',
      readMinutes: 7,
      difficulty: 'چالشی',
      originStory: [
        'در آوریل ۲۰۱۴ آسیب‌پذیری `Heartbleed` در کتابخانه `OpenSSL` جهان را لرزاند: یک باگ چک نکردن طول بافر اجازه می‌داد هر کسی ۶۴ کیلوبایت از حافظه زنده سرورها (شامل کلیدهای خصوصی و پسوردها) را بخواند. تا همان زمان، گرفتن گواهی `HTTPS` پولی و دستی بود و بیش از نیمی از وب بدون رمزنگاری کار می‌کرد.',
        'دو اتفاق چهره وب را برای همیشه عوض کرد: پروژه غیرانتفاعی `Let\'s Encrypt` (۲۰۱۵) با پروتکل خودکار `ACME` گواهی رایگان ۹۰ روزه داد، و استاندارد `TLS 1.3` (۲۰۱۸) تمام الگوریتم‌های ضعیف قدیمی را حذف کرد و زمان دست‌دهی را نصف نمود.'
      ],
      mentalModel: {
        paragraphs: [
          'در `TLS 1.3`، کلاینت در همان پیام اول (`ClientHello`) هم نسخه و الگوریتم‌ها را می‌گوید و هم کلید عمومی موقت `ECDHE` خود را می‌فرستد. سرور در پاسخ (`ServerHello`) کلید موقت خود، گواهی دیجیتال و امضای اثبات مالکیت را به صورت رمزشده برمی‌گرداند؛ بنابراین تنها در `1-RTT` کانال امن برقرار می‌شود.',
          'مرورگر چطور به گواهی سرور اعتماد می‌کند؟ از طریق «زنجیره اعتماد» (`PKI`): گواهی سایت شما توسط یک مرجع میانی (`Intermediate CA`) امضا شده و آن مرجع توسط یک `Root CA` امضا شده که سیستم‌عامل و مرورگر شما از قبل به آن اعتماد دارند.'
        ],
        rulesOfThumb: [
          'در تنظیمات وب‌سرور همیشه فایل `fullchain.pem` (گواهی سایت + میانی) را بدهید نه فقط `cert.pem`؛ وگرنه موبایل‌ها و `curl` خطای زنجیره ناقص می‌دهند.',
          'گواهی‌های ۹۰ روزه `Let\'s Encrypt` یک نعمت‌اند چون شما را مجبور به اتوماسیون تمدید (`certbot` / `Caddy`) می‌کنند و بحران فراموشی سالانه را می‌کشند.',
          'حداقل نسخه مجاز سرور را روی `TLS 1.2` و `TLS 1.3` ببندید؛ `TLS 1.0/1.1` منسوخ و ناامن‌اند.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'دست‌دهی ۱ رفت‌وبرگشتی (1-RTT) در استاندارد TLS 1.3',
          nodes: [
            { label: 'ClientHello + KeyShare', sublabel: 'پیشنهاد Cipher + کلید موقت X25519 + SNI' },
            { label: 'ServerHello + Encrypted Cert', sublabel: 'کلید سرور + گواهی fullchain + امضا', accent: true },
            { label: 'Verify PKI + Finished', sublabel: 'تایید زنجیره CA و شروع ترافیک HTTP رمزشده' }
          ]
        }
      },
      lab: [
        {
          title: 'بازرسی زنده زنجیره گواهی، نسخه TLS و تاریخ انقضا با openssl',
          language: 'bash',
          code: `openssl s_client -connect api.example.com:443 -servername api.example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates

# تست مستقیم اجباری TLS 1.3
curl -sIv --tlsv1.3 https://api.example.com 2>&1 | grep -E "SSL connection|expire date|issuer"`,
          explanations: [
            { token: '-servername', meaning: 'هدر `SNI` را در `ClientHello` ارسال می‌کند تا سرور گواهی درست را برگرداند.' },
            { token: 'x509 -noout -dates', meaning: 'تاریخ شروع (`notBefore`) و انقضای (`notAfter`) گواهی را چاپ می‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'کار کردن سایت در Chrome اما شکست کامل در اپلیکیشن موبایل و curl',
        symptom: 'پس از نصب گواهی جدید روی `api.example.com`، مرورگر دسکتاپ صفحه را سالم باز می‌کرد ولی اپلیکیشن اندروید و اسکریپت‌های پایتون خطای `unable to verify the first certificate` می‌دادند.',
        rootCause: 'ادمین فقط فایل `cert.pem` (گواهی برگ) را در `Nginx` گذاشته بود و گواهی میانی (`Intermediate CA`) را جا انداخته بود. کروم به صورت هوشمند گواهی میانی را از آدرس `AIA` دانلود و کش می‌کرد، اما کلاینت‌های موبایل و `OpenSSL` این کار را نمی‌کنند.',
        preventionRule: 'همیشه `fullchain.pem` را پیکربندی کنید و پس از هر نصب گواهی با `openssl s_client` (نه فقط کروم) زنجیره اعتماد را تست کنید.'
      },
      deepDive: {
        title: 'شفافیت گواهی (`Certificate Transparency`) و چرا هر زیردامنه‌ای عمومی می‌شود',
        content: [
          'برای جلوگیری از صدور مخفیانه گواهی جعلی توسط یک `CA` هک‌شده، مرورگرهای مدرن الزام می‌کنند هر گواهی صادرشده در دفترهای کل عمومی و قابل ممیزی (`CT Logs` مثل `crt.sh`) ثبت شود.',
          'یک پیامد امنیتی جالب: هر زیردامنه داخلی مثل `admin-staging.example.com` که برایش گواهی `Let\'s Encrypt` بگیرید، چند ثانیه بعد توسط ربات‌های اسکنر از روی `CT Logs` دیده می‌شود؛ پس هرگز روی «مخفی بودن نام دامنه» حساب نکنید!'
        ],
        takeAway: 'نام دامنه‌های دارای گواهی عمومی، عملاً عمومی هستند؛ دفاع واقعی احراز هویت و فایروال است.'
      },
      check: {
        type: 'triage',
        prompt: 'یک `API` جدید در کروم بدون اخطار باز می‌شود اما تمام سرویس‌های `Python`/`Go` و `curl` خطای `SSL certificate problem: unable to get local issuer certificate` می‌دهند. ریشه مشکل چیست؟',
        options: [
          { id: 'a', label: 'سرور فقط گواهی برگ را ارسال کرده و گواهی میانی (`Intermediate CA` در `fullchain.pem`) را جا انداخته است', isCorrect: true, feedback: 'دقیقاً! کروم با مکانیزم `AIA Fetching` کمبود زنجیره را جبران می‌کند، اما کلاینت‌های کتابخانه‌ای مانند `curl` و `Python` سختگیرانه زنجیره کامل را از سرور می‌خواهند.' },
          { id: 'b', label: 'نسخه `HTTP/2` با پایتون ناسازگار است', isCorrect: false, feedback: 'خطا صراحتاً مربوط به تایید `issuer certificate` در لایه `TLS` است.' },
          { id: 'c', label: 'پورت ۴۴۳ در فایروال سرور بسته است', isCorrect: false, feedback: 'اگر پورت بسته بود اصلاً گواهی دریافت نمی‌شد تا به مرحله تایید `issuer` برسد.' }
        ]
      },
      crossLinks: [
        { targetId: 'T04-C05', reason: 'خطاهای `525` و `526` کلودفلر وقتی گواهی سرور مبدا با زنجیره اعتماد مطابقت ندارد.' },
        { targetId: 'T04-C04', reason: 'نقش `SNI` و `ALPN` در پیام `ClientHello`.' }
      ]
    },
    {
      id: 'T04-C04',
      code: 'D01 · T04 · C04',
      domainId: 'D01',
      trackId: 'T04',
      title: 'SNI و ALPN: چطور ده‌ها دامنه و پروتکل مختلف روی یک IP و یک پورت `443` هم‌زیستی می‌کنند',
      subtitle: 'رمزگشایی از مکانیزم میزبانی مجازی امن و انتخاب پروتکل هم‌زمان با شروع TLS.',
      readMinutes: 5,
      difficulty: 'میدانی',
      originStory: [
        'در ابتدای عصر `HTTPS` یک تناقض مرغ و تخم‌مرغ وجود داشت: وب‌سرور برای اینکه بداند کاربر کدام سایت روی سرور را می‌خواهد، باید هدر `Host` در `HTTP` را می‌خواند؛ اما هدر `Host` رمزنگاری‌شده بود و سرور برای رمزگشایی اول باید گواهی درست همان دامنه را می‌فرستاد! نتیجه؟ هر سایت `HTTPS` مجبور بود یک `IPv4` اختصاصی بخرد.',
        'در سال ۲۰۰۳ افزونه `SNI` (Server Name Indication) این بن‌بست را شکست: کلاینت نام دامنه را در اولین پیام `ClientHello` می‌فرستد تا سرور گواهی صحیح را انتخاب کند. سپس `ALPN` اضافه شد تا بدون رفت‌وبرگشت اضافه، پروتکل لایه بالا (`h2` یا `http/1.1`) هم همان لحظه توافق شود.'
      ],
      mentalModel: {
        paragraphs: [
          'وقتی `Nginx` یا `Caddy` روی یک `IP` واحد هم‌زمان میزبان `api.example.com` و `docs.example.com` است، در لحظه ورود `ClientHello` به مقدار `SNI` نگاه می‌کند و کلید و گواهی متناظر را بارگذاری می‌نماید.',
          'مهم‌ترین نکته حریم خصوصی: در `TLS 1.3` معمولی، مقدار `SNI` همچنان به صورت متن خوانا (`Plaintext`) ارسال می‌شود تا روترها یا پروکسی‌های لایه ۴ بتوانند آن را بخوانند (البته استاندارد جدید `ECH — Encrypted Client Hello` در حال رمزنگاری خود `SNI` نیز هست).'
        ],
        rulesOfThumb: [
          'هنگام تست سرور با `IP` مستقیم (`curl https://203.0.113.10`), اگر از `--resolve api.example.com:443:203.0.113.10` استفاده نکنید، `SNI` ارسال نمی‌شود و گواهی پیش‌فرض اشتباه برمی‌گردد.',
          'در `Nginx` یک بلوک `default_server` با `ssl_reject_handshake on;` بگذارید تا درخواست‌هایی با `SNI` ناشناس یا مستقیم به `IP`، گواهی سایت‌های دیگر شما را لو ندهند.',
          '`ALPN` می‌تواند یک پورت ۴۴۳ را بین چند پروتکل کاملاً متفاوت تقسیم کند.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'مسیریابی چنددامنه‌ای روی یک پورت ۴۴۳ با SNI و ALPN',
          nodes: [
            { label: 'ClientHello', sublabel: 'SNI: api.example.com · ALPN: [h2, http/1.1]' },
            { label: 'Port 443 Listener', sublabel: 'تطبیق SNI با جدول گواهی‌ها', accent: true },
            { label: 'Selected Cert + Protocol', sublabel: 'گواهی api.example.com روی HTTP/2' }
          ]
        }
      },
      lab: [
        {
          title: 'تست دقیق SNI روی یک IP خاص پیش از تغییر DNS با curl --resolve',
          language: 'bash',
          code: `# تست سرور جدید بدون تغییر DNS یا دستکاری /etc/hosts
curl -sIv --resolve api.example.com:443:203.0.113.10 https://api.example.com/health 2>&1 \
  | grep -E "ALPN|Server certificate|subject:|HTTP/"`,
          explanations: [
            { token: '--resolve host:port:ip', meaning: 'هم `SNI` و هم هدر `Host` را دقیقاً `api.example.com` می‌فرستد اما اتصال `TCP` را به `203.0.113.10` برقرار می‌کند.' },
            { token: 'ALPN', meaning: 'نشان می‌دهد کلاینت چه پروتکل‌هایی پیشنهاد داده و سرور کدام یک (`h2` یا `http/1.1`) را پذیرفته است.' }
          ]
        }
      ],
      warStory: {
        title: 'افشای نام دامنه اصلی سرور توسط اسکنرهای IP تصادفی',
        symptom: 'مهاجمان با اسکن ساده آدرس `IP` سرور پشت `Cloudflare` (`203.0.113.10`) توانستند بفهمند این سرور متعلق به `api.example.com` است و حمله DDoS مستقیم زدند.',
        rootCause: 'وقتی اسکنر بدون `SNI` به پورت `443` وصل شد، `Nginx` اولین `server` بلاک خود را به عنوان پیش‌فرض انتخاب کرد و گواهی `api.example.com` را تقدیم اسکنر نمود!',
        preventionRule: 'در `Nginx` بلوک `default_server` روی پورت ۴۴۳ را با `ssl_reject_handshake on;` ببندید و فایروال پورت ۴۴۳ را فقط به رنج `IP`های کلودفلر محدود کنید.'
      },
      deepDive: {
        title: 'آینده حریم خصوصی: `ECH` (Encrypted Client Hello)',
        content: [
          'در استاندارد `ECH`، کلید عمومی رمزنگاری `ClientHello` از طریق رکورد `HTTPS` در `DNS` (تحت `DoH/DoT`) منتشر می‌شود. مرورگر پیام واقعی حاوی `SNI` هدف را رمز می‌کند و یک نام عمومی بیرونی (مثل نام لبه `CDN`) روی پاکت می‌گذارد.',
          'به این ترتیب شنودگر میانی فقط می‌بیند کاربر به سرورهای کلودفلر وصل شده، نه اینکه دقیقاً کدام سایت پشت آن را باز کرده است.'
        ],
        takeAway: '`SNI` کلید اشتراک‌گذاری پورت ۴۴۳ است، و `Nginx Stream` دقیقاً بر همین اساس ترافیک را بدون رمزگشایی مسیریابی می‌کند.'
      },
      check: {
        type: 'predict',
        prompt: 'می‌خواهید سرور جدید `203.0.113.20` را قبل از تغییر رکورد `DNS` دامنه `app.example.com` با `HTTPS` تست کنید. چرا دستور زیر شکست می‌خورد؟',
        snippet: `curl -H "Host: app.example.com" https://203.0.113.20/`,
        options: [
          { id: 'a', label: 'چون `-H "Host: ..."` فقط هدر `HTTP` را عوض می‌کند اما `SNI` و تطبیق نام گواهی `TLS` همچنان روی `203.0.113.20` انجام می‌شود', isCorrect: true, feedback: 'دقیقاً! باید از `curl --resolve app.example.com:443:203.0.113.20 https://app.example.com/` استفاده کنید تا هم `SNI` و هم `Host` و هم اعتبارسنجی گواهی درست کار کنند.' },
          { id: 'b', label: 'چون `curl` از `HTTPS` پشتیبانی نمی‌کند', isCorrect: false, feedback: '`curl` کاملاً از `HTTPS` و `TLS 1.3` پشتیبانی می‌کند.' },
          { id: 'c', label: 'چون پورت ۴۴۳ باید به شکل `:443` نوشته شود', isCorrect: false, feedback: 'پورت پیش‌فرض `https://` خودکار ۴۴۳ است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T12-C03', reason: 'مسیریابی لایه ۴ در `Nginx Stream` با استفاده از `ssl_preread` روی همین `SNI`.' },
        { targetId: 'T04-C03', reason: 'جایگاه `ClientHello` در چرخه `TLS 1.3 Handshake`.' }
      ]
    },
    {
      id: 'T04-C05',
      code: 'D01 · T04 · C05',
      domainId: 'D01',
      trackId: 'T04',
      title: 'معماری CDN، Reverse Edge و Cloudflare: تفاوت SSL Flexible/Full/Strict و کالبدشکافی خطاهای `520-526`',
      subtitle: 'چرا حالت Flexible یک تله امنیتی و عامل حلقه Redirect است و هر کد خطای کلودفلر چه می‌گوید.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در اواخر دهه ۹۰، `Tim Berners-Lee` به ریاضیدانان `MIT` هشدار داد که با محبوب شدن وب، ترافیک جهانی سرورهای مرکزی را ذوب خواهد کرد. نتیجه این چالش، تولد اولین شبکه توزیع محتوا (`Akamai`) و بعدها نسل مدرن Reverse Proxyهای لبه مثل `Cloudflare` و `Fastly` بود.',
        'یک `CDN` مدرن فقط فایل استاتیک کش نمی‌کند؛ بلکه به عنوان سپر `DDoS/WAF` و نقطه پایان اولیه `TLS` در چند میلی‌ثانیه‌ای کاربر می‌نشیند. اما همین دولایه شدن مسیر (`User -> Edge -> Origin`) کلاس جدیدی از خطاها (`520` تا `526`) را وارد زندگی مهندسان کرد.'
      ],
      mentalModel: {
        paragraphs: [
          'در `Cloudflare` سه حالت مشهور `SSL/TLS` داریم: `Flexible` (بین کاربر و Edge رمزنگاری هست ولی از Edge تا سرور شما `HTTP` پورت ۸۰ بدون رمزنگاری می‌رود — فاجعه امنیتی و عامل حلقه ریدایرکت!)، `Full` (ارتباط با سرور `HTTPS` است اما اعتبار گواهی چک نمی‌شود — آسیب‌پذیر برابر `MITM`) و `Full (Strict)` (استاندارد طلایی: ارتباط امن با گواهی معتبر `Let\'s Encrypt` یا `Origin CA`).',
          'رمزگشایی سریع کدهای `52x`: کد `521` یعنی سرور شما اتصال را رد کرده (`Nginx` پایین یا فایروال بسته)؛ `522` یعنی تایم‌اوت `TCP`؛ `524` یعنی اتصال برقرار شد ولی اپلیکیشن شما بیش از ۱۰۰ ثانیه پاسخ نداد؛ `525` یعنی شکست `TLS Handshake`؛ و `526` یعنی در حالت `Strict` گواهی سرور شما منقضی یا نامعتبر است.'
        ],
        rulesOfThumb: [
          'حالت `SSL Flexible` را هرگز در پروداکشن نگذارید؛ همیشه `Full (Strict)` همراه با گواهی معتبر یا `Cloudflare Origin Certificate`.',
          'پشت CDN، آدرس `IP` اصلی کاربر در هدر `CF-Connecting-IP` یا `X-Forwarded-For` می‌آید؛ بدون تنظیم آن، همه کاربران با `IP` کلودفلر ثبت و در Rate Limiter یکجا بن می‌شوند.',
          'کد `524` مشکل شبکه نیست؛ یک کوئری کند یا پردازش سنگین همگام در بک‌اند شماست که از سقف ۱۰۰ ثانیه عبور کرده است.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'مسیر امن Full (Strict) میان کاربر، لبه CDN و سرور مبدا (Origin)',
          nodes: [
            { label: 'User Browser', sublabel: 'TLS 1.3 (نزدیک‌ترین PoP)' },
            { label: 'CDN Edge (Anycast)', sublabel: 'WAF · Cache · DDoS Shield', accent: true },
            { label: 'Origin Server (443)', sublabel: 'TLS معتبر (Strict) + محدود به IPهای Edge' }
          ]
        }
      },
      lab: [
        {
          title: 'جدول عیب‌یابی سریع کدهای ۵۲x کلودفلر و تست مستقیم Origin',
          language: 'bash',
          code: `# 521 -> سرور پایین است یا پورت 443 بسته است
# 522 -> فایروال بسته‌ها را DROP می‌کند یا سرور زیر بار قفل است
# 524 -> اتصال باز شد ولی پاسخ HTTP بیش از 100 ثانیه طول کشید
# 525 -> شکست TLS Handshake با Origin (مثلاً فقط پورت 80 باز است)
# 526 -> گواهی Origin منقضی یا Self-Signed در حالت Strict است

# دور زدن موقت CDN برای تست مستقیم سلامت Origin
curl -sIv --resolve api.example.com:443:203.0.113.10 https://api.example.com/health`,
          explanations: [
            { token: '--resolve', meaning: 'مستقیماً به سرور `Origin` می‌زند تا بفهمید خطا از پیکربندی `CDN` است یا خود سرور شما.' }
          ]
        }
      ],
      warStory: {
        title: 'حلقه بی‌نهایت ERR_TOO_MANY_REDIRECTS بعد از فعال کردن ابر نارنجی',
        symptom: 'به محض انتقال دامنه `shop.example.com` پشت کلودفلر، سایت برای همه کاربران با خطای `ERR_TOO_MANY_REDIRECTS` از دسترس خارج شد.',
        rootCause: 'تنظیمات کلودفلر روی پیش‌فرض `Flexible` بود؛ کلودفلر درخواست را با `HTTP` (پورت ۸۰) به `Nginx` می‌فرستاد، `Nginx` می‌دید درخواست `HTTP` است پس `301` به `https://` می‌داد و این چرخه تا بی‌نهایت تکرار می‌شد.',
        preventionRule: 'پیش از روشن کردن پروکسی CDN، گواهی معتبر روی سرور نصب کنید و حالت را مستقیماً روی `Full (Strict)` بگذارید.'
      },
      deepDive: {
        title: 'چرا گواهی `Origin CA` کلودفلر در مرورگر خطا می‌دهد ولی در حالت Strict کار می‌کند؟',
        content: [
          'کلودفلر گواهی‌های رایگان ۱۵ ساله به نام `Origin Certificate` صادر می‌کند که توسط ریشه اختصاصی کلودفلر امضا شده‌اند. مرورگرهای عمومی به این ریشه اعتماد ندارند، اما خود سرورهای لبه کلودفلر در حالت `Full (Strict)` به آن اعتماد کامل دارند.',
          'مزیت آن برای سرویس‌هایی که ۱۰۰٪ پشت کلودفلر هستند، حذف کامل دردسر تمدید گواهی در Origin و سخت‌تر کردن دسترسی مستقیم بدون CDN است.'
        ],
        takeAway: 'درک دقیق دو پای مستقل ارتباط (`User <-> Edge` و `Edge <-> Origin`) ۹۰٪ خطاهای CDN را در چند ثانیه شفاف می‌کند.'
      },
      check: {
        type: 'triage',
        prompt: 'کاربران روی گزارش اکسل سنگین سایت شما دقیقاً پس از ۱۰۰ ثانیه خطای `Cloudflare 524` می‌گیرند. بهترین راه‌حل معماری چیست؟',
        logSnippet: `Error 524: A timeout occurred (Origin did not respond within 100 seconds)`,
        options: [
          { id: 'a', label: 'تغییر حالت SSL کلودفلر به `Flexible`', isCorrect: false, feedback: 'کد `524` ربطی به `SSL` ندارد و `Flexible` امنیت را خراب می‌کند.' },
          { id: 'b', label: 'انتقال تولید گزارش به یک `Background Worker` (صف پیام) با پاسخ سریع `202 Accepted` و اطلاع‌رسانی پس از اتمام', isCorrect: true, feedback: 'دقیقاً! کارهای طولانی نباید چرخه `HTTP` را بیش از چند ثانیه اشغال کنند؛ الگوی صف ناهمگام هم خطای `524` را حذف می‌کند و هم سرور را زیر بار حفظ می‌کند.' },
          { id: 'c', label: 'باز کردن پورت ۸۰ در فایروال سرور', isCorrect: false, feedback: 'اتصال به سرور برقرار شده بوده؛ مشکل کندی پاسخ اپلیکیشن است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T10-C02', reason: 'جدا کردن کارهای سنگین با صف پیام و Worker برای حذف خطاهای تایم‌اوت.' },
        { targetId: 'T12-C02', reason: 'مدیریت هدر `X-Forwarded-For` و بازیابی `IP` واقعی کاربر پشت پروکسی.' }
      ]
    },
    {
      id: 'T04-C06',
      code: 'D01 · T04 · C06',
      domainId: 'D01',
      trackId: 'T04',
      title: 'پروکسی‌ها (HTTP/SOCKS5)، تونلینگ، تفاوت TUN و System Proxy و ریشه‌یابی نشت DNS و IPv6',
      subtitle: 'معماری لایه ۳ در برابر لایه ۵ برای عبور ترافیک و چرا بخشی از ترافیک گاهی تونل را دور می‌زند.',
      readMinutes: 6,
      difficulty: 'چالشی',
      originStory: [
        'وقتی شرکت‌ها و دانشگاه‌ها برای نخستین بار شبکه‌های داخلی را پشت فایروال گذاشتند، نیاز به واسطه‌هایی داشتند تا ترافیک را از یک دروازه امن عبور دهند: پروکسی `HTTP` (با متد `CONNECT` برای تونل کردن `TLS`) و پروتکل همه‌کاره‌تر `SOCKS5` (سال ۱۹۹۶) که بدون وابستگی به `HTTP` هر جریان `TCP/UDP` را هدایت می‌کرد.',
        'اما بسیاری از برنامه‌های خط فرمان، بازی‌ها و ابزارهای سیستمی اصلاً تنظیمات `System Proxy` را نمی‌خواندند! اینجا بود که درایور مجازی کرنل `TUN` وارد میدان شد: ساخت یک کارت شبکه مجازی در لایه ۳ که تمام بسته‌های `IP` کل سیستم‌عامل را فارغ از نوع برنامه داخل تونل می‌کشد.'
      ],
      mentalModel: {
        paragraphs: [
          'تفاوت بنیادین در لایه عمل است: `System Proxy` (`HTTP`/`SOCKS5`) یک راهنمای داوطلبانه در لایه اپلیکیشن است؛ مرورگرها آن را رعایت می‌کنند اما بسیاری از ابزارهای `CLI`، `curl` یا سرویس‌های پس‌زمینه ممکن است آن را نادیده بگیرند مگر متغیر `ALL_PROXY` ست باشد. در مقابل `TUN` یک اینترفیس شبکه واقعی در جدول `Routing` کرنل می‌سازد و تمام ترافیک را اجباری جذب می‌کند.',
          'دو نشت کلاسیک در تونل‌ها رخ می‌دهد: ۱) «نشت `DNS`» زمانی که برنامه قبل از فرستادن ترافیک به پروکسی، نام دامنه را با `DNS` محلی `ISP` ترجمه می‌کند (در `SOCKS5` باید از حالت `socks5h://` برای حل نام در سمت سرور استفاده شود). ۲) «نشت `IPv6`» وقتی تونل فقط مسیر `IPv4` (`0.0.0.0/0`) را هدایت کرده ولی سیستم‌عامل روی `IPv6` مستقیم بیرون می‌رود.'
        ],
        rulesOfThumb: [
          'در `curl` تفاوت `socks5://` و `socks5h://` حیاتی است: حرف `h` یعنی ترجمه `DNS` هم از درون تونل انجام شود نه روی شبکه محلی.',
          'اگر در حالت `TUN` مسیر `IPv6` مدیریت نمی‌شود، یا تونل را Dual-Stack کنید یا مسیر `IPv6` پیش‌فرض را داخل تونل هدایت/مسدود کنید.',
          'برای عیب‌یابی سریع اینکه ترافیک از کدام مسیر می‌رود، `ip route get 1.1.1.1` دقیقاً کارت شبکه خروجی را نشان می‌دهد.'
        ],
        diagram: {
          kind: 'split',
          caption: 'تفاوت ساختاری System Proxy (لایه اپلیکیشن) با TUN (لایه ۳ کرنل)',
          nodes: [
            { label: 'HTTP / SOCKS5 Proxy (L5)', sublabel: 'داوطلبانه توسط هر برنامه · وابسته به پشتیبانی اپ' },
            { label: 'TUN Virtual Interface (L3)', sublabel: 'جذب کل بسته‌های IP در جدول Routing کرنل', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'تست دقیق پروکسی با حل DNS سمت سرور و بررسی مسیر واقعی خروج بسته‌ها',
          language: 'bash',
          code: `# عبور هم داده و هم پرس‌وجوی DNS از طریق SOCKS5 (حرف h حیاتی است)
curl --proxy socks5h://127.0.0.1:1080 https://api.example.com/health

# بررسی اینکه کرنل بسته به مقصد 1.1.1.1 را از کدام اینترفیس می‌فرستد
ip route get 1.1.1.1
ip -6 route get 2606:4700:4700::1111`,
          explanations: [
            { token: 'socks5h://', meaning: 'نام دامنه را بدون ترجمه محلی به سرور پروکسی می‌فرستد تا از نشت `DNS` جلوگیری شود.' },
            { token: 'ip route get', meaning: 'دقیق‌ترین دستور برای دیدن اینترفیس و `Gateway` انتخابی کرنل برای یک مقصد مشخص.' }
          ]
        }
      ],
      warStory: {
        title: 'دور زدن تونل سازمانی توسط اسکریپت‌های پایتون در محیط تست',
        symptom: 'مهندسان روی لپ‌تاپ `System Proxy` شرکت را روشن کرده بودند و مرورگر به سرورهای داخلی وصل می‌شد، اما اسکریپت‌های `Python` و `Docker` خطای تایم‌اوت می‌دادند.',
        rootCause: 'تنظیمات `System Proxy` فقط توسط مرورگر و اپ‌های گرافیکی خوانده می‌شد و پردازش‌های ترمینال مستقیم از کارت شبکه پیش‌فرض خارج می‌شدند.',
        preventionRule: 'برای پوشش سراسری همه ابزارهای توسعه از `TUN` (مثل `WireGuard` / VPN لایه ۳) استفاده کنید یا متغیرهای `HTTPS_PROXY` و `NO_PROXY` را صریح و استاندارد تعریف نمایید.'
      },
      deepDive: {
        title: 'چرا `NO_PROXY` حیاتی است و اشتباه رایج در آن چیست؟',
        content: [
          'اگر متغیر `HTTPS_PROXY` را در یک سرور یا کانتینر ست کنید و `NO_PROXY=localhost,127.0.0.1,.internal` را فراموش کنید، حتی درخواست‌های داخلی سرویس به دیتابیس یا `127.0.0.1` نیز به سمت پروکسی بیرونی فرستاده می‌شوند و یا قطع می‌شوند یا حلقه ایجاد می‌کنند.',
          'همچنین توجه کنید که استاندارد واحدی برای قالب `NO_PROXY` بین همه زبان‌ها وجود ندارد؛ همیشه هر دو `localhost,127.0.0.1` و پسوند دامنه‌های داخلی را صریح ذکر کنید.'
        ],
        takeAway: 'همیشه بدانید کدام لایه (اپلیکیشن یا کرنل) مسئول تصمیم‌گیری مسیر ترافیک است.'
      },
      check: {
        type: 'predict',
        prompt: 'در یک سیستم با پروکسی محلی روی پورت `1080`، تفاوت امنیتی دستور A و دستور B در چیست؟',
        snippet: `A: curl --proxy socks5://127.0.0.1:1080 https://internal.example.com
B: curl --proxy socks5h://127.0.0.1:1080 https://internal.example.com`,
        options: [
          { id: 'a', label: 'در دستور A ترجمه `DNS` روی شبکه محلی رخ می‌دهد (نشت DNS)، اما در دستور B نام دامنه داخل پروکسی ترجمه می‌شود', isCorrect: true, feedback: 'دقیقاً! در `socks5h://` علاوه بر جلوگیری از نشت `DNS`، حتی دامنه‌هایی که فقط از سمت سرور پروکسی قابل ترجمه‌اند نیز باز می‌شوند.' },
          { id: 'b', label: 'دستور B از رمزنگاری `HTTPS` صرف‌نظر می‌کند', isCorrect: false, feedback: 'خیر، حرف `h` مخفف `hostname` است و هیچ تغییری در `HTTPS` نمی‌دهد.' },
          { id: 'c', label: 'هر دو دقیقاً رفتار یکسانی دارند', isCorrect: false, feedback: 'تفاوت آن‌ها دقیقاً در محل انجام پرس‌وجوی `DNS` است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T03-C05', reason: 'ساختار `DNS` و پروتکل‌های امن `DoH/DoT`.' },
        { targetId: 'T03-C03', reason: 'تأثیر تونلینگ بر کاهش `MTU` و نیاز به `MSS Clamping`.' }
      ]
    }
  ]
};

export default t04;
