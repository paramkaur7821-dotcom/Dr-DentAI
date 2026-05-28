import React from "react";
import { ChatMessageRole } from "@workspace/api-zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SimpleMarkdown } from "./markdown";
import { User, Stethoscope } from "lucide-react";

interface ChatMessageProps {
  role: ChatMessageRole;
  content: string;
}

export function ChatMessageBubble({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 md:gap-4 group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-background shadow-sm shrink-0">
          <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
            <Stethoscope className="w-5 h-5" />
          </div>
        </Avatar>
      )}

      <div
        className={cn(
          "relative flex flex-col gap-1 px-4 py-3 max-w-[85%] md:max-w-[75%] animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
            : "bg-card border border-border/50 text-card-foreground rounded-2xl rounded-tl-sm"
        )}
      >
        <SimpleMarkdown content={content} />
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 md:w-10 md:h-10 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
