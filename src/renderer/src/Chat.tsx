import { useState, useRef, useEffect, useMemo } from 'react'
import { useThemeStore, themeColors } from './themeStore'
import { useChannels, useActiveChannel, useActiveChannelData, useUsers} from './store/appStore'
import { useActions } from './hooks/useActions'

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function ChatPanel(): JSX.Element {
  const [inputValue, setInputValue] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const channels = useChannels()
  const activeChannel = useActiveChannel()
  const activeChannelData = useActiveChannelData()
  const { sendMessage, setActiveChannel } = useActions()

  const channelList = Object.values(channels)
  const messages = activeChannelData?.messages ?? []
  const users = activeChannelData?.users ?? []

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users
    const query = userSearchQuery.toLowerCase()
    return users.filter((name) => name.toLowerCase().includes(query))
  }, [users, userSearchQuery])

  const knownUsers = useUsers()
  console.log(users)

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
              {users.length} in channel
            </span>
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {channelList.length === 0 ? (
            <span className="text-xs text-neutral-600 italic">No channels joined</span>
          ) : (
            channelList.map((channel) => (
              <button
                key={channel.name}
                onClick={() => setActiveChannel(channel.name)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 whitespace-nowrap
                  ${
                    activeChannel === channel.name
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

      {/* Main Content: Messages + User List */}
      <div className="flex-1 flex min-h-0">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-neutral-600 text-sm italic py-8">
                {activeChannel ? 'No messages yet' : 'Join a channel to start chatting'}
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={msg.isEmote ? 'italic' : ''}>
                  <div className="group">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className={`text-sm font-medium ${theme.text}`}>
                        {msg.isEmote ? '* ' : ''}
                        {msg.user}
                      </span>
                      <span className="text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(msg.time)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed break-words">
                      {msg.text}
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
                onFocus={(e) => (e.currentTarget.style.borderColor = `rgba(${theme.rgb}, 0.4)`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '')}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || !activeChannel}
                className={`px-4 py-2 ${theme.bg} ${theme.bgHover} disabled:bg-neutral-800 disabled:text-neutral-600 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* User List Sidebar */}
        <div className="w-48 border-l border-neutral-800/50 flex flex-col">
          {/* User List Header */}
          <div className="p-3 border-b border-neutral-800/50">
            <div className="relative">
              <svg
                className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none transition-colors"
                onFocus={(e) => (e.currentTarget.style.borderColor = `rgba(${theme.rgb}, 0.4)`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '')}
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            {!activeChannel ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-600 p-3">
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-[10px] text-center">Join a channel</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-600 p-3">
                <p className="text-[10px]">No users found</p>
              </div>
            ) : (
              <div className="p-2">
                <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                    Online
                  </span>
                  <span className="text-[10px] text-neutral-600">{filteredUsers.length}</span>
                </div>
                <div className="space-y-0.5">
                  {filteredUsers.filter((username) => knownUsers.has(username)).map((username) => (
                    <div
                      key={username}
                      className="flex items-center gap-2 px-2 py-1 rounded transition-colors cursor-pointer hover:bg-white/5"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-neutral-400">
                            {username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-neutral-950 bg-green-500" />
                      </div>
                      <span className="text-xs text-neutral-300 truncate">{username}</span>
                    </div>
                  ))}
                  <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                    Unknown
                  </span>
                  {filteredUsers.filter((username) => !knownUsers.has(username)).map((username) => (
                    <div
                      key={username}
                      className="flex items-center gap-2 px-2 py-1 rounded transition-colors cursor-pointer hover:bg-white/5"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-neutral-400">
                            {username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-neutral-950 bg-green-500" />
                      </div>
                      <span className="text-xs text-neutral-300 truncate">{username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
