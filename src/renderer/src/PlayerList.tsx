import { useState, useMemo, act } from 'react'
import { useThemeStore, themeColors } from './themeStore'
import { useActiveChannel, useActiveChannelData } from './store/appStore'

export function PlayerListPanel(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]
  const usersMap = useUsers()

  const activeChannel = useActiveChannel()
  const activeChannelData = useActiveChannelData()

  const users = activeChannelData?.users ?? []

  const { filteredActiveUsers, filteredInactiveUsers } = useMemo(() => {
    const activeSet = new Set(users.filter(user => usersMap.has(user)))
    const query = searchQuery.toLowerCase().trim()

    const matchesSearch = (name: string) => !query || name.toLowerCase().includes(query)

    return {
      filteredActiveUsers: users.filter(u => activeSet.has(u) && matchesSearch(u)),
      filteredInactiveUsers: users.filter(u => !activeSet.has(u) && matchesSearch(u))
    }
  }, [users, usersMap, searchQuery])

  return (
    <div className="h-full flex flex-col bg-neutral-950/70 border border-neutral-800/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white uppercase tracking-wider">
            {activeChannel ? `#${activeChannel}` : 'Players'}
          </h2>
          <span className="text-xs text-neutral-500">{users.length} users</span>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600"
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none transition-colors"
            onFocus={(e) => (e.currentTarget.style.borderColor = `rgba(${theme.rgb}, 0.4)`)}
            onBlur={(e) => (e.currentTarget.style.borderColor = '')}
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {!activeChannel ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600 p-4">
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-xs">Join a channel to see users</p>
          </div>
        ) : filteredActiveUsers.length === 0 && filteredInactiveUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600 p-4">
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-xs">No users found</p>
          </div>
        ) : (
          <div className="p-2">
            {/* Active Users Section */}
            {filteredActiveUsers.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Active
                  </span>
                  <span className="text-[10px] text-neutral-600">{filteredActiveUsers.length}</span>
                </div>
                <div className="space-y-0.5">
                  {filteredActiveUsers.map((username) => (
                    <UserItem key={username} username={username} theme={theme} isActive />
                  ))}
                </div>
              </>
            )}

            {/* Inactive Users Section */}
            {filteredInactiveUsers.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-2 py-1.5 mb-1 mt-3">
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full" />
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    In Channel
                  </span>
                  <span className="text-[10px] text-neutral-600">{filteredInactiveUsers.length}</span>
                </div>
                <div className="space-y-0.5">
                  {filteredInactiveUsers.map((username) => (
                    <UserItem key={username} username={username} theme={theme} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function UserItem({
  username,
  theme,
  isActive = false
}: {
  username: string
  theme: (typeof themeColors)[keyof typeof themeColors]
  isActive?: boolean
}): JSX.Element {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors cursor-pointer group hover:bg-white/5">
      {/* Avatar */}
      <div className="relative">
        <div className="w-7 h-7 rounded bg-neutral-800 flex items-center justify-center">
          <span className="text-xs font-medium text-neutral-400">
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
        {/* Online indicator */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-neutral-950 ${isActive ? 'bg-green-500' : 'bg-neutral-500'}`} />
      </div>

      {/* Username */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate text-neutral-300">{username}</div>
      </div>

      {/* Actions (show on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Message */}
        <button
          className="p-1 text-neutral-500 hover:text-white transition-colors"
          title="Message"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
