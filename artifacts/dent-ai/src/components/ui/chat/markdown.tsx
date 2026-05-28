import React from "react";
import { ChatMessageRole } from "@workspace/api-zod";

interface SimpleMarkdownProps {
  content: string;
}

export function SimpleMarkdown({ content }: SimpleMarkdownProps) {
  // A simple markdown parser that handles paragraphs, bold, and basic bullet points
  const lines = content.split("\n");
  const elements = [];
  
  let currentList: React.ReactNode[] = [];
  
  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-2 space-y-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      const text = trimmedLine.substring(2);
      currentList.push(
        <li key={`li-${i}`}>{parseInline(text)}</li>
      );
    } else {
      flushList();
      if (trimmedLine === "") {
        // empty line, maybe just space
      } else {
        elements.push(
          <p key={`p-${i}`} className="mb-2 last:mb-0 leading-relaxed">
            {parseInline(trimmedLine)}
          </p>
        );
      }
    }
  }
  
  flushList();

  return <div className="text-sm md:text-base">{elements}</div>;
}

function parseInline(text: string) {
  // parse **bold** and *italic*
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    } else if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
