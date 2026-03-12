"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

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

const INITIAL_CONTENT = `
<h2>1. Область применения</h2>
<p>1.1. Настоящая должностная инструкция определяет и устанавливает требования к деятельности Research Assistant (Ассистент исследователя) в соответствии с действующим законодательством и локальными актами Акционерное общество «Университет КАЗГЮУ имени М.С. Нарикбаева».</p>

<h2>2. Обозначения и сокращения</h2>
<p>2.1. В настоящей должностной инструкции применяются следующие сокращения:</p>
<p>2.2. МНиВО РК — Министерство Науки и Высшего Образования;</p>
<p>2.3. MNU — Акционерное общество «Университет КАЗГЮУ имени М.С. Нарикбаева»;</p>
<p>2.4. ППС — Профессорско-преподавательский состав;</p>
<p>2.5. ДИ — Должностная инструкция;</p>
<p>2.6. УПО — Управление правового обеспечения;</p>
<p>2.7. ВШ — Высшая Школа;</p>
<p>2.8. DSHR — Департамент Стратегии и HR.</p>

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
<p>поиск и систематизация научной литературы по тематике исследования (проведение поиска в международных и локальных базах данных (Scopus, Web of Science, Google Scholar, eLIBRARY, НЭБ и др.); отбор релевантных статей, монографий, диссертаций, отчетов и других источников; ведение библиографических списков с использованием специализированных программ (например, Zotero, Mendeley, EndNote); составление аннотаций и кратких обзоров по каждому источнику; подготовка тематических таблиц/матриц литературы (authors, year, methods, findings, gaps); обеспечение соответствия найденных источников стандартам академической честности (APA, Chicago и др.);</p>
<p>сбор данных и их предварительная обработка, включая открытые источники, а также данные, полученные с помощью количественных и качественных методов исследования (опросы, интервью, наблюдения, анализ документов, судебную и иную практику); поиск, сбор и систематизация статистических данных, отчетов государственных органов и НПО; проверка полноты, корректности и достоверности собранных данных; приведение данных к единому формату; очистка данных, кодирование и предварительная обработка; создание метаданных; ведение структурированного архива данных с соблюдением требований конфиденциальности и этики;</p>
<p>предварительный анализ данных, управление и обработка (проведение предварительного анализа количественных данных, включая расчёт описательной статистики; построение таблиц, диаграмм и графиков; проверка данных на наличие пропущенных значений, логических несоответствий и искажений; ведение и обновление структурированных баз данных с использованием специализированных программных средств (Excel, SPSS, R, Stata, Python); подготовка данных к дальнейшему углублённому анализу; документирование всех этапов обработки и анализа данных);</p>
<p>подготовка черновых версий презентаций и рабочих материалов (выполнение переводов научных исследований Научной школы/Центра; создание презентаций в PowerPoint/Canva; подбор и оформление графиков, таблиц, иллюстраций; подготовка инфографики и схем; черновая верстка отчетов, справок, рабочих материалов (в Word, Google Docs, LaTeX); проверка соответствия корпоративному/академическому стилю; подготовка материалов для внутренних встреч, семинаров, конференций, вебинаров и т.д.);</p>
<p>организационная поддержка (ведение календаря исследовательской группы/Научной школы (назначение встреч, напоминания); помощь в подготовке отчетных документов по грантам/проектам; оформление заявок на конференции, командировки, публикации; ведение переписки с партнерами и контрагентами (по поручению руководителя); ведение социальных сетей и продвижение научных проектов; координация деятельности стажеров и волонтеров Научной школы/Центра; сканирование, копирование и структурирование рабочих документов; поддержка в логистических вопросах.</p>

<h2>5. Права</h2>
<p>5.1. Research Assistant (Ассистент исследователя) имеет право:</p>
<p>5.1.1. на обеспечение условий для профессиональной деятельности;</p>
<p>5.1.2. в пределах установленных компетенций участвовать в работе всех подразделений вуза, где обсуждаются и решаются вопросы их деятельности;</p>
<p>5.1.3. повышать в установленном порядке квалификацию;</p>
<p>5.1.4. в пределах установленных компетенций запрашивать у руководителей структурных подразделений и иных специалистов информацию и документы, необходимые для выполнения своих должностных обязанностей;</p>
<p>5.1.5. бесплатно пользоваться услугами библиотек, вычислительных центров, информационных фондов учебных и научных подразделений.</p>

<h2>6. Ответственность</h2>
<p>6.1. Research Assistant (Ассистент исследователя) несет ответственность за:</p>

<p>ненадлежащее исполнение или несвоевременное исполнение своих должностных обязанностей, предусмотренных настоящей должностной инструкцией;</p>
<p>нарушение условий о сохранении и не распространении конфиденциальной информации, персональных данных и иной коммерческой/служебной информации;</p>
<p>в пределах норм, определенных действующим трудовым законодательством Республики Казахстан;</p>
<p>нарушение законодательства РК, Устава и внутренних документов MNU;</p>
<p>ненадлежащее обеспечение сохранности имущества, находящегося в управлении и соблюдение правил пожарной безопасности;</p>
<p>нарушение правил охраны труда, техники безопасности, коммерческой и служебной тайн;</p>
<p>правонарушения, совершенные в процессе осуществления своей деятельности, в пределах, определенных административным, уголовным и гражданским законодательством РК;</p>
<p>причинение материального ущерба — в пределах, определенных трудовым и гражданским законодательством РК.</p>


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
<p>8.1.4. Руководителем Управления правового обеспечения (УПО).</p>
<p>8.2. Должностная инструкция утверждается Председателем Правления MNU.</p>
<p>8.3. Должностная инструкция доводится до сведения работника под роспись. Учтенный рабочий экземпляр утвержденной инструкции передается в подразделение, в котором он работает, а подлинник с его росписью об ознакомлении передается в DSHR.</p>

<div class="page-break"></div>

<h1>Приложение А</h1>
<h1>ЛИСТ СОГЛАСОВАНИЯ</h1>
<table>
  <tbody>
    <tr>
      <th>Должность</th>
      <th>Ф.И.О</th>
      <th>Подпись</th>
      <th>Дата</th>
    </tr>
    <tr><td>1.</td><td>2.</td><td>3.</td><td>4.</td></tr>
    <tr><td>Провост</td><td>Ибраева А.Б</td><td> </td><td> </td></tr>
    <tr><td>Заместитель Председателя Правления</td><td>Шайназарова А.Б.</td><td> </td><td> </td></tr>
    <tr><td>Директор Департамента стратегии и HR</td><td>Кусаинова А.Ж.</td><td> </td><td> </td></tr>
    <tr><td>Руководитель УПО</td><td>Крушинский М.А.</td><td> </td><td> </td></tr>
    <tr><td>Директор ВГШ</td><td>Бопурова Ж.Т.</td><td> </td><td> </td></tr>
    <tr><td>Директор ВШП</td><td>Бектибаева О.С.</td><td> </td><td> </td></tr>
    <tr><td>Директор МШЭ</td><td>Кемельбаева С.С.</td><td> </td><td> </td></tr>
    <tr><td>Директор МШЖ</td><td>Жамалова А.Т.</td><td> </td><td> </td></tr>
    <tr><td> </td><td> </td><td> </td><td> </td></tr>
    <tr><td> </td><td> </td><td> </td><td> </td></tr>
    <tr><td> </td><td> </td><td> </td><td> </td></tr>
    <tr><td> </td><td> </td><td> </td><td> </td></tr>
    <tr><td> </td><td> </td><td> </td><td> </td></tr>
    <tr><td> </td><td> </td><td> </td><td> </td></tr>
    <tr><td> </td><td> </td><td> </td><td> </td></tr>
  </tbody>
</table>

<div class="page-break"></div>

<h1>Приложение Б</h1>
<h1>ЛИСТ ОЗНАКОМЛЕНИЯ</h1>
<table>
  <tbody>
    <tr>
      <th>Должность</th>
      <th>Ф.И.О</th>
      <th>Подпись</th>
      <th>Дата</th>
    </tr>
    <tr><td>1.</td><td>2.</td><td>3.</td><td>4.</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
  </tbody>
</table>

<div class="page-break"></div>

<h1>Приложение В</h1>
<h1>ЛИСТ РЕГИСТРАЦИИ ИЗМЕНЕНИЙ</h1>
<table>
  <tbody>
    <tr>
      <th rowspan="2" data-vertical="true" data-colwidth="45">Номер изменения</th>
      <th rowspan="2" data-vertical="true" data-colwidth="55">
        Номер извещения об изменении
      </th>
      <th colspan="4">Номер листов (страниц)</th>
      <th rowspan="2" data-vertical="true" data-colwidth="55">
        Всего листов (после изменений)
      </th>
      <th rowspan="2" data-vertical="true" data-colwidth="45">Дата внесения</th>
      <th rowspan="2" data-vertical="true" data-colwidth="150">
        ФИО, осуществившего внесение изменений
      </th>
      <th rowspan="2" data-vertical="true" data-colwidth="50">
        Подпись, вносившего изменения
      </th>
    </tr>
    <tr>
      <th data-vertical="true" data-colwidth="38">измененных</th>
      <th data-vertical="true" data-colwidth="38">замененных</th>
      <th data-vertical="true" data-colwidth="38">новых</th>
      <th data-vertical="true" data-colwidth="38">аннулированных</th>
    </tr>
    <tr>
      <td>1.</td><td>2.</td><td>3.</td><td>4.</td><td>5.</td><td>6.</td><td>7.</td><td>8.</td><td>9.</td><td>10.</td>
    </tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
  </tbody>
</table>

<div class="page-break"></div>

<h1>Приложение Г</h1>
<h1>ЛИСТ УЧЕТА ПЕРИОДИЧЕСКИХ ПРОВЕРОК</h1>
<table>
  <tbody>
    <tr>
      <th>Дата проверки</th>
      <th>Ф.И.О лица, выполнившего проверку</th>
      <th>Подпись выполнившего проверку</th>
      <th>Формулировка замечаний</th>
    </tr>
    <tr><td>1.</td><td>2.</td><td>3.</td><td>4.</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
  </tbody>
</table>`.trim();

export default function Home() {
  const [content, setContent] = useState<string>(INITIAL_CONTENT);

  const [debouncedContent, setDebouncedContent] =
    useState<string>(INITIAL_CONTENT);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedContent(content);
    }, 1000);

    return () => clearTimeout(handler);
  }, [content]);

  const memoizedDocument = useMemo(
    () => <MyPDFDocument content={debouncedContent} />,
    [debouncedContent],
  );

  return (
    <main
      className="flex h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex flex-col w-1/2 border-r border-zinc-200 bg-white overflow-hidden">
        <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100">
          <div className="w-2 h-2 rounded-full bg-[#D62E1F]" />
          <div>
            <h2 className="text-[13px] font-semibold text-zinc-800 leading-none">
              Редактор
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-none">
              PDF обновляется автоматически
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <EditorWrapper content={content} onChange={setContent} />
        </div>
      </div>
      <div className="flex flex-col w-1/2 bg-[#ECEEF1] overflow-hidden">
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
