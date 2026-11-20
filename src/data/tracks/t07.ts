import type { TrackContent } from '../../types/atlas';

const t07: TrackContent = {
  trackId: 'T07',
  chapters: [
    {
      id: 'T07-C01',
      code: 'D02 · T07 · C01',
      domainId: 'D02',
      trackId: 'T07',
      title: 'کالبدشکافی یک سرویس Backend (Python/FastAPI, Node, Go): از دریافت Socket تا لایه‌های Middleware، Router و Service',
      subtitle: 'مسیر دقیق یک درخواست HTTP از کرنل تا لایه منطق کسب‌وکار و بازگشت پاسخ.',
      readMinutes: 6,
      difficulty: 'مبانی عمیق',
      originStory: [
        'در دهه ۹۰ وب‌سرورها برای هر درخواست یک برنامه کامل از صفر اجرا می‌کردند (`CGI`)؛ بعد فریم‌ورک‌های ماندگار در حافظه (`WSGI`, `Express`, `FastAPI`, `net/http`) آمدند که یک سوکت باز نگه می‌دارند و هزاران درخواست در ثانیه را از یک خط لوله منظم عبور می‌دهند.',
        'فارغ از اینکه با `Python/FastAPI`، `Node/Express` یا `Go` می‌نویسید، کالبدشکافی یک سرویس Backend بالغ تقریباً یکسان است: لایه‌های متقاطع در `Middleware`، مسیریابی نازک در `Router`، منطق مستقل در `Service` و دسترسی داده در `Repository`.'
      ],
      mentalModel: {
        paragraphs: [
          'وقتی پکت‌های `HTTP` از `Nginx` وارد سوکت اپلیکیشن می‌شوند، ابتدا یک زنجیره «پیازی» (`Onion Model`) از `Middleware`ها را رد می‌کنند: تخصیص `X-Request-Id`، ثبت زمان شروع، بررسی `Rate Limit`، احراز هویت و بازیابی خطاهای پیش‌بینی‌نشده.',
          'سپس `Router` صرفاً وظیفه تطبیق مسیر، استخراج پارامترها و صدا زدن `Service Layer` را دارد. هرگز منطق کسب‌وکار یا کوئری SQL را مستقیم داخل کنترلر HTTP نریزید؛ `Service` باید از وجود `HTTP` بی‌خبر باشد تا هم تست آن ساده شود و هم بتوانید همان منطق را از یک `Background Worker` یا `CLI` صدا بزنید.'
        ],
        rulesOfThumb: [
          'به هر درخواست در اولین Middleware یک `request_id` یکتا (UUID) بدهید و آن را هم در تمام لاگ‌ها و هم در هدر پاسخ برگردانید.',
          'لایه `Router/Handler` فقط ترجمه بین `HTTP` و `Service` است؛ هیچ منطق دامنه‌ای نباید داخل آن زندگی کند.',
          'همیشه یک `Global Error Handler` مرکزی داشته باشید که خطاهای غیرمنتظره را با جزئیات کامل در لاگ سرور ثبت کند ولی به کاربر فقط یک پیام ایمن `500` با `request_id` بدهد (هرگز `Stack Trace` را به کلاینت برنگردانید!).'
        ],
        diagram: {
          kind: 'flow',
          caption: 'مسیر لایه‌ای یک درخواست درون سرویس Backend تمیز',
          nodes: [
            { label: 'TCP Socket -> ASGI/HTTP', sublabel: 'پارس هدر و بدنه' },
            { label: 'Middleware Chain', sublabel: 'Request-ID · Auth · RateLimit · Logging' },
            { label: 'Thin Router / Validator', sublabel: 'Schema Check (Zod/Pydantic)' },
            { label: 'Thick Service -> DB', sublabel: 'منطق خالص کسب‌وکار + تراکنش', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'میدل‌ور استاندارد Request-ID و اندازه‌گیری زمان پاسخ در FastAPI',
          language: 'python',
          code: `import time, uuid
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    req_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    response.headers["X-Request-Id"] = req_id
    response.headers["X-Response-Time-Ms"] = str(duration_ms)
    return response`,
          explanations: [
            { token: 'time.perf_counter()', meaning: 'ساعت یکنواخت (`Monotonic`) که با تغییر ساعت NTP سرور به عقب نمی‌جهد.' },
            { token: 'X-Request-Id', meaning: 'پل ردیابی مشترک بین `Nginx`، لاگ اپلیکیشن و گزارش خطای کاربر.' }
          ]
        }
      ],
      warStory: {
        title: 'افشای ساختار دیتابیس و نام فایل‌های سرور در پیام خطای ۵۰۰',
        symptom: 'مهاجمان با ارسال ورودی‌های خراب به `api.example.com` نام جداول، نسخه کتابخانه‌ها و مسیر فایل‌های سرور را استخراج کردند.',
        rootCause: 'اپلیکیشن با `DEBUG=true` در پروداکشن اجرا شده بود و `Global Error Handler` نداشت، پس `Traceback` خام پایتون مستقیماً در بدنه HTTP برمی‌گشت.',
        preventionRule: 'در پروداکشن `DEBUG` همیشه `false` است؛ جزئیات خطا فقط در لاگ سرور و برای کاربر صرفاً کد خطا و `request_id` برگردانده می‌شود.'
      },
      deepDive: {
        title: 'تفاوت `WSGI` همگام با `ASGI` ناهمگام در اکوسیستم پایتون',
        content: [
          'استاندارد قدیمی `WSGI` (مثل `Flask` روی `Gunicorn`) برای هر درخواست یک Worker/Thread را تا اتمام پاسخ قفل می‌کند و از `WebSockets` پشتیبانی بومی ندارد.',
          '`ASGI` (مثل `FastAPI` روی `Uvicorn`) روی `asyncio` کار می‌کند و می‌تواند هزاران اتصال باز `SSE` یا `WebSocket` را روی یک پردازش مدیریت کند.'
        ],
        takeAway: 'انتخاب لایه اجرا باید با الگوی ترافیک سرویس (همگام CPU-bound در برابر I/O-bound و استریم) هم‌راستا باشد.'
      },
      check: {
        type: 'recall',
        question: 'چرا گذاشتن منطق کسب‌وکار و کوئری‌های دیتابیس مستقیم داخل `Route Handler`ها در میان‌مدت به کل پروژه آسیب می‌زند؟',
        modelAnswer: 'چون منطق کسب‌وکار به شیء `Request/Response` فریم‌ورک گره می‌خورد: نوشتن `Unit Test` سریع بدون بالا آوردن سرور HTTP سخت می‌شود، استفاده مجدد از همان منطق در `Background Worker` یا `CLI` منجر به کپی‌پیست کد می‌شود، و هر تغییر در قرارداد API می‌تواند قوانین اصلی کسب‌وکار را بشکند.'
      },
      crossLinks: [
        { targetId: 'T11-C01', reason: 'اصل معماری «لایه رابط نازک، لایه سرویس ضخیم» (`Thin Handlers, Thick Services`).' },
        { targetId: 'T16-C04', reason: 'استفاده از `request_id` در لاگ‌های ساخت‌یافته و ردیابی توزیع‌شده.' }
      ]
    },
    {
      id: 'T07-C02',
      code: 'D02 · T07 · C02',
      domainId: 'D02',
      trackId: 'T07',
      title: 'طراحی REST API حرفه‌ای: نام‌گذاری Resource، کدهای وضعیت HTTP واقعی، Pagination، Versioning و قرارداد خطا',
      subtitle: 'طراحی APIهایی که سال‌ها بدون شکستن کلاینت‌ها قابل توسعه و خودتوضیح باقی می‌مانند.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در سال ۲۰۰۰ `Roy Fielding` در رساله دکتری خود سبک معماری `REST` را تعریف کرد تا طراحی وب از پروتکل `HTTP` نهایت استفاده را ببرد به جای اینکه مثل `SOAP/XML-RPC` همه‌چیز را داخل یک `POST /rpc` با کد `200 OK` حتی هنگام خطا بریزد!',
        'امروز `API`های محبوبی مثل `Stripe` نشان داده‌اند که یک قرارداد `REST` تمیز، پایدار و دارای پیام خطای شفاف می‌تواند بهترین ابزار بازاریابی یک محصول مهندسی باشد.'
      ],
      mentalModel: {
        paragraphs: [
          'در طراحی حرفه‌ای `REST`: مسیرها اسم جمع منبع هستند (`/v1/orders`, `/v1/orders/{id}/items`) و فعل کار را متد `HTTP` تعیین می‌کند (`GET`, `POST`, `PATCH`, `DELETE`). از کدهای وضعیت واقعی استفاده کنید: `201 Created` برای ساخت، `204 No Content` برای حذف، `400/422` برای خطای ورودی، `401` (احراز هویت نشده)، `403` (مجاز نیست)، `409 Conflict` (تضاد وضعیت) و `429` (محدودیت نرخ).',
          'برای لیست‌های بزرگ، `Offset Pagination` (`?page=500&limit=20`) در دیتابیس کند است و با اضافه شدن رکورد جدید، آیتم تکراری یا جاافتاده تولید می‌کند؛ استاندارد مقیاس‌پذیر «صفحه‌بندی مبتنی بر مکان‌نما» (`Cursor Pagination` مثل `?after=ord_9f2a&limit=20`) است. برای خطاها نیز از فرمت یکسان `RFC 9457 (Problem Details)` استفاده کنید.'
        ],
        rulesOfThumb: [
          'هرگز در حالت خطا کد `200 OK` همراه با `{ "ok": false }` برنگردانید؛ این کار کش‌ها، مانیتورینگ `5xx` و کتابخانه‌های کلاینت را کور می‌کند.',
          'تغییرات افزایشی (اضافه کردن فیلد اختیاری جدید) Breaking نیستند؛ حذف یا تغییر نوع فیلد موجود، `Breaking Change` است و نیازمند نسخه جدید (`/v2/`) است.',
          'همیشه روی لیست‌ها سقف حداکثر (`max_limit=100`) بگذارید تا یک کلاینت نتواند با `?limit=999999` دیتابیس را از پای درآورد.'
        ],
        diagram: {
          kind: 'split',
          caption: 'قرارداد استاندارد کدهای وضعیت و صفحه‌بندی در REST API',
          nodes: [
            { label: '2xx (موفقیت دقیق)', sublabel: '200 OK · 201 Created · 202 Accepted · 204 No Content' },
            { label: '4xx (خطای کلاینت)', sublabel: '400/422 ورودی · 401 AuthN · 403 AuthZ · 409 تضاد · 429 نرخ' },
            { label: 'Cursor Pagination', sublabel: 'پایدار در داده‌های زنده + سرعت ثابت O(log N) با ایندکس', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'قرارداد استاندارد پاسخ خطای RFC 9457 و Cursor Pagination',
          language: 'json',
          code: `{
  "type": "https://api.example.com/errors/insufficient-funds",
  "title": "Insufficient wallet balance",
  "status": 409,
  "detail": "Account balance (12000) is lower than requested amount (25000).",
  "code": "INSUFFICIENT_FUNDS",
  "request_id": "req_01J9X4K8M2"
}`,
          explanations: [
            { token: 'code', meaning: 'کد ماشین‌خوان ثابت برای تصمیم‌گیری کد فرانت‌اند (به جای چک کردن متن انسانی `detail` که ممکن است تغییر کند).' },
            { token: 'status: 409', meaning: 'دقیقاً نشان می‌دهد درخواست از نظر ساختار درست بوده ولی با وضعیت فعلی منبع در تضاد است.' }
          ]
        }
      ],
      warStory: {
        title: 'از کار افتادن اپلیکیشن iOS به خاطر یک تغییر ظاهراً کوچک در API',
        symptom: 'تیم بک‌اند نام فیلد `price` را به `amount_cents` تغییر داد و سایت وب را هم هم‌زمان آپدیت کرد، اما صفحه تسویه حساب تمام کاربران نسخه قبلی اپلیکیشن موبایل کرش کرد.',
        rootCause: 'کاربران موبایل مثل وب بلافاصله آپدیت نمی‌شوند؛ حذف فیلد قدیمی یک `Breaking Change` بدون دوره گذار بود.',
        preventionRule: 'از الگوی `Expand-and-Contract` در API استفاده کنید: ابتدا فیلد جدید را کنار قبلی برگردانید، سپس پس از آپدیت کلاینت‌ها یا در `/v2/` فیلد قدیمی را حذف کنید.'
      },
      deepDive: {
        title: 'تفاوت دقیق `PUT` و `PATCH` و خاصیت `Idempotency` متدها',
        content: [
          'طبق استاندارد HTTP، متد `PUT` جایگزینی کامل منبع و `Idempotent` است؛ اما `PATCH` برای ویرایش جزئی چند فیلد به کار می‌رود. متد `GET` باید کاملاً `Safe` (بدون اثر جانبی) باشد؛ اگر روی `GET /delete-user?id=5` عملیات حذف بگذارید، یک پیش‌بارگذار مرورگر یا خزنده می‌تواند داده‌هایتان را پاک کند!',
          'برای `POST`های حساس مالی، کلید `Idempotency-Key` در هدر این شکاف را پر می‌کند.'
        ],
        takeAway: 'متدها و کدهای `HTTP` یک زبان مهندسی غنی هستند؛ از آن‌ها استفاده کنید نه علیه آن‌ها.'
      },
      check: {
        type: 'triage',
        prompt: 'یک endpoint گزارش‌گیری `GET /v1/events?page=10000&limit=50` روی جدولی با ۱۰ میلیون ردیف بیش از ۴ ثانیه طول می‌کشد. علت و راه‌حل چیست؟',
        options: [
          { id: 'a', label: 'در `OFFSET 500000` دیتابیس مجبور است ۵۰۰ هزار ردیف را بخواند و دور بریزد؛ مهاجرت به `Cursor Pagination` (`WHERE id < :cursor ORDER BY id DESC LIMIT 50`) سرعت را به چند میلی‌ثانیه می‌رساند', isCorrect: true, feedback: 'دقیقاً! `Keyset/Cursor Pagination` مستقیماً از روی ایندکس `B-Tree` به نقطه مورد نظر می‌پرد.' },
          { id: 'b', label: 'تبدیل متد `GET` به `POST`', isCorrect: false, feedback: 'تغییر متد HTTP تاثیری بر هزینه `OFFSET` در دیتابیس ندارد.' },
          { id: 'c', label: 'افزایش `limit` به ۵۰۰۰۰', isCorrect: false, feedback: 'این کار هم مصرف رم سرور را منفجر می‌کند و هم پاسخ را کندتر می‌سازد.' }
        ]
      },
      crossLinks: [
        { targetId: 'T09-C03', reason: 'چرا `Cursor Pagination` با ساختار درختی `B-Tree` هم‌خوانی عالی دارد.' },
        { targetId: 'T10-C03', reason: 'اضافه کردن `Idempotency-Key` به درخواست‌های `POST` مالی.' }
      ]
    },
    {
      id: 'T07-C03',
      code: 'D02 · T07 · C03',
      domainId: 'D02',
      trackId: 'T07',
      title: 'فراتر از REST: ارتباطات لحظه‌ای با WebSockets، Server-Sent Events (SSE — استاندارد استریم AI)، Webhooks و gRPC',
      subtitle: 'مقایسه دقیق الگوهای ارتباطی مدرن و دلیل انتخاب SSE برای استریم خروجی LLMها.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'مدل کلاسیک «درخواست-پاسخ» برای صفحات وب عالی بود، اما وقتی چت زنده، قیمت لحظه‌ای بورس و اخیراً پاسخ‌های توکن‌به‌توکن مدل‌های هوش مصنوعی آمدند، `Polling` هر ثانیه سرورها را ذوب می‌کرد.',
        'مهندسان چهار الگوی تخصصی ساختند: `WebSocket` (دوطرفه کامل روی TCP)، `SSE` (جریان یک‌طرفه فوق‌ساده روی HTTP که به استاندارد جهانی استریم `LLM` تبدیل شد)، `Webhooks` (اطلاع‌رسانی سرور-به-سرور) و `gRPC` (قرارداد باینری فوق‌سریع برای ارتباط داخلی میکروسرویس‌ها).'
      ],
      mentalModel: {
        paragraphs: [
          'وقتی فقط سرور باید داده زنده به کلاینت بفرستد (مثل استریم پاسخ هوش مصنوعی، اعلان‌ها یا نوار پیشرفت)، `SSE` با هدر `Content-Type: text/event-stream` بسیار ساده‌تر و پایدارتر از `WebSocket` است: از تمام پروکسی‌ها و فایروال‌های `HTTP/2` عبور می‌کند، اتصال مجدد خودکار (`Last-Event-ID`) دارد و نیازی به مدیریت پروتکل جدید ندارد.',
          'زمانی سراغ `WebSocket` بروید که ارتباط دوطرفه لحظه‌ای با فرکانس بالا دارید (مثل بازی آنلاین، ویرایشگر مشارکتی یا چت زنده). برای رویدادهای بین دو سرور (`درگاه پرداخت -> بک‌اند شما`) از `Webhook` امضاشده با `HMAC` و برای ارتباط باینری کم‌تاخیر بین سرویس‌های داخلی از `gRPC (Protobuf + HTTP/2)` استفاده کنید.'
        ],
        rulesOfThumb: [
          'پشت `Nginx` هنگام استفاده از `SSE` حتماً هدر `X-Accel-Buffering: no` بفرستید وگرنه `Nginx` توکن‌های AI را در بافر جمع می‌کند و یکجا در پایان ارسال می‌کند!',
          'دریافت‌کننده `Webhook` باید سریع (`< 3s`) پس از تایید امضا و ذخیره در صف پاسخ `200 OK` بدهد و پردازش سنگین را در پس‌زمینه انجام دهد.',
          'اتصال‌های بلندمدت `SSE/WebSocket` باید `Heartbeat` (پینگ هر ۲۰–۳۰ ثانیه) بفرستند تا `NAT` و لودبالانسرهای میانی اتصال بیکار را قطع نکنند.'
        ],
        diagram: {
          kind: 'split',
          caption: 'انتخاب پروتکل ارتباطی دقیق برای هر سناریوی مهندسی',
          nodes: [
            { label: 'SSE (Server -> Client)', sublabel: 'یک‌طرفه روی HTTP · استاندارد استریم توکن‌های AI', accent: true },
            { label: 'WebSocket (Full-Duplex)', sublabel: 'دوطرفه لحظه‌ای · چت، بازی و همکاری زنده' },
            { label: 'Webhooks (Server -> Server)', sublabel: 'رویداد ناهمگام با امضای HMAC و Retry' },
            { label: 'gRPC (Protobuf + HTTP/2)', sublabel: 'سریع و تایپ‌شده برای ارتباط داخلی سرویس‌ها' }
          ]
        }
      },
      lab: [
        {
          title: 'استریم استاندارد SSE بدون بافر شدن توسط Nginx در Node/Express',
          language: 'ts',
          code: `app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // حیاتی برای Nginx!
  res.flushHeaders();

  const timer = setInterval(() => {
    res.write(\`data: \${JSON.stringify({ token: 'سلام' })}\\n\\n\`);
  }, 300);

  req.on('close', () => clearInterval(timer));
});`,
          explanations: [
            { token: 'X-Accel-Buffering: no', meaning: 'به `Nginx` دستور می‌دهد بافرینگ پاسخ را برای این مسیر خاموش کند و هر تکه `data:` را فوراً به مرورگر بفرستد.' },
            { token: '\\n\\n', meaning: 'در پروتکل `SSE` دو خط جدید متوالی پایان یک رویداد را مشخص می‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'کار کردن استریم AI در لوکال ولی نمایش یکجای پاسخ بعد از ۱۵ ثانیه در پروداکشن',
        symptom: 'چت‌بات هوش مصنوعی روی لپ‌تاپ کلمه به کلمه تایپ می‌شد، اما بعد از دیپلوی روی سرور پشت `Nginx`، کاربر ۱۵ ثانیه خیره می‌ماند و ناگهان کل متن یکجا ظاهر می‌شد.',
        rootCause: '`Nginx` به صورت پیش‌فرض `proxy_buffering on` دارد و منتظر پر شدن بافر یا پایان پاسخ می‌ماند.',
        preventionRule: 'در تمام مسیرهای `SSE` هم هدر `X-Accel-Buffering: no` از اپلیکیشن بفرستید و هم `proxy_read_timeout` را در Nginx متناسب تنظیم کنید.'
      },
      deepDive: {
        title: 'محدودیت ۶ اتصال `SSE` در `HTTP/1.1` و نجات توسط `HTTP/2`',
        content: [
          'اگر کاربر ۶ تب از سایت شما را باز کند و هر تب یک `SSE` روی `HTTP/1.1` باز نگه دارد، سقف ۶ اتصال هم‌زمان مرورگر برای آن دامنه پر می‌شود و تب هفتم کاملاً قفل می‌گردد!',
          'با فعال کردن `HTTP/2` یا `HTTP/3`، تا ۱۰۰ جریان `SSE` روی همان یک اتصال `TCP/QUIC` مالتی‌پلکس می‌شوند و این مشکل به کل ناپدید می‌شود.'
        ],
        takeAway: '`SSE` روی `HTTP/2` ترکیبی فوق‌ساده، سبک و مقاوم در برابر فایروال برای جریان‌های یک‌طرفه است.'
      },
      check: {
        type: 'triage',
        prompt: 'می‌خواهید پاسخ‌های استریمی یک مدل زبانی (`LLM`) را از بک‌اند به فرانت‌اند بفرستید. بین `WebSocket` و `SSE` کدام را انتخاب می‌کنید و چه هدر کلیدی برای `Nginx` لازم است؟',
        options: [
          { id: 'a', label: '`SSE` (`text/event-stream`) همراه با هدر `X-Accel-Buffering: no` تا Nginx تکه‌ها را حبس نکند', isCorrect: true, feedback: 'دقیقاً! استریم پاسخ مدل یک‌طرفه است و `SSE` روی استاندارد `HTTP` با کمترین پیچیدگی زیرساختی کار می‌کند.' },
          { id: 'b', label: '`Polling` هر ۱۰۰ میلی‌ثانیه با `GET`', isCorrect: false, feedback: '`Polling` با این نرخ سرور را زیر بار درخواست‌های خالی نابود می‌کند.' },
          { id: 'c', label: '`UDP` خام مستقیم از مرورگر', isCorrect: false, feedback: 'مرورگر دسترسی مستقیم به سوکت `UDP` خام ندارد.' }
        ]
      },
      crossLinks: [
        { targetId: 'T19-C06', reason: 'پیاده‌سازی عملی استریم `SSE` و کاهش `TTFT` در اپلیکیشن‌های هوش مصنوعی.' },
        { targetId: 'T04-C02', reason: 'تایید اصالت `Webhooks` با `HMAC-SHA256` و مقایسه زمان‌ثابت.' }
      ]
    },
    {
      id: 'T07-C04',
      code: 'D02 · T07 · C04',
      domainId: 'D02',
      trackId: 'T07',
      title: 'هم‌روندی (Concurrency) در برابر موازی‌سازی (Parallelism): مدل `asyncio` تک‌نخی در برابر Multi-threading و Multi-processing',
      subtitle: 'تفاوت کارهای I/O-bound و CPU-bound، مفهوم GIL و جلوگیری از مسدود کردن Event Loop.',
      readMinutes: 7,
      difficulty: 'چالشی',
      originStory: [
        '`Rob Pike` (از خالقان Go و Unix) در سخنرانی معروفش یک جمله ماندگار گفت: «هم‌روندی (`Concurrency`) درباره **ساختار** و سر و کله زدن با کارهای زیاد به صورت هم‌زمان است؛ موازی‌سازی (`Parallelism`) درباره **اجرا** و انجام دادن کارهای زیاد در یک لحظه فیزیکی است».',
        'درک این تفاوت برای مهندس بک‌اند حیاتی است: یک سرور تک‌هسته‌ای می‌تواند ۱۰٬۰۰۰ درخواست شبکه را به شکل هم‌روند مدیریت کند (`asyncio/Node`)، اما برای رمزنگاری یا پردازش تصویر سنگین روی ۸ هسته CPU به موازی‌سازی واقعی (`Multi-processing` یا نخ‌های بدون GIL) نیاز دارید.'
      ],
      mentalModel: {
        paragraphs: [
          'سوال اول همیشه این است: کار شما `I/O-bound` است (منتظر دیتابیس، API بیرونی یا پاسخ LLM) یا `CPU-bound` (فشرده‌سازی، پردازش تصویر، هش `Argon2`، ضرب ماتریسی)؟',
          'برای کارهای `I/O-bound`، مدل ناهمگام تک‌نخی (`asyncio` در پایتون، `Event Loop` در Node، یا `Goroutines` در Go) با مصرف رم بسیار کم هزاران انتظار هم‌زمان را مدیریت می‌کند. اما یک تله مرگبار در `FastAPI` دارد: صدا زدن کتابخانه همگام (`requests.get` یا `time.sleep`) درون یک تابع `async def` کل `Event Loop` را متوقف می‌کند! در پایتون همچنین `GIL` (قفل مفسر سراسری) مانع اجرای هم‌زمان کد بایت‌پایتون روی چند هسته توسط نخ‌ها می‌شود؛ بنابراین کارهای سنگین CPU در پایتون باید به `ProcessPoolExecutor` یا کتابخانه‌های `C/Rust` (مثل `NumPy`) سپرده شوند.'
        ],
        rulesOfThumb: [
          'در `FastAPI`: اگر از کتابخانه ناهمگام (`httpx.AsyncClient`, `asyncpg`) استفاده می‌کنید تابع را `async def` بنویسید؛ اگر کتابخانه همگام (`requests`, `psycopg2`) دارید تابع را معمولی (`def`) بنویسید تا FastAPI خودکار آن را در `ThreadPool` اجرا کند.',
          'تعداد Workerهای `Uvicorn/Gunicorn` یا کلاستر `Node` را معمولاً متناسب با تعداد هسته‌های `CPU` سرور تنظیم کنید.',
          'همیشه روی هر عملیات ناهمگام خارجی سقف هم‌زمانی (`Semaphore`) و `Timeout` بگذارید تا یکباره ۵۰۰۰ درخواست به دیتابیس یا API شلیک نشود.'
        ],
        diagram: {
          kind: 'split',
          caption: 'انتخاب مدل هم‌روندی درست بر اساس ماهیت گلوگاه',
          nodes: [
            { label: 'I/O-Bound (DB / HTTP / LLM)', sublabel: 'Event Loop / asyncio / Goroutines — هزاران انتظار سبک', accent: true },
            { label: 'CPU-Bound (Crypto / Video / ML)', sublabel: 'Multi-processing / Worker Threads — استفاده از چند هسته CPU' }
          ]
        }
      },
      lab: [
        {
          title: 'مهار هم‌زمانی در پایتون با asyncio.Semaphore و پرهیز از قفل Event Loop',
          language: 'python',
          code: `import asyncio, httpx

SEM = asyncio.Semaphore(10)  # حداکثر ۱۰ درخواست هم‌زمان به سرویس بیرونی

async def fetch_one(client: httpx.AsyncClient, url: str) -> int:
    async with SEM:
        resp = await client.get(url, timeout=5.0)
        return resp.status_code

async def fetch_all(urls: list[str]) -> list[int]:
    async with httpx.AsyncClient() as client:
        return await asyncio.gather(*(fetch_one(client, u) for u in urls))`,
          explanations: [
            { token: 'asyncio.Semaphore(10)', meaning: 'از ایجاد `Thundering Herd` و خفه کردن سرور مقصد هنگام پردازش هزاران آدرس جلوگیری می‌کند.' },
            { token: 'httpx.AsyncClient', meaning: 'کلاینت ناهمگام که هنگام انتظار شبکه کنترل را به `Event Loop` برمی‌گرداند (برخلاف `requests`).' }
          ]
        }
      ],
      warStory: {
        title: 'سقوط کل سرور FastAPI با ۵ درخواست هم‌زمان',
        symptom: 'سرویس `ai-gateway.example.com` که با `FastAPI` نوشته شده بود، به محض اینکه فقط ۵ کاربر هم‌زمان پیام می‌فرستادند، حتی `/healthz` آن تایم‌اوت می‌داد.',
        rootCause: 'توسعه‌دهنده درون روت `async def chat()` از کتابخانه همگام `requests.post()` استفاده کرده بود؛ هر تماس تا ۱۰ ثانیه کل `Event Loop` پایتون را فریز می‌کرد.',
        preventionRule: 'در توابع `async def` هیچ فراخوانی مسدودکننده (`requests`, `time.sleep`, `open` سنگین) نگذارید؛ یا کلاینت async بزنید یا کار را با `asyncio.to_thread` به نخ جدا بفرستید.'
      },
      deepDive: {
        title: 'مدل `Goroutines` در Go و `Free-Threaded Python`',
        content: [
          'زبان `Go` با یک زمان‌بند `M:N` در Runtime، صدها هزار `Goroutine` بسیار سبک (پشته اولیه فقط ۲ کیلوبایت) را روی تمام هسته‌های CPU پخش می‌کند؛ بنابراین برنامه‌نویس بدون رنگ‌آمیزی توابع (`async/await`) هم هم‌روندی دارد هم موازی‌سازی واقعی.',
          'در اکوسیستم پایتون نیز با `PEP 703` مسیر حذف اختیاری `GIL` باز شده تا در آینده `Multi-threading` واقعی برای کارهای CPU-bound نیز ممکن شود.'
        ],
        takeAway: 'تک‌نخی ناهمگام برای انتظار شبکه فوق‌العاده است، اما برای محاسبه سنگین هرگز نباید روی نخ اصلی اجرا شود.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطی در این endpoint مربوط به `FastAPI` پیدا کنید که کل `Event Loop` سرور را هنگام انتظار پاسخ مسدود می‌کند:',
        lines: [
          { lineNumber: 1, code: 'import requests' },
          { lineNumber: 2, code: '@app.get("/weather/{city}")' },
          { lineNumber: 3, code: 'async def get_weather(city: str):' },
          { lineNumber: 4, code: '    r = requests.get(f"https://api.example.com/w/{city}", timeout=5)', isBug: true },
          { lineNumber: 5, code: '    return r.json()' }
        ],
        explanation: 'خط ۴ تابع همگام `requests.get` را داخل `async def` صدا زده است و کل `Event Loop` را تا ۵ ثانیه برای سایر کاربران قفل می‌کند! باید یا از `httpx.AsyncClient` با `await` استفاده شود یا تعریف تابع به `def` معمولی تغییر یابد.'
      },
      crossLinks: [
        { targetId: 'T06-C02', reason: 'منطق مشابه `Event Loop` و خطر مسدودسازی در جاوااسکریپت و Node.js.' },
        { targetId: 'T01-C03', reason: 'دلیل برتری `Event Loop` بر `Thread-per-Request` در کاهش هزینه `Context Switch`.' }
      ]
    },
    {
      id: 'T07-C05',
      code: 'D02 · T07 · C05',
      domainId: 'D02',
      trackId: 'T07',
      title: 'اعتبارسنجی ورودی (Schema Validation مثل Pydantic/Zod)، Serializers و قانون «هیچ ورودی کلاینتی قابل اعتماد نیست»',
      subtitle: 'جلوگیری از Mass Assignment و داده‌های فاسد در مرز ورودی سیستم با اعتبارسنجی صریح.',
      readMinutes: 5,
      difficulty: 'میدانی',
      originStory: [
        'در سال ۲۰۱۲ یک محقق امنیتی با تغییر یک فیلد مخفی در درخواست ویرایش پروفایل توانست کلید عمومی SSH خود را به مخزن `Ruby on Rails` در گیت‌هاب اضافه کند! این آسیب‌پذیری به `Mass Assignment` مشهور شد: سرور کل `JSON` دریافتی از کلاینت را مستقیم به مدل دیتابیس پاس می‌داد و کاربر فیلد `is_admin: true` را به آن تزریق کرده بود.',
        'از آن روز قانون طلایی مهندسی بک‌اند تثبیت شد: اعتبارسنجی سمت مرورگر فقط برای تجربه کاربری است؛ امنیت واقعی یعنی در مرز سرور، هر ورودی را فقط از صافی یک `Allowlist Schema` صریح (`Zod` / `Pydantic`) عبور دهیم.'
      ],
      mentalModel: {
        paragraphs: [
          'مرز ورودی سرویس مانند گمرک فرودگاه است: فقط فیلدهایی که صراحتاً در اسکیمای ورودی (`DTO`) مجاز شده‌اند، با نوع، طول، بازه عددی و فرمت تاییدشده اجازه ورود دارند و فیلدهای ناشناخته دور ریخته یا رد می‌شوند.',
          'این قانون در خروجی هم برقرار است (`Output Serializer`): هرگز رکورد خام جدول `users` دیتابیس را مستقیم به کلاینت برنگردانید! یک روز کسی ستون `password_hash` یا `internal_notes` به جدول اضافه می‌کند و ناخواسته به کل جهان لو می‌رود.'
        ],
        rulesOfThumb: [
          'تایپ ورودی (`CreateUserInput`) و خروجی (`UserPublicDTO`) را همیشه از مدل جدول دیتابیس جدا نگه دارید.',
          'محدودیت طول رشته‌ها (`max(500)`) و تعداد عناصر آرایه‌ها را در Schema اجباری کنید تا مهاجم با یک آرایه یک‌میلیونی حافظه سرور را پر نکند.',
          'هرگز به فیلدهایی مثل `user_id`, `role`, `price` ارسالی از کلاینت اعتماد نکنید؛ هویت را از نشست امن و قیمت را از دیتابیس خودتان بخوانید.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'گمرک ورودی و خروجی سرویس با Schema Validation و Serializer',
          nodes: [
            { label: 'Untrusted Client JSON', sublabel: 'ممکن است شامل is_admin یا نوع غلط باشد' },
            { label: 'Input Schema (Zod/Pydantic)', sublabel: 'فقط فیلدهای Allowlist + محدودیت طول و بازه', accent: true },
            { label: 'Domain Service + DB', sublabel: 'اجرای ایمن منطق روی داده تاییدشده' },
            { label: 'Output Serializer', sublabel: 'بازگرداندن صرفاً فیلدهای عمومی مجاز' }
          ]
        }
      },
      lab: [
        {
          title: 'جلوگیری از Mass Assignment با Zod (TypeScript) در حالت strict',
          language: 'ts',
          code: `import { z } from 'zod';

// فقط name و bio مجازند؛ ارسال role یا balance صراحتاً رد می‌شود
const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(300).optional(),
}).strict();

const parsed = UpdateProfileSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(422).json({ code: 'VALIDATION_ERROR', issues: parsed.error.issues });
}`,
          explanations: [
            { token: '.strict()', meaning: 'اگر کلاینت کلید اضافه‌ای مثل `isAdmin: true` بفرستد، درخواست را به جای پذیرش خاموش رد می‌کند.' },
            { token: '.max(300)', meaning: 'جلوی ارسال رشته‌های چندمگابایتی برای حمله DoS به دیتابیس و حافظه را می‌گیرد.' }
          ]
        }
      ],
      warStory: {
        title: 'خرید کالاهای میلیون‌تومانی با قیمت ۱ ریال در یک فروشگاه آنلاین',
        symptom: 'حسابداری فروشگاه `market.example.com` متوجه سفارش‌های پرداخت‌شده با مبلغ ۱ ریال برای کالاهای گران شد.',
        rootCause: 'کد ثبت سفارش، فیلد `unit_price` را مستقیماً از بدنه `POST /orders` ارسالی مرورگر قبول می‌کرد به جای اینکه قیمت را بر اساس `product_id` از جدول محصولات دیتابیس بخواند.',
        preventionRule: 'مرجع حقیقت قیمت، موجودی و نقش کاربر همیشه سرور و دیتابیس است؛ از کلاینت فقط شناسه کالا و تعداد مثبت معتبر بگیرید.'
      },
      deepDive: {
        title: 'نرمال‌سازی یونیکد و اعداد فارسی در ورودی‌ها',
        content: [
          'در اپلیکیشن‌های فارسی، کاربران ممکن است ایمیل، شماره موبایل یا کد را با ارقام فارسی/عربی (`۰۹۱۲`) یا حرف عربی `ي/ك` بفرستند یا فاصله‌های پنهان (`Zero-Width`) داشته باشند.',
          'انجام نرمال‌سازی یکپارچه در لایه Schema (تبدیل ارقام به لاتین، `trim()`, تبدیل `ي/ك` به `ی/ک`) جلوی باگ‌های تکراری شدن حساب‌ها و شکست جستجو را می‌گیرد.'
        ],
        takeAway: 'معماری «Parse, don\'t validate» یعنی داده خام در مرز ورودی یک بار به نوع معتبر تبدیل شود تا بقیه کد با خیال راحت کار کند.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطی را پیدا کنید که آسیب‌پذیری `Mass Assignment` ایجاد می‌کند و به کاربر عادی اجازه ارتقای نقش خود به ادمین را می‌دهد:',
        lines: [
          { lineNumber: 1, code: 'app.patch("/api/me", requireAuth, async (req, res) => {' },
          { lineNumber: 2, code: '  const userId = req.auth.userId;' },
          { lineNumber: 3, code: '  await db.users.update({ where: { id: userId }, data: req.body });', isBug: true },
          { lineNumber: 4, code: '  res.status(204).end();' },
          { lineNumber: 5, code: '});' }
        ],
        explanation: 'خط ۳ کل `req.body` خام را بدون فیلتر کردن به دیتابیس داده است! کاربر کافی است `{ "role": "admin" }` بفرستد تا ادمین شود. باید فقط فیلدهای تاییدشده توسط اسکیما (`{ name: parsed.name }`) پاس داده شوند.'
      },
      crossLinks: [
        { targetId: 'T08-C05', reason: 'ارتباط اعتبارسنجی ورودی با دفاع در برابر `SQL Injection` و `IDOR`.' },
        { targetId: 'T19-C02', reason: 'اعمال همین انضباط اسکیما روی خروجی JSON مدل‌های هوش مصنوعی.' }
      ]
    },
    {
      id: 'T07-C06',
      code: 'D02 · T07 · C06',
      domainId: 'D02',
      trackId: 'T07',
      title: 'مدیریت فایل‌ها، آپلود امن (محدودیت حجم، Magic Bytes، جلوگیری از Path Traversal) و Object Storage (S3)',
      subtitle: 'چرا ذخیره فایل روی دیسک سرور اپ یک بمب ساعتی است و الگوی Presigned URL چطور کار می‌کند.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'ساده‌ترین راه در روز اول پروژه ذخیره عکس پروفایل کاربران در پوشه `./uploads` کنار کد اپ است. اما به محض اینکه دیسک سرور پر می‌شود، کانتینر را جابه‌جا می‌کنید یا سرور دوم را برای مقیاس‌پذیری اضافه می‌کنید، کل فایل‌ها غیب می‌شوند یا فقط روی یک نود وجود دارند!',
        'در سال ۲۰۰۶ آمازون `S3 (Simple Storage Service)` را عرضه کرد و مدل `Object Storage` به استاندارد کلود تبدیل شد: ذخیره بی‌نهایت فایل جدا از سرور اپ، با لینک‌های امضاشده موقت (`Presigned URLs`).'
      ],
      mentalModel: {
        paragraphs: [
          'در آپلود امن هرگز به پسوند نام فایل (`.jpg`) یا هدر `Content-Type` ارسالی مرورگر اعتماد نکنید؛ مهاجم می‌تواند یک فایل `HTML/SVG` مخرب حاوی اسکریپت `XSS` را با نام `avatar.jpg` یا `../../etc/cron.d/pwn` (`Path Traversal`) بفرستد. همیشه نام فایل را با یک `UUID` تصادفی جایگزین کنید، سقف حجم را در `Nginx` و کد ببندید و بایت‌های آغازین فایل (`Magic Bytes` مثل `FF D8 FF` برای JPEG یا `89 50 4E 47` برای PNG) را چک کنید.',
          'بهترین معماری مقیاس‌پذیر «آپلود مستقیم با Presigned URL» است: بک‌اند شما فقط مجوز و امضای ۶۰ ثانیه‌ای با سقف حجم را به کلاینت می‌دهد و مرورگر فایل را مستقیم روی `S3` (یا سرویس سازگار مثل `MinIO/R2`) آپلود می‌کند بدون اینکه رم و پهنای باند سرور اپلیکیشن شما اشغال شود!'
        ],
        rulesOfThumb: [
          'نام فایل ارسالی کاربر را هرگز در مسیر فایل‌سیستم استفاده نکنید؛ کلید ذخیره را خودتان با `UUID` بسازید.',
          'فایل‌های آپلودشده کاربران (به‌ویژه `SVG`, `HTML`, `PDF`) را هرگز روی دامنه اصلی اپلیکیشن سرو نکنید (خطر `Stored XSS` و سرقت کوکی)؛ از دامنه جداگانه بدون کوکی (`cdn-usercontent.example.net`) و هدر `Content-Disposition: attachment` استفاده کنید.',
          'برای فایل‌های بزرگ از `Streaming` یا `S3 Presigned URL` استفاده کنید تا رم سرور با یک آپلود ۲۰۰ مگابایتی دچار `OOM` نشود.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'الگوی مقیاس‌پذیر آپلود مستقیم به Object Storage با Presigned URL',
          nodes: [
            { label: '1. Request Upload URL', sublabel: 'کلاینت نوع و حجم فایل را به API می‌گوید' },
            { label: '2. Signed 60s URL', sublabel: 'API پس از AuthZ امضای موقت S3 می‌دهد', accent: true },
            { label: '3. Direct PUT to S3/R2', sublabel: 'آپلود مستقیم بدون عبور از رم سرور اپ' },
            { label: '4. Confirm & Scan', sublabel: 'ثبت متادیتا در DB + بررسی Magic Bytes' }
          ]
        }
      },
      lab: [
        {
          title: 'بررسی Magic Bytes واقعی تصویر و ایمن‌سازی مسیر در TypeScript',
          language: 'ts',
          code: `export function detectImageType(buf: Uint8Array): 'png' | 'jpeg' | null {
  if (buf.length < 4) return null;
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'png';
  }
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'jpeg';
  }
  return null;
}`,
          explanations: [
            { token: '0x89 0x50 0x4E 0x47', meaning: 'امضای باینری ابتدای هر فایل `PNG` واقعی که جعل `Content-Type` نمی‌تواند آن را دور بزند.' },
            { token: 'client_max_body_size', meaning: 'در `Nginx` سقف حجم آپلود را پیش از رسیدن به اپلیکیشن محدود می‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'سرقت نشست ادمین با آپلود یک عکس پروفایل `SVG`',
        symptom: 'کاربری عکس پروفایل با فرمت `.svg` روی `app.example.com` آپلود کرد؛ به محض اینکه ادمین لینک مستقیم تصویر را در تب جدید باز کرد، حساب ادمین تصرف شد.',
        rootCause: 'فایل `SVG` در واقع یک سند `XML` است که می‌تواند تگ `<script>` اجرا کند؛ چون فایل روی همان دامنه `app.example.com` سرو می‌شد، اسکریپت درون آن به کوکی‌ها و API دامنه دسترسی کامل داشت.',
        preventionRule: 'آپلود `SVG` از کاربران را مسدود یا بازرندر (`re-encode` به WebP/PNG) کنید و محتوای کاربران را از یک دامنه مجزا با هدر `X-Content-Type-Options: nosniff` سرو نمایید.'
      },
      deepDive: {
        title: 'چرا `Re-encoding` تصاویر بهترین ضدعفونی‌کننده است؟',
        content: [
          'گاهی مهاجمان کد مخرب را درون متادیتای `EXIF` یک تصویر واقعی JPEG پنهان می‌کنند (یا اطلاعات حساس `GPS` عکس کاربر ناخواسته روی سایت عمومی منتشر می‌شود!).',
          'عبور دادن تصاویر آپلودی از یک پردازشگر (مثل `Sharp` یا `Pillow`) برای تغییر اندازه، حذف متادیتای `EXIF` و تبدیل به `WebP` هم حریم خصوصی کاربران را حفظ می‌کند و هم فایل‌های جعلی را بی‌اثر می‌سازد.'
        ],
        takeAway: 'فایل کاربر را نه به اسمش، نه به پسوندش و نه به دامنه اصلی خودتان اعتماد کنید.'
      },
      check: {
        type: 'triage',
        prompt: 'یک سرویس اجازه آپلود فایل می‌دهد و فایل را در `/srv/uploads/${req.file.originalname}` ذخیره می‌کند. مهاجم فایلی با نام `../../app/.env` می‌فرستد. این چه نوع حمله‌ای است و چگونه مسدود می‌شود؟',
        options: [
          { id: 'a', label: 'حمله `Path Traversal`؛ باید نام فایل ارسالی کاربر را کاملاً نادیده گرفت و نام ذخیره‌سازی را با یک `UUID` تولیدشده در سرور ساخت', isCorrect: true, feedback: 'دقیقاً! تولید کلید ذخیره با `UUID` در سرور (و ترجیحاً ذخیره در `S3/Object Storage`) حمله `Path Traversal` را از ریشه ناممکن می‌کند.' },
          { id: 'b', label: 'حمله `CSRF`؛ باید هدر `CORS` را عوض کرد', isCorrect: false, feedback: 'استفاده از `../` برای خروج از دایرکتوری هدف، حمله کلاسیک `Path Traversal` است.' },
          { id: 'c', label: 'فقط کافی است پسوند `.jpg` را در فرانت‌اند چک کنیم', isCorrect: false, feedback: 'چک فرانت‌اند در یک ثانیه با `curl` دور زده می‌شود.' }
        ]
      },
      crossLinks: [
        { targetId: 'T12-C05', reason: 'چرا انتقال فایل‌ها از دیسک محلی به `S3` پیش‌شرط `Stateless` کردن و مقیاس افقی است.' },
        { targetId: 'T08-C04', reason: 'دفاع در برابر `Stored XSS` از طریق `CSP` و جداسازی دامنه.' }
      ]
    }
  ]
};

export default t07;
