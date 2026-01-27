import { useState, useRef, useEffect } from 'react'
import { useThemeStore, themeColors } from './themeStore'
import { useChannels, useActiveChannel, useActiveChannelData } from './store/appStore'
import { useActions } from './hooks/useActions'

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function Chat(): JSX.Element {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const channels = useChannels()
  const activeChannel = useActiveChannel()
  const activeChannelData = useActiveChannelData()
  const { sendMessage, setActiveChannel } = useActions()

  const channelList = Object.values(channels)
  const messages = activeChannelData?.messages ?? []

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = (): void => {
    if (inputValue.trim() && activeChannel) {
      sendMessage(activeChannel, inputValue.trim())
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
            <span className="text-xs text-neutral-500">
              {activeChannelData?.users.length ?? 0} in channel
            </span>
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {channelList.length === 0 ? (
            <span className="text-xs text-neutral-600 italic">No channels joined</span>
          ) : (
            channelList.map(channel => (
              <button
                key={channel.name}
                onClick={() => setActiveChannel(channel.name)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 whitespace-nowrap
                  ${activeChannel === channel.name
                    ? `${theme.bgSubtle} ${theme.text}`
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                  }`}
              >
                #{channel.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-600 text-sm italic py-8">
            {activeChannel ? 'No messages yet' : 'Join a channel to start chatting'}
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={msg.isEmote ? 'italic' : ''}>
              <div className="group">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className={`text-sm font-medium ${theme.text}`}>
                    {msg.isEmote ? '* ' : ''}{msg.user}
                  </span>
                  <span className="text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTime(msg.time)}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {msg.isEmote ? msg.text : msg.text}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-800/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeChannel ? `Message #${activeChannel}...` : 'Join a channel to chat'}
            disabled={!activeChannel}
            className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onFocus={(e) => e.currentTarget.style.borderColor = `rgba(${theme.rgb}, 0.4)`}
            onBlur={(e) => e.currentTarget.style.borderColor = ''}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !activeChannel}
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
