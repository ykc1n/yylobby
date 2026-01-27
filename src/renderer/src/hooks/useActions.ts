import { trpc } from '../../utils/trpc'

/**
 * Hook providing all actions that trigger main process state changes.
 */
export function useActions() {
  const connectMutation = trpc.connect.useMutation()
  const loginMutation = trpc.login.useMutation()
  const joinChannelMutation = trpc.joinChannel.useMutation()
  const sendMessageMutation = trpc.sendMessage.useMutation()
  const setActiveChannelMutation = trpc.setActiveChannel.useMutation()

  return {
    // Connection
    connect: () => connectMutation.mutate(),
    isConnecting: connectMutation.isPending,

    // Authentication
    login: (username: string, password: string) =>
      loginMutation.mutateAsync({ username, password }),
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    // Channels
    joinChannel: (channelName: string, password?: string) =>
      joinChannelMutation.mutate({ channelName, password }),
    isJoiningChannel: joinChannelMutation.isPending,

    // Chat
    sendMessage: (target: string, text: string) =>
      sendMessageMutation.mutate({ target, text }),
    isSendingMessage: sendMessageMutation.isPending,

    setActiveChannel: (channelName: string) =>
      setActiveChannelMutation.mutate({ channelName })
  }
}
