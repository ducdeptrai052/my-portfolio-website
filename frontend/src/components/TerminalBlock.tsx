import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TerminalBlockProps {
  className?: string;
}

const terminalLines = [
  { prompt: "~", command: "whoami", output: "john_doe" },
  { prompt: "~", command: "cat skills.txt", output: "TypeScript, React, Node.js, Go, PostgreSQL..." },
  { prompt: "~", command: "echo $PASSION", output: "Building products that matter" },
  { prompt: "~", command: "uptime", output: "10+ years in software development" },
];

export function TerminalBlock({ className }: TerminalBlockProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      if (visibleLines < terminalLines.length) {
        const currentLine = terminalLines[visibleLines];
        if (currentChar < currentLine.command.length) {
          setCurrentChar((prev) => prev + 1);
        } else {
          setTimeout(() => {
            setVisibleLines((prev) => prev + 1);
            setCurrentChar(0);
          }, 500);
        }
      }
    }, 50);

    return () => clearInterval(timer);
  }, [visibleLines, currentChar]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden shadow-2xl border border-border/50",
        className
      )}
    >
      {/* Terminal Header */}
      <div className="terminal-bg px-4 py-3 flex items-center gap-2 border-b border-border/20">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground ml-2 font-mono">
          terminal — bash
        </span>
      </div>

      {/* Terminal Body */}
      <div className="terminal-bg p-4 font-mono text-sm min-h-[200px]">
        {terminalLines.slice(0, visibleLines).map((line, index) => (
          <div key={index} className="mb-2">
            <div className="flex gap-2">
              <span className="text-blue-400">{line.prompt}</span>
              <span className="text-muted-foreground">$</span>
              <span className="terminal-text">{line.command}</span>
            </div>
            <div className="text-muted-foreground/80 ml-4">{line.output}</div>
          </div>
        ))}

        {visibleLines < terminalLines.length && (
          <div className="flex gap-2">
            <span className="text-blue-400">{terminalLines[visibleLines].prompt}</span>
            <span className="text-muted-foreground">$</span>
            <span className="terminal-text">
              {terminalLines[visibleLines].command.slice(0, currentChar)}
            </span>
            <span
              className={cn(
                "w-2 h-5 bg-green-400",
                showCursor ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
        )}

        {visibleLines >= terminalLines.length && (
          <div className="flex gap-2">
            <span className="text-blue-400">~</span>
            <span className="text-muted-foreground">$</span>
            <span
              className={cn(
                "w-2 h-5 bg-green-400",
                showCursor ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
