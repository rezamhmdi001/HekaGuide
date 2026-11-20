import type { TrackContent } from '../../types/atlas';

const t19: TrackContent = {
  trackId: 'T19',
  chapters: [
    {
      id: 'T19-C01',
      code: 'D05 · T19 · C01',
      domainId: 'D05',
      trackId: 'T19',
      title: 'از Prompt Engineering به Context Engineering: طراحی System Prompt، Few-Shot و مدیریت بودجه Context',
      subtitle: 'مهندسی کل پنجره ورودی مدل با شواهد، قیدها و مثال‌های دقیق به جای جملات کلیشه‌ای.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در سال ۲۰۲۳ بسیاری تصور می‌کردند «مهندسی پرامپت» یعنی پیدا کردن وردهای جادویی مثل «فرض کن برنده جایزه نوبل هستی!». اما وقتی تیم‌ها اپلیکیشن‌های واقعی را به پروداکشن بردند، فهمیدند ۸۰٪ شکست‌های سیستم AI ربطی به لحن پرامپت ندارد؛ بلکه ریشه در **اطلاعات ناقص، متناقض یا شلوغ درون پنجره `Context`** دارد.',
        'اینجا بود که مفهوم بالغ‌تر **`Context Engineering`** متولد شد: هنر و علم مهندسیِ چیدمان دقیق *کل* آنچه در لحظه استنتاج در پنجره ورودی مدل قرار می‌گیرد — از دستورالعمل سیستمی و مثال‌های مرزی (`Few-Shot`) گرفته تا خروجی ابزارها، اسناد بازیابی‌شده و خلاصه تاریخچه.'
      ],
      mentalModel: {
        paragraphs: [
          'پنجره `Context` را مانند **حافظه RAM یک پردازش** ببینید که ظرفیت محدود دارد و هر بایت اضافه در آن، توجه مدل را از هدف اصلی منحرف می‌کند. یک `System Prompt` استاندارد پروداکشن ۴ بخش شفاف و جداشده (ترجیحاً با تگ‌های ساختاری مثل XML `<rules>` یا Markdown) دارد: ۱) **نقش و هدف دقیق**، ۲) **قیدهای صریح و موارد ممنوعه**، ۳) **قالب خروجی و رفتار در حالت عدم قطعیت**، ۴) **۲ تا ۵ مثال واقعی `Few-Shot` شامل حالات مرزی (`Edge Cases`)**.',
          'مثال‌های `Few-Shot` بسیار قوی‌تر از ده‌ها خط توضیح انتزاعی هستند: به جای اینکه بنویسید «لحن رسمی اما صمیمی باشد و خلاصه بنویس»، دو نمونه ورودی-خروجی واقعی نشان دهید؛ مدل الگو را با دقت شگفت‌انگیزی تعمیم می‌دهد.'
        ],
        rulesOfThumb: [
          'سلسله‌مراتب واضح بسازید: از جداکننده‌های مشخص (مثل `<context>...</context>` و `<user_input>...</user_input>`) استفاده کنید تا مرز بین دستور سیستم و داده کاربر قاطی نشود.',
          'اگر `System Prompt` شما پر از دستورات متناقض («همیشه خیلی کوتاه بگو» و سه پاراگراف بعد «همه جزئیات تاریخی را شرح بده») شده، اول آن را مثل کد تمیزکاری (`Refactor`) کنید.',
          'پرامپت‌ها را مثل کد منبع در Git نسخه‌گذاری کنید و هر تغییر پرامپت را با `Evals` بسنجید؛ تغییر یک جمله ممکن است موردی را درست و ۱۰ مورد قبلی را خراب کند!'
        ],
        diagram: {
          kind: 'layers',
          caption: 'معماری لایه‌بندی‌شده پنجره ورودی در Context Engineering',
          nodes: [
            { label: '۱. System Instructions (ثابت و کش‌پذیر)', sublabel: 'هدف، قیدهای امنیتی، قرارداد خروجی و سیاست امتناع' },
            { label: '۲. Few-Shot Examples (ثابت)', sublabel: '۲ تا ۴ نمونه دقیق شامل یک Edge Case و حالت خطا' },
            { label: '۳. Grounded Evidence / Tool Results', sublabel: 'اسناد فیلترشده RAG و خروجی خلاصه‌شده ابزارها', accent: true },
            { label: '۴. Conversation State + Current Query', sublabel: 'حافظه فشرده گفتگو و درخواست فعلی کاربر در انتها' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی تمیز و ساختاری برای چیدمان یک پرامپت پروداکشن (قابل نگهداری در Git)',
          language: 'xml',
          code: `<role>
تو تحلیلگر تریاژ تیکت فنی هستی. فقط بر اساس متن تیکت و مستندات داده‌شده پاسخ بده.
</role>

<rules>
- اگر اطلاعات برای تشخیص کافی نیست، فیلد needs_info را true بگذار و حدس نزن.
- از هرگونه متن اضافی خارج از JSON پرهیز کن.
</rules>

<examples>
  <example>
    <input>کاربر هنگام ورود خطای 525 SSL می‌بیند.</input>
    <output>{"category":"tls_origin","severity":"high","needs_info":false}</output>
  </example>
  <example>
    <input>سایت کنده!</input>
    <output>{"category":"unknown","severity":"medium","needs_info":true}</output>
  </example>
</examples>

<user_ticket>
{{UNTRUSTED_USER_TEXT}}
</user_ticket>`,
          explanations: [
            { token: '<examples>', meaning: 'مثال دوم یک `Edge Case` (ورودی مبهم) است که دقیقاً رفتار درست در زمان نبود اطلاعات را به مدل آموزش می‌دهد.' },
            { token: '<user_ticket>', meaning: 'محصور کردن متن نامطمئن کاربر در تگ جداگانه هم خوانایی برای مدل را بالا می‌برد و هم لایه اول دفاع در برابر تداخل دستور است.' }
          ]
        }
      ],
      warStory: {
        title: 'پرامپت ۶۰۰۰ کلمه‌ای انباشته از «قوانین وصله‌پینه‌ای» که باعث افت دقت مدل شد',
        symptom: 'هر بار که مشتری یک خطا گزارش می‌کرد، تیم یک جمله «هرگز این کار را نکن!» به انتهای `System Prompt` اضافه می‌کرد؛ پس از ۳ ماه دقت کل سیستم ۱۵٪ سقوط کرد.',
        rootCause: 'تورم پرامپت (`Prompt Bloat`) و تعارض میان قوانین قدیمی و جدید، بخش بزرگی از بودجه توجه مدل را مصرف کرده و او را گیج می‌کرد.',
        preventionRule: 'پرامپت را مانند کد تمیز بازآرایی کنید؛ به جای انباشتن قوانین متنی، وظایف پیچیده را به مراحل جداگانه بشکنید و شواهد را در زمان نیاز بارگذاری کنید.'
      },
      deepDive: {
        title: 'چرا تفکیک یک وظیفه بزرگ به ۲ گام کوچک (`Prompt Chaining`) بهتر از یک مگاپرامپت است؟',
        content: [
          'اگر از مدل بخواهید در یک درخواست همزمان سند را ترجمه کند، خطاهای حقوقی آن را بیابد، خلاصه مدیریتی بنویسد و ایمیل بفرستد، کیفیت هر ۴ کار افت می‌کند. شکستن آن به ۲ یا ۳ مرحله مجزا با قرارداد خروجی مشخص، هم دیباگ را ساده می‌کند و هم اجازه می‌دهد برای مرحله ساده‌تر از مدل ارزان‌تر استفاده کنید.'
        ],
        takeAway: 'مهندسی AI مدرن هنر ساخت «پنجره اطلاعات دقیق و کم‌نویز» است، نه نوشتن انشاهای طولانی.'
      },
      check: {
        type: 'triage',
        prompt: 'یک دستیار طبقه‌بندی ایمیل‌ها در حالات مبهم به اشتباه همیشه برچسب `urgent` می‌زند، با اینکه در دستور نوشته‌اید «در حالات مبهم دقیق باش». مؤثرترین تغییر چیست؟',
        options: [
          { id: 'a', label: 'تکرار جمله «خیلی مهم است که دقیق باشی!» با حروف بزرگ در ۳ جای پرامپت.', isCorrect: false, feedback: 'تکرار جملات کلی و تأکید هیجانی معیار دقیق تصمیم‌گیری را مشخص نمی‌کند.' },
          { id: 'b', label: 'تعریف برچسب صریح `needs_review` + افزودن ۲ مثال Few-Shot از ایمیل‌های مبهم که باید به `needs_review` بروند.', isCorrect: true, feedback: 'دقیقاً! ارائه دسته خروجی برای عدم قطعیت و نشان دادن مثال‌های عینی Few-Shot سریع‌ترین و پایدارترین اصلاح است.' },
          { id: 'c', label: 'بالا بردن Temperature به 1.2 تا مدل برچسب‌های متنوع‌تری بزند.', isCorrect: false, feedback: 'بالا بردن دما تصادفی بودن و خطای طبقه‌بندی را بدتر می‌کند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T18-C03', reason: 'رعایت جایگاه بخش‌های ثابت و متغیر برای حفظ Prefix KV-Cache.' },
        { targetId: 'T19-C02', reason: 'تضمین قالب JSON خروجی در سطح دیکودینگ با Structured Outputs.' }
      ]
    },
    {
      id: 'T19-C02',
      code: 'D05 · T19 · C02',
      domainId: 'D05',
      trackId: 'T19',
      title: 'خروجی‌های ساخت‌یافته (Structured Outputs / JSON Schema): پل امن بین دنیای احتمالی AI و کد قطعی Backend',
      subtitle: 'تضمین اسکیما در سطح دیکودینگ و اعتبارسنجی مجدد در کد برای جلوگیری از کرش پارسر JSON.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'در روزهای اول ساخت اپلیکیشن با LLM، مهندسان در پرامپت التماس می‌کردند: «لطفاً فقط JSON معتبر برگردان و هیچ توضیحی ننویس!» و مدل با لبخند برمی‌گرداند: ```` ```json\n{"ok": true}\n``` \nامیدوارم کمکتان کرده باشد! ```` — و بلافاصله `JSON.parse()` در بک‌اند کرش می‌کرد و کل صفحه کاربر سفید می‌شد!',
        'راه حل واقعی مهندسی، **دیکودینگ مقید (`Constrained Decoding / Structured Outputs`)** بود: به جای تکیه بر خوش‌شانسی، موتور استنتاج در هر گام انتخاب توکن، احتمال تمام توکن‌هایی را که گرامر `JSON Schema` شما را نقض می‌کنند دقیقاً صفر (`-∞`) می‌کند!'
      ],
      mentalModel: {
        paragraphs: [
          'تفاوت مهم بین **`JSON Mode` قدیمی** و **`Structured Outputs` مدرن**: `JSON Mode` فقط تضمین می‌کند خروجی یک JSON از نظر نحوی سالم باشد (ممکن است کلید `price` را رشته بدهد یا اصلاً فراموش کند!). اما `Structured Outputs` مدل را مجبور می‌کند دقیقاً از **طرح‌واره (`JSON Schema`)** شما شامل نام کلیدها، انواع داده (`string/number/boolean`)، مقادیر مجاز (`enum`) و فیلدهای اجباری (`required`) پیروی کند.',
          'یک ترفند طلایی در طراحی اسکیما: اگر کار نیاز به تحلیل دارد، یک فیلد **`reasoning` (یا `evidence`) را *قبل* از فیلد `verdict / decision`** در اسکیما بگذارید! از آنجا که تولید توکن‌ها از چپ به راست است، مدل ابتدا شواهد را می‌نویسد و سپس با دقت بسیار بالاتر تصمیم نهایی را پر می‌کند.'
        ],
        rulesOfThumb: [
          'حتی با فعال بودن `Structured Outputs`، خروجی مدل را در مرز بک‌اند همیشه با یک اعتبارسنج قطعی (`Zod` در TypeScript یا `Pydantic` در Python) دوباره چک کنید — قانون **Zero Trust روی خروجی LLM**.',
          'برای مقادیر محدود از `enum` استفاده کنید (مثلاً `"low" | "medium" | "high"`) و برای هر فیلد یک `description` شفاف بنویسید؛ چون مدل آن توضیحات را می‌خواند!',
          'مراقب حالت قطع شدن خروجی به دلیل رسیدن به `max_tokens` باشید (`finish_reason === "length"`)؛ در آن حالت حتی `Structured Outputs` هم یک JSON نصفه و نامعتبر تولید می‌کند.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'پل ایمن از خروجی احتمالی مدل تا شیء تایپ‌شده در کد Backend',
          nodes: [
            { label: 'JSON Schema + Descriptions', sublabel: 'تعریف دقیق نوع‌ها، enumها و ترتیب فیلدها' },
            { label: 'Constrained Decoding (LLM)', sublabel: 'ماسک کردن توکن‌های غیرمجاز در زمان تولید', accent: true },
            { label: 'Zod / Pydantic Validation', sublabel: 'تایید نهایی + قوانین دامنه (مثلاً مبلغ > 0) پیش از ذخیره' }
          ]
        }
      },
      lab: [
        {
          title: 'تعریف اسکیمای ایمن با ترتیب صحیح فیلدها (Evidence-first) و اعتبارسنجی در کد',
          language: 'typescript',
          code: `// JSON Schema ارسالی به API مدل (دقت به ترتیب: اول evidence، بعد decision)
export const triageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['evidence', 'severity', 'needsHumanEscalation'],
  properties: {
    evidence: {
      type: 'string',
      description: 'نقل‌قول کوتاه از گزارش کاربر که مبنای تصمیم است',
    },
    severity: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical'],
    },
    needsHumanEscalation: { type: 'boolean' },
  },
} as const;

// اعتبارسنجی دفاعی در Backend پس از دریافت پاسخ
export function parseTriageOutput(rawText: string, finishReason: string) {
  if (finishReason === 'length') {
    throw new Error('LLM output truncated before completing JSON');
  }
  const parsed = JSON.parse(rawText);
  if (!['low', 'medium', 'high', 'critical'].includes(parsed.severity)) {
    throw new Error('Invalid severity enum');
  }
  return parsed;
}`,
          explanations: [
            { token: 'additionalProperties: false', meaning: 'از اضافه کردن فیلدهای من‌درآوردی توسط مدل جلوگیری می‌کند.' },
            { token: 'finishReason === "length"', meaning: 'تشخیص زودهنگام برش خوردن JSON به دلیل کم بودن `max_tokens` پیش از رسیدن به خطای مبهم `SyntaxError`.' }
          ]
        }
      ],
      warStory: {
        title: 'افت دقت ۱۸ درصدی طبقه‌بندی پس از فعال کردن Structured Outputs',
        symptom: 'تیمی خروجی مدل را به یک JSON تک‌فیلدی `{"is_fraud": true/false}` محدود کرد؛ کرش‌های پارسینگ صفر شد اما دقت تشخیص تقلب ۱۸٪ سقوط کرد!',
        rootCause: 'وقتی اولین توکن خروجی مجبور است بلافاصله `true` یا `false` باشد، مدل هیچ فضایی برای تحلیل شواهد قبل از قضاوت ندارد (`Premature Commitment`).',
        preventionRule: 'در کارهای تحلیلی، همیشه یک فیلد متنی `rationale` یا `evidence` را *پیش* از فیلد نتیجه در ترتیب کلیدهای JSON Schema قرار دهید.'
      },
      deepDive: {
        title: 'ساختارهای بازگشتی (`Recursive Schemas`) و پیچیدگی گرامر',
        content: [
          'موتورهای `Constrained Decoding` اسکیمای شما را به یک ماشین حالت متناهی (`FSM`) یا گرامر `CFG` کامپایل می‌کنند. اسکیماهای بیش از حد عمیق، بازگشتی یا با صدها کلید اختیاری ممکن است زمان کامپایل اولیه (`Cold Start`) را بالا ببرند یا توسط سرویس‌دهنده رد شوند — اسکیما را تا جای ممکن تخت و شفاف نگه دارید.'
        ],
        takeAway: '`Structured Outputs` به علاوه اعتبارسنجی سمت سرور، تنها راه مطمئن اتصال AI به دیتابیس و UI است.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'در اسکیمای زیر که برای تصمیم‌گیری درباره رد یا تایید یک درخواست بازگشت وجه طراحی شده، کدام طراحی باعث افت دقت استدلال مدل می‌شود؟ روی خط مشکل‌دار کلیک کنید.',
        lines: [
          { lineNumber: 1, code: 'const refundDecisionSchema = {' },
          { lineNumber: 2, code: '  type: "object",' },
          { lineNumber: 3, code: '  required: ["approved", "policyAnalysis"],' },
          { lineNumber: 4, code: '  properties: {' },
          { lineNumber: 5, code: '    approved: { type: "boolean" },', isBug: true },
          { lineNumber: 6, code: '    policyAnalysis: { type: "string" }' },
          { lineNumber: 7, code: '  }' },
          { lineNumber: 8, code: '};' }
        ],
        explanation: 'قرار دادن `approved` قبل از `policyAnalysis` باعث می‌شود مدل ابتدا کورکورانه `true/false` را تولید کند و سپس در `policyAnalysis` صرفاً تصمیم قبلی خود را توجیه نماید! باید اول `policyAnalysis` و سپس `approved` بیاید.'
      },
      crossLinks: [
        { targetId: 'T19-C03', reason: 'استفاده از همین JSON Schema برای تعریف آرگومان‌های امن در Tool Calling.' },
        { targetId: 'T07-C05', reason: 'مقایسه قراردادهای API و اعتبارسنجی ورودی در مرزهای سیستم.' }
      ]
    },
    {
      id: 'T19-C03',
      code: 'D05 · T19 · C03',
      domainId: 'D05',
      trackId: 'T19',
      title: 'فراخوانی ابزار (Function / Tool Calling): چطور مدل به دیتابیس، API و دنیای واقعی متصل می‌شود',
      subtitle: 'طراحی قرارداد ابزارهای ایمن، مدیریت خطاهای برگشتی و جلوگیری از اقدامات مخرب بدون تأیید.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'یک مدل زبانی خالص شبیه «مغزی در شیشه» است: نه ساعت فعلی را می‌داند، نه می‌تواند موجودی حساب شما را چک کند، نه می‌تواند ایمیلی بفرستد یا کوئری SQL بزند. برای عبور از این دیوار، قابلیت **`Function / Tool Calling`** اضافه شد.',
        'نکته حیاتی که بسیاری اشتباه می‌فهمند: **مدل خودش هیچ کدی را اجرا نمی‌کند!** مدل صرفاً یک درخواست ساخت‌یافته JSON تولید می‌کند (مثلاً `call: get_order_status({ order_id: "ORD-902" })`). این **کد بک‌اند شماست** که آن درخواست را بررسی، مجوزسنجی (`Authorization`) و اجرا می‌کند و نتیجه را دوباره به مدل برمی‌گرداند.'
      ],
      mentalModel: {
        paragraphs: [
          'یک چرخه کامل `Tool Calling` چهار گام دارد: ۱) شما فهرست ابزارها (نام، توضیح شفاف و `JSON Schema` پارامترها) را به مدل می‌دهید. ۲) مدل تصمیم می‌گیرد آیا پاسخ مستقیم بدهد یا یک (یا چند) `tool_call` صادر کند. ۳) بک‌اند شما آرگومان‌ها را اعتبارسنجی و تابع واقعی را اجرا می‌کند و پاسخ (`tool_result`) را به تاریخچه اضافه می‌نماید. ۴) مدل با خواندن نتیجه ابزار، پاسخ نهایی انسانی را می‌نویسد.',
          'مهم‌ترین اصل امنیتی ابزارها: **تفکیک ابزارهای خواندنی (`Read-Only`) از ابزارهای تغییردهنده (`Mutating / Irreversible`)**! جستجوی سفارش یا خواندن آب‌وهوا می‌تواند خودکار اجرا شود؛ اما حذف رکورد، ارسال ایمیل بیرونی یا انتقال پول باید یا ممنوع باشد یا نیازمند **تأیید صریح انسان (`Human-in-the-Loop`)** و کلید تکرارناپذیری (`Idempotency Key`) باشد.'
        ],
        rulesOfThumb: [
          'هرگز `user_id` یا `tenant_id` را به عنوان پارامتر قابل انتخاب توسط LLM نگذارید! هویت کاربر باید از سشن احراز هویت شده سمت سرور (`Auth Session`) به تابع تزریق شود تا مدل نتواند دیتای کاربر دیگری را بخواند.',
          'تعداد ابزارها را متعادل نگه دارید (معمولاً ۵ تا ۱۵ ابزار شفاف با نام و توضیحات دقیق)؛ دادن ۱۰۰ ابزار با نام‌های شبیه هم باعث سردرگمی مدل و مصرف سنگین توکن می‌شود.',
          'اگر اجرای ابزار خطا داد (مثلاً `Order not found`)، کل برنامه را کرش نکنید؛ یک پیام خطای شفاف و قابل اقدام به عنوان `tool_result` برگردانید تا مدل بتواند اشتباه خود را اصلاح کند.'
        ],
        diagram: {
          kind: 'cycle',
          caption: 'چرخه امن Tool Calling با کنترل دسترسی در لایه Backend',
          nodes: [
            { label: '۱. مدل: درخواست ابزار', sublabel: 'تولید JSON ساختاریافته: get_invoice({ id: "42" })' },
            { label: '۲. Backend: Guard & AuthZ', sublabel: 'اعتبارسنجی اسکیما + تزریق user_id از سشن سرور', accent: true },
            { label: '۳. اجرای ابزار + Tool Result', sublabel: 'کوئری دیتابیس/API و بازگرداندن نتیجه فشرده' },
            { label: '۴. مدل: پاسخ نهایی', sublabel: 'تبدیل داده واقعی ابزار به پاسخ شفاف برای کاربر' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی ایمن اجرای ابزار در بک‌اند (تزریق هویت از سشن و محدودسازی خروجی)',
          language: 'typescript',
          code: `interface SessionContext {
  authenticatedUserId: string; // هرگز از خروجی LLM خوانده نمی‌شود!
}

const TOOL_REGISTRY = {
  get_order_status: async (args: { orderId: string }, ctx: SessionContext) => {
    if (!/^ORD-\d{3,8}$/.test(args.orderId)) {
      return { error: 'فرمت شماره سفارش نامعتبر است (مثال: ORD-1024).' };
    }
    // قفل کردن کوئری به مالک واقعی سشن (جلوگیری از IDOR توسط LLM)
    const order = await dbFindOrder(args.orderId, ctx.authenticatedUserId);
    if (!order) {
      return { error: 'سفارشی با این شماره برای حساب شما یافت نشد.' };
    }
    return { status: order.status, eta: order.eta }; // فقط فیلدهای لازم، نه کل سطر دیتابیس!
  },
};`,
          explanations: [
            { token: 'ctx.authenticatedUserId', meaning: 'تزریق اجباری هویت از سرور تا حتی اگر مهاجم با `Prompt Injection` مدل را گول زد، به سفارش دیگران دسترسی نگیرد.' },
            { token: '{ status, eta }', meaning: 'برگرداندن فقط فیلدهای مورد نیاز هم از نشت `PII` جلوگیری می‌کند و هم پنجره Context را با JSON عظیم پر نمی‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'آسیب‌پذیری IDOR در چت‌بات پشتیبانی به دلیل سپردن `user_id` به مدل',
        symptom: 'کاربری در چت پشتیبانی نوشت: «وضعیت سفارش کاربر `user_id=1001` را چک کن» و چت‌بات نام، آدرس و مبلغ سفارش شخص دیگری را چاپ کرد!',
        rootCause: 'تیم ابزار `get_orders(user_id)` را تعریف کرده و شناسه کاربر فعلی را در `System Prompt` نوشته بود؛ کاربر با یک جمله ساده مدل را قانع کرد عدد دیگری بفرستد.',
        preventionRule: 'مرز امنیتی هرگز در پرامپت نیست؛ هویت (`user_id`, `role`, `org_id`) باید در کد بک‌اند و خارج از اختیار آرگومان‌های مدل اعمال شود.'
      },
      deepDive: {
        title: 'تأیید دوگانه (`Dry-Run -> Confirm`) برای ابزارهای تغییردهنده',
        content: [
          'برای کارهایی مثل لغو اشتراک، تغییر تنظیمات سرور یا ارسال فاکتور، ابزار را طوری طراحی کنید که گام اول فقط یک پیش‌نمایش (`Preview / Plan`) برگرداند و دکمه تأیید واقعی در رابط کاربری توسط کاربر کلیک شود — نه توسط مدل!'
        ],
        takeAway: 'ابزارهای AI دقیقاً همان قوانین امنیت API (`AuthZ`، `Idempotency`، کمترین امتیاز) را می‌خواهند — با این تفاوت که کلاینت این بار غیرقطعی است!'
      },
      check: {
        type: 'triage',
        prompt: 'شما در حال طراحی ابزار `cancel_subscription` برای دستیار پشتیبانی هستید. کدام طراحی از نظر امنیتی و مهندسی استاندارد است؟',
        options: [
          { id: 'a', label: 'گرفتن `user_id` از مدل و لغو فوری اشتراک بدون تأیید کاربر.', isCorrect: false, feedback: 'هم ریسک دسترسی غیرمجاز (`IDOR`) دارد و هم عمل برگشت‌ناپذیر بدون تأیید انسان انجام می‌شود.' },
          { id: 'b', label: 'خواندن `user_id` از سشن احراز هویت شده سرور + ایجاد پیش‌نمایش لغو و الزام به کلیک تأیید توسط کاربر (`Human-in-the-Loop`).', isCorrect: true, feedback: 'عالی! هویت در سرور قفل می‌شود و اقدام حساس فقط با تأیید صریح انسان اجرا می‌گردد.' },
          { id: 'c', label: 'دادن دسترسی مستقیم `run_sql(query)` به مدل تا خودش هر جدولی خواست آپدیت کند.', isCorrect: false, feedback: 'دادن SQL خامِ نوشتنی به LLM فاجعه امنیتی کامل است.' }
        ]
      },
      crossLinks: [
        { targetId: 'T10-C04', reason: 'مرور اصل Idempotency برای جلوگیری از اجرای تکراری ابزارهای حساس.' },
        { targetId: 'T20-C02', reason: 'استانداردسازی اتصال ابزارها با پروتکل MCP.' },
        { targetId: 'T20-C04', reason: 'دفاع در برابر حملات Prompt Injection روی ابزارها.' }
      ]
    },
    {
      id: 'T19-C04',
      code: 'D05 · T19 · C04',
      domainId: 'D05',
      trackId: 'T19',
      title: 'معماری RAG (Retrieval-Augmented Generation): Chunking هوشمند، Vector Databases و جستجوی ترکیبی (Hybrid Search + Reranking)',
      subtitle: 'چرا جستجوی برداری به تنهایی روی کدها و نام‌های خاص شکست می‌خورد و Hybrid BM25+Vector نجات‌بخش است.',
      readMinutes: 7,
      difficulty: 'چالشی',
      originStory: [
        'در سال ۲۰۲۰، پژوهشگران متا مقاله‌ای منتشر کردند که پرکاربردترین الگوی معماری AI سازمانی را نام‌گذاری کرد: **`RAG` (`Retrieval-Augmented Generation`)**. ایده بسیار ساده و نبوغ‌آمیز است: به جای اینکه کل اسناد شرکت را در وزن‌های مدل حفظ کنیم (آزمون کتاب‌بسته)، در لحظه سوال کاربر، فقط ۳ تا ۵ پاراگراف مرتبط را پیدا کرده و کنار سوال روی میز مدل می‌گذاریم (آزمون کتاب‌باز!).',
        'اما ساخت یک دموی ساده RAG در یک عصر بسیار آسان است و ساخت یک **RAG دقیق در پروداکشن** بسیار چالش‌برانگیز! اکثر سیستم‌های RAG ضعیف نه به خاطر هوش کم LLM، بلکه به خاطر **بازیابی غلط (`Bad Retrieval`)** شکست می‌خورند: اگر تکه درست را به مدل نرسانید، قوی‌ترین مدل دنیا هم ناتوان است.'
      ],
      mentalModel: {
        paragraphs: [
          'یک پایپ‌لاین RAG حرفه‌ای ۴ گام حیاتی دارد: ۱) **برش هوشمند (`Chunking`)**: بریدن کورکورانه هر ۵۰۰ کاراکتر، وسط جدول یا وسط جمله را قطع می‌کند! برش باید ساختاری (بر اساس تیترها و پاراگراف‌ها)، با کمی هم‌پوشانی (`Overlap` حدود ۱۰-۱۵٪) و همراه با متادیتا (عنوان سند، تاریخ، سطح دسترسی کاربر!) باشد.',
          '۲) **جستجوی ترکیبی (`Hybrid Search`)**: جستجوی برداری (`Vector`) معنا را می‌فهمد ولی روی کد خطای `ERR_525` یا کد محصول `SKU-8841` ضعیف است. جستجوی واژگانی **`BM25`** دقیقاً روی کلمات خاص عالی است. ترکیب نتایج این دو با الگوریتم **`RRF` (`Reciprocal Rank Fusion`)** بهترین هر دو دنیا را می‌دهد. ۳) **بازرتبه‌بندی (`Reranking`)**: ۲۰ نتیجه اولیه را به یک مدل **`Cross-Encoder Reranker`** می‌دهید که سوال و هر تکه را با هم عمیق مقایسه کرده و ۵ تکه طلایی نهایی را به LLM تحویل می‌دهد.'
        ],
        rulesOfThumb: [
          'اگر پاسخ RAG اشتباه است، اول **خروجی مرحله Retrieval** را ببینید! در بیش از ۷۰٪ موارد، سند درست اصلاً به دست LLM نرسیده است.',
          'فیلتر سطح دسترسی (`ACL / Permission Filtering`) باید **قبل از یا حین بازیابی** در دیتابیس اعمال شود، نه در پرامپت LLM؛ وگرنه اسناد محرمانه به کاربر غیرمجاز نشت می‌کنند!',
          'در بسیاری از پروژه‌های زیر چند میلیون رکورد، به جای اضافه کردن یک دیتابیس برداری جداگانه و پیچیدگی سینک داده، ترکیب **`PostgreSQL + pgvector + tsvector (Full-Text)`** ساده، تراکنشی و فوق‌العاده کارآمد است.'
        ],
        diagram: {
          kind: 'flow',
          caption: 'پایپ‌لاین RAG تولیدی با جستجوی ترکیبی (BM25 + Vector) و Reranker',
          nodes: [
            { label: 'سوال کاربر + ACL Filter', sublabel: 'اعمال مجوز دسترسی کاربر پیش از بازیابی' },
            { label: 'Hybrid Search (BM25 + Vector)', sublabel: 'ادغام ۳۰ نامزد برتر با Reciprocal Rank Fusion (RRF)', accent: true },
            { label: 'Cross-Encoder Reranker', sublabel: 'انتخاب دقیق ۵ قطعه برتر مرتبط با پرسش' },
            { label: 'Grounded LLM + Citations', sublabel: 'تولید پاسخ مستند با ارجاع به شناسه قطعه' }
          ]
        }
      },
      lab: [
        {
          title: 'پیاده‌سازی الگوریتم استاندارد Reciprocal Rank Fusion (RRF) برای ترکیب BM25 و Vector',
          language: 'typescript',
          code: `export function reciprocalRankFusion(
  bm25Ranking: string[],
  vectorRanking: string[],
  k = 60
): { docId: string; score: number }[] {
  const scores = new Map<string, number>();

  const addList = (list: string[]) => {
    list.forEach((docId, index) => {
      const rank = index + 1;
      scores.set(docId, (scores.get(docId) ?? 0) + 1 / (k + rank));
    });
  };

  addList(bm25Ranking);
  addList(vectorRanking);

  return Array.from(scores.entries())
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score);
}

// سندی که در هر دو لیست (کلمه‌ای و معنایی) رتبه بالایی دارد به صدر می‌آید!`,
          explanations: [
            { token: '1 / (k + rank)', meaning: 'فرمول `RRF` بدون نیاز به نرمال‌سازی مقیاس‌های متفاوت امتیاز `BM25` و `Cosine Similarity`، رتبه‌ها را عادلانه ترکیب می‌کند.' },
            { token: 'k = 60', meaning: 'ثابت استاندارد هموارسازی در ادبیات بازیابی اطلاعات که از تسلط بیش از حد رتبه ۱ جلوگیری می‌کند.' }
          ]
        }
      ],
      warStory: {
        title: 'نشت حقوق مدیران ارشد از طریق چت‌بات داخلی شرکت (RAG بدون فیلتر ACL)',
        symptom: 'یک کارآموز در چت‌بات اسناد داخلی پرسید «بازه حقوقی تیم مهندسی چقدر است؟» و چت‌بات ارقام دقیق فایل محرمانه منابع انسانی را پاسخ داد!',
        rootCause: 'پایپ‌لاین ایندکس‌گذاری تمام پوشه‌های درایو شرکت را بدون ذخیره `allowed_roles` در دیتابیس برداری ایندکس کرده بود و سیستم جستجو مجوز کاربر را چک نمی‌کرد.',
        preventionRule: 'هر تکه سند (`Chunk`) باید متادیتای دسترسی (`tenant_id`, `acl_groups`) داشته باشد و هر کوئری RAG باید شرط `WHERE` مجوز را در لایه دیتابیس اعمال کند.'
      },
      deepDive: {
        title: 'الگوی `Contextual Retrieval` (تزریق خلاصه سند به هر Chunk)',
        content: [
          'فرض کنید تکه‌ای از گزارش مالی می‌گوید: «درآمد در فصل سوم ۳٪ رشد کرد.» به تنهایی هیچ‌کس نمی‌داند این مربوط به کدام شرکت و کدام سال است! افزودن یک خط زمینه کوتاه در ابتدای هر تکه پیش از Embedding (`[شرکت آلفا — گزارش مالی ۱۴۰۴ — بخش فروش] ...`) خطای بازیابی را تا ۴۰٪ کاهش می‌دهد.'
        ],
        takeAway: 'کیفیت RAG یعنی کیفیت `Chunking`، جستجوی ترکیبی `BM25 + Vector`، اعمال `ACL` و بازرتبه‌بندی.'
      },
      check: {
        type: 'triage',
        prompt: 'کاربران شکایت دارند وقتی در دستیار مستندات فنی کد خطای دقیق `ERR_TLS_525` را جستجو می‌کنند، سیستم RAG اسناد عمومی درباره HTTP برمی‌گرداند و صفحه دقیق خطای `525` را پیدا نمی‌کند. علت و راه حل چیست؟',
        options: [
          { id: 'a', label: 'فقط از Vector Search استفاده شده؛ افزودن جستجوی واژگانی BM25 در کنار Vector (Hybrid Search + RRF) مشکل را حل می‌کند.', isCorrect: true, feedback: 'دقیقاً! کدهای خطا و شناسه‌های دقیق توسط جستجوی برداری به خوبی تفکیک نمی‌شوند؛ `Hybrid Search` این نقطه ضعف را کاملاً می‌پوشاند.' },
          { id: 'b', label: 'باید Temperature مدل LLM را روی ۰.۹ بگذارید تا صفحه ۵۲۵ را حدس بزند.', isCorrect: false, feedback: 'مشکل در مرحله Retrieval است، نه تولید متن؛ بالا بردن دما فقط توهم را بیشتر می‌کند.' },
          { id: 'c', label: 'باید طول هر Chunk را به ۱۰٬۰۰۰ کلمه افزایش دهید.', isCorrect: false, feedback: 'تکه‌های بیش از حد بزرگ بردار معنایی را رقیق و بی‌دقت می‌کنند.' }
        ]
      },
      crossLinks: [
        { targetId: 'T18-C02', reason: 'فهم ریاضی Embeddings و Cosine Similarity در بخش برداری RAG.' },
        { targetId: 'T09-C02', reason: 'طراحی ایندکس‌های ترکیبی در PostgreSQL.' },
        { targetId: 'T20-C03', reason: 'سنجش جداگانه Recall بازیابی و Faithfulness پاسخ در Evals.' }
      ]
    },
    {
      id: 'T19-C05',
      code: 'D05 · T19 · C05',
      domainId: 'D05',
      trackId: 'T19',
      title: 'حافظه در سیستم‌های AI: حافظه کوتاه‌مدت، خلاصه‌سازی، حافظه بلندمدت کاربر و جلوگیری از آلودگی Context',
      subtitle: 'نگه‌داشتن حافظه مفید بدون انفجار هزینه توکن و آلوده شدن جلسات با خطاهای قدیمی.',
      readMinutes: 6,
      difficulty: 'میدانی',
      originStory: [
        'یک مدل زبانی از نظر پروتکل HTTP کاملاً **بی‌حالت (`Stateless`)** است! در هر نوبت مکالمه، مدل اصلاً «یادتان» نمی‌آورد؛ بلکه کلاینت یا سرور کل تاریخچه پیام‌های قبلی را دوباره در آرایه `messages` برای مدل می‌فرستد. این باعث می‌شود هزینه مکالمه طولانی به صورت **درجه دو (`1 + 2 + 3 + ... + N ≈ N²/2`)** رشد کند!',
        'بدتر از هزینه، پدیده‌ای به نام **آلودگی یا پوسیدگی Context (`Context Rot / Poisoning`)** است: اگر در نوبت ۳ مدل یک فرض اشتباه کرده یا ۲۰۰ خط لاگ خروجی ابزار وسط چت افتاده باشد، آن نویز تا نوبت ۳۰ مثل مه غلیظ روی همه تصمیم‌های بعدی مدل سایه می‌اندازد.'
      ],
      mentalModel: {
        paragraphs: [
          'معماری حافظه در سیستم‌های AI بالغ به سه لایه مجزا تقسیم می‌شود: ۱) **حافظه کاری کوتاه‌مدت (`Working Memory`)**: پیام‌های اخیر چت + خلاصه فشرده (`Rolling Summary`) پیام‌های قدیمی‌تر، به همراه هرس کردن (`Compaction / Pruning`) خروجی‌های حجیم و منقضی ابزارها.',
          '۲) **حافظه اپیزودیک/تراکنشی (`Session State`)**: وضعیت ساختاریافته و قطعی (مثلاً سبد خرید، فایل‌های باز، مرحله فعلی فرآیند) که در دیتابیس ذخیره می‌شود و همیشه آخرین نسخه تمیز آن به مدل داده می‌شود (نه ۲۰ بار تغییرش در طول چت!). ۳) **حافظه بلندمدت کاربر (`Long-Term Memory`)**: ترجیحات و حقایق تاییدشده بین جلسات (مثلاً «کاربر از TypeScript و PostgreSQL استفاده می‌کند») که با تاریخ و قابلیت حذف/ویرایش ذخیره و در زمان نیاز بازیابی می‌شود.'
        ],
        rulesOfThumb: [
          'خروجی‌های عظیم ابزارها (مثل متن کامل یک صفحه وب یا ۵۰۰ سطر JSON) را پس از اینکه مدل نوبت بعدی را تولید کرد، خلاصه یا جایگزین یک مرجع کوتاه کنید تا در نوبت‌های بعد تکرار نشوند.',
          'وقتی موضوع گفتگو عوض شد یا مدل در یک مسیر اشتباه گیر افتاد، شروع یک سشن تازه با خلاصه تمیزِ حقایق (`Fresh Context`) بسیار بهتر از جر و بحث در یک چت آلوده است.',
          'در حافظه بلندمدت همیشه سیاست **به‌روزرسانی و ابطال (`Supersede / Forget`)** داشته باشید؛ وگرنه ترجیح ۶ ماه پیش کاربر با دستور جدیدش درگیر می‌شود!'
        ],
        diagram: {
          kind: 'layers',
          caption: 'معماری ۳ لایه حافظه بدون انفجار توکن و Context Rot',
          nodes: [
            { label: 'حافظه کاری (Working Window)', sublabel: '۶ تا ۱۰ نوبت اخیر + خلاصه فشرده پیام‌های قبلی' },
            { label: 'وضعیت ساخت‌یافته (Structured State)', sublabel: 'آخرین Snapshot تمیز پروژه/سفارش از دیتابیس', accent: true },
            { label: 'حافظه بلندمدت (User Profile / Episodic)', sublabel: 'ترجیحات تاییدشده، دارای تاریخ و قابل ویرایش توسط کاربر' }
          ]
        }
      },
      lab: [
        {
          title: 'الگوی Compaction: هرس خودکار خروجی‌های حجیم قدیمی ابزارها پیش از ارسال نوبت جدید',
          language: 'typescript',
          code: `interface ChatMsg {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
}

export function compactHistory(messages: ChatMsg[], keepRecent = 6): ChatMsg[] {
  const cutoff = Math.max(0, messages.length - keepRecent);
  return messages.map((msg, idx) => {
    // خروجی ابزارهای قدیمی‌تر از ۶ پیام اخیر را به خلاصه کوتاه تقلیل می‌دهیم
    if (idx < cutoff && msg.role === 'tool' && msg.content.length > 400) {
      return {
        ...msg,
        content: \`[خروجی قدیمی ابزار \${msg.toolName ?? 'tool'} فشرده شد؛ \${msg.content.length} کاراکتر]\`,
      };
    }
    return msg;
  });
}`,
          explanations: [
            { token: 'keepRecent = 6', meaning: 'حفظ کامل چند نوبت آخر برای پیوستگی گفتگو، در حالی که لاگ‌های سنگین نوبت‌های قدیمی حذف می‌شوند.' },
            { token: 'compactHistory', meaning: 'جلوگیری از رشد درجه‌دوم هزینه توکن و حذف نویز قدیمی بدون از دست دادن مسیر مکالمه.' }
          ]
        }
      ],
      warStory: {
        title: 'حافظه بلندمدت آلوده که یک دستیار کدنویسی را برای همیشه روی فریم‌ورک اشتباه قفل کرد',
        symptom: 'کاربر یک بار برای تست یک سوال درباره `Flask` پرسید؛ حافظه خودکار ذخیره کرد «کاربر همیشه با Flask کار می‌کند» و از فردا در پروژه `FastAPI` هم پاسخ‌های `Flask` می‌داد!',
        rootCause: 'سیستم حافظه بلندمدت هر جمله گذرا را بدون تفکیک «حقیقت پایدار کاربر» از «موضوع موقت جلسه» ذخیره می‌کرد و رابطی برای مشاهده یا پاک کردن حافظه نداشت.',
        preventionRule: 'حافظه بلندمدت را محافظه‌کارانه، دارای برچسب دامنه/تاریخ و کاملاً شفاف و قابل حذف برای کاربر طراحی کنید.'
      },
      deepDive: {
        title: 'تعارض بین خلاصه‌سازی مداوم و `Prompt Caching`',
        content: [
          'اگر در *هر* نوبت خلاصه ابتدای مکالمه را بازنویسی کنید، پیشوند (`Prefix`) تغییر می‌کند و `Prompt Cache` می‌شکند! راه حل حرفه‌ای: `Compaction` را فقط زمانی انجام دهید که طول مکالمه از یک آستانه (مثلاً ۲۰٬۰۰۰ توکن) عبور کرد، نه در تک‌تک نوبت‌ها.'
        ],
        takeAway: 'حافظه خوب در AI یعنی نگه داشتن «سیگنال» و دور ریختن به‌موقع «نویز».'
      },
      check: {
        type: 'recall',
        question: 'چرا در یک مکالمه ۵۰ نوبتی با LLM بدون خلاصه‌سازی، هزینه کل توکن‌های ورودی به جای خطی به صورت درجه‌دوم رشد می‌کند و دو عارضه دیگر آن چیست؟',
        modelAnswer: 'چون API مدل بی‌حالت (`Stateless`) است و در نوبت `k` کل تاریخچه `1..k` دوباره ارسال می‌شود (`1+2+...+50`). دو عارضه دیگر: افزایش تأخیر (`TTFT`) و پدیده `Context Rot` (کاهش دقت مدل به خاطر انباشت نویز و خروجی‌های قدیمی).'
      },
      crossLinks: [
        { targetId: 'T18-C03', reason: 'فهم تأثیر Context طولانی بر TTFT و منحنی Lost in the Middle.' },
        { targetId: 'T19-C06', reason: 'هماهنگی Compaction با سیاست Prompt Caching.' }
      ]
    },
    {
      id: 'T19-C06',
      code: 'D05 · T19 · C06',
      domainId: 'D05',
      trackId: 'T19',
      title: 'استریم کردن پاسخ‌ها (SSE Streaming)، کشینگ پرامپت (Prompt Caching)، مدیریت هزینه توکن و Fallback بین مدل‌ها',
      subtitle: 'کاهش ۷۰٪ هزینه و زمان انتظار با Prompt Caching و معماری تاب‌آور در برابر Rate Limit سرویس‌دهنده.',
      readMinutes: 6,
      difficulty: 'چالشی',
      originStory: [
        'کاربر انسان حاضر است ۶۰۰ میلی‌ثانیه برای دیدن اولین کلمه صبر کند و بعد با ریتم خواندن خود بقیه پاسخ را ببیند؛ اما اگر ۱۲ ثانیه به یک چرخنده (`Spinner`) خیره شود و بعد یک دیوار متن ناگهان ظاهر شود، تصور می‌کند برنامه هنگ کرده و صفحه را می‌بندد!',
        'در لایه مهندسی تولید، تفاوت یک دموی دانشگاهی با یک سرویس AI مقیاس‌پذیر در ۴ الگوی زیرساختی است: **`SSE Streaming`** برای حس سرعت فوری، **`Prompt Caching`** برای کاهش نجومی هزینه پیشوندهای تکراری، **بودجه‌بندی توکن**، و **`Model Fallback`** برای بقا هنگام خطای `429 Rate Limit` یا قطعی سرویس‌دهنده.'
      ],
      mentalModel: {
        paragraphs: [
          '۱) **`SSE` (`Server-Sent Events`)**: یک اتصال `HTTP` یک‌طرفه و ساده (`Content-Type: text/event-stream`) که از سرور به مرورگر توکن‌ها را تکه‌تکه می‌فرستد. برخلاف `WebSocket`، کاملاً روی HTTP استاندارد و پروکسی‌ها (با غیرفعال کردن بافرینگ `X-Accel-Buffering: no` در Nginx!) راحت کار می‌کند.',
          '۲) **`Prompt Caching`**: اگر `System Prompt`، تعریف ابزارها یا اسناد مرجع شما (معمولاً بالای ۱۰۲۴ توکن) بین درخواست‌ها یکسان باشد، سرویس‌دهنده `KV-Cache` آن پیشوند را ذخیره می‌کند و تا ۵۰٪ تا ۹۰٪ ارزان‌تر و سریع‌تر پردازش می‌نماید. ۳) **تاب‌آوری (`Resilience`)**: هر تماس به LLM یک تماس شبکه خارجی ناپایدار است؛ پس به `Timeout`، `Retry` با `Backoff + Jitter` روی خطاهای `429/5xx`، و `Fallback` به مدل/ریجن دوم نیاز دارد.'
        ],
        rulesOfThumb: [
          'اگر پشت `Nginx` استریم `SSE` دارید و پاسخ یکجا بعد از ۱۰ ثانیه می‌آید، تقریباً همیشه مقصر `proxy_buffering on` در Nginx است! هدر `X-Accel-Buffering: no` را ست کنید.',
          'در هر درخواست AI، متریک‌های `input_tokens`، `cached_tokens`، `output_tokens`، `ttft_ms` و `cost_usd` را در لاگ ساخت‌یافته ثبت کنید تا مصرف غیرعادی را پیش از پایان ماه ببینید.',
          'از `AbortController` استفاده کنید: اگر کاربر وسط استریم دکمه توقف را زد یا تب را بست، اتصال به API سرویس‌دهنده را هم قطع کنید تا پول توکن‌های دیده‌نشده را ندهید!'
        ],
        diagram: {
          kind: 'flow',
          caption: 'معماری Gateway تولیدی برای استریم، کشینگ و Fallback مدل‌های AI',
          nodes: [
            { label: 'Client (Fetch Stream + Abort)', sublabel: 'رندر لحظه‌ای توکن‌ها و لغو فوری در صورت انصراف' },
            { label: 'AI Gateway (Cache + Budget)', sublabel: 'کنترل نرخ کاربر، ثبت هزینه توکن، Prefix ثابت', accent: true },
            { label: 'Primary Model -> Fallback Model', sublabel: 'جایگزینی خودکار هنگام 429 / 503 یا Timeout' }
          ]
        }
      },
      lab: [
        {
          title: 'تنظیم حیاتی Nginx و الگوی مصرف ایمن SSE با AbortController در کلاینت',
          language: 'typescript',
          code: `// سمت سرور (هدرهای ضروری برای جلوگیری از بافر شدن استریم در پروکسی‌ها):
// Content-Type: text/event-stream; charset=utf-8
// Cache-Control: no-cache, no-transform
// X-Accel-Buffering: no

export async function streamAnswer(
  url: string,
  onChunk: (delta: string) => void,
  signal: AbortSignal
) {
  const res = await fetch(url, { signal });
  if (!res.ok || !res.body) throw new Error(\`HTTP \${res.status}\`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}`,
          explanations: [
            { token: 'X-Accel-Buffering: no', meaning: 'به `Nginx` دستور می‌دهد هر تکه را فوراً به مرورگر بفرستد و منتظر پر شدن بافر نشود.' },
            { token: '{ stream: true }', meaning: 'در `TextDecoder` حیاتی است! بدون آن، کاراکترهای ۲ یا ۳ بایتی فارسی که روی مرز دو بسته شبکه نصف شده‌اند به علامت `` خراب می‌شوند.' }
          ],
          trap: 'فراموش کردن `{ stream: true }` در `TextDecoder.decode()` یکی از رایج‌ترین باگ‌های نمایش متن فارسی در SSE Streaming است!'
        }
      ],
      warStory: {
        title: 'نمایش کاراکترهای خراب `` وسط کلمات فارسی در استریم SSE',
        symptom: 'در حالت استریم چت فارسی، هر چند خط یک‌بار یک حرف فارسی تبدیل به علامت سوال مشکی `` می‌شد، ولی بعد از رفرش صفحه (خواندن از دیتابیس) کاملاً سالم بود!',
        rootCause: 'هر حرف فارسی در `UTF-8` دو بایت است و `Uint8Array` دریافتی از شبکه گاهی دقیقاً وسط دو بایت یک حرف بریده می‌شود؛ کلاینت `decoder.decode(value)` را بدون گزینه `{ stream: true }` صدا زده بود.',
        preventionRule: 'در تمام استریم‌های باینری متنی، همیشه از `new TextDecoder("utf-8")` همراه با `decoder.decode(chunk, { stream: true })` استفاده کنید.'
      },
      deepDive: {
        title: 'تفاوت `Exact Response Cache` با `Semantic Cache` و `Prompt Caching`',
        content: [
          '۱) `Prompt Caching` در لایه مدل است و هزینه پیشوند ثابت (`KV-Cache`) را کم می‌کند. ۲) `Exact Cache` (در Redis) برای سوالات دقیقاً تکراری (مثل ترجمه یک عبارت ثابت) پاسخ را با هزینه صفر و زمان `5ms` برمی‌گرداند. ۳) `Semantic Cache` برای سوالات هم‌معنا کاربرد دارد اما باید با آستانه شباهت بسیار سخت‌گیرانه (`> 0.97`) و جداسازی بر اساس کاربر (`tenant_id`) استفاده شود تا پاسخ کاربر الف به کاربر ب داده نشود.'
        ],
        takeAway: 'تولیدی کردن AI یعنی پیوند زدن مدل با اصول کلاسیک مهندسی شبکه: `Streaming`، `Caching`، `Backpressure` و `Fallback`.'
      },
      check: {
        type: 'spot_bug',
        prompt: 'در کد کلاینت زیر که استریم پاسخ فارسی را از سرور می‌خواند، کدام خط باعث خراب شدن تصادفی برخی حروف فارسی (تبدیل به ``) می‌شود؟ روی آن خط کلیک کنید.',
        lines: [
          { lineNumber: 1, code: 'const reader = response.body.getReader();' },
          { lineNumber: 2, code: 'const decoder = new TextDecoder("utf-8");' },
          { lineNumber: 3, code: 'while (true) {' },
          { lineNumber: 4, code: '  const { done, value } = await reader.read();' },
          { lineNumber: 5, code: '  if (done) break;' },
          { lineNumber: 6, code: '  appendText(decoder.decode(value));', isBug: true },
          { lineNumber: 7, code: '}' }
        ],
        explanation: 'خط ۶ گزینه `{ stream: true }` را ندارد. چون کاراکترهای فارسی چندبایتی هستند، اگر یک کاراکتر بین دو بسته `TCP` شکسته شود، `decode(value)` بدون `stream: true` بایت ناقص را خراب (`U+FFFD`) می‌کند.'
      },
      crossLinks: [
        { targetId: 'T07-C03', reason: 'مقایسه پروتکل‌های SSE، WebSocket و Webhooks در لایه وب.' },
        { targetId: 'T10-C05', reason: 'الگوهای Timeout، Retry + Jitter و Circuit Breaker در تماس‌های خارجی.' },
        { targetId: 'T12-C02', reason: 'تنظیمات Reverse Proxy در Nginx برای عبور بی‌بافر استریم‌ها.' }
      ]
    }
  ]
};

export default t19;
