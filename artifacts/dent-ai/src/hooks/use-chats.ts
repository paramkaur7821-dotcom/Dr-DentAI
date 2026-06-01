import { useState, useEffect } from "react";

const STORAGE_KEY = "dent-ai-chats";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function loadChats(): Chat[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const chats: Chat[] = JSON.parse(stored);
    return chats.map((c) =>
      c.title === "Naya sawaal" ? { ...c, title: "New chat" } : c
    );
  } catch {
    return [];
  }
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>(loadChats);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
    }
  }, [chats]);

  const createChat = (): Chat => {
    const newChat: Chat = {
      id: generateId(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    return newChat;
  };

  const updateChat = (id: string, updates: Partial<Pick<Chat, "title" | "messages">>) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
  };

  return { chats, createChat, updateChat, deleteChat };
}
