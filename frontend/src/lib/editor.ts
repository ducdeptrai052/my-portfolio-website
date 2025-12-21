import { generateHTML, generateText, type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { createLowlight } from "lowlight";
import common from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import markdown from "highlight.js/lib/languages/markdown";

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

const baseExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
    codeBlock: false,
    link: false,
    underline: false,
  }),
  Underline,
  TextStyle,
  Color,
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
  CodeBlockLowlight.configure({
    lowlight,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
];

export const getEditorExtensions = (placeholder?: string) => [
  ...baseExtensions,
  Placeholder.configure({ placeholder: placeholder || "Write your content..." }),
];

export const parseJsonDoc = (value?: string): JSONContent | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && parsed.type === "doc") return parsed as JSONContent;
  } catch {
    return null;
  }
  return null;
};

export const getHtmlFromJson = (doc: JSONContent): string => {
  return generateHTML(doc, baseExtensions);
};

export const getTextFromJson = (doc: JSONContent): string => {
  return generateText(doc, baseExtensions);
};

export const ARTICLE_PROSE_CLASSES = [
  "article-prose",
  "prose",
  "prose-lg",
  "prose-neutral",
  "dark:prose-invert",
  "max-w-none",
  "prose-headings:font-semibold",
  "dark:prose-headings:text-white",
  "dark:prose-p:text-white/90",
  "dark:prose-li:text-white/85",
  "dark:prose-strong:text-white",
  "dark:prose-blockquote:text-white/80",
  "prose-h1:text-3xl",
  "md:prose-h1:text-4xl",
  "prose-h1:font-bold",
  "prose-h1:mb-6",
  "prose-h2:text-2xl",
  "prose-h2:mt-8",
  "prose-h2:mb-3",
  "prose-h3:text-xl",
  "prose-h3:mt-6",
  "prose-h3:mb-2",
  "prose-h4:text-lg",
  "prose-h4:mt-5",
  "prose-h4:mb-2",
  "prose-p:leading-[1.7]",
  "prose-p:mb-5",
  "prose-p:text-base",
  "prose-lead:text-base",
  "prose-ul:my-6",
  "prose-ol:my-6",
  "prose-ul:list-disc",
  "prose-ol:list-decimal",
  "prose-ul:list-outside",
  "prose-ol:list-outside",
  "prose-ul:pl-6",
  "prose-ol:pl-6",
  "prose-li:leading-relaxed",
  "prose-li:my-1",
  "prose-li:marker:text-foreground",
  "prose-blockquote:my-6",
  "prose-blockquote:border-l-4",
  "prose-blockquote:border-muted-foreground/40",
  "prose-blockquote:pl-4",
  "prose-blockquote:text-muted-foreground",
  "prose-a:text-primary",
  "prose-a:font-medium",
  "prose-a:underline",
  "prose-a:decoration-primary/50",
  "prose-a:underline-offset-4",
  "hover:prose-a:decoration-primary",
  "prose-code:text-sm",
  "prose-code:font-mono",
  "prose-code:bg-muted",
  "prose-code:px-1.5",
  "prose-code:py-0.5",
  "prose-code:rounded",
  "prose-code:before:content-none",
  "prose-code:after:content-none",
  "prose-pre:text-sm",
  "prose-pre:font-mono",
  "prose-pre:bg-[#2d2d2d]",
  "prose-pre:text-[#ccc]",
  "prose-pre:leading-[1.6]",
  "prose-pre:code:bg-transparent",
  "prose-pre:code:p-0",
  "prose-pre:code:rounded-none",
  "prose-pre:code:text-inherit",
  "prose-pre:rounded-lg",
  "prose-pre:px-4",
  "prose-pre:py-3",
  "prose-pre:overflow-x-auto",
  "prose-img:mx-auto",
  "prose-img:my-8",
  "prose-img:rounded-xl",
  "prose-img:shadow-lg",
  "prose-img:max-w-full",
  "prose-img:max-w-[760px]",
  "prose-iframe:mx-auto",
  "prose-iframe:my-8",
  "prose-iframe:rounded-xl",
  "prose-iframe:shadow-lg",
  "prose-iframe:w-full",
  "prose-iframe:h-auto",
  "prose-iframe:aspect-video",
  "prose-iframe:max-w-[800px]",
].join(" ");

export const extractPostFieldsFromDoc = (doc: JSONContent) => {
  const content = Array.isArray(doc?.content) ? doc.content : [];
  let firstIndex = -1;
  let secondIndex = -1;

  content.forEach((node, index) => {
    const text = generateText({ type: "doc", content: [node] }, baseExtensions).trim();
    if (!text) return;
    if (firstIndex === -1) {
      firstIndex = index;
    } else if (secondIndex === -1) {
      secondIndex = index;
    }
  });

  const titleNode = firstIndex >= 0 ? content[firstIndex] : null;
  const excerptNode = secondIndex >= 0 ? content[secondIndex] : null;
  const title = titleNode
    ? generateText({ type: "doc", content: [titleNode] }, baseExtensions).trim()
    : "";
  const excerpt = excerptNode
    ? generateText({ type: "doc", content: [excerptNode] }, baseExtensions).trim()
    : "";
  const bodyContent = content.filter((_, idx) => idx !== firstIndex && idx !== secondIndex);

  return {
    title,
    excerpt,
    body: { type: "doc", content: bodyContent },
  };
};

export const composeDocFromFields = (title?: string, excerpt?: string, bodyDoc?: JSONContent) => {
  const nodes: JSONContent[] = [];
  if (title) {
    nodes.push({ type: "paragraph", content: [{ type: "text", text: title }] });
  }
  if (excerpt) {
    nodes.push({ type: "paragraph", content: [{ type: "text", text: excerpt }] });
  }
  const bodyContent = Array.isArray(bodyDoc?.content) ? bodyDoc.content : [];
  return { type: "doc", content: [...nodes, ...bodyContent] } as JSONContent;
};
