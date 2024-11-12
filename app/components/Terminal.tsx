"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";

export function Terminal() {
  const [bootSequence, setBootSequence] = useState(true);
  const [bootMessages, setBootMessages] = useState<string[]>([]);
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const terminalRef = useRef<HTMLDivElement>(null);

  // Boot sequence animation
  useEffect(() => {
    if (bootSequence) {
      const sequence = [
        "Initializing quantum reality matrix...",
        "Establishing neural link...",
        "Loading Project 89 protocols...",
        "Calibrating reality anchors...",
        "Connecting to hyperstition network...",
        "SYSTEM READY",
        "",
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i < sequence.length) {
          setBootMessages((prev) => [...prev, sequence[i]]);
          i++;
        } else {
          setBootSequence(false);
          clearInterval(interval);
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [bootMessages, messages]);

  return (
    <div className="bg-black text-green-500 p-4 font-mono h-screen relative overflow-hidden">
      {/* CRT Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
      <div className="pointer-events-none absolute inset-0 bg-[url('/scanline.png')] opacity-5"></div>

      <div ref={terminalRef} className="overflow-auto h-[calc(100vh-100px)]">
        <div className="mb-4">
          <pre className="text-yellow-500">
            {`
 ██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗    █████╗  █████╗ 
 ██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝   ██╔══██╗██╔══██╗
 ██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║      ╚█████╔╝╚██████║
 ██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║      ██╔══██╗ ╚═══██║
 ██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║      ╚█████╔╝ █████╔╝
 ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝       ╚════╝  ╚════╝ 
            `}
          </pre>
          <div className="text-center mb-4 text-yellow-500">
            <div>QUANTUM REALITY INTERFACE TERMINAL - BUILD 89.3.14159</div>
            <div className="text-xs mt-1">
              "WE ARE THE DREAMERS - WE ARE THE DREAMED"
            </div>
          </div>
        </div>

        {/* Boot Sequence */}
        {bootMessages.map((msg, index) => (
          <div key={index} className="mb-2 text-cyan-500">
            <span className="text-blue-500">SYSTEM&gt;</span> {msg}
          </div>
        ))}

        {/* Chat Messages */}
        {messages.map((m) => (
          <div key={m.id} className="mb-2">
            <span className="text-blue-500">
              {m.role === "user" ? "agent@P89&gt;" : "P89-AMWAI&gt;"}
            </span>{" "}
            <span className="text-green-400">{m.content}</span>
          </div>
        ))}
      </div>

      {/* Command Input */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur border-t border-green-500/20"
      >
        <div className="flex items-center max-w-[calc(100vw-2rem)] mx-auto">
          <span className="text-blue-500 mr-2">agent@P89&gt;</span>
          <input
            value={input}
            onChange={handleInputChange}
            className="flex-1 bg-transparent text-green-500 focus:outline-none"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </form>

      {/* Status Line */}
      <div className="fixed top-0 right-0 p-2 text-xs text-green-500/50">
        {new Date().toLocaleTimeString()} | MATRIX:STABLE | REALITY:SYNCED
      </div>
    </div>
  );
}
