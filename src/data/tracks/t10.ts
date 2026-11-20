import type { TrackContent } from '../../types/atlas';

const t10: TrackContent = {
  trackId: 'T10',
  chapters: [
    {
      id: 'T10-C01',
      code: 'D03 · T10 · C01',
      domainId: 'D03',
      trackId: 'T10',
      title: 'هنر Caching (Redis و In-Memory): استراتژی‌های Cache-Aside، TTL، Cache Stampede و چرا «نام‌گذاری و باطل کردن کش» سخت‌ترین کارهاست',
      subtitle: 'شتاب‌بخشی به خواندن داده‌ها بدون غرق شدن در داده‌های کهنه و طوفان درخواست‌های هم‌زمان.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        '`Phil Karlton` جمله مشهوری دارد: «در علوم کامپیوتر فقط دو چیز سخت است: باطل کردن کش (`Cache Invalidation`) و نام‌گذاری چیزها». در سال ۲۰۰۹ `Salvatore Sanfilippo` که از کندی دیتابیس برای آمار زنده سایتش کلافه شده بود، `Redis` را نوشت؛ یک انبار داده درون‌حافظه‌ای فوق‌سریع با ساختارهای غنی (`String`, `Hash`, `Sorted Set`, `Streams`).',
        'اما کش یک شمشیر دولبه است: اگر بد پیاده‌سازی شود، در لحظه انقضای یک کلید داغ، هزاران درخواست هم‌زمان به دیتابیس هجوم می‌برند (`Cache Stampede`) و همان دیتابیسی را که کش قرار بود محافظتش کند، زمین می‌زنند!'
      ],
      mentalModel: {
        paragraphs: [
          'رایج‌ترین و امن‌ترین الگو `Cache-Aside (Lazy Loading)` است: برنامه اول در `Redis` می‌گردد؛ اگر بود (`Cache Hit`) در زیر ۱ میلی‌ثانیه برمی‌گرداند؛ اگر نبود (`Cache Miss`) از دیتابیس می‌خواند، با یک `TTL` مشخص (به اضافه کمی زمان تصادفی `Jitter`!) در کش می‌گذارد و برمی‌گرداند. هنگام ویرایش داده، کلید کش را `DEL` (ابطال) می‌کند.',
          'دو تله بزرگ کشینگ: ۱) `Cache Stampede (Thundering Herd)`: کلید صفحه اول سایت منقضی می‌شود و ۵۰۰ درخواست هم‌زمان همگی `Miss` می‌گیرند و ۵۰۰ کوئری سنگین به دیتابیس می‌فرستند؛ راه‌حل: قفل سبک یا الگوی `Singleflight` تا فقط یک نفر دیتابیس را بخواند. ۲) `Cache Penetration`: مهاجم شناسه ناموجود (`/product/9999999`) را مدام می‌زند و همیشه `Miss` می‌شود؛ راه‌حل: کش کردن کوتاه پاسخ «یافت نشد» (`Negative Caching`).'
        ],
        rulesOfThumb: [
          'هیچ کلیدی را در `Redis` بدون `TTL` نگذارید (مگر سیاست صریح `allkeys-lru` داشته باشید) و به `TTL` کمی `Jitter` تصادفی اضافه کنید تا همه کلیدها در یک ثانیه منقضی نشوند.',
          'کش یک بهینه‌سازی است نه منبع حقیقت! اپلیکیشن شما باید طوری طراحی شود که حتی اگر `Redis` ناگهان خالی شود، سیستم زنده بماند (فقط کمی کندتر شود).',
          'پیش از اضافه کردن کش، اول کوئری و ایندکس دیتابیس را درست کنید؛ کش نباید چسب زخم روی یک `Seq Scan` خراب باشد.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'الگوی Cache-Aside با Jitter و محافظت در برابر Stampede',
          nodes: [
            { label: 'App Request', sublabel: 'جستجوی کلید نسخه دار v1:product:42' },
            { label: 'Redis Cache', sublabel: 'Hit (~0.5ms) -> پاسخ فوری', accent: true },
            { label: 'Miss + Singleflight', sublabel: 'فقط ۱ درخواست به DB + ذخیره با TTL+Jitter' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی Cache-Aside همراه با TTL Jitter و نسخه‌گذاری کلید در TypeScript',
          language: 'ts',
          code: `export async function getProductCached(id: string): Promise<Product | null> {
  const key = \`v1:product:\${id}\`;
  const hit = await redis.get(key);
  if (hit !== null) return hit === '__NULL__' ? null : JSON.parse(hit);

  const product = await db.products.findById(id);
  const baseTtl = product ? 300 : 30; // کش کوتاه‌تر برای آیتم ناموجود
  const jitter = Math.floor(Math.random() * 30);
  await redis.set(key, product ? JSON.stringify(product) : '__NULL__', 'EX', baseTtl + jitter);
  return product;
}`,
          explanations: [
            { token: 'v1:product:${id}', meaning: 'پیشوند نسخه باعث می‌شود هنگام تغییر ساختار شیء، بدون نیاز به `FLUSHALL` کلیدهای جدید ایزوله شوند.' },
            { token: '__NULL__', meaning: 'دفاع `Negative Caching` در برابر بمباران شناسه‌های ناموجود.' }
          ]
        }
      ],
      warStory: {
        title: 'سقوط کامل دیتابیس هر ساعت دقیقاً رأس دقیقه :00',
        symptom: 'سایت خبری `news.example.com` هر روز ساعت ۹:۰۰، ۱۰:۰۰ و ۱۱:۰۰ به مدت ۴۰ ثانیه از کار می‌افتاد.',
        rootCause: 'تمام کش‌های صفحه اول با `TTL=3600` هم‌زمان هنگام بوت سرور پر شده بودند و دقیقاً رأس هر ساعت با هم منقضی می‌شدند (`Cache Stampede`) و هزاران درخواست هم‌زمان به دیتابیس هجوم می‌بردند.',
        preventionRule: 'همیشه به `TTL` کش یک `Jitter` تصادفی (مثلاً `±10%`) اضافه کنید و برای کلیدهای بسیار داغ از `Singleflight` یا تمدید پیش‌دستانه در پس‌زمینه استفاده کنید.'
      },
      deepDive: {
        title: 'حالت تک‌نخی `Redis` و دستور ممنوعه `KEYS *`',
        content: [
          'موتور اجرای دستورات `Redis` تک‌نخی است. اجرای دستور `KEYS *` روی یک Redis با ۵ میلیون کلید، کل سرور را برای چندین ثانیه کاملاً فریز می‌کند و تمام سرویس‌های وابسته تایم‌اوت می‌خورند!',
          'در محیط تولید برای جستجوی کلیدها همیشه از `SCAN` (غیرمسدودکننده و تکه‌تکه) استفاده کنید.'
        ],
        takeAway: 'کش وقتی درخشان است که هم مسیر `Hit` سریع باشد و هم سناریوی `Miss` طوفان ایجاد نکند.'
      },
      check: {
        type: 'triage',
        prompt: 'یک مهندس برای دیباگ کلیدهای سشن روی `Redis` پروداکشن با ۸ میلیون کلید دستور `KEYS session:*` را می‌زند. چه اتفاقی می‌افتد و دستور ایمن جایگزین چیست؟',
        options: [
          { id: 'a', label: '`Redis` تک‌نخی است؛ `KEYS` کل سرور را تا اتمام اسکن ۸ میلیون کلید فریز می‌کند و باعث قطعی سراسری می‌شود. جایگزین ایمن `SCAN 0 MATCH session:* COUNT 100` است', isCorrect: true, feedback: 'دقیقاً! `SCAN` در گام‌های کوچک کار می‌کند و اجازه می‌دهد دستورات عادی کاربران بین گام‌ها اجرا شوند.' },
          { id: 'b', label: '`KEYS` فقط ۱۰۰ کلید اول را برمی‌گرداند و خطری ندارد', isCorrect: false, feedback: '`KEYS` کل فضای کلیدها را یکجا مسدود و اسکن می‌کند.' },
          { id: 'c', label: '`KEYS` تمام کلیدها را حذف می‌کند', isCorrect: false, feedback: 'حذف نمی‌کند اما با فریز کردن نخ اصلی، سرویس را از دسترس خارج می‌کند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T19-C06', reason: 'مفهوم مشابه `Prompt Caching` برای کاهش هزینه و تاخیر مدل‌های `LLM`.' },
        { targetId: 'T08-C02', reason: 'استفاده از `Redis` برای نگهداری نشست‌های قابل ابطال (`Session Store`).' }
      ]
    },
    {
      id: 'T10-C02',
      code: 'D03 · T10 · C02',
      domainId: 'D03',
      trackId: 'T10',
      title: 'صف‌های پیام و Workerها (Queues, Brokers, Pub/Sub): جدا کردن کارهای سنگین (ایمیل، پردازش ویدیو، استعلام) از چرخه HTTP',
      subtitle: 'معماری ناهمگام با Dead Letter Queue و کنترل فشار برگشتی برای پاسخ‌دهی سریع.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'یکی از اشتباهات کلاسیک اپلیکیشن‌های اولیه این است که وقتی کاربر روی «ثبت سفارش» کلیک می‌کند، همان درخواست `HTTP` سعی می‌کند فاکتور PDF بسازد، ایمیل بفرستد، پیامک بزند و به سیستم انبار اطلاع دهد! اگر سرور ایمیل ۵ ثانیه کند شود، مشتری روی صفحه خرید معطل می‌ماند یا تایم‌اوت می‌خورد.',
        'معماری صف پیام (`Message Queue`) که دهه‌ها در بانکداری و مخابرات آزموده شده، کار فوری را از کار پس‌زمینه جدا (`Decouple`) می‌کند: API در ۵۰ میلی‌ثانیه پیام را در صف می‌گذارد و `202 Accepted` برمی‌گرداند و `Worker`ها با آرامش و با قابلیت Retry آن را انجام می‌دهند.'
      ],
      mentalModel: {
        paragraphs: [
          'تفاوت دو الگوی کلیدی: در `Work Queue` (مثل `BullMQ/Redis`, `RabbitMQ` یا `Postgres SKIP LOCKED`) هر کار دقیقاً به دست «یک» `Worker` می‌رسد تا اجرا شود؛ در `Pub/Sub` (یا `Kafka/Streams`) یک رویداد (`order.paid`) منتشر می‌شود و چندین مصرف‌کننده مستقل (حسابداری، ایمیل، تحلیل) هم‌زمان نسخه خود را می‌گیرند.',
          'سه رکن یک صف تولیدی واقعی: ۱) `Ack` فقط پس از پایان کار (اگر Worker وسط کار کرش کرد، پیام به صف برگردد)، ۲) سیاست `Retry` با سقف مشخص، و ۳) `Dead Letter Queue (DLQ)` برای قرنطینه کردن پیام‌های سمی (`Poison Pills`) که ۵ بار شکست خورده‌اند تا کل صف را مسدود نکنند.'
        ],
        rulesOfThumb: [
          'در صف‌های واقعی تحویل معمولاً `At-Least-Once` است (ممکن است پیامی دو بار برسد)؛ پس هر `Worker` باید ذاتاً `Idempotent` باشد.',
          'پیام داخل صف را سبک نگه دارید: به جای ریختن یک فایل ۱۰ مگابایتی در صف، فایل را در `S3` بگذارید و فقط `job_id` و کلید فایل را در صف بفرستید.',
          'همیشه روی عمق صف (`Queue Depth`) و تعداد پیام‌های `DLQ` هشدار تنظیم کنید.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'جداسازی چرخه سریع HTTP از پردازش سنگین با Worker و DLQ',
          nodes: [
            { label: 'HTTP API (< 50ms)', sublabel: 'ثبت کار در صف + پاسخ 202 Accepted' },
            { label: 'Message Queue', sublabel: 'جذب جهش ترافیک (Load Leveling)', accent: true },
            { label: 'Worker Pool (Ack)', sublabel: 'پردازش Idempotent با Retry محدود' },
            { label: 'Dead Letter Queue', sublabel: 'قرنطینه خطاهای تکراری برای بررسی انسانی' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی استاندارد ساختار پیام صف با شناسه ردیابی و Idempotency',
          language: 'json',
          code: `{
  "job_id": "job_01J9X5R2P8",
  "type": "invoice.generate_pdf",
  "version": 1,
  "idempotency_key": "inv_94821_v1",
  "trace_id": "req_01J9X5R200",
  "payload": {
    "invoice_id": 94821
  }
}`,
          explanations: [
            { token: 'version: 1', meaning: 'به Worker اجازه می‌دهد هنگام دیپلوی جدید، پیام‌های قدیمی مانده در صف را بدون کرش بخواند.' },
            { token: 'trace_id', meaning: 'لاگ کار پس‌زمینه را به همان درخواست HTTP اولیه کاربر متصل نگه می‌دارد.' }
          ]
        }
      ],
      warStory: {
        title: 'حلقه مرگ یک پیام سمی که تمام ۱۰ Worker را فلج کرد',
        symptom: 'ارسال ایمیل‌ها در `app.example.com` به طور کامل متوقف شد و مصرف CPU کانتینرهای Worker به ۱۰۰٪ رسید.',
        rootCause: 'یک پیام با آدرس ایمیل خراب (`null`) باعث `Unhandled Exception` در Worker می‌شد؛ پیام `Nack` می‌شد، فوراً به ابتدای صف برمی‌گشت و بدون `Backoff` و بدون `DLQ` هزار بار در دقیقه توسط همه Workerها اجرا می‌گردید.',
        preventionRule: 'همیشه `max_retries` (مثلاً ۵ بار)، تاخیر نمایی بین تلاش‌ها و `Dead Letter Queue` تعریف کنید.'
      },
      deepDive: {
        title: 'کنترل فشار برگشتی (`Backpressure`) هنگام پر شدن صف',
        content: [
          'صف بی‌نهایت هم یک توهم است! اگر نرخ تولید کار ۱۰ برابر سرعت مصرف `Worker`ها باشد، حافظه `Redis` یا دیسک `Broker` بالاخره پر می‌شود و کل سیستم سقوط می‌کند.',
          'سیستم‌های بالغ سقف اندازه صف دارند و هنگام عبور از آستانه بحرانی، یا Autoscaling Workerها را فعال می‌کنند یا در لایه API کارهای غیرضروری را با `503 Service Unavailable` رد می‌کنند (`Load Shedding`).'
        ],
        takeAway: 'صف پیام نه تنها UX را سریع می‌کند بلکه مثل کمک‌فنر ماشین، ضربه‌های ناگهانی ترافیک را جذب می‌کند.'
      },
      check: {
        type: 'recall',
        question: 'چرا در معماری صف پیام وجود `Dead Letter Queue (DLQ)` و `Idempotency` در Worker هر دو هم‌زمان ضروری هستند؟',
        modelAnswer: '`DLQ` پیام‌های سمی را که به خاطر باگ یا داده خراب مدام خطا می‌دهند پس از چند تلاش قرنطینه می‌کند تا کل صف و Workerها را متوقف نکنند. `Idempotency` هم به این دلیل لازم است که صف‌ها معمولاً تضمین تحویل حداقل یک‌باره (`At-Least-Once`) دارند و اگر Worker بعد از انجام کار ولی قبل از ارسال `Ack` کرش کند، همان پیام دوباره پردازش می‌شود و نباید اثر تکراری (مثل ارسال دو ایمیل یا دو بار کسر وجه) بگذارد.'
      },
      crossLinks: [
        { targetId: 'T04-C05', reason: 'جلوگیری از تایم‌اوت ۱۰۰ ثانیه‌ای `Cloudflare 524` با انتقال کارهای سنگین به صف.' },
        { targetId: 'T10-C04', reason: 'الگوی `Transactional Outbox` برای اطمینان از از دست نرفتن پیام هنگام ارسال به صف.' }
      ]
    },
    {
      id: 'T10-C03',
      code: 'D03 · T10 · C03',
      domainId: 'D03',
      trackId: 'T10',
      title: 'Idempotency Keys و Deduplication: تضمین اینکه دو بار کلیک کردن یا Retry شبکه باعث تراکنش تکراری نشود',
      subtitle: 'چطور Stripe و سیستم‌های پرداخت از کسر دوگانه پول در شبکه‌های ناپایدار جلوگیری می‌کنند.',
      readMinutes: 6,
      difficulty: 'چالشی',
      originStory: [
        'تصور کنید در آسانسور با آنتن ضعیف دکمه «پرداخت» را می‌زنید. درخواست شما به سرور می‌رسد، پول از حسابتان کم می‌شود، اما درست پیش از رسیدن پاسخ `200 OK` به گوشی شما، اینترنت یک ثانیه قطع می‌شود! اپ گوشی نمی‌داند پرداخت انجام شده یا نه؛ اگر کاربر یا کلاینت دوباره تلاش (`Retry`) کند، بدون `Idempotency` دو بار پول کسر می‌شود!',
        'مهندسان `Stripe` الگوی هدر `Idempotency-Key` را به استاندارد طلایی صنعت تبدیل کردند تا Retry در شبکه‌های ناپایدار ۱۰۰٪ امن شود.'
      ],
      mentalModel: {
        paragraphs: [
          'مکانیزم بسیار شفاف است: کلاینت پیش از ارسال یک عملیات حساس (`POST /v1/charges`) یک کلید تصادفی یکتا (مثل `UUIDv4`) می‌سازد و در هدر `Idempotency-Key` می‌فرستد. سرور در همان تراکنش دیتابیس که عملیات را انجام می‌دهد، کلید را همراه با هش بدنه درخواست و پاسخ نهایی در جدول `idempotency_keys` (با قید `UNIQUE`) ذخیره می‌کند.',
          'اگر همان درخواست ۲ ثانیه یا ۲ دقیقه بعد دوباره برسد، سرور کلید را پیدا می‌کند و بدون اجرای مجدد عملیات، دقیقاً همان پاسخ ذخیره‌شده قبلی را برمی‌گرداند! اگر همان کلید با بدنه متفاوتی فرستاده شود، سرور خطای `422/409` می‌دهد. و اگر درخواست اول هنوز در حال اجرا (`in_progress`) باشد، درخواست دوم با `409 Conflict` پاسخ می‌گیرد.'
        ],
        rulesOfThumb: [
          'در هر شبکه واقعی، «فقط یک بار ارسال» غیرممکن است؛ پس باید «تحویل حداقل یک‌بار + اجرای `Idempotent`» بسازید.',
          'قید یکتایی کلید (`UNIQUE (user_id, idempotency_key)`) را در دیتابیس ببندید تا دو درخواست هم‌زمان در یک میلی‌ثانیه نتوانند هر دو از چک عبور کنند.',
          'کلاینت فقط برای عملیات جدید یک `Idempotency-Key` تازه می‌سازد؛ برای Retry همان عملیات باید **دقیقاً همان کلید قبلی** را تکرار کند.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'چگونگی خنثی‌سازی Retry و دابل‌کلیک با Idempotency-Key',
          nodes: [
            { label: 'POST + Idempotency-Key: k1', sublabel: 'ارسال اول (یا Retry پس از قطع شبکه)' },
            { label: 'DB UNIQUE Check (k1)', sublabel: 'وجود ندارد -> اجرا و ذخیره پاسخ در تراکنش', accent: true },
            { label: 'Duplicate Request (k1)', sublabel: 'پیدا شد -> بازگشت همان پاسخ قبلی بدون اجرای مجدد' }
          ]
        }
      },
      lab: [
        {
          title: 'ساختار جدول و منطق ذخیره Idempotency Key در SQL و بک‌اند',
          language: 'sql',
          code: `CREATE TABLE idempotency_keys (
  user_id        BIGINT NOT NULL,
  key            TEXT NOT NULL,
  request_hash   TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
  response_code  INT,
  response_body  JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);`,
          explanations: [
            { token: 'PRIMARY KEY (user_id, key)', meaning: 'هر کاربر فضای کلید خودش را دارد و دیتابیس به صورت اتمیک جلوی درج تکراری هم‌زمان را می‌گیرد.' },
            { token: 'request_hash', meaning: 'هش `SHA-256` بدنه درخواست تا اگر کلاینت باگ‌دار با همان کلید مبلغ متفاوتی فرستاد فوراً رد شود.' }
          ]
        }
      ],
      warStory: {
        title: 'دو بار ثبت شدن سفارش‌های موبایل روی اینترنت ناپایدار قطار',
        symptom: 'پشتیبانی `market.example.com` هر هفته ده‌ها شکایت از ثبت دو سفارش مشابه با فاصله ۳ ثانیه دریافت می‌کرد.',
        rootCause: 'کتابخانه شبکه اپلیکیشن موبایل روی تایم‌اوت ۵ ثانیه‌ای به صورت خودکار `POST /orders` را Retry می‌کرد و بک‌اند هیچ مکانیزم `Idempotency` نداشت.',
        preventionRule: 'تمام endpointهای ایجاد سفارش، پرداخت، برداشت وجه و دریافت Webhook باید `Idempotency-Key` یا `event_id` یکتا را اجباری و در دیتابیس قفل کنند.'
      },
      deepDive: {
        title: 'مدت نگهداری کلیدهای `Idempotency` چقدر باید باشد؟',
        content: [
          'نیازی نیست کلیدهای `Idempotency` تا ابد جدول را سنگین کنند؛ بسته به دامنه (مثلاً `24` ساعت تا `7` روز برای APIهای پرداخت)، یک کران‌جاب دوره‌ای کلیدهای منقضی را پاک می‌کند.',
          'نکته کلیدی: برای خطاهای `5xx` موقت که هیچ تغییری در سیستم ثبت نشده، کلید را نباید به عنوان پاسخ نهایی قفل کرد تا کلاینت بتواند لحظاتی بعد مجدداً تلاش کند.'
        ],
        takeAway: 'تکرارپذیری ایمن (`Idempotency`) پلی است که دنیای پرخطای شبکه را به دنیای دقیق تراکنش‌ها وصل می‌کند.'
      },
      check: {
        type: 'triage',
        prompt: 'یک کلاینت موبایل هنگام ارسال `POST /v1/transfers` کلید `Idempotency-Key` را داخل تابع `retryFetch` (در هر بار تکرار حلقه Retry) با `crypto.randomUUID()` تولید می‌کند. این پیاده‌سازی چه ایرادی دارد؟',
        options: [
          { id: 'a', label: 'تولید کلید جدید در هر بار Retry کل فلسفه `Idempotency` را از بین می‌برد؛ کلید باید یک بار در زمان نیت کاربر (مثلاً کلیک روی دکمه پرداخت) ساخته شود و در تمام تلاش‌های Retry ثابت بماند', isCorrect: true, feedback: 'دقیقاً! اگر هر Retry کلید متفاوتی بفرستد، سرور هر تلاش را یک انتقال پول جدید و مستقل تلقی می‌کند!' },
          { id: 'b', label: '`UUID` برای کلید مناسب نیست و باید عدد ۱، ۲، ۳ باشد', isCorrect: false, feedback: '`UUIDv4` انتخابی عالی است؛ خطا در زمان و محل تولید آن است.' },
          { id: 'c', label: 'کلید نباید در هدر فرستاده شود و باید در URL باشد', isCorrect: false, feedback: 'ارسال در هدر `Idempotency-Key` استاندارد صنعتی است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T09-C02', reason: 'ترکیب قید یکتای `Idempotency` با تراکنش‌های `ACID` دیتابیس.' },
        { targetId: 'T10-C05', reason: 'چرا `Retry` بدون `Idempotency` می‌تواند خرابی را دوچندان کند.' }
      ]
    },
    {
      id: 'T10-C04',
      code: 'D03 · T10 · C04',
      domainId: 'D03',
      trackId: 'T10',
      title: 'الگوی Transactional Outbox و Durable Leases: چطور دیتابیس و سرویس خارجی (مثل درگاه یا تلگرام) را همیشه همگام نگه داریم',
      subtitle: 'حل مشکل Dual-Write که در آن دیتابیس ذخیره می‌شود ولی پیام به سرویس بیرونی نمی‌رسد.',
      readMinutes: 7,
      difficulty: 'چالشی',
      originStory: [
        'تقریباً هر مهندس بک‌اند یک بار در این تله کلاسیک (`Dual-Write Problem`) افتاده است: کد شما سفارش را در `PostgreSQL` ذخیره می‌کند و بلافاصله در خط بعدی رویداد را به `RabbitMQ` یا `API` تلگرام می‌فرستد. اما درست بین آن دو خط، سرور کرش می‌کند یا شبکه یک لحظه قطع می‌شود! حالا سفارش در دیتابیس ثبت شده ولی پیام هرگز ارسال نشده — سیستم در وضعیت «نیمه‌کاره و ناهماهنگ» گیر افتاده است.',
        'راه‌حل درخشان و بدون پیچیدگی `2PC` (تراکنش توزیع‌شده)، الگوی `Transactional Outbox` است.'
      ],
      mentalModel: {
        paragraphs: [
          'در الگوی `Transactional Outbox`، به جای ارسال مستقیم به سرویس بیرونی یا صف وسط درخواست، درون **همان یک تراکنش ACID دیتابیس** هم رکورد `orders` را می‌سازید و هم یک سطر در جدول `outbox_events` (با وضعیت `pending`) درج می‌کنید! به لطف `Atomicity` دیتابیس، یا هر دو ذخیره می‌شوند یا هیچ‌کدام.',
          'سپس یک پردازش پس‌زمینه (`Outbox Relay / Worker`) به صورت مداوم ردیف‌های `pending` را با `FOR UPDATE SKIP LOCKED` و یک `Durable Lease` (قفل دارای زمان انقضا مثل `locked_until = now() + 30s`) برمی‌دارد، به سرویس بیرونی (تلگرام، درگاه، Kafka) تحویل می‌دهد و پس از تایید، وضعیت را `sent` می‌کند. اگر Worker وسط کار بمیرد، پس از ۳۰ ثانیه `Lease` منقضی شده و Worker دیگری کار را تمام می‌کند.'
        ],
        rulesOfThumb: [
          'هر زمان مجبورید هم در دیتابیس بنویسید و هم به یک سیستم بیرونی (صف، وب‌هوک، پیام‌رسان) خبر دهید، از `Transactional Outbox` استفاده کنید.',
          'قفل‌های کار (`Leases`) همیشه باید زمان انقضا (`locked_until`) داشته باشند تا اگر کانتینر Worker با `OOM` مرد، کار تا ابد در حالت `processing` گیر نکند!',
          'مقصد بیرونی ممکن است پیام را بیش از یک بار بگیرد (`At-Least-Once`)؛ پس شناسه یکتای رویداد Outbox را برای Deduplication همراه پیام بفرستید.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'حل قطعی مشکل Dual-Write با جدول Transactional Outbox و Durable Lease',
          nodes: [
            { label: 'Single ACID Transaction', sublabel: 'INSERT orders + INSERT outbox_events (اتمیک)', accent: true },
            { label: 'Outbox Worker (Lease)', sublabel: 'برداشت با SKIP LOCKED + مهلت ۳۰ ثانیه‌ای' },
            { label: 'External API / Broker', sublabel: 'ارسال با Retry تا تایید -> mark sent' }
          ]
        }
      },
      lab: [
        {
          title: 'ساختار جدول Outbox با Durable Lease برای بازیابی خودکار پس از کرش Worker',
          language: 'sql',
          code: `CREATE TABLE outbox_events (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  topic        TEXT NOT NULL,
  payload      JSONB NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  attempts     INT NOT NULL DEFAULT 0,
  next_run_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_until TIMESTAMPTZ
);

-- پیدا کردن کارهای آماده یا کارهایی که Worker قبلی آن‌ها کرش کرده و Lease منقضی شده
SELECT * FROM outbox_events
WHERE status = 'pending'
  AND next_run_at <= now()
  AND (locked_until IS NULL OR locked_until < now())
ORDER BY id ASC
FOR UPDATE SKIP LOCKED
LIMIT 10;`,
          explanations: [
            { token: 'locked_until < now()', meaning: 'بازیابی خودکار (`Self-Healing`) بدون دخالت انسانی در صورت کرش ناگهانی Worker.' },
            { token: 'next_run_at', meaning: 'اجازه می‌دهد هنگام خطای سرویس بیرونی، `Exponential Backoff` را دقیقاً روی همان جدول پیاده کنید.' }
          ]
        }
      ],
      warStory: {
        title: 'گم شدن صدها اشتراک خریداری‌شده پس از پرداخت موفق مشتری',
        symptom: 'در سرویس `bot.example.com` مشتریان پرداخت را انجام داده بودند و رکورد در دیتابیس `paid` بود، اما ربات تلگرام لینک فعال‌سازی را برای ۵٪ کاربران نفرستاده بود.',
        rootCause: 'کد پس از `COMMIT` دیتابیس، یک `await telegram.sendMessage()` ساده صدا می‌زد؛ هر زمان API تلگرام چند ثانیه کند می‌شد یا کانتینر حین دیپلوی ری‌استارت می‌شد، پیام برای همیشه از بین می‌رفت.',
        preventionRule: 'تغییر وضعیت `paid` و درج پیام در `outbox_events` را در یک تراکنش دیتابیس انجام دهید و ارسال به تلگرام را به Worker دارای `Lease` و Retry بسپارید.'
      },
      deepDive: {
        title: 'از `Polling Outbox` تا `CDC (Debezium)` در مقیاس‌های بسیار بالا',
        content: [
          'برای ۹۵٪ سیستم‌ها خواندن جدول `outbox_events` هر ۵۰۰ میلی‌ثانیه توسط Worker ساده، کم‌هزینه و فوق‌العاده مطمئن است.',
          'در مقیاس‌های عظیم (ده‌ها هزار رویداد در ثانیه)، ابزارهای `Change Data Capture` مثل `Debezium` مستقیماً فایل `WAL` دیتابیس `PostgreSQL` را می‌خوانند و سطرهای جدید جدول `outbox` را بدون کوئری Polling به `Kafka` استریم می‌کنند.'
        ],
        takeAway: 'تراکنش محلی + `Outbox` + `Lease`، ساده اما از قدرتمندترین الگوهای سیستم‌های توزیع‌شده است.'
      },
      check: {
        type: 'recall',
        question: 'چرا در الگوی `Transactional Outbox` ستون `locked_until` (`Durable Lease`) به جای یک بولین ساده `is_locked = true` حیاتی است؟',
        modelAnswer: 'اگر فقط یک بولین `is_locked = true` باشد و پردازش Worker وسط ارسال پیام به خاطر `OOM` یا قطع برق ناگهان بمیرد، آن سطر برای همیشه در حالت قفل‌شده باقی می‌ماند و هیچ Worker دیگری آن را برنمی‌دارد. اما با `locked_until` (مثلاً ۳۰ ثانیه بعد)، اگر Worker بمبرد پس از انقضای مهلت، Worker سالم دیگری به طور خودکار کار را تصاحب و تکمیل می‌کند.'
      },
      crossLinks: [
        { targetId: 'T09-C05', reason: 'استفاده از `SELECT FOR UPDATE SKIP LOCKED` در `PostgreSQL` برای پیاده‌سازی همین الگو.' },
        { targetId: 'T10-C02', reason: 'ارتباط `Outbox` با صف‌های پیام و تضمین تحویل `At-Least-Once`.' }
      ]
    },
    {
      id: 'T10-C05',
      code: 'D03 · T10 · C05',
      domainId: 'D03',
      trackId: 'T10',
      title: 'Timeout، Retry با Exponential Backoff + Jitter و Circuit Breaker: جلوگیری از آبشار خطا (Cascading Failure)',
      subtitle: 'چرا یک Retry ساده بدون Jitter می‌تواند سرویس در حال بازیابی را دوباره زمین بزند.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در دنیای میکروسرویس‌ها و APIهای ابری، یک کندی ساده در یک سرویس کم‌اهمیت (مثل سرویس توصیه‌گر یا استعلام قیمت) می‌تواند مثل دومینو کل سیستم را بخواباند: اگر کلاینت `Timeout` نداشته باشد، تمام نخ‌ها منتظر می‌مانند؛ و اگر همه کلاینت‌ها روی خطا دقیقاً پس از ۱ ثانیه `Retry` کنند، یک موج طوفانی هم‌زمان (`Retry Storm`) می‌سازند که سرویس در حال احیا را دوباره می‌کشد!',
        'کتاب کلاسیک `Release It!` و مقاله مشهور تیم معماری `AWS` درباره `Jitter`، سه سلاح اصلی بقا را استاندارد کردند: `Timeout` صریح، `Exponential Backoff + Jitter` و `Circuit Breaker`.'
      ],
      mentalModel: {
        paragraphs: [
          'قانون اول: هیچ تماس شبکه‌ای در دنیا بدون `Timeout` صریح (`connect` + `read`) مجاز نیست! بدون تایم‌اوت یک سرور نیمه‌مرده ظرف ثانیه‌ها تمام `Worker`ها و حافظه شما را می‌بلعد. قانون دوم: فقط خطاهای گذرا (`502/503/504`, `429`, خطای شبکه) و فقط عملیات‌های `Idempotent` را Retry کنید (هرگز `400/401/403` را Retry نکنید!).',
          'قانون سوم: بین تلاش‌ها زمان را دو برابر کنید (`Exponential Backoff`: 200ms, 400ms, 800ms) و یک عدد تصادفی (`Full Jitter`) ضرب کنید تا کلاینت‌ها هم‌زمان شلیک نکنند. قانون چهارم: وقتی یک سرویس بیرونی پشت‌سرهم خطا می‌دهد، `Circuit Breaker` مدار را باز (`Open`) می‌کند و به جای معطل کردن کاربران، فوراً پاسخ جایگزین (`Fallback`) یا خطای سریع (`Fail Fast`) می‌دهد تا سرویس مقصد فرصت نفس کشیدن پیدا کند.'
        ],
        rulesOfThumb: [
          'هر فراخوانی `fetch`, `httpx`, `axios` یا درایور DB باید `Timeout` صریح و کوتاه‌تر از تایم‌اوت لایه بالایی خودش (`Deadline Propagation`) داشته باشد.',
          'در Retry هرگز بدون `Jitter` تصادفی و بدون سقف تلاش (`maxRetries = 3`) کد ننویسید.',
          'مراقب «تقویت Retry» باشید: اگر لایه A سه بار لایه B را Retry کند و لایه B سه بار لایه C را، یک خطا تبدیل به ۹ یا ۲۷ برابر ترافیک روی C می‌شود! معمولاً فقط یک لایه باید مسئول Retry باشد.'
        ],
        diagram: {
          kind: 'cycle',
          caption: 'سه حالت ماشین وضعیت Circuit Breaker برای جلوگیری از آبشار خطا',
          nodes: [
            { label: 'Closed (عادی)', sublabel: 'ترافیک عبور می‌کند و نرخ خطا رصد می‌شود' },
            { label: 'Open (مدار باز — Fail Fast)', sublabel: 'عبور از آستانه خطا -> رد فوری + Fallback', accent: true },
            { label: 'Half-Open (آزمایشی)', sublabel: 'پس از Cooldown یک درخواست تست -> سلامت؟ بازگشت به Closed' }
          ]
        }
      },
      lab: [
        {
          title: 'پیاده‌سازی تمیز Retry با Timeout صریح و Full Jitter در TypeScript',
          language: 'ts',
          code: `export async function fetchWithRetry(url: string, maxAttempts = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
        return res; // خطای 4xx (به جز 429) ارزش Retry ندارد
      }
    } catch {
      if (attempt === maxAttempts) throw new Error('Upstream failed after retries');
    }
    const capMs = Math.min(5000, 200 * 2 ** attempt);
    const delayMs = Math.floor(Math.random() * capMs); // Full Jitter
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error('Unreachable');
}`,
          explanations: [
            { token: 'AbortSignal.timeout(4000)', meaning: 'استاندارد بومی مدرن برای قطع خودکار درخواست `fetch` پس از ۴ ثانیه.' },
            { token: 'Math.random() * capMs', meaning: 'الگوی `Full Jitter` توصیه‌شده توسط AWS برای پخش کردن یکنواخت Retryها در زمان.' }
          ]
        }
      ],
      warStory: {
        title: 'دو ساعت قطعی ادامه دار پس از یک اختلال ۲ دقیقه‌ای در سرویس احراز هویت',
        symptom: 'سرویس `auth.example.com` به مدت ۲ دقیقه کند شد، اما حتی پس از رفع مشکل، تا دو ساعت بعد هر بار که بالا می‌آمد ظرف ۱۰ ثانیه دوباره سقوط می‌کرد.',
        rootCause: 'همه ۵۰ سرویس مصرف‌کننده، حلقه Retry فوری بدون `Backoff` و بدون `Jitter` داشتند و همچنین `Timeout` آن‌ها ۳۰ ثانیه بود؛ طوفان Retry ترافیک ۱۰ برابری روی سرور در حال بوت می‌ریخت.',
        preventionRule: 'تایم‌اوت کوتاه، `Full Jitter`، بودجه Retry محدود (حداکثر ۱۰٪ ترافیک) و `Circuit Breaker` را به صورت یک کتابخانه کلاینت استاندارد در کل تیم اجباری کنید.'
      },
      deepDive: {
        title: 'الگوی `Bulkhead` (دیوارهای ضدآب کشتی) در نرم‌افزار',
        content: [
          'کشتی‌های مدرن به اتاقک‌های ضدآب جداگانه تقسیم می‌شوند تا اگر یک بخش سوراخ شد، کل کشتی غرق نشود. در نرم‌افزار نیز اگر سرویس ایمیل و سرویس پرداخت از یک `Thread Pool` یا `HTTP Pool` مشترک استفاده کنند، کندی سرویس ایمیل کل پرداخت‌ها را از کار می‌اندازد.',
          'جداسازی استخر اتصال‌ها و سهمیه هم‌زمانی برای هر وابستگی خارجی (`Bulkhead Isolation`) جلوی سرایت خرابی را می‌گیرد.'
        ],
        takeAway: 'فرض کنید هر سرویس شبکه‌ای دیر یا زود کند یا قطع می‌شود؛ طراحی برای شکست، سیستم را سرپا نگه می‌دارد.'
      },
      check: {
        type: 'triage',
        prompt: 'یک کلاینت API هنگام دریافت کد وضعیت `400 Bad Request` از سرور مقصد، ۵ بار با `Exponential Backoff` درخواست را تکرار می‌کند. اشکال این کار چیست؟',
        options: [
          { id: 'a', label: 'کد `400` خطای دائمی ورودی کلاینت است و با تکرار هرگز درست نمی‌شود؛ فقط باید خطاهای گذرا (`5xx`, `429`, خطای شبکه/Timeout) را Retry کرد', isCorrect: true, feedback: 'دقیقاً! Retry روی خطاهای `4xx` (به جز `429` و `408`) فقط کاربر را معطل می‌کند و بار بی‌هدف روی سرور می‌اندازد.' },
          { id: 'b', label: 'کد `400` باید حداقل ۲۰ بار Retry شود', isCorrect: false, feedback: 'تکرار ورودی نامعتبر هیچ‌گاه پاسخ معتبر نمی‌دهد.' },
          { id: 'c', label: 'تنها مشکل این است که `Jitter` کم است', isCorrect: false, feedback: 'اساساً نباید روی خطای `400` هیچ Retryای انجام شود.' }
        ]
      },
      crossLinks: [
        { targetId: 'T19-C06', reason: 'پیاده‌سازی `Timeout`، `Retry` و `Model Fallback` هنگام اختلال در API مدل‌های هوش مصنوعی.' },
        { targetId: 'T10-C03', reason: 'چرا پیش از فعال کردن Retry روی درخواست‌های `POST` باید `Idempotency` داشته باشید.' }
      ]
    },
    {
      id: 'T10-C06',
      code: 'D03 · T10 · C06',
      domainId: 'D03',
      trackId: 'T10',
      title: 'طراحی سیستم مالی و دفتر کل (Double-Entry Ledger): چرا هرگز نباید فقط یک ستون `balance` را آپدیت کرد',
      subtitle: 'معماری حسابداری دوبل تغییرناپذیر که ۵۰۰ سال است صحت پول را تضمین می‌کند.',
      readMinutes: 7,
      difficulty: 'چالشی',
      originStory: [
        'در سال ۱۴۹۴ میلادی راهب و ریاضیدان ایتالیایی `Luca Pacioli` در ونیز کتابی درباره «حسابداری دوبل» (`Double-Entry Bookkeeping`) منتشر کرد؛ سیستمی که به بازرگانان اجازه می‌داد کوچک‌ترین خطای دفترداری یا اختلاس را با یک تراز ریاضی ساده فوراً کشف کنند.',
        'پانصد سال بعد، استارتاپ‌هایی که پول کاربران را فقط با `UPDATE users SET balance = balance + 100` نگه می‌دارند، به محض بروز اولین باگ یا برگشت وجه (`Refund`) می‌فهمند هیچ راهی برای اثبات اینکه پول دقیقاً از کجا آمده و کجا رفته ندارند! سیستم‌های مالی واقعی (از `Stripe` تا بانک‌ها) همگی بر پایه «دفتر کل تغییرناپذیر دوبل» ساخته می‌شوند.'
      ],
      mentalModel: {
        paragraphs: [
          'در `Double-Entry Ledger` دو قانون مقدس وجود دارد: ۱) **تغییرناپذیری (`Append-Only`)**: هرگز یک تراکنش ثبت‌شده را `UPDATE` یا `DELETE` نکنید! اگر اشتباهی رخ داد یا مرجوعی پیش آمد، یک سند جبرانی جدید (`Reversal Entry`) ثبت کنید. ۲) **تراز صفر (`Zero-Sum`)**: پول هرگز از هوا خلق یا ناپدید نمی‌شود؛ هر تراکنش (`Journal Entry`) حداقل دو ردیف (`Postings`) دارد: یک بدهکار (`Debit`) و یک بستانکار (`Credit`) که جمع جبری آن‌ها دقیقاً برابر `0` است.',
          'برای مثال وقتی کاربر ۱۰۰٬۰۰۰ تومان شارژ می‌کند، ۱۰۰٬۰۰۰- از حساب `gateway_settlement` کم و ۱۰۰٬۰۰۰+ به حساب `user_wallet:42` اضافه می‌شود. با جمع کردن همه ردیف‌های دفتر کل در هر لحظه، تراز کل سیستم باید دقیقاً `0` باشد — اگر حتی ۱ ریال اختلاف دیدید، فوری می‌فهمید باگ یا ناهماهنگی رخ داده است (`Reconciliation`).'
        ],
        rulesOfThumb: [
          'ستون `balance` روی حساب کاربر فقط می‌تواند یک «کش محاسبه‌شده» برای خواندن سریع باشد؛ مرجع حقیقت واقعی همیشه جدول تغییرناپذیر `ledger_entries` است.',
          'تمامی ردیف‌های یک سند دوبل باید در یک تراکنش `ACID` واحد ثبت شوند و مجموع `delta_cents` هر سند برابر صفر باشد.',
          'روزانه یک کار خودکار مغایرت‌گیری (`Reconciliation Job`) بین دفتر کل داخلی و گزارش تسویه درگاه بانکی اجرا کنید.'
        ],
        diagram: {
          kind: 'split',
          caption: 'اصل تراز صفر در حسابداری دوبل (مجموع هر تراکنش = ۰)',
          nodes: [
            { label: 'حساب مبدا (Debit)', sublabel: 'user_wallet:42 -> -50,000' },
            { label: 'حساب مقصد (Credit)', sublabel: 'merchant:9 -> +48,500 · platform_fee -> +1,500', accent: true },
            { label: 'قانون بقا (Sum = 0)', sublabel: '-50,000 + 48,500 + 1,500 = 0 (قابل ممیزی کامل)' }
          ]
        }
      },
      lab: [
        {
          title: 'ساختار حداقلی اما استاندارد دفتر کل دوبل (Append-Only Ledger) در SQL',
          language: 'sql',
          code: `CREATE TABLE ledger_transactions (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ledger_postings (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  transaction_id BIGINT NOT NULL REFERENCES ledger_transactions(id),
  account_id     BIGINT NOT NULL REFERENCES accounts(id),
  amount_cents   BIGINT NOT NULL CHECK (amount_cents <> 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- کوئری مغایرت‌گیری سلامت کل دفتر کل (باید همیشه 0 برگرداند):
-- SELECT SUM(amount_cents) FROM ledger_postings;`,
          explanations: [
            { token: 'amount_cents <> 0', meaning: 'ثبت ردیف با مبلغ صفر بی‌معناست؛ اعداد منفی و مثبت دو سوی تراز را می‌سازند.' },
            { token: 'SUM(amount_cents) = 0', meaning: 'تست سلامت ریاضی کل سیستم مالی در یک کوئری.' }
          ]
        }
      ],
      warStory: {
        title: 'ناتوانی در توضیح کسری ۲۰۰ میلیون تومانی در پایان فصل مالی',
        symptom: 'در پایان فصل، حسابدار `platform.example.com` متوجه شد مجموع موجودی کیف‌پول کاربران ۲۰۰ میلیون تومان بیشتر از پول موجود در حساب بانکی شرکت است.',
        rootCause: 'سیستم فقط یک ستون `users.balance` داشت که از ۱۲ نقطه مختلف کد `UPDATE` می‌شد و وقتی کارمزد یا ریفاند ناموفق رخ می‌داد هیچ تاریخچه ترازدار و تغییرناپذیری برای ردیابی ریشه وجود نداشت.',
        preventionRule: 'در هر محصولی که کیف‌پول، اعتبار، امتیاز قابل خرید یا تسویه فروشنده دارد، از روز اول `Double-Entry Ledger` پیاده کنید.'
      },
      deepDive: {
        title: 'چطور با وجود میلیون‌ها ردیف در دفتر کل، موجودی کاربر را سریع بخوانیم؟',
        content: [
          'محاسبه `SUM(amount_cents)` روی تاریخچه ۵ ساله یک حساب پرکار در هر درخواست کند است. الگوی استاندارد نگهداری یک جدول `account_balances` است که درون **همان تراکنش** ثبت در `ledger_postings` آپدیت می‌شود (همراه با `SELECT ... FOR UPDATE`).',
          'این‌گونه هم خواندن موجودی `O(1)` است و هم هر شب می‌توان با مقایسه `account_balances` با `SUM(ledger_postings)` سلامت کامل سیستم را اثبات کرد.'
        ],
        takeAway: 'در مهندسی مالی، «قابل اثبات و ممیزی بودن» از سرعت نوشتن کد اولیه بسیار مهم‌تر است.'
      },
      check: {
        type: 'recall',
        question: 'اگر یک تراکنش مالی اشتباه در سیستم دفتر کل (`Double-Entry Ledger`) ثبت شده باشد، چرا نباید آن سطر را `UPDATE` یا `DELETE` کرد و روش صحیح اصلاح چیست؟',
        modelAnswer: 'چون دفتر کل باید تغییرناپذیر (`Append-Only`) باشد تا ردپای ممیزی (`Audit Trail`) برای حسابداری، حل اختلاف با مشتری و کشف باگ حفظ شود. روش صحیح، ثبت یک تراکنش جبرانی جدید (`Reversal / Adjustment Entry`) با مقادیر معکوس و ارجاع به شناسه تراکنش اولیه است.'
      },
      crossLinks: [
        { targetId: 'T09-C01', reason: 'پرهیز از `FLOAT` و استفاده از `BIGINT` برای مبالغ پولی در دیتابیس.' },
        { targetId: 'T09-C02', reason: 'محافظت از موجودی کیف‌پول در برابر برداشت هم‌زمان (`Double-Spend`).' }
      ]
    }
  ]
};

export default t10;
