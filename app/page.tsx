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

<h2>4. Должностные обязанности</h2>
<p>4.1. Research Assistant (Ассистент исследователя) ВШ MNU обязан осуществлять следующие виды деятельности:</p>
<p>поиск и систематизация научной литературы по тематике исследования;</p>
<p>сбор данных и их предварительная обработка;</p>
<p>предварительный анализ данных, управление и обработка;</p>
<p>подготовка черновых версий презентаций и рабочих материалов;</p>
<p>организационная поддержка.</p>

<h2>5. Права</h2>
<p>5.1. Research Assistant (Ассистент исследователя) имеет право на обеспечение условий для профессиональной деятельности.</p>

<h2>6. Ответственность</h2>
<p>6.1. Research Assistant (Ассистент исследователя) несет ответственность за ненадлежащее исполнение своих должностных обязанностей.</p>

<h2>7. Изменения и дополнения</h2>
<p>7.1. Настоящая должностная инструкция действует до ее отмены или замены новой.</p>
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
