import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { createLowlight } from "lowlight";
import common from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import markdown from "highlight.js/lib/languages/markdown";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Film,
  Code2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadMedia } from "@/lib/uploads";
import { cn } from "@/lib/utils";

const lowlight = createLowlight();
lowlight.register("js", common);
lowlight.register("javascript", common);
lowlight.register("ts", ts);
lowlight.register("typescript", ts);
lowlight.register("json", json);
lowlight.register("bash", bash);
lowlight.register("shell", bash);
lowlight.register("html", xml);
lowlight.register("xml", xml);
lowlight.register("css", css);
lowlight.register("md", markdown);
lowlight.register("markdown", markdown);
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Write your content..." }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [color, setColor] = useState("#111111");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const youtubeInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
      }),
      Typography,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const clearLink = () => editor.chain().focus().unsetLink().run();

  const addImageUrl = () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const embedYoutube = (url: string) => {
    if (!url) return;
    editor.commands.setYoutubeVideo({
      src: url,
      width: 640,
      height: 360,
    });
    setYoutubeUrl("");
    setShowYoutubeInput(false);
  };

  const handleUpload = async (file?: File | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadMedia(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      // ignore, toast handled at caller if needed
    } finally {
      setIsUploading(false);
    }
  };

  const ToggleButton = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      className={cn(
        "h-9 w-9 flex items-center justify-center rounded-lg text-sm font-semibold text-[#444] transition",
        active ? "bg-black text-white" : "hover:bg-[#f3f4f6]"
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );

  const bubbleContent = (
    <div className="flex items-center gap-2 px-2 py-2 bg-white/95 dark:bg-card border border-border rounded-xl shadow-xl backdrop-blur-md">
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <Minus className="h-4 w-4 rotate-90" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code block"
      >
        <Code2 className="h-4 w-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </ToggleButton>
      <div className="h-6 w-px bg-border mx-1" />
      <ToggleButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align center"
      >
        <AlignCenter className="h-4 w-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align right"
      >
        <AlignRight className="h-4 w-4" />
      </ToggleButton>
      <div className="h-6 w-px bg-border mx-1" />
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToggleButton>
      <div className="h-6 w-px bg-border mx-1" />
      <ToggleButton
        onClick={addLink}
        active={editor.isActive("link")}
        title="Insert link"
      >
        <LinkIcon className="h-4 w-4" />
      </ToggleButton>
      <ToggleButton onClick={clearLink} title="Clear link">
        <LinkIcon className="h-4 w-4 opacity-60" />
      </ToggleButton>
      <ToggleButton onClick={addImageUrl} title="Image from URL">
        <ImageIcon className="h-4 w-4" />
      </ToggleButton>
      <ToggleButton
        onClick={() => {
          setShowYoutubeInput((prev) => !prev);
          setTimeout(() => youtubeInputRef.current?.focus(), 10);
        }}
        title="YouTube embed"
      >
        <Film className="h-4 w-4" />
      </ToggleButton>
      {showYoutubeInput && (
        <input
          ref={youtubeInputRef}
          type="text"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              embedYoutube(youtubeUrl);
            }
          }}
          onBlur={() => {
            if (youtubeUrl.trim()) {
              embedYoutube(youtubeUrl.trim());
            } else {
              setShowYoutubeInput(false);
            }
          }}
          placeholder="Paste YouTube URL"
          className="h-9 w-48 rounded-lg border border-border bg-background px-3 text-sm"
        />
      )}
      <div className="h-6 w-px bg-border mx-1" />
      <input
        type="color"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          editor.chain().focus().setColor(e.target.value).run();
        }}
        className="h-8 w-8 rounded-md border border-border bg-transparent cursor-pointer"
        title="Text color"
      />
      <Input
        type="file"
        accept="image/*"
        className="h-9 w-40"
        title="Upload image"
        onChange={(e) => handleUpload(e.target.files?.[0] || null)}
        disabled={isUploading}
      />
    </div>
  );

  return (
    <div className="relative">
      {editor && (
        <BubbleMenu editor={editor} shouldShow={({ editor }) => editor.isFocused}>
          {bubbleContent}
        </BubbleMenu>
      )}
      <div className={cn("prose prose-sm dark:prose-invert max-w-none p-3 min-h-[300px] border rounded-lg", isUploading ? "opacity-70" : "")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
