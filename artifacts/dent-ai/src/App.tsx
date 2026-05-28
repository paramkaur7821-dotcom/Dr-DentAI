import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import { Router as WouterRouter } from "wouter";
import {
  SquarePen,
  Search,
  Pill,
  MessageSquare,
  Menu,
  X,
  Trash2,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChats, type Chat } from "@/hooks/use-chats";
import ChatPage from "@/pages/chat";
import MedicinesPage from "@/pages/medicines";

const queryClient = new QueryClient();

function groupChatsByDate(chats: Chat[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: { label: string; chats: Chat[] }[] = [
    { label: "Aaj", chats: [] },
    { label: "Kal", chats: [] },
    { label: "Pichle 7 din", chats: [] },
    { label: "Purana", chats: [] },
  ];

  for (const chat of chats) {
    const d = new Date(chat.createdAt);
    if (d >= today) groups[0].chats.push(chat);
    else if (d >= yesterday) groups[1].chats.push(chat);
    else if (d >= weekAgo) groups[2].chats.push(chat);
    else groups[3].chats.push(chat);
  }

  return groups.filter((g) => g.chats.length > 0);
}

function AppContent() {
  const [location, setLocation] = useLocation();
  const { chats, createChat, updateChat, deleteChat } = useChats();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState("");

  const activePage = location === "/medicines" ? "medicines" : "chat";

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const handleNewChat = () => {
    const newChat = createChat();
    setActiveChatId(newChat.id);
    setLocation("/");
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setLocation("/");
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const filteredChats = chats.filter((c) =>
    searchQuery.trim() === ""
      ? true
      : c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = groupChatsByDate(filteredChats);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-30 flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-hidden",
          sidebarOpen ? "w-64" : "w-0 md:w-0"
        )}
      >
        <div className="flex flex-col h-full w-64">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-3 pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground text-sm">Dr. DentAI</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat button */}
          <div className="px-3 mb-2">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <SquarePen className="w-4 h-4" />
              Naya Sawaal
            </button>
          </div>

          {/* Search */}
          <div className="px-3 mb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-foreground/50" />
              <input
                type="text"
                placeholder="Chats search karein..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-foreground placeholder:text-sidebar-foreground/50 text-xs border border-sidebar-border focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-2">
            {groups.length === 0 && (
              <p className="text-xs text-sidebar-foreground/40 text-center py-4 px-3">
                {searchQuery ? "Koi chat nahi mila" : "Koi purana chat nahi hai — naya sawaal puchho!"}
              </p>
            )}
            {groups.map((group) => (
              <div key={group.label}>
                <p className="text-xs text-sidebar-foreground/50 font-medium px-2 mb-1">{group.label}</p>
                <div className="space-y-0.5">
                  {group.chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={cn(
                        "group w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors text-xs",
                        activeChatId === chat.id && activePage === "chat"
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      )}
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      <span className="flex-1 truncate">{chat.title}</span>
                      <span
                        role="button"
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className="hidden group-hover:flex items-center justify-center p-0.5 rounded hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Medicines link */}
          <div className="p-3 border-t border-sidebar-border">
            <button
              onClick={() => {
                setLocation("/medicines");
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors",
                activePage === "medicines"
                  ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Pill className="w-4 h-4 shrink-0" />
              Dental Medicines
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-foreground text-sm">
            {activePage === "medicines" ? "Dental Medicines" : "Dr. DentAI"}
          </span>
        </div>

        {/* Desktop sidebar toggle */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden md:flex absolute top-4 left-4 z-10 p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {activePage === "medicines" ? (
          <MedicinesPage />
        ) : (
          <ChatPage
            key={activeChatId ?? "new"}
            activeChatId={activeChatId}
            activeChat={activeChat}
            onUpdateChat={updateChat}
            onNewChat={handleNewChat}
            sidebarOpen={sidebarOpen}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppContent />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
