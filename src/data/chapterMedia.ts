import type { DomainId } from '../types/atlas';

import hardwareImg from '../assets/images/domain_hardware_kernel_1795186444241.jpg';
import webImg from '../assets/images/domain_web_browser_1795186410985.jpg';
import dataImg from '../assets/images/domain_data_systems_1795186455019.jpg';
import aiImg from '../assets/images/domain_ai_transformers_1795186468094.jpg';

export interface DomainVisual {
  domainId: DomainId;
  imageUrl?: string;
  alt: string;
  caption: string;
}

export interface ChapterVideo {
  youtubeId: string;
  title: string;
  channel: string;
  duration: string;
  whyWatch: string;
}

export interface CognitiveEnrichment {
  hook: string;
  analogy: string;
  keyTakeaway: string;
  showVisualPlate?: boolean;
  video?: ChapterVideo;
}

export const DOMAIN_VISUALS: Record<DomainId, DomainVisual> = {
  D01: {
    domainId: 'D01',
    imageUrl: hardwareImg,
    alt: 'نمای ایزومتریک پردازنده سیلیکونی، حلقه‌های کش حافظه و مسیرهای نوری شبکه',
    caption: 'معماری لایه‌به‌لایه از هسته پردازنده و حافظه کش تا پروتکل‌های انتقال شبکه',
  },
  D02: {
    domainId: 'D02',
    imageUrl: webImg,
    alt: 'نمای ایزومتریک لایه‌های مرورگر، درخت DOM و چرخه Event Loop',
    caption: 'پشت صحنه مرورگر مدرن: از درخت DOM و چرخ‌دنده‌های Event Loop تا API و امنیت وب',
  },
  D03: {
    domainId: 'D03',
    imageUrl: dataImg,
    alt: 'نمای ایزومتریک استوانه‌های ذخیره‌سازی دیتابیس، گره‌های B-Tree و مسیرهای توزیع بار',
    caption: 'موتور ذخیره‌سازی داده، درخت‌های ایندکس و جریان ترافیک در سیستم‌های مقیاس‌پذیر',
  },
  D04: {
    domainId: 'D04',
    alt: 'نمای معماری کانتینرها روی هسته لینوکس، گراف Git و لایه‌های امنیت سرور',
    caption: 'جداسازی کانتینرها روی کرنل لینوکس، تاریخچه تغییرناپذیر Git و دیسیپلین انتشار امن',
  },
  D05: {
    domainId: 'D05',
    imageUrl: aiImg,
    alt: 'نمای ایزومتریک لایه‌های معماری Transformer و پرتوهای Self-Attention میان بردارها',
    caption: 'هندسه بردارهای معنایی، پرتوهای Self-Attention و معماری سیستم‌های هوشمند عصر AI',
  },
};

/**
 * Curated canonical YouTube videos for high-leverage, conceptually challenging chapters.
 * Loaded lazily on user click via privacy-enhanced youtube-nocookie.com embed.
 */
export const CHAPTER_VIDEOS: Record<string, ChapterVideo> = {
  'T01-C02': {
    youtubeId: 'FZGugFqdr60',
    title: 'How CPUs Execute Instructions & Cache Hierarchy',
    channel: 'CrashCourse Computer Science',
    duration: '12 دقیقه',
    whyWatch: 'تجسم بصری فوق‌العاده از چرخه Fetch-Decode-Execute و دلیل سرعت حیرت‌انگیز کش‌های نزدیک CPU.',
  },
  'T01-C05': {
    youtubeId: '2quKyPnUwxw',
    title: 'Virtual Memory & Page Tables Explained',
    channel: 'Computerphile',
    duration: '14 دقیقه',
    whyWatch: 'توضیح کاملاً شهودی از اینکه چطور سیستم‌عامل به هر برنامه توهم داشتن تمام حافظه RAM را می‌دهد.',
  },
  'T03-C03': {
    youtubeId: 'rmFX1V49K8U',
    title: 'TCP 3-Way Handshake & Congestion Control Deep Dive',
    channel: 'ByteByteGo',
    duration: '9 دقیقه',
    whyWatch: 'انیمیشن مرحله‌به‌مرحله بسته‌های SYN/ACK و نحوه واکنش TCP به گم شدن بسته‌ها.',
  },
  'T03-C05': {
    youtubeId: 'mpQZVYPuDGU',
    title: 'How DNS Works Step by Step',
    channel: 'PowerCert Animated Videos',
    duration: '6 دقیقه',
    whyWatch: 'مسیر کامل یک کوئری DNS از مرورگر تا Root، TLD و Authoritative Nameserver با انیمیشن شفاف.',
  },
  'T04-C01': {
    youtubeId: 'NmM9HA2MQGI',
    title: 'Diffie-Hellman Key Exchange (Color Mixing Intuition)',
    channel: 'Computerphile',
    duration: '9 دقیقه',
    whyWatch: 'مشهورترین تشبیه دنیا برای درک رمزنگاری نامتقارن و ساخت کلید مخفی مشترک وسط جمع!',
  },
  'T04-C03': {
    youtubeId: '0TLDTodL7Lc',
    title: 'How HTTPS and TLS 1.3 Handshake Work',
    channel: 'ByteByteGo',
    duration: '8 دقیقه',
    whyWatch: 'تصویر دقیق از گواهی‌ها، CA و دست‌دهی ۱ رفت‌وبرگشت در TLS 1.3.',
  },
  'T06-C02': {
    youtubeId: '8aGhZQkoFbQ',
    title: 'What the heck is the Event Loop anyway?',
    channel: 'JSConf (Philip Roberts)',
    duration: '26 دقیقه',
    whyWatch: 'کلاسیک‌ترین و روان‌ترین ارائه تاریخ جاوااسکریپت برای درک عمیق Call Stack، Web APIs و Event Loop.',
  },
  'T09-C02': {
    youtubeId: 'aZjYr87r1b8',
    title: 'B-Trees and Database Indexes Visually Explained',
    channel: 'Spanning Tree',
    duration: '11 دقیقه',
    whyWatch: 'چرا جستجو در یک جدول ۱۰۰ میلیون ردیفی با B-Tree تنها در ۴ بار خواندن از دیسک انجام می‌شود.',
  },
  'T12-C01': {
    youtubeId: '9t9LbcOPzt8',
    title: 'NGINX Explained in 100 Seconds & Event-Driven Architecture',
    channel: 'Fireship',
    duration: '3 دقیقه',
    whyWatch: 'مرور سریع و پرانرژی روی معماری Event-Driven انجن‌اکس و تفاوت آن با مدل Thread-per-Request.',
  },
  'T14-C01': {
    youtubeId: 'e9lnsKot_SQ',
    title: 'Git Internals: Blobs, Trees, Commits & DAG',
    channel: 'Computerphile',
    duration: '15 دقیقه',
    whyWatch: 'باز کردن پوشه .git و دیدن اینکه گیت چطور در باطن یک سیستم‌فایل محتوامحور ساده و زیباست.',
  },
  'T15-C01': {
    youtubeId: 'Gjnup-PuquQ',
    title: 'Docker in 100 Seconds — Containers vs VMs',
    channel: 'Fireship',
    duration: '2 دقیقه',
    whyWatch: 'جمع‌بندی سریع، تصویری و دقیق از چرایی سبک بودن کانتینرها نسبت به ماشین‌های مجازی.',
  },
  'T17-C02': {
    youtubeId: 'aircAruvnKk',
    title: 'But what is a Neural Network? (Visual Intuition)',
    channel: '3Blue1Brown',
    duration: '19 دقیقه',
    whyWatch: 'بهترین ویدیوی آموزشی دنیا برای درک هندسی وزن‌ها، لایه‌ها و یادگیری شبکه‌های عصبی بدون فرمول ترسناک.',
  },
  'T17-C04': {
    youtubeId: 'wjZofJX0v4M',
    title: 'Transformers, the tech behind LLMs',
    channel: '3Blue1Brown',
    duration: '27 دقیقه',
    whyWatch: 'شاهکار بصری گرنت سندرسون برای دیدن واقعی جریان بردارها و Self-Attention در معماری Transformer.',
  },
  'T18-C01': {
    youtubeId: 'zduSFxRajkE',
    title: 'Let’s build the GPT Tokenizer (BPE Deep Dive)',
    channel: 'Andrej Karpathy',
    duration: '20 دقیقه (بخش اول)',
    whyWatch: 'آندری کارپاتی دقیقاً نشان می‌دهد چرا توکنایزرها منشأ اکثر رفتارهای عجیب LLMها هستند.',
  },
  'T18-C03': {
    youtubeId: 'eMlx5fFNoYc',
    title: 'Attention in Transformers, Visually Explained',
    channel: '3Blue1Brown',
    duration: '26 دقیقه',
    whyWatch: 'درک عمیق Query، Key، Value و دلیل فیزیکی اهمیت KV-Cache در مدل‌های زبانی.',
  },
  'T19-C04': {
    youtubeId: 'T-D1OfcDW1M',
    title: 'What is RAG (Retrieval-Augmented Generation)?',
    channel: 'IBM Technology',
    duration: '6 دقیقه',
    whyWatch: 'تصویر ساده و کاربردی از نحوه اتصال ایمن مدل‌های زبانی به اسناد زنده و دیتابیس برداری.',
  },
  'T20-C01': {
    youtubeId: 'F8NKVhkZZWI',
    title: 'AI Agents Clearly Explained (Workflows vs Agents)',
    channel: 'IBM Technology',
    duration: '9 دقیقه',
    whyWatch: 'تفکیک شفاف میان پایپ‌لاین قطعی و حلقه Think-Act-Observe در ساخت ایجنت‌های واقعی.',
  },
  'T20-C02': {
    youtubeId: '7j_NE6Pjv-E',
    title: 'Model Context Protocol (MCP) Explained',
    channel: 'Fireship / Technical Breakdown',
    duration: '7 دقیقه',
    whyWatch: 'آشنایی سریع با استاندارد USB-C دنیای هوش مصنوعی برای اتصال ابزارها به مدل‌ها.',
  },
};

/**
 * Specific cognitive-science analogies and ADHD-friendly 30-second hooks for flagship chapters.
 * Chapters not listed here automatically derive a crisp structured TL;DR & mental hook from their content.
 */
export const CHAPTER_COGNITIVE_HOOKS: Record<
  string,
  { hook: string; analogy: string; showVisualPlate?: boolean }
> = {
  'T01-C01': {
    hook: 'قبل از یادگیری هر ابزار جدیدی، باید فلسفه‌ای را بشناسید که ۵۵ سال است کل اینترنت و سرورها روی آن می‌چرخد.',
    analogy: 'فلسفه Unix مثل لگوهای مهندسی است: به جای یک ماشین غول‌پیکر که همه‌کار می‌کند، قطعات کوچک و بی‌نقصی داری که با لوله (`Pipe`) به هم وصل می‌شوند.',
    showVisualPlate: true,
  },
  'T01-C02': {
    hook: 'دو کد که روی کاغذ یک کار را می‌کنند می‌توانند ۱۰۰ برابر اختلاف سرعت داشته باشند — فقط به خاطر فیزیک حافظه!',
    analogy: 'رجیستر CPU مثل خودکار توی دستت است، کش L1 مثل میز کارت، RAM مثل قفسه کتابخانه و SSD مثل انبار آن سر شهر!',
    showVisualPlate: true,
  },
  'T03-C03': {
    hook: 'وقتی پیام می‌فرستی و اینترنت کند است، TCP پشت صحنه در حال مذاکره، شماره‌گذاری و ترمز گرفتن است تا حتی یک بایت گم نشود.',
    analogy: 'TCP مثل پست پیشتاز با رسید امضاشده است (مطمئن اما کمی کندتر)؛ UDP مثل انداختن کارت‌پستال در باد است (فوق‌سریع، بدون رسید!).',
    showVisualPlate: true,
  },
  'T04-C03': {
    hook: 'چطور وسط کافه‌ای پر از شنودگر، شماره کارت بانکی‌ات را به سایتی می‌فرستی که قبلاً هرگز ندیده‌ای و هیچ‌کس نمی‌فهمد؟',
    analogy: 'TLS مثل یک صندوق پستی شفاف با قفل اختصاصی است: هر کسی می‌تواند درِ صندوق را ببندد (کلید عمومی)، اما فقط صاحب واقعی با کلید توی جیبش (کلید خصوصی) بازش می‌کند.',
    showVisualPlate: true,
  },
  'T05-C01': {
    hook: 'مرورگر فقط نمایشگر متن نیست؛ یک موتور رندر ۶۰ فریم بر ثانیه است که کدهای خام را در ۱۶ میلی‌ثانیه به تصویر زنده تبدیل می‌کند.',
    analogy: 'رندر مرورگر مثل خط مونتاژ کارخانه نقاشی است: اول نقشه سازه (`DOM`)، بعد رنگ و اندازه (`CSSOM`)، بعد جای‌گذاری (`Layout`) و در نهایت نقاشی لایه‌ها روی شیشه (`Composite`).',
    showVisualPlate: true,
  },
  'T06-C02': {
    hook: 'جاوااسکریپت فقط یک دست دارد، اما چطور همزمان دکمه کلیک را می‌گیرد، انیمیشن نشان می‌دهد و جواب سرور را می‌آورد؟',
    analogy: 'Event Loop مثل یک باریستای فوق‌سریع و تک‌نفره است: سفارش قهوه را به دستگاه می‌دهد (`Web API`) و تا آماده شدنش بیکار نمی‌نشیند، سفارش مشتری بعدی را می‌گیرد!',
    showVisualPlate: true,
  },
  'T09-C02': {
    hook: 'تفاوت کوئری ۵ میلی‌ثانیه‌ای با کوئری ۱۲ ثانیه‌ای که کل سایت را می‌خواباند، اغلب فقط یک درخت ساده به نام B-Tree است.',
    analogy: 'جستجو بدون Index یعنی خواندن تک‌تک صفحات یک کتاب ۱۰۰۰ صفحه‌ای؛ اما با B-Tree Index مستقیم سراغ فهرست الفبایی آخر کتاب می‌روی و در ۳ حرکت پیدایش می‌کنی.',
    showVisualPlate: true,
  },
  'T12-C01': {
    hook: 'چطور یک سرور کوچک با Nginx می‌تواند ده‌ها هزار کاربر هم‌زمان را بدون کم آوردن RAM سرویس دهد؟',
    analogy: 'Apache قدیمی برای هر مهمان رستوران یک گارسون اختصاصی استخدام می‌کرد (رم سریع پر می‌شد!)؛ Nginx چند گارسون فوق‌چابک دارد که فقط وقتی میزی دستش را بالا برد (`epoll`) سراغش می‌روند.',
    showVisualPlate: true,
  },
  'T15-C01': {
    hook: 'کانتینر داکر یک سیستم‌عامل کامل و سنگین نیست — یک ترفند درخشان در هسته لینوکس است که در میلی‌ثانیه بالا می‌آید.',
    analogy: 'ماشین مجازی (VM) مثل ساختن یک خانه مستقل با لوله‌کشی و برق جداست؛ اما کانتینر مثل آپارتمان‌هایی است که یک موتورخانه مشترک (`Linux Kernel`) دارند ولی دیوار و قفلشان (`Namespaces`) کاملاً جداست.',
    showVisualPlate: true,
  },
  'T17-C04': {
    hook: 'یک مقاله ۱۱ صفحه‌ای در سال ۲۰۱۷ تمام تاریخ هوش مصنوعی را دگرگون کرد و مسیر تولد ChatGPT، Claude و Gemini را باز کرد.',
    analogy: 'مدل‌های قدیمی مثل خواندن کتاب از یک سوراخ کلید کلمه‌به‌کلمه بودند؛ اما Transformer کل صفحه را یکجا روی میز می‌گذارد و بین کلمات مرتبط نخ‌های نوری (`Self-Attention`) می‌کشد.',
    showVisualPlate: true,
  },
  'T18-C01': {
    hook: 'اگر می‌خواهی بفهمی چرا LLM در شمردن حروف اشتباه می‌کند و چرا متن فارسی هزینه API بیشتری دارد، کلیدش در یک کلمه است: توکن!',
    analogy: 'توکنایزر مثل دیکشنری خلاصه‌نویسی است: کلمات انگلیسی پرتکرار یک کد یک‌تکه دارند، اما کلمات فارسی گاهی مجبورند به تکه‌های کوچک‌تر شکسته شوند و فضای بیشتری بگیرند.',
    showVisualPlate: true,
  },
  'T18-C03': {
    hook: 'چرا وقتی سند بلندی به چت‌بات می‌دهی، چند ثانیه مکث می‌کند و بعد کلمات مثل رگبار سرازیر می‌شوند؟ پاسخ در حافظه KV-Cache است.',
    analogy: 'KV-Cache مثل خلاصه‌نویسی حاشیه کتاب در دور اول خواندن است (`Prefill`): بار اول کمی زمان می‌برد، اما برای پاسخ به سوالات بعدی دیگر لازم نیست کل کتاب را از صفحه اول دوباره بخوانی!',
    showVisualPlate: true,
  },
  'T19-C04': {
    hook: 'به جای اینکه بخواهی کل اطلاعات شرکت را به زور در حافظه مدل فرو کنی، یک کتابدار فوق‌سریع کنارش بگذار.',
    analogy: 'RAG یعنی تبدیل آزمون «کتاب‌بسته» (که مدل مجبور به حدس و توهم است) به آزمون «کتاب‌باز» که دقیقاً همان ۳ پاراگراف مرتبط را روی میز مدل می‌گذارد.',
    showVisualPlate: true,
  },
  'T20-C01': {
    hook: 'پشت هیاهوی کلمه «AI Agent»، یک ساختار مهندسی بسیار ساده و شفاف پنهان شده است که باید بدانی کجا به کار می‌آید و کجا دردسر می‌سازد.',
    analogy: 'Workflow مثل دستور پخت خط‌به‌خط آشپزی است؛ اما Agent مثل سرآشپزی است که غذا را می‌چشد (`Observe`)، فکر می‌کند چه ادویه‌ای کم دارد (`Think`) و خودش سراغ قفسه می‌رود (`Act`).',
    showVisualPlate: true,
  },
};

export function getChapterCognitiveMeta(
  chapterId: string,
  domainId: DomainId,
  subtitle: string,
  firstRule: string
): CognitiveEnrichment {
  const custom = CHAPTER_COGNITIVE_HOOKS[chapterId];
  const video = CHAPTER_VIDEOS[chapterId];
  // Show the domain architectural plate on chapter 1 of every track or flagged landmark chapters
  const isTrackIntro = chapterId.endsWith('-C01');

  return {
    hook: custom?.hook ?? subtitle,
    analogy:
      custom?.analogy ??
      `نکته کلیدی برای تثبیت سریع در ذهن: ${firstRule}`,
    keyTakeaway: firstRule,
    showVisualPlate: custom?.showVisualPlate ?? isTrackIntro,
    video,
  };
}
