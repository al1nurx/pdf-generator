"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Extension, Node, mergeAttributes } from "@tiptap/core";
import type { CommandProps } from "@tiptap/core";
import { RawCommands } from "@tiptap/core";
import { Transaction } from "@tiptap/pm/state";
import { EditorState } from "@tiptap/pm/state";
import { Node as ProsemirrorNode } from "@tiptap/pm/model";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Minus,
  Undo2,
  Redo2,
  IndentIncrease,
  IndentDecrease,
  Table as TableIcon,
  Plus,
} from "lucide-react";

type Dispatch = (tr: Transaction) => void;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType;
    };
    dashList: {
      toggleDashList: () => ReturnType;
    };
    tableCellVertical: {
      toggleCellVertical: () => ReturnType;
    };
  }
}

const TableCellWithVertical = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      vertical: {
        default: false,
        parseHTML: (el) => el.getAttribute("data-vertical") === "true",
        renderHTML: (attrs) =>
          attrs.vertical ? { "data-vertical": "true" } : {},
      },
    };
  },
});

const TableHeaderWithVertical = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      vertical: {
        default: false,
        parseHTML: (el) => el.getAttribute("data-vertical") === "true",
        renderHTML: (attrs) =>
          attrs.vertical ? { "data-vertical": "true" } : {},
      },
    };
  },
});

const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  selectable: true,
  parseHTML() {
    return [{ tag: "div.page-break" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "page-break" })];
  },
  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ chain }: CommandProps) => {
          return chain()
            .focus()
            .insertContent([{ type: this.name }, { type: "paragraph" }])
            .run();
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => this.editor.commands.insertPageBreak(),
    };
  },
});

const TableCellVertical = Extension.create({
  name: "tableCellVertical",
  addCommands() {
    return {
      toggleCellVertical:
        () =>
        ({ editor }: CommandProps) => {
          const inHeader = editor.isActive("tableHeader");
          const inCell = editor.isActive("tableCell");
          if (!inHeader && !inCell) return false;

          const activeVertical =
            editor.isActive("tableHeader", { vertical: true }) ||
            editor.isActive("tableCell", { vertical: true });

          const nextVertical = !activeVertical;
          if (inHeader)
            return editor.commands.updateAttributes("tableHeader", {
              vertical: nextVertical,
            });
          return editor.commands.updateAttributes("tableCell", {
            vertical: nextVertical,
          });
        },
    };
  },
});

const TextIndent = Extension.create({
  name: "textIndent",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          indent: {
            default: false,
            parseHTML: (el) => el.getAttribute("data-indent") === "true",
            renderHTML: (attrs) =>
              attrs.indent
                ? { "data-indent": "true", style: "text-indent: 2em" }
                : {},
          },
        },
      },
    ];
  },
  addCommands(): Partial<RawCommands> {
    return {
      toggleIndent:
        () =>
        ({
          tr,
          state,
          dispatch,
        }: {
          tr: Transaction;
          state: EditorState;
          dispatch?: Dispatch;
        }) => {
          const { from, to } = state.selection;
          state.doc.nodesBetween(
            from,
            to,
            (node: ProsemirrorNode, pos: number) => {
              if (
                node.type.name === "paragraph" ||
                node.type.name === "heading"
              ) {
                if (dispatch)
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    indent: !node.attrs.indent,
                  });
              }
            },
          );
          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },
});

const DashListItem = Node.create({
  name: "dashListItem",
  content: "paragraph+",
  defining: true,
  parseHTML() {
    return [{ tag: 'li[data-type="dash"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["li", mergeAttributes(HTMLAttributes, { "data-type": "dash" }), 0];
  },
});

const DashList = Node.create({
  name: "dashList",
  group: "block list",
  content: "dashListItem+",
  parseHTML() {
    return [{ tag: 'ul[data-type="dash-list"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "ul",
      mergeAttributes(HTMLAttributes, { "data-type": "dash-list" }),
      0,
    ];
  },
  addCommands() {
    return {
      toggleDashList:
        () =>
        ({ commands, editor }: CommandProps) => {
          if (editor.isActive("dashList")) return commands.lift("dashListItem");
          return commands.wrapInList("dashList");
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        if (!this.editor.isActive("dashList")) return false;
        return this.editor.commands.splitListItem("dashListItem");
      },
      Tab: () => {
        if (!this.editor.isActive("dashList")) return false;
        return this.editor.commands.sinkListItem("dashListItem");
      },
      "Shift-Tab": () => {
        if (!this.editor.isActive("dashList")) return false;
        return this.editor.commands.liftListItem("dashListItem");
      },
    };
  },
});

const Btn = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center justify-center h-7 min-w-7 px-2 rounded-md text-[13px] font-medium transition-all duration-150 select-none ${
      active
        ? "bg-[#D62E1F] text-white shadow-sm shadow-red-200"
        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
    }`}
  >
    {children}
  </button>
);

const Sep = () => <div className="w-px h-5 bg-zinc-200 mx-0.5 self-center" />;

export const EditorWrapper = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Underline,
      TextIndent,
      PageBreak,
      DashListItem,
      DashList,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeaderWithVertical,
      TableCellWithVertical,
      TableCellVertical,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  if (!editor) return null;

  const colors = [
    { label: "Чёрный", value: "#111111" },
    { label: "Красный", value: "#D62E1F" },
    { label: "Серый", value: "#6B7280" },
    { label: "Синий", value: "#1D4ED8" },
  ];

  const isIndented = editor.isActive("paragraph", { indent: true });
  const inTable = editor.isActive("table");
  const cellVertical =
    editor.isActive("tableHeader", { vertical: true }) ||
    editor.isActive("tableCell", { vertical: true });

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2">
          <Btn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Жирный"
          >
            <Bold size={14} />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Курсив"
          >
            <Italic size={14} />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Подчёркнутый"
          >
            <UnderlineIcon size={14} />
          </Btn>

          <Sep />

          <Btn
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
          >
            <span className="text-[12px] font-semibold">16</span>
          </Btn>
          <Btn
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
          >
            <span className="text-[12px] font-semibold">12</span>
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph") && !editor.isActive("heading")}
          >
            <span className="text-[12px] font-semibold">P</span>
          </Btn>

          <Sep />

          <Btn
            onClick={() => editor.commands.toggleIndent()}
            active={isIndented}
            title="Отступ абзаца"
          >
            {isIndented ? (
              <IndentDecrease size={14} />
            ) : (
              <IndentIncrease size={14} />
            )}
          </Btn>

          <Sep />

          <Btn
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
          >
            <AlignLeft size={14} />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
          >
            <AlignCenter size={14} />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
          >
            <AlignRight size={14} />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
          >
            <AlignJustify size={14} />
          </Btn>

          <Sep />

          <Btn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Маркированный список (•)"
          >
            <List size={14} />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Нумерованный список"
          >
            <ListOrdered size={14} />
          </Btn>
          <Btn
            onClick={() => editor.commands.toggleDashList()}
            active={editor.isActive("dashList")}
            title="Список с тире (—)"
          >
            <div className="flex items-center gap-0.5">
              <Minus size={12} />
              <span className="text-[10px] font-mono leading-none">—</span>
            </div>
          </Btn>

          <Sep />

          <Btn
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 4, withHeaderRow: true })
                .run()
            }
            title="Вставить таблицу"
          >
            <TableIcon size={14} />
          </Btn>
          {inTable && (
            <>
              <Btn
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                title="+столбец"
              >
                <div className="flex items-center gap-0.5 text-[10px] font-medium">
                  <Plus size={10} />С
                </div>
              </Btn>
              <Btn
                onClick={() => editor.chain().focus().addRowAfter().run()}
                title="+строка"
              >
                <div className="flex items-center gap-0.5 text-[10px] font-medium">
                  <Plus size={10} />Р
                </div>
              </Btn>
              <Btn
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="−столбец"
              >
                <div className="flex items-center gap-0.5 text-[10px] font-medium">
                  <Minus size={10} />С
                </div>
              </Btn>
              <Btn
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="−строка"
              >
                <div className="flex items-center gap-0.5 text-[10px] font-medium">
                  <Minus size={10} />Р
                </div>
              </Btn>
              <Btn
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="Удалить таблицу"
              >
                <span className="text-[10px]">✕</span>
              </Btn>
              <Btn
                onClick={() => editor.commands.toggleCellVertical()}
                active={cellVertical}
                title="Вертикальный текст в ячейке"
              >
                <span className="text-[10px] font-semibold">V</span>
              </Btn>
            </>
          )}

          <Sep />

          <div className="flex items-center gap-1.5 px-1">
            {colors.map((c) => (
              <button
                key={c.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().setColor(c.value).run();
                }}
                className="w-4 h-4 rounded-full ring-1 ring-black/10 hover:scale-125 transition-transform"
                style={{ backgroundColor: c.value }}
              />
            ))}
            <label className="relative w-4 h-4 cursor-pointer">
              <div className="w-full h-full rounded-full bg-linear-to-br from-red-400 via-yellow-300 to-blue-400 ring-1 ring-black/10 hover:scale-125 transition-transform" />
              <input
                type="color"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                onChange={(e) =>
                  editor.chain().focus().setColor(e.target.value).run()
                }
              />
            </label>
          </div>

          <Sep />

          <Btn
            onClick={() => editor.chain().focus().undo().run()}
            title="Отменить"
          >
            <Undo2 size={14} />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().redo().run()}
            title="Повторить"
          >
            <Redo2 size={14} />
          </Btn>

          <Sep />

          <Btn
            onClick={() => editor.commands.insertPageBreak()}
            title="Разрыв страницы (Cmd/Ctrl+Enter)"
          >
            <span className="text-[11px] font-semibold">↵</span>
          </Btn>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5 min-h-full">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 400px;
          font-size: 12px;
          line-height: 1.4;
          color: #111;
          caret-color: #D62E1F;
        }
        .ProseMirror p {
          margin: 0 0 2px 0;
          text-indent: 0;
        }
        .ProseMirror p[data-indent="true"] {
          text-indent: 2em;
        }
        .ProseMirror h1[data-indent="true"],
        .ProseMirror h2[data-indent="true"] {
          padding-left: 20px;
        }
        .ProseMirror h1 {
          font-size: 16px; font-weight: 700;
          margin: 6px 0 3px 0; text-indent: 0; text-align: center;
        }
        .ProseMirror h2 {
          font-size: 12px; font-weight: 700;
          margin: 5px 0 2px 0; text-indent: 0;
        }
        .ProseMirror ul { list-style: disc; padding-left: 18px; margin: 0 0 2px 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 18px; margin: 0 0 2px 0; }
        .ProseMirror li { margin-bottom: 1px; }
        .ProseMirror li p { margin: 0; text-indent: 0; }
        /* Dash list */
        .ProseMirror ul[data-type="dash-list"] { list-style: none; padding-left: 0; margin: 0 0 2px 0; }
        .ProseMirror ul[data-type="dash-list"] > li[data-type="dash"] { display: flex; gap: 6px; margin-bottom: 1px; }
        .ProseMirror ul[data-type="dash-list"] > li[data-type="dash"]::before { content: "—"; flex-shrink: 0; }
        .ProseMirror ul[data-type="dash-list"] > li[data-type="dash"] > p { margin: 0; text-indent: 0; flex: 1; }
        .ProseMirror ::selection { background: #fee2e2; }
        /* Tables */
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 6px 0; font-size: 11px; }
        .ProseMirror table td, .ProseMirror table th {
          border: 1px solid #111; padding: 5px 7px;
          min-width: 40px; min-height: 22px; vertical-align: top;
        }
        .ProseMirror table th { font-weight: bold; text-align: center; background: #f9f9f9; }
        .ProseMirror table td p, .ProseMirror table th p { margin: 0; text-indent: 0; }

        /* Vertical cells — writing-mode поворачивает текст как в image 2 */
        .ProseMirror table td[data-vertical="true"],
        .ProseMirror table th[data-vertical="true"] {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          text-align: center;
          vertical-align: middle;
          min-height: 80px;
          padding: 8px 4px;
        }
        /* Параграф внутри вертикальной ячейки не должен мешать */
        .ProseMirror table td[data-vertical="true"] p,
        .ProseMirror table th[data-vertical="true"] p {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          margin: 0;
          text-indent: 0;
        }
        .ProseMirror .selectedCell:after {
          background: rgba(214,46,31,0.07); content: "";
          position: absolute; inset: 0; pointer-events: none; z-index: 2;
        }
        .ProseMirror .tableWrapper { overflow-x: auto; }

        /* Page break marker */
        .ProseMirror div.page-break {
          position: relative;
          margin: 10px 0;
          border-top: 1px dashed rgba(214,46,31,0.6);
        }
        .ProseMirror div.page-break::after {
          content: "Разрыв страницы";
          position: absolute;
          top: -8px;
          right: 0;
          padding: 0 6px;
          font-size: 10px;
          background: white;
          color: rgba(214,46,31,0.85);
        }
      `}</style>
    </div>
  );
};
