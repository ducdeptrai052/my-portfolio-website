import "@/styles/highlight-theme.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Film,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  ChevronDown,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { uploadMedia } from "@/lib/uploads";
import { cn } from "@/lib/utils";
import { ARTICLE_PROSE_CLASSES, getEditorExtensions, parseJsonDoc } from "@/lib/editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

const YOUTUBE_REGEX = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11}))/i;
const IMAGE_REGEX = /(https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp|avif|svg)(?:\?[^\s]*)?)/i;

function normalizeYoutubeUrl(url: string): string | null {
  const match = url.match(YOUTUBE_REGEX);
  const id = match?.[2];
  if (!id) return null;
  return `https://www.youtube.com/watch?v=${id}`;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content...",
  onImageUpload,
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [color, setColor] = useState("#1f2937");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const youtubeInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastValueRef = useRef<string>("");

  const parsedValue = useMemo(() => {
    const parsed = parseJsonDoc(value);
    if (parsed) return parsed;
    return value || "";
  }, [value]);

  const editor = useEditor({
    extensions: getEditorExtensions(placeholder),
    content: parsedValue,
    onUpdate: ({ editor }) => {
      const nextValue = JSON.stringify(editor.getJSON());
      lastValueRef.current = nextValue;
      onChange(nextValue);
    },
    editorProps: {
      handlePaste: (_, event) => {
        const text = event.clipboardData?.getData("text/plain")?.trim();
        if (!text) return false;
        const normalized = normalizeYoutubeUrl(text);
        const imageMatch = text.match(IMAGE_REGEX)?.[1];
        if (normalized) {
          event.preventDefault();
          setTimeout(() => {
            editor.commands.setYoutubeVideo({ src: normalized, width: 640, height: 360 });
          }, 0);
          return true;
        }
        if (imageMatch) {
          event.preventDefault();
          setTimeout(() => {
            editor.commands.setImage({ src: imageMatch });
          }, 0);
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (!value) {
      if (lastValueRef.current === "") return;
      editor.commands.clearContent(true);
      lastValueRef.current = "";
      return;
    }
    if (value === lastValueRef.current) return;
    const parsed = parseJsonDoc(value);
    if (parsed) {
      editor.commands.setContent(parsed, { emitUpdate: false });
      lastValueRef.current = value;
    } else if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
      lastValueRef.current = value;
    }
  }, [editor, value]);

  if (!editor) return null;

  const focusChain = () => editor.chain().focus(undefined, { scrollIntoView: false });

  const applyLink = (url: string) => {
    if (!url) return;
    focusChain().extendMarkRange("link").setLink({ href: url }).run();
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const clearLink = () => focusChain().unsetLink().run();

  const applyImageUrl = (url: string) => {
    if (!url) return;
    focusChain().setImage({ src: url }).run();
    setImageUrl("");
    setShowImageInput(false);
  };

  const embedYoutube = (url: string) => {
    if (!url) return;
    const normalized = normalizeYoutubeUrl(url) || url;
    focusChain().setYoutubeVideo({
      src: normalized,
      width: 640,
      height: 360,
    }).run();
    setYoutubeUrl("");
    setShowYoutubeInput(false);
  };

  const handleUpload = async (file?: File | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = onImageUpload ? await onImageUpload(file) : await uploadMedia(file);
      focusChain().setImage({ src: url }).run();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  const ToggleButton = ({
    onClick,
    active,
    children,
    title,
    disabled,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      className={cn(
        "h-8 w-8 flex items-center justify-center rounded-full text-sm font-semibold transition",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        disabled && "opacity-40 pointer-events-none"
      )}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );

  const headingLabel = editor.isActive("heading", { level: 1 })
    ? "H1"
    : editor.isActive("heading", { level: 2 })
    ? "H2"
    : editor.isActive("heading", { level: 3 })
    ? "H3"
    : editor.isActive("heading", { level: 4 })
    ? "H4"
    : "P";

  return (
    <div className="relative space-y-3">
      <div className="rounded-2xl border border-border bg-background shadow-sm">
        <div className="sticky top-16 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-background/95 px-3 py-2 backdrop-blur">
          <ToggleButton
            onClick={() => focusChain().undo().run()}
            title="Undo"
            disabled={!editor.can().undo()}
          >
            <Undo2 className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton
            onClick={() => focusChain().redo().run()}
            title="Redo"
            disabled={!editor.can().redo()}
          >
            <Redo2 className="h-4 w-4" />
          </ToggleButton>
          <span className="h-5 w-px bg-border/70 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "h-8 px-3 rounded-full text-sm font-semibold inline-flex items-center gap-2",
                  headingLabel === "P"
                    ? "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                    : "bg-primary/15 text-primary"
                )}
              >
                {headingLabel}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => focusChain().setParagraph().run()}>
                Paragraph
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => focusChain().toggleHeading({ level: 1 }).run()}>
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => focusChain().toggleHeading({ level: 2 }).run()}>
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => focusChain().toggleHeading({ level: 3 }).run()}>
                Heading 3
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => focusChain().toggleHeading({ level: 4 }).run()}>
                Heading 4
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="h-5 w-px bg-border/70 mx-1" />

          <ToggleButton
            onClick={() => focusChain().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton
            onClick={() => focusChain().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton
            onClick={() => focusChain().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
          >
            <Minus className="h-4 w-4 rotate-90" />
          </ToggleButton>
          <ToggleButton
            onClick={() => focusChain().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton
            onClick={() => focusChain().toggleCode().run()}
            active={editor.isActive("code")}
            title="Inline code"
          >
            <Code className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton
            onClick={() => focusChain().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code block"
          >
            <Code2 className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton
            onClick={() => focusChain().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToggleButton>

          <span className="h-5 w-px bg-border/70 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-8 px-2 rounded-full text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/60 inline-flex items-center gap-1"
              >
                <List className="h-4 w-4" />
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => focusChain().toggleBulletList().run()}>
                <List className="h-4 w-4 mr-2" />
                Bullet list
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => focusChain().toggleOrderedList().run()}>
                <ListOrdered className="h-4 w-4 mr-2" />
                Numbered list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="h-5 w-px bg-border/70 mx-1" />

          <ToggleButton
            onClick={() => focusChain().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton
            onClick={() => focusChain().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton
            onClick={() => focusChain().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton
            onClick={() => focusChain().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToggleButton>

          <span className="h-5 w-px bg-border/70 mx-1" />

          <ToggleButton
            onClick={() => setShowLinkInput((prev) => !prev)}
            active={editor.isActive("link")}
            title="Insert link"
          >
            <LinkIcon className="h-4 w-4" />
          </ToggleButton>
          <ToggleButton onClick={clearLink} title="Clear link">
            <LinkIcon className="h-4 w-4 opacity-60" />
          </ToggleButton>

          <span className="h-5 w-px bg-border mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-8 px-3 rounded-full text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/60 inline-flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Add
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setShowImageInput(true)}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Image URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload image
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setShowYoutubeInput(true);
                  setTimeout(() => youtubeInputRef.current?.focus(), 10);
                }}
              >
                <Film className="h-4 w-4 mr-2" />
                YouTube embed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              focusChain().setColor(e.target.value).run();
            }}
            className="h-8 w-8 rounded-full border border-border bg-transparent cursor-pointer"
            title="Text color"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0] || null)}
            disabled={isUploading}
          />
        </div>

        {(showLinkInput || showImageInput || showYoutubeInput) && (
          <div className="border-b border-border bg-muted/20 px-3 py-2 flex flex-wrap gap-2">
            {showLinkInput && (
              <Input
                ref={linkInputRef}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyLink(linkUrl.trim());
                  if (e.key === "Escape") setShowLinkInput(false);
                }}
                onBlur={() => setShowLinkInput(false)}
                placeholder="Paste link"
                className="h-9 w-64"
              />
            )}
            {showImageInput && (
              <Input
                ref={imageInputRef}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyImageUrl(imageUrl.trim());
                  if (e.key === "Escape") setShowImageInput(false);
                }}
                onBlur={() => setShowImageInput(false)}
                placeholder="Paste image URL"
                className="h-9 w-64"
              />
            )}
            {showYoutubeInput && (
              <Input
                ref={youtubeInputRef}
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") embedYoutube(youtubeUrl.trim());
                  if (e.key === "Escape") setShowYoutubeInput(false);
                }}
                onBlur={() => setShowYoutubeInput(false)}
                placeholder="Paste YouTube URL"
                className="h-9 w-72"
              />
            )}
          </div>
        )}

        <div className="px-5 py-6">
          <div className={cn("tiptap-editor min-h-[360px]", ARTICLE_PROSE_CLASSES)}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
