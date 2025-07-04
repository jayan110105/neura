"use client";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea  } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { ArrowUp, Save, CalendarPlus, Star, Brain, Lightbulb, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect } from "react";
import type { Message } from "ai";

const quickPrompts = [
  { icon: Brain, text: "Summarize my recent notes" },
  { icon: Lightbulb, text: "Generate ideas for project" },
  { icon: Sparkles, text: "Create a task list" },
];

type ChatPageProps = {
    initialMessages: Message[];
};

export default function ChatPage({ initialMessages }: ChatPageProps) {
  const { messages, input, handleInputChange, handleSubmit, append, setMessages  } = useChat();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  useEffect(() => {
    const handleReset = async () => {
      setMessages([]); // Clear UI
      await fetch("/api/chat", { method: "DELETE" }); // Clear DB
    };

    window.addEventListener("reset-chat", () => {
      handleReset().catch(console.error);
    });

    return () => {
      window.removeEventListener("reset-chat", () => {
        handleReset().catch(console.error);
      });
    };
  }, [setMessages]);


  return (
    <div className="h-full flex flex-col">
      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={message.id ?? `message-${index}`}
              className={cn(
                "flex flex-col",
                message.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "px-6 py-3 max-w-[80%]",
                message.role === 'user' ? "rounded-full bg-secondary" : "border-none shadow-none bg-none"
              )}>
                {message.content ? (
                  message.role === 'assistant' ? (
                    // <p>{message.content}</p>
                    <div className="prose">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )
                ) : (
                  message.role === "assistant" && (
                    <div className="w-5 h-5 bg-white rounded-full animate-grow-shrink"></div>
                  )
                )}
                {message.content && message.role === 'assistant' && (
                  <div className="mt-2 flex items-center">

                    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="px-2">
                            <Save className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save as Note</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="px-2">
                            <CalendarPlus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add to Calendar</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="px-2">
                            <Star className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Favorite</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="sticky bottom-0 px-4 mb-4 bg-background">
        <div className="bg-secondary max-w-4xl mx-auto border rounded-xl">
          <form onSubmit={handleSubmit} className="flex items-end p-2">
            <div className="flex-1">
              <Textarea 
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 border-none shadow-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                rows={3}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto"; // Reset height
                  target.style.height = `${Math.min(target.scrollHeight, 5 * 24)}px`; // Expand up to 5 rows
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit();
                  }
                }}
              />
            </div>
            <Button type = 'submit' className="w-10 h-10 rounded-full">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Quick Actions Bar */}
        <div className="max-w-4xl mx-auto hidden md:flex flex-wrap items-center gap-4 mt-4 mb-4 w-full justify-center">
          {quickPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex items-center gap-2 rounded-full py-5"
              onClick={() => append({ role: "user", content: prompt.text })}
            >
              <prompt.icon className="h-4 w-4" />
              {prompt.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}