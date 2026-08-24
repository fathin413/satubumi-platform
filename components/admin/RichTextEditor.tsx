"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      // Pastikan fitur Heading level 1, 2, dan 3 aktif di sistem Tiptap
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // Ini kuncinya! Kita menanamkan ukuran H1, H2, H3 persis seperti halaman depan
        class:
          "min-h-[300px] px-5 py-4 outline-none text-stone-800 font-medium leading-[1.85] max-w-none " +
          "[&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-emerald-950 [&_h1]:mb-5 [&_h1]:mt-8 " +
          "[&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-emerald-950 [&_h2]:mb-5 [&_h2]:mt-8 " +
          "[&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-emerald-950 [&_h3]:mb-4 [&_h3]:mt-6 " +
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 " +
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 " +
          "[&_p]:mb-4 [&_p]:text-justify",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync jika initial value berubah (halaman edit)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-2.5 rounded-xl transition-all duration-200 ${
      active
        ? "bg-emerald-100 text-emerald-800 shadow-sm"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-400 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2.5 border-b border-slate-100 bg-slate-50/80">
        
        {/* === TOMBOL UKURAN TEKS (HEADING) === */}
        <button
          type="button"
          className={btn(editor.isActive("heading", { level: 1 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1 (Sangat Besar)"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2 (Besar)"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("heading", { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3 (Sedang)"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1.5" />

        {/* === TOMBOL GAYA TEKS === */}
        <button
          type="button"
          className={btn(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("underline"))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1.5" />

        {/* === TOMBOL DAFTAR (LIST) === */}
        <button
          type="button"
          className={btn(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={btn(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-300 mx-1.5" />

        {/* === TOMBOL UNDO / REDO === */}
        <button
          type="button"
          className={btn(false)}
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={btn(false)}
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      <EditorContent editor={editor} />
      {!value && placeholder && (
        <p className="px-5 pb-4 text-[15px] text-slate-400 font-medium -mt-2 pointer-events-none">
          {placeholder}
        </p>
      )}
    </div>
  );
}