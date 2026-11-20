import type { TrackContent } from '../../types/atlas';

const t06: TrackContent = {
  trackId: 'T06',
  chapters: [
    {
      id: 'T06-C01',
      code: 'D02 · T06 · C01',
      domainId: 'D02',
      trackId: 'T06',
      title: 'داستان ۱۰ روزه برندن آیک (۱۹۹۵) و موتور V8: کالبدشکافی Call Stack، Heap و Garbage Collection',
      subtitle: 'چطور یک زبان ساخته‌شده در ده روز به موتور JIT فوق‌سریع کروم و Node.js تبدیل شد.',
      readMinutes: 6,
      difficulty: 'مبانی عمیق',
      originStory: [
        'در مه ۱۹۹۵ شرکت `Netscape` زیر فشار رقابت با مایکروسافت تنها ۱۰ روز به `Brendan Eich` فرصت داد تا یک زبان اسکریپتی سبک برای مرورگر بسازد. او ایده‌های عالی از `Scheme` (توابع درجه یک و `Closure`) و `Self` (`Prototype`) را با ظاهر `Java` ترکیب کرد و در ده روز نسخه اول را تحویل داد — همراه با چند عجایب تاریخی که برای حفظ سازگاری وب (`Don\'t break the web`) هنوز زنده‌اند.',
        'انقلاب سرعت سال ۲۰۰۸ با موتور `V8` گوگل (`Lars Bak`) رخ داد: به جای مفسر کند خط‌به‌خط، `V8` کد داغ جاوااسکریپت را در لحظه اجرا به کد ماشین بومی کامپایل (`JIT`) کرد و یک سال بعد `Ryan Dahl` همان موتور را بیرون مرورگر آورد و `Node.js` را خلق کرد.'
      ],
      mentalModel: {
        paragraphs: [
          'موتور `V8` دو ناحیه حافظه اصلی دارد: `Call Stack` (پشته اجرای توابع همگام و مقادیر اولیه مثل عدد و بولین — بسیار سریع و با اندازه محدود که بازگشت بی‌نهایت در آن خطای `Maximum call stack size exceeded` می‌دهد) و `Heap` (فضای پویا برای آبجکت‌ها، آرایه‌ها و `Closure`ها).',
          'جمع‌آورنده زباله (`Garbage Collector`) در V8 «نسلی» (`Generational`) است بر اساس یک مشاهده علمی: «بیشتر اشیا خیلی جوان می‌میرند». اشیای تازه در بخش کوچک `New Space` با الگوریتم سریع `Scavenger` تمیز می‌شوند و فقط اشیایی که زنده بمانند به `Old Space` (با الگوریتم `Mark-Sweep-Compact`) می‌روند. نشت حافظه (`Memory Leak`) زمانی رخ می‌دهد که یک ارجاع فراموش‌شده (مثل `EventListener` یا `setInterval` پاک‌نشده) مانع حذف اشیا از `Heap` می‌شود.'
        ],
        rulesOfThumb: [
          'اشیا را همیشه با شکل و ترتیب کلید یکسان بسازید تا `V8 Hidden Classes (Shapes)` بتواند دسترسی به فیلدها را با سرعت کد `C++` بهینه کند.',
          'در SPAهای طولانی‌مدت و سرورهای `Node.js`، هر `addEventListener` یا `setInterval` بدون پاک‌سازی (`cleanup`) یک نشت حافظه تضمینی است.',
          'عملگر `delete obj.prop` شکل بهینه شیء را در V8 می‌شکند و آن را به دیکشنری کند تبدیل می‌کند؛ در مسیرهای داغ از `undefined` یا `Map` استفاده کنید.'
        ],
        diagram: {
          kind: 'split',
          caption: 'ساختار اجرا و حافظه درون موتور V8',
          nodes: [
            { label: 'Call Stack', sublabel: 'فریم‌های تابع و مقادیر Primitive (LIFO سریع)' },
            { label: 'Memory Heap', sublabel: 'New Space (Scavenger) -> Old Space (Mark-Sweep)', accent: true },
            { label: 'Ignition + TurboFan JIT', sublabel: 'مفسر بایت‌کد -> کامپایل کدهای داغ به ماشین' }
          ]
        }
      },
      lab: [
        {
          title: 'شکار نشت حافظه در Node.js و مقایسه اشیای یک‌شکل برای بهینه‌سازی V8',
          language: 'ts',
          code: `// خوب: شکل ثابت (Monomorphic) -> سریع در V8 TurboFan
interface Point { x: number; y: number; }
function makePoint(x: number, y: number): Point {
  return { x, y };
}

// بد: نشت حافظه در کش بدون سقف اندازه (Unbounded Map)
const leakyCache = new Map<string, string>();
// راه‌حل: استفاده از سقف اندازه (LRU) یا WeakMap برای کلیدهای آبجکتی
const safeMetadata = new WeakMap<object, { visitedAt: number }>();`,
          explanations: [
            { token: 'WeakMap', meaning: 'ارجاع ضعیف نگه می‌دارد؛ به محض اینکه شیء کلید دیگر جایی استفاده نشود، `GC` می‌تواند آن را آزاد کند.' },
            { token: 'node --inspect', meaning: 'اتصال DevTools کروم به سرور Node برای گرفتن `Heap Snapshot` و مقایسه رشد اشیا.' }
          ]
        }
      ],
      warStory: {
        title: 'مرگ ساعتی سرور SSR با خطای `JavaScript heap out of memory`',
        symptom: 'سرویس `Node.js` رندر سمت سرور `portal.example.com` هر ۶ ساعت مصرف رمش خطی بالا می‌رفت تا به ۲ گیگابایت می‌رسید و کرش می‌کرد.',
        rootCause: 'توسعه‌دهنده یک `Map` ماژول‌سطح برای کش کردن پاسخ‌های شخصی هر کاربر ساخته بود بدون هیچ `TTL` یا سقف تعداد آیتم (`Max Size`)؛ میلیون‌ها کلید در `Old Space` انباشته شده بودند.',
        preventionRule: 'هر کش درون‌حافظه‌ای (`In-Memory`) باید سقف تعداد آیتم (`LRU`) و `TTL` داشته باشد؛ هرگز `Map/Array` سراسری بدون حد رشد نسازید.'
      },
      deepDive: {
        title: 'تغییر فاز از `Ignition` به `TurboFan` و `Deoptimization`',
        content: [
          '`V8` ابتدا کد را با مفسر `Ignition` اجرا می‌کند تا صفحه سریع بالا بیاید. هم‌زمان آمار نوع آرگومان‌های توابع را جمع می‌کند؛ اگر تابعی هزار بار با دو عدد صدا زده شود، کامپایلر `TurboFan` کد ماشین اختصاصی عدد می‌سازد.',
          'اگر ناگهان همان تابع را با یک رشته صدا بزنید، `V8` مجبور به `Deoptimization` و بازگشت به مفسر می‌شود؛ به همین دلیل کد تایپ‌شده و یکدست (`TypeScript`) عملاً برای موتور V8 هم سریع‌تر است!'
        ],
        takeAway: 'ثبات نوع داده نه تنها باگ انسانی را کم می‌کند بلکه به کامپایلر JIT کمک می‌کند کد شما را به پرواز درآورد.'
      },
      check: {
        type: 'triage',
        prompt: 'یک سرور `Node.js` بعد از ۳ روز فعالیت بدون افزایش ترافیک، مرتب `FATAL ERROR: Reached heap limit Allocation failed` می‌دهد. بهترین روش علمی برای یافتن منبع نشت حافظه چیست؟',
        options: [
          { id: 'a', label: 'گرفتن دو `Heap Snapshot` به فاصله ۱۵ دقیقه در زمان بار عادی و بررسی اشیایی که در نمای `Comparison` تعدادشان مدام رشد کرده و توسط `GC` آزاد نشده‌اند', isCorrect: true, feedback: 'دقیقاً! روش «Three-Snapshot Technique» بلافاصله نشان می‌دهد کدام آرایه، `Closure` یا `EventListener` در حال انباشت اشیا است.' },
          { id: 'b', label: 'فقط افزایش `--max-old-space-size=16384` و رها کردن مشکل', isCorrect: false, feedback: 'این کار فقط زمان کرش را از ۳ روز به ۲ هفته عقب می‌اندازد و علت نشت را حل نمی‌کند.' },
          { id: 'c', label: 'تبدیل تمام `const`ها به `let`', isCorrect: false, feedback: '`const` و `let` هیچ تفاوتی در جمع‌آوری زباله ندارند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T01-C05', reason: 'رابطه سقف `Heap` موتور V8 با محدودیت `cgroup` و `OOM Killer` لینوکس.' },
        { targetId: 'T06-C03', reason: 'چطور `Closure`ها می‌توانند ناخواسته اشیای بزرگ را در حافظه زنده نگه دارند.' }
      ]
    },
    {
      id: 'T06-C02',
      code: 'D02 · T06 · C02',
      domainId: 'D02',
      trackId: 'T06',
      title: 'قلب تپنده JS: Event Loop، Microtasks (Promises) در برابر Macrotasks و Async/Await بدون باگ',
      subtitle: 'ترتیب دقیق اجرای Promiseها و Timerها و دلیل قفل شدن صفحه با یک حلقه همگام.',
      readMinutes: 7,
      difficulty: 'چالشی',
      originStory: [
        'جاوااسکریپت به عنوان یک زبان «تک‌نخی» (`Single-Threaded`) طراحی شد تا در دستکاری `DOM` مرورگر دچار قفل‌های پیچیده (`Deadlock`) نشود. اما یک سوال بنیادین پیش آمد: اگر فقط یک نخ داریم، وقتی منتظر پاسخ شبکه یا تایمر هستیم چرا کل مرورگر یخ نمی‌زند؟',
        'پاسخ، معماری `Event Loop` بود: عملیات‌های کند (`fetch`, `setTimeout`, `I/O`) به `Web APIs` یا `libuv` سپرده می‌شوند و نخ اصلی بیکار نمی‌ماند؛ وقتی نتیجه آماده شد، کالبک آن در صف قرار می‌گیرد تا به محض خالی شدن `Call Stack` اجرا شود.'
      ],
      mentalModel: {
        paragraphs: [
          'در هر تیک `Event Loop` یک اولویت طلایی حاکم است: به محض خالی شدن `Call Stack`، موتور ابتدا **تمام** صف `Microtasks` (کالبک‌های `.then()`, ادامه‌های `await`, `queueMicrotask`) را تا آخرین دانه تخلیه می‌کند — حتی اگر یک Microtask، Microtask جدیدی بسازد! فقط پس از خالی شدن کامل Microtaskها، نوبت به رندر فریم مرورگر و اجرای «یک» کار از صف `Macrotasks` (`setTimeout`, `setInterval`, رویدادهای کلیک و شبکه) می‌رسد.',
          'کلمات `async/await` جادوی چندنخی نیستند؛ صرفاً پوشش خوانایی روی `Promise` هستند. خط بعد از `await` دقیقاً مانند یک `.then()` وارد صف `Microtask` می‌شود. اما تله بزرگ آن اجرای ترتیبی کارهای مستقل است: دو `await` پشت سر هم زمان را جمع می‌کنند، در حالی که `Promise.all` آن‌ها را موازی اجرا می‌کند!'
        ],
        rulesOfThumb: [
          'کارهای ناهمگام مستقل را به جای `await` پشت‌سرهم، با `Promise.all` یا `Promise.allSettled` موازی کنید.',
          'یک حلقه `for` سنگین ۵۰۰ میلی‌ثانیه‌ای در `Node.js` یا مرورگر کل `Event Loop` را قفل می‌کند (هیچ کلیکی کار نمی‌کند و هیچ درخواست کاربری جواب نمی‌گیرد).',
          'تایمر `setTimeout(fn, 100)` به معنای «دقیقاً بعد از ۱۰۰ms اجرا کن» نیست؛ یعنی «حداقل ۱۰۰ms صبر کن و بعد در صف بگذار».'
        ],
        diagram: {
          kind: 'cycle',
          caption: 'چرخه دقیق اولویت‌بندی در Event Loop جاوااسکریپت',
          nodes: [
            { label: '1. Call Stack', sublabel: 'اجرای کد همگام تا خالی شدن کامل' },
            { label: '2. Microtask Queue', sublabel: 'تخلیه کامل همه Promise / await', accent: true },
            { label: '3. Render (مرورگر)', sublabel: 'Style -> Layout -> Paint (در ۶۰fps)' },
            { label: '4. One Macrotask', sublabel: 'setTimeout / I/O / Click -> بازگشت به ۱' }
          ]
        }
      },
      lab: [
        {
          title: 'مقایسه اجرای ترتیبی در برابر موازی و الگوی امن Promise.allSettled',
          language: 'ts',
          code: `// کند (Waterfall): جمع شدن زمان دو درخواست مستقل (~400ms)
const user = await fetchUser(id);
const orders = await fetchOrders(id);

// سریع (موازی): اجرای هم‌زمان (~200ms)
const [userFast, ordersFast] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
]);

// مقاوم در برابر شکست جزئی: اگر یکی خطا داد بقیه از دست نروند
const results = await Promise.allSettled([sendEmail(), sendPush()]);`,
          explanations: [
            { token: 'Promise.all', meaning: 'همه را هم‌زمان استارت می‌زند و اگر یکی `reject` شود کل آن فوری `reject` می‌شود.' },
            { token: 'Promise.allSettled', meaning: 'منتظر همه می‌ماند و وضعیت `fulfilled` یا `rejected` هر کدام را جداگانه برمی‌گرداند.' }
          ]
        }
      ],
      warStory: {
        title: 'از کار افتادن تمام کاربران Node.js هنگام تولید یک خروجی CSV',
        symptom: 'هر زمان ادمین در پنل `admin.example.com` دکمه دانلود گزارش سالانه را می‌زد، پاسخ‌دهی کل سایت برای همه ۵۰۰ کاربر دیگر به مدت ۸ ثانیه قفل می‌شد.',
        rootCause: 'حلقه همگام پردازش ۱۰۰ هزار ردیف `JSON` به `CSV` و رمزنگاری همگام `pbkdf2Sync` روی همان نخ اصلی `Event Loop` اجرا می‌شد و اجازه نمی‌داد هیچ درخواست `HTTP` دیگری پردازش شود.',
        preventionRule: 'هرگز از توابع `*Sync` در مسیر درخواست سرور استفاده نکنید و کارهای سنگین CPU را به `Worker Threads` یا یک صف `Background Worker` منتقل کنید.'
      },
      deepDive: {
        title: 'گرسنگی `Event Loop` توسط Microtask بازگشتی',
        content: [
          'چون `Event Loop` پیش از رفتن به رندر یا `Macrotask` بعدی صف `Microtask` را تا ته خالی می‌کند، اگر تابعی مدام با `Promise.resolve().then(recurse)` خودش را صدا بزند، صفحه کاملاً یخ می‌زند بدون اینکه حتی خطای `Stack Overflow` بگیرید!',
          'در کارهای بلندمرورگر، شکستن کار به قطعات کوچک با `scheduler.yield()` یا `setTimeout(..., 0)` به مرورگر فرصت نفس کشیدن و پردازش کلیک‌های کاربر (`INP`) را می‌دهد.'
        ],
        takeAway: 'درک صف‌های `Microtask` و `Macrotask` کلید نوشتن کد ناهمگام بدون باگ‌های ترتیبی است.'
      },
      check: {
        type: 'predict',
        prompt: 'خروجی دقیق این قطعه کد در کنسول به چه ترتیبی چاپ می‌شود؟',
        snippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
        options: [
          { id: 'a', label: '`1` -> `2` -> `3` -> `4`', isCorrect: false, feedback: 'کدهای همگام (`1` و `4`) همیشه قبل از کالبک‌های صف اجرا می‌شوند.' },
          { id: 'b', label: '`1` -> `4` -> `3` -> `2`', isCorrect: true, feedback: 'دقیقاً! ابتدا کد همگام (`1`, `4`) تمام می‌شود، سپس صف `Microtask` (`Promise -> 3`) کاملاً تخلیه می‌شود و در نهایت `Macrotask` (`setTimeout -> 2`) اجرا می‌گردد.' },
          { id: 'c', label: '`1` -> `4` -> `2` -> `3`', isCorrect: false, feedback: '`Microtask`ها همیشه بر `Macrotask` (`setTimeout`) اولویت دارند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T07-C04', reason: 'مقایسه مستقیم `Event Loop` در جاوااسکریپت با مدل `asyncio` در پایتون.' },
        { targetId: 'T12-C01', reason: 'شباهت معماری تک‌نخی ناهمگام `Node.js` با حلقه رویداد `Nginx`.' }
      ]
    },
    {
      id: 'T06-C03',
      code: 'D02 · T06 · C03',
      domainId: 'D02',
      trackId: 'T06',
      title: 'Closureها، Prototype، `this` و Immutability: مفاهیمی که کدنویس معمولی را از مهندس جدا می‌کند',
      subtitle: 'منطق زنجیره پروتوتایپ، تله‌های Stale Closure و دلیل اهمیت داده‌های تغییرناپذیر.',
      readMinutes: 6,
      difficulty: 'مبانی عمیق',
      originStory: [
        'بسیاری از برنامه‌نویسانی که از `Java` یا `C++` وارد جاوااسکریپت می‌شوند، کلمه `class` را می‌بینند و گمان می‌کنند وراثت کلاسیک در جریان است؛ اما `class` در جاوااسکریپت صرفاً یک روکش زیبا روی مکانیزم اصیل `Prototype Delegation` است که برندن آیک از زبان `Self` الهام گرفت.',
        'و دقیقاً همین‌طور، قدرت واقعی `React Hooks` و `Middleware`های مدرن تماماً بر دوش مفهوم `Closure` (بستار) استوار است؛ مفهومی که اگر عمیق درکش نکنید، باگ‌های «مقدار کهنه» (`Stale Closure`) ساعت‌ها وقتتان را می‌گیرند.'
      ],
      mentalModel: {
        paragraphs: [
          '`Closure` یعنی هر تابع هنگام تولد، کوله‌پشتی نامرئی از متغیرهای دامنه اطرافش (`Lexical Environment`) را با خود می‌برد؛ حتی وقتی تابع والد تمام شد، تابع داخلی همچنان به آن متغیرها دسترسی زنده دارد. در `React` وقتی یک `setInterval` یا کالبک درون `useEffect` مقدار `count` رندر اول را در کوله‌پشتی خودش حبس می‌کند و هرگز آپدیت نمی‌شود، دچار `Stale Closure` شده‌اید.',
          'مقدار `this` در توابع معمولی بر اساس «محل صدا زده شدن» (`Call Site`) تعیین می‌شود نه محل تعریف، اما `Arrow Function`ها `this` اختصاصی ندارند و آن را از محیط بیرونی به ارث می‌برند. در کنار این‌ها، `Immutability` (تغییر ندادن مستقیم آرایه و شیء موجود، بلکه ساخت نسخه جدید) باعث می‌شود تشخیص تغییر در React با یک مقایسه سریع `Object.is` انجام شود.'
        ],
        rulesOfThumb: [
          'در `React` هنگام آپدیت State وابسته به مقدار قبلی (به‌ویژه در تایمرها و رویدادها)، همیشه از فرم تابعی `setCount(prev => prev + 1)` استفاده کنید تا در دام `Stale Closure` نیفتید.',
          'هرگز `array.push()` یا `obj.x = 2` را مستقیم روی `State` انجام ندهید؛ نسخه جدید بسازید (`[...arr, item]` یا `structuredClone`).',
          'به‌خاطر داشته باشید `{ ...obj }` یک کپی سطحی (`Shallow Copy`) است؛ اشیای تودرتو همچنان ارجاع مشترک دارند.'
        ],
        diagram: {
          kind: 'layers',
          caption: 'زنجیره جستجوی متغیر در Closure و زنجیره Prototype در آبجکت‌ها',
          nodes: [
            { label: 'Inner Function Scope', sublabel: 'ابتدا متغیرهای محلی خودش' },
            { label: 'Captured Lexical Closure', sublabel: 'کوله‌پشتی زنده از متغیرهای تابع والد', accent: true },
            { label: 'Prototype Chain (__proto__)', sublabel: 'Object -> Array.prototype -> Object.prototype -> null' }
          ]
        }
      },
      lab: [
        {
          title: 'ساخت Rate Limiter تمیز با Closure و الگوی آپدیت تغییرناپذیر',
          language: 'ts',
          code: `// کپسوله‌سازی وضعیت خصوصی بدون کلاس و بدون متغیر سراسری با Closure
export function createCounter(initial = 0) {
  let value = initial;
  return {
    inc: () => ++value,
    get: () => value,
  };
}

// آپدیت تغییرناپذیر (Immutable) یک آیتم درون آرایه
const nextChapters = chapters.map((ch) =>
  ch.id === targetId ? { ...ch, completed: true } : ch
);`,
          explanations: [
            { token: 'let value', meaning: 'از بیرون کاملاً غیرقابل دسترس است و فقط از طریق متدهای `inc` و `get` تغییر می‌کند.' },
            { token: 'chapters.map(...)', meaning: 'آرایه جدیدی با ارجاع تازه می‌سازد تا `React` تغییر را فوراً تشخیص دهد.' }
          ]
        }
      ],
      warStory: {
        title: 'دکمه ذخیره که همیشه نسخه ۵ دقیقه پیش فرم را به سرور می‌فرستاد',
        symptom: 'کاربران ادیتور آنلاین `docs.example.com` گزارش دادند میانبر کیبورد `Ctrl+S` تغییرات جدیدشان را ذخیره نمی‌کند اما کلیک روی دکمه ذخیره درست کار می‌کند.',
        rootCause: 'شنونده `keydown` درون `useEffect(..., [])` بدون dependency ثبت شده بود و `Closure` آن برای همیشه به مقدار خالی اولیه `documentText` در لحظه باز شدن صفحه گره خورده بود.',
        preventionRule: 'آرایه وابستگی‌های `useEffect` را صادقانه پر کنید یا آخرین مقدار را از طریق `useRef` همگام‌سازی‌شده بخوانید.'
      },
      deepDive: {
        title: 'چطور `Closure` می‌تواند بدون قصد شما حافظه نشت بدهد؟',
        content: [
          'در موتور `V8`، تمام توابع داخلی که در یک اسکوپ مشترک تعریف شده‌اند یک آبجکت `Context` مشترک دارند. اگر یکی از آن‌ها متغیر غول‌پیکر `hugeBuffer` را لمس کرده و تابع دیگری به عنوان کالبک طولانی‌مدت زنده بماند، ممکن است `hugeBuffer` تا پایان عمر آن کالبک آزاد نشود.',
          'محدود نگه داشتن دامنه متغیرهای حجیم و آزاد کردن ارجاع‌ها پس از اتمام پردازش این نشت پنهان را از بین می‌برد.'
        ],
        takeAway: 'تسلط بر `Closure` و `Immutability` تمام راز و رمز `React` و برنامه‌نویسی تابعی را شفاف می‌کند.'
      },
      check: {
        type: 'predict',
        prompt: 'خروجی حلقه اول (با `var`) در برابر حلقه دوم (با `let`) پس از ۱۰۰ میلی‌ثانیه چیست؟',
        snippet: `for (var i = 0; i < 3; i++) setTimeout(() => console.log('var:', i), 100);
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let:', j), 100);`,
        options: [
          { id: 'a', label: '`var` سه بار عدد `3` چاپ می‌کند، اما `let` به ترتیب `0, 1, 2` چاپ می‌کند', isCorrect: true, feedback: 'دقیقاً! `var` دامنه تابعی دارد و هر سه کالبک به یک متغیر مشترک `i` (که پس از پایان حلقه ۳ شده) اشاره می‌کنند؛ اما `let` برای هر تکرار حلقه یک `Lexical Binding` جدید می‌سازد.' },
          { id: 'b', label: 'هر دو `0, 1, 2` چاپ می‌کنند', isCorrect: false, feedback: 'این تله مشهور `var` در جاوااسکریپت قدیمی است که دقیقاً به همین دلیل `let` در ES6 معرفی شد.' },
          { id: 'c', label: 'هر دو سه بار `3` چاپ می‌کنند', isCorrect: false, feedback: '`let` در هر دور حلقه متغیر مستقل در `Closure` ایجاد می‌کند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T06-C05', reason: 'نقش `Stale Closure` و `Immutability` در رندر مجدد و `Hooks` در React.' },
        { targetId: 'T06-C01', reason: 'نگهداری `Closure Context` در `Heap` موتور V8.' }
      ]
    },
    {
      id: 'T06-C04',
      code: 'D02 · T06 · C04',
      domainId: 'D02',
      trackId: 'T06',
      title: 'چرا TypeScript صنعت وب را فتح کرد؟ Type System، Generics، Narrowing و حذف کلاس بزرگی از باگ‌های Runtime',
      subtitle: 'تایپ‌سیستم ساختاری، Discriminated Unions و تبدیل خطاهای پروداکشن به خطاهای زمان کامپایل.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'با تبدیل شدن وب‌سایت‌های ساده به اپلیکیشن‌های میلیون‌خطی (مثل `Gmail`, `VS Code`, `Figma`), جاوااسکریپت بدون تایپ به یک میدان مین تبدیل شد: تغییر نام یک فیلد در پاسخ API، تا زمانی که کاربر روی یک صفحه پنهان کلیک نمی‌کرد و خطای `Cannot read properties of undefined` نمی‌خورد، کشف نمی‌شد.',
        'در سال ۲۰۱۲ `Anders Hejlsberg` (خالق `C#` و `Turbo Pascal`) در مایکروسافت `TypeScript` را معرفی کرد: ابرمجموعه‌ای از جاوااسکریپت که در زمان اجرا کاملاً پاک می‌شود (`Zero Runtime Overhead`) اما در زمان توسعه، یک محافظ ریاضی دقیق روی کل پروژه می‌کشد.'
      ],
      mentalModel: {
        paragraphs: [
          'برخلاف `Java`، تایپ‌سیستم `TypeScript` «ساختاری» (`Structural Typing`) است: اگر دو شیء شکل و فیلدهای سازگار داشته باشند، هم‌تایپ حساب می‌شوند. قوی‌ترین سلاح `TypeScript` در اپلیکیشن‌های واقعی، `Discriminated Unions` است: مدل‌سازی دقیق وضعیت‌های ممکن (مثل `idle | loading | success | error`) طوری که حالت‌های ناممکن اصلاً قابل نوشتن نباشند!',
          'اما یک حقیقت حیاتی را هرگز فراموش نکنید: `TypeScript` فقط در زمان بیلد وجود دارد! وقتی داده از شبکه (`fetch`), `localStorage` یا ورودی کاربر می‌آید، `as MyType` هیچ چک واقعی در زمان اجرا انجام نمی‌دهد؛ برای مرزهای ورودی باید از `Runtime Validation` (مثل `Zod`) یا `Type Guards` استفاده کنید.'
        ],
        rulesOfThumb: [
          'همیشه `strict: true` را در `tsconfig.json` روشن نگه دارید و `any` را خط قرمز بدانید؛ برای داده‌های نامشخص از `unknown` استفاده و سپس آن را `Narrow` کنید.',
          'با `Discriminated Unions` و چک `never` در `switch` (`Exhaustiveness Checking`) کاری کنید که اگر حالت جدیدی اضافه شد، کامپایلر تک‌تک جاهایی که فراموش کرده‌اید را قرمز کند.',
          'به‌کار بردن `as Type` در واقع یعنی «کامپایلر ساکت شو، من مسئولیت کرش پروداکشن را گردن می‌گیرم».'
        ],
        diagram: {
          kind: 'flow',
          caption: 'مرز اعتبارسنجی TypeScript (زمان کامپایل) در برابر مرز Runtime',
          nodes: [
            { label: 'API / JSON / localStorage', sublabel: 'داده خام unknown در Runtime' },
            { label: 'Zod / Sanitizer Guard', sublabel: 'تایید واقعی شکل داده در اجرا', accent: true },
            { label: 'TypeScript Strict Core', sublabel: 'تضمین کامل در کل کدبیس بدون سربار Runtime' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی Discriminated Union برای حذف حالت‌های ناممکن در UI',
          language: 'ts',
          code: `// به جای سه بولین جداگانه { loading, error, data } که می‌توانند با هم true شوند!
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

function renderStatus(state: AsyncState<string[]>): string {
  switch (state.status) {
    case 'idle': return 'آماده';
    case 'loading': return 'در حال بارگذاری...';
    case 'error': return state.message;
    case 'ready': return \`تعداد: \${state.data.length}\`;
  }
}`,
          explanations: [
            { token: 'status', meaning: 'فیلد متمایزکننده (`Discriminant`) که به کامپایلر اجازه `Narrowing` خودکار در هر شاخه `case` را می‌دهد.' },
            { token: 'AsyncState<T>', meaning: 'یک `Generic` قابل استفاده مجدد برای هر نوع داده در کل پروژه.' }
          ]
        }
      ],
      warStory: {
        title: 'کرش صفحه پرداخت به خاطر `as PaymentResponse` روی داده ناقص API',
        symptom: 'اپلیکیشن کاملاً بدون خطای `tsc` بیلد شده بود، اما روی برخی کارت‌های بانکی صفحه رسید با `TypeError: Cannot read properties of undefined` سفید می‌شد.',
        rootCause: 'توسعه‌دهنده نوشته بود `const res = (await r.json()) as PaymentResponse;` در حالی که API در حالت خطای بانکی فیلد `receipt` را برنمی‌گرداند؛ `TypeScript` در Runtime وجود نداشت که این دروغ را بگیرد.',
        preventionRule: 'مرزهای شبکه و Storage را با `unknown` دریافت و پیش از تبدیل به تایپ دامنه، با `Zod` یا تابع اعتبارسنجی بررسی کنید.'
      },
      deepDive: {
        title: 'ابزارهای قدرتمند `Utility Types`: از `Pick/Omit` تا `satisfies`',
        content: [
          'اپراتور مدرن `satisfies` اجازه می‌دهد مطمئن شوید یک آبجکت پیکربندی با یک اینترفیس سازگار است، بدون اینکه نوع دقیق و جزئی کلیدهایش گم شوند (برخلاف `const x: Record<string, ...>`).',
          'ترکیب `readonly` و `as const` نیز جلوی تغییر تصادفی جداول ثابت و مانیفست‌ها را در کل کدبیس می‌گیرد.'
        ],
        takeAway: 'تایپ خوب مستنداتی است که هرگز کهنه نمی‌شود و کامپایلر هر ثانیه آن را تست می‌کند.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطی را پیدا کنید که حفاظت `TypeScript` را دور می‌زند و باعث می‌شود داده نامعتبر سرور بی‌صدا وارد برنامه شود:',
        lines: [
          { lineNumber: 1, code: 'interface User { id: string; email: string; }' },
          { lineNumber: 2, code: 'export async function fetchUser(id: string): Promise<User> {' },
          { lineNumber: 3, code: '  const res = await fetch(`/api/users/${id}`);' },
          { lineNumber: 4, code: '  return (await res.json()) as User;', isBug: true },
          { lineNumber: 5, code: '}' }
        ],
        explanation: 'در خط ۴ علاوه بر چک نکردن `res.ok`، تبدیل زوری `as User` بدون اعتبارسنجی Runtime باعث می‌شود اگر سرور خطای `500` یا بدنه متفاوت برگرداند، شیء خراب به اسم `User` در کل اپلیکیشن پخش شود.'
      },
      crossLinks: [
        { targetId: 'T07-C05', reason: 'اعتبارسنجی واقعی در مرز ورودی با `Zod` و `Pydantic`.' },
        { targetId: 'T19-C02', reason: 'استفاده از `JSON Schema` و `Zod` برای ایمن کردن خروجی‌های احتمالی `LLM`.' }
      ]
    },
    {
      id: 'T06-C05',
      code: 'D02 · T06 · C05',
      domainId: 'D02',
      trackId: 'T06',
      title: 'فلسفه React: از Virtual DOM و Reconciliation تا Hooks، قوانین اثر جانبی (`useEffect`) و جلوگیری از Re-render اضافه',
      subtitle: 'مدل ذهنی UI به عنوان تابعی از State و دام‌های رایج useEffect و کلیدهای لیست.',
      readMinutes: 7,
      difficulty: 'میدانی',
      originStory: [
        'در سال ۲۰۱۱ تیم فیسبوک درگیر یک باگ آزاردهنده در آیکون شمارنده پیام‌های چت بود: وضعیت در پنج جای مختلف `DOM` به صورت دستی با کدهای دستوری (`Imperative`) دستکاری می‌شد و همیشه یکی از آن‌ها از همگام‌سازی جا می‌ماند. `Jordan Walke` ایده انقلابی `React` را آورد: به جای اینکه بگویی «چطور DOM را تغییر بده»، فقط بگو «UI برای این State باید چه شکلی باشد» (`UI = f(state)`).',
        'در سال ۲۰۱۹ نیز `Hooks` جایگزین کلاس‌های پیچیده شدند تا منطق دارای وضعیت به سادگی قابل ترکیب و اشتراک‌گذاری باشد.'
      ],
      mentalModel: {
        paragraphs: [
          'در هر تغییر `State`، ری‌اکت تابع کامپوننت شما را دوباره اجرا می‌کند تا یک درخت سبک جاوااسکریپتی (`React Elements`) بسازد، سپس موتور `Fiber` در مرحله `Reconciliation` آن را با درخت قبلی مقایسه کرده و فقط حداقل تغییرات واقعی را روی `DOM` اعمال می‌کند.',
          'بزرگ‌ترین منبع باگ در پروژه‌های React سوءاستفاده از `useEffect` است! `useEffect` برای محاسبه داده مشتق‌شده (`Derived State`) یا پاسخ به کلیک کاربر نیست؛ فقط برای «همگام‌سازی کامپوننت با یک سیستم بیرونی» (مثل `fetch`, `window.addEventListener`, `localStorage` یا تایمر) است. اگر مقداری از روی `props` یا `state` فعلی محاسبه می‌شود، مستقیم وسط بدنه کامپوننت حسابش کنید!'
        ],
        rulesOfThumb: [
          'هرگز از `index` آرایه به عنوان `key` در لیست‌هایی که فیلتر، مرتب‌سازی یا حذف می‌شوند استفاده نکنید؛ باعث جابه‌جایی وضعیت ورودی‌ها و باگ‌های عجیب می‌شود.',
          'قبل از نوشتن `useEffect` از خود بپرسید: آیا می‌توانم این مقدار را مستقیم هنگام رندر محاسبه کنم یا درون `event handler` بگذارم؟ در ۷۰٪ موارد جواب بله است!',
          'در `useEffect` که درخواست `fetch` می‌فرستد، همیشه با `AbortController` یا پرچم `cancelled` جلوی `Race Condition` (برگشت دیرتر پاسخ قبلی) را بگیرید.'
        ],
        diagram: {
          kind: 'cycle',
          caption: 'جریان تک‌جهته داده (Unidirectional Data Flow) در React',
          nodes: [
            { label: 'State / Props', sublabel: 'منبع واحد حقیقت (Single Source of Truth)' },
            { label: 'Render Function', sublabel: 'تولید درخت React Elements (خالص)' },
            { label: 'Reconciliation (Fiber)', sublabel: 'یافتن کمترین تغییر روی DOM', accent: true },
            { label: 'User Event -> setState', sublabel: 'شروع چرخه بعدی به صورت پیش‌بینی‌پذیر' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی ضد Race-Condition در بارگذاری ناهمگام با useEffect + cleanup',
          language: 'tsx',
          code: `useEffect(() => {
  let cancelled = false;
  setLoading(true);

  loadChapter(chapterId).then((data) => {
    if (!cancelled) {
      setChapter(data);
      setLoading(false);
    }
  });

  return () => {
    cancelled = true; // جلوگیری از بازنویسی فصل جدید توسط پاسخ دیررس فصل قبلی
  };
}, [chapterId]);`,
          explanations: [
            { token: 'return () => { cancelled = true }', meaning: 'تابع پاک‌سازی قبل از اجرای مجدد افکت یا Unmount اجرا می‌شود تا پاسخ قدیمی نادیده گرفته شود.' },
            { token: 'Derived State', meaning: 'مثلاً `const filtered = items.filter(...)` را مستقیم در رندر (یا `useMemo` برای لیست بزرگ) حساب کنید، نه با `useEffect + setFiltered`.' }
          ]
        }
      ],
      warStory: {
        title: 'نمایش اطلاعات مشتری اشتباه روی صفحه پس از کلیک سریع در لیست',
        symptom: 'در پنل پشتیبانی `crm.example.com` اپراتور سریع روی «مشتری الف» و بلافاصله روی «مشتری ب» کلیک می‌کرد؛ اما ۲ ثانیه بعد اطلاعات «مشتری الف» روی پروفایل «مشتری ب» نمایش داده می‌شد!',
        rootCause: 'درخواست اول کندتر برگشته بود و در `useEffect` هیچ `AbortController` یا پرچم لغو وجود نداشت؛ بنابراین پاسخ قدیمی روی پاسخ جدید بازنویسی می‌شد.',
        preventionRule: 'هر `fetch` یا `import()` درون `useEffect` باید تابع پاک‌سازی برای لغو یا نادیده گرفتن پاسخ کهنه داشته باشد.'
      },
      deepDive: {
        title: 'آیا `Virtual DOM` همیشه از دستکاری مستقیم `DOM` سریع‌تر است؟',
        content: [
          'خیر! این یک باور غلط رایج است. `Virtual DOM` یک لایه اضافه است و نمی‌تواند از کد دست‌ساز بهینه شده با `DOM` سریع‌تر باشد؛ مزیت واقعی آن این است که «به اندازه کافی سریع» است در حالی که به شما اجازه می‌دهد کد اعلانی (`Declarative`)، بدون باگ همگام‌سازی و قابل نگهداری بنویسید.',
          'الگوی `State Colocation` (پایین نگه داشتن State در نزدیک‌ترین کامپوننتی که به آن نیاز دارد) خیلی مؤثرتر از پوشاندن کل اپلیکیشن با `React.memo` است.'
        ],
        takeAway: 'ساختار درست State و کامپوننت‌ها مهم‌تر از بهینه‌سازی زودهنگام با `useMemo` است.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'در این کامپوننت لیست کارها، خطی را پیدا کنید که هنگام حذف یا مرتب‌سازی باعث خراب شدن مقدار چک‌باکس‌ها و یادداشت‌های داخل ردیف‌ها می‌شود:',
        lines: [
          { lineNumber: 1, code: 'export function TaskList({ tasks }: { tasks: Task[] }) {' },
          { lineNumber: 2, code: '  return (' },
          { lineNumber: 3, code: '    <ul>' },
          { lineNumber: 4, code: '      {tasks.map((task, idx) => (' },
          { lineNumber: 5, code: '        <TaskRow key={idx} task={task} />', isBug: true },
          { lineNumber: 6, code: '      ))}' },
          { lineNumber: 7, code: '    </ul>' },
          { lineNumber: 8, code: '  );' },
          { lineNumber: 9, code: '}' }
        ],
        explanation: 'خط ۵ از `idx` (اندیس آرایه) به عنوان `key` استفاده کرده است. وقتی آیتم شماره ۰ حذف می‌شود، آیتم ۱ اندیس ۰ می‌گیرد و `React` وضعیت داخلی کامپوننت حذف‌شده را به آیتم جدید می‌چسباند! باید از `key={task.id}` پایدار استفاده شود.'
      },
      crossLinks: [
        { targetId: 'T06-C03', reason: 'جلوگیری از `Stale Closure` در `useEffect` و `Event Handlers`.' },
        { targetId: 'T05-C02', reason: 'تبدیل تغییرات درخت `React` به کمترین `Reflow` در مرورگر.' }
      ]
    },
    {
      id: 'T06-C06',
      code: 'D02 · T06 · C06',
      domainId: 'D02',
      trackId: 'T06',
      title: 'رندرینگ مدرن وب (CSR vs SSR vs SSG vs RSC)، مدیریت State (Server State vs Client State) و ابزارهای Build مثل Vite',
      subtitle: 'انتخاب استراتژی رندر متناسب با محصول و دلیل سرعت خارق‌العاده ESM در Vite.',
      readMinutes: 6,
      difficulty: 'چالشی',
      originStory: [
        'وب در ۲۰ سال گذشته مثل پاندول حرکت کرده است: اول همه‌چیز روی سرور رندر می‌شد (`PHP/Rails`)؛ بعد با `SPA` همه‌چیز به مرورگر (`CSR`) رفت که تجربه نرم‌افزاری عالی داد اما سئو و بارگذاری اولیه را کند کرد؛ سپس `SSR` و `SSG` آمدند و نهایتاً `React Server Components (RSC)` اجازه داد کامپوننت‌های سنگین اصلاً به باندل جاوااسکریپت مرورگر ارسال نشوند.',
        'هم‌زمان در ابزارهای ساخت، `Evan You` با خلق `Vite` (۲۰۲۰) از پشتیبانی بومی `ES Modules` در مرورگرها و کامپایلر `esbuild` استفاده کرد و زمان بالا آمدن سرور توسعه را از ۳۰ ثانیه به زیر ۳۰۰ میلی‌ثانیه رساند.'
      ],
      mentalModel: {
        paragraphs: [
          'هر الگوی رندر جای درست خودش را دارد: `SSG` (تولید در زمان بیلد) عالی برای مستندات، بلاگ و اطلس‌های دانش که روی CDN مثل `Netlify` در چند میلی‌ثانیه سرو می‌شوند؛ `CSR/SPA` عالی برای داشبوردها و ابزارهای تعاملی پشت لاگین؛ `SSR` ضروری برای صفحات پویا با نیاز شدید به `SEO` (مثل صفحات محصول فروشگاه)؛ و `RSC` برای کاهش جاوااسکریپت ارسالی در اپلیکیشن‌های داده‌محور.',
          'در مدیریت State یک تمایز طلایی بین «Client State» (تب فعال، تم، باز بودن مودال) و «Server State» (داده کش‌شده از API که کهنه می‌شود، نیاز به Retry و Refetch دارد) وجود دارد. نگه داشتن `Server State` در ابزارهای تخصصی کش و جدا کردن آن از UI State نیمی از پیچیدگی `Redux`های قدیمی را حذف می‌کند.'
        ],
        rulesOfThumb: [
          'برای سایت‌های محتوایی و راهنماهای تعاملی بدون دیتای خصوصی زنده، بیلد استاتیک روی CDN (`Netlify/Cloudflare Pages`) هم سریع‌ترین، هم ارزان‌ترین و هم تاب‌آورترین معماری است.',
          'در `SSR` هرگز یادتان نرود «Hydration» هزینه دارد: اگر HTML سریع بیاید ولی ۲ مگابایت JS بخواهد صفحه را زنده کند، کاربر روی دکمه‌های مرده کلیک می‌کند.',
          'باندل تولیدی (`npm run build`) را دوره‌ای بررسی کنید تا یک کتابخانه تاریخ یا آیکون اشتباهی ۵۰۰ کیلوبایت به فایل اولیه اضافه نکرده باشد.'
        ],
        diagram: {
          kind: 'split',
          caption: 'مقایسه چهار الگوی رندرینگ مدرن وب',
          nodes: [
            { label: 'CSR / SPA', sublabel: 'رندر کامل در مرورگر · عالی برای اپ تعاملی و آفلاین', accent: true },
            { label: 'SSG (Static)', sublabel: 'تولید در زمان Build · بیشترین سرعت روی CDN' },
            { label: 'SSR + Hydration', sublabel: 'تولید HTML در هر درخواست سرور · SEO پویا' },
            { label: 'RSC (Server Components)', sublabel: 'اجرا فقط روی سرور · صفر کیلوبایت JS سمت کلاینت' }
          ]
        }
      },
      lab: [
        {
          title: 'تقسیم خودکار باندل (Lazy Route / Lazy Data) در Vite و React',
          language: 'ts',
          code: `// Vite این import پویا را به یک فایل JS جداگانه در dist/assets تبدیل می‌کند
const trackLoaders = {
  T01: () => import('./tracks/t01'),
  T02: () => import('./tracks/t02'),
};

export async function getTrack(id: keyof typeof trackLoaders) {
  const mod = await trackLoaders[id]();
  return mod.default;
}`,
          explanations: [
            { token: '() => import(...)', meaning: 'استاندارد `ESM Dynamic Import`؛ `Vite/Rollup` به صورت خودکار آن را در چانک مجزا می‌سازد و فقط هنگام نیاز دانلود می‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'باندل اولیه ۴.۵ مگابایتی که کاربران موبایل را فراری داد',
        symptom: 'وب‌اپ آموزشی `learn.example.com` با ۱۲۰ درس روی لپ‌تاپ توسعه‌دهنده سریع بود اما نرخ خروج کاربران موبایل روی اینترنت 4G به ۶۵٪ رسید.',
        rootCause: 'همه ۱۲۰ درس و کل کتابخانه رسم نمودار به صورت استاتیک در `App.tsx` ایمپورت شده بودند و یک فایل `index.js` چهار و نیم مگابایتی می‌ساختند.',
        preventionRule: 'محتوای سنگین و مسیرهای ثانویه را همیشه با `Dynamic Import` به چانک‌های کوچک بشکنید تا باندل اولیه زیر ۱۵۰ کیلوبایت gzipped بماند.'
      },
      deepDive: {
        title: 'چرا در `Netlify` برای SPA باید `_redirects` (`/* /index.html 200`) گذاشت؟',
        content: [
          'در یک `SPA` با آدرس‌های تمیز مثل `/chapter/T04-C03`، وقتی کاربر روی لینک داخل اپ کلیک می‌کند جاوااسکریپت آدرس را عوض می‌کند و همه چیز کار می‌کند. اما اگر همان لینک را برای دوستش بفرستد یا صفحه را رفرش کند، سرور استاتیک دنبال فایل فیزیکی `/chapter/T04-C03/index.html` می‌گردد و `404` می‌دهد!',
          'قانون `/* /index.html 200` در `netlify.toml` و `public/_redirects` به لبه CDN می‌گوید تمام مسیرهای ناشناخته را با کد ۲۰۰ به `index.html` تحویل بده تا روتر کلاینت فصل دقیق را باز کند.'
        ],
        takeAway: 'اشتراک‌گذاری لینک عمیق (`Deep Linking`) در SPA بدون قانون Fallback سرور در رفرش می‌شکند.'
      },
      check: {
        type: 'triage',
        prompt: 'اپلیکیشن React خود را روی `Netlify` دیپلوی کرده‌اید. صفحه اصلی `/` عالی باز می‌شود و با کلیک به `/chapter/T01-C01` می‌روید، اما به محض زدن `F5` (رفرش) صفحه `404 Page Not Found` می‌آید. راه‌حل چیست؟',
        options: [
          { id: 'a', label: 'افزودن قانون SPA Rewrite (`/* /index.html 200`) در `netlify.toml` و `public/_redirects`', isCorrect: true, feedback: 'دقیقاً! سرور استاتیک باید همه مسیرهای سمت کلاینت را به `index.html` برگرداند تا روتر React آن‌ها را مدیریت کند.' },
          { id: 'b', label: 'ساختن دستی ۱۲۰ فایل HTML جداگانه برای هر فصل', isCorrect: false, feedback: 'برای SPA نیازی به تکثیر دستی فایل‌ها نیست؛ یک خط Rewrite در لبه CDN کل مشکل را حل می‌کند.' },
          { id: 'c', label: 'پاک کردن `localStorage` مرورگر کاربر', isCorrect: false, feedback: 'خطای `404` از سمت سرور استاتیک است و ربطی به `localStorage` ندارد.' }
        ]
      },
      crossLinks: [
        { targetId: 'T05-C05', reason: 'تنظیم هدرهای `Cache-Control` برای چانک‌های ساخته‌شده توسط `Vite`.' },
        { targetId: 'T14-C06', reason: 'اجرای خودکار `npm run build` و انتشار روی CDN از طریق `CI/CD`.' }
      ]
    }
  ]
};

export default t06;
