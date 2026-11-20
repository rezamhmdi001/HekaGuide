import type { TrackContent } from '../../types/atlas';

const t02: TrackContent = {
  trackId: 'T02',
  chapters: [
    {
      id: 'T02-C01',
      code: 'D01 · T02 · C01',
      domainId: 'D01',
      trackId: 'T02',
      title: 'تاریخچه Shell از Bourne تا Bash و Zsh — و تفاوت ساختاری PowerShell ویندوز با Bash (تله‌های Quoting و `$`)',
      subtitle: 'چرا یک دستور ساده بین ترمینال لینوکس و ویندوز رفتاری کاملاً متفاوت دارد و چگونه ایمن اسکریپت بنویسیم.',
      readMinutes: 6,
      difficulty: 'مبانی عمیق',
      originStory: [
        'در سال ۱۹۷۹ `Stephen Bourne` در آزمایشگاه بل `Bourne Shell` (`sh`) را نوشت که زبان اسکریپت‌نویسی سیستم‌عامل‌ها شد. یک دهه بعد پروژه `GNU` نسخه آزاد و غنی‌تر آن یعنی `Bash` (Bourne-Again Shell) را عرضه کرد که تا امروز زبان مادری سرورهای لینوکس و پایپ‌لاین‌های `CI/CD` است.',
        'در سمت دیگر، `Jeffrey Snover` در مایکروسافت سال ۲۰۰۶ متوجه شد ادمین‌های ویندوز به خط فرمان قدرتمند نیاز دارند اما نمی‌خواستند متن خام را با `awk` تکه‌تکه کنند؛ پس `PowerShell` را ساخت که به جای متن، اشیای کامل `.NET` را از طریق `Pipe` عبور می‌دهد. همین تفاوت فلسفی منبع دائمی باگ برای توسعه‌دهندگانی است که بین ویندوز و سرور لینوکس جابه‌جا می‌شوند.'
      ],
      mentalModel: {
        paragraphs: [
          'در `Bash`، دو نوع کوتیشن دنیای کاملاً متفاوتی دارند: درون تک‌کوتیشن (`\'...\'`) هیچ متغیری بسط داده نمی‌شود و همه‌چیز خام می‌ماند؛ اما درون جفت‌کوتیشن (`"..."`) متغیرهایی مثل `$TOKEN` و دستورهایی مثل `$(cmd)` قبل از اجرا جایگزین می‌شوند. رها کردن متغیر بدون کوتیشن (`$FILE`) باعث شکستن نام فایل‌های دارای فاصله (`Word Splitting`) و حوادث وحشتناک می‌شود.',
          'در `PowerShell` علاوه بر اینکه کاراکتر Escape به جای `\\` کاراکتر `` ` `` (بک‌تیک) است، دستوراتی مثل `curl` سال‌ها صرفاً نام مستعار `Invoke-WebRequest` بودند و سینتکس ارسال هدر و بدنه `JSON` با `Bash` تفاوت جدی دارد.'
        ],
        rulesOfThumb: [
          'هر اسکریپت پروداکشن `Bash` را با خط طلایی `set -euo pipefail` شروع کنید تا روی خطا یا متغیر تعریف‌نشده بی‌سروصدا ادامه ندهد.',
          'همیشه متغیرها را در جفت‌کوتیشن بگذارید (`"$VAR"`) و رمزها یا الگوهای Regex را در تک‌کوتیشن (`\'...\'`) تا `$` تفسیر نشود.',
          'در ویندوز برای کار روزمره با ابزارهای لینوکسی و Docker، استفاده از `WSL2` تله‌های `PowerShell` و `CRLF` را یکجا حذف می‌کند.'
        ],
        diagram: {
          kind: 'split',
          caption: 'مقایسه فلسفه جریان داده در Bash در برابر PowerShell',
          nodes: [
            { label: 'Bash / Zsh (Unix)', sublabel: 'جریان متن خام (Byte Stream) · Escape با \\ · Quoting حساس', accent: true },
            { label: 'PowerShell (Windows)', sublabel: 'جریان اشیای ساختاریافته (.NET Objects) · Escape با Backtick' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی استاندارد و امن اسکریپت‌نویسی Bash',
          language: 'bash',
          code: `#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/app"
FILE_NAME="db snapshot.sql"

# امن: حفظ فاصله در نام فایل و جلوگیری از Word Splitting
ls -lh -- "$BACKUP_DIR/$FILE_NAME"

# امن: تک‌کوتیشن جلوی بسط تصادفی $ در رمز عبور را می‌گیرد
printf '%s\n' 'P@ss$WORD_literal'`,
          explanations: [
            { token: 'set -e', meaning: 'به محض اینکه هر دستوری کد خروج غیرصفر برگرداند، اجرای اسکریپت متوقف می‌شود.' },
            { token: 'set -u', meaning: 'استفاده از متغیر تعریف‌نشده به جای جایگزینی با رشته خالی خطا تولید می‌کند (نجات‌دهنده برابر `rm -rf /$EMPTY`).' },
            { token: 'set -o pipefail', meaning: 'اگر دستور اول در یک `Pipe` شکست بخورد، کل خطا گزارش می‌شود نه فقط کد خروج آخرین دستور.' },
            { token: '--', meaning: 'پایان گزینه‌ها را اعلام می‌کند تا فایلی که اسمش با `-` شروع شده اشتباهاً به عنوان فلگ خوانده نشود.' }
          ],
          trap: 'اگر اسکریپت `Bash` را روی ویندوز ذخیره کرده باشید و پایان خطوط آن `CRLF` (`\\r\\n`) باشد، لینوکس خطای عجیب `/usr/bin/env: bash\\r: No such file or directory` می‌دهد؛ با `dos2unix` یا تنظیم `LF` در ادیتور حل می‌شود.'
        }
      ],
      warStory: {
        title: 'حذف کل دایرکتوری ریشه توسط یک متغیر خالی در اسکریپت دیپلوی',
        symptom: 'اسکریپت پاک‌سازی کش پیش از انتشار روی سرور استیجینگ `staging.example.com` کل فایل‌های پیکربندی پوشه `/var` را پاک کرد.',
        rootCause: 'در اسکریپت بدون `set -u` نوشته شده بود `rm -rf /var/$APP_CACHE/*` و به دلیل خطای تایپی نام متغیر، `$APP_CACHE` خالی ارزیابی شد و دستور تبدیل به `rm -rf /var//*` گردید.',
        preventionRule: 'همیشه `set -euo pipefail` و بررسی صریح `${APP_CACHE:?missing var}` را قبل از هر دستور مخرب در اسکریپت‌ها اجباری کنید.'
      },
      deepDive: {
        title: 'چرا `#!/usr/bin/env bash` بهتر از `#!/bin/bash` است و تفاوت `Login` با `Interactive Shell`',
        content: [
          'در برخی سیستم‌ها مثل `macOS` مدرن یا `BSD`، نسخه جدید `bash` در `/usr/local/bin` یا `/opt/homebrew/bin` نصب است؛ `#!/usr/bin/env bash` اولین `bash` موجود در `$PATH` را پیدا می‌کند.',
          'همچنین علت اینکه گاهی متغیرهای `~/.bashrc` در `cron` یا `SSH` غیرتعاملی لود نمی‌شوند این است که شل غیرتعاملی فایل‌های پروفایل کاربر را نمی‌خواند؛ پس اسکریپت‌های خودکار هرگز نباید به تنظیمات محیطی `.bashrc` متکی باشند.'
        ],
        takeAway: 'اسکریپت تولیدی باید کاملاً خودکفا، صریح و مستقل از محیط شخصی ترمینال باشد.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطی را در این اسکریپت پاک‌سازی پیدا کنید که در صورت تعریف نشدن `RELEASE_DIR` فاجعه بار خواهد بود:',
        lines: [
          { lineNumber: 1, code: '#!/usr/bin/env bash' },
          { lineNumber: 2, code: 'APP_NAME="billing"' },
          { lineNumber: 3, code: 'echo "Cleaning old artifacts for $APP_NAME"' },
          { lineNumber: 4, code: 'rm -rf /srv/$RELEASE_DIR/*', isBug: true },
          { lineNumber: 5, code: 'echo "Done"' }
        ],
        explanation: 'بدون `set -u` یا محافظ `${RELEASE_DIR:?}`, اگر متغیر `RELEASE_DIR` ست نشده باشد، خط ۴ به `rm -rf /srv//*` تبدیل می‌شود و تمام سرویس‌های زیر `/srv` را پاک می‌کند!'
      },
      crossLinks: [
        { targetId: 'T13-C04', reason: 'جلوگیری از نشت متغیرهای محیطی و اسرار در دستورهای `Bash` و تاریخچه شل.' },
        { targetId: 'T14-C06', reason: 'اجرای ایمن اسکریپت‌های شل در پایپ‌لاین‌های `GitHub Actions`.' }
      ]
    },
    {
      id: 'T02-C02',
      code: 'D01 · T02 · C02',
      domainId: 'D01',
      trackId: 'T02',
      title: 'جریان‌های استاندارد (`stdin/stdout/stderr`)، Pipeها، Exit Codeها و هنر ترکیب ابزارهای کوچک',
      subtitle: 'زبان مشترک همه ابزارهای Unix برای ساخت پایپ‌لاین‌های لحظه‌ای بدون نوشتن یک خط برنامه.',
      readMinutes: 5,
      difficulty: 'میدانی',
      originStory: [
        'در سال ۱۹۷۳ `Doug McIlroy` در آزمایشگاه بل سال‌ها اصرار داشت که برنامه‌ها باید مثل شلنگ باغچه به هم پیچ شوند. یک شب `Ken Thompson` در یک ساعت، فراخوانی سیستمی `pipe()` و نماد `|` را به `Unix` اضافه کرد و فردای آن روز مهندسان با شگفتی می‌دیدند چطور سه ابزار کوچک در کنار هم کار یک برنامه هزارخطی را انجام می‌دهند.',
        'مدتی بعد متوجه شدند وقتی خطاها قاطی خروجی اصلی می‌شوند، پایپ‌لاین خراب می‌شود؛ پس جریان سوم یعنی `stderr` (`FD 2`) اضافه شد تا داده‌های تمیز از پیام‌های هشدار و خطا جدا بمانند.'
      ],
      mentalModel: {
        paragraphs: [
          'هر پردازش در بدو تولد سه لوله آماده دارد: `0` (`stdin` ورودی)، `1` (`stdout` خروجی داده) و `2` (`stderr` خروجی خطا و لاگ تشخیصی). عملگر `|` خروجی `1` دستور چپ را هم‌زمان و بدون ساخت فایل موقت به ورودی `0` دستور راست وصل می‌کند.',
          'علاوه بر متن، هر برنامه هنگام پایان یک عدد ۰ تا ۲۵۵ به نام `Exit Code` برمی‌گرداند: `0` یعنی موفقیت و هر عدد غیرصفر یعنی خطا. عملگرهای `&&` (اگر موفق بود بعدی را اجرا کن) و `||` (اگر شکست خورد جایگزین را اجرا کن) تمام منطق اتوماسیون خط فرمان را می‌سازند.'
        ],
        rulesOfThumb: [
          'در ابزارهای CLI خود، داده ساخت‌یافته (`JSON` یا نتیجه) را فقط در `stdout` و پیام‌های پیشرفت یا خطا را در `stderr` چاپ کنید تا پایپ‌لاین‌ها نشکنند.',
          'ترتیب ریدایرکت مهم است: `> out.log 2>&1` هر دو جریان را در فایل می‌ریزد، ولی `2>&1 > out.log` خطاها را همچنان روی صفحه نمایش می‌دهد.',
          'از `tee` برای دیدن هم‌زمان خروجی روی ترمینال و ذخیره آن در فایل استفاده کنید.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'سه جریان استاندارد و اتصال Pipe در لینوکس',
          nodes: [
            { label: 'stdin (FD 0)', sublabel: 'ورودی از کیبورد یا فایل' },
            { label: 'Process A', sublabel: 'پردازش جریان داده', accent: true },
            { label: 'stdout (FD 1) | Pipe', sublabel: 'داده تمیز به Process B' },
            { label: 'stderr (FD 2)', sublabel: 'جداگانه به لاگ خطا' }
          ]
        }
      },
      lab: [
        {
          title: 'هدایت دقیق جریان‌ها، ثبت هم‌زمان با tee و بررسی Exit Code',
          language: 'bash',
          code: `# جدا کردن خروجی سالم از خطاها
./sync_users.sh 1> /var/log/sync.out 2> /var/log/sync.err

# ادغام stdout و stderr و ارسال هم‌زمان به صفحه و فایل
./deploy.sh 2>&1 | tee -a /var/log/deploy.log

# زنجیره شرطی بر اساس Exit Code
nginx -t && systemctl reload nginx || echo "Nginx config invalid!" >&2`,
          explanations: [
            { token: '1> ... 2>', meaning: 'خروجی عادی (`FD 1`) و خطاها (`FD 2`) را در دو فایل مجزا ذخیره می‌کند.' },
            { token: '2>&1', meaning: 'توصیف‌گر `2` را به همان مقصدی وصل می‌کند که هم‌اکنون `1` به آن اشاره دارد.' },
            { token: '>&2', meaning: 'پیام خطای دستور `echo` را به درستی به `stderr` می‌فرستد.' }
          ]
        }
      ],
      warStory: {
        title: 'فاسد شدن فایل بکاپ دیتابیس به دلیل یک خط هشدار در `stdout`',
        symptom: 'بکاپ شبانه `db-backup.sql.gz` روی سرور `db.example.com` هنگام تمرین بازیابی خطای `gzip: not in gzip format` داد.',
        rootCause: 'اسکریپت بکاپ ابتدا جمله `echo "Starting dump..."` را در `stdout` چاپ می‌کرد و بعد خروجی `pg_dump` را به همان جریان ریدایرکت کرده بود؛ آن یک خط متن کل هدر باینری فایل فشرده را خراب کرده بود.',
        preventionRule: 'پیام‌های اطلاع‌رسانی در اسکریپت‌های تولیدکننده خروجی باینری را همیشه به `stderr` (`>&2`) بفرستید و کد خروج کل پایپ‌لاین را با `pipefail` چک کنید.'
      },
      deepDive: {
        title: 'بافر داخلی Pipe در کرنل و مفهوم Backpressure طبیعی',
        content: [
          'یک `Pipe` در لینوکس بافری محدود (معمولاً `64KB`) درون حافظه کرنل دارد. اگر دستور سمت چپ خیلی سریع‌تر از دستور سمت راست داده تولید کند و بافر پر شود، کرنل به طور خودکار دستور سمت چپ را متوقف (`Block`) می‌کند تا سمت راست فرصت پردازش پیدا کند.',
          'این یعنی ابزارهای `Unix` بدون هیچ کد اضافه‌ای دارای مکانیزم کنترل فشار برگشتی (`Backpressure`) هستند و می‌توانید یک فایل ۱۰۰ گیگابایتی را روی سروری با ۱ گیگابایت رم پردازش کنید.'
        ],
        takeAway: 'جریان‌های `Pipe` باعث پردازش استریمی با مصرف حافظه ثابت می‌شوند.'
      },
      check: {
        type: 'predict',
        prompt: 'در اسکریپتی که `set -o pipefail` فعال نیست، خط زیر چه `Exit Code`ای (`$?`) برمی‌گرداند؟',
        snippet: `false | true
echo $?`,
        options: [
          { id: 'a', label: '`1` چون دستور `false` شکست خورده است', isCorrect: false, feedback: 'بدون `set -o pipefail`، شل فقط کد خروج آخرین دستور در پایپ (`true`) را برمی‌گرداند.' },
          { id: 'b', label: '`0` چون آخرین دستور (`true`) موفق بوده است و خطای `false` پنهان می‌ماند', isCorrect: true, feedback: 'دقیقاً! به همین دلیل اگر در پایپ `pg_dump | gzip > backup.gz` دستور `pg_dump` کرش کند، بدون `pipefail` سیستم فکر می‌کند بکاپ با موفقیت انجام شده است!' },
          { id: 'c', label: '`127` چون `Pipe` متوقف می‌شود', isCorrect: false, feedback: 'کد `127` برای `command not found` است، نه شکست دستور در پایپ.' }
        ]
      },
      crossLinks: [
        { targetId: 'T01-C01', reason: 'فلسفه `File Descriptor` که پایه وجود `0`, `1`, `2` است.' },
        { targetId: 'T16-C03', reason: 'تضمین سلامت بکاپ‌ها و بررسی کد خروج ابزارهای فشرده‌سازی.' }
      ]
    },
    {
      id: 'T02-C03',
      code: 'D01 · T02 · C03',
      domainId: 'D01',
      trackId: 'T02',
      title: 'مدل مجوزهای Unix (`chmod`, `chown`, `umask`): چرا `0600` برای اسرار حیاتی و `777` یک فاجعه است',
      subtitle: 'درک دقیق بیت‌های rwx، مالکیت فایل و قوانین امنیتی که SSH و کرنل روی آن سختگیرند.',
      readMinutes: 5,
      difficulty: 'میدانی',
      originStory: [
        'زمانی که ده‌ها پژوهشگر به صورت هم‌زمان از طریق ترمینال به یک کامپیوتر `PDP-11` در آزمایشگاه بل وصل می‌شدند، باید راهی سبک وجود می‌داشت تا هر کاربر فایل‌های شخصی خود را از دیگران پنهان کند اما فایل‌های تیمی را با گروهش به اشتراک بگذارد.',
        'راه‌حل `Unix` فقط ۹ بیت حافظه در هر `inode` بود: سه گروه (`Owner`, `Group`, `Others`) و برای هر گروه سه مجوز (`Read=4`, `Write=2`, `Execute=1`). این مدل ساده هنوز ستون فقرات امنیت میلیاردها سرور لینوکس است.'
      ],
      mentalModel: {
        paragraphs: [
          'هر رقم در عدد سه‌رقمی `chmod` جمع سه بیت است: `4` (خواندن)، `2` (نوشتن) و `1` (اجرا). پس `6` یعنی خواندن+نوشتن (`rw-`) و `7` یعنی کامل (`rwx`). کد `0600` یعنی فقط مالک فایل اجازه خواندن و نوشتن دارد و هیچ کاربر یا سرویس دیگری روی سرور حتی نمی‌تواند آن را ببیند.',
          'نکته ظریف درباره پوشه‌ها: بیت `x` (اجرا) روی پوشه به معنای «اجازه عبور و ورود به پوشه» است؛ بدون `x` نمی‌توانید `cd` کنید حتی اگر `r` داشته باشید. همچنین `umask` (معمولاً `0022`) تعیین می‌کند فایل‌های تازه‌ساخته‌شده به صورت پیش‌فرض چه مجوزهایی را نداشته باشند.'
        ],
        rulesOfThumb: [
          'فایل‌های کلید خصوصی `SSH` و `.env` پروداکشن همیشه باید `chmod 0600` باشند.',
          'اجرای `chmod 777` برای رفع خطای `Permission denied` یعنی باز کردن درِ خانه برای حل مشکل گم شدن کلید! همیشه مالک (`chown`) و گروه را درست کنید.',
          'پوشه‌های سرویس وب معمولاً `0750` یا `0755` و فایل‌های کد `0640` یا `0644` تنظیم می‌شوند.'
        ],
        diagram: {
          kind: 'split',
          caption: 'رمزگشایی بیت‌های مجوز در عددهای رایج Unix',
          nodes: [
            { label: '0600 (rw-------)', sublabel: 'اسرار، .env و کلید خصوصی SSH', accent: true },
            { label: '0644 (rw-r--r--)', sublabel: 'فایل‌های پیکربندی عمومی و کد' },
            { label: '0755 (rwxr-xr-x)', sublabel: 'باینری‌های اجرایی و پوشه‌ها' }
          ]
        }
      },
      lab: [
        {
          title: 'تنظیم دقیق مجوز کلید SSH و فایل اسرار اپلیکیشن',
          language: 'bash',
          code: `chmod 0700 ~/.ssh
chmod 0600 ~/.ssh/id_ed25519 /srv/app/.env
chown appuser:appgroup /srv/app/.env
stat -c '%a %U:%G %n' /srv/app/.env`,
          explanations: [
            { token: 'chmod 0700 ~/.ssh', meaning: 'فقط مالک می‌تواند وارد پوشه `.ssh` شود و محتوای آن را ببیند.' },
            { token: 'chmod 0600', meaning: 'دسترسی گروه و سایر کاربران را به طور کامل قطع می‌کند؛ `ssh` اگر کلید خصوصی `0644` باشد از کار امتناع می‌کند.' },
            { token: 'stat -c', meaning: 'مجوز عددی، مالک و گروه فایل را به شکل دقیق و قابل اسکریپت چاپ می‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'سرقت کلید API درگاه پرداخت توسط یک سرویس جانبی آسیب‌پذیر',
        symptom: 'پس از یک آسیب‌پذیری خواندن فایل در یک سرویس کم‌اهمیت گزارش‌گیری روی همان سرور `vps.example.com`، مهاجم توانست به کلیدهای دیتابیس اپلیکیشن اصلی دست پیدا کند.',
        rootCause: 'فایل `/srv/payments/.env` با مجوز `0644` (قابل خواندن برای `Others`) رها شده بود و هر کاربر سیستم‌عاملی روی سرور می‌توانست محتوای آن را بخواند.',
        preventionRule: 'هر سرویس را با کاربر لینوکسی مجزا اجرا کنید و فایل اسرار آن را با مالکیت همان کاربر و مجوز `0600` قفل کنید.'
      },
      deepDive: {
        title: 'رقم چهارم `chmod`: بیت‌های `SUID`, `SGID` و `Sticky Bit`',
        content: [
          'عدد اول در `0600` بی‌دلیل نیست؛ بیت‌های ویژه `SUID (4)`، `SGID (2)` و `Sticky (1)` را کنترل می‌کند. برای مثال فایل `/usr/bin/passwd` دارای `SUID` است تا کاربر معمولی بتواند رمز خودش را در `/etc/shadow` تغییر دهد.',
          'بیت `Sticky` (`1777` روی پوشه `/tmp`) اجازه می‌دهد همه در `/tmp` فایل بسازند، اما هیچ‌کس نتواند فایل کاربر دیگر را حذف کند.'
        ],
        takeAway: 'امنیت لینوکس در لایه فایل‌سیستم، آخرین خط دفاعی در برابر حرکت جانبی مهاجم روی سرور است.'
      },
      check: {
        type: 'triage',
        prompt: 'هنگام اتصال `SSH` با کلید جدید خطای زیر را می‌گیرید. علت و دستور رفع دقیق چیست؟',
        logSnippet: `Permissions 0644 for '/home/dev/.ssh/id_ed25519' are too open.
It is required that your private key files are NOT accessible by others.`,
        options: [
          { id: 'a', label: 'اجرای `chmod 0600 ~/.ssh/id_ed25519` تا فقط مالک اجازه خواندن و نوشتن داشته باشد', isCorrect: true, feedback: 'دقیقاً! کلاینت `OpenSSH` به صورت Fail-Closed از استفاده کلید خصوصی قابل‌خواندن برای دیگران جلوگیری می‌کند.' },
          { id: 'b', label: 'اجرای `chmod 0777 ~/.ssh/id_ed25519` تا SSH بتواند آن را اجرا کند', isCorrect: false, feedback: 'کلید خصوصی فایل اجرایی نیست و `777` وضعیت را بدتر می‌کند.' },
          { id: 'c', label: 'تغییر مالکیت کلید به `root:root` با `chown`', isCorrect: false, feedback: 'اگر مالک `root` شود، کاربر `dev` دیگر نمی‌تواند کلید خودش را بخواند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T13-C04', reason: 'قوانین جامع بهداشت اسرار و نگهداری فایل `.env` در پروداکشن.' },
        { targetId: 'T15-C05', reason: 'حل چالش‌های تطابق `UID/GID` و مجوزها بین هاست و کانتینر داکر.' }
      ]
    },
    {
      id: 'T02-C04',
      code: 'D01 · T02 · C04',
      domainId: 'D01',
      trackId: 'T02',
      title: 'کاربران، گروه‌ها، `sudoers` و امتیازات پنهان (چرا عضویت در گروه `docker` معادل `root` است)',
      subtitle: 'اصل کمترین دسترسی در سرور لینوکس و راه‌های پنهان ارتقای سطح دسترسی.',
      readMinutes: 6,
      difficulty: 'چالشی',
      originStory: [
        'در سال ۱۹۸۰ `Bob Coggeshall` و `Cliff Spencer` در دانشگاه ایالتی نیویورک ابزار `sudo` را نوشتند تا دیگر لازم نباشد رمز کاربر `root` را به همه ادمین‌ها بدهند. هدف روشن بود: اجرای یک دستور خاص با امتیاز بالاتر و ثبت ردپای دقیق آن در لاگ امنیتی.',
        'اما با ظهور اکوسیستم کانتینرها یک سوءتفاهم خطرناک رایج شد: مهندسان برای اینکه مجبور نباشند قبل از هر دستور داکر `sudo` بزنند، کاربران معمولی را به گروه `docker` اضافه کردند غافل از اینکه این کار کل مرز بین کاربر معمولی و `root` را از بین می‌برد.'
      ],
      mentalModel: {
        paragraphs: [
          'سرویس `dockerd` با دسترسی کامل `root` روی هاست اجرا می‌شود و از طریق سوکت یونیکس `/var/run/docker.sock` دستور می‌گیرد. هر کاربری که عضو گروه `docker` باشد می‌تواند بدون رمز عبور به این سوکت بگوید: «کل فایل‌سیستم `/` هاست را داخل یک کانتینر با کاربر `root` مانت کن». در ۲ ثانیه فایل `/etc/shadow` یا `/etc/sudoers` در اختیار اوست.',
          'اصل «کمترین امتیاز» (`Least Privilege`) می‌گوید هر سرویس (`nginx`, `postgres`, `app`) باید با کاربر اختصاصی بدون شل (`/usr/sbin/nologin`) اجرا شود و دسترسی‌های `sudo` به جای `ALL` تا حد امکان به دستورات مشخص محدود گردند.'
        ],
        rulesOfThumb: [
          'عضویت یک کاربر در گروه `docker` از نظر امنیتی کاملاً معادل `NOPASSWD: ALL` در `sudoers` است.',
          'فایل `sudoers` را هرگز مستقیم با `nano` یا `vim` ویرایش نکنید؛ همیشه از `visudo` استفاده کنید که پیش از ذخیره خطای نحوی را چک می‌کند تا از سرور قفل نشوید.',
          'برای سرویس‌های پس‌زمینه کاربر سیستمی بدون پوشه Home و بدون شل بسازید (`useradd -r -s /usr/sbin/nologin`).'
        ],
        diagram: {
          kind: 'flow',
          caption: 'چرا عضویت در گروه docker مسیر مستقیم به دسترسی root است',
          nodes: [
            { label: 'User in docker group', sublabel: 'دسترسی نوشتن روی docker.sock' },
            { label: 'dockerd (root)', sublabel: 'اجرای کانتینر با -v /:/host' },
            { label: 'Full Host Root', sublabel: 'ویرایش /etc/sudoers و کل هاست', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'ساخت کاربر کم‌امتیاز برای سرویس و تعریف قاعده دقیق sudoers',
          language: 'bash',
          code: `# ساخت کاربر سیستمی غیرتعاملی برای سرویس اپلیکیشن
sudo useradd --system --no-create-home --shell /usr/sbin/nologin appuser

# افزودن مجوز محدود و ایمن در /etc/sudoers.d/deploy (توسط visudo)
# deploy ALL=(root) NOPASSWD: /usr/bin/systemctl reload myapp.service
sudo visudo -f /etc/sudoers.d/deploy

# بررسی گروه‌ها و مجوزهای فعلی کاربر
id && sudo -l`,
          explanations: [
            { token: '--shell /usr/sbin/nologin', meaning: 'اجازه لاگین تعاملی به کاربر سرویس را می‌بندد حتی اگر کسی بخواهد با آن وارد شل شود.' },
            { token: '/etc/sudoers.d/', meaning: 'به جای دستکاری فایل اصلی `/etc/sudoers`، قواعد را در فایل‌های ماژولار قرار دهید تا آپدیت سیستم‌عامل آن‌ها را بازنویسی نکند.' },
            { token: 'visudo -f', meaning: 'قبل از اعمال تغییرات، سینتکس فایل را اعتبارسنجی می‌کند تا `sudo` روی کل سرور از کار نیفتد.' }
          ]
        }
      ],
      warStory: {
        title: 'تصرف کامل سرور از طریق کاربر CI/CD عضو گروه docker',
        symptom: 'مهاجم پس از نفوذ به یک Runner موقت تست روی سرور `build.example.com`، توانست کلیدهای SSH روت و بکاپ دیتابیس را سرقت کند.',
        rootCause: 'کاربر `ci-runner` برای اجرای بیلدها عضو گروه `docker` شده بود. مهاجم یک کانتینر `alpine` با `-v /:/mnt` اجرا کرد و کل فایل‌سیستم هاست را خواند.',
        preventionRule: 'بیلدهای CI را روی ماشین‌های ایزوله و فانی (`Ephemeral`) اجرا کنید یا از `Rootless Docker` / `Podman` استفاده نمایید و کاربر سرویس‌ها را هرگز عضو گروه `docker` نکنید.'
      },
      deepDive: {
        title: 'قابلیت‌های ریزدانه کرنل (`Linux Capabilities`)',
        content: [
          'قدیم برای اینکه یک وب‌سرور بتواند به پورت `443` (زیر ۱۰۲۴) وصل شود، مجبور بود با دسترسی کامل `root` شروع شود. امروز لینوکس قدرت `root` را به ده‌ها قطعه کوچک به نام `Capabilities` شکسته است.',
          'مثلاً با دادن صرفاً `CAP_NET_BIND_SERVICE` به یک باینری یا سرویس `systemd`، برنامه می‌تواند پورت `80/443` را باز کند بدون اینکه هیچ‌یک از قدرت‌های خطرناک `root` را داشته باشد.'
        ],
        takeAway: 'همیشه کمترین قابلیت مورد نیاز را بدهید، نه کل تاج‌وتخت `root` را.'
      },
      check: {
        type: 'recall',
        question: 'یک همکار پیشنهاد می‌کند برای راحت شدن کاربر `deploy` از زدن رمز، او را عضو گروه `docker` کنیم اما دسترسی `sudo` ندهیم تا امنیت حفظ شود. اشکال امنیتی این استدلال چیست؟',
        modelAnswer: 'گروه `docker` دسترسی کامل به سوکت `/var/run/docker.sock` می‌دهد که توسط `dockerd` با امتیاز `root` اداره می‌شود. کاربر می‌تواند با یک دستور `docker run -v /:/host -it alpine chroot /host` در چند ثانیه دسترسی کامل `root` روی کل هاست بگیرد؛ پس این کار عملاً معادل دادن `sudo` نامحدود بدون رمز است.'
      },
      crossLinks: [
        { targetId: 'T13-C02', reason: 'محدود کردن دسترسی `Root` در لایه `SSH` و مدیریت امن `authorized_keys`.' },
        { targetId: 'T15-C02', reason: 'اجرای کانتینرها با کاربر غیر-root (`USER 10001`) برای کاهش سطح حمله.' }
      ]
    },
    {
      id: 'T02-C05',
      code: 'D01 · T02 · C05',
      domainId: 'D01',
      trackId: 'T02',
      title: 'جراحی متن و لاگ در ترمینال: کاربرد واقعی `grep`, `awk`, `sed`, `cut`, `find`, `xargs` و `jq`',
      subtitle: 'چطور در ۳۰ ثانیه وسط ۱۰ گیگابایت لاگ پروداکشن ریشه خطای ۵۰۰ را پیدا کنید.',
      readMinutes: 7,
      difficulty: 'میدانی',
      originStory: [
        'در سال ۱۹۷۳ مدیر آزمایشگاه بل از `Ken Thompson` خواست ابزاری بسازد تا در متون کهن به دنبال الگو بگردد. کن در یک شب کد جستجوی Regex ویرایشگر `ed` (`g/re/p`) را جدا کرد و نامش را `grep` گذاشت. چند سال بعد `Aho`, `Weinberger` و `Kernighan` زبان پردازش ستونی `awk` را ساختند که حرف اول نام خانوادگی خودشان بود.',
        'امروز با رایج شدن لاگ‌های `JSON`، ابزار `jq` به این خانواده طلایی پیوسته است. مهندسی که این چند ابزار را بلد باشد، در بحران پروداکشن نیازی به دانلود فایل ۵ گیگابایتی روی لپ‌تاپ خود ندارد.'
      ],
      mentalModel: {
        paragraphs: [
          'هر ابزار یک تخصص مشخص دارد: `grep` (یا جایگزین سریع‌ترش `rg`) خط‌ها را فیلتر می‌کند، `awk` روی ستون‌ها محاسبه و تجمیع انجام می‌دهد، `sed` جایگزینی جریانی انجام می‌دهد، `find` فایل‌ها را پیدا می‌کند و `xargs` نتایج را به شکل دسته‌ای و موازی به دستور بعدی تحویل می‌دهد.',
          'وقتی لاگ‌ها ساختار `JSON Lines` دارند، به جای Regex شکننده روی متن، `jq` ساختار کلید-مقدار را با دقت صددرصدی فیلتر و استخراج می‌کند.'
        ],
        rulesOfThumb: [
          'برای پیدا کردن ۱۰ آدرس `IP` پرتکرار در لاگ Nginx، ترکیب `awk | sort | uniq -c | sort -nr | head` سریع‌تر از باز کردن هر داشبوردی است.',
          'هنگام اتصال `find` به `xargs` همیشه از `-print0 | xargs -0` استفاده کنید تا نام فایل‌های دارای فاصله باعث خطا نشوند.',
          'برای لاگ‌های `JSON` هرگز با `sed` و `grep` کورکورانه جراحی نکنید؛ `jq` بسازید تا در فیلدهای چندخطی نشکند.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'پایپ‌لاین استاندارد تحلیل فوری لاگ در ترمینال',
          nodes: [
            { label: 'grep / jq', sublabel: 'فیلتر دقیق خطاهای 5xx' },
            { label: 'awk / cut', sublabel: 'استخراج ستون IP یا مسیر' },
            { label: 'sort | uniq -c', sublabel: 'شمارش فراوانی هر کلید', accent: true },
            { label: 'sort -nr | head', sublabel: 'نمایش ۱۰ مقصر اصلی' }
          ]
        }
      },
      lab: [
        {
          title: 'شکار سریع خطاهای 5xx در لاگ Nginx و تحلیل لاگ‌های JSON با jq',
          language: 'bash',
          code: `# ۱۰ مسیر URL که بیشترین خطای 500 را داده‌اند در لاگ Nginx
awk '$9 >= 500 {print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 10

# استخراج خطاهای کندتر از 1 ثانیه از لاگ JSON سرویس
jq -r 'select(.level == "error" and .duration_ms > 1000) | [.ts, .request_id, .path, .duration_ms] | @tsv' app.jsonl

# حذف ایمن فایل‌های موقت قدیمی‌تر از ۷ روز با مدیریت فاصله در نام‌ها
find /var/tmp/uploads -type f -mtime +7 -print0 | xargs -0 rm -f`,
          explanations: [
            { token: 'awk \'$9 >= 500\'', meaning: 'ستون نهم لاگ استاندارد Nginx (کد وضعیت HTTP) را چک و ستون هفتم (مسیر درخواست) را چاپ می‌کند.' },
            { token: 'uniq -c', meaning: 'خطوط تکراری مجاور را می‌شمارد (به همین دلیل قبلش باید `sort` اجرا شود).' },
            { token: 'jq -r ... @tsv', meaning: 'خروجی خام بدون کوتیشن و جداشده با Tab می‌سازد تا در ترمینال یا اکسل خوانا باشد.' }
          ]
        }
      ],
      warStory: {
        title: 'تلف شدن دو ساعت زمان بحران به دلیل اسکن دستی لاگ',
        symptom: 'سرویس `checkout.example.com` با موجی از خطاهای `504` مواجه شد و تیم در حال اسکرول کردن دستی لاگ‌ها و جستجو در داشبوردی بود که خودش زیر بار کند شده بود.',
        rootCause: 'مهندس ارشد وارد سرور شد و با یک خط `awk` ظرف ۱۵ ثانیه دید ۹۴٪ تایم‌اوت‌ها فقط روی یک endpoint خاص (`/api/v1/shipping/quote`) و فقط برای یک شهر خاص رخ می‌دهد که سرویس پستی بیرونی روی آن هنگ می‌کرد.',
        preventionRule: 'ساختار لاگ را از روز اول `JSON` استاندارد کنید و چند دستور آماده تحلیل سریع را در Runbook تیم نگه دارید.'
      },
      deepDive: {
        title: 'چرا `LC_ALL=C grep` گاهی ۱۰ برابر سریع‌تر از `grep` معمولی است؟',
        content: [
          'به صورت پیش‌فرض `grep` در `UTF-8` قواعد پیچیده تطبیق کاراکترهای یونیکد را بررسی می‌کند. اگر صرفاً دنبال یک کلید انگلیسی، آدرس `IP` یا کد `request_id` در یک فایل ۲۰ گیگابایتی هستید، تنظیم `LC_ALL=C` به `grep` می‌گوید بایت‌به‌بایت ساده (`ASCII`) جستجو کند.',
          'همچنین فلگ `-F` (`Fixed String`) موتور Regex را خاموش می‌کند و الگوریتم سریع تطبیق رشته ثابت را فعال می‌سازد.'
        ],
        takeAway: 'در فایل‌های عظیم، `LC_ALL=C grep -F "req_8f21"` در کسری از ثانیه نتیجه می‌دهد.'
      },
      check: {
        type: 'predict',
        prompt: 'اگر در پایپ‌لاین شمارش IPها، دستور اول `sort` را جا بیندازید (`awk \'{print $1}\' access.log | uniq -c`), چه اتفاقی می‌افتد؟',
        snippet: `awk '{print $1}' access.log | uniq -c`,
        options: [
          { id: 'a', label: '`uniq` خطای سینتکس می‌دهد و اجرا نمی‌شود', isCorrect: false, feedback: '`uniq` هیچ خطایی نمی‌دهد و بی‌سروصدا نتیجه غلط تولید می‌کند.' },
          { id: 'b', label: '`uniq` فقط خطوط تکراری «کنار هم» را ادغام می‌کند، بنابراین یک IP بارها در خروجی تکرار و شمارش خرد می‌شود', isCorrect: true, feedback: 'دقیقاً! `uniq` برای مصرف حافظه `O(1)` فقط خط فعلی را با خط قبلی مقایسه می‌کند؛ پس بدون `sort` قبلی، آمارتان کاملاً اشتباه خواهد بود.' },
          { id: 'c', label: 'همه IPها درست شمرده می‌شوند اما مرتب نیستند', isCorrect: false, feedback: 'خیر، تکراری‌های غیرمجاور اصلاً با هم جمع نمی‌شوند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T16-C04', reason: 'طراحی `Structured JSON Logs` برای جستجوی دقیق و ردیابی با `request_id`.' },
        { targetId: 'T02-C02', reason: 'فلسفه اتصال `stdout` ابزارها به یکدیگر از طریق `Pipe`.' }
      ]
    },
    {
      id: 'T02-C06',
      code: 'D01 · T02 · C06',
      domainId: 'D01',
      trackId: 'T02',
      title: 'مدیریت سرویس‌ها با `systemd`، نوشتن Unit File تمیز، خواندن `journalctl` و زمان‌بندی با `cron` و Timers',
      subtitle: 'تبدیل یک اسکریپت شکننده به سرویس پایدار پروداکشن با بازیابی خودکار و لاگ ساخت‌یافته.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'تا حدود سال ۲۰۱۰ لینوکس از اسکریپت‌های ترتیبی `SysVinit` استفاده می‌کرد؛ بالا آمدن سرورها کند بود و اگر یک سرویس در ۳ بامداد کرش می‌کرد، تا وقتی ادمین دستی آن را بالا نمی‌آورد خاموش می‌ماند. بسیاری به راه‌حل‌های موقت مثل `nohup` یا `screen` پناه می‌بردند.',
        '`Lennart Poettering` و `Kay Sievers` با طراحی `systemd` (به عنوان `PID 1`) همه‌چیز را یکپارچه کردند: راه‌اندازی موازی، مدیریت وابستگی‌ها، ری‌استارت خودکار پس از کرش، محدودسازی منابع با `cgroups` و جمع‌آوری متمرکز لاگ در `journald`.'
      ],
      mentalModel: {
        paragraphs: [
          'یک `Unit File` در مسیر `/etc/systemd/system/myapp.service` سه بخش اصلی دارد: `[Unit]` (توضیح و ترتیب بالا آمدن مثل `After=network-online.target`)، `[Service]` (کاربر، مسیر اجرا، فایل محیطی `EnvironmentFile` و سیاست `Restart=on-failure`) و `[Install]` (هدف فعال‌سازی در بوت سرور).',
          'ابزار `journalctl` لاگ‌های تمام سرویس‌ها را به شکل ایندکس‌شده و با قابلیت فیلتر زمانی (`--since "10 minutes ago"`) نمایش می‌دهد. همچنین `systemd Timers` جایگزین مدرن `cron` هستند که هم لاگ دقیق در `journalctl` ثبت می‌کنند و هم در صورت خاموش بودن سرور هنگام زمان اجرا می‌توانند کار عقب‌افتاده را اجرا کنند (`Persistent=true`).'
        ],
        rulesOfThumb: [
          'هرگز سرویس پروداکشن را با `nohup`, `tmux` یا `&` بالا نیاورید؛ یک `systemd` Unit File بیست‌خطی بنویسید.',
          'پس از هر تغییر در فایل `.service`، اجرای `systemctl daemon-reload` الزامی است.',
          'در کنار `Restart=on-failure` حتماً `RestartSec=3` بگذارید تا کرش مکرر، `CPU` را در یک حلقه بی‌نهایت نسوزاند.'
        ],
        diagram: {
          kind: 'cycle',
          caption: 'چرخه نظارت و خودترمیمی سرویس تحت کنترل systemd (PID 1)',
          nodes: [
            { label: 'Unit File (.service)', sublabel: 'تعریف User، Env و Limits' },
            { label: 'Start & cgroup', sublabel: 'اجرا با سقف RAM/FD', accent: true },
            { label: 'journald', sublabel: 'ثبت خودکار stdout/stderr' },
            { label: 'Crash -> RestartSec', sublabel: 'بازیابی خودکار سرویس' }
          ]
        }
      },
      lab: [
        {
          title: 'نمونه Unit File تمیز و سخت‌سازی‌شده برای یک سرویس پروداکشن',
          language: 'ini',
          code: `[Unit]
Description=Orders API Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=appuser
Group=appgroup
WorkingDirectory=/srv/orders
EnvironmentFile=/srv/orders/.env
ExecStart=/usr/bin/node /srv/orders/dist/server.js
Restart=on-failure
RestartSec=3
LimitNOFILE=65535
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/srv/orders/data

[Install]
WantedBy=multi-user.target`,
          explanations: [
            { token: 'EnvironmentFile', meaning: 'متغیرها را از فایل `0600` می‌خواند بدون اینکه رمزها داخل فایل عمومی `.service` نوشته شوند.' },
            { token: 'LimitNOFILE=65535', meaning: 'سقف `File Descriptor` این سرویس را برای ترافیک بالا افزایش می‌دهد.' },
            { token: 'NoNewPrivileges & ProtectSystem', meaning: 'قابلیت‌های سخت‌سازی داخلی `systemd` که تقریباً کل فایل‌سیستم را برای سرویس فقط‌خواندنی می‌کنند.' }
          ]
        }
      ],
      warStory: {
        title: 'خاموش ماندن سرویس پس از ریبوت امنیتی دیتاسنتر',
        symptom: 'پس از یک ریبوت برنامه‌ریزی‌شده کرنل در سرور `bot.example.com`، سرویس اصلی ۳ ساعت پایین ماند تا اینکه مشتریان گزارش دادند.',
        rootCause: 'مهندس سرویس را ماه‌ها قبل با `systemctl start mybot` بالا آورده بود ولی هرگز `systemctl enable mybot` را نزده بود (تا لینک بوت ساخته شود)؛ بنابراین پس از ریبوت سرور، `systemd` آن را استارت نکرد.',
        preventionRule: 'همیشه از `systemctl enable --now myapp.service` استفاده کنید و با `systemctl is-enabled` مطمئن شوید.'
      },
      deepDive: {
        title: 'تله‌های `cron` کلاسیک در برابر `systemd Timers`',
        content: [
          'در `cron` کلاسیک، متغیر `$PATH` بسیار محدود است (`/usr/bin:/bin`) و اگر خروجی دستور به جایی هدایت نشود یا فایل قفل (`flock`) نداشته باشید، ممکن است اجرای یک کار کند با اجرای بعدی تداخل کند و دو نسخه هم‌زمان دیتابیس را خراب کنند.',
          '`systemd Timer` به طور ذاتی از اجرای هم‌زمان همان سرویس جلوگیری می‌کند و تاریخچه اجرای هر دفعه را با کد خروج دقیق در `journalctl -u backup.service` نگه می‌دارد.'
        ],
        takeAway: 'برای کارهای زمان‌بندی‌شده حساس، `systemd Timer` یا `flock` روی `cron` از تداخل فاجعه‌بار جلوگیری می‌کند.'
      },
      check: {
        type: 'triage',
        prompt: 'فایل `/etc/systemd/system/api.service` را ویرایش کردید و `LimitNOFILE` را بالا بردید، سپس `systemctl restart api` زدید اما محدودیت تغییر نکرده و هشدار `changed on disk` می‌بینید. چه گامی جا افتاده است؟',
        logSnippet: `Warning: The unit file, source configuration file or drop-ins of api.service changed on disk.`,
        options: [
          { id: 'a', label: 'اجرای `sudo systemctl daemon-reload` و سپس `sudo systemctl restart api`', isCorrect: true, feedback: 'دقیقاً! `systemd` فایل‌های Unit را در حافظه کش می‌کند؛ بدون `daemon-reload` نسخه قدیمی را اجرا می‌کند.' },
          { id: 'b', label: 'ریبوت کامل سرور برای خوانده شدن فایل جدید', isCorrect: false, feedback: 'اصلاً نیازی به ریبوت نیست؛ `daemon-reload` در کسری از ثانیه پیکربندی را بازخوانی می‌کند.' },
          { id: 'c', label: 'اجرای `chmod +x /etc/systemd/system/api.service`', isCorrect: false, feedback: 'فایل `.service` یک فایل پیکربندی متنی است و نباید بیت اجرایی داشته باشد (`0644`).' }
        ]
      },
      crossLinks: [
        { targetId: 'T01-C04', reason: 'نقش `PID 1` و ارسال `SIGTERM` در خاموش‌سازی تمیز سرویس‌ها.' },
        { targetId: 'T16-C04', reason: 'ارسال لاگ‌های `journald` به سیستم مشاهده‌پذیری متمرکز.' }
      ]
    }
  ]
};

export default t02;
