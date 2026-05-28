import React from "react";

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 p-4 bg-card border border-border/50 rounded-2xl rounded-tl-sm shadow-sm w-fit max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-2 h-2 rounded-full bg-primary/40 animate-[bounce_1s_infinite_0ms]" />
      <div className="w-2 h-2 rounded-full bg-primary/60 animate-[bounce_1s_infinite_200ms]" />
      <div className="w-2 h-2 rounded-full bg-primary/80 animate-[bounce_1s_infinite_400ms]" />
    </div>
  );
}
