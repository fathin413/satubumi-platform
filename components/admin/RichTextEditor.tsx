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
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] px-4 py-3 outline-none text-emerald-950 font-medium leading-relaxed prose prose-emerald max-w-none",
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
    `p-2 rounded-lg transition-colors ${
      active
        ? "bg-emerald-100 text-emerald-800"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`;

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-2 border-b border-emerald-100 bg-white">
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

        <div className="w-px h-5 bg-slate-200 mx-1" />

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

        <div className="w-px h-5 bg-slate-200 mx-1" />

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
        <p className="px-4 pb-3 text-sm text-emerald-900/30 font-medium -mt-2 pointer-events-none">
          {placeholder}
        </p>
      )}
    </div>
  );
}