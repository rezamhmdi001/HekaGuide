import type { TrackContent } from '../../types/atlas';

const t14: TrackContent = {
  trackId: 'T14',
  chapters: [
    {
      id: 'T14-C01',
      code: 'D04 · T14 · C01',
      domainId: 'D04',
      trackId: 'T14',
      title: 'داستان ۱۰ روزه لینوس توروالدز (۲۰۰۵): Git به عنوان Content-Addressable Filesystem (`blob`, `tree`, `commit`)',
      subtitle: 'لغو لایسنس BitKeeper که گیت را خلق کرد و مدل ذخیره‌سازی محتوامحور درون پوشه `.git`.',
      readMinutes: 6,
      difficulty: 'مبانی عمیق',
      originStory: [
        'در آوریل ۲۰۰۵ شرکت صاحب نرم‌افزار تجاری `BitKeeper` به دلیل اختلاف با یکی از توسعه‌دهندگان کرنل، لایسنس رایگان خود را از جامعه `Linux` پس گرفت! `Linus Torvalds` بدون ابزار کنترل نسخه برای هزاران توسعه‌دهنده کرنل ماند و از تمام ابزارهای کند و متمرکز آن زمان (`CVS`, `SVN`) بیزار بود.',
        'لینوس ۱۰ روز کار روی کرنل را متوقف کرد و خودش یک «فایل‌سیستم محتوامحور» به زبان C نوشت که سرعت برق داشت، کاملاً توزیع‌شده بود و صحت کل تاریخچه را با هش رمزنگاری تضمین می‌کرد. او نامش را `Git` گذاشت — و کل دنیای نرم‌افزار را برای همیشه تسخیر کرد.'
      ],
      mentalModel: {
        paragraphs: [
          'راز درک عمیق `Git` بدون ترس این است: گیت در واقع یک دیتابیس کلید-مقدار ساده درون پوشه `.git/objects` است که فقط ۳ شیء اصلی دارد: ۱) `blob` (محتوای فشرده‌شده یک فایل، بدون نام فایل!)، ۲) `tree` (معادل یک پوشه که نام فایل‌ها را به هش `blob`ها و زیردرخت‌ها وصل می‌کند)، ۳) `commit` (اشاره‌گر به یک `tree` ریشه + هش کامیت والد + نویسنده و پیام).',
          'به همین دلیل گیت `Snapshot` (عکس کامل لحظه‌ای) نگه می‌دارد نه لیست تغییرات (`Diff`)؛ و اگر دو فایل یا دو نسخه محتوای یکسان داشته باشند دقیقاً یک `blob` مشترک دارند. هر تغییری در حتی یک بایت از یک فایل قدیمی، هش `blob`، `tree`، `commit` و تمام کامیت‌های بعدی را عوض می‌کند (دقیقاً شبیه ساختار `Merkle Tree`!).'
        ],
        rulesOfThumb: [
          'اگر پوشه `.git` را به عنوان پایگاه‌داده اشیای تغییرناپذیر بشناسید، دیگر هیچ دستور گیتی برایتان «جادوی سیاه» نخواهد بود.',
          'کامیت کردن فایل‌های باینری غول‌پیکر (ویدیو، بکاپ دیتابیس، `node_modules`) تاریخچه `.git` را برای همیشه سنگین می‌کند حتی اگر در کامیت بعدی پاکشان کنید.',
          'دستور `git cat-file -p <hash>` پنجره مستقیم شما به درون اشیای `blob`, `tree` و `commit` است.'
        ],
        diagram: {
          kind: 'layers',
          caption: 'سه شیء بنیادین درون .git/objects (فایل‌سیستم محتوامحور)',
          nodes: [
            { label: 'commit (e3a9f1...)', sublabel: 'parent: 9b2c10 · tree: 4d8a22 · author + message', accent: true },
            { label: 'tree (4d8a22...)', sublabel: 'src/ -> tree 7c11... · README.md -> blob a19f...' },
            { label: 'blob (a19f...)', sublabel: 'محتوای خام فشرده‌شده فایل با کلید SHA-1/SHA-256' }
          ]
        }
      },
      lab: [
        {
          title: 'بازرسی مستقیم اشیای داخلی Git بدون هیچ ابزار جانبی',
          language: 'bash',
          code: `# مشاهده ساختار واقعی آخرین کامیت (tree و parent)
git cat-file -p HEAD

# مشاهده محتوای درخت (فهرست فایل‌ها و هش blob آن‌ها)
git cat-file -p HEAD^{tree}

# بررسی حجم واقعی پایگاه داده .git
git count-objects -vH`,
          explanations: [
            { token: 'git cat-file -p', meaning: 'شیء فشرده‌شده درون `.git/objects` را به شکل خوانا نمایش می‌دهد.' },
            { token: 'git count-objects -vH', meaning: 'تعداد و حجم اشیای شل و فشرده‌شده (`packfile`) را به شما می‌گوید.' }
          ]
        }
      ],
      warStory: {
        title: 'مخزن ۲.۵ گیگابایتی که کلون کردنش در CI ده دقیقه طول می‌کشید',
        symptom: 'مخزن کد یک اپلیکیشن سبک TypeScript روی `git clone` بیش از ۲.۵ گیگابایت دانلود می‌کرد با اینکه کل فایل‌های فعلی آن فقط ۴ مگابایت بود.',
        rootCause: 'ماه اول پروژه کسی فایل `dump.sql` و چند ویدیوی دموی ۵۰۰ مگابایتی را کامیت کرده و در کامیت بعدی پاک کرده بود، اما آن `blob`های تغییرناپذیر برای همیشه درون `.git/objects` باقی مانده بودند.',
        preventionRule: 'از `.gitignore` دقیق و `git-filter-repo` (در صورت نیاز به پاک‌سازی تاریخچه) استفاده کنید و باینری‌های بزرگ را در `S3` یا `Git LFS` نگه دارید.'
      },
      deepDive: {
        title: 'چرا وقتی هر کامیت یک Snapshot است، مخزن Git این‌قدر کوچک می‌ماند؟',
        content: [
          'در هر کامیت، فایل‌هایی که تغییر نکرده‌اند دوباره کپی نمی‌شوند بلکه صرفاً به همان هش `blob` قبلی اشاره می‌کنند. علاوه بر این، گیت به صورت دوره‌ای (`git gc`) اشیای مشابه را درون فایل‌های فشرده `packfile` با فشرده‌سازی دلتا (`Delta Compression`) کنار هم می‌چیند.'
        ],
        takeAway: 'ساختار تغییرناپذیر و محتوامحور Git همان ایده‌ای است که بعدها الهام‌بخش لایه‌های ایمیج داکر و بیلدهای تکرارپذیر شد.'
      },
      check: {
        type: 'recall',
        question: 'اگر یک فایل ۵۰۰ مگابایتی را سهواً کامیت کنید و در کامیت بعدی با `git rm` آن را حذف و کامیت کنید، آیا حجم مخزن `.git` کوچک می‌شود؟ چرا؟',
        modelAnswer: 'خیر! چون هر `commit` در گیت تغییرناپذیر است و کامیت قبلی همچنان به `tree` و `blob` آن فایل ۵۰۰ مگابایتی اشاره می‌کند تا تاریخچه قابل بازسازی باشد. برای کوچک کردن واقعی مخزن باید تاریخچه را بازنویسی کرد (مثلاً با `git filter-repo`) و اشیای بدون ارجاع را پاکسازی نمود.'
      },
      crossLinks: [
        { targetId: 'T15-C02', reason: 'شباهت شگفت‌انگیز اشیای تغییرناپذیر محتوامحور Git با لایه‌های `OverlayFS` در Docker.' },
        { targetId: 'T04-C02', reason: 'نقش توابع هش (`SHA-1/SHA-256`) در یکپارچگی محتوامحور.' }
      ]
    },
    {
      id: 'T14-C02',
      code: 'D04 · T14 · C02',
      domainId: 'D04',
      trackId: 'T14',
      title: 'گراف DAG، برنچ‌ها و `HEAD`: در لحظه `git commit`, `switch` و `detached HEAD` درون `.git` چه می‌گذرد',
      subtitle: 'چرا برنچ در گیت فقط یک فایل ۴۱ بایتی است و detached HEAD اصلاً ترسناک نیست.',
      readMinutes: 5,
      difficulty: 'میدانی',
      originStory: [
        'در سیستم‌های قدیمی مثل `SVN` ساخت یک برنچ (`Branch`) معادل کپی کردن کل پوشه پروژه روی سرور بود و دقیقه‌ها طول می‌کشید؛ بنابراین توسعه‌دهندگان از برنچ ساختن فراری بودند. در `Git`، برنچ صرفاً یک فایل متنی ۴۱ بایتی است که هش یک کامیت را نگه می‌دارد! ساختن ۱۰۰ برنچ کمتر از یک میلی‌ثانیه زمان می‌برد.',
        'همین مدل ساده، فرهنگ مدرن «یک برنچ سبک برای هر فیچر یا باگ» را به وجود آورد.'
      ],
      mentalModel: {
        paragraphs: [
          'کل تاریخچه پروژه شما یک «گراف جهت‌دار بدون دور» (`DAG`) از کامیت‌هاست که هر کامیت به والد(های) خود اشاره می‌کند. یک **برنچ** (مثل `.git/refs/heads/main`) فقط یک برچسب متحرک روی یک گره از این گراف است؛ وقتی کامیت جدید می‌زنید، برنچ فعال یک قدم جلو می‌رود.',
          'فایل `.git/HEAD` نشان می‌دهد «الان کجای گراف ایستاده‌اید»: در حالت عادی `HEAD` به نام یک برنچ اشاره می‌کند (`ref: refs/heads/main`). وقتی مستقیم یک کامیت قدیمی یا یک `Tag` را چک‌اوت می‌کنید، `HEAD` مستقیم به هش آن کامیت اشاره می‌کند؛ این حالت همان `detached HEAD` است! اگر در این حالت کامیت بزنید گم نمی‌شود، فقط کافی است با `git switch -c my-fix` یک برنچ رویش بگذارید تا به آن برچسب بدهید.'
        ],
        rulesOfThumb: [
          'به جای دستور مبهم قدیمی `git checkout`، از دستورات جدید و شفاف `git switch` (برای جابه‌جایی برنچ) و `git restore` (برای برگرداندن فایل‌ها) استفاده کنید.',
          'اگر پیام `detached HEAD` دیدید نترسید؛ با `git switch -c rescue-branch` تمام کارتان را فوری به یک برنچ واقعی تبدیل کنید.',
          'حذف یک برنچ (`git branch -d`) فقط آن فایل ۴۱ بایتی را پاک می‌کند؛ خود کامیت‌ها تا حداقل ۳۰ روز در `reflog` و دیتابیس اشیا زنده‌اند.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'ساختار واقعی گراف کامیت‌ها، برنچ‌ها و اشاره‌گر HEAD',
          nodes: [
            { label: 'C1 <- C2 <- C3', sublabel: 'گراف تغییرناپذیر DAG کامیت‌ها' },
            { label: 'refs/heads/main -> C3', sublabel: 'برنچ فقط یک فایل ۴۱ بایتی اشاره‌گر است' },
            { label: 'HEAD -> ref: main', sublabel: 'مکان فعلی شما (یا مستقیم روی هش = detached)', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'دیدن محتوای واقعی HEAD و برنچ‌ها درون .git + دستورات مدرن switch/restore',
          language: 'bash',
          code: `# دیدن محتوای واقعی اشاره‌گر HEAD و برنچ main
cat .git/HEAD
cat .git/refs/heads/main

# ساخت و رفتن به برنچ جدید (مدرن و شفاف)
git switch -c feat/search-index

# بازگرداندن تغییرات ذخیره‌نشده یک فایل بدون دستکاری برنچ
git restore src/App.tsx`,
          explanations: [
            { token: 'git switch -c', meaning: 'جایگزین خواناتر `git checkout -b` که فقط برای برنچ‌هاست.' },
            { token: 'git restore', meaning: 'تغییرات `Working Tree` یا `Staging Area` (`--staged`) را به شکل شفاف برمی‌گرداند.' }
          ]
        }
      ],
      warStory: {
        title: 'وحشت از «پاک شدن ۳ ساعت کد» در حالت detached HEAD',
        symptom: 'توسعه‌دهنده‌ای برای تست یک تگ قدیمی (`v1.2.0`) آن را چک‌اوت کرد، ۳ ساعت کد نوشت و دو کامیت زد، بعد `git switch main` زد و دید هیچ اثری از کامیت‌هایش نیست!',
        rootCause: 'کامیت‌ها روی `detached HEAD` ثبت شده بودند و چون هیچ برنچی به آن‌ها اشاره نمی‌کرد در `git log` برنچ `main` دیده نمی‌شدند — ولی اصلاً پاک نشده بودند!',
        preventionRule: 'همیشه با `git reflog` هش آخرین کامیت قبل از `switch` را پیدا کنید و با `git switch -c recovered <hash>` ظرف ۵ ثانیه کل کارتان را برگردانید.'
      },
      deepDive: {
        title: 'سه فضای گیت: `Working Tree`، `Index (Staging Area)` و `HEAD`',
        content: [
          'فایل `.git/index` همان ناحیه `Staging` است که به شما اجازه می‌دهد حتی بخش‌هایی از یک فایل تغییرکرده (`git add -p`) را در یک کامیت تمیز و منطقی ثبت کنید و بقیه تغییرات را برای کامیت دوم نگه دارید.'
        ],
        takeAway: 'وقتی برنچ‌ها و `HEAD` را صرفاً اشاره‌گرهایی روی گراف `DAG` ببینید، ترس از گیت برای همیشه می‌ریزد.'
      },
      check: {
        type: 'triage',
        prompt: 'در حالت `detached HEAD` دو کامیت مهم زده‌اید و قبل از اینکه متوجه شوید به برنچ `main` برگشته‌اید. آیا آن دو کامیت برای همیشه از بین رفته‌اند؟',
        options: [
          { id: 'a', label: 'خیر! کامیت‌ها هنوز در `.git/objects` هستند؛ با `git reflog` هش آخرین کامیت را پیدا و با `git switch -c rescue <hash>` آن را نجات می‌دهیم', isCorrect: true, feedback: 'دقیقاً! گیت تا پیش از اجرای `gc` (معمولاً ۳۰ تا ۹۰ روز) هیچ کامیت ثبت‌شده‌ای را پاک نمی‌کند.' },
          { id: 'b', label: 'بله، در `detached HEAD` اصلاً کامیتی روی دیسک ذخیره نمی‌شود', isCorrect: false, feedback: 'کامیت کاملاً روی دیسک ذخیره می‌شود؛ فقط هیچ برنچی به آن اشاره نمی‌کند.' },
          { id: 'c', label: 'فقط با `git push --force` برمی‌گردند', isCorrect: false, feedback: 'هرگز برای بازیابی محلی `force push` نزنید؛ این مشکل کاملاً محلی و با `reflog` قابل حل است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T14-C04', reason: 'آشنایی کامل با جعبه‌ابزار نجات `git reflog` و `reset`.' },
        { targetId: 'T14-C01', reason: 'فهم دقیق اشیای `commit` و `tree` که این گراف را می‌سازند.' }
      ]
    },
    {
      id: 'T14-C03',
      code: 'D04 · T14 · C03',
      domainId: 'D04',
      trackId: 'T14',
      title: '`Merge` در برابر `Rebase` و `Cherry-pick`: کی تاریخچه را خطی کنیم و قانون طلایی عدم Rebase روی برنچ مشترک',
      subtitle: 'مقایسه دقیق ساخت کامیت Merge با بازنویسی تاریخچه و جلوگیری از فاجعه force push.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'کمتر بحثی بین تیم‌های نرم‌افزاری به اندازه جنگ `Merge vs Rebase` داغ بوده است! دلیلش این است که هر دو ابزار عالی‌اند اما برای موقعیت‌های متفاوت: `Merge` تاریخچه واقعی و دقیق انشعاب‌ها را حفظ می‌کند، در حالی که `Rebase` کامیت‌های برنچ شخصی شما را تمیز روی آخرین نسخه `main` می‌چیند تا تاریخچه مثل یک کتاب خوانا و خطی بماند.',
        'فاجعه فقط وقتی رخ می‌دهد که کسی «قانون طلایی Rebase» را بشکند و تاریخچه یک برنچ مشترک را بازنویسی و `force push` کند.'
      ],
      mentalModel: {
        paragraphs: [
          'تفاوت فنی در گراف `DAG`: `git merge` یک کامیت جدید با **دو والد** می‌سازد و هیچ کامیت قبلی را تغییر نمی‌دهد. اما `git rebase` کامیت‌های شما را برمی‌دارد و نسخه‌های **جدید با هش‌های کاملاً جدید** روی پایه تازه می‌سازد! به همین دلیل قانون طلایی این است: «هرگز کامیت‌هایی را که روی برنچ مشترک با دیگران (مثل `main`) پوش شده‌اند `Rebase` نکنید» چون گراف تاریخچه هم‌تیمی‌هایتان را دو شاخه می‌کند.',
          '`git cherry-pick <hash>` نیز یک کامیت مشخص (مثلاً یک `Hotfix` حیاتی) را بدون آوردن کل برنچ، روی برنچ فعلی کپی می‌کند. هنگام نیاز به پوش کردن برنچ شخصی پس از Rebase نیز هرگز `--force` کورکورانه نزنید؛ همیشه از `--force-with-lease` استفاده کنید تا اگر هم‌تیمی کامیتی پوش کرده بود، کارش را پاک نکنید!'
        ],
        rulesOfThumb: [
          'برنچ شخصی خودتان پیش از Merge را می‌توانید با `git rebase main` و `git rebase -i` (Squash کردن کامیت‌های شلخته «wip/fix typo») تمیز کنید.',
          'روی `main` و برنچ‌های مشترک، هرگز تاریخچه را بازنویسی نکنید؛ فقط `Merge`، `Squash & Merge` در PR، یا برای لغو خطا `git revert`.',
          'به جای `git push --force` همیشه `git push --force-with-lease` را عادت کنید.'
        ],
        diagram: {
          kind: 'split',
          caption: 'تفاوت ساختاری Merge (حفظ گراف واقعی) با Rebase (ساخت کامیت‌های جدید خطی)',
          nodes: [
            { label: 'git merge', sublabel: 'ساخت Merge Commit دووالده · بدون تغییر هش‌های قبلی · امن برای مشترک' },
            { label: 'git rebase', sublabel: 'بازپخش کامیت‌ها با هش جدید روی main · تاریخچه خطی فقط برای برنچ شخصی', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'تمیز کردن برنچ شخصی با Rebase و پوش ایمن با --force-with-lease',
          language: 'bash',
          code: `# به‌روزرسانی برنچ شخصی روی آخرین نسخه main به شکل خطی
git fetch origin
git rebase origin/main

# ادغام تمیز ۳ کامیت آخر در یک کامیت معنادار پیش از PR
git rebase -i HEAD~3

# پوش امن پس از Rebase روی برنچ شخصی (هرگز --force خام نزنید!)
git push --force-with-lease origin feat/search-index`,
          explanations: [
            { token: '--force-with-lease', meaning: 'فقط وقتی پوش را می‌پذیرد که برنچ ریموت همان هشی باشد که شما آخرین بار دیده‌اید؛ جلوی نابود کردن کار همکار را می‌گیرد.' },
            { token: 'git cherry-pick <sha>', meaning: 'اعمال یک کامیت مشخص (مثل رفع باگ فوری) روی برنچ `release` بدون ادغام کل فیچرهای ناتمام.' }
          ]
        }
      ],
      warStory: {
        title: 'پاک شدن دو روز کار تیم به خاطر `git push --force` روی برنچ مشترک',
        symptom: 'در یک پروژه تیمی، سه کامیت تازه ادغام‌شده دو مهندس دیگر ناگهان از برنچ `develop` ناپدید شد.',
        rootCause: 'توسعه‌دهنده سوم برنچ مشترک `develop` را محلی `rebase` کرده بود و بدون `fetch` با `git push --force` نسخه قدیمی‌تر خودش را جایگزین سرور کرده بود.',
        preventionRule: 'در GitHub تنظیم `Branch Protection` را فعال کنید تا `Force Push` و حذف روی `main/develop` در سطح سرور به کلی مسدود شود.'
      },
      deepDive: {
        title: 'آپشن فوق‌العاده `git pull --rebase` و `rerere`',
        content: [
          'تنظیم `git config --global pull.rebase true` جلوی ساخت ده‌ها کامیت بی‌ارزش `Merge branch "main" of github.com...` هنگام کار روی یک برنچ را می‌گیرد.',
          'همچنین `git config --global rerere.enabled true` (Reuse Recorded Resolution) باعث می‌شود گیت نحوه حل Conflictهای تکراری شما را به خاطر بسپارد و در Rebaseهای بعدی خودکار اعمال کند!'
        ],
        takeAway: 'تاریخچه گیت تمیز، بهترین ابزار برای فهم چرایی کد در ۶ ماه آینده و اجرای بی‌دردسر `git bisect` است.'
      },
      check: {
        type: 'triage',
        prompt: 'یک کامیت باگ‌دار ۲ ساعت پیش روی `main` پوش شده و بقیه اعضای تیم روی آن برنچ جدید ساخته‌اند. بهترین راه لغو آن کامیت چیست؟',
        options: [
          { id: 'a', label: 'اجرای `git revert <bad-commit>` و پوش کامیت جدید روی `main` بدون بازنویسی تاریخچه مشترک', isCorrect: true, feedback: 'دقیقاً! `git revert` یک کامیت جدید با اثر معکوس اضافه می‌کند، تاریخچه هم‌تیمی‌ها را نمی‌شکند و با `Branch Protection` کاملاً سازگار است.' },
          { id: 'b', label: 'اجرای `git reset --hard HEAD~1` و `git push --force origin main`', isCorrect: false, feedback: 'بازنویسی تاریخچه `main` مشترک باعث تداخل شدید برای کل تیم می‌شود و در مخازن حفاظت‌شده مسدود است.' },
          { id: 'c', label: 'حذف کل مخزن از GitHub و ساخت مجدد آن', isCorrect: false, feedback: 'بدیهی است که هم کارها و هم Issue/PRها را نابود می‌کند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T14-C06', reason: 'فعال کردن `Branch Protection` در GitHub برای مسدود کردن `force push`.' },
        { targetId: 'T14-C04', reason: 'تفاوت دقیق `git revert` با `git reset`.' }
      ]
    },
    {
      id: 'T14-C04',
      code: 'D04 · T14 · C04',
      domainId: 'D04',
      trackId: 'T14',
      title: 'جعبه‌ابزار نجات: `git reflog`، تفاوت `reset --soft/--mixed/--hard`، `git revert` و `git bisect` برای شکار کامیت خرابکار',
      subtitle: 'چطور کدهای «پاک‌شده» را برگردانید و بین ۲۰۰ کامیت، مقصر باگ را در ۸ گام پیدا کنید.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'هر برنامه‌نویسی یک بار اشتباهاً `git reset --hard` زده یا وسط یک `rebase` گیر کرده و با عرق سرد فکر کرده کار کل هفته نابود شده است! اما `Git` یک «جعبه سیاه هواپیما» روی سیستم شما دارد به نام `reflog` که هر حرکت `HEAD` را برای حداقل ۳۰ تا ۹۰ روز ثبت می‌کند.',
        'در کنار آن، ابزار `git bisect` جستجوی دودویی را روی تاریخچه کامیت‌ها پیاده کرده و یکی از سریع‌ترین سلاح‌های دیباگ در تاریخ مهندسی نرم‌افزار است.'
      ],
      mentalModel: {
        paragraphs: [
          'تفاوت دقیق سه حالت `git reset` (روی برنچ محلی): ۱) `--soft`: فقط برنچ را عقب می‌برد و تغییرات را آماده در `Staging` نگه می‌دارد (عالی برای اصلاح پیام یا ادغام چند کامیت). ۲) `--mixed` (پیش‌فرض): برنچ را عقب می‌برد و تغییرات را در فایل‌های شما نگه می‌دارد اما از `Staging` خارج می‌کند. ۳) `--hard`: هم برنچ و هم `Staging` و هم فایل‌های دیسک را به حالت کامیت هدف برمی‌گرداند (**تغییرات کامیت‌نشده** را واقعاً پاک می‌کند!).',
          'قانون طلایی نجات: هر چیزی که حداقل یک بار `git commit` شده باشد (حتی اگر `reset --hard` زده باشید یا برنچ را حذف کرده باشید) با `git reflog` ظرف ۱۰ ثانیه برمی‌گردد! در مقابل، برای لغو یک کامیت روی برنچ عمومی/مشترک، به جای `reset` از `git revert` استفاده می‌کنیم که یک کامیت جدید با تغییرات معکوس می‌سازد.'
        ],
        rulesOfThumb: [
          'قبل از `git reset --hard` مطمئن شوید هیچ تغییر کامیت‌نشده مهمی ندارید (یا اول یک `git stash -u` بزنید).',
          'وقتی `rebase` یا `merge` خراب شد، `git reflog` را باز کنید، ردیف `HEAD@{n}` قبل از حادثه را ببینید و `git reset --hard HEAD@{n}` بزنید تا زمان به عقب برگردد!',
          'با `git bisect run npm test` می‌توانید شکار کامیت مقصر را ۱۰۰٪ خودکار کنید و بروید یک قهوه بریزید.'
        ],
        diagram: {
          kind: 'split',
          caption: 'تأثیر سه حالت git reset روی سه فضای گیت',
          nodes: [
            { label: '--soft', sublabel: 'فقط HEAD/Branch عقب می‌رود · تغییرات Staged می‌مانند' },
            { label: '--mixed (پیش‌فرض)', sublabel: 'HEAD + Staging عقب می‌روند · فایل‌های Working Tree سالم‌اند' },
            { label: '--hard', sublabel: 'هر سه فضا عقب می‌روند · تغییرات کامیت‌نشده حذف می‌شوند!', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'بازیابی کامیت گمشده با reflog و شکار خودکار باگ با git bisect',
          language: 'bash',
          code: `# دیدن جعبه سیاه تمام جابه‌جایی‌های HEAD در مخزن محلی
git reflog -n 10

# برگرداندن برنچ دقیقاً به حالت پیش از یک rebase اشتباه
git reset --hard HEAD@{3}

# شکار خودکار اولین کامیتی که تست را شکسته است
git bisect start HEAD v1.0.0
git bisect run npx --yes tsx --test src/utils/atlasLogic.test.ts
git bisect reset`,
          explanations: [
            { token: 'HEAD@{3}', meaning: 'اشاره‌گر به موقعیت ۳ حرکت قبلِ `HEAD` در تاریخچه محلی `reflog`.' },
            { token: 'git bisect reset', meaning: 'پس از یافتن کامیت مقصر، شما را به برنچ اصلی برمی‌گرداند.' }
          ]
        }
      ],
      warStory: {
        title: 'نجات ریلیز شبانه از یک Rebase ناموفق در ۱۵ ثانیه',
        symptom: 'مهندسی وسط `git rebase` دچار ۲۰ Conflict شد، دستپاچه شد و چند فایل را اشتباهی با `--ours` بازنویسی کرد و فکر کرد کل برنچ ۵ روزه خراب شده است.',
        rootCause: 'هیچ چیز از بین نرفته بود؛ نسخه سالم ۵ دقیقه پیش دقیقاً در خط `HEAD@{4}: checkout: moving...` در `git reflog` ثبت شده بود.',
        preventionRule: 'هرگز با وحشت پوشه `.git` را پاک نکنید یا کلون مجدد نگیرید؛ همیشه اول `git reflog` را بخوانید.'
      },
      deepDive: {
        title: 'چرا تغییرات کامیت‌نشده پس از `reset --hard` برنمی‌گردند؟',
        content: [
          '`reflog` فقط تغییرات اشاره‌گر `HEAD` و برنچ‌ها را روی اشیای ذخیره‌شده در `.git/objects` ثبت می‌کند. اگر فایلی هرگز `git add` یا `git commit` نشده باشد، شیء `blob` برایش در دیتابیس ساخته نشده و `reset --hard` مستقیم آن را روی دیسک بازنویسی می‌کند.',
          'عادت «کامیت‌های کوچک و مکرر روی برنچ شخصی» هم خیال شما را راحت می‌کند و هم تاریخچه را قابل بازیابی نگه می‌دارد.'
        ],
        takeAway: '`reflog` تور ایمنی محلی شماست و `revert` دکمه برگشت ایمن تیمی.'
      },
      check: {
        type: 'predict',
        prompt: 'آخرین کامیت محلی شما پیام اشتباهی دارد و می‌خواهید آن را با کامیت قبلی ادغام کنید بدون اینکه کدهای تغییرکرده پاک شوند و حتی می‌خواهید تغییرات آماده کامیت (`Staged`) بمانند. کدام دستور دقیق‌ترین است؟',
        snippet: `git reset _____ HEAD~1`,
        options: [
          { id: 'a', label: '`--soft`', isCorrect: true, feedback: 'دقیقاً! `git reset --soft HEAD~1` فقط برنچ را یک کامیت عقب می‌برد و کل تغییرات آن کامیت را آماده در `Staging Area` نگه می‌دارد تا فوری کامیت تمیز جدید بزنید.' },
          { id: 'b', label: '`--hard`', isCorrect: false, feedback: '`--hard` تغییرات آن کامیت را از فایل‌های شما هم پاک می‌کند.' },
          { id: 'c', label: '`--mixed`', isCorrect: false, feedback: '`--mixed` فایل‌ها را حفظ می‌کند اما از `Staging` خارجشان می‌کند و دوباره باید `git add` بزنید.' }
        ]
      },
      crossLinks: [
        { targetId: 'T11-C05', reason: 'استفاده از `git bisect` به عنوان ابزار `Binary Search` در دیباگ علمی.' },
        { targetId: 'T14-C02', reason: 'چرا `HEAD` و برنچ‌ها صرفاً اشاره‌گرهای قابل جابه‌جایی هستند.' }
      ]
    },
    {
      id: 'T14-C05',
      code: 'D04 · T14 · C05',
      domainId: 'D04',
      trackId: 'T14',
      title: 'دیسیپلین انتشار در Git: `.gitignore`، درخت تمیز (`git status --porcelain`)، Semantic Versioning (`v0.1.0`) و Annotated Tags',
      subtitle: 'قواعد نسخه‌گذاری شفاف و جلوگیری از انتشار فایل‌های آزمایشی روی سرور.',
      readMinutes: 5,
      difficulty: 'میدانی',
      originStory: [
        'جمله «روی سیستم من که کار می‌کرد!» اغلب ریشه در یک فایل `untracked` یا تغییر محلی کامیت‌نشده دارد که در پوشه توسعه‌دهنده بوده ولی هرگز وارد مخزن نشده است. در کنار آن، نام‌گذاری نسخه‌ها مثل `final_v2_real_new` هیچ اطلاعاتی به مصرف‌کننده درباره شکستن سازگاری نمی‌دهد.',
        'استاندارد `Semantic Versioning (SemVer)` توسط `Tom Preston-Werner` (هم‌بنیان‌گذار گیت‌هاب) زبان مشترکی برای کل صنعت ساخت: سه عدد ساده `MAJOR.MINOR.PATCH`.'
      ],
      mentalModel: {
        paragraphs: [
          'در `SemVer` (`v2.4.1`): عدد اول (`MAJOR`) فقط وقتی تغییر ناسازگار (`Breaking Change`) می‌دهید بالا می‌رود؛ عدد دوم (`MINOR`) برای افزودن قابلیت جدید با حفظ سازگاری عقب‌رو؛ عدد سوم (`PATCH`) برای رفع باگ بدون تغییر قرارداد. نسخه `0.x.y` نشان‌دهنده مرحله توسعه اولیه پیش از تثبیت API عمومی است.',
          'برای علامت‌گذاری نسخه‌های انتشار در گیت همیشه از `Annotated Tag` (`git tag -a v1.2.0 -m "..."`) استفاده کنید نه `Lightweight Tag`؛ چون تگ Annotated خودش یک شیء کامل با نام نویسنده، تاریخ، پیام و قابلیت امضای رمزنگاری (`-s`) است. همچنین اسکریپت‌های انتشار باید با چک `git status --porcelain` مطمئن شوند هیچ تغییر کامیت‌نشده‌ای در درخت کار نیست تا خروجی بیلد ۱۰۰٪ با هش `git rev-parse HEAD` تطابق داشته باشد.'
        ],
        rulesOfThumb: [
          'در اسکریپت‌های بیلد و انتشار، اگر `git status --porcelain` خروجی غیرخالی داشت، بیلد را متوقف (`Fail`) کنید تا نسخه کثیف (`dirty`) منتشر نشود.',
          'فایل `.gitignore` فقط فایل‌های جدید را نادیده می‌گیرد؛ اگر فایلی قبلاً کامیت شده، باید یک بار `git rm --cached <file>` بزنید تا از ردیابی خارج شود.',
          'به‌خاطر داشته باشید `git push` به صورت پیش‌فرض تگ‌ها را پوش نمی‌کند؛ باید صراحتاً `git push origin v1.2.0` بزنید.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'گام‌های دیسیپلین انتشار تمیز از کد تا Annotated Tag',
          nodes: [
            { label: 'Clean Tree Check', sublabel: 'git status --porcelain == empty' },
            { label: 'Tests & Build Green', sublabel: 'tsc + unit tests + npm run build' },
            { label: 'Annotated Tag (SemVer)', sublabel: 'git tag -a v1.3.0 -> Trigger CI Release', accent: true }
          ]
        }
      },
      lab: [
        {
          title: 'گیت چک تمیز بودن مخزن و ساخت Annotated Tag استاندارد',
          language: 'bash',
          code: `# تضمین اینکه هیچ تغییر کامیت‌نشده یا فایل آزمایشی در مسیر نیست
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Working tree is dirty. Commit or clean first." >&2
  exit 1
fi

# ساخت تگ نسخه‌گذاری رسمی با متادیتای کامل و ارسال آن
git tag -a v1.3.0 -m "Release v1.3.0: add hybrid search and WAL backup"
git push origin v1.3.0`,
          explanations: [
            { token: 'git status --porcelain', meaning: 'خروجی کوتاه و پایدار ماشین‌خوان؛ اگر مخزن کاملاً تمیز باشد دقیقاً رشته خالی برمی‌گرداند.' },
            { token: 'git tag -a', meaning: 'تگ `Annotated` می‌سازد که `git describe` و سیستم‌های انتشار روی آن تکیه می‌کنند.' }
          ]
        }
      ],
      warStory: {
        title: 'انتشار نسخه پروداکشن همراه با کدهای دیباگ موقت روی لپ‌تاپ',
        symptom: 'اپلیکیشن `api.example.com` پس از یک دیپلوی دستی شروع به چاپ کردن توکن‌های تست در کنسول و دور زدن بررسی ایمیل کرد.',
        rootCause: 'توسعه‌دهنده ایمیج داکر را روی لپ‌تاپ خودش با فایل‌های تغییریافته کامیت‌نشده بیلد کرده و مستقیم به رجیستری پوش کرده بود؛ کامیت گیت با کد واقعی روی سرور هم‌خوانی نداشت!',
        preventionRule: 'بیلدهای پروداکشن فقط باید از یک درخت تمیز در `CI` (روی یک `Tag` یا `Commit SHA` مشخص) ساخته شوند و `BUILD_COMMIT` را داخل خودشان حک کنند.'
      },
      deepDive: {
        title: 'استاندارد `Conventional Commits` برای تولید خودکار Changelog',
        content: [
          'نوشتن پیام کامیت با پیشوندهای ساده مثل `feat:`, `fix:`, `refactor:`, `docs:` و `feat!:` (برای تغییر ناسازگار) باعث می‌شود هم تاریخچه با یک نگاه قابل اسکن باشد و هم ابزارهای CI بتوانند نسخه بعدی `SemVer` و یادداشت‌های انتشار (`CHANGELOG.md`) را خودکار بسازند.'
        ],
        takeAway: 'انضباط کوچک در `.gitignore`، تمیزی درخت و `SemVer` جلوی آشفتگی‌های بزرگ انتشار را می‌گیرد.'
      },
      check: {
        type: 'triage',
        prompt: 'فایل `.env` را به `.gitignore` اضافه کرده‌اید اما `git status` همچنان تغییرات `.env` را برای کامیت نشان می‌دهد. علت و دستور رفع چیست؟',
        options: [
          { id: 'a', label: 'این فایل قبلاً در مخزن `tracked` بوده است؛ با `git rm --cached .env` آن را از ردیابی گیت خارج می‌کنیم بدون اینکه فایل محلی از روی دیسک پاک شود (و اگر قبلاً پوش شده، اسرارش را `Rotate` می‌کنیم)', isCorrect: true, feedback: 'دقیقاً! `.gitignore` روی فایل‌هایی که از قبل در `Index` ثبت شده‌اند اثر نمی‌گذارد تا زمانی که با `--cached` از ردیابی خارج شوند.' },
          { id: 'b', label: 'باید نام `.gitignore` را به `gitignore.txt` تغییر داد', isCorrect: false, feedback: 'نام استاندارد و الزامی دقیقاً `.gitignore` است.' },
          { id: 'c', label: 'اجرای `rm -rf .git` برای ریست شدن قوانین', isCorrect: false, feedback: 'پاک کردن `.git` کل تاریخچه پروژه را نابود می‌کند!' }
        ]
      },
      crossLinks: [
        { targetId: 'T16-C01', reason: 'استفاده از همین تگ‌ها و `BUILD_COMMIT` برای `Build Provenance` واقعی در پروداکشن.' },
        { targetId: 'T13-C04', reason: 'اسکن خودکار مخزن در برابر نشت اسرار.' }
      ]
    },
    {
      id: 'T14-C06',
      code: 'D04 · T14 · C06',
      domainId: 'D04',
      trackId: 'T14',
      title: 'جریان کار تیمی GitHub: Pull Request، Code Review سازنده، Branch Protection و ساخت پایپ‌لاین CI/CD با GitHub Actions',
      subtitle: 'تبدیل کیفیت کد از «حافظه افراد» به دروازه‌های خودکار قبل از Merge.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'پیش از همه‌گیر شدن `Continuous Integration (CI)`، تیم‌ها هفته‌ها جداگانه کد می‌زدند و شب قبل از انتشار در یک «روز ادغام جهنمی» (`Integration Hell`) می‌دیدند کدها با هم کامپایل نمی‌شوند. ترکیب `Pull Request`ها، `Branch Protection` و `GitHub Actions` کیفیت را به یک ربات خستگی‌ناپذیر سپرد که در هر کامیت، کل پروژه را می‌سازد و تست می‌کند.',
        'به همان اندازه، فرهنگ `Code Review` انسانی کیفیت معماری و انتقال دانش تیم را بالا می‌برد — به شرطی که بر «کد و رفتار سیستم» متمرکز باشد نه بر ایرادگیری از سبک سلیقه‌ای (که کار `Prettier/ESLint` است!).'
      ],
      mentalModel: {
        paragraphs: [
          'یک جریان کار تیمی بالغ ۴ ستون دارد: ۱) **PRهای کوچک و متمرکز**: یک PR دویست‌خطی در ۱۰ دقیقه با دقت بالا بررسی می‌شود و باگ‌هایش پیدا می‌شود؛ یک PR سه‌هزارخطی فقط یک `LGTM` سرسری می‌گیرد! ۲) **Branch Protection روی `main`**: مسدود کردن پوش مستقیم و `force push`، اجباری کردن سبز شدن چک‌های CI (`lint`, `typecheck`, `test`, `build`) پیش از Merge.',
          '۳) **پایپ‌لاین CI سریع**: نصب وابستگی با `npm ci` (قابل تکرار از روی lockfile) + کش کردن وابستگی‌ها + اجرای موازی Lint، Test و Build. ۴) **CD کنترل‌شده**: انتشار خودکار روی محیط Staging پس از Merge و استقرار امن روی Production پس از تایید یا ایجاد تگ نسخه.'
        ],
        rulesOfThumb: [
          'در `CI` همیشه از `npm ci` (نه `npm install`) استفاده کنید تا دقیقاً نسخه‌های قفل‌شده در `package-lock.json` نصب شوند.',
          'در `GitHub Actions` همیشه مجوز `permissions` را حداقل (`contents: read`) بگذارید و اکشن‌های شخص ثالث را به `Commit SHA` کامل پین کنید.',
          'در `Code Review` بحث درباره فاصله و نقطه‌ویرگول را به `Formatter/Linter` بسپارید و وقت انسانی را روی منطق، امنیت، حالات مرزی و نام‌گذاری بگذارید.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'دروازه کیفیت خودکار در Pull Request و GitHub Actions',
          nodes: [
            { label: 'Small PR (< 300 lines)', sublabel: 'توضیح چرایی + اسکرین‌شات تغییر UI' },
            { label: 'GitHub Actions CI', sublabel: 'npm ci -> typecheck -> unit tests -> build', accent: true },
            { label: 'Human Review + Protection', sublabel: 'بررسی معماری و امنیت -> Squash Merge به main' },
            { label: 'CD Deploy', sublabel: 'ساخت آرتیفکت تغییرناپذیر + انتشار' }
          ]
        }
      },
      lab: [
        {
          title: 'فایل کامل و سریع GitHub Actions CI برای پروژه TypeScript / Vite',
          language: 'yaml',
          code: `name: CI Quality Gate
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsx --test src/utils/atlasLogic.test.ts
      - run: npm run build`,
          explanations: [
            { token: 'permissions: contents: read', meaning: 'اصل کمترین امتیاز برای `GITHUB_TOKEN`؛ اگر یک پکیج آلوده شد نتواند به مخزن پوش کند.' },
            { token: 'cache: npm', meaning: 'کش کردن دانلود پکیج‌ها برای سریع نگه داشتن اجرای CI زیر ۱ دقیقه.' }
          ]
        }
      ],
      warStory: {
        title: 'شکست بیلد پروداکشن به خاطر تغییر خاموش یک زیرپکیج در `npm install`',
        symptom: 'بدون تغییر کد، پایپ‌لاین انتشار جمعه شب با خطای تایپ‌اسکریپت روی یک کتابخانه ثالث شکست خورد.',
        rootCause: 'در اسکریپت CI به جای `npm ci` از `npm install` استفاده شده بود که نسخه فرعی تازه‌منتشرشده یک وابستگی باگ‌دار را نادیده گرفتن قفل دقیق نصب کرده بود.',
        preventionRule: 'همیشه `lockfile` را کامیت کنید و در CI و `Dockerfile` منحصراً از `npm ci` استفاده نمایید.'
      },
      deepDive: {
        title: 'تله‌های امنیتی `pull_request_target` در GitHub Actions',
        content: [
          'در مخازن متن‌باز، استفاده ناآگاهانه از تریگر `pull_request_target` همراه با چک‌اوت کد PR بیرونی به مهاجم اجازه می‌دهد کد خودش را با دسترسی کامل به `Repository Secrets` شما اجرا کند!',
          'برای PRهای معمولی همیشه از تریگر امن `pull_request` استفاده کنید که در یک محیط ایزوله و بدون دسترسی به Secrets اجرا می‌شود.'
        ],
        takeAway: 'اتوماسیون CI یعنی هرگز برای جلوگیری از خطاهای قابل پیشگیری به حافظه و حال خوب انسان‌ها تکیه نکنیم.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'خطی در این پایپ‌لاین `GitHub Actions` پیدا کنید که می‌تواند باعث نصب نسخه‌های غیرقابل تکرار پکیج‌ها و شکست ناگهانی بیلد در CI شود:',
        lines: [
          { lineNumber: 1, code: 'steps:' },
          { lineNumber: 2, code: '  - uses: actions/checkout@v4' },
          { lineNumber: 3, code: '  - uses: actions/setup-node@v4' },
          { lineNumber: 4, code: '  - run: npm install', isBug: true },
          { lineNumber: 5, code: '  - run: npm run build' }
        ],
        explanation: 'خط ۴ از `npm install` به جای `npm ci` استفاده کرده است! `npm ci` سریع‌تر است، دقیقاً درخت وابستگی‌های `package-lock.json` را بدون دستکاری نصب می‌کند و در صورت ناسازگاری `package.json` و lockfile فوراً خطا می‌دهد.'
      },
      crossLinks: [
        { targetId: 'T11-C04', reason: 'انواع تست‌هایی که باید درون گیت CI اجرا شوند.' },
        { targetId: 'T16-C01', reason: 'انتقال آرتیفکت ساخته‌شده در CI با `Image Digest Parity` به محیط تولید.' }
      ]
    }
  ]
};

export default t14;
