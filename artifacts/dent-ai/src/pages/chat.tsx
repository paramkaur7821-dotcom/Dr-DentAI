import React, { useState, useRef, useEffect } from "react";
import { useSendMessage } from "@workspace/api-client-react";
import { ChatMessageBubble } from "@/components/ui/chat/message";
import { TypingIndicator } from "@/components/ui/chat/typing";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowUp, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { type Chat, type ChatMessage } from "@/hooks/use-chats";

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hello! I'm Dr. DentAI 🦷 Tell me your dental problem and I'll help you! You can also **upload a photo** of your teeth and I'll analyze it. You can speak in Hindi or English.",
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
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const sendMessage = useSendMessage();

  const messages: ChatMessage[] = activeChat?.messages ?? [];
  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please use an image under 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = (text?: string) => {
    const content = (text ?? input).trim();
    if ((!content && !pendingImage) || sendMessage.isPending || !activeChatId) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: content || "Please analyze this dental image.",
      ...(pendingImage ? { image: pendingImage } : {}),
    };
    const updatedMessages = [...messages, userMsg];

    const isFirst = messages.length === 0;
    const newTitle = isFirst
      ? (content || "Photo analysis").slice(0, 40) + ((content || "Photo analysis").length > 40 ? "…" : "")
      : activeChat?.title ?? "New question";

    onUpdateChat(activeChatId, { messages: updatedMessages, title: newTitle });

    const imageToSend = pendingImage;
    if (text === undefined) setInput("");
    setPendingImage(null);

    // Strip image data from history before sending — only top-level image field carries the current photo
    const messagesForApi = updatedMessages.map(({ image: _img, ...rest }) => rest);
    sendMessage.mutate(
      { data: { messages: messagesForApi, ...(imageToSend ? { image: imageToSend } : {}) } },
      {
        onSuccess: (response) => {
          const assistantMsg: ChatMessage = { role: "assistant", content: response.message };
          onUpdateChat(activeChatId, { messages: [...updatedMessages, assistantMsg] });
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

  const canSend = (input.trim().length > 0 || !!pendingImage) && !sendMessage.isPending && !!activeChatId;

  // Shared input bar JSX (not a component — avoids remount on re-render)
  const inputBar = (
    <div className="w-full max-w-3xl mx-auto">
      {/* Image preview */}
      {pendingImage && (
        <div className="mb-2 relative inline-block">
          <img
            src={pendingImage}
            alt="Pending upload"
            className="h-24 w-24 rounded-xl object-cover border-2 border-primary/40 shadow"
          />
          <button
            onClick={() => setPendingImage(null)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="relative flex items-end bg-card border border-input focus-within:ring-2 focus-within:ring-ring rounded-2xl shadow-md px-3 py-2 gap-2 transition-all">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sendMessage.isPending}
          title="Attach a dental photo"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors self-end mb-0.5"
        >
          <ImagePlus className="w-5 h-5" />
        </button>

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={pendingImage ? "Add a message or send photo directly..." : "Describe your dental problem or upload a photo..."}
          className="min-h-[48px] max-h-[160px] flex-1 resize-none border-0 shadow-none focus-visible:ring-0 px-2 py-2.5 text-base bg-transparent overflow-y-auto"
          rows={1}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!canSend}
          className={cn(
            "shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all self-end mb-0.5",
            canSend
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
  );

  // No active chat selected
  if (!activeChatId) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4 text-center">
        <img src="/dent-ai-logo.png" alt="Dr. DentAI" className="w-20 h-20 rounded-2xl object-cover mb-5 shadow-lg" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          What's your dental concern? 🦷
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-md">
          I'm Dr. DentAI — your AI dental expert. Describe your problem or upload a dental photo and I'll help!
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
              onClick={() => { onNewChat(); setTimeout(() => handleSubmit(s), 80); }}
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
            Type your problem, or tap the 📷 icon to upload a dental photo for AI analysis!
          </p>
          <div className="w-full max-w-2xl mx-auto">{inputBar}</div>
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
            Online — supports text & dental photo analysis
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
            <ChatMessageBubble key={index} role={msg.role} content={msg.content} image={msg.image} />
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
        {inputBar}
      </footer>
    </div>
  );
}
