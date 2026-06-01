import React, { useState, useRef, useEffect } from "react";
import { useSendMessage } from "@workspace/api-client-react";
import { ChatMessageBubble } from "@/components/ui/chat/message";
import { TypingIndicator } from "@/components/ui/chat/typing";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { type Chat, type ChatMessage } from "@/hooks/use-chats";

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hello! I'm Dr. DentAI 🦷 Tell me your dental problem and I'll help you! You can speak in Hindi or English.",
};

const SUGGESTIONS = [
  "I have a toothache",
  "My gums are bleeding",
  "I have tooth sensitivity",
  "Wisdom tooth pain",
  "Bad breath problem",
  "How to treat a cavity?",
];

interface ChatPageProps {
  activeChatId: string | null;
  activeChat: Chat | null;
  onUpdateChat: (id: string, updates: Partial<Pick<Chat, "title" | "messages">>) => void;
  onNewChat: () => void;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
}

export default function ChatPage({
  activeChatId,
  activeChat,
  onUpdateChat,
  onNewChat,
}: ChatPageProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const sendMessage = useSendMessage();

  const messages: ChatMessage[] = activeChat?.messages ?? [];
  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  const handleSubmit = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sendMessage.isPending || !activeChatId) return;

    const userMsg: ChatMessage = { role: "user", content };
    const updatedMessages = [...messages, userMsg];

    const isFirst = messages.length === 0;
    const newTitle = isFirst
      ? content.slice(0, 40) + (content.length > 40 ? "…" : "")
      : activeChat?.title ?? "New question";

    onUpdateChat(activeChatId, {
      messages: updatedMessages,
      title: newTitle,
    });

    if (text === undefined) setInput("");

    sendMessage.mutate(
      { data: { messages: updatedMessages } },
      {
        onSuccess: (response) => {
          const assistantMsg: ChatMessage = {
            role: "assistant",
            content: response.message,
          };
          onUpdateChat(activeChatId, {
            messages: [...updatedMessages, assistantMsg],
          });
        },
        onError: () => {
          toast({
            title: "Connection Error",
            description: "Unable to connect to Dr. DentAI. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // No active chat selected
  if (!activeChatId) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 text-center">
        <img src="/dent-ai-logo.png" alt="Dr. DentAI" className="w-20 h-20 rounded-2xl object-cover mb-5 shadow-lg" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          What's your dental concern? 🦷
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-md">
          I'm Dr. DentAI — your AI dental expert. Describe your problem and I'll help!
        </p>
        <button
          onClick={onNewChat}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-md"
        >
          Start New Chat
        </button>
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                onNewChat();
                setTimeout(() => handleSubmit(s), 80);
              }}
              className="text-xs px-3 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Empty chat (just started) — centered input
  if (!hasMessages) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
          <img src="/dent-ai-logo.png" alt="Dr. DentAI" className="w-16 h-16 rounded-2xl object-cover mb-5 shadow-lg" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 text-center">
            What's your dental concern? 🦷
          </h1>
          <p className="text-muted-foreground text-sm mb-8 text-center max-w-md">
            Describe your dental problem — I understand Hindi &amp; English!
          </p>

          <div className="w-full max-w-2xl mx-auto">
            <div className="relative flex items-end bg-card border border-input focus-within:ring-2 focus-within:ring-ring rounded-2xl shadow-md px-3 py-2 gap-2 transition-all">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your dental problem..."
                className="min-h-[48px] max-h-[160px] flex-1 resize-none border-0 shadow-none focus-visible:ring-0 px-2 py-2.5 text-base bg-transparent overflow-y-auto"
                rows={1}
              />
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!input.trim() || sendMessage.isPending}
                className={cn(
                  "shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all self-end mb-0.5",
                  input.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70 mt-2 text-center">
              <AlertCircle className="w-3 h-3" />
              This is AI advice — not a substitute for a real dentist. Please consult a doctor.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-xl">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSubmit(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active chat with messages
  return (
    <div className="flex flex-col h-full">
      <header className="hidden md:flex items-center gap-3 px-5 py-3.5 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <img src="/dent-ai-logo.png" alt="Dr. DentAI" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
        <div>
          <h2 className="font-semibold text-sm text-foreground leading-none">Dr. DentAI</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Online
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
          <ChatMessageBubble
            role={INITIAL_ASSISTANT_MESSAGE.role}
            content={INITIAL_ASSISTANT_MESSAGE.content}
          />
          {messages.map((msg, index) => (
            <ChatMessageBubble key={index} role={msg.role} content={msg.content} />
          ))}
          {sendMessage.isPending && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-border/40 bg-background px-4 pt-3 pb-4 md:pb-5">
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative flex items-end bg-card border border-input focus-within:ring-2 focus-within:ring-ring rounded-2xl shadow-md px-3 py-2 gap-2 transition-all">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your dental problem..."
              className="min-h-[48px] max-h-[160px] flex-1 resize-none border-0 shadow-none focus-visible:ring-0 px-2 py-2.5 text-base bg-transparent overflow-y-auto"
              rows={1}
            />
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || sendMessage.isPending || !activeChatId}
              className={cn(
                "shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all self-end mb-0.5",
                input.trim() && activeChatId
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70 mt-2 text-center">
            <AlertCircle className="w-3 h-3" />
            This is AI advice — not a substitute for a real dentist. Please consult a doctor.
          </p>
        </div>
      </footer>
    </div>
  );
}
