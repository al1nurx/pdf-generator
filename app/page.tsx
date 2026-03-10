"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

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

const INITIAL_CONTENT = `<h1>1. ЦЕЛЬ И ОБЛАСТЬ ПРИМЕНЕНИЯ</h1><p>Настоящее Положение разработано в целях дальнейшей конкретизации пункта 2.3 Академической политики Университета КАЗГЮУ имени М.С.Нарикбаева.</p>`;

export default function Home() {
  const [content, setContent] = useState<string>(INITIAL_CONTENT);

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
              <MyPDFDocument content={content} />
            </PDFViewer>
          </div>
        </div>
      </div>
    </main>
  );
}
