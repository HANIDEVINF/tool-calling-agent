"use client"

import { useState } from "react"
import {
  Brain,
  Calculator,
  Cloud,
  Database,
  Loader2,
  MessageSquare,
  Send,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react"

type ToolCall = {
  tool: string
  input: string
  output: string
  timestamp: string
}

type Message = {
  role: "user" | "assistant"
  content: string
  toolCalls?: ToolCall[]
}

const tools = {
  weather: {
    name: "Weather API",
    icon: Cloud,
    description: "Get current weather for any city",
    execute: (input: string) => {
      const cities: Record<string, { temp: number; condition: string; humidity: number }> = {
        tokyo: { temp: 18, condition: "Partly Cloudy", humidity: 65 },
        paris: { temp: 12, condition: "Rainy", humidity: 80 },
        "new york": { temp: 15, condition: "Sunny", humidity: 55 },
        london: { temp: 10, condition: "Cloudy", humidity: 75 },
        dubai: { temp: 35, condition: "Sunny", humidity: 40 },
      }
      
      const city = input.toLowerCase().trim()
      const data = cities[city] || { temp: 20, condition: "Partly Cloudy", humidity: 60 }
      
      return `Weather in ${input}: ${data.temp}°C, ${data.condition}, Humidity: ${data.humidity}%`
    }
  },
  calculator: {
    name: "Calculator",
    icon: Calculator,
    description: "Perform mathematical calculations",
    execute: (input: string) => {
      try {
        const sanitized = input.replace(/[^0-9+\-*/().]/g, "")
        const result = eval(sanitized)
        return `${input} = ${result}`
      } catch {
        return "Invalid calculation. Please use basic math operations."
      }
    }
  },
  database: {
    name: "Database Query",
    icon: Database,
    description: "Query product database",
    execute: (input: string) => {
      const products = [
        { id: 1, name: "Laptop Pro", price: 1299, stock: 45 },
        { id: 2, name: "Wireless Mouse", price: 49, stock: 120 },
        { id: 3, name: "Monitor 27\"", price: 349, stock: 30 },
        { id: 4, name: "Keyboard RGB", price: 89, stock: 75 },
        { id: 5, name: "Webcam HD", price: 79, stock: 50 },
      ]
      
      const query = input.toLowerCase()
      if (query.includes("laptop")) return JSON.stringify(products[0], null, 2)
      if (query.includes("mouse")) return JSON.stringify(products[1], null, 2)
      if (query.includes("monitor")) return JSON.stringify(products[2], null, 2)
      if (query.includes("keyboard")) return JSON.stringify(products[3], null, 2)
      if (query.includes("webcam")) return JSON.stringify(products[4], null, 2)
      
      return JSON.stringify(products, null, 2)
    }
  }
}

function determineTool(query: string): { tool: string | null; input: string } {
  const lower = query.toLowerCase()
  
  if (lower.includes("weather") || lower.includes("temperature") || lower.includes("forecast")) {
    const cityMatch = query.match(/(?:in|for|at)\s+([a-zA-Z\s]+)/i)
    const city = cityMatch ? cityMatch[1].trim() : "Tokyo"
    return { tool: "weather", input: city }
  }
  
  if (lower.includes("calculate") || lower.includes("math") || /[0-9+\-*/]/.test(query)) {
    const mathMatch = query.match(/calculate\s+(.+)/i) || query.match(/(.+)/)
    const expression = mathMatch ? mathMatch[1].trim() : query
    return { tool: "calculator", input: expression }
  }
  
  if (lower.includes("product") || lower.includes("database") || lower.includes("query") || lower.includes("search")) {
    return { tool: "database", input: query }
  }
  
  return { tool: null, input: query }
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm an AI agent that can use tools to help you. Try asking me about the weather, calculations, or product information."
    }
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)

  async function handleSend() {
    if (!input.trim()) return
    
    const userMessage: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    const { tool, input: toolInput } = determineTool(input)
    
    if (tool && tools[tool as keyof typeof tools]) {
      setActiveTool(tool)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const toolData = tools[tool as keyof typeof tools]
      const result = toolData.execute(toolInput)
      
      const toolCall: ToolCall = {
        tool: toolData.name,
        input: toolInput,
        output: result,
        timestamp: new Date().toISOString()
      }
      
      const response: Message = {
        role: "assistant",
        content: `I used the ${toolData.name} to help with your request. Here's what I found:`,
        toolCalls: [toolCall]
      }
      
      setMessages(prev => [...prev, response])
      setActiveTool(null)
    } else {
      const response: Message = {
        role: "assistant",
        content: "I can help you with weather information, calculations, or database queries. Try asking about the weather in a city, calculate something, or search for products."
      }
      setMessages(prev => [...prev, response])
    }
    
    setIsProcessing(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Tool-Calling AI Agent</h1>
              <p className="text-xs text-slate-400">Multi-step reasoning with external tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
              <Sparkles className="h-4 w-4" />
              <span>3 Tools Available</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 backdrop-blur-sm p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-400">
              <MessageSquare className="h-4 w-4" />
              Agent Conversation
            </div>
            
            <div className="mb-4 h-[400px] space-y-4 overflow-auto rounded-lg bg-slate-950 p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-800 text-slate-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.toolCalls && (
                      <div className="mt-3 space-y-2">
                        {message.toolCalls.map((call, i) => (
                          <div key={i} className="rounded bg-slate-900 p-3 text-xs">
                            <div className="mb-2 flex items-center gap-2 text-cyan-400">
                              <Zap className="h-3 w-3" />
                              <span className="font-semibold">{call.tool}</span>
                            </div>
                            <div className="mb-1 text-slate-400">Input: {call.input}</div>
                            <div className="text-emerald-400">Output: {call.output}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-slate-800 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        {activeTool ? `Using ${activeTool}...` : "Thinking..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about weather, calculations, or products..."
                className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-400/50 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isProcessing ? "Processing" : "Send"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 backdrop-blur-sm p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-orange-400">
              <Settings className="h-4 w-4" />
              Available Tools
            </div>
            
            <div className="space-y-3">
              {Object.entries(tools).map(([key, tool]) => {
                const Icon = tool.icon
                return (
                  <div
                    key={key}
                    className={`rounded-lg border p-4 transition ${
                      activeTool === key
                        ? "border-blue-400/50 bg-blue-500/10"
                        : "border-white/10 bg-slate-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        activeTool === key ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{tool.name}</h3>
                        <p className="text-xs text-slate-400">{tool.description}</p>
                      </div>
                      {activeTool === key && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                          <Loader2 className="h-3 w-3 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 backdrop-blur-sm p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <Brain className="h-4 w-4" />
              Agent Capabilities
            </div>
            
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>Multi-step reasoning with tool selection</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>Automatic tool routing based on intent</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>Error handling and fallback responses</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>Transparent tool execution visualization</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 backdrop-blur-sm p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-purple-400">
              <Sparkles className="h-4 w-4" />
              Example Queries
            </div>
            
            <div className="space-y-2">
              {[
                "What's the weather in Tokyo?",
                "Calculate 25 * 4 + 10",
                "Search for laptop in database",
                "Temperature in Paris",
                "Calculate 100 / 5"
              ].map((query) => (
                <button
                  key={query}
                  onClick={() => setInput(query)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-purple-400/50 hover:bg-purple-500/10"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
