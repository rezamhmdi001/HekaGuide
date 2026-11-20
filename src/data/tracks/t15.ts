import type { TrackContent } from '../../types/atlas';

const t15: TrackContent = {
  trackId: 'T15',
  chapters: [
    {
      id: 'T15-C01',
      code: 'D04 · T15 · C01',
      domainId: 'D04',
      trackId: 'T15',
      title: 'کانتینر ماشین مجازی نیست! داستان `chroot` (۱۹۷۹)، Linux Namespaces و `cgroups`',
      subtitle: 'کانتینر صرفاً یک پردازش معمولی لینوکس در قفس ایزوله‌شده کرنل است؛ بدون سربار سیستم‌عامل مهمان.',
      readMinutes: 6,
      difficulty: 'مبانی عمیق',
      originStory: [
        'بسیاری تصور می‌کنند `Docker` سال ۲۰۱۳ فناوری کانتینر را اختراع کرد! اما ریشه کانتینرها به سال ۱۹۷۹ و فراخوانی سیستمی `chroot` در `Unix v7` برمی‌گردد که دایرکتوری ریشه `/` یک پردازش را تغییر می‌داد. بین ۲۰۰۲ تا ۲۰۰۸ مهندسان گوگل و لینوکس دو ستون مدرن را به کرنل اضافه کردند: `Namespaces` (جداسازی دید) و `cgroups` (محدودسازی منابع).',
        'نبوغ `Solomon Hykes` و `Docker` در سال ۲۰۱۳ این بود که این قابلیت‌های پیچیده کرنل را همراه با «ایمیج‌های لایه‌ای قابل حمل» (`Dockerfile`) در یک تجربه کاربری جادویی و یک‌دستوری بسته‌بندی کرد.'
      ],
      mentalModel: {
        paragraphs: [
          'یک ماشین مجازی (`VM`) کل یک سخت‌افزار و سیستم‌عامل مهمان کامل (کرنل جدا + چند گیگابایت رم + ۳۰ ثانیه بوت) را شبیه‌سازی می‌کند. اما یک **کانتینر** اصلاً سیستم‌عامل جدیدی بالا نمی‌آورد! صرفاً یک پردازش معمولی روی **همان کرنل هاست** است که دو عینک و محدودیت رویش گذاشته‌اند:',
          '۱) `Linux Namespaces` (چه چیزهایی را **ببیند**): `PID` (فکر می‌کند خودش PID 1 است)، `NET` (کارت شبکه و پورت‌های خودش را دارد)، `MNT` (درخت فایل‌سیستم جداگانه)، `UTS` (هاست‌نیم جدا). ۲) `cgroups` (چقدر منابع **مصرف کند**): سقف سخت `RAM`، سهمیه `CPU` و تعداد پردازش‌ها تا یک کانتینر نتواند کل هاست را از کار بیندازد.'
        ],
        rulesOfThumb: [
          'اگر روی هاست لینوکس دستور `ps aux` بزنید، تمام پردازش‌های درون کانتینرهای داکر را مستقیماً به عنوان پردازش‌های عادی هاست می‌بینید!',
          'چون کانتینرها کرنل هاست را شریک‌اند، ایمیج لینوکسی روی ویندوز/مک در پشت صحنه درون یک `VM` سبک لینوکسی (`WSL2` / `Apple Virtualization`) اجرا می‌شود.',
          'ایزولاسیون کانتینر به اندازه `VM` سخت‌افزاری مطلق نیست؛ برای اجرای کد کاملاً غیرقابل اعتماد (مثل Sandbox اجرای کد کاربران) از میکرو-VM مثل `Firecracker` یا `gVisor` استفاده کنید.'
        ],
        diagram: {
          kind: 'split',
          caption: 'تفاوت بنیادین VM (کرنل مستقل) در برابر Container (کرنل مشترک + قفس کرنل)',
          nodes: [
            { label: 'Virtual Machine (VM)', sublabel: 'Hypervisor -> Guest OS Kernel -> App (سنگین، ایزولاسیون سخت‌افزاری)' },
            { label: 'Linux Container (Docker)', sublabel: 'Host Kernel + Namespaces (دید) + cgroups (منابع) -> App (بوت میلی‌ثانیه‌ای)', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'اثبات اینکه کانتینر صرفاً یک پردازش معمولی روی کرنل هاست است',
          language: 'bash',
          code: `# مشاهده PID واقعی یک کانتینر روی سیستم‌عامل هاست
docker inspect -f '{{.State.Pid}}' my-api

# مشاهده Namespaceهای اختصاص‌یافته به همان پردازش در کرنل
sudo ls -l /proc/$(docker inspect -f '{{.State.Pid}}' my-api)/ns`,
          explanations: [
            { token: '/proc/<pid>/ns', meaning: 'لینک‌های `pid`, `net`, `mnt`, `ipc`, `uts` که مرز ایزولاسیون آن کانتینر را تعریف می‌کنند.' }
          ]
        }
      ],
      warStory: {
        title: 'تلاش برای اجرای سرویس باینری ویندوزی یا معماری ARM روی سرور x86_64',
        symptom: 'توسعه‌دهنده روی مک‌بوک `Apple Silicon (arm64)` ایمیج داکر ساخت و روی سرور اوبونتوی `amd64` بالا آورد؛ کانتینر بلافاصله با `exec format error` کرش کرد.',
        rootCause: 'کانتینر CPU را شبیه‌سازی نمی‌کند بلکه باینری را مستقیم روی CPU و کرنل هاست اجرا می‌کند؛ ایمیج ساخته‌شده برای `linux/arm64` روی پردازنده `linux/amd64` اجرا نمی‌شود.',
        preventionRule: 'ایمیج‌های انتشار را در CI روی معماری هدف (یا با `docker buildx build --platform linux/amd64`) بسازید.'
      },
      deepDive: {
        title: 'نقش `runc` و `containerd` زیر کاپوت Docker',
        content: [
          'امروزه `Docker` فقط رابط کاربری و ابزار بیلد است؛ در لایه پایین‌تر `containerd` ایمیج‌ها را مدیریت می‌کند و `runc` (مطابق استاندارد باز `OCI`) واقعاً `Syscall`های `clone()` و `unshare()` را صدا می‌زند تا کانتینر ساخته شود.'
        ],
        takeAway: 'کانتینر جادو نیست؛ مهندسی هوشمندانه `Namespaces` + `cgroups` + فایل‌سیستم لایه‌ای در کرنل لینوکس است.'
      },
      check: {
        type: 'recall',
        question: 'دو قابلیت کلیدی کرنل لینوکس که کانتینرها را ممکن می‌کنند چه نام دارند و هر کدام دقیقاً چه وظیفه‌ای بر عهده دارد؟',
        modelAnswer: '۱) `Linux Namespaces`: ایزولاسیون و جداسازی «دید» پردازش (درخت پردازش‌های `PID`، کارت شبکه `NET`، فایل‌سیستم `MNT` و هاست‌نیم `UTS` مستقل). ۲) `cgroups (Control Groups)`: محدودسازی و حسابداری «منابع» مصرفی پردازش (سقف `RAM`، سهم `CPU` و `I/O`) تا یک کانتینر نتواند کل منابع هاست را ببلعد.'
      },
      crossLinks: [
        { targetId: 'T01-C06', reason: 'مقایسه لایه‌ای `Bare Metal`، `Hypervisor/VPS` و `Container`.' },
        { targetId: 'T01-C05', reason: 'چطور رسیدن به سقف `RAM` در `cgroup` کانتینر باعث `OOMKilled (Exit 137)` می‌شود.' }
      ]
    },
    {
      id: 'T15-C02',
      code: 'D04 · T15 · C02',
      domainId: 'D04',
      trackId: 'T15',
      title: 'سیستم‌فایل لایه‌ای (OverlayFS)، کش بیلد و هنر نوشتن `Dockerfile` امن (Multi-Stage Builds و `USER 10001` غیر-root)',
      subtitle: 'کوچک‌کردن ایمیج از ۱ گیگابایت به ۴۰ مگابایت و حذف سطح حمله کاربر root درون کانتینر.',
      readMinutes: 7,
      difficulty: 'میدانی',
      originStory: [
        'اولین `Dockerfile`هایی که بیشتر افراد می‌نویسند از یک ایمیج ۱ گیگابایتی کامل شروع می‌شوند، کل کامپایلرها و `devDependencies` را داخل ایمیج نهایی جا می‌گذارند، با هر تغییر یک خط کد دوباره ۵ دقیقه `npm install` می‌کنند، و در نهایت اپلیکیشن را با کاربر `root` (UID 0) اجرا می‌کنند!',
        'سه تکنیک ساده اما متحول‌کننده (`Layer Cache Ordering`, `Multi-Stage Builds` و `Non-Root User`) هم سرعت بیلد را ۱۰ برابر و حجم ایمیج را ۲۰ برابر کمتر می‌کنند و هم امنیت اجرا را به شدت بالا می‌برند.'
      ],
      mentalModel: {
        paragraphs: [
          'هر دستور `FROM`, `COPY`, `RUN` در `Dockerfile` یک لایه فقط‌خواندنی تغییرناپذیر در `OverlayFS` می‌سازد و با هش محتوایی کش می‌شود. قانون طلایی کش بیلد: **چیزهایی که کمتر عوض می‌شوند (نصب پکیج‌ها) بالاتر، و سورس کد که هر ساعت عوض می‌شود پایین‌تر!** بنابراین اول فقط `package.json` و `package-lock.json` را کپی و `npm ci` کنید، بعد بقیه `src/` را کپی نمایید.',
          'در `Multi-Stage Build`، مرحله اول (`AS builder`) کامپایلر TypeScript/Go و تمام ابزارهای بیلد را دارد و خروجی نهایی را می‌سازد؛ مرحله دوم (`FROM node:22-slim` یا `distroless`) فقط فایل‌های خروجی کامپایل‌شده را از مرحله اول برمی‌دارد و با یک کاربر غیر-root (`USER 10001`) اجرا می‌کند؛ بنابراین هیچ کامپایلر، `curl` یا شل غیرضروری در اختیار مهاجم احتمالی نیست.'
        ],
        rulesOfThumb: [
          'همیشه نسخه ایمیج پایه را دقیق پین کنید (`node:22.14-slim` نه `node:latest`) تا بیلد هفته آینده ناگهان تغییر نکند.',
          'در ایمیج نهایی همیشه به یک کاربر غیر-root (`USER 10001`) سوییچ کنید؛ اگر آسیب‌پذیری در برنامه رخ دهد، مهاجم حداقل داخل کانتینر `root` نیست.',
          'فایل‌های موقت نصب (مثل کش `apt`) را در **همان** دستور `RUN` پاک کنید؛ پاک کردن در `RUN` بعدی حجم لایه قبلی را کم نمی‌کند!'
        ],
        diagram: {
          kind: 'flow',
          caption: 'الگوی Multi-Stage Build: ایمیج سنگین بیلد -> ایمیج نهایی کوچک و غیر-root',
          nodes: [
            { label: 'Stage 1: builder', sublabel: 'package.json -> npm ci -> COPY src -> npm run build' },
            { label: 'COPY --from=builder', sublabel: 'فقط آرتیفکت نهایی (dist/ و prod deps)' },
            { label: 'Stage 2: runtime (USER 10001)', sublabel: 'ایمیج کوچک، امن، بدون ابزار بیلد و بدون root', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'نمونه طلایی Multi-Stage Dockerfile امن با کش بهینه و کاربر غیر-root',
          language: 'dockerfile',
          code: `FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && addgroup --gid 10001 app && adduser --uid 10001 --gid 10001 --disabled-password app
COPY --from=builder --chown=10001:10001 /app/dist ./dist
USER 10001:10001
EXPOSE 3000
CMD ["node", "dist/server.js"]`,
          explanations: [
            { token: 'COPY package*.json پیش از COPY src', meaning: 'تا وقتی وابستگی‌ها تغییر نکرده، لایه `npm ci` از کش خوانده می‌شود و بیلد فقط چند ثانیه طول می‌کشد.' },
            { token: 'USER 10001:10001', meaning: 'استفاده از UID عددی باعث می‌شود ابزارهای امنیتی (`Kubernetes runAsNonRoot`) بدون ابهام غیر-root بودن را تایید کنند.' }
          ]
        }
      ],
      warStory: {
        title: 'بیلد ۱۲ دقیقه‌ای CI که کل تیم را کلافه کرده بود',
        symptom: 'هر تغییر یک کلمه‌ای در فایل‌های کد `api.example.com` باعث ۱۲ دقیقه معطلی در بیلد ایمیج داکر می‌شد.',
        rootCause: 'در `Dockerfile` ابتدا `COPY . .` نوشته شده بود و سپس `RUN pip install -r requirements.txt`؛ در نتیجه تغییر هر فایل کدی کش لایه نصب وابستگی‌ها را باطل می‌کرد.',
        preventionRule: 'ابتدا فایل قفل وابستگی‌ها را کپی و نصب کنید و `COPY . .` را همیشه بعد از نصب وابستگی‌ها قرار دهید.'
      },
      deepDive: {
        title: 'ایمیج‌های `Distroless` و `Scratch` برای سرویس‌های Go و Rust',
        content: [
          'برای باینری‌های استاتیک `Go` یا `Rust`، ایمیج نهایی می‌تواند `FROM scratch` (کاملاً خالی، فقط گواهی‌های `ca-certificates` + یک باینری) با حجم زیر ۱۵ مگابایت باشد — نه `/bin/sh` دارد و نه هیچ پکیج سیستم‌عاملی که آسیب‌پذیری `CVE` بگیرد!'
        ],
        takeAway: 'ایمیج کوچکتر یعنی دیپلوی سریع‌تر، دانلود ارزان‌تر و سطح حمله به مراتب کمتر.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطی در این `Dockerfile` پیدا کنید که باعث می‌شود هر بار که یک خط از کد `src/` عوض شود، کل `npm ci` از صفر اجرا شده و کش بیلد بسوزد:',
        lines: [
          { lineNumber: 1, code: 'FROM node:22-slim' },
          { lineNumber: 2, code: 'WORKDIR /app' },
          { lineNumber: 3, code: 'COPY . .', isBug: true },
          { lineNumber: 4, code: 'RUN npm ci' },
          { lineNumber: 5, code: 'RUN npm run build' }
        ],
        explanation: 'خط ۳ کل دایرکتوری شامل `src/` را قبل از `npm ci` کپی کرده است؛ پس با هر ویرایش کوچک در کد، هش لایه ۳ عوض می‌شود و کش لایه ۴ (`npm ci`) باطل می‌گردد. باید اول فقط `COPY package.json package-lock.json ./` و بعد `RUN npm ci` و سپس `COPY . .` بیاید.'
      },
      crossLinks: [
        { targetId: 'T01-C04', reason: 'دلیل استفاده از فرم آرایه‌ای `CMD ["node", ...]` برای دریافت صحیح `SIGTERM`.' },
        { targetId: 'T15-C03', reason: 'تکمیل امنیت این `Dockerfile` با سپر `.dockerignore`.' }
      ]
    },
    {
      id: 'T15-C03',
      code: 'D04 · T15 · C03',
      domainId: 'D04',
      trackId: 'T15',
      title: 'سپر `.dockerignore` و بازرسی لایه‌های ایمیج برای تضمین عدم نفوذ `.env`، کلیدها و دیتابیس به داخل ایمیج',
      subtitle: 'چرا `rm .env` در خط بعدی Dockerfile فایل مخفی را از لایه‌های قبلی ایمیج پاک نمی‌کند.',
      readMinutes: 5,
      difficulty: 'میدانی',
      originStory: [
        'یک سوءتفاهم خطرناک در `OverlayFS` باعث افشای هزاران کلید API روی `Docker Hub` شده است: برنامه‌نویس در خط ۳ می‌نویسد `COPY . .` و در خط ۴ یادش می‌افتد و می‌نویسد `RUN rm -f .env`! او فکر می‌کند فایل پاک شده، اما در فایل‌سیستم لایه‌ای داکر، `rm` فقط یک علامت سفیدپوش (`Whiteout`) در لایه ۴ می‌گذارد؛ کل فایل `.env` همچنان دست‌نخورده درون لایه ۳ ایمیج زنده است و با `docker save` قابل خواندن!',
        'سپر اول و قطعی این فاجعه، فایل `.dockerignore` و بازرسی منظم لایه‌ها قبل از انتشار است.'
      ],
      mentalModel: {
        paragraphs: [
          'وقتی دستور `docker build .` می‌زنید، کلاینت داکر ابتدا کل پوشه فعلی (`Build Context`) را به دیمن ارسال می‌کند. بدون `.dockerignore` نه تنها پوشه ۵۰۰ مگابایتی `node_modules` و `.git` ارسال و کپی می‌شوند، بلکه `.env`، کلیدهای `.pem` و فایل‌های دیتابیس محلی `*.db` نیز به داخل لایه‌های ایمیج تزریق می‌شوند!',
          'قانون طلایی: ایمیج داکر باید ۱۰۰٪ عاری از اسرار (`Secret-Free`) باشد تا بتوان آن را با خیال راحت در رجیستری نگه داشت و بین Staging و Production جابه‌جا کرد؛ اسرار فقط در «زمان اجرا» (`Runtime`) از طریق `env_file`، `Docker Secrets` یا متغیر محیطی تزریق می‌شوند (یا در زمان بیلد فقط با `RUN --mount=type=secret` که هیچ اثری در لایه نمی‌گذارد).'
        ],
        rulesOfThumb: [
          'هر پروژه دارای `Dockerfile` باید بلافاصله کنارش `.dockerignore` شامل `.git`, `node_modules`, `.env*`, `*.pem`, `*.key`, `*.db`, `dist` داشته باشد.',
          'هرگز اسرار را با `ARG` یا `ENV` داخل `Dockerfile` پاس ندهید؛ هر دو در خروجی `docker history` و `docker inspect` کاملاً آشکارند!',
          'با `docker history --no-trunc` یا ابزار `dive` لایه‌های ایمیج خود را بازرسی کنید.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'نقش فیلتر .dockerignore پیش از ساخت لایه‌های تغییرناپذیر ایمیج',
          nodes: [
            { label: 'Project Folder', sublabel: 'src/ · .git/ · .env · node_modules/ · app.db' },
            { label: '.dockerignore Filter', sublabel: 'حذف قاطع .env, .git, *.key, *.db, node_modules', accent: true },
            { label: 'Clean Image Layers', sublabel: 'سریع، سبک و ۱۰۰٪ عاری از اسرار' }
          ]
        }
      },
      lab: [
        {
          title: 'فایل استاندارد .dockerignore و دستور بازرسی نشت اسرار در ایمیج',
          language: 'bash',
          code: `# محتوای ضروری .dockerignore
.git
.gitignore
node_modules
dist
.env
.env.*
*.pem
*.key
*.db
*.sqlite*

# بازرسی تاریخچه لایه‌ها و متغیرهای حک‌شده داخل ایمیج
docker history --no-trunc myapp:v1.0.0
docker run --rm myapp:v1.0.0 ls -la /app`,
          explanations: [
            { token: 'docker history --no-trunc', meaning: 'تمام دستورات و لایه‌های سازنده ایمیج را نشان می‌دهد تا مطمئن شوید هیچ `ARG/ENV` محرمانه‌ای ثبت نشده است.' }
          ]
        }
      ],
      warStory: {
        title: 'نشت پوشه `.git` و `.env` داخل ایمیج عمومی کلاینت',
        symptom: 'مهاجم با دانلود ایمیج یک ابزار CLI از رجیستری، هم کل سورس‌کد تاریخچه گیت و هم کلیدهای سرویس تولیدی را از لایه‌های آن استخراج کرد.',
        rootCause: 'مخزن هیچ فایل `.dockerignore` نداشت و دستور `COPY . .` کل پوشه `.git` و `.env` محلی روی سیستم بیلد را وارد لایه ایمیج کرده بود.',
        preventionRule: 'وجود `.dockerignore` را جزو چک‌لیست هر سرویس قرار دهید و از `COPY src ./src` به جای `COPY . .` کورکورانه استفاده کنید.'
      },
      deepDive: {
        title: 'اگر در حین `docker build` واقعاً به توکن پکیج خصوصی نیاز داریم چه کنیم؟',
        content: [
          'قابلیت مدرن `BuildKit` (`RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci`) فایل توکن را به صورت موقت در حافظه حین اجرای همان یک دستور مانت می‌کند و پس از اتمام `RUN` هیچ ردپایی در هیچ لایه‌ای از ایمیج نهایی باقی نمی‌گذارد.'
        ],
        takeAway: 'هر فایلی که وارد یک لایه ایمیج شد، برای همیشه در آن لایه می‌ماند؛ پس اصلاً اجازه ورودش را ندهید.'
      },
      check: {
        type: 'triage',
        prompt: 'توسعه‌دهنده در `Dockerfile` خط `COPY . .` دارد و برای اینکه `.env` در ایمیج نماند در خط بعدی `RUN rm -f .env` نوشته است. آیا این کار مشکل امنیتی را حل می‌کند؟',
        options: [
          { id: 'a', label: 'خیر! در فایل‌سیستم لایه‌ای (`OverlayFS`)، فایل `.env` همچنان در لایه `COPY` باقی می‌ماند و قابل استخراج است؛ باید با `.dockerignore` از ابتدا مانع ورودش شد', isCorrect: true, feedback: 'دقیقاً! حذف فایل در لایه بعدی فقط آن را در نمای نهایی پنهان می‌کند نه اینکه از لایه قبلی پاک کند.' },
          { id: 'b', label: 'بله، دستور `rm -f` فایل را از تمام لایه‌های قبلی پاک می‌کند', isCorrect: false, feedback: 'لایه‌های قبلی ایمیج تغییرناپذیرند و لایه جدید نمی‌تواند بایت‌های لایه قبلی را پاک کند.' },
          { id: 'c', label: 'بله، به شرطی که با کاربر `root` اجرا شود', isCorrect: false, feedback: 'نوع کاربر تغییری در ماهیت تغییرناپذیر لایه‌های `OverlayFS` نمی‌دهد.' }
        ]
      },
      crossLinks: [
        { targetId: 'T13-C04', reason: 'اصول جامع بهداشت اسرار در مخزن، سرور و لاگ‌ها.' },
        { targetId: 'T15-C02', reason: 'بهینه‌سازی `Multi-Stage Builds` در کنار `.dockerignore`.' }
      ]
    },
    {
      id: 'T15-C04',
      code: 'D04 · T15 · C04',
      domainId: 'D04',
      trackId: 'T15',
      title: 'شبکه‌سازی Docker (`bridge`, `host`, `none`)، پورت‌مَپینگ امن (`127.0.0.1:8000:8000`) و DNS داخلی',
      subtitle: 'ارتباط کانتینرها با نام سرویس و بستن پورت‌های داخلی در برابر اینترنت عمومی.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در روزهای اول داکر، ارتباط دو کانتینر با فلگ قدیمی `--link` و هاردکد کردن آدرس‌های `IP` انجام می‌شد که با هر ری‌استارت عوض می‌شدند! ورود شبکه‌های `User-Defined Bridge` یک سرور `DNS` داخلی روی `127.0.0.11` به هر شبکه داکر داد تا سرویس `api` بتواند به سادگی به `postgres://db:5432` وصل شود.',
        'هم‌زمان درک درست تفاوت `bridge`, `host`, `none` و نحوه انتشار امن پورت‌ها مرز بین یک استقرار تمیز و یک سرور هک‌شده است.'
      ],
      mentalModel: {
        paragraphs: [
          'سه درایور شبکه کلیدی: ۱) `User-Defined Bridge` (پیش‌فرض `docker compose` — بهترین انتخاب): هر پروژه یک شبکه خصوصی ایزوله با `DNS` داخلی دارد که سرویس‌ها یکدیگر را با نام سرویس (مثلاً `redis:6379`) صدا می‌زنند بدون اینکه اصلاً پورتی به بیرون منتشر شود! ۲) `host`: کانتینر کارت شبکه هاست را مستقیم شریک می‌شود (بدون NAT، کمی سریع‌تر اما بدون ایزولاسیون پورت). ۳) `none`: قطع کامل شبکه (عالی برای پردازش فایل‌های مشکوک در Sandbox).',
          'قانون طلایی پورت‌مَپینگ در `docker-compose.yml`: سرویس‌های داخلی (`db`, `redis`, `worker`) **اصلاً بخش `ports:` نداشته باشند**! و سرویس وب (`api`) که پشت `Nginx` روی همان هاست است فقط روی `127.0.0.1:8000:8000` منتشر شود تا `Docker` نتواند آن را روی اینترنت عمومی باز کند.'
        ],
        rulesOfThumb: [
          'بین دو کانتینر در یک شبکه Compose، هرگز `localhost` را برای رسیدن به دیتابیس نزنید! `localhost` داخل هر کانتینر یعنی «خود همان کانتینر»؛ از نام سرویس (مثلاً `db` یا `redis`) استفاده کنید.',
          'برای سرویس‌هایی که نباید به اینترنت دسترسی خروجی هم داشته باشند (مثل دیتابیس)، شبکه‌ای با `internal: true` تعریف کنید.',
          'به‌خاطر داشته باشید `EXPOSE 8000` در `Dockerfile` فقط مستندات است و هیچ پورتی را روی هاست باز نمی‌کند؛ فقط `ports:` در Compose یا `-p` پورت را منتشر می‌کند.'
        ],
        diagram: {
          kind: 'layers',
          caption: 'جداسازی شبکه عمومی و خصوصی در استقرار تولیدی Docker Compose',
          nodes: [
            { label: 'Host Nginx (:443)', sublabel: 'تنها نقطه تماس با اینترنت عمومی' },
            { label: '127.0.0.1:8000 -> api:8000', sublabel: 'پورت‌مَپینگ محدود به Loopback (بسته برابر بیرون)', accent: true },
            { label: 'Internal Docker Network (internal: true)', sublabel: 'api <-> db:5432 & redis:6379 از طریق DNS داخلی' }
          ]
        }
      },
      lab: [
        {
          title: 'معماری شبکه امن در docker-compose.yml با جداسازی دیتابیس',
          language: 'yaml',
          code: `services:
  api:
    image: ghcr.io/example/api:v1.2.0
    ports:
      - "127.0.0.1:8000:8000" # فقط برای Nginx محلی روی هاست
    environment:
      DATABASE_URL: postgres://app@db:5432/prod
    networks: [app_net, db_net]

  db:
    image: postgres:16-alpine
    # بدون بخش ports! کاملاً نامرئی از اینترنت و حتی خارج از db_net
    networks: [db_net]

networks:
  app_net:
  db_net:
    internal: true`,
          explanations: [
            { token: 'internal: true', meaning: 'دسترسی خروجی اینترنت کانتینر دیتابیس را هم می‌بندد تا حتی در صورت نفوذ، امکان ارتباط با سرور مهاجم کاهش یابد.' },
            { token: 'db:5432', meaning: 'نام سرویس `db` توسط `DNS` داخلی داکر خودکار به IP خصوصی کانتینر Postgres ترجمه می‌شود.' }
          ]
        }
      ],
      warStory: {
        title: 'خطای `ECONNREFUSED 127.0.0.1:5432` هنگام انتقال پروژه به Docker Compose',
        symptom: 'اپلیکیشن روی لپ‌تاپ با `DATABASE_URL=postgres://localhost:5432/app` عالی کار می‌کرد، اما به محض اجرا داخل کانتینر خطای `Connection refused` می‌داد.',
        rootCause: 'هر کانتینر `Network Namespace` اختصاصی خودش را دارد؛ بنابراین `localhost` داخل کانتینر `api` به خود کانتینر `api` اشاره می‌کرد نه به کانتینر `db`!',
        preventionRule: 'در محیط Compose همیشه از نام سرویس (`db:5432`) به عنوان هاست استفاده کنید و آن را از طریق متغیر محیطی `.env` تزریق نمایید.'
      },
      deepDive: {
        title: 'چرا کانتینرهای روی شبکه پیش‌فرض `bridge` قدیمی با نام به هم وصل نمی‌شوند؟',
        content: [
          'شبکه پیش‌فرض قدیمی `docker0` به دلایل سازگاری عقب‌رو فاقد `DNS` خودکار بر اساس نام کانتینر است؛ فقط شبکه‌های ساخته‌شده توسط کاربر (`docker network create` یا خودکار توسط `docker compose`) دارای DNS داخلی و ایزولاسیون واقعی هستند.'
        ],
        takeAway: 'شبکه‌سازی دقیق داکر با ۵ خط YAML، کل لایه داده شما را از اینترنت عمومی ناپدید می‌کند.'
      },
      check: {
        type: 'triage',
        prompt: 'در یک `docker-compose.yml` سرویس `api` نمی‌تواند به سرویس `redis` وصل شود و خطای `connect ECONNREFUSED 127.0.0.1:6379` می‌دهد. سریع‌ترین علت و اصلاح چیست؟',
        options: [
          { id: 'a', label: 'آدرس اتصال داخل کانتینر `api` روی `localhost/127.0.0.1` تنظیم شده؛ باید به نام سرویس یعنی `redis://redis:6379` تغییر یابد', isCorrect: true, feedback: 'دقیقاً! داخل هر کانتینر `127.0.0.1` خود همان کانتینر است؛ ارتباط با سرویس همسایه از طریق نام سرویس و DNS داخلی داکر انجام می‌شود.' },
          { id: 'b', label: 'باید پورت `6379:6379` را روی اینترنت عمومی باز کرد', isCorrect: false, feedback: 'انتشار پورت روی هاست نه لازم است و نه امن!' },
          { id: 'c', label: 'سرویس `redis` باید به `root` تغییر داده شود', isCorrect: false, feedback: 'کاربر سرویس هیچ ارتباطی به مسیریابی شبکه ندارد.' }
        ]
      },
      crossLinks: [
        { targetId: 'T13-C03', reason: 'دلیل حیاتی بودن پیشوند `127.0.0.1:` برای جلوگیری از دور زدن فایروال `UFW`.' },
        { targetId: 'T03-C02', reason: 'فهم دقیق آدرس `Loopback` و `Network Namespace`.' }
      ]
    },
    {
      id: 'T15-C05',
      code: 'D04 · T15 · C05',
      domainId: 'D04',
      trackId: 'T15',
      title: 'پایداری داده (Volumes vs Bind Mounts)، مجوزهای UID/GID و چرا `docker compose down -v` ممنوعه پروداکشن است',
      subtitle: 'جلوگیری از پاک شدن تصادفی دیتابیس و حل خطاهای آزاردهنده Permission denied بین هاست و کانتینر.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'فایل‌سیستم داخلی هر کانتینر داکر «فانی» (`Ephemeral`) است: هر داده‌ای که داخل کانتینر بدون `Volume` بنویسید، با اولین آپدیت ایمیج و ساخت مجدد کانتینر برای همیشه دود می‌شود و به هوا می‌رود!',
        'و در سوی دیگر، یکی از تلخ‌ترین حوادث پروداکشن که از کپی کردن کورکورانه دستورات آموزشی اینترنت رخ می‌دهد، اجرای دستور `docker compose down -v` روی سرور اصلی است — فلگ بی‌گناه‌نمای `-v` کل دیتابیس پروداکشن را در یک ثانیه `rm -rf` می‌کند!'
      ],
      mentalModel: {
        paragraphs: [
          'دو راه اصلی نگهداری داده ماندگار بیرون از لایه فانی کانتینر: ۱) `Named Volumes` (مدیریت‌شده توسط داکر در `/var/lib/docker/volumes/` — بهترین گزینه برای داده‌های دیتابیس `PostgreSQL`/`Redis` با سرعت و مدیریت تمیزتر). ۲) `Bind Mounts` (اتصال مستقیم یک مسیر مشخص هاست مثل `/srv/app/config:/app/config:ro` — عالی برای فایل‌های پیکربندی فقط‌خواندنی و توسعه محلی).',
          'منبع شماره یک خطای `Permission denied` هنگام کار با کانتینر غیر-root (`USER 10001`): مالکیت فایل در لینوکس بر اساس شماره عددی `UID/GID` است نه نام کاربر! اگر پوشه روی هاست متعلق به `root (0:0)` باشد و کانتینر با `10001:10001` بخواهد داخلش بنویسد، کرنل مانع می‌شود. راه‌حل تمیز: یک بار روی هاست `chown -R 10001:10001 /srv/app/data` بزنید (نه `chmod 777`!).'
        ],
        rulesOfThumb: [
          'دستور `docker compose down -v` در سرور پروداکشن خط قرمز مطلق است؛ برای ری‌استارت یا آپدیت از `docker compose up -d` استفاده کنید.',
          'فایل‌های پیکربندی مانت‌شده داخل کانتینر (مثل `nginx.conf`) را همیشه با پسوند `:ro` (فقط‌خواندنی) مانت کنید.',
          'برای دیتابیس‌های حیاتی پروداکشن می‌توانید در `volumes:` پرچم `external: true` بگذارید تا حتی `down -v` تصادفی هم نتواند Volume را پاک کند!'
        ],
        diagram: {
          kind: 'split',
          caption: 'جداسازی کانتینر فانی (قابل تعویض) از لایه داده پایدار (Volume)',
          nodes: [
            { label: 'Container Layer (Ephemeral)', sublabel: 'با هر Deploy حذف و دوباره ساخته می‌شود' },
            { label: 'Named Volume / Bind Mount', sublabel: 'مستقل از عمر کانتینر · UID هم‌تراز + :ro برای کانفیگ', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'محافظت از Volume دیتابیس در برابر حذف تصادفی و مانت فقط‌خواندنی کانفیگ',
          language: 'yaml',
          code: `services:
  db:
    image: postgres:16-alpine
    volumes:
      - prod_pgdata:/var/lib/postgresql/data
      - ./init/postgresql.conf:/etc/postgresql/postgresql.conf:ro

volumes:
  prod_pgdata:
    external: true # پیش از اجرا یک بار با docker volume create prod_pgdata ساخته می‌شود`,
          explanations: [
            { token: 'external: true', meaning: 'داکر Compose اجازه حذف این Volume را حتی در صورت اجرای اشتباه `docker compose down -v` ندارد!' },
            { token: ':ro', meaning: 'اگر سرویس دچار نفوذ شود نمی‌تواند فایل پیکربندی خود را روی هاست تغییر دهد.' }
          ]
        }
      ],
      warStory: {
        title: 'پاک شدن کامل دیتابیس ۶ ماهه با یک دستور کپی‌شده از Stack Overflow',
        symptom: 'مهندس برای رفع یک مشکل شبکه در استقرار `app.example.com` دستور `docker compose down -v && docker compose up -d` را اجرا کرد و با یک دیتابیس کاملاً خالی روبرو شد!',
        rootCause: 'فلگ `-v` (`--volumes`) تمام Named Volumeهای تعریف‌شده درون `docker-compose.yml` (از جمله `pgdata`) را بی‌درنگ حذف کرده بود.',
        preventionRule: 'Volumeهای دیتابیس تولیدی را `external: true` تعریف کنید، هرگز `-v` در تولید نزنید و بکاپ آزمایش‌شده ۳-۲-۱ خارج از سرور داشته باشید.'
      },
      deepDive: {
        title: 'حالت `read_only: true` روی کل فایل‌سیستم ریشه کانتینر',
        content: [
          'در استقرارهای فوق‌امن می‌توانید کل فایل‌سیستم ریشه کانتینر را با `read_only: true` در Compose فقط‌خواندنی کنید و صرفاً یک `tmpfs: [/tmp]` کوچک در رم به آن بدهید؛ به این ترتیب هیچ بدافزاری نمی‌تواند فایلی داخل کانتینر دانلود و ذخیره کند.'
        ],
        takeAway: 'کانتینر را همیشه فانی فرض کنید و داده پایدار را با `Volume` محافظت‌شده و بکاپ منظم مصون نگه دارید.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطرناک‌ترین خط در این اسکریپت دیپلوی پروداکشن که هنگام انتشار جدید کل دیتابیس را پاک می‌کند کدام است؟',
        lines: [
          { lineNumber: 1, code: '#!/usr/bin/env bash' },
          { lineNumber: 2, code: 'set -euo pipefail' },
          { lineNumber: 3, code: 'docker compose pull' },
          { lineNumber: 4, code: 'docker compose down -v', isBug: true },
          { lineNumber: 5, code: 'docker compose up -d' }
        ],
        explanation: 'خط ۴ با فلگ `-v` تمام Volumeهای مدیریت‌شده توسط Compose (شامل دیتابیس) را حذف می‌کند! در دیپلوی عادی اصلاً نیازی به `down` نیست؛ صرفاً `docker compose up -d --remove-orphans` فقط کانتینرهایی که ایمیجشان تغییر کرده را با کمترین قطعی جایگزین می‌کند.'
      },
      crossLinks: [
        { targetId: 'T02-C03', reason: 'فهم دقیق مالکیت `UID/GID` و مجوزهای لینوکس برای حل `Permission denied`.' },
        { targetId: 'T16-C03', reason: 'پشتیبانی کامل داده‌های پایدار با استراتژی بکاپ ۳-۲-۱.' }
      ]
    },
    {
      id: 'T15-C06',
      code: 'D04 · T15 · C06',
      domainId: 'D04',
      trackId: 'T15',
      title: 'لاگ‌روتیشن داکر (`json-file max-size`)، محدود کردن RAM/CPU، Healthcheckها و پاک‌سازی ایمن دیسک (`prune`)',
      subtitle: 'پیشگیری از پر شدن ناگهانی دیسک سرور توسط لاگ‌های بی‌حدوحصر کانتینرها.',
      readMinutes: 5,
      difficulty: 'میدانی',
      originStory: [
        'یکی از عجیب‌ترین تنظیمات پیش‌فرض تاریخ `Docker` این است: درایور لاگ `json-file` به صورت پیش‌فرض **هیچ سقف حجمی ندارد**! یک کانتینر سالم که ماه‌ها بدون مشکل کار می‌کند، آرام‌آرام یک فایل لاگ ۸۰ گیگابایتی در `/var/lib/docker/containers/` می‌سازد و یک صبح جمعه کل دیسک سرور پر می‌شود و دیتابیس و SSH از کار می‌افتند!',
        'تنها ۱۰ خط تنظیم در `/etc/docker/daemon.json` و `docker-compose.yml` این بمب ساعتی را برای همیشه خنثی می‌کند.'
      ],
      mentalModel: {
        paragraphs: [
          'چهار محافظت بهداشتی هر کانتینر پروداکشن: ۱) **لاگ‌روتیشن اجباری**: تنظیم سراسری `max-size: "20m"` و `max-file: "5"` در `/etc/docker/daemon.json` تا هیچ کانتینری بیش از ۱۰۰ مگابایت لاگ روی دیسک نگه ندارد. ۲) **سقف منابع (`mem_limit` و `cpus`)**: از طریق `cgroups` جلوی یک سرویس دچار نشت حافظه را می‌گیرد تا کل سرور و دیتابیس همسایه را به کشتن ندهد.',
          '۳) **Healthcheck واقعی**: داکر می‌تواند به صورت دوره‌ای وضعیت واقعی داخل کانتینر را تست کند (`healthy / unhealthy`) و `depends_on: condition: service_healthy` تضمین می‌کند اپ قبل از آماده شدن دیتابیس بالا نیاید. ۴) **پاک‌سازی ایمن دیسک**: ایمیج‌ها و کش بیلد قدیمی دیسک را پر می‌کنند؛ با `docker image prune -a --filter "until=168h"` پاک‌سازی امن انجام دهید، اما **هرگز** `docker system prune --volumes` را بدون احتیاط نزنید که Volumeهای سرویس‌های موقتاً متوقف‌شده را پاک کند!'
        ],
        rulesOfThumb: [
          'در روز اول نصب Docker روی هر سرور، فوراً `/etc/docker/daemon.json` را با محدودیت لاگ بسازید (تغییر آن روی کانتینرهای جدید اعمال می‌شود).',
          'همیشه روی سرویس‌های پروداکشن `restart: unless-stopped` همراه با سقف منطقی `mem_limit` بگذارید.',
          'برای دیدن دقیق اینکه کدام ایمیج‌ها، کانتینرها یا لاگ‌ها دیسک را خورده‌اند، از `docker system df -v` استفاده کنید.'
        ],
        diagram: {
          kind: 'split',
          caption: 'چهار سپر پایداری Docker در محیط تولید',
          nodes: [
            { label: 'Log Rotation', sublabel: 'max-size: 20m · max-file: 5 در daemon.json', accent: true },
            { label: 'Resource Limits', sublabel: 'mem_limit + cpus روی هر سرویس (cgroups)' },
            { label: 'Healthchecks', sublabel: 'تشخیص سرویس هنگ‌کرده + ترتیب بوت دقیق' },
            { label: 'Safe Disk Prune', sublabel: 'پاک‌سازی ایمیج‌های قدیمی بدون لمس Volumeها' }
          ]
        }
      },
      lab: [
        {
          title: 'تنظیم سراسری لاگ‌روتیشن در daemon.json و Healthcheck تمیز در Compose',
          language: 'json',
          code: `// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "20m",
    "max-file": "5"
  }
}`,
          explanations: [
            { token: 'max-size / max-file', meaning: 'حداکثر ۵ فایل ۲۰ مگابایتی برای هر کانتینر؛ قدیمی‌ترین فایل خودکار حذف می‌شود.' },
            { token: 'docker system df', meaning: 'گزارش دقیق مصرف دیسک توسط Images, Containers, Local Volumes و Build Cache.' }
          ]
        }
      ],
      warStory: {
        title: 'توقف کل سرور تولیدی در ۳ بامداد به خاطر فایل لاگ ۶۵ گیگابایتی یک کانتینر',
        symptom: 'دیتابیس `PostgreSQL` روی `vps.example.com` با خطای `could not write to file: No space left on device` خاموش شد.',
        rootCause: 'کانتینر یک اسکریپت جانبی که در حلقه خطا افتاده بود، ظرف ۲ روز ۶۵ گیگابایت لاگ در `/var/lib/docker/containers/...-json.log` تولید کرده بود چون `daemon.json` بدون `max-size` رها شده بود.',
        preventionRule: 'سیاست `log-opts` را به عنوان گام اول راه‌اندازی هر سرور Docker اجباری کنید و هشدار مصرف دیسک روی ۸۰٪ بگذارید.'
      },
      deepDive: {
        title: 'چرا `HEALTHCHECK` در کانتینرهای `Distroless` بدون `curl` باید چطور نوشته شود؟',
        content: [
          'در ایمیج‌های سبک که `curl` یا `wget` ندارند، می‌توانید یک فرمان کوچک داخل خود زمان اجرای برنامه (مثل `node -e "fetch(\'http://127.0.0.1:3000/healthz\').then(r=>process.exit(r.ok?0:1))"` یا یک ساب‌کامند `--healthcheck` در باینری Go) بنویسید تا بدون نصب ابزار اضافی سلامت سرویس چک شود.'
        ],
        takeAway: 'تنظیمات بهداشتی پیشگیرانه (لاگ‌روتیشن و سقف رم) نصف بحران‌های نصفه‌شب را پیش از تولد می‌کشند.'
      },
      check: {
        type: 'triage',
        prompt: 'دیسک سرور Docker شما ۹۹٪ پر شده و دستور `docker system df` نشان می‌دهد ایمیج‌ها فقط ۴ گیگابایت‌اند اما `/var/lib/docker/containers/` به تنهایی ۷۰ گیگابایت اشغال کرده است. علت و راه پیشگیری دائمی چیست؟',
        options: [
          { id: 'a', label: 'نبود محدودیت `max-size` و `max-file` در `/etc/docker/daemon.json` برای درایور `json-file`؛ باید لاگ فعلی را با `truncate -s 0` خالی و سپس لاگ‌روتیشن را در `daemon.json` فعال کرد', isCorrect: true, feedback: 'دقیقاً! و به یاد داشته باشید که برای اعمال `daemon.json` جدید روی کانتینرهای قدیمی باید آن‌ها را recreate (`docker compose up -d --force-recreate`) کنید.' },
          { id: 'b', label: 'اجرای `docker system prune -a --volumes` برای پاک کردن دیتابیس‌ها', isCorrect: false, feedback: 'این کار نه لاگ کانتینر در حال اجرا را کم می‌کند و نه ایمن است — Volumeهای متوقف را پاک می‌کند!' },
          { id: 'c', label: 'افزایش `RAM` سرور مشکل دیسک را حل می‌کند', isCorrect: false, feedback: 'افزایش رم تاثیری روی پر شدن دیسک توسط فایل‌های لاگ ندارد.' }
        ]
      },
      crossLinks: [
        { targetId: 'T01-C01', reason: 'دلیل استفاده از `truncate -s 0` به جای `rm` روی فایل لاگ باز.' },
        { targetId: 'T16-C02', reason: 'طراحی دقیق اندپوینت‌های `/healthz` و `/readyz` برای همین Healthcheckها.' }
      ]
    }
  ]
};

export default t15;
