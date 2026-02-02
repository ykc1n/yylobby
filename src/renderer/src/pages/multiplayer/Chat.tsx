import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useThemeStore, themeColors } from '../../themeStore'
import { useChannels, useActiveChannel, useActiveChannelData, useUsers} from '../../store/appStore'
import { useActions } from '../../hooks/useActions'
import rankImage from '../../assets/rankImagesLarge/0_0.png'

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  username: string
}

function PlayerContextMenu({
  state,
  onClose,
  onAddFriend,
  onIgnore,
}: {
  state: ContextMenuState
  onClose: () => void
  onAddFriend: (username: string) => void
  onIgnore: (username: string) => void
}): JSX.Element | null {
  const menuRef = useRef<HTMLDivElement>(null)
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (state.visible) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [state.visible, onClose])

  if (!state.visible) return null

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[160px] bg-black/90 backdrop-blur-xl border border-white/[0.15] rounded-lg shadow-2xl shadow-black/60 overflow-hidden"
      style={{ left: state.x, top: state.y }}
    >
      <div className="px-3 py-2 border-b border-white/[0.1] bg-white/[0.02]">
        <span className={`text-sm font-medium ${theme.text}`}>{state.username}</span>
      </div>
      <div className="py-1">
        <button
          onClick={() => {
            onAddFriend(state.username)
            onClose()
          }}
          className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/[0.1] hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Friend
        </button>
        <button
          onClick={() => {
            onIgnore(state.username)
            onClose()
          }}
          className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/[0.1] hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Ignore Player
        </button>
      </div>
    </div>,
    document.body
  )
}

export function ChatPanel(): JSX.Element {
  const [inputValue, setInputValue] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    username: ''
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const channels = useChannels()
  const activeChannel = useActiveChannel()
  const activeChannelData = useActiveChannelData()
  const { sendMessage, setActiveChannel, joinChannel } = useActions()

  const handlePlayerRightClick = useCallback((e: React.MouseEvent, username: string): void => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      username
    })
  }, [])

  const closeContextMenu = useCallback((): void => {
    setContextMenu(prev => ({ ...prev, visible: false }))
  }, [])

  const handleAddFriend = useCallback((username: string): void => {
    console.log('Add friend:', username)
    // TODO: Implement friend adding logic
  }, [])

  const handleIgnorePlayer = useCallback((username: string): void => {
    console.log('Ignore player:', username)
    // TODO: Implement ignore logic
  }, [])

  const channelList = Object.values(channels)
  const messages = activeChannelData?.messages ?? []
  const users = activeChannelData?.users ?? []



  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users
    const query = userSearchQuery.toLowerCase()
    return users.filter((name) => name.toLowerCase().includes(query))
  }, [users, userSearchQuery])

  const knownUsers = useUsers()
    
  const getUserIcon = (username: string): string => {
    const user = knownUsers.get(username)
    if (!user) return rankImage
    return `/src/assets/rankImagesLarge/${user.Icon}.png`

  }
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

  const handleAddChannel = (): void => {
    if (newChannelName.trim()) {
      joinChannel(newChannelName.trim())
      setNewChannelName('')
      setShowAddChannel(false)
    }
  }

  const handleAddChannelKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddChannel()
    } else if (e.key === 'Escape') {
      setShowAddChannel(false)
      setNewChannelName('')
    }
  }

  return (
    <>
      {/* Player Context Menu - rendered via portal to document.body */}
      <PlayerContextMenu
        state={contextMenu}
        onClose={closeContextMenu}
        onAddFriend={handleAddFriend}
        onIgnore={handleIgnorePlayer}
      />

      <div className="h-full flex flex-col bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl overflow-hidden shadow-xl shadow-black/30">
        {/* Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-normal text-white/80 tracking-[0.12em] uppercase">Chat</h2>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400/70 rounded-full" />
            <span className="text-xs text-neutral-500">
              {users.length}
            </span>
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="flex gap-1 overflow-x-auto items-center">
          {channelList.length === 0 ? (
            <span className="text-xs text-neutral-600">No channels</span>
          ) : (
            channelList.map((channel) => (
              <button
                key={channel.name}
                onClick={() => setActiveChannel(channel.name)}
                className={`px-3 py-1.5 text-xs font-normal tracking-wide rounded-md transition-all duration-200 whitespace-nowrap
                  ${
                    activeChannel === channel.name
                      ? `bg-white/20 ${theme.text}`
                      : 'text-neutral-500 hover:text-neutral-400 hover:bg-white/10'
                  }`}
              >
                #{channel.name}
              </button>
            ))
          )}

          {/* Add Channel Button/Input */}
          {showAddChannel ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={handleAddChannelKeyDown}
                placeholder="channel name"
                autoFocus
                className="w-24 px-2 py-1 text-xs bg-white/10 border border-white/20 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                onClick={handleAddChannel}
                disabled={!newChannelName.trim()}
                className={`p-1 rounded-md ${theme.bg} ${theme.bgHover} disabled:bg-white/10 disabled:text-neutral-600 text-white transition-all duration-200`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => { setShowAddChannel(false); setNewChannelName('') }}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddChannel(true)}
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white transition-all duration-200"
              title="Join channel"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Messages + User List */}
      <div className="flex-1 flex min-h-0">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {messages.length === 0 ? (
              <div className="text-center text-neutral-600 text-sm py-8">
                {activeChannel ? 'No messages yet' : 'Join a channel to chat'}
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={msg.isEmote ? 'italic' : ''}>
                  <div className="group">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span
                        className={`text-sm font-normal tracking-wide ${theme.text} cursor-pointer hover:underline`}
                        onContextMenu={(e) => handlePlayerRightClick(e, msg.user)}
                      >
                        {msg.isEmote ? '* ' : ''}
                        {msg.user}
                      </span>
                      <span className="text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(msg.time)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed break-words tracking-wide">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeChannel ? `Message #${activeChannel}...` : 'Join a channel'}
                disabled={!activeChannel}
                className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.12] transition-colors disabled:opacity-40 disabled:cursor-not-allowed tracking-wide"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || !activeChannel}
                className={`px-4 py-2 ${theme.bg} ${theme.bgHover} disabled:bg-white/[0.04] disabled:text-neutral-600 text-white text-sm font-normal rounded-lg transition-all duration-200 disabled:cursor-not-allowed`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* User List Sidebar */}
        <div className="w-44 flex flex-col">
          {/* User List Header */}
          <div className="p-3">
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
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.12] transition-colors"
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            {!activeChannel ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-600 p-3">
                <svg className="w-5 h-5 mb-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-[10px] text-center text-neutral-600">Join a channel</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-600 p-3">
                <p className="text-[10px]">No users</p>
              </div>
            ) : (
              <div className="p-2">
                <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400/70 rounded-full" />
                  <span className="text-xs font-normal text-neutral-500 tracking-[0.1em] uppercase">
                    Online
                  </span>
                  <span className="text-[10px] text-neutral-600">{filteredUsers.length}</span>
                </div>
                <div className="space-y-0.5">
                  {filteredUsers.filter((username) => knownUsers.has(username)).map((username) => (
                    <div
                      key={username}
                      className="flex items-center gap-2 px-2 py-1 rounded transition-colors cursor-pointer hover:bg-white/[0.04]"
                      onContextMenu={(e) => handlePlayerRightClick(e, username)}
                    >
                      <div className="relative flex-shrink-0">
                        <img src={getUserIcon(username)} alt="" className="w-5 h-5 rounded" />

                      </div>
                      <span className="text-md text-neutral-200 truncate">{username}</span>
                    </div>
                  ))}
                  <span className="text-[10px] font-medium text-neutral-600 tracking-wide px-2 py-1 block">
                    Unknown
                  </span>
                  {filteredUsers.filter((username) => !knownUsers.has(username)).map((username) => (
                    <div
                      key={username}
                      className="flex items-center gap-2 px-2 py-1 rounded transition-colors cursor-pointer hover:bg-white/[0.04]"
                      onContextMenu={(e) => handlePlayerRightClick(e, username)}
                    >
                      <span className="text-sm text-neutral-400 truncate">{username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
