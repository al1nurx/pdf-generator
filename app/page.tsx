"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Settings, X, ChevronDown, ChevronUp } from "lucide-react";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-zinc-400 text-sm gap-2">
        <span className="animate-pulse">●</span> Загрузка превью...
      </div>
    ),
  },
);

import MyPDFDocument from "@/components/MyPDFDocument";
import { EditorWrapper } from "@/components/EditorWrapper";
import type { DocMeta } from "@/components/MyPDFDocument";

const INITIAL_CONTENT = `
<h2>1. Область применения</h2>
<p>1.1. Настоящая должностная инструкция определяет и устанавливает требования к деятельности Research Assistant (Ассистент исследователя) в соответствии с действующим законодательством и локальными актами Акционерное общество «Университет КАЗГЮУ имени М.С. Нарикбаева».</p>

<h2>2. Обозначения и сокращения</h2>
<p>2.1. В настоящей должностной инструкции применяются следующие сокращения:</p>
<p>2.1.1. МНиВО РК – Министерство Науки и Высшего Образования;</p>
<p>2.1.2. MNU – Акционерное общество «Университет КАЗГЮУ имени М.С. Нарикбаева»;</p>
<p>2.1.3. ППС – Профессорско-преподавательский состав;</p>
<p>2.1.4. ДИ – Должностная инструкция;</p>
<p>2.1.5. УПО – Управление правового обеспечения;</p>
<p>2.1.6. ВШ – Высшая Школа;</p>
<p>2.1.7. DSHR – Департамент Стратегии и HR.</p>

<h2>3. Общие положения</h2>
<p>3.1. Research Assistant (Ассистент исследователя) относится к категории ППС.</p>
<p>3.2. На должность Research Assistant (Ассистент исследователя) назначается лицо, которое является магистрантом или докторантом MNU, имеет положительную рекомендацию профессора MNU с указанием конкретного научного проекта/исследования, в котором задействован кандидат, обладает средним баллом успеваемости GPA не ниже 3.0, владеет иностранным языком на уровне не ниже В2 (CEFR), имеет безупречную репутацию с точки зрения академической честности и поведения, обладает навыками академического письма и научно-исследовательскими навыками, владеет ІТ-компетенциями на уровне, необходимом для реализации функционала по позиции.</p>
<p>3.3. Назначение на должность Research Assistant (Ассистент исследователя) и освобождение от должности производится приказом Председателя Правления MNU.</p>
<p>3.4. Research Assistant (Ассистент исследователя) подчиняется непосредственно Директору (Декану) Высшей школы, Руководителю научных школ и выполняет свои должностные обязанности под руководством курирующего профессора.</p>
<p>3.5. Research Assistant (Ассистент исследователя) должен знать:</p>
<p>3.5.1. Конституцию Республики Казахстан;</p>
<p>3.5.2. законы РК: «Об образовании», «О науке», «О противодействии коррупции» и другие нормативные правовые акты, регулирующие вопросы функционирования и развития системы высшего и послевузовского образования, Устав, внутренние документы и нормативные документы MNU, регламентирующие организацию и проведение учебного процесса, приказы, распоряжения руководства MNU;</p>
<p>3.5.3. положение о персонале и положение о конкурсном отборе на замещение вакантных должностей профессорско-преподавательского состава;</p>
<p>3.5.4. положение о ВШ;</p>
<p>3.5.5. настоящую должностную инструкцию.</p>
<p>3.6. В период временного отсутствия Research Assistant (Ассистент исследователя) его обязанности исполняет замещающий сотрудник, назначенный приказом Председателя Правления MNU.</p>

<h2>4. Должностные обязанности</h2>
<p>4.1. Research Assistant (Ассистент исследователя) ВШ MNU обязан осуществлять следующие виды деятельности:</p>
<p>- поиск и систематизация научной литературы по тематике исследования (Проведение поиска в международных и локальных базах данных (Scopus, Web of Science, Google Scholar, eLIBRARY, НЭБ и др.); отбор релевантных статей, монографий, диссертаций, отчетов и других источников; ведение библиографических списков с использованием специализированных программ (например, Zotero, Mendeley, EndNote); составление аннотаций и кратких обзоров по каждому источнику; подготовка тематических таблиц/матриц литературы (authors, year, methods, findings, gaps); обеспечение соответствия найденных источников стандартам академической честности (APA, Chicago и др.);</p>
<p>- сбор данных и их предварительная обработка, включая открытые источники, а также данные, полученные с помощью количественных и качественных методов исследования (опросы, интервью, наблюдения, анализ документов, судебную и иную практику); поиск, сбор и систематизация статистических данных, отчетов государственных органов и НПО, а также первичных эмпирических данных, полученных в ходе анкетирования, интервью, фокус-групп, наблюдений и анализа текстов и документов; проверка полноты, корректности и достоверности собранных данных, включая контроль логической согласованности ответов, репрезентативности выборки и качества записей (аудио, видео, текстовых); приведение данных к единому формату (унификация кодировок, форматов дат, валют и единиц измерения (для количественных данных), транскрибирование интервью и фокус-групп, стандартизация текстов и протоколов наблюдения (для качественных данных)); очистка данных, исключение нерелевантных или искажённых данных, кодирование и предварительная обработка данных (статистическое кодирование переменных (для количественных данных), тематическое, категориальное или контент-кодирование (для качественных данных)); создание метаданных с описанием каждого набора данных (источник, метод сбора, период, выборка, структура, ограничения); ведение структурированного архива данных с чёткими наименованиями файлов, версиями документов и разделением данных по типам и методам сбора с соблюдением требований конфиденциальности и этики;</p>
<p>- предварительный анализ данных, управление и обработка (проведение предварительного анализа количественных данных, включая расчёт описательной статистики (средние значения, медианы, стандартные отклонения), а также первичный аналитический обзор качественных данных (прочтение и сопоставление транскриптов интервью, текстовых материалов, протоколов наблюдений); построение таблиц, диаграмм и графиков для визуализации тенденций в количественных данных и наглядного представления распределений, частот и повторяющихся паттернов в качественных данных; проверка данных на наличие пропущенных значений, логических несоответствий и искажений, включая контроль качества ответов респондентов и полноты качественных материалов; ведение и обновление структурированных баз данных, содержащих количественные и качественные массивы, с использованием специализированных программных средств (Excel, SPSS, R, Stata, Python, а также программ для качественного анализа при необходимости); подготовка данных к дальнейшему углублённому анализу старшими исследователями, включая нормализацию, агрегирование и категоризацию количественных переменных, а также уточнение кодов, категорий и аналитических рамок для качественных данных; документирование всех этапов обработки и анализа данных, включая используемые процедуры, параметры и решения, с целью обеспечения прозрачности, воспроизводимости и последующей верификации результатов исследования);</p>
<p>- подготовка черновых версий презентаций и рабочих материалов (выполнение переводов научных исследований Научной школы/Центра; создание презентаций в PowerPoint/Canva по структуре, заданной руководителем; подбор и оформление графиков, таблиц, иллюстраций; подготовка инфографики и схем для наглядного объяснения результатов, черновая верстка отчетов, справок, рабочих материалов (в Word, Google Docs, LaTeX); проверка соответствия корпоративному/академическому стилю; подготовка материалов для внутренних встреч, семинаров, конференций, вебинаров и т.д.);</p>
<p>- организационная поддержка (ведение календаря, помощь с оформлением документов (ведение календаря исследовательской группы/Научной школы (назначение встреч, напоминания); помощь в подготовке отчетных документов по грантам/проектам; оформление заявок на конференции, командировки, публикации; ведение переписки с партнерами и контрагентами (по поручению руководителя); ведение социальный сетей и продвижение научных проектов (написание текстов, редактирование фото- и видео-материалов и т.д.); координация деятельности стажеров и волонтеров Научной школы/Центра; сканирование, копирование и структурирование рабочих документов; поддержка в логистических вопросах (бронирование аудиторий, регистрация участников мероприятий, техническое ассистирование и т.д.).</p>

<h2>5. Права</h2>
<p>5.1. Research Assistant (Ассистент исследователя) имеет право:</p>
<p>5.1.1. на обеспечение условий для профессиональной деятельности;</p>
<p>5.1.2. в пределах установленных компетенций участвовать в работе всех подразделений вуза, где обсуждаются и решаются вопросы их деятельности;</p>
<p>5.1.3. повышать в установленном порядке квалификацию;</p>
<p>5.1.4. в пределах установленных компетенций запрашивать у руководителей структурных подразделений и иных специалистов информацию и документы, необходимые для выполнения своих должностных обязанностей;</p>
<p>5.1.5. бесплатно пользоваться услугами библиотек, вычислительных центров, информационных фондов учебных и научных подразделений.</p>

<h2>6. Ответственность</h2>
<p>6.1. Research Assistant (Ассистент исследователя) несет ответственность за:</p>
<p>- ненадлежащее исполнение или несвоевременное исполнение своих должностных обязанностей, предусмотренных настоящей должностной инструкцией;</p>
<p>- нарушение условий о сохранении и не распространении конфиденциальной информации, персональных данных и иной коммерческой/служебной информации;</p>
<p>- в пределах норм, определенных действующим трудовым законодательством Республики Казахстан;</p>
<p>- нарушение законодательства РК, Устава и внутренних документов MNU;</p>
<p>- ненадлежащее обеспечение сохранности имущества, находящегося в управлении и соблюдение правил пожарной безопасности;</p>
<p>- нарушение правил охраны труда, техники безопасности, коммерческой и служебной тайн;</p>
<p>- правонарушения, совершенные в процессе осуществления своей деятельности, в пределах, определенных административным, уголовным и гражданским законодательством РК;</p>
<p>- причинение материального ущерба - в пределах, определенных трудовым и гражданским законодательством РК.</p>

<h2>7. Изменения и дополнения</h2>
<p>7.1. Настоящая должностная инструкция действует до ее отмены или замены новой.</p>
<p>7.2. Изменения в должностную инструкцию вносятся на основании:</p>
<p>7.2.1. приказа Председателя Правления MNU по служебной записке директора DSHR, согласованной с Провостом;</p>
<p>7.2.2. при реорганизации и сокращении штатов;</p>
<p>7.2.3. при необходимости перераспределения функций и должностных обязанностей.</p>
<p>7.3. За внесение изменений и дополнений в подлинник и учтенные рабочие экземпляры несет ответственность сотрудник DSHR.</p>
<p>7.4. Изменения в подлинник вносятся в «Лист регистрации изменений» (Приложение В) сотрудником DSHR.</p>
<p>7.5. Должностная инструкция должна быть заменена и заново утверждена в случаях изменения названия организации или структурного подразделения, изменения названия должности.</p>

<h2>8. Согласование, хранение и рассылка</h2>
<p>8.1. Должностная инструкция согласовывается и оформляется в «Листе согласования» с:</p>
<p>8.1.1. Провостом;</p>
<p>8.1.2. Директорами (Деканами) Высших школ;</p>
<p>8.1.3. Директором DSHR;</p>
<p>8.1.4. Руководителем Управления правового обеспечения (УПО);</p>
<p>8.2. Должностная инструкция утверждается Председателем Правления MNU.</p>
<p>8.3. Должностная инструкция доводится до сведения работника под роспись. Учтенный рабочий экземпляр утвержденной инструкции передается в подразделение, в котором он работает, а подлинник с его росписью об ознакомлении передается в DSHR.</p>

<div class="page-break"></div>

<h1>Приложение А</h1>
<h1>Лист согласования</h1>
<table>
  <thead>
    <tr>
      <th>Должность</th>
      <th>Ф.И.О</th>
      <th>Подпись</th>
      <th>Дата</th>
    </tr>
    <tr>
      <th>1.</th>
      <th>2.</th>
      <th>3.</th>
      <th>4.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Провост</td><td>Ибраева А.Б.</td><td></td><td></td></tr>
    <tr><td>Заместитель Председателя Правления</td><td>Шайназарова А.Б.</td><td></td><td></td></tr>
    <tr><td>Директор (Декан) ВШ Права</td><td></td><td></td><td></td></tr>
    <tr><td>Директор (Декан) ВШ Экономики и права</td><td></td><td></td><td></td></tr>
    <tr><td>Директор (Декан) ВШ Цифровых технологий</td><td></td><td></td><td></td></tr>
    <tr><td>Директор (Декан) ВШ Гуманитарных наук</td><td></td><td></td><td></td></tr>
    <tr><td>Директор (Декан) ВШ Общественного здравоохранения</td><td></td><td></td><td></td></tr>
    <tr><td>Директор DSHR</td><td></td><td></td><td></td></tr>
    <tr><td>Руководитель УПО</td><td></td><td></td><td></td></tr>
  </tbody>
</table>

<div class="page-break"></div>

<h1>Приложение Б</h1>
<h1>Лист ознакомления</h1>
<table>
  <thead>
    <tr>
      <th></th>
      <th>Должность</th>
      <th>Ф.И.О</th>
      <th>Подпись</th>
      <th>Дата</th>
    </tr>
    <tr>
      <th></th>
      <th>1.</th>
      <th>2.</th>
      <th>3.</th>
      <th>4.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1.</td><td></td><td></td><td></td><td></td></tr>
    <tr><td>2.</td><td></td><td></td><td></td><td></td></tr>
    <tr><td>3.</td><td></td><td></td><td></td><td></td></tr>
    <tr><td>4.</td><td></td><td></td><td></td><td></td></tr>
    <tr><td>5.</td><td></td><td></td><td></td><td></td></tr>
  </tbody>
</table>

<div class="page-break"></div>

<h1>Приложение В</h1>
<h1>Лист регистрации изменений</h1>
<table>
  <thead>
    <tr>
      <th rowspan="2">Номер изменения</th>
      <th rowspan="2">Номер извещения об изменении</th>
      <th colspan="4">Номер листов (страниц)</th>
      <th rowspan="2">Всего листов (после изменений)</th>
      <th rowspan="2">Дата внесения</th>
      <th rowspan="2">ФИО, осуществляющего внесение изменений</th>
      <th rowspan="2">Подпись, вносившего изменения</th>
    </tr>
    <tr>
      <th>Измененных</th>
      <th>замененных</th>
      <th>новых</th>
      <th>аннулированных</th>
    </tr>
    <tr>
      <th>1.</th>
      <th>2.</th>
      <th>3.</th>
      <th>4.</th>
      <th>5.</th>
      <th>6.</th>
      <th>7.</th>
      <th>8.</th>
      <th>9.</th>
      <th>10.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  </tbody>
</table>

<div class="page-break"></div>

<h1>Приложение Г</h1>
<h1>Лист учета периодических проверок</h1>
<table>
  <thead>
    <tr>
      <th>Дата проверки</th>
      <th>Ф.И.О лица, выполнившего проверку</th>
      <th>Подпись выполнившего проверку</th>
      <th>Формулировка замечаний</th>
    </tr>
    <tr>
      <th>1.</th>
      <th>2.</th>
      <th>3.</th>
      <th>4.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td></td><td></td><td></td><td></td></tr>
    <tr><td></td><td></td><td></td><td></td></tr>
    <tr><td></td><td></td><td></td><td></td></tr>
    <tr><td></td><td></td><td></td><td></td></tr>
    <tr><td></td><td></td><td></td><td></td></tr>
  </tbody>
</table>
`.trim();

const INITIAL_META: DocMeta = {
  approvalLabel: "«УТВЕРЖДАЮ»",
  approvalPosition: "Председатель Правления",
  approvalOrg: "АО «Университет КАЗГЮУ имени М.С.Нарикбаева»",
  approvalName: "Нарикбаев Т.М.",
  approvalDate: "«____» __________ 2025 г.",
  docTitle: "ДОЛЖНОСТНАЯ ИНСТРУКЦИЯ",
  docSubtitle1: "Research Assistant (Ассистент исследователя)",
  docSubtitle2: "Высшей Школы",
  cityText: "АСТАНА",

  infoDevLabel: "1. РАЗРАБОТАНА И ВНЕСЕНА:",
  infoDevValue: "",
  infoApproveLabel: "2. УТВЕРЖДЕНА И ВВЕДЕНА В ДЕЙСТВИЕ:",
  infoApproveValue:
    "приказом Председателя Правления АО «Университет КАЗГЮУ имени М.С.Нарикбаева» № ______ от «___»______ 2025 г.",
  infoDevelopersLabel: "3. РАЗРАБОТЧИКИ:",
  infoDevelopersValue:
    "Высшие Школы, Департамент стратегии и HR, Управление правого обеспечения.",
  infoCheckLabel: "4. ПЕРИОДИЧНОСТЬ ПРОВЕРКИ:",
  infoCheckValue: "1 раз в год.",

  footerCopy: "Запрещается несанкционированное копирование документа",
  footerLegal:
    "Настоящая должностная инструкция не может быть полностью или частично воспроизведена,\nтиражирована и распространена без разрешения Председателя Правления АО «Университет\nКАЗГЮУ имени М.С. Нарикбаева».",
};

const FieldInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-zinc-200 rounded-md px-2.5 py-1.5 text-[12px] text-zinc-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#D62E1F]/40 focus:border-[#D62E1F]/60 transition-all"
    />
  </div>
);

const FieldTextarea = ({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
      {label}
    </label>
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-zinc-200 rounded-md px-2.5 py-1.5 text-[12px] text-zinc-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#D62E1F]/40 focus:border-[#D62E1F]/60 transition-all resize-none"
    />
  </div>
);

const Section = ({
  title,
  children,
  isOpen,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-50 hover:bg-zinc-100 transition-colors"
      >
        <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp size={13} className="text-zinc-400" />
        ) : (
          <ChevronDown size={13} className="text-zinc-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-3 flex flex-col gap-2.5 bg-white">{children}</div>
      )}
    </div>
  );
};

export default function Home() {
  const [content, setContent] = useState<string>(INITIAL_CONTENT);
  const [debouncedContent, setDebouncedContent] =
    useState<string>(INITIAL_CONTENT);
  const [meta, setMeta] = useState<DocMeta>(INITIAL_META);
  const [debouncedMeta, setDebouncedMeta] = useState<DocMeta>(INITIAL_META);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("title");

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const h = setTimeout(() => setDebouncedContent(content), 1000);
    return () => clearTimeout(h);
  }, [content]);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedMeta(meta), 600);
    return () => clearTimeout(h);
  }, [meta]);

  const setField =
    <K extends keyof DocMeta>(key: K) =>
    (value: DocMeta[K]) =>
      setMeta((prev) => ({ ...prev, [key]: value }));

  const memoizedDocument = useMemo(
    () => <MyPDFDocument content={debouncedContent} meta={debouncedMeta} />,
    [debouncedContent, debouncedMeta],
  );

  return (
    <main
      className="flex h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Left: Editor ── */}
      <div
        className={`flex flex-col border-r border-zinc-200 bg-white overflow-hidden transition-all duration-300 ${settingsOpen ? "w-[30%]" : "w-1/2"}`}
      >
        <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100">
          <div className="w-2 h-2 rounded-full bg-[#D62E1F]" />
          <div className="flex-1">
            <h2 className="text-[13px] font-semibold text-zinc-800 leading-none">
              Редактор
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-none">
              PDF обновляется автоматически
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen((o) => !o)}
            title="Настройки страниц и футера"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all ${
              settingsOpen
                ? "bg-[#D62E1F] text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
            }`}
          >
            <Settings size={13} />
            <span className="hidden sm:inline">Настройки</span>
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <EditorWrapper content={content} onChange={setContent} />
        </div>
      </div>

      {/* ── Settings Panel ── */}
      {settingsOpen && (
        <div className="flex flex-col w-[22%] border-r border-zinc-200 bg-[#FAFAFA] overflow-hidden">
          <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 bg-white">
            <div>
              <h2 className="text-[13px] font-semibold text-zinc-800 leading-none">
                Настройки документа
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-none">
                Титул, сведения, футеры
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {/* ── Титульная страница ── */}
            <Section
              title="Титульная страница"
              isOpen={openSection === "title"}
              onToggle={() => toggleSection("title")}
            >
              <FieldInput
                label="Заголовок «УТВЕРЖДАЮ»"
                value={meta.approvalLabel}
                onChange={setField("approvalLabel")}
              />
              <FieldInput
                label="Должность (строка 1)"
                value={meta.approvalPosition}
                onChange={setField("approvalPosition")}
              />
              <FieldInput
                label="Организация"
                value={meta.approvalOrg}
                onChange={setField("approvalOrg")}
              />
              <FieldInput
                label="ФИО руководителя"
                value={meta.approvalName}
                onChange={setField("approvalName")}
              />
              <FieldInput
                label="Дата утверждения"
                value={meta.approvalDate}
                onChange={setField("approvalDate")}
              />
              <FieldInput
                label="Название документа"
                value={meta.docTitle}
                onChange={setField("docTitle")}
              />
              <FieldInput
                label="Подзаголовок 1"
                value={meta.docSubtitle1}
                onChange={setField("docSubtitle1")}
              />
              <FieldInput
                label="Подзаголовок 2"
                value={meta.docSubtitle2}
                onChange={setField("docSubtitle2")}
              />
              <FieldInput
                label="Город"
                value={meta.cityText}
                onChange={setField("cityText")}
              />
            </Section>

            {/* ── Страница сведений ── */}
            <Section
              title="Страница сведений"
              isOpen={openSection === "info"}
              onToggle={() => toggleSection("info")}
            >
              <FieldInput
                label="Метка п.1"
                value={meta.infoDevLabel}
                onChange={setField("infoDevLabel")}
              />
              <FieldInput
                label="Значение п.1"
                value={meta.infoDevValue}
                onChange={setField("infoDevValue")}
              />
              <FieldInput
                label="Метка п.2"
                value={meta.infoApproveLabel}
                onChange={setField("infoApproveLabel")}
              />
              <FieldTextarea
                label="Значение п.2"
                value={meta.infoApproveValue}
                onChange={setField("infoApproveValue")}
                rows={3}
              />
              <FieldInput
                label="Метка п.3"
                value={meta.infoDevelopersLabel}
                onChange={setField("infoDevelopersLabel")}
              />
              <FieldTextarea
                label="Значение п.3"
                value={meta.infoDevelopersValue}
                onChange={setField("infoDevelopersValue")}
              />
              <FieldInput
                label="Метка п.4"
                value={meta.infoCheckLabel}
                onChange={setField("infoCheckLabel")}
              />
              <FieldInput
                label="Значение п.4"
                value={meta.infoCheckValue}
                onChange={setField("infoCheckValue")}
              />
            </Section>

            {/* ── Футеры ── */}
            <Section
              title="Футеры"
              isOpen={openSection === "footers"}
              onToggle={() => toggleSection("footers")}
            >
              <FieldInput
                label="Строка об авторских правах"
                value={meta.footerCopy}
                onChange={setField("footerCopy")}
              />
              <FieldTextarea
                label="Правовой текст (многострочный)"
                value={meta.footerLegal}
                onChange={setField("footerLegal")}
                rows={4}
              />
            </Section>
          </div>
        </div>
      )}

      {/* ── Right: PDF Preview ── */}
      <div
        className={`flex flex-col bg-[#ECEEF1] overflow-hidden transition-all duration-300 ${settingsOpen ? "w-[48%]" : "w-1/2"}`}
      >
        <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-zinc-200 bg-[#F4F5F7]">
          <div className="w-2 h-2 rounded-full bg-zinc-400" />
          <div>
            <h2 className="text-[13px] font-semibold text-zinc-700 leading-none">
              Превью PDF
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-none">
              Формат A4 · Фирменный стиль MNU
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-5">
          <div className="h-full rounded-xl overflow-hidden shadow-xl shadow-black/10">
            <PDFViewer width="100%" height="100%" showToolbar={true}>
              {memoizedDocument}
            </PDFViewer>
          </div>
        </div>
      </div>
    </main>
  );
}
