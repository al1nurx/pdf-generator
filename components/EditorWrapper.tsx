"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Extension } from "@tiptap/core";
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
  Undo2,
  Redo2,
  IndentIncrease,
  IndentDecrease,
} from "lucide-react";

type Dispatch = (tr: Transaction) => void;

const TextIndent = Extension.create({
  name: "textIndent",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          indent: {
            default: false,
            parseHTML: (el) => el.getAttribute("data-indent") === "true",
            renderHTML: (attrs) =>
              attrs.indent
                ? {
                    "data-indent": "true",
                    style: "text-indent: 2em",
                  }
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
              if (node.type.name === "paragraph") {
                const current = node.attrs.indent;

                if (dispatch) {
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    indent: !current,
                  });
                }
              }
            },
          );

          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },
});

// ── Toolbar button ────────────────────────────────────────────────────────────
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
    className={`
      flex items-center justify-center h-7 min-w-7 px-2 rounded-md
      text-[13px] font-medium transition-all duration-150 select-none
      ${
        active
          ? "bg-[#D62E1F] text-white shadow-sm shadow-red-200"
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
      }
    `}
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
          >
            <List size={14} />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered size={14} />
          </Btn>

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
                className="w-4.5 h-4.5 rounded-full ring-1 ring-black/10 hover:scale-125 transition-transform"
                style={{ backgroundColor: c.value }}
              />
            ))}
            <label className="relative w-4.5 h-4.5 cursor-pointer">
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
          font-size: 13px;
          line-height: 1.7;
          color: #111;
          caret-color: #D62E1F;
        }
        .ProseMirror p[data-indent="true"] {
          text-indent: 2em;
        }
        .ProseMirror p { margin: 0 0 10px 0; }
        .ProseMirror h1 { font-size: 16px; font-weight: 700; margin: 0 0 12px 0; }
        .ProseMirror h2 { font-size: 12px; font-weight: 700; margin: 0 0 10px 0; }
        .ProseMirror ul { list-style: disc; padding-left: 22px; margin-bottom: 10px; }
        .ProseMirror ol { list-style: decimal; padding-left: 22px; margin-bottom: 10px; }
        .ProseMirror ::selection { background: #fee2e2; }
      `}</style>
    </div>
  );
};
