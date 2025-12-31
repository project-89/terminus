"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

function getMessageContent(message: any): string {
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");
  }
  return "";
}

export function LogosPanel({ onClose }: { onClose?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const welcomeMessage = {
    id: "welcome",
    role: "assistant" as const,
    parts: [{ type: "text" as const, text: "LOGOS COMMAND INTERFACE ACTIVE\n\nI have full visibility into the network. What would you like to analyze, Agent?" }],
  };
  
  const { messages: chatMessages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/admin/logos" }),
  });
  
  const messages = chatMessages.length === 0 ? [welcomeMessage] : chatMessages;

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = [
    "Show me agents who need attention",
    "Analyze dream patterns this week",
    "Draft a field mission for Tokyo",
    "Who are our top performers?",
    "Find agents stuck at Layer 1",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className={`flex flex-col bg-black/95 border-l-2 border-cyan-700/50 ${isExpanded ? 'w-[500px]' : 'w-16'} transition-all duration-300`}>
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-cyan-700/50 bg-gradient-to-r from-cyan-950/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-cyan-400 animate-ping opacity-50" />
          </div>
          {isExpanded && (
            <div>
              <div className="text-cyan-400 font-bold tracking-widest">LOGOS</div>
              <div className="text-cyan-700 text-xs tracking-wider">COMMAND INTERFACE</div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-600 hover:text-cyan-400 p-1"
          >
            {isExpanded ? "◀" : "▶"}
          </button>
          {onClose && (
            <button onClick={onClose} className="text-cyan-600 hover:text-cyan-400 p-1">
              ✕
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => {
              const content = getMessageContent(message);
              const toolInvocations = (message as any).toolInvocations;
              
              return (
                <div
                  key={message.id}
                  className={`${message.role === "user" ? "ml-8" : "mr-8"}`}
                >
                  <div
                    className={`p-3 rounded ${
                      message.role === "user"
                        ? "bg-cyan-900/30 border border-cyan-700/50 text-cyan-300"
                        : "bg-black border border-cyan-500/30 text-cyan-400"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="text-xs text-cyan-600 mb-2 tracking-widest">LOGOS</div>
                    )}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {content}
                    </div>
                    {toolInvocations && toolInvocations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-cyan-800/50">
                        {toolInvocations.map((tool: any, i: number) => (
                          <div key={i} className="text-xs">
                            <div className="text-yellow-500/70 mb-1">
                              ⚡ {tool.toolName}
                            </div>
                            {tool.state === "result" && (
                              <div className="text-cyan-600/70 bg-cyan-950/30 p-2 rounded text-xs max-h-32 overflow-auto">
                                <pre>{JSON.stringify(tool.result, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="mr-8">
                <div className="p-3 rounded bg-black border border-cyan-500/30">
                  <div className="text-xs text-cyan-600 mb-2 tracking-widest">LOGOS</div>
                  <div className="flex items-center gap-2 text-cyan-500">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-sm">Processing...</span>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="p-3 rounded bg-red-900/20 border border-red-500/50 text-red-400 text-sm">
                Error: {error.message}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="text-xs text-cyan-700 mb-2">SUGGESTED QUERIES</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="text-xs px-2 py-1 border border-cyan-800 text-cyan-600 hover:text-cyan-400 hover:border-cyan-600 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 border-t border-cyan-900/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query LOGOS..."
                className="flex-1 bg-black border border-cyan-800 text-cyan-300 px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 placeholder-cyan-800"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-cyan-900/50 border border-cyan-600 text-cyan-400 text-sm tracking-wider hover:bg-cyan-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                SEND
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export function LogosButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-black border-2 border-cyan-500 flex items-center justify-center group hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 transition-all z-50"
    >
      <div className="relative">
        <div className="w-4 h-4 rounded-full bg-cyan-400 group-hover:animate-pulse" />
        <div className="absolute inset-0 w-4 h-4 rounded-full bg-cyan-400 animate-ping opacity-30" />
      </div>
      <div className="absolute -top-10 right-0 px-3 py-1 bg-black border border-cyan-700 text-cyan-400 text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        LOGOS COMMAND
      </div>
    </button>
  );
}
