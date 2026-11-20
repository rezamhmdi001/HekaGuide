import type { TrackContent } from '../../types/atlas';

const t12: TrackContent = {
  trackId: 'T12',
  chapters: [
    {
      id: 'T12-C01',
      code: 'D03 · T12 · C01',
      domainId: 'D03',
      trackId: 'T12',
      title: 'بحران C10K (۱۹۹۹) و تولد Nginx: معماری Event-Driven در برابر Thread-per-Request',
      subtitle: 'چطور ایگور سیسویف با epoll و معماری ناهمگام به دوران کمبود رم در Apache پایان داد.',
      readMinutes: 6,
      difficulty: 'مبانی عمیق',
      originStory: [
        'در سال ۱۹۹۹ مهندسی به نام `Dan Kegel` چالشی معروف طرح کرد: «چطور یک سرور واحد با سخت‌افزار معمولی می‌تواند هم‌زمان ۱۰٬۰۰۰ اتصال شبکه (`C10K`) را مدیریت کند؟». در آن دوران وب‌سرور غالب `Apache` برای هر اتصال یک پردازش یا نخ مجزا می‌ساخت؛ با ۱۰٬۰۰۰ کاربر رم سرور تمام می‌شد و `CPU` در تعویض زمینه (`Context Switch`) غرق می‌گشت.',
        'در سال ۲۰۰۲ مهندس روس `Igor Sysoev` که سرورهای پربازدید `Rambler.ru` را اداره می‌کرد، از این بن‌بست خسته شد و `Nginx` را نوشت: فقط چند پردازش Worker (برابر تعداد هسته‌های CPU) با یک حلقه رویداد غیرمسدودکننده روی `epoll` کرنل که ده هزار اتصال را با چند مگابایت رم نگه می‌داشت!'
      ],
      mentalModel: {
        paragraphs: [
          'در معماری `Thread-per-Request` مثل این است که برای هر مشتری واردشده به رستوران یک گارسون اختصاصی استخدام کنید و وقتی مشتری ۱۰ دقیقه مشغول خواندن منو است (اتصال کند موبایل)، گارسون بیکار کنار میزش بایستد! در معماری `Event-Driven` (`Nginx`)، به ازای هر هسته CPU فقط یک گارسون چابک (`Worker Process`) داریم که از کرنل (`epoll_wait` در لینوکس یا `kqueue` در BSD) می‌پرسد: «کدام میز الان واقعاً بسته داده آماده دارد؟» و فقط همان‌ها را در میکروثانیه سرویس می‌دهد.',
          'به همین دلیل `Nginx` به عنوان سپر اول جلوی اپلیکیشن‌های `Python/Node/Ruby` می‌نشیند: اتصال‌های کند کاربران موبایل را خودش با رم ناچیز مدیریت می‌کند، `TLS` را تمام می‌کند، فایل‌های استاتیک را با `sendfile()` مستقیم از کرنل می‌فرستد و فقط درخواست‌های کامل و تمیز را سریع به بک‌اند تحویل می‌دهد.'
        ],
        rulesOfThumb: [
          'تعداد `worker_processes` در Nginx را روی `auto` بگذارید تا دقیقاً برابر تعداد هسته‌های `CPU` سرور تنظیم شود.',
          'بک‌اند اپلیکیشن (`FastAPI/Node/Django`) را مستقیم در معرض اینترنت نگذارید؛ `Nginx` یا `Caddy` را به عنوان Reverse Proxy محافظ جلوی آن بگذارید.',
          'حداکثر اتصال هم‌زمان تئوریک Nginx برابر `worker_processes × worker_connections` است (برای Reverse Proxy تقسیم بر ۲، چون هر کاربر دو سوکت مصرف می‌کند: یکی سمت کلاینت، یکی سمت بک‌اند!).'
        ],
        diagram: {
          kind: 'split',
          caption: 'چرا Nginx بحران C10K را با کسری از رم Apache حل کرد',
          nodes: [
            { label: 'Thread-per-Request', sublabel: '10,000 اتصال = 10,000 نخ · چند گیگابایت RAM + Context Switch' },
            { label: 'Nginx Event-Driven (epoll)', sublabel: '4 Worker روی 4 هسته · چند مگابایت RAM · صفر انتظار بیکار', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'ساختار پایه بهینه nginx.conf برای بار واقعی',
          language: 'nginx',
          code: `worker_processes auto;
worker_rlimit_nofile 65535;

events {
  use epoll;
  worker_connections 16384;
  multi_accept on;
}

http {
  sendfile on;
  tcp_nopush on;
  keepalive_timeout 65;
  server_tokens off; # مخفی کردن نسخه دقیق Nginx در هدرها
}`,
          explanations: [
            { token: 'worker_rlimit_nofile', meaning: 'سقف `File Descriptor` هر Worker را بالا می‌برد تا با `worker_connections` هم‌خوان شود.' },
            { token: 'sendfile on', meaning: 'فایل‌های استاتیک را با `Zero-Copy` مستقیم از `Page Cache` کرنل به کارت شبکه می‌فرستد بدون کپی کردن در User Space.' },
            { token: 'server_tokens off', meaning: 'شماره نسخه دقیق Nginx را از هدر `Server` و صفحات خطا حذف می‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'سقوط سرور Django زیر حمله ساده Slowloris بدون Reverse Proxy',
        symptom: 'مهاجم تنها با ۲۰۰ اتصال بسیار کند (ارسال ۱ بایت در هر ۱۰ ثانیه) کل سایت `app.example.com` را از کار انداخت در حالی که CPU زیر ۵٪ بود.',
        rootCause: '`Gunicorn` همگام با ۱۶ Worker مستقیم روی پورت ۴۴۳ به اینترنت باز بود؛ ۱۶ اتصال کند تمام Workerها را قفل کرده بودند.',
        preventionRule: 'همیشه `Nginx` را جلوی سرورهای اپلیکیشن بگذارید و تایم‌اوت‌های خواندن هدر/بدنه (`client_header_timeout`, `client_body_timeout`) را کوتاه تنظیم کنید.'
      },
      deepDive: {
        title: 'تکامل از `select/poll` به `epoll` در کرنل لینوکس',
        content: [
          'فراخوانی قدیمی `select()` در هر بار اجرا مجبور بود کل آرایه `File Descriptor`ها را با پیچیدگی `O(N)` اسکن کند و سقف ۱۰۲۴ سوکت داشت.',
          'کرنل لینوکس `epoll` را با پیچیدگی `O(1)` معرفی کرد: کرنل فقط لیست سوکت‌هایی را که واقعاً داده جدید گرفته‌اند تحویل `Nginx` یا `Node.js` می‌دهد؛ فرقی ندارد ۵۰ سوکت باز باشد یا ۵۰۰٬۰۰۰ سوکت.'
        ],
        takeAway: 'یک انتزاع خوب کرنل (`epoll`) پایه کل معماری سرورهای پرسرعت امروز (Nginx، Node، Redis و Go) است.'
      },
      check: {
        type: 'predict',
        prompt: 'یک سرور `Nginx` با `4` هسته (`worker_processes 4`) و `worker_connections 1024` به عنوان Reverse Proxy جلوی بک‌اند کار می‌کند. حداکثر چند کاربر هم‌زمان (هر کدام با ۱ اتصال به Nginx و ۱ اتصال از Nginx به بک‌اند) می‌تواند سرویس دهد؟',
        snippet: `worker_processes 4;
events { worker_connections 1024; }`,
        options: [
          { id: 'a', label: 'حدود `2048` کاربر هم‌زمان (`(4 × 1024) / 2`) چون هر درخواست پروکسی‌شده دو سوکت (کلاینت + Upstream) مصرف می‌کند', isCorrect: true, feedback: 'دقیقاً! بسیاری فراموش می‌کنند که در حالت Reverse Proxy، اتصال سمت بک‌اند هم از سهمیه `worker_connections` کم می‌شود.' },
          { id: 'b', label: 'دقیقاً `1024` کاربر در کل سرور', isCorrect: false, feedback: '`worker_connections` به ازای هر Worker است، پس در `worker_processes` ضرب می‌شود.' },
          { id: 'c', label: '`4096` کاربر در حالت Reverse Proxy', isCorrect: false, feedback: '`4096` فقط برای سرو فایل استاتیک صادق است؛ در Reverse Proxy هر اتصال به بک‌اند یک سوکت دوم مصرف می‌کند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T01-C03', reason: 'دلیل شکست `Thread-per-Request` در برابر `Event-Driven` از دید `Context Switch` کرنل.' },
        { targetId: 'T06-C02', reason: 'شباهت معماری `Event Loop` در Node.js با حلقه رویداد `Nginx`.' }
      ]
    },
    {
      id: 'T12-C02',
      code: 'D03 · T12 · C02',
      domainId: 'D03',
      trackId: 'T12',
      title: 'Reverse Proxy، Load Balancing (Round-Robin, Least-Conn, Health Checks) و هدرهای `X-Forwarded-*`',
      subtitle: 'پخش هوشمند بار بین بک‌اندها و حفظ IP و پروتکل واقعی کاربر پشت پروکسی.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'وقتی یک سرور اپلیکیشن دیگر پاسخگوی ترافیک نیست یا می‌خواهید بدون قطعی یک سرور را آپدیت کنید، یک «توزیع‌کننده بار» (`Load Balancer / Reverse Proxy`) جلوی چند نسخه بک‌اند می‌گذارید. کاربر فقط یک دامنه می‌بیند، اما پشت صحنه ترافیک میان چندین نود سالم پخش می‌شود.',
        'اما یک مشکل کلاسیک فوراً سر برمی‌آورد: اپلیکیشن شما دیگر اتصال مستقیم از کاربر نمی‌گیرد، بلکه از `127.0.0.1` (خود Nginx) می‌گیرد! بدون تنظیم دقیق هدرهای `X-Forwarded-*`، همه لاگ‌ها `127.0.0.1` می‌شوند و لینک‌های ریدایرکت به اشتباه `http://` ساخته می‌شوند.'
      ],
      mentalModel: {
        paragraphs: [
          'الگوریتم‌های رایج توزیع بار: `Round-Robin` (نوبتی ساده — عالی وقتی همه درخواست‌ها زمان مشابهی دارند)، `Least-Conn` (ارسال به سروری که کمترین اتصال باز را دارد — بسیار بهتر وقتی بعضی درخواست‌ها مثل گزارش یا AI طولانی‌ترند) و `IP Hash` (هدایت ثابت یک کاربر به یک سرور).',
          'برای حفظ هویت واقعی درخواست، `Nginx` سه هدر استاندارد به بک‌اند می‌دهد: `Host` (نام دامنه اصلی)، `X-Forwarded-Proto` (`https`) و `X-Forwarded-For` / `X-Real-IP` (`IP` واقعی کاربر). تله امنیتی مهم: اپلیکیشن فقط باید به هدر `X-Forwarded-For` ارسالی از پروکسی مورد اعتماد خودش اعتماد کند، وگرنه مهاجم می‌تواند هر `IP` جعلی را در این هدر بفرستد و Rate Limiter را دور بزند!'
        ],
        rulesOfThumb: [
          'در `Nginx` برای `X-Real-IP` همیشه از `$remote_addr` استفاده کنید (و `$proxy_add_x_forwarded_for` برای زنجیره)، هرگز هدر خام کاربر را کورکورانه فوروارد نکنید.',
          'برای تماس بین `Nginx` و بک‌اند `upstream`، `proxy_http_version 1.1` و `keepalive 32` بگذارید تا برای هر درخواست یک اتصال TCP جدید به بک‌اند ساخته نشود.',
          'از `max_fails` و `fail_timeout` روی سرورهای `upstream` استفاده کنید تا نود خراب به صورت خودکار از چرخه ترافیک خارج شود.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'توزیع بار هوشمند و تزریق هدرهای X-Forwarded-* در Reverse Proxy',
          nodes: [
            { label: 'Client (203.0.113.55)', sublabel: 'HTTPS روی پورت 443' },
            { label: 'Nginx Reverse Proxy', sublabel: 'least_conn + X-Real-IP + Keepalive Pool', accent: true },
            { label: 'Backend Pool (App 1 / App 2)', sublabel: 'بررسی سلامت خودکار و حذف نود ناسالم' }
          ]
        }
      },
      lab: [
        {
          title: 'پیکربندی استاندارد Upstream با Least-Conn، Keep-Alive و هدرهای امن',
          language: 'nginx',
          code: `upstream app_backend {
  least_conn;
  server 127.0.0.1:8001 max_fails=3 fail_timeout=15s;
  server 127.0.0.1:8002 max_fails=3 fail_timeout=15s;
  keepalive 32;
}

location /api/ {
  proxy_pass http://app_backend;
  proxy_http_version 1.1;
  proxy_set_header Connection "";
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}`,
          explanations: [
            { token: 'proxy_set_header Connection ""', meaning: 'هدر `Connection: close` پیش‌فرض Nginx را پاک می‌کند تا `keepalive 32` به بک‌اند واقعاً فعال شود.' },
            { token: 'max_fails=3 fail_timeout=15s', meaning: 'اگر یکی از دو نود ۳ بار پشت‌سرهم خطا داد، Nginx برای ۱۵ ثانیه ترافیک را کامل روی نود سالم می‌فرستد.' }
          ]
        }
      ],
      warStory: {
        title: 'دور زدن Rate Limiter با جعل یک هدر ساده `X-Forwarded-For`',
        symptom: 'مهاجم روی صفحه ورود `auth.example.com` با وجود Rate Limit دقیقه‌ای ۵ درخواست، ثانیه‌ای ۱۰۰ رمز تست می‌کرد.',
        rootCause: 'اپلیکیشن به صورت مستقیم اولین `IP` درون هدر `X-Forwarded-For` را به عنوان IP کاربر می‌خواند؛ مهاجم در هر درخواست یک عدد تصادفی در آن هدر می‌فرستاد (`X-Forwarded-For: 1.2.3.4`) و `Nginx` فقط IP واقعی را به انتهای آن اضافه می‌کرد!',
        preventionRule: 'تعداد پروکسی‌های مورد اعتماد (`trust proxy`) را دقیق تنظیم کنید تا بک‌اند از **انتهای** لیست `X-Forwarded-For` (که توسط Nginx شما نوشته شده) بخواند نه از ابتدای آن که کاربر جعل کرده است.'
      },
      deepDive: {
        title: 'تفاوت `Passive Health Check` و `Active Health Check`',
        content: [
          'در نسخه رایگان `Nginx`، چک سلامت به صورت `Passive` است: وقتی ترافیک واقعی به نود خراب بخورد و شکست بخورد، آن را موقتاً کنار می‌گذارد.',
          'در لودبالانسرهای پیشرفته (`HAProxy`, `Envoy`, `Caddy`, `Cloud ALB`) چک سلامت `Active` است: هر ۵ ثانیه به مسیر `/readyz` سر می‌زنند و حتی قبل از اینکه یک کاربر خطا ببیند، نود ناسالم را از مدار خارج می‌کنند.'
        ],
        takeAway: 'توزیع‌کننده بار هم ضامن دسترس‌پذیری بالاست و هم نقطه حساسی که باید هدرهای هویت کاربر را صادقانه بازنویسی کند.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'در این پیکربندی `Nginx` برای فعال کردن `Keep-Alive` سمت بک‌اند، خطی که باعث می‌شود `keepalive 32` عملاً کار نکند و هر درخواست اتصال TCP جدیدی بسازد چیست؟',
        lines: [
          { lineNumber: 1, code: 'location /api/ {' },
          { lineNumber: 2, code: '  proxy_pass http://app_backend;' },
          { lineNumber: 3, code: '  proxy_http_version 1.0;', isBug: true },
          { lineNumber: 4, code: '  proxy_set_header Host $host;' },
          { lineNumber: 5, code: '}' }
        ],
        explanation: 'نسخه پیش‌فرض ارتباط Nginx با بک‌اند `HTTP/1.0` است (خط ۳) که برای هر درخواست اتصال TCP را می‌بندد! برای فعال شدن `keepalive` سمت `upstream` باید حتماً `proxy_http_version 1.1;` و `proxy_set_header Connection "";` تنظیم شود.'
      },
      crossLinks: [
        { targetId: 'T08-C06', reason: 'وابستگی مستقیم دقت `Rate Limiting` به بازیابی صحیح IP واقعی از پشت پروکسی.' },
        { targetId: 'T16-C02', reason: 'طراحی مسیر `/readyz` برای چک سلامت هوشمند لودبالانسر.' }
      ]
    },
    {
      id: 'T12-C03',
      code: 'D03 · T12 · C03',
      domainId: 'D03',
      trackId: 'T12',
      title: 'Nginx Stream و `ssl_preread`: مسیریابی لایه ۴ بر اساس SNI بدون رمزگشایی ترافیک',
      subtitle: 'ارسال مستقیم ترافیک TLS چندین سرویس مختلف از یک پورت ۴۴۳ بدون دسترسی به کلید خصوصی آن‌ها.',
      readMinutes: 6,
      difficulty: 'چالشی',
      originStory: [
        'تصور کنید روی یک سرور با یک `IP` عمومی و یک پورت `443` می‌خواهید هم وب‌سایت `web.example.com` را میزبانی کنید و هم یک سرویس دیگر با گواهی مستقل (مثلاً `vault.example.com` یا یک تونل `TLS` اختصاصی) را بدون اینکه `Nginx` اصلی به کلید خصوصی سرویس دوم دسترسی داشته باشد یا ترافیکش را رمزگشایی کند.',
        'ماژول `ngx_stream_ssl_preread_module` در لایه ۴ (`TCP Stream`) این کار را ممکن کرد: `Nginx` فقط به بسته اول `ClientHello` سرک می‌کشد، نام دامنه `SNI` را می‌خواند و بقیه جریان رمزشده `TCP` را دست‌نخورده (`TLS Passthrough`) به بک‌اند مربوطه هدایت می‌کند!'
      ],
      mentalModel: {
        paragraphs: [
          'برخلاف بلوک `http {}` که در لایه ۷ کار می‌کند (TLS را می‌شکند، هدر HTTP می‌خواند و دوباره می‌فرستد)، بلوک `stream {}` در لایه ۴ (`TCP/UDP`) کار می‌کند. با فعال کردن `ssl_preread on;`, متغیر `$ssl_preread_server_name` مقدار `SNI` را بدون نیاز به هیچ کلید یا گواهی استخراج می‌کند.',
          'سپس با دستور `map $ssl_preread_server_name $backend` می‌توانید هر دامنه را به یک پورت داخلی متفاوت بفرستید؛ حتی می‌توانید `web.example.com` را به بلوک `http` خود Nginx روی `127.0.0.1:8443` بفرستید و دامنه دیگر را به کانتینر مستقلش روی `127.0.0.1:9443`.'
        ],
        rulesOfThumb: [
          'در حالت `TLS Passthrough` لایه ۴، چون ترافیک رمزگشایی نمی‌شود، نمی‌توانید هدر `X-Forwarded-For` اضافه کنید! برای حفظ IP واقعی کاربر در لایه ۴ از پروتکل `PROXY Protocol` (`proxy_protocol on`) استفاده کنید.',
          'همیشه یک مسیر `default` امن در جدول `map` برای دامنه‌های ناشناس تعریف کنید.',
          'مطمئن شوید ماژول `stream_ssl_preread` در باینری Nginx شما کامپایل شده باشد (`nginx -V 2>&1 | grep ssl_preread`).'
        ],
        diagram: {
          kind: 'flow',
          caption: 'مسیریابی لایه ۴ بدون رمزگشایی (TLS Passthrough) با Nginx Stream و SNI',
          nodes: [
            { label: 'Port 443 (Nginx Stream)', sublabel: 'خواندن SNI از ClientHello بدون کلید خصوصی', accent: true },
            { label: 'SNI: app.example.com', sublabel: 'هدایت خام TCP به 127.0.0.1:8443 (Nginx HTTP)' },
            { label: 'SNI: secure.example.com', sublabel: 'هدایت خام TCP به سرویس مستقل (End-to-End TLS)' }
          ]
        }
      },
      lab: [
        {
          title: 'پیکربندی کامل Nginx Stream برای مسیریابی چندسرویسی روی پورت ۴۴۳',
          language: 'nginx',
          code: `stream {
  map $ssl_preread_server_name $upstream_target {
    app.example.com     127.0.0.1:8443;
    secure.example.com  127.0.0.1:9443;
    default             127.0.0.1:8443;
  }

  server {
    listen 443;
    ssl_preread on;
    proxy_pass $upstream_target;
    proxy_protocol on; # ارسال IP واقعی کلاینت به مقصد لایه ۴
  }
}`,
          explanations: [
            { token: 'ssl_preread on', meaning: 'بدون انجام Handshake، فقط فیلد `SNI` و `ALPN` را از بسته اول می‌خواند.' },
            { token: 'proxy_protocol on', meaning: 'یک هدر کوتاه لایه ۴ حاوی `IP` واقعی کلاینت به ابتدای اتصال اضافه می‌کند (مقصد هم باید `proxy_protocol` را بفهمد).' }
          ]
        }
      ],
      warStory: {
        title: 'از دست رفتن کامل IP واقعی کاربران پس از افزودن Nginx Stream Passthrough',
        symptom: 'بعد از قرار دادن `Nginx Stream` جلوی دو سرویس روی پورت ۴۴۳، تمام لاگ‌های سرویس داخلی فقط `127.0.0.1` ثبت می‌کردند و سیستم ضدتقلب همه کاربران را یکی می‌دید.',
        rootCause: 'چون مسیریابی در لایه ۴ بدون رمزگشایی بود، هیچ هدر `X-Forwarded-For`ای وجود نداشت و سوکت مقصد فقط آدرس پروکسی محلی (`127.0.0.1`) را می‌دید.',
        preventionRule: 'در لایه ۴ بین Nginx Stream و سرویس داخلی، پروتکل `PROXY Protocol` را در هر دو سمت فعال کنید (و پورت داخلی را فقط به `127.0.0.1` ببندید تا کسی هدر PROXY جعل نکند).'
      },
      deepDive: {
        title: 'مسیریابی هم‌زمان بر اساس `ALPN` (`$ssl_preread_alpn_protocols`)',
        content: [
          'علاوه بر `SNI`، `ssl_preread` می‌تواند فهرست `ALPN` را هم بخواند؛ بنابراین حتی روی «یک دامنه واحد» هم می‌توانید ترافیک `http/1.1` و `h2` را از یک پروتکل دیگر مثل `acme-tls/1` یا `mqtt` جدا کنید و به بک‌اندهای مجزا بفرستید.'
        ],
        takeAway: 'تسلط بر مرز لایه ۴ و لایه ۷ دست شما را برای طراحی زیرساخت‌های فوق‌تمیز روی یک پورت ۴۴۳ باز می‌کند.'
      },
      check: {
        type: 'recall',
        question: 'در `Nginx Stream` با `ssl_preread`، چرا نمی‌توانیم هدر `X-Forwarded-For` را به درخواست اضافه کنیم و راه‌حل استاندارد انتقال `IP` واقعی کلاینت چیست؟',
        modelAnswer: 'چون `Nginx Stream` در لایه ۴ (`TCP`) کار می‌کند و ترافیک `TLS` را رمزگشایی نمی‌کند؛ بنابراین اصلاً به هدرهای `HTTP` دسترسی ندارد. راه‌حل استاندارد فعال کردن `PROXY Protocol` (`proxy_protocol on`) بین `Nginx Stream` و سرویس پشتی است تا `IP` واقعی کاربر در لایه انتقال به مقصد اعلام شود.'
      },
      crossLinks: [
        { targetId: 'T04-C04', reason: 'درک دقیق نحوه ارسال `SNI` و `ALPN` در پیام `ClientHello`.' },
        { targetId: 'T12-C02', reason: 'مقایسه این الگوی لایه ۴ با Reverse Proxy معمولی لایه ۷.' }
      ]
    },
    {
      id: 'T12-C04',
      code: 'D03 · T12 · C04',
      domainId: 'D03',
      trackId: 'T12',
      title: 'گلوگاه‌های واقعی زیر بار: `worker_connections`، سقف `ulimit`، Keep-Alive و تله‌ی Reload کردن کانفیگ',
      subtitle: 'تنظیم ظرفیت سوکت‌های کرنل و دلیل افت ناگهانی Nginx هنگام تست بار.',
      readMinutes: 6,
      difficulty: 'چالشی',
      originStory: [
        'یک سرور ۳۲ هسته‌ای گران‌قیمت با ۶۴ گیگابایت رم می‌خرید، اما در اولین تست بار روی `1000` کاربر هم‌زمان خطای `502` و `Too many open files` می‌گیرید در حالی که مصرف `CPU` زیر ۱۰٪ است! چرا؟',
        'چون تنظیمات پیش‌فرض لینوکس و `Nginx` برای ماشین‌های عمومی ده سال پیش بسته شده‌اند: سقف فایل‌های باز `1024`، صف پذیرش سوکت `somaxconn` کوچک، و نبود `Keep-Alive` سمت بک‌اند که پورت‌های محلی (`Ephemeral Ports`) را ظرف چند ثانیه در حالت `TIME_WAIT` تمام می‌کند.'
      ],
      mentalModel: {
        paragraphs: [
          'چهار گلوگاه خاموش زیر بار: ۱) `ulimit -n` و `worker_rlimit_nofile`: اگر از `worker_connections` کوچک‌تر باشند، Nginx در اوج ترافیک خطای `accept4() failed (24: Too many open files)` می‌دهد. ۲) صف پذیرش اتصال (`net.core.somaxconn` و `backlog`): اگر در یک جهش لحظه‌ای پر شود، بسته‌های `SYN` کاربران دور ریخته می‌شوند.',
          '۳) تمام شدن `Ephemeral Ports`: اگر Nginx بدون `Keep-Alive` برای هر درخواست یک اتصال جدید به `127.0.0.1:8000` بزند و ببندد، در نرخ ۱٬۰۰۰ درخواست بر ثانیه ظرف ۲۸ ثانیه کل ۲۸٬۰۰۰ پورت موقت کرنل در `TIME_WAIT` قفل می‌شوند و خطای `Cannot assign requested address` می‌دهد! ۴) تله `nginx -s reload`: هر `reload` Workerهای جدید می‌سازد اما Workerهای قدیمی تا اتمام اتصال‌های طولانی (`WebSocket/SSE`) زنده می‌مانند؛ اگر ۱۰۰ بار پشت‌سرهم `reload` بزنید، رم سرور پر از Workerهای قدیمی (`shutting down`) می‌شود.'
        ],
        rulesOfThumb: [
          'قبل از هر `systemctl reload nginx` همیشه اول `nginx -t` بزنید تا کانفیگ خراب سرویس را زمین نزند.',
          'برای `upstream`های پرترافیک حتماً `keepalive` روشن کنید تا پورت‌های محلی در `TIME_WAIT` تمام نشوند.',
          'تعداد `worker_shutdown_timeout` را در Nginx تنظیم کنید تا Workerهای قدیمی بعد از `reload` تا ابد به خاطر یک اتصال بیکار در رم نمانند.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'چهار شیر گلوگاه کرنل و Nginx که باید زیر بار هم‌تراز باشند',
          nodes: [
            { label: 'somaxconn / backlog', sublabel: 'صف پذیرش SYN در کرنل' },
            { label: 'ulimit -n / rlimit_nofile', sublabel: 'سقف File Descriptor (مثلاً 65535)', accent: true },
            { label: 'worker_connections', sublabel: 'ظرفیت سوکت هر Worker' },
            { label: 'Upstream Keep-Alive', sublabel: 'بازاستفاده از TCP و حفظ Ephemeral Ports' }
          ]
        }
      },
      lab: [
        {
          title: 'تنظیمات کرنل لینوکس برای بار بالا و بررسی ایمن کانفیگ Nginx',
          language: 'bash',
          code: `# بررسی صف‌های پذیرش و بازه پورت‌های موقت کرنل
sysctl net.core.somaxconn net.ipv4.ip_local_port_range

# تست سینتکس پیش از اعمال بدون قطعی
sudo nginx -t && sudo systemctl reload nginx

# بررسی وجود Workerهای قدیمی گیرکرده در حالت shutting down
ps aux | grep nginx`,
          explanations: [
            { token: 'net.core.somaxconn', meaning: 'حداکثر طول صف اتصال‌های تکمیل‌شده آماده `accept()`؛ در سرورهای مدرن معمولاً `4096` تا `65535` تنظیم می‌شود.' },
            { token: 'worker_shutdown_timeout', meaning: 'در `nginx.conf` مهلت نهایی (مثلاً `30s`) به Worker قدیمی می‌دهد تا پس از `reload` خارج شود.' }
          ]
        }
      ],
      warStory: {
        title: 'خطای ناگهانی `99: Cannot assign requested address` در اوج کمپین فروش',
        symptom: 'در کمپین فروش `api.example.com` با نرخ ۸۰۰ درخواست در ثانیه، ناگهان نیمی از درخواست‌ها `502 Bad Gateway` دادند با اینکه سرور بک‌اند کاملاً سالم و بیکار بود.',
        rootCause: 'لاگ خطای Nginx نشان داد `connect() to 127.0.0.1:8000 failed (99: Cannot assign requested address)`. به دلیل نبود `keepalive` روی `upstream`، تمام ۲۸٬۰۰۰ پورت موقت محلی در حالت `TIME_WAIT` پر شده بودند.',
        preventionRule: 'فعال‌سازی `keepalive 64` + `proxy_http_version 1.1` + `Connection ""` در `upstream` تعداد اتصالات جدید را تا ۹۹٪ کاهش می‌دهد.'
      },
      deepDive: {
        title: 'تله تکثیر حافظه هنگام `reload` مداوم در محیط‌های پویا',
        content: [
          'در سرویس‌هایی که هر دقیقه به خاطر تغییر دامنه مشتریان `nginx -s reload` می‌زنند، اگر کاربران اتصال‌های بلندمدت `SSE` یا دانلود فایل داشته باشند، هر `reload` یک سری Worker جدید با جدول حافظه خودش می‌آورد بدون اینکه قدیمی‌ها بسته شوند.',
          'تنظیم `worker_shutdown_timeout 60s` یا استفاده از `Caddy / Envoy` (که پیکربندی را بدون Fork کردن Worker جدید از طریق API زنده عوض می‌کنند) این مشکل را حل می‌کند.'
        ],
        takeAway: 'تست بار واقعی (`k6` / `wrk`) همیشه گلوگاه‌هایی را نشان می‌دهد که در آزمایش ۱ کاربره کاملاً نامرئی‌اند.'
      },
      check: {
        type: 'triage',
        prompt: 'در لاگ خطای `Nginx` زیر بار بالا پیام زیر ثبت می‌شود. علت دقیق و راه‌حل چیست؟',
        logSnippet: `connect() to 127.0.0.1:8000 failed (99: Cannot assign requested address) while connecting to upstream`,
        options: [
          { id: 'a', label: 'پورت‌های موقت محلی (`Ephemeral Ports`) به دلیل ساخت و بستن اتصال TCP جدید برای هر درخواست تمام شده‌اند؛ باید `keepalive` را روی `upstream` با `HTTP/1.1` فعال کرد', isCorrect: true, feedback: 'دقیقاً! کد خطای `99 (EADDRNOTAVAIL)` در اتصال به `127.0.0.1` امضای کلاسیک تمام شدن پورت‌های موقت و پر شدن جدول `TIME_WAIT` است.' },
          { id: 'b', label: 'سرور بک‌اند روی پورت `8000` گوش نمی‌دهد', isCorrect: false, feedback: 'نبود سرویس روی پورت خطای `111: Connection refused` می‌دهد نه `99: Cannot assign requested address`.' },
          { id: 'c', label: 'گواهی TLS منقضی شده است', isCorrect: false, feedback: 'ارتباط به `127.0.0.1:8000` بدون TLS است و خطا در لایه تخصیص پورت `TCP` کرنل است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T01-C06', reason: 'رابطه `ulimit -n` و `File Descriptor` با ظرفیت اتصال Nginx.' },
        { targetId: 'T03-C04', reason: 'مشاهده زنده وضعیت `TIME_WAIT` و سوکت‌های باز با دستور `ss -s`.' }
      ]
    },
    {
      id: 'T12-C05',
      code: 'D03 · T12 · C05',
      domainId: 'D03',
      trackId: 'T12',
      title: 'مقیاس‌پذیری عمودی (Scale-Up) در برابر افقی (Scale-Out)، Stateless کردن سرویس‌ها و Sticky Sessions',
      subtitle: 'چرا یک سرور بزرگ اغلب از کلاستر پیچیده ارزان‌تر است و شرط واقعی مقیاس افقی چیست.',
      readMinutes: 5,
      difficulty: 'مبانی عمیق',
      originStory: [
        'در دهه ۲۰۰۰ سخت‌افزار تک‌سرور محدود بود و گوگل مجبور شد نرم‌افزارش را روی هزاران کامپیوتر ارزان مقیاس افقی (`Scale-Out`) دهد. اما امروز یک سرور فیزیکی واحد می‌تواند ۱۲۸ هسته، ۵۱۲ گیگابایت رم و دیسک‌های NVMe فوق‌سریع داشته باشد — یعنی سایت‌هایی مانند `Stack Overflow` سال‌ها صدها میلیون بازدید ماهانه را روی انگشت‌شمار سرور بزرگ (`Scale-Up`) با تاخیر ناچیز سرو کرده‌اند!',
        'مهندس بالغ هر دو ابزار را می‌شناسد: تا جای ممکن ساده با `Scale-Up` رشد کنید، اما کدتان را از روز اول `Stateless` بنویسید تا برای افزونگی (`High Availability`) و `Scale-Out` آماده باشید.'
      ],
      mentalModel: {
        paragraphs: [
          'شرط بنیادین مقیاس افقی (`Scale-Out` با چند نمونه سرور پشت لودبالانسر) این است که سرورهای اپلیکیشن `Stateless` باشند: یعنی هیچ وضعیت دائمی کاربر (سشن لاگین، فایل آپلودشده، کش اختصاصی یا کران‌جاب تکراری) درون رم یا دیسک محلی یک کانتینر نگهداری نشود!',
          'اگر وضعیت نشست را در رم نود ۱ نگه دارید، وقتی درخواست بعدی کاربر به نود ۲ می‌رود از حسابش بیرون می‌افتد. راه‌حل موقتی `Sticky Sessions` (چسباندن کاربر به همان نود) است که هم پخش بار را نامتوازن می‌کند و هم هنگام ری‌استارت آن نود همه کاربرانش قطع می‌شوند؛ راه‌حل واقعی انتقال سشن به `Redis`، فایل‌ها به `S3` و داده به `PostgreSQL` است.'
        ],
        rulesOfThumb: [
          'مقیاس عمودی (`Scale-Up`) برای دیتابیس بسیار ارزان‌تر و بی‌دردسرتر از Sharding است؛ قبل از Sharding، کوئری‌ها را بهینه و سخت‌افزار را بزرگ‌تر کنید.',
          'برای «دسترس‌پذیری بالا» (بقا در برابر مرگ یک سرور) حداقل ۲ نمونه اپلیکیشن `Stateless` پشت لودبالانسر لازم است.',
          'تله کلاسیک Scale-Out: اگر ۲ نمونه اپ بالا بیاورید و هر دو یک کران‌جاب داخلی داشته باشند، هر ایمیل یا فاکتور روزانه دو بار ارسال می‌شود! کارهای زمان‌بندی‌شده را روی یک Scheduler جدا یا با `Distributed Lock` اجرا کنید.'
        ],
        diagram: {
          kind: 'layers',
          caption: 'معماری Stateless آماده مقیاس افقی و بدون نیاز به Sticky Sessions',
          nodes: [
            { label: 'Load Balancer', sublabel: 'پخش آزاد ترافیک بین همه نودها' },
            { label: 'App Node 1 · App Node 2 · App Node N (Stateless)', sublabel: 'بدون فایل محلی و بدون سشن در RAM', accent: true },
            { label: 'Shared State Layer', sublabel: 'PostgreSQL (داده) · Redis (سشن/کش) · S3 (فایل)' }
          ]
        }
      },
      lab: [
        {
          title: 'چک‌لیست عملی تبدیل یک سرویس به Stateless واقعی',
          language: 'text',
          code: `1. Sessions & Rate Limits  -> Redis (نه Map درون RAM کانتینر)
2. Uploaded Files / Media  -> S3 / R2 Object Storage (نه ./uploads محلی)
3. Scheduled Jobs / Cron   -> سرویس Worker مجزا یا قفل Redis/Postgres
4. Config & Secrets        -> متغیرهای محیطی (12-Factor App)
5. Logs                    -> چاپ JSON به stdout (نه فایل محلی پراکنده)`,
          explanations: [
            { token: '12-Factor App', meaning: 'مجموعه ۱۲ اصل کلاسیک ساخت سرویس‌های کلود-بومی که `Stateless Processes` قلب آن است.' }
          ]
        }
      ],
      warStory: {
        title: 'ارسال دوگانه تمام صورتحساب‌ها پس از افزایش تعداد کانتینرها به ۲',
        symptom: 'برای افزایش ظرفیت در `billing.example.com` تعداد کانتینرهای اپ را از ۱ به ۲ رساندند؛ فردا صبح همه مشتریان دو بار پیامک و فاکتور گرفتند.',
        rootCause: 'تایمر `node-cron` داخل کد اصلی اپلیکیشن اجرا می‌شد؛ با دو کانتینر، هر دو سر ساعت ۸ صبح کار را اجرا کرده بودند.',
        preventionRule: 'کارهای زمان‌بندی‌شده را در یک کانتینر `scheduler` مجزا اجرا کنید یا پیش از اجرا یک قفل اتمیک (`Advisory Lock` در Postgres یا کلید `Idempotency` روزانه) بگیرید.'
      },
      deepDive: {
        title: 'چرا برای `WebSockets` همچنان به لایه هماهنگ‌کننده (`Redis Pub/Sub`) نیاز است؟',
        content: [
          'در چت زنده با `WebSocket`، کاربر الف به نود ۱ وصل است و کاربر ب به نود ۲. وقتی الف پیامی می‌فرستد، نود ۱ سوکت ب را ندارد!',
          'راه‌حل استاندارد، پخش پیام روی `Redis Pub/Sub` یا `NATS` میان نودهاست تا هر نودی که سوکت کاربر مقصد را نگه داشته پیام را فوراً تحویل دهد.'
        ],
        takeAway: 'اپلیکیشن‌ها را «فانی و قابل تعویض» (`Cattle, not Pets`) بسازید و وضعیت را در لایه داده متمرکز نگه دارید.'
      },
      check: {
        type: 'triage',
        prompt: 'سرویس وب خود را روی ۲ سرور پشت لودبالانسر قرار داده‌اید؛ کاربران گزارش می‌دهند هر چند کلیک یک بار ناگهان از حساب خود بیرون می‌افتند و فایل‌هایی که آپلود کرده‌اند گاهی `404` می‌دهد. علت ریشه‌ای چیست؟',
        options: [
          { id: 'a', label: 'سرویس `Stateless` نیست: سشن‌ها در رم محلی و فایل‌ها در دیسک محلی هر سرور ذخیره شده‌اند؛ باید سشن به `Redis` و فایل‌ها به `S3` منتقل شوند', isCorrect: true, feedback: 'دقیقاً! وقتی درخواست اول روی سرور ۱ می‌نشیند و درخواست دوم روی سرور ۲، سرور ۲ از سشن و فایل محلی سرور ۱ بی‌خبر است.' },
          { id: 'b', label: 'لودبالانسر نباید روی پورت `443` کار کند', isCorrect: false, feedback: 'مشکل از نگهداری وضعیت محلی روی نودهای اپلیکیشن است نه پورت لودبالانسر.' },
          { id: 'c', label: 'باید حجم رم هر دو سرور را دو برابر کرد', isCorrect: false, feedback: 'رم بیشتر دو سرور را با هم همگام نمی‌کند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T07-C06', reason: 'انتقال فایل‌های آپلودی از دیسک محلی به `Object Storage (S3)`.' },
        { targetId: 'T08-C02', reason: 'نگهداری نشست‌های اشتراکی در `Redis`.' }
      ]
    },
    {
      id: 'T12-C06',
      code: 'D03 · T12 · C06',
      domainId: 'D03',
      trackId: 'T12',
      title: 'قضیه CAP، Eventual Consistency و زمان در سیستم‌های توزیع‌شده (چرا ساعت سرورها با NTP دروغ می‌گویند!)',
      subtitle: 'مصالحه‌های بنیادین سیستم‌های توزیع‌شده و دلیل خطرناک بودن اتکا به `Date.now()` برای ترتیب رویدادها.',
      readMinutes: 7,
      difficulty: 'چالشی',
      originStory: [
        'در سال ۲۰۰۰ `Eric Brewer` حدس مشهور `CAP` را مطرح کرد که دو سال بعد توسط پژوهشگران `MIT` به صورت ریاضی اثبات شد. یک دهه بعد در سال ۲۰۱۲، `Cloudflare` به خاطر یک ثانیه کبیسه (`Leap Second`) که ساعت سرور را یک ثانیه به عقب برگرداند دچار قطعی شد چون کد محاسبه فاصله زمانی عدد منفی گرفته و کرش کرده بود!',
        'در سیستم‌های توزیع‌شده دو توهم از دنیای تک‌ماشینی فرو می‌ریزند: «شبکه همیشه وصل است» و «یک ساعت جهانی دقیق وجود دارد».'
      ],
      mentalModel: {
        paragraphs: [
          'قضیه `CAP` به زبان واقعی یعنی: در یک سیستم توزیع‌شده، پارتیشن شبکه (`P` — قطع موقت ارتباط بین دو نود) یک گزینه انتخابی نیست؛ دیر یا زود **حتماً** رخ می‌دهد! در لحظه قطع ارتباط بین دو نود، معمار فقط دو انتخاب دارد: یا `CP` (توقف نوشتن/خواندن برای حفظ سازگاری قطعی — مناسب سیستم مالی و موجودی انبار) یا `AP` (ادامه پاسخ‌دهی با احتمال داده کمی کهنه و همگرایی بعدی `Eventual Consistency` — مناسب لایک‌ها، فید شبکه اجتماعی و DNS).',
          'درباره زمان: هر سرور دو ساعت دارد: ۱) `Wall-Clock` (`Date.now()`) که توسط `NTP` همگام می‌شود و ممکن است ناگهان چند میلی‌ثانیه یا ثانیه به جلو یا **عقب** بپرد! ۲) `Monotonic Clock` (`performance.now()`, `time.monotonic()`) که فقط برای اندازه‌گیری «مدت زمان سپری‌شده» است و هرگز به عقب برنمی‌گردد. برای تعیین ترتیب رویدادها بین دو سرور، ساعت دیواری قابل اعتماد نیست؛ از شمارنده منطقی (`Sequence / Version / Lamport Clock`) استفاده کنید.'
        ],
        rulesOfThumb: [
          'برای اندازه‌گیری `Latency` و `Timeout` هرگز از `Date.now()` (`Wall-Clock`) استفاده نکنید؛ همیشه `Monotonic Clock` (`performance.now()` / `process.hrtime.bigint()`).',
          'قانون `PACELC`: حتی زمانی که شبکه قطع نیست (`Else`), باز هم مصالحه بین تاخیر (`Latency`) و سازگاری (`Consistency`) وجود دارد (تایید همگام روی چند دیتاسنتر = تاخیر بیشتر).',
          'برای حل تعارض آپدیت هم‌زمان (`Last-Write-Wins` بر اساس ساعت کلاینت خطرناک است)، از شماره نسخه افزایشی در سرور (`Optimistic Concurrency: WHERE version = $old`) استفاده کنید.'
        ],
        diagram: {
          kind: 'split',
          caption: 'تصمیم واقعی قضیه CAP در لحظه پارتیشن شبکه (P اجتناب‌ناپذیر است)',
          nodes: [
            { label: 'CP (Consistency over Availability)', sublabel: 'رد درخواست در نود جداافتاده · حیاتی برای پول و قفل‌ها', accent: true },
            { label: 'AP (Eventual Consistency)', sublabel: 'ادامه سرویس + همگرایی بعدی · مناسب کش، DNS و لایک' }
          ]
        }
      },
      lab: [
        {
          title: 'اندازه‌گیری ایمن مدت زمان با Monotonic Clock در برابر تله Wall Clock',
          language: 'ts',
          code: `// بد: اگر NTP وسط کار ساعت را ۵۰ms به عقب برگرداند، عدد منفی می‌شود!
const badStart = Date.now();
// ...
const badDuration = Date.now() - badStart;

// خوب: ساعت یکنواخت (Monotonic) هرگز به عقب نمی‌جهد
const start = performance.now();
// ...
const durationMs = performance.now() - start;`,
          explanations: [
            { token: 'performance.now()', meaning: 'از ساعت سخت‌افزاری یکنواخت سیستم‌عامل می‌خواند و مصون از پرش‌های `NTP` و تغییر ساعت تابستانی است.' }
          ]
        }
      ],
      warStory: {
        title: 'گم شدن آپدیت کاربران به خاطر `Last-Write-Wins` با ساعت گوشی‌ها',
        symptom: 'در اپ یادداشت‌برداری آفلاین `sync.example.com`، یادداشت‌های جدید برخی کاربران بی‌دلیل توسط نسخه قدیمی‌تر لپ‌تاپ بازنویسی و پاک می‌شد.',
        rootCause: 'سرور برای حل تعارض همگام‌سازی به `updated_at` ارسالی از ساعت دستگاه کاربر اعتماد می‌کرد؛ ساعت لپ‌تاپ یکی از کاربران ۵ دقیقه جلوتر از زمان واقعی بود و همیشه برنده می‌شد!',
        preventionRule: 'هرگز برای ترتیب رویدادها یا قفل‌ها به ساعت کلاینت (یا حتی ساعت دیواری سرورهای مختلف) تکیه نکنید؛ از شماره نسخه افزایشی سمت سرور (`revision++`) استفاده نمایید.'
      },
      deepDive: {
        title: 'چطور `Google Spanner` با ساعت‌های اتمی و GPS (`TrueTime`) با عدم قطعیت زمان کنار آمد؟',
        content: [
          'گوگل برای دیتابیس جهانی `Spanner` درون دیتاسنترهایش گیرنده‌های GPS و ساعت‌های اتمی نصب کرد، اما حتی آن هم یک «عدد دقیق» نمی‌دهد بلکه یک «بازه عدم قطعیت» (`[earliest, latest]` حدود چند میلی‌ثانیه) می‌دهد و دیتابیس قبل از `Commit` همان چند میلی‌ثانیه صبر می‌کند (`Commit Wait`) تا ترتیب جهانی تراکنش‌ها تضمین شود.'
        ],
        takeAway: 'در سیستم‌های توزیع‌شده، تواضع در برابر خطای شبکه و زمان، نشانه بلوغ معمار است.'
      },
      check: {
        type: 'recall',
        question: 'تفاوت `Wall-Clock` (`Date.now()`) و `Monotonic Clock` (`performance.now()`) چیست و چرا استفاده از `Date.now()` برای محاسبه Timeout یا زمان اجرای کوئری می‌تواند باگ ایجاد کند؟',
        modelAnswer: '`Wall-Clock` زمان تقویمی را نشان می‌دهد و توسط `NTP` به جلو یا عقب تنظیم می‌شود؛ بنابراین اگر هنگام محاسبه فاصله زمانی، `NTP` ساعت را به عقب برگرداند، مدت زمان منفی می‌شود و یا تایم‌اوت زودتر/دیرتر از موعد رخ می‌دهد. `Monotonic Clock` صرفاً تیک‌های پیوسته رو به جلو می‌شمارد و هرگز به عقب نمی‌جهد، پس تنها منبع مطمئن برای سنجش مدت زمان و Timeout است.'
      },
      crossLinks: [
        { targetId: 'T09-C02', reason: 'سازگاری قوی (`ACID`) در دیتابیس رابطه‌ای در برابر `Eventual Consistency`.' },
        { targetId: 'T07-C01', reason: 'استفاده از `time.perf_counter()` در میدل‌ور اندازه‌گیری زمان پاسخ.' }
      ]
    }
  ]
};

export default t12;
