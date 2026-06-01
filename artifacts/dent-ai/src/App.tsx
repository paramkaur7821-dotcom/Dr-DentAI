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

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Focus input when rename starts
  useEffect(() => {
    if (renaming) {
      setRenameVal(chat.title);
      setTimeout(() => inputRef.current?.select(), 30);
    }
  }, [renaming, chat.title]);

  const commitRename = () => {
    const trimmed = renameVal.trim();
    if (trimmed && trimmed !== chat.title) onRename(trimmed);
    setRenaming(false);
  };

  const handleMenuOption = (action: "rename" | "delete") => {
    setMenuOpen(false);
    if (action === "rename") setRenaming(true);
    if (action === "delete") onDelete();
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer",
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
      onClick={() => {
        if (!renaming) onSelect();
      }}
    >
      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />

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
            onKeyDown={(e) => {
              if (e.key === "Escape") { setRenaming(false); }
            }}
            className="flex-1 min-w-0 bg-transparent text-xs font-medium border-b border-sidebar-ring outline-none py-0.5 text-sidebar-foreground"
          />
          <button
            type="submit"
            className="shrink-0 p-0.5 rounded hover:text-primary transition-colors"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setRenaming(false)}
            className="shrink-0 p-0.5 rounded hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </form>
      ) : (
        <span className="flex-1 truncate text-xs font-medium">{chat.title}</span>
      )}

      {!renaming && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className={cn(
              "p-1 rounded-md transition-colors",
              menuOpen
                ? "opacity-100 bg-sidebar-accent text-sidebar-foreground"
                : "opacity-0 group-hover:opacity-100 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl bg-popover border border-popover-border shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={(e) => { e.stopPropagation(); handleMenuOption("rename"); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-popover-foreground hover:bg-accent/10 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                Rename karein
              </button>
              <div className="h-px bg-border/50 mx-2 my-1" />
              <button
                onClick={(e) => { e.stopPropagation(); handleMenuOption("delete"); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
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

// ── Main app layout ───────────────────────────────────────────────────────────
function AppContent() {
  const [location, setLocation] = useLocation();
  const { chats, createChat, updateChat, deleteChat } = useChats();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const activePage = location === "/medicines" ? "medicines" : "chat";
  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const handleNewChat = useCallback(() => {
    const newChat = createChat();
    setActiveChatId(newChat.id);
    setLocation("/");
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [createChat, setLocation]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setLocation("/");
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    if (activeChatId === chatId) setActiveChatId(null);
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    updateChat(chatId, { title: newTitle });
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
          "fixed md:relative z-30 flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-[width] duration-300 ease-in-out overflow-hidden",
          sidebarOpen ? "w-64" : "w-0"
        )}
      >
        <div className="flex flex-col h-full w-64">

          {/* Header: logo + collapse + new chat */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Stethoscope className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground text-sm tracking-tight">
                Dr. DentAI
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleNewChat}
                title="Naya sawaal"
                className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <SquarePen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                title="Sidebar band karo"
                className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-3 mb-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                searchFocused
                  ? "bg-background border-ring shadow-sm"
                  : "bg-sidebar-accent border-sidebar-border"
              )}
            >
              <Search className="w-3.5 h-3.5 text-sidebar-foreground/50 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Chats search karein..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="flex-1 min-w-0 bg-transparent text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/40 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                  className="shrink-0 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {groups.length === 0 && (
              <div className="text-center py-8 px-4">
                {searchQuery ? (
                  <>
                    <Search className="w-7 h-7 mx-auto mb-2 text-sidebar-foreground/20" />
                    <p className="text-xs text-sidebar-foreground/40">
                      "{searchQuery}" ke liye koi chat nahi mila
                    </p>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-7 h-7 mx-auto mb-2 text-sidebar-foreground/20" />
                    <p className="text-xs text-sidebar-foreground/40 leading-relaxed">
                      Koi chat nahi hai abhi.<br />Naya sawaal puchho!
                    </p>
                  </>
                )}
              </div>
            )}

            {groups.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/35 px-2 mb-1">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.chats.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeChatId === chat.id && activePage === "chat"}
                      onSelect={() => handleSelectChat(chat.id)}
                      onDelete={() => handleDeleteChat(chat.id)}
                      onRename={(title) => handleRenameChat(chat.id, title)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom: Medicines link */}
          <div className="p-2 border-t border-sidebar-border">
            <button
              onClick={() => {
                setLocation("/medicines");
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                activePage === "medicines"
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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

        {/* Topbar for mobile */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 md:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-foreground text-sm">
            {activePage === "medicines" ? "Dental Medicines" : "Dr. DentAI"}
          </span>
          {activePage === "chat" && (
            <button
              onClick={handleNewChat}
              className="ml-auto p-1.5 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
            >
              <SquarePen className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Desktop: floating open-sidebar button when collapsed */}
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
              title="Naya sawaal"
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
            >
              <SquarePen className="w-4 h-4" />
            </button>
          </div>
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
