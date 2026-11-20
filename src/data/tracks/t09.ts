import type { TrackContent } from '../../types/atlas';

const t09: TrackContent = {
  trackId: 'T09',
  chapters: [
    {
      id: 'T09-C01',
      code: 'D03 · T09 · C01',
      domainId: 'D03',
      trackId: 'T09',
      title: 'داستان Edgar Codd (۱۹۷۰) و مدل رابطه‌ای: طراحی Schema تمیز، کلیدهای اصلی/خارجی و زمان درست Denormalization',
      subtitle: 'چرا جبر رابطه‌ای پس از نیم قرن همچنان پادشاه داده‌های ساختاریافته است.',
      readMinutes: 6,
      difficulty: 'مبانی عمیق',
      originStory: [
        'پیش از سال ۱۹۷۰، برای خواندن داده از دیتابیس باید کدهای پیچیده‌ای می‌نوشتید که مسیر فیزیکی اشاره‌گرها روی نوار مغناطیسی را دنبال کنند؛ اگر ساختار دیسک عوض می‌شد کل برنامه‌ها می‌شکستند. در ژوئن ۱۹۷۰ `Edgar F. Codd` در آزمایشگاه `IBM` مقاله‌ای انقلابی منتشر کرد که داده را به جدول‌های ریاضی مستقل از نحوه ذخیره فیزیکی تبدیل نمود.',
        'نتیجه آن زبان اعلانی `SQL` بود: شما فقط می‌گویید «چه داده‌ای می‌خواهید» و `Query Planner` دیتابیس بهترین مسیر فیزیکی یافتن آن را پیدا می‌کند.'
      ],
      mentalModel: {
        paragraphs: [
          'قانون پایه طراحی `Schema` نرمال‌سازی (`3NF`) است: هر حقیقت فقط در «یک» مکان ذخیره شود تا هنگام آپدیت (مثل تغییر آدرس یا نام کالا) ناهماهنگی رخ ندهد. کلیدهای خارجی (`FOREIGN KEY`) و قیدهای یکتایی (`UNIQUE`) و چک (`CHECK (amount > 0)`) آخرین سنگر محافظت از صحت داده هستند حتی اگر در کد اپلیکیشن باگی وجود داشته باشد.',
          'اما یک استثنای مهندسی بسیار مهم هست: داده‌های تاریخی (مثل «قیمت کالا در لحظه ثبت فاکتور») را هرگز فقط با کلید خارجی به جدول کالاها وصل نکنید! چون فردا قیمت کالا تغییر می‌کند و کل فاکتورهای پارسال غلط می‌شوند. اینجا `Denormalization` آگاهانه (ثبت اسنپ‌شات قیمت روی ردیف فاکتور) نه تنها مجاز بلکه الزامی است.'
        ],
        rulesOfThumb: [
          'مبالغ پولی را هرگز با `FLOAT` یا `DOUBLE` ذخیره نکنید (خطای گرد کردن مثل `0.1 + 0.2 = 0.30000000000000004`)؛ همیشه عدد صحیح کوچک‌ترین واحد (`BIGINT` ریال/سنت) یا `NUMERIC/DECIMAL`.',
          'تمام تاریخ‌ها را در دیتابیس با `TIMESTAMPTZ` (بر مبنای `UTC`) ذخیره کنید و تبدیل به منطقه زمانی محلی را فقط در لایه نمایش انجام دهید.',
          'قیدهای صحت داده (`NOT NULL`, `UNIQUE`, `CHECK`, `FOREIGN KEY`) را درون خود دیتابیس ببندید نه فقط در کد اپلیکیشن.'
        ],
        diagram: {
          kind: 'split',
          caption: 'توازن Normalization (یکپارچگی) و Denormalization آگاهانه (اسنپ‌شات تاریخی)',
          nodes: [
            { label: 'Normalized Core (3NF)', sublabel: 'users · products · orders — یک منبع حقیقت با FK و UNIQUE', accent: true },
            { label: 'Intentional Snapshot', sublabel: 'order_items.unit_price_at_purchase — حفظ تاریخچه مالی' }
          ]
        }
      },
      lab: [
        {
          title: 'طراحی Schema مقاوم با قیدهای دیتابیسی در PostgreSQL',
          language: 'sql',
          code: `CREATE TABLE orders (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(id),
  idempotency_key TEXT NOT NULL,
  total_cents  BIGINT NOT NULL CHECK (total_cents >= 0),
  status       TEXT NOT NULL CHECK (status IN ('pending','paid','cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);`,
          explanations: [
            { token: 'CHECK (total_cents >= 0)', meaning: 'حتی یک باگ در کد بک‌اند هم نمی‌تواند مبلغ منفی در جدول ثبت کند.' },
            { token: 'UNIQUE (user_id, idempotency_key)', meaning: 'تضمین اتمیک در سطح دیتابیس برای جلوگیری از ثبت سفارش تکراری.' }
          ]
        }
      ],
      warStory: {
        title: 'تغییر یافتن کل حساب‌های مالی سال گذشته با یک آپدیت قیمت',
        symptom: 'بعد از افزایش قیمت اشتراک ماهانه در `billing.example.com`، گزارش درآمد ۶ ماه گذشته شرکت ناگهان ۳۰٪ بیشتر از واریزی واقعی بانک نشان داد!',
        rootCause: 'جدول `invoices` فقط `plan_id` داشت و مبلغ فاکتورها را در لحظه گزارش‌گیری با `JOIN` از جدول `plans.price` می‌خواند.',
        preventionRule: 'فاکتورها و سفارش‌ها رویدادهای تاریخی تغییرناپذیرند؛ قیمت و نرخ مالیات لحظه خرید را به عنوان اسنپ‌شات روی خود رکورد فاکتور ذخیره کنید.'
      },
      deepDive: {
        title: 'انتخاب کلید اصلی: `BIGINT IDENTITY` در برابر `UUIDv4` و `UUIDv7`',
        content: [
          '`UUIDv4` کاملاً تصادفی است و هنگام درج میلیون‌ها ردیف، باعث پراکندگی شدید صفحات `B-Tree` (`Page Splitting`) و کاهش کارایی کش دیتابیس می‌شود.',
          'استاندارد جدید `UUIDv7` (و `ULID`) ۴۸ بیت اول را بر اساس زمان می‌سازد؛ بنابراین هم از بیرون قابل حدس نیست و هم مانند عدد ترتیبی در انتهای درخت `B-Tree` با بیشترین سرعت درج می‌شود.'
        ],
        takeAway: 'طراحی Schema خوب نیمی از باگ‌های آینده سیستم را پیش از نوشته شدن کد حذف می‌کند.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطی را در این جدول مالی پیدا کنید که باعث خطاهای مرموز گرد شدن اعداد اعشاری در محاسبات پولی می‌شود:',
        lines: [
          { lineNumber: 1, code: 'CREATE TABLE wallet_transfers (' },
          { lineNumber: 2, code: '  id BIGINT PRIMARY KEY,' },
          { lineNumber: 3, code: '  amount DOUBLE PRECISION NOT NULL,', isBug: true },
          { lineNumber: 4, code: '  created_at TIMESTAMPTZ NOT NULL DEFAULT now()' },
          { lineNumber: 5, code: ');' }
        ],
        explanation: 'خط ۳ از `DOUBLE PRECISION` (ممیز شناور باینری IEEE 754) برای پول استفاده کرده است که اعداد دهدهی مانند `0.10` را دقیق نمایش نمی‌دهد. برای پول همیشه `BIGINT` (کوچک‌ترین واحد مثل سنت/ریال) یا `NUMERIC(18, 2)` به کار ببرید.'
      },
      crossLinks: [
        { targetId: 'T10-C06', reason: 'طراحی معماری دفتر کل دوبل (`Double-Entry Ledger`) برای سیستم‌های مالی دقیق.' },
        { targetId: 'T09-C03', reason: 'چرا ترتیب کلید اصلی (`BIGINT` / `UUIDv7`) روی سرعت ایندکس `B-Tree` اثر می‌گذارد.' }
      ]
    },
    {
      id: 'T09-C02',
      code: 'D03 · T09 · C02',
      domainId: 'D03',
      trackId: 'T09',
      title: 'تراکنش‌ها، اصول ACID و سطوح ایزولاسیون (Isolation Levels): چطور از Race Condition و Double-Spend مالی جلوگیری کنیم',
      subtitle: 'چرا دو درخواست هم‌زمان می‌توانند موجودی یک کیف‌پول را دو بار خرج کنند و راه‌حل قطعی چیست.',
      readMinutes: 7,
      difficulty: 'چالشی',
      originStory: [
        'یکی از مشهورترین آسیب‌پذیری‌های دنیای فین‌تک و صرافی‌ها، حمله هم‌زمانی (`TOCTOU — Time-of-Check to Time-of-Use`) است: مهاجم با اسکریپت ۲۰ درخواست هم‌زمان برداشت ۱۰۰ دلار به حسابی که فقط ۱۰۰ دلار موجودی دارد می‌فرستد. اگر کد سرور ابتدا `SELECT balance` بخواند، در حافظه چک کند و بعد `UPDATE` بزند، هر ۲۰ درخواست هم‌زمان `100` را می‌بینند و حساب به منفی ۱۹۰۰ دلار می‌رود!',
        'دقیقاً برای مهار چنین آشوب‌هایی، `Jim Gray` در دهه ۷۰ مفهوم تراکنش `ACID` را بنیان گذاشت و جایزه تورینگ گرفت.'
      ],
      mentalModel: {
        paragraphs: [
          'چهار تضمین `ACID`: `Atomicity` (همه دستورات تراکنش یا با هم ثبت می‌شوند یا با هم برمی‌گردند)، `Consistency` (قیدهای دیتابیس همیشه برقرارند)، `Isolation` (تراکنش‌های هم‌زمان مزاحم هم نشوند) و `Durability` (پس از `COMMIT` حتی با قطع برق داده روی دیسک امن است).',
          'نکته ظریف و حیاتی: سطح ایزولاسیون پیش‌فرض در `PostgreSQL` حالت `Read Committed` است که به تنهایی جلوی `Lost Update` / `Double-Spend` را نمی‌گیرد! برای جلوگیری قطعی از برداشت هم‌زمان دو راه استاندارد داریم: ۱) آپدیت شرطی اتمیک (`UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING balance`) یا ۲) قفل کردن سطر درون تراکنش با `SELECT ... FOR UPDATE` (یا `Optimistic Locking` با ستون `version`).'
        ],
        rulesOfThumb: [
          'هرگز الگوی «بخوان در اپ -> چک کن -> بنویس در DB» را برای موجودی، کوپن یک‌بارمصرف یا انبارداری بدون قفل سطری یا آپدیت شرطی اتمیک پیاده نکنید.',
          'تراکنش دیتابیس را بسیار کوتاه نگه دارید: هرگز وسط یک `BEGIN ... COMMIT` تماس شبکه بیرونی (درگاه بانکی، API ایمیل یا LLM) نزنید وگرنه قفل‌ها و `Connection Pool` کل سرور را می‌خوابانید!',
          'هنگام قفل کردن دو حساب (انتقال از A به B)، همیشه آن‌ها را به ترتیب ثابت (`ORDER BY id ASC`) قفل کنید تا `Deadlock` رخ ندهد.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'چطور قفل سطری (FOR UPDATE) یا آپدیت شرطی اتمیک جلوی Double-Spend را می‌گیرد',
          nodes: [
            { label: 'Req 1 & Req 2 (هم‌زمان)', sublabel: 'دو درخواست برداشت ۱۰۰ تومانی از موجودی ۱۰۰' },
            { label: 'Row Lock / Atomic UPDATE', sublabel: 'دیتابیس Req 2 را تا COMMIT اولی نگه می‌دارد', accent: true },
            { label: 'Req 1 -> 200 OK (موجودی ۰)', sublabel: 'Req 2 شرط balance >= 100 را رد می‌کند -> 409' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی اتمیک ضد Double-Spend با یک دستور SQL بدون Race Condition',
          language: 'sql',
          code: `BEGIN;

-- قفل کردن و کسر اتمیک در یک گام؛ اگر موجودی کافی نباشد صفر ردیف برمی‌گردد
UPDATE wallets
SET balance_cents = balance_cents - $1
WHERE user_id = $2
  AND balance_cents >= $1
RETURNING balance_cents;

-- ثبت رکورد تراکنش در همان تراکنش اتمیک
INSERT INTO ledger_entries (user_id, delta_cents, ref_id)
VALUES ($2, -$1, $3);

COMMIT;`,
          explanations: [
            { token: 'AND balance_cents >= $1', meaning: 'موتور دیتابیس روی ردیف قفل انحصاری می‌گیرد و شرط را روی آخرین نسخه واقعی `COMMIT` شده می‌سنجد.' },
            { token: 'RETURNING balance_cents', meaning: 'اگر هیچ ردیفی برنگشت، کد بک‌اند `ROLLBACK` زده و `409 Insufficient Funds` می‌دهد.' }
          ]
        }
      ],
      warStory: {
        title: 'استفاده ۳۰ باره از یک کد تخفیف یک‌بارمصرف در کمپین فروش',
        symptom: 'کد تخفیف ۵۰۰ هزار تومانی با محدودیت ۱ بار استفاده در `store.example.com` توسط یک کاربر ۲۰ بار هم‌زمان استفاده شد.',
        rootCause: 'کد بک‌اند ابتدا `SELECT count(*) FROM redemptions` را می‌خواند و اگر صفر بود تخفیف را اعمال و بعد `INSERT` می‌کرد؛ کاربر ۲۰ درخواست را در یک میلی‌ثانیه با `Promise.all` ارسال کرده بود.',
        preventionRule: 'روی جدول `redemptions` قید `UNIQUE (coupon_id, user_id)` در دیتابیس بگذارید و برای شمارنده‌های محدود از `UPDATE ... WHERE used < max_uses` اتمیک استفاده کنید.'
      },
      deepDive: {
        title: 'چهار سطح ایزولاسیون SQL و پدیده `Write Skew`',
        content: [
          'در سطح `Repeatable Read` (اسنپ‌شات)، دو تراکنش ممکن است روی دو سطر متفاوت بنویسند و هر دو یک شرط مشترک بین چند سطر را نقض کنند (مثلاً دو پزشک کشیک هم‌زمان خودشان را آفلاین کنند چون هر کدام می‌بیند دیگری آنلاین است). این پدیده `Write Skew` نام دارد.',
          'تنها سطح `Serializable` یا قفل صریح روی رکورد والد مشترک می‌تواند `Write Skew` را به طور کامل مهار کند (با آمادگی برای Retry هنگام خطای `40001 serialization_failure`).'
        ],
        takeAway: 'هم‌زمانی روی دیتابیس بدون قفل یا قید یکتایی یک آسیب‌پذیری مالی قطعی است.'
      },
      check: {
        type: 'triage',
        prompt: 'در کد برداشت کیف‌پول، توسعه‌دهنده یک تراکنش `BEGIN` باز کرده، `SELECT ... FOR UPDATE` زده، بعد داخل همان تراکنش یک درخواست `HTTP` به بانک می‌زند (که ۵ ثانیه طول می‌کشد) و سپس `COMMIT` می‌کند. خطر بزرگ این الگو در پروداکشن چیست؟',
        options: [
          { id: 'a', label: 'نگه داشتن قفل سطری و اشغال اتصال دیتابیس در طول تماس شبکه کند باعث پر شدن فوری `Connection Pool` و توقف کل سرویس زیر بار می‌شود', isCorrect: true, feedback: 'دقیقاً! هرگز تماس شبکه بیرونی را داخل تراکنش دیتابیس نگذارید؛ ابتدا در یک تراکنش سریع مبلغ را به وضعیت `pending` رزرو و `COMMIT` کنید، تماس بانکی را خارج از تراکنش بزنید و بعد در تراکنش دوم نهایی یا بازگشت دهید.' },
          { id: 'b', label: '`PostgreSQL` اجازه ارسال درخواست HTTP هنگام باز بودن تراکنش را نمی‌دهد', isCorrect: false, feedback: 'دیتابیس جلوی کد اپ را نمی‌گیرد، اما اتصال و قفل تا اتمام آن ۵ ثانیه مسدود می‌مانند.' },
          { id: 'c', label: 'کاملاً بهترین الگوست و هیچ مشکلی ندارد', isCorrect: false, feedback: 'این یکی از کلاسیک‌ترین عوامل سقوط دیتابیس در سیستم‌های پرداخت است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T10-C03', reason: 'ترکیب `Idempotency Keys` با تراکنش‌های `ACID` برای ایمنی در برابر Retry.' },
        { targetId: 'T10-C04', reason: 'الگوی `Transactional Outbox` برای هماهنگی دیتابیس با سرویس‌های بیرونی بدون قفل طولانی.' }
      ]
    },
    {
      id: 'T09-C03',
      code: 'D03 · T09 · C03',
      domainId: 'D03',
      trackId: 'T09',
      title: 'زیر کاپوت Indexها (B-Tree): چرا یک کوئری بدون ایندکس سرور را می‌خواباند و خواندن `EXPLAIN ANALYZE`',
      subtitle: 'ساختار درخت B-Tree، ایندکس‌های ترکیبی و هنر خواندن نقشه اجرای واقعی دیتابیس.',
      readMinutes: 7,
      difficulty: 'میدانی',
      originStory: [
        'یک اپلیکیشن با ۱٬۰۰۰ کاربر آزمایشی روی لپ‌تاپ در ۲ میلی‌ثانیه کار می‌کند. شش ماه بعد تعداد ردیف‌های جدول سفارش‌ها به ۵ میلیون می‌رسد و ناگهان `CPU` دیتابیس روی ۱۰۰٪ قفل می‌شود و کل سایت می‌خوابد! چرا؟ چون بدون `Index`، دیتابیس برای هر جستجوی ساده ناچار است کل ۵ میلیون ردیف را از اول تا آخر بخواند (`Sequential Scan`).',
        'ساختار `B-Tree` که سال ۱۹۷۰ توسط `Rudolf Bayer` و `Edward McCreight` در بوئینگ اختراع شد، این جستجوی خطی `O(N)` را به ۳ یا ۴ جهش لگاریتمی `O(log N)` کاهش می‌دهد.'
      ],
      mentalModel: {
        paragraphs: [
          'ایندکس `B-Tree` دقیقاً مانند فهرست الفبایی انتهای کتاب است که گره‌های آن با صفحات ۸ کیلوبایتی دیسک هم‌ترازند. اما ایندکس مجانی نیست: هر `INSERT/UPDATE/DELETE` باید تمام ایندکس‌های آن جدول را هم آپدیت کند؛ پس فقط روی ستون‌هایی که واقعاً در `WHERE`, `JOIN` و `ORDER BY` پرمصرف‌اند ایندکس بگذارید.',
          'در ایندکس ترکیبی (`Composite Index`) مثل `(user_id, created_at DESC)`، ترتیب ستون‌ها حیاتی است («قاعده پیشوند چپ» / `Leftmost Prefix`): این ایندکس هم برای جستجو فقط روی `user_id` و هم برای `user_id + created_at` کار می‌کند، اما برای جستجو فقط روی `created_at` کار نمی‌کند! قانون طلایی `ESR` می‌گوید در ایندکس ترکیبی ابتدا ستون‌های تساوی (`Equality`), سپس مرتب‌سازی (`Sort`) و در آخر بازه (`Range`) بیایند.'
        ],
        rulesOfThumb: [
          'هرگز کارایی کوئری را حدس نزنید؛ `EXPLAIN (ANALYZE, BUFFERS)` بزنید و ببینید `Seq Scan` رخ داده یا `Index Scan` و چند صفحه (`Buffers`) خوانده شده است.',
          'روی ستون ایندکس‌شده در `WHERE` تابع نیندازید (`WHERE LOWER(email) = ...` ایندکس معمولی `email` را غیرفعال می‌کند مگر Expression Index بسازید!).',
          'در `PostgreSQL` ساخت ایندکس روی جدول پرترافیک زنده را همیشه با `CREATE INDEX CONCURRENTLY` بزنید تا جدول قفل نشود.'
        ],
        diagram: {
          kind: 'layers',
          caption: 'جستجوی لگاریتمی در درخت متوازن B-Tree (فقط ۳ پرش میان ۱۰ میلیون ردیف)',
          nodes: [
            { label: 'Root Page (در RAM)', sublabel: 'مقایسه کلید -> انتخاب شاخه دقیق' },
            { label: 'Branch Page (Internal Node)', sublabel: 'محدود کردن بازه به چند هزار کلید' },
            { label: 'Leaf Page (مرتب‌شده و متصل)', sublabel: 'اشاره‌گر مستقیم به سطر جدول (Heap) یا Index-Only Scan', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'ساخت ایندکس ترکیبی بدون قفل جدول و تحلیل نقشه اجرا با EXPLAIN ANALYZE',
          language: 'sql',
          code: `-- ساخت ایندکس بدون قفل کردن عملیات نوشتن روی جدول زنده
CREATE INDEX CONCURRENTLY idx_orders_user_created
  ON orders (user_id, created_at DESC);

-- مشاهده زمان واقعی اجرا و تعداد صفحات خوانده‌شده از کش/دیسک
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, total_cents, created_at
FROM orders
WHERE user_id = 4821
ORDER BY created_at DESC
LIMIT 20;`,
          explanations: [
            { token: 'CONCURRENTLY', meaning: 'در `PostgreSQL` جلوی قفل شدن `INSERT/UPDATE` کاربران هنگام ساخت ایندکس روی جدول بزرگ را می‌گیرد.' },
            { token: 'BUFFERS', meaning: 'تعداد صفحات `shared hit` (از رم) و `read` (از دیسک) را نشان می‌دهد؛ بهترین معیار واقعی هزینه کوئری.' }
          ]
        }
      ],
      warStory: {
        title: 'توقف کامل ثبت سفارش‌ها به مدت ۴ دقیقه حین اضافه کردن یک ایندکس',
        symptom: 'مهندس برای رفع کندی صفحه گزارش‌ها دستور ساده `CREATE INDEX idx_orders_status ON orders(status)` را وسط روز روی جدول ۳۰ میلیونی اجرا کرد و کل سایت از دسترس خارج شد.',
        rootCause: 'دستور `CREATE INDEX` بدون `CONCURRENTLY` قفل نوشتن (`SHARE LOCK`) روی کل جدول می‌گیرد و تمام `INSERT`های خرید جدید را پشت صف نگه می‌دارد.',
        preventionRule: 'در پروداکشن `PostgreSQL` ساخت و حذف ایندکس همیشه با `CONCURRENTLY` و تنظیم `lock_timeout` ایمن انجام شود.'
      },
      deepDive: {
        title: 'ایندکس پوششی (`Covering Index / INCLUDE`) و `Partial Index`',
        content: [
          'اگر جدول سفارش‌ها ۱۰ میلیون ردیف دارد اما ۹۹٪ آن‌ها `completed` هستند و سرویس فقط مدام روی ردیف‌های `status = \'pending\'` کار می‌کند، یک `Partial Index` (`WHERE status = \'pending\'`) می‌تواند حجم ایندکس را ۱۰۰ برابر کوچک‌تر و فوق‌سریع کند.',
          'همچنین با اضافه کردن `INCLUDE (total_cents)` دیتابیس بدون مراجعه به خود جدول اصلی، پاسخ را مستقیم از برگ ایندکس (`Index-Only Scan`) برمی‌گرداند.'
        ],
        takeAway: 'یک ایندکس هوشمندانه کوچک، گاهی کارایی معادل ارتقای ۱۰ برابری سرور می‌دهد.'
      },
      check: {
        type: 'triage',
        prompt: 'روی جدول `users` ایندکس روی ستون `email` ساخته‌اید، اما `EXPLAIN ANALYZE` روی کوئری `SELECT * FROM users WHERE LOWER(email) = \'ali@example.com\'` همچنان `Seq Scan` نشان می‌دهد. علت چیست؟',
        options: [
          { id: 'a', label: 'اعمال تابع `LOWER()` روی ستون ایندکس‌شده مانع استفاده از `B-Tree` معمولی می‌شود؛ باید روی `LOWER(email)` ایندکس ساخت یا ایمیل را همیشه با حروف کوچک (`citext`/نرمال‌شده) ذخیره کرد', isCorrect: true, feedback: 'دقیقاً! دیتابیس مقادیر خام `email` را در درخت مرتب کرده و نمی‌داند `LOWER(email)` کجای درخت می‌افتد مگر Expression Index روی `LOWER(email)` ساخته شود.' },
          { id: 'b', label: '`B-Tree` اصلاً روی ستون‌های متنی کار نمی‌کند', isCorrect: false, feedback: '`B-Tree` روی رشته‌های متنی عالی کار می‌کند.' },
          { id: 'c', label: 'باید به جای `SELECT *` فقط `SELECT id` نوشت تا ایندکس فعال شود', isCorrect: false, feedback: 'مشکل در بخش `WHERE LOWER(email)` است نه لیست ستون‌های `SELECT`.' }
        ]
      },
      crossLinks: [
        { targetId: 'T07-C02', reason: 'استفاده از ایندکس `B-Tree` برای پیاده‌سازی `Cursor Pagination` فوق‌سریع.' },
        { targetId: 'T01-C02', reason: 'چرا صفحات پیوسته درخت `B-Tree` با `Cache Locality` و بلوک‌های دیسک هم‌سازند.' }
      ]
    },
    {
      id: 'T09-C04',
      code: 'D03 · T09 · C04',
      domainId: 'D03',
      trackId: 'T09',
      title: 'داستان شگفت‌انگیز SQLite (ناو جنگی آمریکا!) و حالت WAL: چرا کپی خام دیتابیس آن را فاسد می‌کند و SQLite Backup API چیست',
      subtitle: 'پراستفاده‌ترین دیتابیس جهان، قدرت WAL و خطای مرگبار کپی کردن فایل زنده با cp.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در سال ۲۰۰۰ `D. Richard Hipp` مشغول نوشتن نرم‌افزاری برای ناوشکن‌های نیروی دریایی آمریکا بود؛ هر وقت سرور دیتابیس `Informix` دچار خطا می‌شد، ملوان‌ها وسط اقیانوس باید یک ادمین دیتابیس صدا می‌زدند! ریچارد تصمیم گرفت یک موتور SQL کامل بنویسد که بدون هیچ سرور جداگانه‌ای مستقیم داخل خود برنامه و روی یک فایل واحد کار کند.',
        'امروز `SQLite` پراستفاده‌ترین نرم‌افزار دیتابیس در تاریخ بشریت است (روی هر گوشی، مرورگر، هواپیمای ایرباس و میلیون‌ها سرویس تک‌نوده وب)، اما دو تنظیم حیاتی آن یعنی حالت `WAL` و روش درست بکاپ‌گیری اگر نادیده گرفته شوند، فاجعه می‌سازند.'
      ],
      mentalModel: {
        paragraphs: [
          'در حالت پیش‌فرض قدیمی (`Rollback Journal`)، وقتی یک نویسنده می‌نویسد، خواننده‌ها مسدود می‌شوند و خطای آزاردهنده `SQLITE_BUSY: database is locked` رخ می‌دهد. با فعال کردن `PRAGMA journal_mode = WAL;` (`Write-Ahead Logging`)، نوشتن‌ها به انتهای فایل جانبی `app.db-wal` اضافه می‌شوند و خوانندگان هم‌زمان بدون مسدود شدن نسخه سازگار را می‌خوانند.',
          'تله بزرگ پروداکشن: وقتی `WAL` فعال است، دیتابیس شما دیگر فقط یک فایل `app.db` نیست بلکه سه فایل زنده (`app.db`, `app.db-wal`, `app.db-shm`) است! اگر روی دیتابیس زنده دستور `cp app.db backup.db` بزنید، هم ممکن است نیمه‌کاره وسط نوشتن کپی شود و هم تراکنش‌های درون `-wal` جا بمانند و فایل بکاپ کاملاً فاسد (`database disk image is malformed`) شود! همیشه از دستور رسمی `.backup` یا `VACUUM INTO` استفاده کنید.'
        ],
        rulesOfThumb: [
          'تنظیمات طلایی شروع هر اتصال SQLite در پروداکشن: `journal_mode=WAL` + `busy_timeout=5000` + `synchronous=NORMAL` + `foreign_keys=ON` (توجه: کلید خارجی در SQLite به صورت پیش‌فرض خاموش است!).',
          'هرگز از فایل SQLite زنده با `cp`, `scp` یا `tar` بکاپ نگیرید؛ فقط با `sqlite3 app.db ".backup backup.db"` یا `VACUUM INTO`.',
          'SQLite روی یک سرور تک‌نوده با دیسک NVMe می‌تواند ده‌ها هزار خواندن و هزاران نوشتن در ثانیه را بدون تاخیر شبکه پردازش کند.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'معماری حالت WAL در SQLite: خواندن هم‌زمان بدون قفل شدن توسط نویسنده',
          nodes: [
            { label: 'Concurrent Readers', sublabel: 'خواندن هم‌زمان بدون قفل از اسنپ‌شات ثابت' },
            { label: 'Single Writer -> app.db-wal', sublabel: 'درج ترتیبی سریع در فایل WAL', accent: true },
            { label: 'Checkpoint -> app.db', sublabel: 'انتقال دوره‌ای صفحات تاییدشده به فایل اصلی' }
          ]
        }
      },
      lab: [
        {
          title: 'تنظیمات پروداکشن SQLite و بکاپ‌گیری آنلاین بدون فساد داده',
          language: 'bash',
          code: `# تنظیمات پیشنهادی در لحظه باز کردن اتصال اپلیکیشن:
# PRAGMA journal_mode = WAL;
# PRAGMA synchronous = NORMAL;
# PRAGMA busy_timeout = 5000;
# PRAGMA foreign_keys = ON;

# روش ایمن بکاپ آنلاین با SQLite Backup API (یا VACUUM INTO)
sqlite3 /srv/app/data/app.db "VACUUM INTO '/var/backups/app-$(date +%F).db';"
sqlite3 /var/backups/app-$(date +%F).db "PRAGMA integrity_check;"`,
          explanations: [
            { token: 'foreign_keys = ON', meaning: 'باید در ابتدای هر اتصال اجرا شود تا قیدهای کلید خارجی واقعاً اعمال گردند.' },
            { token: 'VACUUM INTO', meaning: 'یک کپی اتمیک، فشرده و سازگار از کل دیتابیس (شامل تراکنش‌های داخل WAL) در فایل مقصد می‌سازد.' },
            { token: 'PRAGMA integrity_check', meaning: 'تایید می‌کند فایل بکاپ کاملاً سالم است (`ok`).' }
          ]
        }
      ],
      warStory: {
        title: 'بکاپ‌های ۶ ماهه غیرقابل استفاده به خاطر `cp` روی SQLite',
        symptom: 'پس از خرابی دیسک سرور `bot.example.com`، ادمین آخرین فایل `app.db` را که هر شب با `rsync` کپی شده بود بازیابی کرد اما SQLite خطای `malformed` داد و ۳ روز داده اخیر نیز گم شده بود.',
        rootCause: 'اسکریپت فقط `app.db` را کپی می‌کرد و فایل `app.db-wal` را جا می‌گذاشت و حین نوشتن زنده کپی گرفته بود.',
        preventionRule: 'بکاپ آنلاین SQLite فقط با `VACUUM INTO` یا `.backup` انجام شود و سپس `PRAGMA integrity_check` روی فایل خروجی اجرا گردد.'
      },
      deepDive: {
        title: 'چرا SQLite یک نویسنده در لحظه دارد و تکثیر زنده (`Litestream`) چیست؟',
        content: [
          'معماری `SQLite` برای سادگی و سرعت، در هر لحظه فقط به یک تراکنش اجازه نوشتن می‌دهد (`Single Writer`). تا زمانی که تراکنش‌ها کوتاه (زیر چند میلی‌ثانیه) باشند، این مدل برای اپلیکیشن‌های کوچک تا متوسط عالی جواب می‌دهد.',
          'ابزارهایی مانند `Litestream` فایل `WAL` را لحظه‌به‌لحظه به `S3` استریم می‌کنند تا حتی اگر کل سرور بسوزد، بازیابی با تاخیر چند ثانیه‌ای (`RPO`) ممکن باشد.'
        ],
        takeAway: 'SQLite اسباب‌بازی نیست؛ اگر با `WAL` و بکاپ درست مدیریت شود یک نیروگاه بی‌دردسر تک‌نوده است.'
      },
      check: {
        type: 'triage',
        prompt: 'یک اسکریپت کران‌جاب برای بکاپ از دیتابیس زنده SQLite (در حالت `WAL`) هر شب `cp /data/app.db /backups/app.db` اجرا می‌کند. چرا این روش خطرناک است؟',
        options: [
          { id: 'a', label: 'هم تغییرات اخیر درون فایل `app.db-wal` از دست می‌رود و هم کپی کردن حین نوشتن می‌تواند فایل بکاپ را فاسد (`malformed`) کند؛ باید از `VACUUM INTO` یا `.backup` استفاده شود', isCorrect: true, feedback: 'دقیقاً! ابزارهای داخلی SQLite قفل خواندن سازگار می‌گیرند و کل `WAL` را درون فایل تمیز مقصد ادغام می‌کنند.' },
          { id: 'b', label: 'دستور `cp` روی فایل‌های بزرگ‌تر از ۱۰۰ مگابایت کار نمی‌کند', isCorrect: false, feedback: 'مشکل از اندازه فایل نیست، از هم‌زمانی نوشتن و ساختار چندفایلی `WAL` است.' },
          { id: 'c', label: 'در حالت `WAL` اصلاً نیازی به بکاپ نیست', isCorrect: false, feedback: '`WAL` برای بازیابی از کرش برق است نه جایگزین بکاپ خارج از سرور!' }
        ]
      },
      crossLinks: [
        { targetId: 'T09-C05', reason: 'معیارهای دقیق تصمیم‌گیری برای زمان مهاجرت از `SQLite` به `PostgreSQL`.' },
        { targetId: 'T16-C03', reason: 'استراتژی بکاپ ۳-۲-۱ و تمرین بازیابی (`Restore Drill`).' }
      ]
    },
    {
      id: 'T09-C05',
      code: 'D03 · T09 · C05',
      domainId: 'D03',
      trackId: 'T09',
      title: 'چه زمانی از SQLite به PostgreSQL مهاجرت کنیم؟ Connection Pooling، MVCC، JSONB و قفل‌های سطری (`SELECT FOR UPDATE`)',
      subtitle: 'معیارهای واقعی عبور به PostgreSQL و بهره‌برداری حرفه‌ای از PgBouncer و قفل‌های دقیق.',
      readMinutes: 6,
      difficulty: 'چالشی',
      originStory: [
        'پروژه `Postgres` سال ۱۹۸۶ توسط `Michael Stonebraker` در دانشگاه برکلی به عنوان جانشین `Ingres` آغاز شد. امروز پس از نزدیک به ۴۰ سال، `PostgreSQL` به سوئیس‌آرمی دنیای داده تبدیل شده است: هم دیتابیس رابطه‌ای با سخت‌گیرانه‌ترین تراکنش‌های `ACID` است، هم با `JSONB` کار دیتابیس سندی را می‌کند و هم با افزونه `pgvector` جستجوی برداری `AI/RAG` انجام می‌دهد!',
        'اما بسیاری از تیم‌ها یا بیش از حد زود پیچیدگی مدیریت Postgres را می‌پذیرند یا بیش از حد دیر روی یک فایل SQLite زیر بار نوشتن هم‌زمان گیر می‌کنند.'
      ],
      mentalModel: {
        paragraphs: [
          'چه زمانی باید از `SQLite` به `PostgreSQL` بروید؟ ۱) وقتی بیش از یک سرور اپلیکیشن هم‌زمان باید روی دیتابیس بنویسند (`Scale-Out`)، ۲) وقتی حجم نوشتن هم‌زمان بالاست و به قفل در سطح **سطر** (`Row-Level Locking`) نیاز دارید نه کل فایل، ۳) وقتی به قابلیت‌هایی مثل `JSONB` ایندکس‌دار، `Full-Text Search`، `SKIP LOCKED` برای صف‌ها یا `Read Replicas` نیاز دارید.',
          'زیر کاپوت `PostgreSQL` هر اتصال جدید یک `OS Process` مجزا (با چند مگابایت رم) می‌سازد! اگر ۱٬۰۰۰ کلاینت یا Lambda هم‌زمان مستقیم وصل شوند، دیتابیس در چند ثانیه می‌خوابد. راه‌حل استاندارد، گذاشتن `Connection Pooler` (مثل `PgBouncer` در حالت `Transaction Pooling`) بین اپلیکیشن‌ها و Postgres است. همچنین `MVCC` با نگهداری نسخه‌های قدیمی سطرها باعث می‌شود خوانندگان و نویسندگان هم را قفل نکنند و `Autovacuum` نسخه‌های مرده را جارو می‌کند.'
        ],
        rulesOfThumb: [
          'تعداد اتصال‌های فعال به `PostgreSQL` را کم نگه دارید (قانون سرانگشتی: حدود ۲ تا ۴ برابر هسته‌های CPU از طریق Pool)؛ اتصال زیاد عملکرد را کم می‌کند نه زیاد!',
          'برای ساخت صف کار مطمئن درون خود Postgres، الگوی `SELECT ... FOR UPDATE SKIP LOCKED` جلوی رقابت Workerها را می‌گیرد.',
          'در `JSONB` از ایندکس `GIN` استفاده کنید، اما ستون‌های پرتکرار و رابطه‌ای را همچنان به شکل ستون معمولی تعریف کنید.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'معماری استاندارد اتصال اپلیکیشن‌های متعدد به PostgreSQL از طریق Connection Pooler',
          nodes: [
            { label: 'App Instances (500 Reqs)', sublabel: 'اتصال‌های سبک کلاینت' },
            { label: 'PgBouncer (Transaction Pool)', sublabel: 'تبدیل ۵۰۰ اتصال به ۳۰ اتصال واقعی', accent: true },
            { label: 'PostgreSQL Engine (MVCC)', sublabel: 'Row Locks · WAL · Autovacuum' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی حرفه‌ای برداشت کار از صف توسط چندین Worker هم‌زمان با SKIP LOCKED',
          language: 'sql',
          code: `BEGIN;

WITH next_job AS (
  SELECT id FROM job_queue
  WHERE status = 'queued' AND run_at <= now()
  ORDER BY run_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
UPDATE job_queue
SET status = 'processing', locked_at = now()
FROM next_job
WHERE job_queue.id = next_job.id
RETURNING job_queue.*;

COMMIT;`,
          explanations: [
            { token: 'FOR UPDATE SKIP LOCKED', meaning: 'اگر Worker دیگری ردیف اول را قفل کرده، معطل نمی‌ماند و بی‌درنگ سراغ ردیف آزاد بعدی می‌رود!' },
            { token: 'RETURNING', meaning: 'کار قفل‌شده و به‌روزرسانی‌شده را در همان یک رفت‌وبرگشت به اپلیکیشن تحویل می‌دهد.' }
          ]
        }
      ],
      warStory: {
        title: 'خطای `FATAL: sorry, too many clients already` در اوج ترافیک',
        symptom: 'با بالا رفتن تعداد کانتینرهای بک‌اند از ۴ به ۲۰ کانتینر در بلک‌فرایدی `shop.example.com`، دیتابیس `PostgreSQL` دیگر هیچ اتصال جدیدی نپذیرفت.',
        rootCause: 'هر کانتینر `pool_size=20` داشت (`20 × 20 = 400` اتصال) در حالی که `max_connections` دیتابیس روی ۱۰۰ بود و هیچ `PgBouncer` میانی وجود نداشت.',
        preventionRule: 'سقف `Connection Pool` هر کانتینر را محاسبه کنید و برای ترافیک مقیاس‌پذیر یا Serverless حتماً `PgBouncer` در حالت `transaction` قرار دهید.'
      },
      deepDive: {
        title: 'چرا `Autovacuum` در PostgreSQL هرگز نباید خاموش شود؟',
        content: [
          'در معماری `MVCC` پُستگرس، وقتی ردیفی را `UPDATE` می‌کنید، نسخه قدیمی آن فوراً پاک نمی‌شود بلکه یک نسخه جدید نوشته و قدیمی «مرده» (`Dead Tuple`) علامت‌گذاری می‌شود تا تراکنش‌های در حال خواندن آسیب نبینند.',
          'فرآیند پس‌زمینه `Autovacuum` فضای سطرهای مرده را بازیافت می‌کند و از فاجعه نادر اما مرگبار `Transaction ID Wraparound` جلوگیری می‌نماید.'
        ],
        takeAway: 'تسلط بر `Connection Pooling`، `MVCC` و قفل سطری، `PostgreSQL` را به یک تانک توقف‌ناپذیر تبدیل می‌کند.'
      },
      check: {
        type: 'triage',
        prompt: 'یک سرویس بدون `PgBouncer` روی `PostgreSQL` با ۴ هسته `CPU` تنظیم `max_connections=2000` دارد تا خطای کمبود اتصال ندهد، اما زیر بار ناگهان `CPU` به ۱۰۰٪ می‌رسد و همه کوئری‌ها کند می‌شوند. راه‌حل اصولی چیست؟',
        options: [
          { id: 'a', label: 'کاهش `max_connections` به عدد معقول و قرار دادن `PgBouncer` (در حالت Transaction Pooling) در جلو تا چند ده اتصال فعال کار ۲٬۰۰۰ کلاینت را نوبت‌دهی کنند', isCorrect: true, feedback: 'دقیقاً! دو هزار پردازش هم‌زمان Postgres سرور ۴ هسته‌ای را در طوفان `Context Switch` و رقابت حافظه غرق می‌کند.' },
          { id: 'b', label: 'افزایش `max_connections` به `10000`', isCorrect: false, feedback: 'این کار وضعیت مصرف رم و رقابت CPU را فاجعه‌بارتر می‌کند.' },
          { id: 'c', label: 'خاموش کردن `Autovacuum`', isCorrect: false, feedback: 'خاموش کردن `Autovacuum` باعث باد کردن جداول (`Table Bloat`) و کندی شدیدتر می‌شود.' }
        ]
      },
      crossLinks: [
        { targetId: 'T01-C03', reason: 'هزینه `Context Switch` وقتی صدها پردازش Postgres هم‌زمان روی ۴ هسته رقابت می‌کنند.' },
        { targetId: 'T19-C04', reason: 'استفاده از `pgvector` در همین `PostgreSQL` برای جستجوی ترکیبی در `RAG`.' }
      ]
    },
    {
      id: 'T09-C06',
      code: 'D03 · T09 · C06',
      domainId: 'D03',
      trackId: 'T09',
      title: 'Migration بدون قطعی با Alembic/Prisma: الگوی Expand-and-Contract و چرا `downgrade` مخرب در پروداکشن ممنوع است',
      subtitle: 'تغییر ساختار جداول میلیونی بدون قفل کردن کل سرویس و با قابلیت بازگشت امن.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'بارها در تاریخ استارتاپ‌ها اتفاق افتاده که یک `ALTER TABLE` ظاهراً بی‌ضرر حین دیپلوی، کل سایت را ۱۵ دقیقه پایین آورده یا یک اسکریپت `downgrade` عجولانه با `DROP COLUMN` داده‌های تازه‌ساخته‌شده مشتریان را برای همیشه پاک کرده است.',
        'مهندسان سیستم‌های ۲۴/۷ الگوی «گسترش و انقباض» (`Expand-and-Contract`) را ابداع کردند تا کد قدیمی و کد جدید بتوانند هم‌زمان روی یک `Schema` کار کنند و تغییر ساختار دیتابیس هرگز با قطعی سرویس همراه نباشد.'
      ],
      mentalModel: {
        paragraphs: [
          'هر زمان نسخه جدید کد را منتشر می‌کنید، در بازه انتقال (یا هنگام نیاز به `Rollback`)، کد نسخه قدیمی و کد نسخه جدید باید هر دو با دیتابیس سازگار باشند! بنابراین تغییر نام یک ستون (`RENAME COLUMN`) یا حذف فوری آن در یک مرحله ممنوع است.',
          'الگوی ۴ مرحله‌ای `Expand-and-Contract`: ۱) `Expand`: ستون جدید را به صورت `NULLABLE` اضافه کنید (فوری و بدون بازنویسی جدول). ۲) `Dual Write & Backfill`: کد جدید در هر دو ستون می‌نویسد و یک اسکریپت دسته‌ای ردیف‌های قدیمی را آرام پر می‌کند. ۳) `Switch Read`: کد فقط از ستون جدید می‌خواند. ۴) `Contract`: پس از اطمینان کامل در انتشار بعدی، ستون قدیمی حذف می‌شود.'
        ],
        rulesOfThumb: [
          'در `PostgreSQL` قبل از هر `ALTER TABLE` در Migration، `SET lock_timeout = \'3s\'` بگذارید تا اگر قفلی منتظر یک کوئری طولانی ماند، صف کل کاربران پشت آن قفل نشود (`Lock Queueing`)!',
          'در پروداکشن هرگز `downgrade` مخرب (`DROP TABLE/COLUMN`) اجرا نکنید؛ همیشه با یک Migration رو به جلو (`Roll Forward`) اصلاح کنید.',
          'برای اضافه کردن `NOT NULL` روی جدول بزرگ در Postgres بدون قفل طولانی، ابتدا `CHECK (col IS NOT NULL) NOT VALID` اضافه و سپس `VALIDATE CONSTRAINT` بزنید.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'چهار گام الگوی Expand-and-Contract برای مهاجرت بدون قطعی',
          nodes: [
            { label: '1. Expand', sublabel: 'افزودن ستون جدید (Nullable) — سازگار با v1 و v2' },
            { label: '2. Dual-Write + Backfill', sublabel: 'پر کردن تدریجی داده‌های قدیم بدون قفل', accent: true },
            { label: '3. Switch Read (v2)', sublabel: 'خواندن کامل از ستون جدید + تایید سلامت' },
            { label: '4. Contract (v3)', sublabel: 'حذف ایمن ستون قدیمی در انتشار جداگانه' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی ایمن افزودن قید NOT NULL و تنظیم lock_timeout در Migration',
          language: 'sql',
          code: `-- جلوگیری از قفل شدن کل ترافیک پشت یک کوئری کند
SET lock_timeout = '3s';

-- گام ۱: افزودن قید بدون اسکن و بدون قفل سنگین
ALTER TABLE users
  ADD CONSTRAINT users_phone_not_null
  CHECK (phone IS NOT NULL) NOT VALID;

-- گام ۲: اعتبارسنجی آنلاین بدون مسدود کردن خواندن و نوشتن کاربران
ALTER TABLE users
  VALIDATE CONSTRAINT users_phone_not_null;`,
          explanations: [
            { token: 'SET lock_timeout', meaning: 'اگر Migration ظرف ۳ ثانیه قفل را نگرفت، خودش شکست می‌خورد تا کل کاربران سایت متوقف نشوند.' },
            { token: 'NOT VALID -> VALIDATE', meaning: 'قفل `AccessExclusive` را به چند میلی‌ثانیه کاهش می‌دهد و اسکن جدول را با قفل سبک انجام می‌دهد.' }
          ]
        }
      ],
      warStory: {
        title: 'فلج شدن سایت توسط زنجیره صف قفل (`Lock Queueing`) هنگام یک Migration ساده',
        symptom: 'اضافه کردن یک ستون ساده به جدول `users` باعث شد کل سایت `app.example.com` ظرف ۱۰ ثانیه از کار بیفتد و تمام کوئری‌های `SELECT` آویزان بمانند.',
        rootCause: 'یک گزارش سنگین ۵ دقیقه‌ای در حال خواندن جدول `users` بود. دستور `ALTER TABLE` برای گرفتن `AccessExclusiveLock` پشت آن گزارش منتظر ماند و تمام `SELECT`های جدید کاربران نیز پشت `ALTER TABLE` صف کشیدند!',
        preventionRule: 'تمام Migrationهای پروداکشن باید `lock_timeout` کوتاه (`2s–5s`) داشته باشند و در صورت شکست، با Retry خودکار در لحظه آرام‌تر تکرار شوند.'
      },
      deepDive: {
        title: 'چه عملیات‌هایی در `PostgreSQL 11+` فوری هستند و کدام‌ها هنوز کل جدول را بازنویسی می‌کنند؟',
        content: [
          'از نسخه ۱۱ به بعد، افزودن ستون با مقدار ثابت (`ADD COLUMN active BOOLEAN DEFAULT true`) دیگر کل جدول را بازنویسی نمی‌کند و در چند میلی‌ثانیه در متادیتا ثبت می‌شود.',
          'اما تغییر نوع ستون (مثل `INT` به `BIGINT` یا `VARCHAR` به نوع دیگر) همچنان کل جدول را قفل و بازنویسی می‌کند؛ پس برای تغییر نوع در جداول بزرگ حتماً از الگوی `Expand-and-Contract` استفاده کنید.'
        ],
        takeAway: 'دیتابیس را طوری تکامل دهید که نسخه فعلی و نسخه قبلی کد همیشه بتوانند کنار هم زنده بمانند.'
      },
      check: {
        type: 'triage',
        prompt: 'می‌خواهید نام ستون `full_name` را در جدول ۱۰ میلیونی `customers` به `display_name` تغییر دهید بدون اینکه سایت حتی یک ثانیه قطع شود و با امکان Rollback سریع کد. کدام رویکرد صحیح است؟',
        options: [
          { id: 'a', label: 'الگوی `Expand-and-Contract`: افزودن `display_name`، هم‌زمان‌نویسی (`Dual Write`) و `Backfill` تدریجی، تغییر خواندن به `display_name` و حذف `full_name` در انتشار بعدی', isCorrect: true, feedback: 'دقیقاً! در هر گام کد قدیمی و جدید هر دو سالم کار می‌کنند و اگر مشکلی پیش بیاید، Rollback کد بدون هیچ خطای ستون ناموجود ممکن است.' },
          { id: 'b', label: 'اجرای مستقیم `ALTER TABLE customers RENAME COLUMN full_name TO display_name` قبل از دیپلوی کد', isCorrect: false, feedback: 'بین لحظه اجرای `RENAME` تا جایگزین شدن کامل کانتینرهای کد جدید، تمام درخواست‌های کد قدیمی با خطای `column full_name does not exist` کرش می‌کنند!' },
          { id: 'c', label: 'حذف جدول و ساخت مجدد آن از صفر', isCorrect: false, feedback: 'واضح است که باعث نابودی کل داده‌های مشتریان می‌شود.' }
        ]
      },
      crossLinks: [
        { targetId: 'T16-C05', reason: 'نقش سازگاری عقب‌رو در چک‌لیست انتشار و `Rollback` واقعی.' },
        { targetId: 'T07-C02', reason: 'الگوی مشابه سازگاری عقب‌رو در تغییرات قرارداد `REST API`.' }
      ]
    }
  ]
};

export default t09;
