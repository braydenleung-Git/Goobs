'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import { AgentModel } from '@/components/agent/agent-model'

// Chat Modal Component
function ChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header with Telemetry */}
        <div className="border-b p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">Try Your Agent</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {/* Telemetry Dashboard */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Tokens Used</div>
              <div className="font-mono text-green-600">1,247</div>
              <div className="h-8 bg-gradient-to-r from-green-100 to-green-500 rounded mt-1"></div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Avg Response Time</div>
              <div className="font-mono text-blue-600">2.3s</div>
              <div className="h-8 bg-gradient-to-r from-blue-100 to-blue-500 rounded mt-1"></div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Cost</div>
              <div className="font-mono text-purple-600">$0.042</div>
              <div className="h-8 bg-gradient-to-r from-purple-100 to-purple-500 rounded mt-1"></div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-gray-400 text-center py-8">
              Start a conversation with your agent...
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && input.trim()) {
                  setMessages([...messages, { role: 'user', content: input }])
                  // Simulate agent response
                  setTimeout(() => {
                    setMessages(prev => [...prev, { 
                      role: 'assistant', 
                      content: `I understand you said: "${input}". This is a simulated response.` 
                    }])
                  }, 1000)
                  setInput('')
                }
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={() => {
                if (input.trim()) {
                  setMessages([...messages, { role: 'user', content: input }])
                  setTimeout(() => {
                    setMessages(prev => [...prev, { 
                      role: 'assistant', 
                      content: `I understand you said: "${input}". This is a simulated response.` 
                    }])
                  }, 1000)
                  setInput('')
                }
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentBuilder() {
  const [customization, setCustomization] = useState({
    bodyColor: '#3B82F6',
    eyes: 'circle',
    hat: 'none',
    glow: 'none',
    accessory: 'none',
    animationStyle: 'bouncy'
  })
  
  const [agentName, setAgentName] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [showChat, setShowChat] = useState(false)

  const customizationOptions = {
    bodyColor: [
      { value: '#3B82F6', label: 'Blue', color: 'bg-blue-500' },
      { value: '#EF4444', label: 'Red', color: 'bg-red-500' },
      { value: '#10B981', label: 'Green', color: 'bg-green-500' },
      { value: '#F59E0B', label: 'Yellow', color: 'bg-yellow-500' },
      { value: '#8B5CF6', label: 'Purple', color: 'bg-purple-500' },
      { value: '#EC4899', label: 'Pink', color: 'bg-pink-500' },
    ],
    eyes: ['circle', 'star', 'heart', 'slit', 'glow'],
    hat: ['none', 'crown', 'wizard', 'chef', 'hardhat', 'tophat', 'beanie', 'graduation'],
    glow: ['none', 'soft', 'neon', 'fire', 'ice', 'electric'],
    accessory: ['none', 'glasses', 'bowtie', 'scarf', 'wings', 'cape', 'backpack', 'toolbelt'],
    animationStyle: ['bouncy', 'floaty', 'robotic', 'sleepy', 'energetic']
  }

  const models = [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable, good for complex tasks' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Faster and cheaper' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Great for reasoning' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s latest model' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Agent Builder</h1>
          <a 
            href="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back to Workshop
          </a>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - 3D Model Viewer */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="h-96 bg-gray-900 rounded-lg">
              <Canvas camera={{ position: [3, 2, 5] }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={0.8} />
                <pointLight position={[-5, 5, -5]} intensity={0.4} />
                <Suspense fallback={null}>
                  <AgentModel customization={customization} />
                  <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                  <Environment preset="sunset" />
                </Suspense>
              </Canvas>
            </div>
            
            {/* Agent Name Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right Side - Customization Options */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Customization</h2>
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Body Color */}
              <div>
                <label className="block text-sm font-medium mb-2">Body Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {customizationOptions.bodyColor.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setCustomization({...customization, bodyColor: color.value})}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        customization.bodyColor === color.value 
                          ? 'border-blue-500 scale-105' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className={`w-full h-8 rounded ${color.color}`}></div>
                      <div className="text-xs mt-1">{color.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Eyes */}
              <div>
                <label className="block text-sm font-medium mb-2">Eye Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {customizationOptions.eyes.map((eye) => (
                    <button
                      key={eye}
                      onClick={() => setCustomization({...customization, eyes: eye})}
                      className={`px-3 py-2 rounded-lg border-2 capitalize transition-all ${
                        customization.eyes === eye 
                          ? 'border-blue-500 bg-blue-500/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {eye}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hat */}
              <div>
                <label className="block text-sm font-medium mb-2">Hat</label>
                <div className="grid grid-cols-2 gap-2">
                  {customizationOptions.hat.map((hat) => (
                    <button
                      key={hat}
                      onClick={() => setCustomization({...customization, hat: hat})}
                      className={`px-3 py-2 rounded-lg border-2 capitalize transition-all ${
                        customization.hat === hat 
                          ? 'border-blue-500 bg-blue-500/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {hat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glow Effect */}
              <div>
                <label className="block text-sm font-medium mb-2">Glow Effect</label>
                <div className="grid grid-cols-3 gap-2">
                  {customizationOptions.glow.map((glow) => (
                    <button
                      key={glow}
                      onClick={() => setCustomization({...customization, glow: glow})}
                      className={`px-3 py-2 rounded-lg border-2 capitalize transition-all ${
                        customization.glow === glow 
                          ? 'border-blue-500 bg-blue-500/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {glow}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Style */}
              <div>
                <label className="block text-sm font-medium mb-2">Animation Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {customizationOptions.animationStyle.map((style) => (
                    <button
                      key={style}
                      onClick={() => setCustomization({...customization, animationStyle: style})}
                      className={`px-3 py-2 rounded-lg border-2 capitalize transition-all ${
                        customization.animationStyle === style 
                          ? 'border-blue-500 bg-blue-500/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Selection and System Prompt */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">AI Model</h3>
            <div className="space-y-3">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedModel === model.id 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-gray-400">{model.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">System Prompt</h3>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define your agent's personality and behavior..."
              className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Try It Out Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowChat(true)}
            disabled={!agentName.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            Try It Out
          </button>
          {!agentName.trim() && (
            <p className="text-gray-400 text-sm mt-2">Please enter an agent name first</p>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  )
}
