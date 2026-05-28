import React, { useState, useRef, useEffect } from "react";
import { useSendMessage } from "@workspace/api-client-react";
import { ChatMessage, ChatMessageRole } from "@workspace/api-zod";
import { ChatMessageBubble } from "@/components/ui/chat/message";
import { TypingIndicator } from "@/components/ui/chat/typing";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Smile, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Namaste! Main Dr. DentAI hoon 🦷 Aapka dental problem batao, main help karunga! Aap Hindi ya English mein baat kar sakte hain."
};

const SUGGESTIONS = [
  "Mere daant mein dard hai",
  "Mere gum se khoon aa raha hai",
  "Sensitivity problem hai",
  "How to brush properly?"
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const sendMessage = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendMessage.isPending]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");

    sendMessage.mutate(
      { data: { messages: newMessages } },
      {
        onSuccess: (response) => {
          setMessages([...newMessages, { role: "assistant", content: response.message }]);
        },
        onError: () => {
          toast({
            title: "Network Error",
            description: "Could not connect to Dr. DentAI. Please try again.",
            variant: "destructive",
          });
          // Remove the user message if it failed, or we could leave it. For now, let's leave it so they can resend.
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background max-w-4xl mx-auto border-x border-border/40 shadow-sm relative">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-lg tracking-tight">Dr. DentAI</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Online
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col space-y-6 max-w-3xl mx-auto w-full">
          {messages.map((msg, index) => (
            <ChatMessageBubble key={index} role={msg.role} content={msg.content} />
          ))}

          {sendMessage.isPending && (
            <div className="flex w-full justify-start">
              <TypingIndicator />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 z-10 bg-background border-t border-border/50 p-4 md:px-6 md:py-5">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
          
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-sm px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors border border-border/50 shadow-sm whitespace-nowrap"
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form 
            onSubmit={handleSubmit}
            className="relative flex items-end w-full gap-2 bg-card border border-input focus-within:ring-1 focus-within:ring-ring focus-within:border-ring rounded-2xl shadow-sm p-2 transition-all"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Aapki dental problem batayein..."
              className="min-h-[44px] max-h-[150px] w-full resize-none border-0 shadow-none focus-visible:ring-0 px-3 py-3 text-base bg-transparent overflow-y-auto"
              rows={1}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || sendMessage.isPending}
              className={cn(
                "h-10 w-10 shrink-0 rounded-full transition-all self-end mb-1 mr-1",
                input.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="w-5 h-5 ml-0.5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/80 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <p>Yeh AI advice hai — real dentist ki jagah nahi. Kripya daktar se paramarsh lein.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
