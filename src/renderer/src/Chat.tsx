import { useState } from 'react'
import { useThemeStore, themeColors } from './themeStore'

interface ChatMessage {
  id: number
  user: string
  message: string
  timestamp: string
  isSystem?: boolean
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, user: 'System', message: 'Welcome to the Zero-K lobby chat!', timestamp: '12:00', isSystem: true },
  { id: 2, user: 'Commander_Alpha', message: 'Anyone up for a 2v2?', timestamp: '12:05' },
  { id: 3, user: 'IronForge', message: 'Sure, I\'m in. What map?', timestamp: '12:06' },
  { id: 4, user: 'Commander_Alpha', message: 'Speed Metal sounds good', timestamp: '12:06' },
  { id: 5, user: 'NovaPilot', message: 'Can I join? Still learning the game', timestamp: '12:08' },
  { id: 6, user: 'IronForge', message: 'Of course! We all started somewhere', timestamp: '12:09' },
]

export default function Chat(): JSX.Element {
  const [messages] = useState<ChatMessage[]>(MOCK_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [activeChannel, setActiveChannel] = useState('general')
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const channels = [
    { id: 'general', name: 'General', unread: 0 },
    { id: 'looking-for-game', name: 'LFG', unread: 3 },
    { id: 'help', name: 'Help', unread: 0 },
  ]

  const handleSend = (): void => {
    if (inputValue.trim()) {
      // Would send message here
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950/70 border border-neutral-800/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white uppercase tracking-wider">Chat</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-neutral-500">128 online</span>
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="flex gap-1">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200
                ${activeChannel === channel.id
                  ? `${theme.bgSubtle} ${theme.text}`
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                }`}
            >
              {channel.name}
              {channel.unread > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-[10px] ${theme.bg} text-white rounded-full`}>
                  {channel.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={msg.isSystem ? 'text-center' : ''}>
            {msg.isSystem ? (
              <span className="text-xs text-neutral-600 italic">{msg.message}</span>
            ) : (
              <div className="group">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className={`text-sm font-medium ${theme.text}`}>{msg.user}</span>
                  <span className="text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {msg.timestamp}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">{msg.message}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-800/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors"
            onFocus={(e) => e.currentTarget.style.borderColor = `rgba(${theme.rgb}, 0.4)`}
            onBlur={(e) => e.currentTarget.style.borderColor = ''}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`px-4 py-2 ${theme.bg} ${theme.bgHover} disabled:bg-neutral-800 disabled:text-neutral-600 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
