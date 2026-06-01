import { useState, useRef, useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLocation, Router as WouterRouter } from "wouter";
import {
  SquarePen,
  Search,
  Pill,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Stethoscope,
  MoreHorizontal,
  Pencil,
  X,
  Check,
  Menu,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChats, type Chat } from "@/hooks/use-chats";
import ChatPage from "@/pages/chat";
import MedicinesPage from "@/pages/medicines";
import LibraryPage from "@/pages/library";

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

// ── Chat item with rename + options menu ──────────────────────────────────────
interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

function ChatItem({ chat, isActive, onSelect, onDelete, onRename }: ChatItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(chat.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming) {
      setRenameVal(chat.title);
      setTimeout(() => inputRef.current?.select(), 30);
    }
  }, [renaming, chat.title]);

  const commitRename = () => {
    const t = renameVal.trim();
    if (t && t !== chat.title) onRename(t);
    setRenaming(false);
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-colors cursor-pointer",
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
      onClick={() => { if (!renaming) onSelect(); }}
    >
      <MessageSquare className="w-4 h-4 shrink-0 opacity-50" />

      {renaming ? (
        <form
          className="flex-1 flex items-center gap-1 min-w-0"
          onSubmit={(e) => { e.preventDefault(); commitRename(); }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === "Escape") setRenaming(false); }}
            className="flex-1 min-w-0 bg-transparent text-sm border-b border-sidebar-ring outline-none py-0.5 text-sidebar-foreground"
          />
          <button type="submit" onMouseDown={(e) => e.preventDefault()} className="shrink-0 p-0.5 rounded hover:text-primary">
            <Check className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => setRenaming(false)} className="shrink-0 p-0.5 rounded hover:text-destructive">
            <X className="w-3 h-3" />
          </button>
        </form>
      ) : (
        <span className="flex-1 truncate text-sm">{chat.title}</span>
      )}

      {!renaming && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className={cn(
              "p-1 rounded-lg transition-colors",
              menuOpen
                ? "opacity-100 bg-sidebar-accent/80 text-sidebar-foreground"
                : "opacity-0 group-hover:opacity-100 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl bg-popover border border-popover-border shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setRenaming(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-popover-foreground hover:bg-accent/10 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                Rename karein
              </button>
              <div className="h-px bg-border/50 mx-2 my-0.5" />
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete karein
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Page = "chat" | "medicines" | "library";

// ── Main app layout ───────────────────────────────────────────────────────────
function AppContent() {
  const [location, setLocation] = useLocation();
  const { chats, createChat, updateChat, deleteChat } = useChats();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activePage: Page =
    location === "/medicines" ? "medicines" :
    location === "/library" ? "library" : "chat";

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const handleNewChat = useCallback(() => {
    const newChat = createChat();
    setActiveChatId(newChat.id);
    setLocation("/");
    setSearchMode(false);
    setSearchQuery("");
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [createChat, setLocation]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setLocation("/");
    setSearchMode(false);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleNavigate = (page: Page) => {
    setLocation(page === "chat" ? "/" : `/${page}`);
    setSearchMode(false);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSearchToggle = () => {
    setSearchMode((v) => !v);
    setSearchQuery("");
    if (!searchMode) setTimeout(() => searchInputRef.current?.focus(), 80);
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
          className="fixed inset-0 z-20 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed md:relative z-30 flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-[width] duration-300 ease-in-out overflow-hidden shrink-0",
          sidebarOpen ? "w-72" : "w-0"
        )}
      >
        <div className="flex flex-col h-full w-72">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/dent-ai-logo.png"
                alt="Dr. DentAI"
                className="w-8 h-8 rounded-xl object-cover shrink-0 shadow-sm"
              />
              <span className="font-bold text-sidebar-foreground text-base tracking-tight">
                Dr. DentAI
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              title="Band karo"
              className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* ── Primary Nav Items (Gemini-style) ── */}
          <nav className="px-3 space-y-0.5 mb-1">
            {/* New Chat */}
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group"
            >
              <div className="flex items-center gap-3">
                <SquarePen className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">Naya Chat</span>
              </div>
              <span className="text-[10px] text-sidebar-foreground/35 font-mono hidden md:block">Ctrl+N</span>
            </button>

            {/* Search Chats */}
            <button
              onClick={handleSearchToggle}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium",
                searchMode
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Search className="w-4 h-4 shrink-0" />
              Chat Dhundho
            </button>

            {/* Search input — expands below when active */}
            {searchMode && (
              <div className="px-1 pt-1 pb-0.5 animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-ring shadow-sm">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Chat ka naam likho..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-sm text-sidebar-foreground placeholder:text-muted-foreground/50 outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="shrink-0 text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Doctor's Library */}
            <button
              onClick={() => handleNavigate("library")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium",
                activePage === "library"
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              Doctor's Library
            </button>
          </nav>

          {/* ── Divider ── */}
          <div className="mx-4 border-t border-sidebar-border/60 my-1" />

          {/* ── Recent Chats ── */}
          <div className="flex-1 overflow-y-auto px-3 py-1">
            {searchMode && searchQuery && filteredChats.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-7 h-7 mx-auto mb-2 text-sidebar-foreground/20" />
                <p className="text-xs text-sidebar-foreground/40">"{searchQuery}" nahi mila</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 px-3">
                <MessageSquare className="w-7 h-7 mx-auto mb-2 text-sidebar-foreground/20" />
                <p className="text-xs text-sidebar-foreground/40 leading-relaxed">
                  Koi chat nahi hai abhi.<br />Naya sawaal puchho!
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mb-4">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-sidebar-foreground/35 px-3 mb-1.5">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.chats.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={activeChatId === chat.id && activePage === "chat"}
                        onSelect={() => handleSelectChat(chat.id)}
                        onDelete={() => {
                          deleteChat(chat.id);
                          if (activeChatId === chat.id) setActiveChatId(null);
                        }}
                        onRename={(title) => updateChat(chat.id, { title })}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Bottom nav ── */}
          <div className="px-3 pb-3 pt-1 border-t border-sidebar-border space-y-0.5">
            <button
              onClick={() => handleNavigate("medicines")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium",
                activePage === "medicines"
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Pill className="w-4 h-4 shrink-0" />
              Dental Medicines
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">

        {/* Mobile topbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 md:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-foreground text-sm flex-1">
            {activePage === "medicines" ? "Dental Medicines" :
             activePage === "library" ? "Doctor's Library" : "Dr. DentAI"}
          </span>
          {activePage === "chat" && (
            <button onClick={handleNewChat} className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted transition-colors">
              <SquarePen className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Desktop: floating buttons when sidebar is collapsed */}
        {!sidebarOpen && (
          <div className="hidden md:flex absolute top-3 left-3 z-10 items-center gap-1">
            <button
              onClick={() => setSidebarOpen(true)}
              title="Sidebar kholo"
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
            <button
              onClick={handleNewChat}
              title="Naya chat"
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
            >
              <SquarePen className="w-4 h-4" />
            </button>
          </div>
        )}

        {activePage === "medicines" ? (
          <MedicinesPage />
        ) : activePage === "library" ? (
          <LibraryPage />
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
