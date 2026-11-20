import type { TrackContent } from '../../types/atlas';

const t05: TrackContent = {
  trackId: 'T05',
  chapters: [
    {
      id: 'T05-C01',
      code: 'D02 · T05 · C01',
      domainId: 'D02',
      trackId: 'T05',
      title: 'داستان تولد وب در CERN (تیم برنرز-لی ۱۹۸۹) و چرخه حیات یک صفحه در مرورگر (Parse -> Style -> Layout -> Paint -> Composite)',
      subtitle: 'سفر بایت‌های HTML از سوکت شبکه تا پیکسل‌های نمایشگر در ۶۰ فریم بر ثانیه.',
      readMinutes: 6,
      difficulty: 'مبانی عمیق',
      originStory: [
        'در مارس ۱۹۸۹ `Tim Berners-Lee` در آزمایشگاه فیزیک هسته‌ای `CERN` طرحی نوشت به نام «مدیریت اطلاعات: یک پیشنهاد». هزاران دانشمند از دانشگاه‌های دنیا با کامپیوترهای ناسازگار کار می‌کردند و مستندات گم می‌شدند. مدیر او روی جلد طرح نوشت: «مبهم، اما هیجان‌انگیز»!',
        'یک سال بعد تیم سه قطعه ساده را روی یک کامپیوتر `NeXT` ساخت که جهان را عوض کرد: `URL` (آدرس)، `HTTP` (پروتکل انتقال) و `HTML` (زبان سند). مرورگرهای امروز از همان نمایشگر متن ساده به سیستم‌عامل‌های مینیاتوری با پایپ‌لاین رندر ۶۰ فریم بر ثانیه تبدیل شده‌اند.'
      ],
      mentalModel: {
        paragraphs: [
          'وقتی بایت‌های `HTML` از شبکه می‌رسند، مرورگر یک خط تولید ۵ مرحله‌ای (`Critical Rendering Path`) را اجرا می‌کند: ۱) `Parse` (تبدیل `HTML` به `DOM` و `CSS` به `CSSOM`)، ۲) `Style` (محاسبه استایل نهایی هر عنصر)، ۳) `Layout` (محاسبه مختصات و اندازه جعبه‌ها)، ۴) `Paint` (ترسیم پیکسل‌ها روی لایه‌ها) و ۵) `Composite` (ترکیب نهایی لایه‌ها روی `GPU`).',
          'فایل‌های `CSS` به صورت پیش‌فرض `Render-Blocking` هستند (مرورگر تا `CSSOM` کامل نشود صفحه را نقاشی نمی‌کند تا صفحه بی‌استایل نپرد) و تگ‌های `<script>` معمولی بدون `defer` حتی `HTML Parser` را متوقف می‌کنند (`Parser-Blocking`).'
        ],
        rulesOfThumb: [
          'همیشه اسکریپت‌های غیربحرانی را با `defer` یا `type="module"` بارگذاری کنید تا پارس شدن `HTML` قفل نشود.',
          'برای نمایش روان ۶۰ فریم، کل چرخه کار هر فریم (`JS + Style + Layout + Paint + Composite`) فقط `16.6ms` بودجه زمانی دارد.',
          'کاهش اندازه `CSS` اولیه و حذف منابع مسدودکننده در `<head>` سریع‌ترین راه کاهش زمان صفحه سفید است.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'خط لوله رندر مرورگر (Critical Rendering Path)',
          nodes: [
            { label: '1. Parse', sublabel: 'HTML -> DOM · CSS -> CSSOM' },
            { label: '2. Style', sublabel: 'ساخت Render Tree' },
            { label: '3. Layout', sublabel: 'محاسبه هندسه و موقعیت' },
            { label: '4. Paint', sublabel: 'رسم متن، رنگ و سایه' },
            { label: '5. Composite', sublabel: 'ترکیب لایه‌ها در GPU', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'بارگذاری بهینه منابع در `<head>` بدون مسدود کردن رندر اولیه',
          language: 'html',
          code: `<!-- پیش‌اتصال به سرور فونت برای کاهش تاخیر DNS + TLS -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- ماژول ESM به صورت ذاتی مثل defer عمل می‌کند و HTML را قفل نمی‌کند -->
<script type="module" src="/src/main.tsx"></script>

<!-- بارگذاری ناهمگام اسکریپت تحلیلی غیرضروری -->
<script async src="https://cdn.example.com/metrics.js"></script>`,
          explanations: [
            { token: 'rel="preconnect"', meaning: 'دست‌دهی `DNS/TCP/TLS` را هم‌زمان با پارس `HTML` شروع می‌کند تا هنگام درخواست فونت آماده باشد.' },
            { token: 'type="module"', meaning: 'دانلود به صورت موازی انجام می‌شود و اجرا دقیقاً پس از کامل شدن `DOM`.' }
          ]
        }
      ],
      warStory: {
        title: 'سه ثانیه صفحه کاملاً سفید به خاطر یک تگ اسکریپت در `<head>`',
        symptom: 'صفحه فرود `landing.example.com` روی اینترنت موبایل ۳.۴ ثانیه کاملاً سفید می‌ماند و بعد ناگهان کل صفحه ظاهر می‌شد.',
        rootCause: 'تیم بازاریابی یک تگ `<script src="https://ads.example.com/tag.js"></script>` بدون `async/defer` در بالای `<head>` قرار داده بود؛ سرور بیرونی کند پاسخ می‌داد و `HTML Parser` مرورگر تا دریافت آن متوقف می‌ماند.',
        preventionRule: 'هیچ اسکریپت خارجی بدون `async` یا `defer` اجازه ورود به `<head>` را ندارد و در CI روی `First Contentful Paint` بودجه عملکرد بگذارید.'
      },
      deepDive: {
        title: 'اسکنر پیش‌بارگذاری مرورگر (`Preload Scanner`)',
        content: [
          'مرورگرهای مدرن وقتی `HTML Parser` پشت یک اسکریپت مسدودکننده گیر می‌کند، یک نخ سبک دوم به نام `Preload Scanner` را روی بقیه متن `HTML` می‌دوانند تا تصاویر و فایل‌های `CSS/JS` بعدی را پیشاپیش دانلود کند.',
          'اما اگر آدرس عکس‌ها یا فونت‌ها فقط درون جاوااسکریپت ساخته شوند، `Preload Scanner` آن‌ها را نمی‌بیند و زنجیره دانلود (`Request Waterfall`) طولانی می‌شود.'
        ],
        takeAway: 'هرچه منابع بحرانی صفحه مستقیم‌تر در `HTML` اولیه قابل کشف باشند، صفحه سریع‌تر زنده می‌شود.'
      },
      check: {
        type: 'triage',
        prompt: 'در پنل Performance مرورگر می‌بینید `HTML` در ۱۵۰ میلی‌ثانیه دانلود شده، اما رندر صفحه تا ۲.۱ ثانیه شروع نمی‌شود چون مرورگر منتظر یک فایل `analytics.js` در `<head>` است. کم‌هزینه‌ترین اصلاح چیست؟',
        options: [
          { id: 'a', label: 'افزودن صفت `defer` یا `async` به تگ `<script>` آن فایل', isCorrect: true, feedback: 'دقیقاً! این کار اجازه می‌دهد `HTML Parser` بدون توقف `DOM` را بسازد و صفحه را رندر کند.' },
          { id: 'b', label: 'تبدیل تمام تگ‌های `<div>` به `<span>`', isCorrect: false, feedback: 'نوع تگ‌های بدنه ربطی به مسدود شدن پارس توسط اسکریپت در `<head>` ندارد.' },
          { id: 'c', label: 'افزودن `!important` به تمام فایل‌های CSS', isCorrect: false, feedback: 'این کار تاثیری روی اسکریپت مسدودکننده ندارد.' }
        ]
      },
      crossLinks: [
        { targetId: 'T03-C06', reason: 'نقش `HTTP/2` و `HTTP/3` در دانلود موازی منابع پس از پارس `HTML`.' },
        { targetId: 'T05-C05', reason: 'ارتباط مستقیم این پایپ‌لاین با شاخص‌های `LCP` و `CLS`.' }
      ]
    },
    {
      id: 'T05-C02',
      code: 'D02 · T05 · C02',
      domainId: 'D02',
      trackId: 'T05',
      title: 'DOM، CSSOM و Render Tree: چرا برخی تغییرات CSS باعث Reflow سنگین می‌شوند و چطور انیمیشن ۶۰ فریم بسازیم',
      subtitle: 'اجتناب از Layout Thrashing و سپردن انیمیشن‌ها به لایه GPU Compositor.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در روزهای اول وب موبایل (آیفون ۳ و اندرویدهای اولیه)، اپلیکیشن‌های وب به کندی و لگ شهرت داشتند؛ مهندسان با `jQuery` ویژگی‌های `top` و `left` را در هر فریم انیمیشن عوض می‌کردند و مرورگر مجبور بود تمام درخت `Layout` صفحه را ۶۰ بار در ثانیه از نو محاسبه کند.',
        'وقتی موتورهای مرورگر لایه `GPU Compositor` را معرفی کردند، مشخص شد که اگر فقط `transform` و `opacity` را انیمیشن بدهید، مراحل پرهزینه `Layout` و `Paint` به کلی دور زده می‌شوند و وب می‌تواند مثل اپلیکیشن نیتیو روان باشد.'
      ],
      mentalModel: {
        paragraphs: [
          '`Render Tree` از ترکیب `DOM` و `CSSOM` ساخته می‌شود و فقط گره‌های مرئی را شامل می‌شود (عناصر دارای `display: none` وارد آن نمی‌شوند، اما `visibility: hidden` وارد می‌شوند چون فضا اشغال می‌کنند).',
          'تغییر ویژگی‌های هندسی مثل `width`, `height`, `top`, `margin`, `font-size` کل مرحله `Layout` (`Reflow`) و سپس `Paint` را از نو اجرا می‌کند. بدتر از آن `Layout Thrashing` است: زمانی که درون یک حلقه `for` به صورت متناوب استایل را می‌نویسید و بعد مقدار هندسی مثل `el.offsetHeight` را می‌خوانید و مرورگر را مجبور به `Forced Synchronous Layout` در هر تکرار می‌کنید!'
        ],
        rulesOfThumb: [
          'برای حرکت، بزرگ‌نمایی و محو شدن، فقط و فقط `transform` و `opacity` را انیمیشن کنید؛ هرگز `top/left/width/height` را در انیمیشن تغییر ندهید.',
          'در جاوااسکریپت همه خواندن‌های هندسی (`getBoundingClientRect`) را یکجا انجام دهید و بعد همه نوشتن‌های `DOM` را دسته‌ای اجرا کنید.',
          'از `will-change: transform` به ندرت و فقط برای عنصر واقعاً متحرک استفاده کنید؛ استفاده افراطی از آن `VRAM` موبایل را پر می‌کند.'
        ],
        diagram: {
          kind: 'split',
          caption: 'هزینه تغییر ویژگی‌های مختلف CSS در پایپ‌لاین رندر',
          nodes: [
            { label: 'width / top / margin', sublabel: 'Layout -> Paint -> Composite (سنگین‌ترین)' },
            { label: 'background / color', sublabel: 'Paint -> Composite (متوسط)' },
            { label: 'transform / opacity', sublabel: 'فقط Composite روی GPU (۶۰ فریم روان)', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'حذف Layout Thrashing با جداسازی فاز خواندن و نوشتن',
          language: 'ts',
          code: `// بد: خواندن و نوشتن در هم تنیده -> N بار Forced Reflow
for (const card of cards) {
  const h = card.offsetHeight; // مجبور کردن مرورگر به Layout فوری!
  card.style.marginTop = h + 'px';
}

// خوب: ابتدا همه اندازه‌ها را بخوان، بعد یکجا اعمال کن
const heights = cards.map((card) => card.offsetHeight);
cards.forEach((card, i) => {
  card.style.transform = \`translateY(\${heights[i]}px)\`;
});`,
          explanations: [
            { token: 'offsetHeight', meaning: 'خواندن ویژگی‌های محاسبه‌شده هندسی (`offsetTop`, `clientWidth`, `getBoundingClientRect`) باعث `Flush` فوری صف `Layout` می‌شود.' },
            { token: 'translateY(...)', meaning: 'جابه‌جایی در مرحله `Composite` بدون تکان دادن چیدمان بقیه صفحه.' }
          ]
        }
      ],
      warStory: {
        title: 'افت نرخ فریم به ۱۲fps هنگام باز کردن منوی کشویی موبایل',
        symptom: 'در وب‌اپلیکیشن `shop.example.com` باز شدن منوی فیلتر روی گوشی‌های میان‌رده به شدت تیک می‌زد و حس کندی می‌داد.',
        rootCause: 'انیمیشن منو به جای `transform: translateX()` روی تغییر `right` و `width` نوشته شده بود و در هر فریم کل لیست ۵۰ محصول زیر آن را دوباره `Reflow` می‌کرد.',
        preventionRule: 'تمام Drawerها، Modalها و Toastها را صرفاً با `transform` و `opacity` متحرک کنید.'
      },
      deepDive: {
        title: 'ویژگی `content-visibility: auto` برای اسکرول صفحات بسیار بلند',
        content: [
          'در صفحات مستندات طولانی با هزاران عنصر، مرورگر به صورت پیش‌فرض `Layout` و `Paint` بخش‌های پایین صفحه را هم که هنوز کاربر ندیده انجام می‌دهد.',
          'افزودن `content-visibility: auto` به بخش‌های مستقل صفحه به مرورگر اجازه می‌دهد رندر بخش‌های خارج از دید را تا زمان نزدیک شدن به اسکرول به تعویق بیندازد.'
        ],
        takeAway: 'مرورگر سریع‌ترین کار را زمانی انجام می‌دهد که کار اضافه را اصلاً انجام ندهد.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطی را پیدا کنید که در یک حلقه باعث `Layout Thrashing` (تحمیل Reflow همگام در هر تکرار) می‌شود:',
        lines: [
          { lineNumber: 1, code: 'function alignItems(items: HTMLElement[]) {' },
          { lineNumber: 2, code: '  for (const el of items) {' },
          { lineNumber: 3, code: '    el.style.width = "100%";' },
          { lineNumber: 4, code: '    const rect = el.getBoundingClientRect();', isBug: true },
          { lineNumber: 5, code: '    el.dataset.height = String(rect.height);' },
          { lineNumber: 6, code: '  }' },
          { lineNumber: 7, code: '}' }
        ],
        explanation: 'نوشتن `width` در خط ۳ چیدمان را کثیف می‌کند و خواندن فوری `getBoundingClientRect()` در خط ۴ درون همان حلقه مرورگر را مجبور می‌کند در هر دور کل صفحه را از نو `Layout` کند. باید ابتدا همه `width`ها تنظیم و در حلقه دوم خوانده شوند.'
      },
      crossLinks: [
        { targetId: 'T06-C05', reason: 'چطور `React` با دسته‌بندی تغییرات `Virtual DOM` از دستکاری تکه-تکه `DOM` جلوگیری می‌کند.' },
        { targetId: 'T05-C05', reason: 'نقش `INP` (تأخیر تعامل) در تجربه روان کاربر.' }
      ]
    },
    {
      id: 'T05-C03',
      code: 'D02 · T05 · C03',
      domainId: 'D02',
      trackId: 'T05',
      title: 'معماری Layout مدرن در CSS: Flexbox، CSS Grid، Container Queries و طراحی واقعی Mobile-First',
      subtitle: 'انتخاب دقیق بین چیدمان تک‌بعدی و دوبعدی و ساخت کامپوننت‌هایی که نسبت به ظرف خود واکنش‌گرا هستند.',
      readMinutes: 5,
      difficulty: 'میدانی',
      originStory: [
        'تا اوایل دهه ۲۰۱۰ چیدمان در وب نبردی طاقت‌فرسا با `<table>`ها و `float: left` و هک‌های `clearfix` بود؛ حتی وسط‌چین کردن عمودی یک جعبه ساده به جوک معروف برنامه‌نویسان تبدیل شده بود!',
        'ورود `Flexbox` (برای محور تک‌بعدی) و `CSS Grid` (برای شبکه‌های دوبعدی هم‌زمان) این کابوس را پایان داد و با استاندارد شدن `Container Queries` در سال ۲۰۲۳ بالاخره کامپوننت‌ها می‌توانند بر اساس عرض «کارت والد خودشان» تغییر چیدمان دهند نه فقط عرض کل مرورگر.'
      ],
      mentalModel: {
        paragraphs: [
          'قاعده انتخاب شفاف است: هر زمان چیدمان شما یک ردیف یا یک ستون است (`Navbar`, دکمه‌ها، تراز آیکون و متن)، از `Flexbox` استفاده کنید؛ هر زمان می‌خواهید سطرها و ستون‌ها هم‌زمان با هم تراز باشند (گرید کارت‌ها، لی‌اوت ۲ یا ۳ ستونه صفحه)، از `CSS Grid` بهره ببرید.',
          'طراحی واقعی `Mobile-First` یعنی استایل پایه را بدون `Media Query` برای عرض ۳۹۰ پیکسل تمیز و تک‌ستونه می‌نویسید و سپس با `min-width` (`sm:`, `md:`, `lg:` در Tailwind) فضای اضافی دسکتاپ را با ستون‌های مکمل و سایدبار پر می‌کنید.'
        ],
        rulesOfThumb: [
          'در `Flexbox` و `Grid` از `gap` استفاده کنید نه `margin` روی تک‌تک فرزندان؛ در RTL و چیدمان‌های چندخطی هرگز لبه اضافی تولید نمی‌کند.',
          'وقتی فرزند یک `flex` یا `grid` حاوی متن یا کد طولانی `dir="ltr"` است، حتماً روی آن `min-w-0` بگذارید وگرنه از عرض موبایل بیرون می‌زند و اسکرول افقی می‌سازد!',
          'در موبایل کل ارتفاع عناصر `sticky/fixed` (هدر + نوار پایین) نباید بیش از ۱۵٪ ارتفاع صفحه باشد تا محتوا نفس بکشد.'
        ],
        diagram: {
          kind: 'split',
          caption: 'مرزبندی دقیق ابزارهای Layout در CSS مدرن',
          nodes: [
            { label: 'Flexbox (1D)', sublabel: 'محتوا-محور · یک محور (ردیف یا ستون)' },
            { label: 'CSS Grid (2D)', sublabel: 'چیدمان-محور · کنترل هم‌زمان سطر و ستون', accent: true },
            { label: 'Container Queries', sublabel: 'واکنش‌گرایی کامپوننت بر اساس عرض ظرف والد' }
          ]
        }
      },
      lab: [
        {
          title: 'چیدمان خودکار بدون Media Query با Grid و جلوگیری از Overflow در Flex',
          language: 'css',
          code: `/* گرید هوشمند: هر چقدر جا شد ستون حداقل 280px بساز */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 1rem;
}

/* ترفند حیاتی جلوگیری از سرریز بلوک کد داخل Flexbox */
.flex-reader-column {
  flex: 1 1 0%;
  min-width: 0;
}`,
          explanations: [
            { token: 'minmax(min(280px, 100%), 1fr)', meaning: 'روی صفحه‌های کوچک‌تر از ۲۸۰px هم نمی‌شکند و روی دسکتاپ خودکار چندستونه می‌شود.' },
            { token: 'min-width: 0', meaning: 'مقدار پیش‌فرض `min-width: auto` در Flexbox باعث می‌شود بلوک `pre` عرض ظرف را بشکند؛ `0` این قفل را باز می‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'اسکرول افقی آزاردهنده کل سایت موبایل به خاطر یک بلوک کد طولانی',
        symptom: 'در موبایل `390px` کاربران هنگام خواندن مقالات سایت `docs.example.com` با کشیدن انگشت می‌دیدند کل صفحه به چپ و راست تکان می‌خورد و دکمه‌های هدر بیرون می‌روند.',
        rootCause: 'ستون اصلی مقاله داخل یک ظرف `display: flex` بود بدون `min-w-0`، و یک خط دستور طولانی `curl` داخل `<pre>` عرض ستون را به ۶۲۰ پیکسل کشیده بود.',
        preventionRule: 'همیشه روی ستون‌های محتوای داخل `flex`/`grid` کلاس `min-w-0` و روی `<pre>` ویژگی `overflow-x: auto; max-width: 100%` بگذارید.'
      },
      deepDive: {
        title: 'تفاوت `100vh` و `100dvh` در مرورگرهای موبایل',
        content: [
          'در مرورگرهای `iOS Safari` و `Chrome Mobile` نوار آدرس هنگام اسکرول کوچک و بزرگ می‌شود؛ بنابراین `100vh` قدیمی ثابت می‌ماند و دکمه پایین صفحه را زیر نوار مرورگر پنهان می‌کرد.',
          'واحد جدید `100dvh` (`Dynamic Viewport Height`) خود را دقیقاً با ارتفاع واقعی و زنده قابل‌مشاهده هماهنگ می‌کند.'
        ],
        takeAway: 'جزئیات کوچکی مثل `min-w-0` و `100dvh` تفاوت بین وب‌اپ آماتور و تجربه صیقل‌خورده موبایل است.'
      },
      check: {
        type: 'triage',
        prompt: 'در یک صفحه دو ستونه با `display: flex`، بلوک `<pre class="overflow-x-auto">` داخل ستون اصلی به جای اسکرول داخلی، کل ستون را پهن کرده و صفحه موبایل اسکرول افقی پیدا کرده است. علت و راه‌حل چیست؟',
        options: [
          { id: 'a', label: 'افزودن `min-w-0` به ستون `flex-1` والد، چون پیش‌فرض `min-width: auto` اجازه کوچک شدن زیر عرض محتوا را نمی‌دهد', isCorrect: true, feedback: 'دقیقاً! این یکی از مشهورترین تله‌های CSS Flexbox در صفحات فنی حاوی کد است.' },
          { id: 'b', label: 'حذف `overflow-x-auto` از `<pre>`', isCorrect: false, feedback: 'حذف آن باعث می‌شود کد به هیچ وجه اسکرول نخورد و بیشتر سرریز کند.' },
          { id: 'c', label: 'تبدیل تمام کدها به تصویر PNG', isCorrect: false, feedback: 'تصویر کردن کد قابلیت کپی و دسترس‌پذیری را نابود می‌کند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T05-C04', reason: 'استفاده از `Logical Properties` (`ps-`, `pe-`) برای سازگاری کامل Layout با زبان فارسی RTL.' },
        { targetId: 'T05-C02', reason: 'تاثیر انتخاب الگوی Layout بر سرعت `Reflow` مرورگر.' }
      ]
    },
    {
      id: 'T05-C04',
      code: 'D02 · T05 · C04',
      domainId: 'D02',
      trackId: 'T05',
      title: 'تایپوگرافی، RTL/LTR Bidi در وب فارسی، Logical Properties (`ps-/pe-`) و دسترس‌پذیری (a11y)',
      subtitle: 'حل همیشگی آشفتگی متن دوجهته فارسی/انگلیسی و ساخت رابط کاربری خوانا و قابل استفاده برای همه.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'هر توسعه‌دهنده فارسی‌زبان حداقل یک بار کابوس به هم ریختن پرانتزها، اسلش‌ها و کدهای انگلیسی وسط یک جمله فارسی را تجربه کرده است (مثلاً وقتی `GET /api/v1` وسط پاراگراف RTL تبدیل به `api/v1/ GET` می‌شود!). این باگ تصادفی نیست؛ نتیجه الگوریتم دوجهته یونیکد (`UBA`) هنگام برخورد با کاراکترهای خنثی مثل `/`, `-`, `:` و پرانتزهاست.',
        'در کنار آن، سال‌ها توسعه‌دهندگان برای پشتیبانی RTL مجبور به نوشتن فایل جداگانه `rtl.css` و برعکس کردن دستی تمام `margin-left`ها بودند تا اینکه استاندارد `CSS Logical Properties` (`inline-start` / `inline-end`) بازی را برای همیشه ساده کرد.'
      ],
      mentalModel: {
        paragraphs: [
          'برای مهار کامل متن دوجهته (`Bidi`)، هر عبارت انگلیسی شامل کد، مسیر فایل، دستور ترمینال یا نسخه (`v1.2.0`) باید درون یک تگ با `dir="ltr"` و `unicode-bidi: isolate` (یا تگ `<bdi>`) ایزوله شود تا جهت آن به علائم نگارشی فارسی قبل و بعدش نشت نکند.',
          'در لایه چیدمان، به جای ویژگی‌های فیزیکی (`ml-`, `mr-`, `pl-`, `pr-`, `text-left`) همیشه از ویژگی‌های منطقی (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`) استفاده کنید. همچنین در دسترس‌پذیری (`a11y`) از تگ‌های بومی (`<button>`, `<nav>`, `<main>`, `<label>`) به جای `<div onClick>` استفاده کنید تا ناوبری با کیبورد و صفحه‌خوان‌ها خودکار کار کند.'
        ],
        rulesOfThumb: [
          'متن فارسی نسبت به لاتین حروف کشیده‌تر و نقطه‌گذاری بالا/پایین دارد؛ `line-height` بین `1.8` تا `2.0` خوانایی موبایل را متحول می‌کند.',
          'از `unicode-bidi: isolate` + `dir="ltr"` برای تمام تگ‌های `<code>` وسط متن فارسی استفاده کنید.',
          'هر دکمه آیکونی (بدون متن مرئی) باید `aria-label` دقیق فارسی و اندازه لمسی حداقل `44x44px` داشته باشد.'
        ],
        diagram: {
          kind: 'split',
          caption: 'قانون ایزوله‌سازی Bidi در متن فنی فارسی',
          nodes: [
            { label: 'متن فارسی (dir="rtl")', sublabel: 'جریان طبیعی راست‌به‌چپ + فاصله‌گذاری منطقی ps-/pe-' },
            { label: 'کد و اصطلاح (dir="ltr" + isolate)', sublabel: 'جزیره چپ‌به‌راست — پرانتز و اسلش هرگز جابه‌جا نمی‌شوند', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'استایل استاندارد چیپ کد ایزوله‌شده در متن فارسی و دکمه دسترس‌پذیر',
          language: 'css',
          code: `/* ایزوله‌سازی کامل کد درون پاراگراف فارسی */
.bidi-code {
  direction: ltr;
  unicode-bidi: isolate;
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  padding-inline: 0.4em;
}

/* استفاده از خواص منطقی به جای margin-right / padding-left */
.toc-nested {
  padding-inline-start: 1rem;
  border-inline-start: 1px solid var(--border-hairline);
  text-align: start;
}`,
          explanations: [
            { token: 'unicode-bidi: isolate', meaning: 'دیوار نامرئی دوجهته می‌سازد تا کاراکترهای خنثی مثل `/` و `:` داخل کد با متن فارسی اطراف قاطی نشوند.' },
            { token: 'padding-inline-start', meaning: 'در صفحات `rtl` به طور خودکار معادل `padding-right` و در `ltr` معادل `padding-left` است.' }
          ]
        }
      ],
      warStory: {
        title: 'خوانده شدن اشتباه مسیر خطرناک `rm` توسط کاربران یک مستند فارسی',
        symptom: 'کاربری که مستند نصب یک ابزار فارسی را می‌خواند دستور نمایش‌داده‌شده در پاراگراف را به شکل برعکس دید و مسیر اشتباهی را تایپ کرد.',
        rootCause: 'مسیر `/etc/nginx/sites-enabled` بدون `dir="ltr"` در پاراگراف `rtl` رندر شده بود و اسلش ابتدایی به انتهای عبارت پریده بود.',
        preventionRule: 'همه مسیرها، دستورات CLI، هدرهای HTTP و آدرس‌های IP را به صورت سیستمی (توسط یک کامپوننت مشترک مثل `BidiText`) درون `<code dir="ltr">` رندر کنید.'
      },
      deepDive: {
        title: 'تفاوت `aria-expanded`، `focus-visible` و `prefers-reduced-motion`',
        content: [
          'استفاده از `focus-visible` (به جای `focus`) باعث می‌شود هنگام کلیک با ماوس حلقه آبی مزاحم نیفتد، اما کاربری که با کلید `Tab` در صفحه حرکت می‌کند مکان فوکوس را دقیقاً ببیند.',
          'احترام به مدیاکوئری `prefers-reduced-motion: reduce` نیز برای کاربرانی که دچار سرگیجه حرکتی می‌شوند، انیمیشن‌ها را غیرفعال می‌کند.'
        ],
        takeAway: 'تایپوگرافی دقیق فارسی و دسترس‌پذیری بومی نه تنها اخلاقی‌اند بلکه کیفیت محصول را برای همه کاربران بالاتر می‌برند.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'کدام خط در این کامپوننت React برای یک دکمه بوکمارک هم از نظر دسترس‌پذیری (`a11y`) و هم از نظر ناوبری کیبورد مشکل اساسی دارد؟',
        lines: [
          { lineNumber: 1, code: 'export function BookmarkAction({ onToggle }: { onToggle: () => void }) {' },
          { lineNumber: 2, code: '  return (' },
          { lineNumber: 3, code: '    <div onClick={onToggle} className="p-2 cursor-pointer">', isBug: true },
          { lineNumber: 4, code: '      <BookmarkIcon className="w-5 h-5" />' },
          { lineNumber: 5, code: '    </div>' },
          { lineNumber: 6, code: '  );' },
          { lineNumber: 7, code: '}' }
        ],
        explanation: 'خط ۳ به جای `<button type="button" aria-label="نشان‌گذاری فصل" className="min-h-[44px] min-w-[44px] ...">` از یک `<div>` بدون نقش و بدون برچسب استفاده کرده است؛ بنابراین نه با `Tab/Enter` کار می‌کند و نه صفحه‌خوان‌ها می‌فهمند این کنترل چیست.'
      },
      crossLinks: [
        { targetId: 'T05-C03', reason: 'ترکیب `Logical Properties` با `Flexbox` و `CSS Grid` در چیدمان Mobile-First.' },
        { targetId: 'T05-C01', reason: 'بارگذاری بهینه فونت فارسی `Vazirmatn` بدون کند کردن رندر صفحه.' }
      ]
    },
    {
      id: 'T05-C05',
      code: 'D02 · T05 · C05',
      domainId: 'D02',
      trackId: 'T05',
      title: 'بهینه‌سازی عملکرد وب (Core Web Vitals: LCP, CLS, INP)، Lazy Loading، Code Splitting و کش مرورگر',
      subtitle: 'مهندسی سرعت درک‌شده کاربر از طریق هدرهای Cache-Control، تقسیم باندل و حذف جهش چیدمان.',
      readMinutes: 6,
      difficulty: 'چالشی',
      originStory: [
        'سال‌ها تیم‌های وب با یک معیار گمراه‌کننده یعنی `window.onload` سرعت را می‌سنجیدند؛ اما کاربری که ۳ ثانیه به صفحه سفید خیره شده یا دکمه‌ای که درست لحظه کلیک کردن به خاطر لود شدن یک بنر ۵۰ پیکسل پایین می‌پرد، تجربه‌ای وحشتناک دارد.',
        'گوگل سه شاخص کاربرمحور `Core Web Vitals` را استاندارد کرد: `LCP` (چه وقت محتوای اصلی دیده شد؟)، `CLS` (چقدر صفحه زیر چشم کاربر پرید؟) و `INP` (وقتی کلیک کردم چقدر طول کشید پاسخ بدهد؟).'
      ],
      mentalModel: {
        paragraphs: [
          'برای فتح `LCP` (هدف `< 2.5s`)، باندل اولیه جاوااسکریپت را با `Dynamic import()` (`Code Splitting`) کوچک نگه دارید و تصویر اصلی را هرگز `loading="lazy"` نکنید (بلکه `fetchpriority="high"` بدهید). برای فتح `CLS` (هدف `< 0.1`)، همیشه `width/height` یا `aspect-ratio` تصاویر را مشخص کنید و فونت را با `font-display: swap` لود کنید.',
          'بزرگ‌ترین شتاب‌دهنده بازدیدهای بعدی، کش HTTP است: برای فایل‌های هش‌دار ساخته‌شده توسط Vite (مثل `index-9a2f.js`) هدر `Cache-Control: public, max-age=31536000, immutable` بگذارید، و برای `index.html` هدر `no-cache` تا همیشه آخرین نسخه ارجاع داده شود.'
        ],
        rulesOfThumb: [
          'در همین اپلیکیشن «اطلس مهندسی مدرن» ما ۲۰ فایل Track را با `() => import()` جدا کردیم تا کاربر روی موبایل فقط فصل مورد نظرش را دانلود کند نه کل ۱۲۰ فصل را یکجا!',
          'تصویر بالای صفحه (`Hero`) نباید `loading="lazy"` باشد؛ `Lazy Loading` فقط برای تصاویر پایین صفحه است.',
          'باندل `JS` روی موبایل دو بار هزینه دارد: یک بار دانلود روی شبکه کند و یک بار `Parse + Compile` روی `CPU` ضعیف گوشی.'
        ],
        diagram: {
          kind: 'split',
          caption: 'سه شاخص Core Web Vitals و اهرم مهندسی هر یک',
          nodes: [
            { label: 'LCP < 2.5s (بارگذاری)', sublabel: 'Code Splitting + TTFB سریع + fetchpriority="high"' },
            { label: 'CLS < 0.1 (ثبات بصری)', sublabel: 'ابعاد ثابت تصاویر + رزرو فضای اسکلتون' },
            { label: 'INP < 200ms (واکنش‌پذیری)', sublabel: 'شکستن Long Tasks + سبک نگه داشتن Main Thread', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'سیاست دوگانه Cache-Control برای SPAهای ساخته‌شده با Vite روی Nginx / CDN',
          language: 'nginx',
          code: `# فایل‌های باندل‌شده با هش محتوایی -> کش ۱ ساله تغییرناپذیر
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# نقطه ورود HTML -> همیشه اعتبارسنجی مجدد (ETag) تا نسخه جدید فوری دیده شود
location = /index.html {
  add_header Cache-Control "no-cache";
}`,
          explanations: [
            { token: 'immutable', meaning: 'به مرورگر می‌گوید حتی هنگام رفرش عادی هم نیازی به بررسی مجدد این فایل هش‌دار روی شبکه نیست.' },
            { token: 'no-cache', meaning: 'به معنای «کش نکن» نیست! بلکه یعنی «قبل از استفاده، با `ETag` از سرور بپرس آیا نسخه جدیدتر آمده است (`304 Not Modified`)».' }
          ]
        }
      ],
      warStory: {
        title: 'گیر کردن کاربران روی نسخه خراب سایت به مدت یک هفته پس از انتشار Fix',
        symptom: 'تیم فرانت‌اند باگ حیاتی سبد خرید `shop.example.com` را اصلاح و دیپلوی کرد، اما هزاران کاربر تا روزها همچنان نسخه قدیمی را می‌دیدند.',
        rootCause: 'قانون کش عمومی `max-age=604800` روی کل دامنه (از جمله `index.html`) ست شده بود؛ مرورگرها اصلاً به سرور سر نمی‌زدند تا بفهمند هش فایل `app-new.js` عوض شده است.',
        preventionRule: 'فقط فایل‌های دارای Content Hash (`/assets/*`) را `max-age` طولانی و `immutable` کنید و `index.html` را همیشه `no-cache` نگه دارید.'
      },
      deepDive: {
        title: 'تفاوت `no-cache` و `no-store` در استاندارد `RFC 9111`',
        content: [
          'بسیاری این دو هدر را اشتباه می‌گیرند: `no-store` کش کردن پاسخ را در مرورگر و CDN به طور کامل ممنوع می‌کند (ضروری برای پاسخ‌های حاوی داده بانکی یا توکن محرمانه).',
          'اما `no-cache` پاسخ را ذخیره می‌کند و در درخواست بعدی یک درخواست شرطی سبک (`If-None-Match`) می‌فرستد تا در صورت عدم تغییر فقط یک `304` چندصدبایتی بگیرد.'
        ],
        takeAway: 'کش درست، هم سرعت کاربر را دوچندان می‌کند و هم بار سرور شما را نصف.'
      },
      check: {
        type: 'triage',
        prompt: 'کاربران شکایت دارند هنگام باز کردن مقاله در موبایل، درست لحظه‌ای که می‌خواهند روی دکمه «فهرست» بزنند، تصویر بالای صفحه دیر لود می‌شود و کل متن را ۲۰۰ پیکسل پایین هل می‌دهد. این کدام شاخص را خراب کرده و راه‌حل دقیق چیست؟',
        options: [
          { id: 'a', label: 'شاخص `CLS` خراب شده؛ باید `width/height` یا `aspect-ratio` صریح روی ظرف تصویر گذاشت تا فضا پیشاپیش رزرو شود', isCorrect: true, feedback: 'دقیقاً! رزرو نسبت ابعاد تصویر باعث می‌شود مرورگر قبل از رسیدن بایت‌های عکس، جای دقیق آن را در `Layout` نگه دارد.' },
          { id: 'b', label: 'شاخص `TTFB` خراب شده؛ باید دیتابیس را ارتقا داد', isCorrect: false, feedback: 'پرش چیدمان پس از رندر اولیه نشانه کلاسیک `Cumulative Layout Shift (CLS)` است.' },
          { id: 'c', label: 'باید `loading="lazy"` روی تصویر بالای صفحه اضافه کرد', isCorrect: false, feedback: 'این کار هم `LCP` را بدتر می‌کند و هم بدون ابعاد ثابت، پرش `CLS` را شدیدتر می‌سازد.' }
        ]
      },
      crossLinks: [
        { targetId: 'T06-C06', reason: 'نقش `Vite` و استراتژی‌های `CSR/SSR/SSG` در بهینه‌سازی باندل و سرعت اولیه.' },
        { targetId: 'T03-C06', reason: 'چرا `HTTP/2` تقسیم کد به چانک‌های متعدد (`Code Splitting`) را کارآمد می‌کند.' }
      ]
    },
    {
      id: 'T05-C06',
      code: 'D02 · T05 · C06',
      domainId: 'D02',
      trackId: 'T05',
      title: 'PWA، Service Workerها، Storage مرورگر (`localStorage`, `IndexedDB`, `Cookies`) و ساخت تجربه شبه‌اپلیکیشن',
      subtitle: 'انتخاب حافظه درست سمت کلاینت و استفاده از Service Worker برای کارکرد آفلاین بدون کش فاسد.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'وقتی `Steve Jobs` در سال ۲۰۰۷ اولین آیفون را معرفی کرد، ابتدا اپ‌استوری وجود نداشت و ایده او اجرای اپ‌ها از طریق وب بود. سال‌ها بعد با تسلط اپ‌استورها، مهندسان وب استاندارد `Progressive Web App (PWA)` را با دو ستون کلیدی ساختند: `Web App Manifest` (برای نصب روی صفحه اصلی) و `Service Worker` (یک پروکسی برنامه‌پذیر جاوااسکریپت درون مرورگر).',
        'این معماری اجازه داد ابزارهای مطالعه، یادداشت‌برداری و اپلیکیشن‌های میدانی حتی در مترو یا هواپیما بدون اینترنت فوراً بالا بیایند.'
      ],
      mentalModel: {
        paragraphs: [
          'مرورگر سه انبار اصلی دارد که هرگز نباید به جای هم استفاده شوند: ۱) `Cookies` (~4KB) که در «هر درخواست HTTP» خودکار به سرور فرستاده می‌شوند و با پرچم `HttpOnly` بهترین جای نگهداری توکن سشن هستند؛ ۲) `localStorage` (~5MB، همگام و کلید-مقدار متنی) عالی برای تنظیمات تم، بوکمارک و پیشرفت کاربر (اما در برابر XSS آسیب‌پذیر و برای اسرار ممنوع!)؛ و ۳) `IndexedDB` (ناهمگام، صدها مگابایت، تراکنش‌دار) برای ذخیره اسناد بزرگ، فایل‌ها و دیتای آفلاین.',
          '`Service Worker` در یک نخ جدا از صفحه می‌نشیند و درخواست‌های شبکه را رهگیری می‌کند. دو استراتژی طلایی دارد: `Cache-First` برای فایل‌های هش‌دار تغییرناپذیر و `Network-First` (یا `Stale-While-Revalidate`) برای داده‌های زنده و HTML.'
        ],
        rulesOfThumb: [
          'هیچ‌گاه توکن‌های حساس یا کلیدهای محرمانه را در `localStorage` نگذارید؛ هر اسکریپت `XSS` یک‌خطی آن را می‌خواند.',
          'ذخیره‌سازی در `localStorage` را همیشه داخل `try/catch` بگذارید چون در حالت `Private Mode` قدیمی یا پر شدن سهمیه (`QuotaExceededError`) استثنا می‌دهد.',
          'اگر `Service Worker` را بد پیکربندی کنید و خود فایل `sw.js` را کش طولانی کنید، کاربران ممکن است برای همیشه در نسخه قدیمی گیر بیفتند.'
        ],
        diagram: {
          kind: 'split',
          caption: 'انتخاب صحیح فضای ذخیره‌سازی درون مرورگر',
          nodes: [
            { label: 'HttpOnly Cookie (~4KB)', sublabel: 'ارسال خودکار به سرور · مناسب Session Auth' },
            { label: 'localStorage (~5MB)', sublabel: 'ساده و همگام · مناسب تم، فونت و پیشرفت محلی', accent: true },
            { label: 'IndexedDB (100MB+)', sublabel: 'ناهمگام و ایندکس‌دار · مناسب دیتای حجیم آفلاین' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی امن ذخیره و بازیابی State در localStorage با اعتبارسنجی نسخه',
          language: 'ts',
          code: `const KEY = 'engineering_atlas_v1';

export function safeSave<T>(data: T): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    // مدیریت QuotaExceededError یا مسدود بودن Storage در iframe
    console.warn('Storage write skipped:', err);
    return false;
  }
}`,
          explanations: [
            { token: 'engineering_atlas_v1', meaning: 'نسخه‌گذاری کلید اجازه می‌دهد هنگام تغییر ساختار داده در آینده، مهاجرت تمیز انجام دهید.' },
            { token: 'try / catch', meaning: 'از کرش کل اپلیکیشن React در مرورگرهایی که Storage را محدود کرده‌اند جلوگیری می‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'سفید شدن دائمی اپلیکیشن برای کاربران قدیمی پس از تغییر ساختار `localStorage`',
        symptom: 'بعد از انتشار نسخه ۲ اپلیکیشن `notes.example.com`، کاربران جدید مشکلی نداشتند اما همه کاربران قدیمی با صفحه سفید مواجه شدند.',
        rootCause: 'کد جدید فرض کرده بود `JSON.parse(localStorage.getItem("state")).folders` همیشه آرایه است، اما ساختار نسخه ۱ این کلید را نداشت و در اولین رندر `TypeError` می‌داد.',
        preventionRule: 'داده خوانده‌شده از `localStorage` را مثل ورودی غیرقابل اعتماد کلاینت ببینید: همیشه آن را با یک تابع `sanitize` اعتبارسنجی و با مقادیر پیش‌فرض ترکیب کنید.'
      },
      deepDive: {
        title: 'چرخه حیات `Service Worker` و تله `skipWaiting()`',
        content: [
          'وقتی نسخه جدید `sw.js` دانلود می‌شود، مرورگر به صورت پیش‌فرض آن را در حالت `waiting` نگه می‌دارد تا تمام تب‌های باز نسخه قدیمی بسته شوند و ناهماهنگی فایل‌های JS رخ ندهد.',
          'فراخوانی کورکورانه `self.skipWaiting()` وسط یک تب باز می‌تواند باعث شود تب قدیمی فایل‌های چانک نسخه جدید را بخواهد و خطای `ChunkLoadError` بگیرد؛ الگوی حرفه‌ای نمایش یک اعلان «نسخه جدید آماده است — به‌روزرسانی» است.'
        ],
        takeAway: 'داده محلی و کش آفلاین قدرت فوق‌العاده‌ای می‌دهند، به شرطی که همیشه مسیر مهاجرت و ابطال کش را طراحی کرده باشید.'
      },
      check: {
        type: 'recall',
        question: 'چه تفاوتی بین `Cookies`، `localStorage` و `IndexedDB` وجود دارد و برای ذخیره ۱) توکن احراز هویت، ۲) ترجیح تم روشن/تاریک، و ۳) ۵۰ مگابایت مقاله آفلاین هر کدام را کجا می‌گذارید؟',
        modelAnswer: '۱) توکن احراز هویت در `Cookie` با پرچم‌های `HttpOnly`, `Secure`, `SameSite=Lax` تا از دسترس جاوااسکریپت (`XSS`) خارج باشد. ۲) ترجیح تم در `localStorage` چون سبک، غیرحساس و سریع در لحظه بارگذاری است. ۳) ۵۰ مگابایت مقاله آفلاین در `IndexedDB` چون هم سقف `5MB` فضای `localStorage` را رد می‌کند و هم ناهمگام است و `Main Thread` را قفل نمی‌کند.'
      },
      crossLinks: [
        { targetId: 'T08-C02', reason: 'تحلیل عمیق‌تر خطرات ذخیره `JWT` در `localStorage` در برابر `HttpOnly Cookie`.' },
        { targetId: 'T05-C05', reason: 'ترکیب استراتژی‌های کش مرورگر با `Code Splitting`.' }
      ]
    }
  ]
};

export default t05;
