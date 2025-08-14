"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, Bot, User, Mic, Sparkles } from "lucide-react";
import { aiChatAssistant, type AIChatAssistantInput, type AIChatAssistantOutput } from "@/ai/flows/ai-chat-assistant";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, DocumentData, getDocs, doc, updateDoc } from "firebase/firestore";


type Message = {
  id: string;
  sender: "user" | "assistant";
  content: string;
  suggestions?: string[];
};

const examplePrompts = [
    "What are some healthy lunch ideas?",
    "Suggest a 30-minute workout routine.",
    "How can I improve my sleep quality?",
    "What are the benefits of drinking green tea?",
];

const welcomeMessage: Message = {
    id: "welcome-message",
    sender: "assistant",
    content: "Hi there! How can I help you today? Let me know if you have any questions.",
};

export default function ChatPage() {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
             scrollAreaRef.current?.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 100);
    }
  };

  useEffect(() => {
      if (user) {
          setIsHistoryLoading(true);
          const q = query(collection(db, "users", user.uid, "chatHistory"), orderBy("timestamp", "asc"));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
              if (querySnapshot.empty) {
                  setMessages([welcomeMessage]);
              } else {
                  const history: Message[] = [];
                  querySnapshot.forEach((doc: DocumentData) => {
                      const data = doc.data();
                       history.push({ id: doc.id, sender: 'user', content: data.prompt });
                       if (data.response) {
                        history.push({ id: `${doc.id}-ai`, sender: 'assistant', content: data.response });
                       }
                  });
                  if (history.length === 0) {
                      setMessages([welcomeMessage]);
                  } else {
                      setMessages(history);
                  }
              }
              setIsHistoryLoading(false);
          });
          return () => unsubscribe();
      } else {
        setMessages([welcomeMessage]);
        setIsHistoryLoading(false);
      }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSubmit(undefined, suggestion);
  };
  
  const handleSubmit = async (e?: FormEvent<HTMLFormElement>, suggestion?: string) => {
    e?.preventDefault();
    const currentInputValue = suggestion || inputValue;
    if (!currentInputValue.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: currentInputValue,
    };
    
    // Optimistically add user message, replacing welcome message if it's there
    setMessages((prev) => (prev.length === 1 && prev[0].id === 'welcome-message' ? [userMessage] : [...prev, userMessage]));
    setInputValue("");
    setIsLoading(true);

    try {
      const chatHistory = messages.filter(m => m.id !== 'welcome-message').map(m => `${m.sender}: ${m.content}`).join('\n');
      const input: AIChatAssistantInput = { message: currentInputValue, chatHistory };
      
      const chatHistoryRef = collection(db, "users", user.uid, "chatHistory");
      // Store user prompt and an initial empty AI response
      const newDocRef = await addDoc(chatHistoryRef, {
          prompt: currentInputValue,
          response: "", // Placeholder for the streaming response
          timestamp: serverTimestamp(),
      });

      const result: AIChatAssistantOutput = await aiChatAssistant(input);
      
      // Update the document with the actual AI response.
      await updateDoc(newDocRef, { response: result.response });

      // The new message will be added via the onSnapshot listener, so we don't need to manually add it here.
      // The old logic for optimistic updates was removed to rely solely on the listener.

    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const showEmptyChatState = !isHistoryLoading && messages.length === 1 && messages[0].id === 'welcome-message' && !isLoading;

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col bg-card rounded-xl shadow-xl border">
      <div className="p-4 border-b">
         <h1 className="text-xl font-bold font-headline flex items-center gap-2">
            <Bot /> AI Chat Assistant
        </h1>
        <p className="text-sm text-muted-foreground">Your personal guide to better health.</p>
      </div>
      
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {isHistoryLoading && (
            <div className="flex items-start gap-3">
               <Avatar className="w-9 h-9 border">
                  <AvatarFallback className="bg-primary/10"><Bot size={20} className="text-primary" /></AvatarFallback>
                </Avatar>
              <div className="max-w-lg rounded-xl p-3.5 shadow-sm bg-muted w-full space-y-2 rounded-bl-none">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          )}
          {!isHistoryLoading && messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3 w-full",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === "assistant" && (
                <Avatar className="w-9 h-9 border">
                  <AvatarFallback className="bg-primary/10"><Bot size={20} className="text-primary"/></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-lg rounded-xl p-3.5 shadow-sm text-sm",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                 {message.suggestions && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.suggestions.map((s, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant="outline"
                        onClick={() => handleSuggestionClick(s)}
                        className="text-xs h-auto py-1 px-2.5 bg-background hover:bg-accent"
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
               {message.sender === "user" && (
                <Avatar className="w-9 h-9 border">
                  <AvatarFallback><User size={20} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
               <Avatar className="w-9 h-9 border">
                  <AvatarFallback className="bg-primary/10"><Bot size={20} className="text-primary" /></AvatarFallback>
                </Avatar>
              <div className="max-w-lg rounded-xl p-3.5 shadow-sm bg-muted w-full space-y-2 rounded-bl-none">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          )}

          {showEmptyChatState && (
             <div className="text-center text-muted-foreground pt-8">
              <div className="bg-primary/10 p-4 rounded-full mb-4 inline-block">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Start a conversation</h2>
              <p className="max-w-md mt-2 mx-auto">Or try one of these examples:</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {examplePrompts.map((prompt, i) => (
                    <Button key={i} variant="outline" size="sm" className="text-xs h-auto py-1.5 px-3" onClick={() => handleSuggestionClick(prompt)}>
                        {prompt}
                    </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background rounded-b-xl">
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your health..."
                className="flex-grow h-11"
                disabled={isLoading || !user}
                />
                <Button type="button" variant="outline" size="icon" disabled={isLoading} className="h-11 w-11">
                <Mic className="h-5 w-5" />
                </Button>
                <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim() || !user} className="h-11 w-11">
                <SendHorizonal className="h-5 w-5" />
                </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center items-center gap-1 hidden sm:flex justify-center">
                Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">Enter</kbd> to send.
            </p>
        </div>
      </div>
    </div>
  );
}
